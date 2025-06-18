import os
import pandas as pd
from ast import literal_eval

# === Paths ===
candidates_dir = "D:/glitch/Team_Glitch/intell/app/core/user_activity/candidates"
output_dir = "D:/glitch/Team_Glitch/intell/app/core/user_activity/candidates_with_embeddings"
movies_embedding_path = "D:/glitch/Team_Glitch/intell/app/core/user_activity/embeddings/movies_with_embeddings.csv"
users_embedding_path = "D:/glitch/Team_Glitch/intell/app/core/user_activity/embeddings/users_with_embeddings.csv"

# === Ensure output folder exists ===
os.makedirs(output_dir, exist_ok=True)

# === Load embeddings ===
movies_embeddings = pd.read_csv(movies_embedding_path)
users_embeddings = pd.read_csv(users_embedding_path)

# Convert string embeddings to list
movies_embeddings["embedding_vector"] = movies_embeddings["embedding_vector"].apply(literal_eval)
users_embeddings["embedding_vector"] = users_embeddings["embedding_vector"].apply(literal_eval)

# === Process each candidate file ===
# === Process each candidate file ===
for filename in os.listdir(candidates_dir):
    if filename.endswith(".csv"):
        user_id = filename.replace("_candidates.csv", "")  # FIXED here
        candidate_path = os.path.join(candidates_dir, filename)
        candidates = pd.read_csv(candidate_path)

        # Merge movie embeddings
        candidates = candidates.merge(movies_embeddings[["movie_id", "embedding_vector"]], on="movie_id", how="left")

        # Extract and save user embedding vector (optional step if needed later)
        user_row = users_embeddings[users_embeddings["user_id"] == user_id]
        if not user_row.empty:
            user_embedding = user_row.iloc[0]["embedding_vector"]

            # Save updated candidates with movie embeddings
            output_path = os.path.join(output_dir, filename)
            candidates.to_csv(output_path, index=False)
            print(f"✅ Saved embeddings-merged file for user {user_id}")
        else:
            print(f"⚠️ No embedding found for user {user_id}")
