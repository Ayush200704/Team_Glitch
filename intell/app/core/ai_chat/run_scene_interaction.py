import sys
import os
import json
from typing import List, Dict
import re
from scene_interaction import process_subtitles  # Import the logic module

def parse_srt(srt_path: str) -> List[Dict]:
    """Parse an SRT file into a list of subtitle dicts with start, end (in seconds), and text."""
    def srt_time_to_seconds(t: str) -> float:
        h, m, s_ms = t.split(":")
        s, ms = s_ms.split(",")
        return int(h) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000

    subtitles = []
    with open(srt_path, encoding='utf-8') as f:
        content = f.read()
    blocks = re.split(r'\n\s*\n', content)
    for block in blocks:
        lines = block.strip().splitlines()
        if len(lines) >= 3:
            times = lines[1].split(' --> ')
            start = srt_time_to_seconds(times[0].strip())
            end = srt_time_to_seconds(times[1].strip())
            text = ' '.join(lines[2:]).replace('\n', ' ')
            subtitles.append({'start': start, 'end': end, 'text': text})
    return subtitles

def parse_scenes(scene_path: str) -> List[Dict]:
    """Parse a scene boundary file in JSON format into list of scene dicts with start/end in seconds."""
    def to_sec(t):
        if isinstance(t, (int, float)):
            return t
        h, m, s_ms = t.split(":")
        s, ms = s_ms.split(",")
        return int(h) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000

    with open(scene_path, encoding='utf-8') as f:
        scenes = json.load(f)
    for scene in scenes:
        scene['start'] = to_sec(scene['start'])
        scene['end'] = to_sec(scene['end'])
    return scenes

def main():
    input_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../ingestion/scene_detector'))
    scene_json_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../outputs/scene_boundary'))
    output_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../outputs/scene_contexts'))
    os.makedirs(output_root, exist_ok=True)

    processed = []
    skipped = []
    for dirpath, _, filenames in os.walk(input_root):
        for f in filenames:
            base, ext = os.path.splitext(f)
            if ext.lower() == '.srt':
                srt_path = os.path.join(dirpath, f)
                scene_path = os.path.join(scene_json_dir, base + '.json')
                if not os.path.exists(scene_path):
                    skipped.append((srt_path, 'No matching scene JSON'))
                    continue
                try:
                    subtitles = parse_srt(srt_path)
                    scenes = parse_scenes(scene_path)
                    print("First subtitle start:", subtitles[0]['start'])
                    print("Last subtitle end:", subtitles[-1]['end'])
                    print("First scene start:", scenes[0]['start'])
                    print("Last scene end:", scenes[-1]['end'])

                    result = process_subtitles(subtitles, scenes)
                    movie_dir = os.path.join(output_root, base)
                    os.makedirs(movie_dir, exist_ok=True)
                    for idx, chunk in enumerate(result, 1):
                        chunk_filename = f"chunk_{idx:03}.json"
                        chunk_path = os.path.join(movie_dir, chunk_filename)
                        with open(chunk_path, 'w', encoding='utf-8') as f:
                            json.dump(chunk, f, indent=2, ensure_ascii=False)
                    print(f'Processed {f} into {len(result)} chunks.')
                    processed.append(f)
                except Exception as e:
                    skipped.append((srt_path, str(e)))

    print('\nSummary:')
    print(f'Processed {len(processed)} files.')
    if skipped:
        print(f'Skipped {len(skipped)} files:')
        for s in skipped:
            print('-', s)

if __name__ == '__main__':
    main()
