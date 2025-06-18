import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta
import uuid

# Set seeds for reproducibility
np.random.seed(42)
random.seed(42)

# ---- USERS DATA ---- #
def generate_users(n=1000):
    user_ids = [f"U{str(i).zfill(4)}" for i in range(n)]
    ages = np.random.randint(18, 65, n)
    genders = np.random.choice(["M", "F", "Other"], n, p=[0.45, 0.45, 0.10])
    locations = np.random.choice(["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata"], n)
    languages = [["Hindi"], ["English"], ["Tamil"], ["Telugu"], ["Hindi", "English"], ["Kannada"], ["Malayalam"]]
    preferred_languages = [random.choice(languages) for _ in range(n)]
    registration_dates = [datetime.now() - timedelta(days=random.randint(30, 1000)) for _ in range(n)]
    total_watch_time = np.round(np.random.exponential(scale=3000, size=n), 2)
    avg_watch_per_day = np.round(total_watch_time / np.random.randint(30, 365, n), 2)

    users_df = pd.DataFrame({
        "user_id": user_ids,
        "age": ages,
        "gender": genders,
        "location": locations,
        "preferred_languages": preferred_languages,
        "registration_date": registration_dates,
        "total_watch_time": total_watch_time,
        "avg_watch_per_day": avg_watch_per_day,
        "embedding_vector": [[] for _ in range(n)]  # Placeholder
    })

    return users_df

# ---- MOVIES DATA ---- #
def generate_movies(n=1000):
    movie_ids = [f"M{str(i).zfill(4)}" for i in range(n)]
    titles = [f"Movie {i}" for i in range(n)]
    genres_pool = ["Drama", "Thriller", "Comedy", "Romance", "Action", "Sci-Fi", "Fantasy", "Documentary"]
    genres = [random.sample(genres_pool, k=random.randint(1, 3)) for _ in range(n)]
    languages = np.random.choice(["Hindi", "English", "Tamil", "Telugu", "Kannada", "Malayalam"], n)
    release_years = np.random.randint(1990, 2024, n)
    durations = np.round(np.random.normal(loc=120, scale=20, size=n), 2)
    popularity = np.round(np.random.uniform(0, 1000, n), 2)
    trending_now = np.random.choice([True, False], n, p=[0.1, 0.9])

    movies_df = pd.DataFrame({
        "movie_id": movie_ids,
        "title": titles,
        "genre": genres,
        "language": languages,
        "release_year": release_years,
        "duration_minutes": durations,
        "popularity_score": popularity,
        "embedding_vector": [[] for _ in range(n)],  # Placeholder
        "trending_now": trending_now
    })

    return movies_df

# ---- WATCH HISTORY DATA ---- #
def generate_watch_history(users_df, movies_df, avg_interactions_per_user=20):
    records = []
    for _, user in users_df.iterrows():
        num_interactions = np.random.poisson(lam=avg_interactions_per_user)
        sampled_movies = movies_df.sample(min(num_interactions, len(movies_df)))
        for _, movie in sampled_movies.iterrows():
            watch_timestamp = user["registration_date"] + timedelta(days=random.randint(0, 1000))
            watch_duration = round(random.uniform(5, movie["duration_minutes"]), 2)
            completed = watch_duration > (0.9 * movie["duration_minutes"])
            device_type = random.choice(["Mobile", "SmartTV", "Web", "Tablet"])
            watch_hour = random.randint(0, 23)
            watch_day_of_week = random.choice(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"])

            records.append({
                "user_id": user["user_id"],
                "movie_id": movie["movie_id"],
                "watch_timestamp": watch_timestamp,
                "watch_duration": watch_duration,
                "completed": completed,
                "device_type": device_type,
                "watch_hour": watch_hour,
                "watch_day_of_week": watch_day_of_week
            })

    watch_history_df = pd.DataFrame(records)
    return watch_history_df

# Generate the data
users_df = generate_users(1000)
movies_df = generate_movies(1000)
watch_history_df = generate_watch_history(users_df, movies_df, avg_interactions_per_user=20)

# Save the CSV files
users_df.to_csv("D:/glitch/Team_Glitch/intell/app/ingestion/movie_dataset/users_large.csv", index=False)
movies_df.to_csv("D:/glitch/Team_Glitch/intell/app/ingestion/movie_dataset/movies_large.csv", index=False)
watch_history_df.to_csv("D:/glitch/Team_Glitch/intell/app/ingestion/movie_dataset/watch_history_large.csv", index=False)

"D:/glitch/Team_Glitch/intell/app/ingestion/movie_dataset/users_large.csv", "D:/glitch/Team_Glitch/intell/app/ingestion/movie_dataset/movies_large.csv", "D:/glitch/Team_Glitch/intell/app/ingestion/movie_dataset/watch_history_large.csv"
