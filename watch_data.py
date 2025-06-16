import random
import csv
from datetime import datetime, timedelta
import pandas as pd

# Define emotion states and their characteristic ranges
emotion_profiles = {
    'Happy': {
        'heart_rate': (65, 75),
        'hrv': (90, 120),
        'eda': (0.09, 0.15),
        'steps': (9000, 15000),
        'stress_score': (10, 30),
        'readiness_score': (80, 100),
        'sleep_duration': (7.5, 9),
        'social_interactions': (100, 180),
        'activity_type': ['running', 'cycling', 'dancing'],
        'location_type': ['park', 'gym', 'beach']
    },
    'Sad': {
        'heart_rate': (60, 70),
        'hrv': (40, 70),
        'eda': (0.07, 0.11),
        'steps': (1000, 4000),
        'stress_score': (40, 60),
        'readiness_score': (30, 60),
        'sleep_duration': (5, 6.5),
        'social_interactions': (0, 30),
        'activity_type': ['none', 'sitting'],
        'location_type': ['home']
    },
    'Stressed': {
        'heart_rate': (85, 110),
        'hrv': (20, 50),
        'eda': (0.2, 0.4),
        'steps': (3000, 6000),
        'stress_score': (75, 100),
        'readiness_score': (30, 50),
        'sleep_duration': (4.5, 6),
        'social_interactions': (50, 100),
        'activity_type': ['walking', 'typing'],
        'location_type': ['office']
    },
    'Tired': {
        'heart_rate': (70, 85),
        'hrv': (50, 80),
        'eda': (0.12, 0.18),
        'steps': (2000, 5000),
        'stress_score': (50, 70),
        'readiness_score': (30, 60),
        'sleep_duration': (4, 6),
        'social_interactions': (10, 40),
        'activity_type': ['standing', 'none'],
        'location_type': ['home', 'office']
    },
    'Relaxed': {
        'heart_rate': (58, 68),
        'hrv': (85, 110),
        'eda': (0.08, 0.12),
        'steps': (4000, 7000),
        'stress_score': (10, 30),
        'readiness_score': (70, 100),
        'sleep_duration': (7.5, 9),
        'social_interactions': (50, 80),
        'activity_type': ['yoga', 'meditation', 'light walk'],
        'location_type': ['home', 'nature']
    }
}

def generate_sample(emotion):
    profile = emotion_profiles[emotion]
    timestamp = (datetime(2025, 6, 16, 6, 0) + timedelta(minutes=random.randint(0, 10000))).strftime("%Y-%m-%d %H:%M")

    return {
        'timestamp': timestamp,
        'heart_rate': round(random.uniform(*profile['heart_rate']), 1),
        'hrv': round(random.uniform(*profile['hrv']), 1),
        'skin_temp': round(random.uniform(35.5, 36.5), 1),
        'eda': round(random.uniform(*profile['eda']), 3),
        'spo2': random.randint(93, 100),
        'respiratory_rate': round(random.uniform(12.0, 22.0), 1),
        'steps': random.randint(*profile['steps']),
        'movement_intensity': round(random.uniform(0.03, 0.12), 2),
        'activity_type': random.choice(profile['activity_type']),
        'calories_burned': random.randint(1500, 3000),
        'distance': round(random.uniform(1.5, 15.0), 2),
        'sedentary_minutes': random.randint(180, 600),
        'sleep_duration': round(random.uniform(*profile['sleep_duration']), 2),
        'rem_sleep': round(random.uniform(0.5, 1.8), 2),
        'deep_sleep': round(random.uniform(1.0, 2.5), 2),
        'light_sleep': round(random.uniform(2.0, 3.5), 2),
        'sleep_score': random.randint(55, 100),
        'sleep_interruptions': random.randint(0, 4),
        'stress_score': random.randint(*profile['stress_score']),
        'readiness_score': random.randint(*profile['readiness_score']),
        'mindfulness_minutes': random.randint(0, 30),
        'ambient_light': random.randint(100, 800),
        'ambient_noise': random.randint(30, 100),
        'screen_time_minutes': random.randint(60, 300),
        'typing_speed_wpm': random.randint(20, 60),
        'social_interactions': random.randint(*profile['social_interactions']),
        'location_type': random.choice(profile['location_type']),
        'emotion': emotion
    }

# Generate 1000 samples
samples = []
emotions = list(emotion_profiles.keys())
for _ in range(1000):
    emotion = random.choice(emotions)
    samples.append(generate_sample(emotion))

# Save to CSV file
df = pd.DataFrame(samples)
csv_path = "D:/synthetic_emotion_dataset.csv"
df.to_csv(csv_path, index=False)

print(csv_path)
