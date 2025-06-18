# Purpose: Generate semantic embeddings for each movie using BERT based on its title, genre, and language.


import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
import ast

# Load your movies.csv file (ensure it's in the same directory or update the path)
movies_df = pd.read_csv("D:/glitch/Team_Glitch/intell/app/ingestion/movie_dataset/movies_large.csv")

# Convert 'genre' column to list if stored as a string
movies_df["genre"] = movies_df["genre"].apply(ast.literal_eval)

# Create a combined text description for each movie
def create_description(row):
    genre_text = ", ".join(row["genre"])
    return f"{row['title']} | Genres: {genre_text} | Language: {row['language']}"

movies_df["description"] = movies_df.apply(create_description, axis=1)

# Load the sentence transformer model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Generate embeddings from descriptions
embeddings = model.encode(movies_df["description"].tolist(), show_progress_bar=True)

# Store embeddings as list of floats
movies_df["embedding_vector"] = embeddings.tolist()

# Drop description column (optional) and save to a new file
movies_df.drop(columns=["description"], inplace=True)
movies_df.to_csv("D:/glitch/Team_Glitch/intell/app/core/user_activity/embeddings/movies_with_embeddings.csv", index=False)

print("✅ Movie embeddings generated and saved to 'movies_with_embeddings.csv'")
