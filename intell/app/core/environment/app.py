from flask import Flask, jsonify
import pandas as pd
import joblib
from mock_iot_generator import generate_mock_iot_data

app = Flask(__name__)

# Load model and preprocessing
model = joblib.load('mood_model.pkl')
encoder = joblib.load('encoder.pkl')
scaler = joblib.load('scaler.pkl')

categorical_features = ['time_of_day', 'music_genre', 'movement']
num_features = ['brightness', 'light_color_temp', 'room_temp', 'sound_level']
label_map = {0: 'Neutral', 1: 'Stressed', 2: 'Energetic', 3: 'Relaxed', 4: 'Sad'}

# Dummy column reference (set from training)
feature_columns = model.feature_names_in_

@app.route('/predict-mood', methods=['GET'])
def predict_mood():
    iot_data = generate_mock_iot_data()
    input_df = pd.DataFrame([iot_data])

    # Fill None (missing genre) with 'nan' string so encoder handles it
    input_df['music_genre'] = input_df['music_genre'].fillna('nan')

    # Extract categorical values from input
    categorical_input = input_df[categorical_features]

    print("Categorical values received for encoding:")
    print(categorical_input.to_dict(orient="records"))

    # Encode categorical features
    cat_encoded = encoder.transform(input_df[categorical_features])
    cat_encoded_df = pd.DataFrame(cat_encoded, columns=encoder.get_feature_names_out(categorical_features))

    num_scaled = scaler.transform(input_df[num_features])
    num_scaled_df = pd.DataFrame(num_scaled, columns=num_features)

    combined_df = pd.concat([num_scaled_df, cat_encoded_df], axis=1)

    # Ensure same column order as training
    for col in feature_columns:
        if col not in combined_df.columns:
            combined_df[col] = 0
    combined_df = combined_df[feature_columns]

    pred = model.predict(combined_df)[0]
    mood = label_map[pred]

    return jsonify({
        "iot_input": iot_data,
        "predicted_mood": mood
    })

if __name__ == '__main__':
    app.run(debug=True)
