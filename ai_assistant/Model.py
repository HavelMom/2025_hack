#!/usr/bin/env python3
import argparse
import os

import numpy as np
import pandas as pd
import torch
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.model_selection import train_test_split
from datasets import Dataset
from evaluate import load  # Changed from load_metric
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    Trainer,
    TrainingArguments
)


# 1) Load & prepare data: binarize labels, split, wrap as HF Datasets
def load_and_prepare(csv_path):
    # --- load raw CSV ---
    df = pd.read_csv(csv_path).drop(columns=["Unnamed: 0"], errors="ignore")
    # ensure we have `text` & `label` columns
    assert "text" in df.columns and "label" in df.columns, "CSV must contain 'text' and 'label'"

    # --- binarize labels for multi-label classification ---
    df["labels"] = df["label"].apply(lambda x: [x])
    diseases = [
        "Psoriasis", "Varicose Veins", "Typhoid", "Chicken pox", "Impetigo",
        "Dengue", "Fungal infection", "Common Cold", "Pneumonia", "Dimorphic Hemorrhoids",
        "Arthritis", "Acne", "Bronchial Asthma", "Hypertension", "Migraine",
        "Cervical spondylosis", "Jaundice", "Malaria", "urinary tract infection",
        "allergy", "gastroesophageal reflux disease", "drug reaction",
        "peptic ulcer disease", "diabetes"
    ]
    mlb = MultiLabelBinarizer(classes=diseases)
    label_matrix = mlb.fit_transform(df["labels"])
    # Convert labels to float rather than int to match expected type
    df["label_vec"] = [row.astype(np.float32) for row in label_matrix]

    # --- train/test split ---
    train_df, eval_df = train_test_split(
        df, test_size=0.2, random_state=42, stratify=label_matrix
    )

    # --- convert to HuggingFace Datasets ---
    train_ds = Dataset.from_pandas(train_df[["text", "label_vec"]])
    eval_ds = Dataset.from_pandas(eval_df[["text", "label_vec"]])

    return train_ds, eval_ds, diseases


# 2) Tokenizer + preprocessing helper
def preprocess_batch(batch, tokenizer, max_length=128):
    enc = tokenizer(
        batch["text"],
        padding="max_length",
        truncation=True,
        max_length=max_length
    )
    # Ensure labels are properly formatted as float32
    enc["labels"] = [np.array(label, dtype=np.float32) for label in batch["label_vec"]]
    return enc


# 3) Metrics for Trainer (macro‑F1)
# Changed from load_metric to load from evaluate
metric_f1 = load("f1")


def compute_metrics(pred):
    logits = torch.tensor(pred.predictions)
    probs = torch.sigmoid(logits)
    y_pred = (probs >= 0.5).int().numpy()
    y_true = pred.label_ids.astype(np.int32)  # Ensure labels are int type for metrics
    f1 = metric_f1.compute(
        predictions=y_pred, references=y_true, average="macro"
    )["f1"]
    return {"f1_macro": f1}


# 4) Train once, save model+tokenizer+diseases.txt
def train(csv_path: str, output_dir: str):
    print(f"[TRAIN] Loading data from {csv_path}")
    train_ds, eval_ds, diseases = load_and_prepare(csv_path)

    print("[TRAIN] Initializing tokenizer & model")
    tokenizer = AutoTokenizer.from_pretrained(
        "microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract"
    )
    model = AutoModelForSequenceClassification.from_pretrained(
        "microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract",
        num_labels=len(diseases),
        problem_type="multi_label_classification"
    )

    # attach preprocessing
    train_ds = train_ds.map(
        lambda b: preprocess_batch(b, tokenizer),
        batched=True
    )
    eval_ds = eval_ds.map(
        lambda b: preprocess_batch(b, tokenizer),
        batched=True
    )

    # Check if MPS (Apple M1/M2) is available, otherwise use CUDA or CPU
    if torch.backends.mps.is_available():
        device = torch.device("mps")
    elif torch.cuda.is_available():
        device = torch.device("cuda")
    else:
        device = torch.device("cpu")

    print(f"[TRAIN] Using device: {device}")
    model.to(device)

    # Train with Trainer API
    args = TrainingArguments(
        output_dir=output_dir,
        do_eval=True,
        save_strategy="epoch",
        per_device_train_batch_size=16,  # Adjust to your GPU/CPU capacity
        per_device_eval_batch_size=16,
        num_train_epochs=4,
        learning_rate=2e-5,
        weight_decay=0.01,
        logging_steps=50
    )

    trainer = Trainer(
        model=model,
        args=args,
        train_dataset=train_ds,
        eval_dataset=eval_ds,
        tokenizer=tokenizer,
        compute_metrics=compute_metrics
    )

    print("[TRAIN] Starting training…")
    trainer.train()

    # Save artifacts
    os.makedirs(output_dir, exist_ok=True)
    print(f"[TRAIN] Saving model & tokenizer to {output_dir}")
    model.save_pretrained(output_dir)
    tokenizer.save_pretrained(output_dir)

    print(f"[TRAIN] Writing diseases list to {output_dir}/diseases.txt")
    with open(os.path.join(output_dir, "diseases.txt"), "w") as f:
        f.write("\n".join(diseases))

    print("[TRAIN] Done!")


# 5) Predict CLI: loads saved model and prints top‑k diseases
def predict(model_dir: str, prompt: str, k: int = 3):
    print(f"[PREDICT] Loading model from {model_dir}")
    tokenizer = AutoTokenizer.from_pretrained(model_dir)
    model = AutoModelForSequenceClassification.from_pretrained(model_dir)
    diseases = open(os.path.join(model_dir, "diseases.txt")).read().splitlines()

    # Check if MPS (Apple M1/M2) is available, otherwise use CUDA or CPU
    if torch.backends.mps.is_available():
        device = torch.device("mps")
    elif torch.cuda.is_available():
        device = torch.device("cuda")
    else:
        device = torch.device("cpu")

    print(f"[PREDICT] Using device: {device}")
    model.to(device).eval()

    enc = tokenizer(
        prompt,
        padding="max_length",
        truncation=True,
        max_length=128,
        return_tensors="pt"
    ).to(device)

    with torch.no_grad():
        logits = model(**enc).logits
        probs = torch.sigmoid(logits)[0].cpu().numpy()

    top_ix = np.argsort(probs)[-k:][::-1]
    for idx in top_ix:
        print(f"{diseases[idx]} ({probs[idx] * 100:.1f}%)")


# 6) CLI entrypoint
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Symptom→Disease Trainer & Predictor")
    sub = parser.add_subparsers(dest="cmd", required=True)

    t = sub.add_parser("train", help="Train the PubMedBERT classifier")
    t.add_argument("--data", required=True, help="Path to Symptom2Disease.csv")
    t.add_argument("--out", default="saved_model", help="Where to save model")

    p = sub.add_parser("predict", help="Predict diseases for a prompt")
    p.add_argument("--model-dir", default="saved_model", help="Where your model lives")
    p.add_argument("--prompt", required=True, help="User symptom description")
    p.add_argument("--k", type=int, default=3, help="How many top diseases to show")

    args = parser.parse_args()
    if args.cmd == "train":
        train(args.data, args.out)
    elif args.cmd == "predict":
        predict(args.model_dir, args.prompt, args.k)