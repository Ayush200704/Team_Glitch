import pandas as pd
import numpy as np
import ast
from collections import Counter

# === ✅ Paths (update to your own if needed) ===
USERS_CSV = "D:/glitch/Team_Glitch/intell/app/ingestion/movie_dataset/users_large.csv"
WATCH_HISTORY_CSV = "D:/glitch/Team_Glitch/intell/app/ingestion/movie_dataset/watch_history_large.csv"
OUTPUT_ENRICHED_CSV = "D:/glitch/Team_Glitch/intell/app/core/user_activity/enriched/users_with_behavior.csv"

# === ✅ Load input CSVs ===
users_df = pd.read_csv(USERS_CSV)
watch_df = pd.read_csv(WATCH_HISTORY_CSV)

movies_df = pd.read_csv("D:/glitch/Team_Glitch/intell/app/ingestion/movie_dataset/movies_large.csv")
watch_df = watch_df.merge(
    movies_df[["movie_id", "duration_minutes"]],
    on="movie_id",
    how="left"
)


# Ensure proper data types
users_df["embedding_vector"] = users_df["embedding_vector"].apply(ast.literal_eval)
watch_df["watch_hour"] = pd.to_numeric(watch_df["watch_hour"], errors="coerce")
watch_df["watch_duration"] = pd.to_numeric(watch_df["watch_duration"], errors="coerce")
watch_df["completed"] = watch_df["completed"].astype(bool)

# === ✅ Feature Engineering from Watch History ===
user_features = []

for user_id, group in watch_df.groupby("user_id"):
    total_sessions = len(group)
    total_watch_minutes = group["watch_duration"].sum()
    avg_watch_duration = group["watch_duration"].mean()

    # Only count completed where watch > 70% assumed
    completion_rate = group["completed"].mean()

    avg_watch_hour = group["watch_hour"].mean()
    most_common_day = group["watch_day_of_week"].mode()[0] if not group["watch_day_of_week"].mode().empty else None
    most_used_device = group["device_type"].mode()[0] if not group["device_type"].mode().empty else None

    user_features.append({
        "user_id": user_id,
        "total_sessions": total_sessions,
        "total_watch_minutes": total_watch_minutes,
        "avg_watch_duration": avg_watch_duration,
        "completion_rate": completion_rate,
        "avg_watch_hour": avg_watch_hour,
        "most_common_day": most_common_day,
        "most_used_device": most_used_device
    })

user_features_df = pd.DataFrame(user_features)

# === ✅ Join with Cleaned Users Table ===
# Keep only selected columns from users.csv
selected_columns = ['user_id', 'age', 'gender', 'location', 'preferred_languages', 'embedding_vector']
clean_users_df = users_df[selected_columns]

enriched_users_df = pd.merge(clean_users_df, user_features_df, on="user_id", how="left")

# === ✅ Save Final Enriched CSV ===
enriched_users_df.to_csv(OUTPUT_ENRICHED_CSV, index=False)
print(f"✅ Enriched users saved to: {OUTPUT_ENRICHED_CSV}")
