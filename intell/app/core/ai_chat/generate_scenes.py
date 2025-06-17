import os
import json
from scenedetect import VideoManager, SceneManager
from scenedetect.detectors import ContentDetector

def seconds_to_srt_time(seconds):
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int((seconds - int(seconds)) * 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"

def detect_scenes(video_path):
    # Lower threshold for short videos to detect more scenes
    threshold = 50.0  # Lower threshold = more scenes
    downscale_factor = 1  # Reasonable speed/accuracy for short video
    video_manager = VideoManager([video_path])
    scene_manager = SceneManager()
    scene_manager.add_detector(ContentDetector(threshold=threshold))
    video_manager.set_downscale_factor(downscale_factor)
    video_manager.start()
    scene_manager.detect_scenes(frame_source=video_manager)
    scene_list = scene_manager.get_scene_list()
    video_manager.release()
    print(f"Detected {len(scene_list)} scenes in {video_path}")
    return scene_list

def main():
    input_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../ingestion/scene_detector'))
    output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../outputs/scene_boundary'))
    os.makedirs(output_dir, exist_ok=True)
    video_exts = ['.mp4', '.mkv', '.avi', '.mov']
    for dirpath, dirnames, filenames in os.walk(input_root):
        # Find all base names that have both a video and a .srt
        base_names = set()
        videos = {}
        srts = set()
        for f in filenames:
            base, ext = os.path.splitext(f)
            if ext.lower() in video_exts:
                videos[base] = f
            elif ext.lower() == '.srt':
                srts.add(base)
        for base in videos:
            if base in srts:
                video_path = os.path.join(dirpath, videos[base])
                print(f"Processing {video_path} ...")
                scene_list = detect_scenes(video_path)
                scene_json = []
                for idx, (start, end) in enumerate(scene_list, 1):
                    scene_json.append({
                        'scene_number': idx,
                        'start': seconds_to_srt_time(start.get_seconds()),
                        'end': seconds_to_srt_time(end.get_seconds())
                    })
                output_path = os.path.join(output_dir, base + '.json')
                with open(output_path, 'w', encoding='utf-8') as f:
                    json.dump(scene_json, f, indent=2)
                print(f"Scene boundaries saved to {output_path}")

if __name__ == '__main__':
    main() 