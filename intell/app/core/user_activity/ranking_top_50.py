import os
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from ast import literal_eval
from tqdm import tqdm

# Paths
user_file = "D:/glitch/Team_Glitch/intell/app/ingestion/movie_dataset/users_large.csv"
user_emb_file = "D:/glitch/Team_Glitch/intell/app/core/user_activity/embeddings/users_with_embeddings.csv"
candidate_dir = "D:/glitch/Team_Glitch/intell/app/core/user_activity/candidates_with_embeddings"
output_dir = "D:/glitch/Team_Glitch/intell/app/core/user_activity/ranked"

os.makedirs(output_dir, exist_ok=True)

# Load user data and embeddings
users_df = pd.read_csv(user_file)
user_embeddings = pd.read_csv(user_emb_file)
user_embeddings["embedding_vector"] = user_embeddings["embedding_vector"].apply(literal_eval)

def compute_score(row, user_langs, user_genres, user_vector, user_completion_rate):
    score = 0.0
    if row["language"] in user_langs:
        score += 1
    if row["genre"] in user_genres:
        score += 1
    score += 0.5 * user_completion_rate
    movie_vec = np.array(row["embedding_vector"]).reshape(1, -1)
    user_vec = np.array(user_vector).reshape(1, -1)
    score += cosine_similarity(movie_vec, user_vec)[0][0]
    score += float(row.get("popularity_score", 0))
    if row.get("trending_now", 0) == 1:
        score += 1
    return score

# Process each candidate file
for file in tqdm(os.listdir(candidate_dir), desc="Ranking Candidates"):
    if not file.endswith("_candidates.csv"):
        continue

    user_id = file.replace("_candidates.csv", "")
    candidate_path = os.path.join(candidate_dir, file)

    try:
        candidates = pd.read_csv(candidate_path)
        candidates["embedding_vector"] = candidates["embedding_vector"].apply(literal_eval)
    except Exception as e:
        print(f"⚠️ Could not load embeddings for {user_id}: {e}")
        continue

    # Fetch user profile and embedding
    user_row = users_df[users_df["user_id"] == user_id]
    user_emb_row = user_embeddings[user_embeddings["user_id"] == user_id]

    if user_row.empty or user_emb_row.empty:
        print(f"⚠️ No embedding or profile found for user {user_id}")
        continue

    try:
        user_langs = literal_eval(user_row.iloc[0]["language"])
        user_genres = literal_eval(user_row.iloc[0]["top_genres"])
    except:
        user_langs = []
        user_genres = []

    user_completion_rate = float(user_row.iloc[0].get("completion_rate", 0))
    user_vector = user_emb_row.iloc[0]["embedding_vector"]

    # Rank
    candidates["ranking_score"] = candidates.apply(
        lambda row: compute_score(row, user_langs, user_genres, user_vector, user_completion_rate),
        axis=1
    )

    # Keep only movie_id, title, and ranking_score
    ranked_df = candidates[["movie_id", "title", "ranking_score"]].sort_values(by="ranking_score", ascending=False)

    # Save output
    output_path = os.path.join(output_dir, f"{user_id}_ranked.csv")
    ranked_df.to_csv(output_path, index=False)
    print(f"✅ Saved ranked movies for user {user_id}")

print("\n🎯 All user rankings completed.")
