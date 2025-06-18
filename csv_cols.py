import pandas as pd

# Change this to your actual path
users_path = "D:/glitch/Team_Glitch/intell/app/ingestion/movie_dataset/users_large.csv"

# Load and show columns
users_df = pd.read_csv(users_path)
print("Columns in users.csv:")
print(users_df.columns.tolist())
