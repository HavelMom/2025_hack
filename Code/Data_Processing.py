import numpy as np
import pandas as pd
import csv
import matplotlib.pyplot as plt

pd.set_option('display.max_columns', None)


def load_data(file_path):
    # Use a literal tab as the delimiter and disable quoting
    return pd.read_csv(file_path, sep='\t', engine='python', header=None, quoting=csv.QUOTE_NONE)




if __name__ == '__main__':
    d_s_1 = '/Users/odagled/Desktop/UCD/SPRING25/DATASCIENCE/Car_App/Data/FLAT_CMPL.txt'
    d_s_2 = '/Users/odagled/Desktop/UCD/SPRING25/DATASCIENCE/Car_App/Data/FLAT_CMPL.txt'
    d_s_p = '/Users/odagled/Desktop/UCD/SPRING25/DATASCIENCE/Car_App/Data/FLAT_CMPL.txt'
    d_ds = '/Users/odagled/Desktop/UCD/SPRING25/DATASCIENCE/Car_App/Data/FLAT_CMPL.txt'
