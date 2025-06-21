import pandas as pd
import numpy as np
import joblib
import logging
from pathlib import Path
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def load_data(csv_file: str) -> pd.DataFrame:
    logging.info("Loading data from CSV...")
    df = pd.read_csv(csv_file)
    return df

def preprocess_data(df: pd.DataFrame):
    logging.info("Preprocessing data...")

    # Attempt to convert datetime columns to numerical (Unix timestamp)
    for col in df.columns:
        if df[col].dtype == 'object' and col != "emotion":  # Exclude the target label, now 'emotion'
            try:
                # Attempt to convert to datetime
                df[col] = pd.to_datetime(df[col])
                # If successful, convert to Unix timestamp
                df[col] = df[col].apply(lambda x: x.timestamp())
                logging.info(f"Converted column '{col}' to Unix timestamp.")
            except ValueError:
                # If conversion fails, it's not a datetime string, assume it's a categorical string
                logging.info(f"Column '{col}' is not a datetime string. Applying one-hot encoding.")
                df = pd.get_dummies(df, columns=[col], prefix=col, drop_first=True) # Apply one-hot encoding

    # Drop rows with missing values if any
    df.dropna(inplace=True)

    # Separate features and labels
    X = df.drop(columns=["emotion"])  # assuming 'emotion' is the target label
    y = df["emotion"]

    return train_test_split(X, y, test_size=0.2, random_state=42)

def build_pipeline() -> Pipeline:
    logging.info("Building model pipeline...")
    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", RandomForestClassifier(n_estimators=100, random_state=42))
    ])
    return pipeline

def train_and_evaluate(X_train, X_test, y_train, y_test, pipeline: Pipeline):
    logging.info("Training the model...")
    pipeline.fit(X_train, y_train)
    
    logging.info("Evaluating model...")
    predictions = pipeline.predict(X_test)
    report = classification_report(y_test, predictions)
    print(report)

    return pipeline

def save_model(model: Pipeline, X_train_cols: pd.Index, output_path: str = "C:/Personal/HackOn Amazon/intell/app/outputs/smart_watch.pkl"):
    joblib.dump({'model': model, 'columns': X_train_cols}, output_path)
    logging.info(f"Model and feature columns saved to {output_path}")

if __name__ == "__main__":
    DATA_PATH = "C:/Personal/HackOn Amazon/intell/app/ingestion/synthetic_emotion_dataset.csv"  # Updated path
    df = load_data(DATA_PATH)
    X_train, X_test, y_train, y_test = preprocess_data(df)
    model_pipeline = build_pipeline()
    trained_model = train_and_evaluate(X_train, X_test, y_train, y_test, model_pipeline)
    save_model(trained_model, X_train.columns) # Pass X_train.columns to save_model
