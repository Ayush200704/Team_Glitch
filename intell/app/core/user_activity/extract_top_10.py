import os
import pandas as pd
import json
from tqdm import tqdm

# Directory containing ranked CSVs
ranked_dir = "D:/glitch/Team_Glitch/intell/app/core/user_activity/ranked"

# Directory to save JSON outputs
output_json_dir = "D:/glitch/Team_Glitch/intell/app/outputs/user_activity_top_10"

os.makedirs(output_json_dir, exist_ok=True)

# Process each ranked CSV
for file in tqdm(os.listdir(ranked_dir), desc="Generating JSONs"):
    if not file.endswith("_ranked.csv"):
        continue

    # Extract user ID
    user_id = file.replace("_ranked.csv", "")
    csv_path = os.path.join(ranked_dir, file)
    json_path = os.path.join(output_json_dir, f"{user_id}.json")

    try:
        df = pd.read_csv(csv_path)

        # Extract top 10 movie_id and title
        top_10 = df[["movie_id", "title"]].head(10)

        # Convert to list of dicts
        movie_list = top_10.to_dict(orient="records")

        # Write to JSON file
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(movie_list, f, ensure_ascii=False, indent=2)

        print(f"✅ Saved {user_id}.json")

    except Exception as e:
        print(f"⚠️ Error processing {file}: {e}")

print("\n🎯 All user JSON files generated.")
