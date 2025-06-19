import random

def generate_mock_iot_data():
    return {
        "time_of_day": random.choice(["Morning", "Afternoon", "Evening", "Night"]),
        "brightness": random.randint(0, 100),
        "light_color_temp": random.randint(1800, 6500),
        "room_temp": round(random.uniform(16.0, 28.0), 1),
        "sound_level": random.randint(10, 100),
        "music_genre": random.choice(["Classical", "Pop", "Jazz", "Rock"]),
        "movement": random.choice(["Low", "Medium", "High"])
    }
