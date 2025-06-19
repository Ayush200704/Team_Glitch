import random
import datetime

def generate_sample_row():
    return {
        'timestamp': datetime.datetime.now().strftime('%Y-%m-%d %H:%M'),
        'heart_rate': random.randint(60, 120),
        'hrv': round(random.uniform(20, 60), 1),
        'skin_temp': round(random.uniform(35.5, 37.5), 1),
        'eda': round(random.uniform(0.1, 0.5), 3),
        'spo2': random.randint(90, 100),
        'respiratory_rate': round(random.uniform(12, 25), 1),
        'steps': random.randint(0, 10000),
        'movement_intensity': round(random.uniform(0, 1), 2),
        'activity_type': random.choice(['walking', 'running', 'sitting', 'cycling']),
        'calories_burned': random.randint(1500, 3000),
        'distance': round(random.uniform(0, 10), 1),
        'sedentary_minutes': random.randint(0, 600),
        'sleep_duration': round(random.uniform(4, 9), 1),
        'rem_sleep': round(random.uniform(0.5, 2), 1),
        'deep_sleep': round(random.uniform(0.5, 2), 1),
        'light_sleep': round(random.uniform(1, 5), 1),
        'sleep_score': random.randint(40, 100),
        'sleep_interruptions': random.randint(0, 5),
        'stress_score': random.randint(0, 100),
        'readiness_score': random.randint(0, 100),
        'mindfulness_minutes': random.randint(0, 60),
        'ambient_light': random.randint(0, 1000),
        'ambient_noise': random.randint(30, 120),
        'screen_time_minutes': random.randint(0, 600),
        'typing_speed_wpm': random.randint(20, 100),
        'social_interactions': random.randint(0, 100),
        'location_type': random.choice(['office', 'home', 'outdoors', 'gym'])
    }

if __name__ == "__main__":
    print(generate_sample_row())