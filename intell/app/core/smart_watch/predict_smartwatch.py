import pandas as pd
import joblib
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def predict_single_sample_mood(sample_data: dict, model_path: str = "C:/Personal/HackOn Amazon/intell/app/outputs/smart_watch.pkl"):    
    logging.info("Loading model for single sample prediction...")
    try:
        loaded_assets = joblib.load(model_path)
        model = loaded_assets['model']
        trained_columns = loaded_assets['columns']
    except FileNotFoundError:
        logging.error(f"Model file not found at {model_path}. Please ensure the training script has been run and the model is saved.")
        return "Error: Model not found."
    except KeyError:
        logging.error("Model file does not contain 'model' or 'columns' keys. Ensure the save_model function is correctly saving both.")
        return "Error: Invalid model file."

    logging.info("Preprocessing single sample...")
    sample_df = pd.DataFrame([sample_data])

    # Convert datetime column to numerical (Unix timestamp)
    if 'timestamp' in sample_df.columns and sample_df['timestamp'].dtype == 'object':
        try:
            sample_df['timestamp'] = pd.to_datetime(sample_df['timestamp'])
            sample_df['timestamp'] = sample_df['timestamp'].apply(lambda x: x.timestamp())
            logging.info("Converted 'timestamp' in sample to Unix timestamp.")
        except ValueError:
            logging.warning("Could not convert 'timestamp' in sample to datetime.")

    # Apply one-hot encoding for categorical columns in the sample
    categorical_cols = [col for col in ["activity_type", "location_type"] if col in sample_df.columns]
    if categorical_cols:
        sample_df = pd.get_dummies(sample_df, columns=categorical_cols, prefix=categorical_cols, drop_first=True)
        logging.info(f"Applied one-hot encoding to {categorical_cols} in sample.")

    # Align sample columns with trained model columns
    sample_X = sample_df.reindex(columns=trained_columns, fill_value=0)
    
    # Ensure data types match (important for consistent prediction)
    # This part can be tricky if the original dtypes are not preserved or if new categories appear.
    # For simplicity, we'll try to cast to float where applicable, assuming numerical features.
    for col in trained_columns:
        if col in sample_X.columns and sample_X[col].dtype != trained_columns.dtype:
            try:
                sample_X[col] = sample_X[col].astype(float)
            except:
                # Fallback for columns that genuinely aren't convertible to float (e.g., if a new unexpected string got in)
                logging.warning(f"Could not cast column '{col}' to float for prediction.")
                pass # Leave as is, or consider more robust error handling

    logging.info("Making prediction...")
    prediction = model.predict(sample_X)
    return prediction[0]
from intell.app.core.smart_watch.watch_value_generator import generate_sample_row

if __name__ == "__main__":
    logging.info("\n--- Running single sample prediction script ---")
    sample_row = generate_sample_row()
    predicted_mood = predict_single_sample_mood(sample_row)
    logging.info(f"Predicted mood for the sample: {predicted_mood}")