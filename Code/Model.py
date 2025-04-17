

# Installing the required libraries
import csv
import matplotlib.pyplot as plt

from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    Trainer,
    TrainingArguments
)
from datasets import Dataset, load_metric
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.model_selection import train_test_split
import torch
import pandas as pd
import numpy as np
import tensorflow as tf

# Set display options for pandas
pd.set_option('display.max_columns', None)

# Load the tokenizer, from PubMedBERT
tokenizer = AutoTokenizer.from_pretrained(
    "microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract"
)


# Load the dataset
def load_dataset(file_path):
    data = pd.read_csv(file_path) # use read_csv simple dataset
    data = data.drop(columns=['Unnamed: 0']) # drop the first column, empty
    return data


# Binarize the labels for multi-label classification
def binarize_labels(data):
    data['labels'] = data['label'].apply(lambda x: [x]) # convert each entry in labels column to a list

    diseases = ["Psoriasis", "Varicose Veins", "Typhoid", "Chicken pox", "Impetigo",
    "Dengue", "Fungal infection", "Common Cold", "Pneumonia", "Dimorphic Hemorrhoids",
    "Arthritis", "Acne", "Bronchial Asthma", "Hypertension", "Migraine",
    "Cervical spondylosis", "Jaundice", "Malaria", "urinary tract infection",
    "allergy", "gastroesophageal reflux disease", "drug reaction",
    "peptic ulcer disease", "diabetes"]

    mlb = MultiLabelBinarizer(classes=diseases) # create a binarizer object
    labels = mlb.fit_transform(data['labels']) # fit and transform the labels
    data["label_vec"] = labels.tolist() # add the label vector to the dataframe

    return labels, mlb, diseases


# Split the data into training and testing sets, stratified by labels
def split_data(data, label_matrix):
    train_data, test_data = train_test_split(data, test_size=0.2, random_state=42, stratify=label_matrix)
    return train_data, test_data


# Preprocess the data for the model
def preprocess(batch):
    # Tokenize the text
    encoder = tokenizer(batch["text"], padding="max_length", truncation=True, max_length=128)
    encoder["labels"] = np.array(batch["label_vec"], dtype=np.float32)  # Convert labels to numpy array
    return encoder


# Model evaluation metrics
def compute_metrics(pred):
    logits = torch.tensor(pred.predictions)
    probs  = torch.sigmoid(logits).numpy()
    y_pred = (probs >= 0.5).astype(int)
    y_true = pred.label_ids
    f1     = metric.compute(
        predictions=y_pred,
        references=y_true,
        average="macro"
    )["f1"]
    return {"f1_macro": f1}


# predict the top k diseases for a given user input
def predict_top_k(diseases, text: str, k: int = 3):
    enc = tokenizer(
        text, padding="max_length", truncation=True,
        max_length=128, return_tensors="pt"
    ).to(device)  # Move input tensors to the MPS device
    outputs = model(**enc)
    probs = torch.sigmoid(outputs.logits)[0].detach().cpu().numpy()  # Move back to CPU for processing
    top_ix = np.argsort(probs)[-k:][::-1]
    return [(diseases[i], float(probs[i])) for i in top_ix]


if __name__ == '__main__':
    dataset = '/Users/odagled/Desktop/UCD/2025_hack/Data/Symptom2Disease.csv'
    data = load_dataset(dataset)
    print(data.head())

    label_matrix, mlb, diseases = binarize_labels(data)

    X, y = split_data(data, label_matrix)

    # Convert the data to Hugging Face datasets
    train_X = Dataset.from_pandas(X[['text', 'label_vec']])
    validate_y = Dataset.from_pandas(y[['text', 'label_vec']])

    # Preprocess the data
    train_X_encoded = train_X.map(preprocess, batched=True)
    validate_y_encoded = validate_y.map(preprocess, batched=True)

    device = torch.device("mps") if torch.backends.mps.is_available() else torch.device("cpu")

    # Load the model
    model = AutoModelForSequenceClassification.from_pretrained(
        "microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract",
        num_labels=len(diseases),
        problem_type="multi_label_classification").to(device)

    # Train with Trainer API
    args = TrainingArguments(
        output_dir="pubmedbert_symptoms",
        do_eval=True,
        save_strategy="epoch",
        per_device_train_batch_size=16,  # Adjust to your GPU
        per_device_eval_batch_size=16,
        num_train_epochs=4,
        learning_rate=2e-5,
        weight_decay=0.01,
        logging_steps=50
    )

    trainer = Trainer(
        model=model,
        args=args,
        train_dataset=train_X_encoded,
        eval_dataset=validate_y_encoded,
        tokenizer=tokenizer,
        compute_metrics=compute_metrics
    )

    trainer.train()

    # Example user input + prediction
    user_input = "I have red itchy skin and it hurts a lot"
    print(predict_top_k(diseases, user_input, k=3)) # predict top 3 diseases



