# Purpose: Calculate each user’s viewing preferences as an embedding vector — based on what they’ve watched and how long.
# For each user:

# Looks up every movie they’ve watched.
# Retrieves the corresponding movie embedding.
# Weighs each movie’s embedding by the watch duration (longer watched = more influence).
# Averages these vectors to form the user’s preference embedding.
import pandas as pd
import numpy as np
import ast

# === Step 1: Load Input Files ===

# Movie metadata + embedding vectors
movies_df = pd.read_csv("D:/glitch/Team_Glitch/intell/app/core/user_activity/embeddings/movies_with_embeddings.csv")
movies_df["embedding_vector"] = movies_df["embedding_vector"].apply(ast.literal_eval)

# Watch history
watch_history_df = pd.read_csv("D:/glitch/Team_Glitch/intell/app/ingestion/movie_dataset/watch_history_large.csv")

# User profiles (to be merged later)
users_df = pd.read_csv("D:/glitch/Team_Glitch/intell/app/ingestion/movie_dataset/users_large.csv")

# === Step 2: Build Fast Movie Lookup ===
movie_embedding_map = dict(zip(movies_df["movie_id"], movies_df["embedding_vector"]))

# === Step 3: Compute User Embeddings from Watch History ===
user_vectors = []

for user_id, user_data in watch_history_df.groupby("user_id"):
    embeddings = []
    weights = []

    for _, row in user_data.iterrows():
        movie_id = row["movie_id"]
        duration = row["watch_duration"]

        if movie_id in movie_embedding_map:
            embeddings.append(np.array(movie_embedding_map[movie_id]))
            weights.append(duration)

    if embeddings:
        embeddings = np.array(embeddings)
        weights = np.array(weights)
        user_vector = np.average(embeddings, axis=0, weights=weights)
    else:
        user_vector = np.zeros_like(next(iter(movie_embedding_map.values())))

    user_vectors.append({
        "user_id": user_id,
        "embedding_vector": user_vector.tolist()
    })

# Convert to DataFrame
user_embeddings_df = pd.DataFrame(user_vectors)

# === Step 4: Merge with User Metadata ===
# Note: Drop existing 'embedding_vector' in users.csv if it exists
if 'embedding_vector' in users_df.columns:
    users_df = users_df.drop(columns=['embedding_vector'])

# Merge on user_id
merged_df = users_df.merge(user_embeddings_df, on="user_id", how="left")

# === Step 5: Save Final Output ===
merged_df.to_csv("D:/glitch/Team_Glitch/intell/app/core/user_activity/embeddings/users_with_embeddings.csv", index=False)
print("✅ Full user profile with embeddings saved.")
