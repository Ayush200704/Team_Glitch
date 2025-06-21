from fastapi import APIRouter, HTTPException
import pandas as pd
import joblib
import os
from intell.app.core.environment.mock_iot_generator import generate_mock_iot_data

environment_router = APIRouter()

# Define paths based on project structure
MODEL_DIR = "intell/app/core/environment"
MODEL_PATH = os.path.join(MODEL_DIR, "mood_model.pkl")
ENCODER_PATH = os.path.join(MODEL_DIR, "encoder.pkl")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.pkl")

# Load model and preprocessing
try:
    model = joblib.load(MODEL_PATH)
    encoder = joblib.load(ENCODER_PATH)
    scaler = joblib.load(SCALER_PATH)
except FileNotFoundError as e:
    raise RuntimeError(f"Could not load model files: {e}. Make sure the paths are correct.")

categorical_features = ['time_of_day', 'music_genre', 'movement']
num_features = ['brightness', 'light_color_temp', 'room_temp', 'sound_level']
label_map = {0: 'Neutral', 1: 'Stressed', 2: 'Energetic', 3: 'Relaxed', 4: 'Sad'}

# Dummy column reference (set from training)
feature_columns = model.feature_names_in_

@environment_router.get('/predict-mood', summary="Predict mood based on mock IoT data")
async def predict_mood():
    try:
        iot_data = generate_mock_iot_data()
        input_df = pd.DataFrame([iot_data])

        # Fill None (missing genre) with 'nan' string so encoder handles it
        input_df['music_genre'] = input_df['music_genre'].fillna('nan')

        # Encode categorical features
        cat_encoded = encoder.transform(input_df[categorical_features])
        cat_encoded_df = pd.DataFrame(cat_encoded, columns=encoder.get_feature_names_out(categorical_features))

        # Scale numerical features
        num_scaled = scaler.transform(input_df[num_features])
        num_scaled_df = pd.DataFrame(num_scaled, columns=num_features)

        combined_df = pd.concat([num_scaled_df, cat_encoded_df], axis=1)

        # Ensure same column order as training
        for col in feature_columns:
            if col not in combined_df.columns:
                combined_df[col] = 0
        combined_df = combined_df[feature_columns]

        pred = model.predict(combined_df)[0]
        mood = label_map[int(pred)]

        return {
            "iot_input": iot_data,
            "predicted_mood": mood
        }
    except Exception as e:
        # It's good practice to log the exception here
        print(f"An error occurred during prediction: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
