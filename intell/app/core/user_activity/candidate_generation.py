import pandas as pd
import os
import ast

# === File paths ===
users_csv = "D:/glitch/Team_Glitch/intell/app/ingestion/movie_dataset/users_large.csv"
watch_history_csv = "D:/glitch/Team_Glitch/intell/app/ingestion/movie_dataset/watch_history_large.csv"
movies_csv = "D:/glitch/Team_Glitch/intell/app/ingestion/movie_dataset/movies_large.csv"
output_dir = "D:/glitch/Team_Glitch/intell/app/core/user_activity/candidates"

os.makedirs(output_dir, exist_ok=True)

# === Load data ===
users_df = pd.read_csv(users_csv)
watch_history_df = pd.read_csv(watch_history_csv)
movies_df = pd.read_csv(movies_csv)

# === Clean movie data ===
if "embedding_vector" in movies_df.columns:
    movies_df = movies_df.drop(columns=["embedding_vector"])

# Normalize movie language
movies_df["language_cleaned"] = movies_df["language"].astype(str).str.lower().str.strip()

# === Process for each user ===
for idx, user in users_df.iterrows():
    user_id = user["user_id"]
    
    # === Parse preferred languages safely ===
    raw_langs = user.get("preferred_languages", "")
    try:
        preferred_langs = ast.literal_eval(raw_langs) if pd.notna(raw_langs) else []
    except Exception:
        preferred_langs = []
    
    # Normalize user languages
    preferred_langs = [lang.lower().strip() for lang in preferred_langs if isinstance(lang, str)]

    # === Get watched movies
    watched_movies = watch_history_df[watch_history_df["user_id"] == user_id]["movie_id"].unique()

    # === Filter unwatched movies
    candidate_movies = movies_df[~movies_df["movie_id"].isin(watched_movies)]

    # === Filter by preferred language
    lang_filtered = candidate_movies[candidate_movies["language_cleaned"].isin(preferred_langs)]

    if not lang_filtered.empty:
        candidate_movies = lang_filtered
    else:
        print(f"⚠️ No language-matching candidates for user {user_id}, using all unwatched")

    # === Sort by popularity and pick top 50
    top_candidates = candidate_movies.sort_values(by="popularity_score", ascending=False).head(50)

    # === Save to CSV
    out_path = os.path.join(output_dir, f"{user_id}_candidates.csv")
    top_candidates.drop(columns=["language_cleaned"], errors="ignore").to_csv(out_path, index=False)

    print(f"✅ Saved top 50 candidate movies for user {user_id}")
