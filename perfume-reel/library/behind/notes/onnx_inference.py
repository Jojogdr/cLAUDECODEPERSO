"""MODNet ONNX inference (image, video, or webcam) - no PyTorch dependency required.

Examples:
    python onnx_inference.py --source image.jpg --model weights/modnet_photographic.onnx --output results/
    python onnx_inference.py --source video.mp4 --model weights/modnet_photographic.onnx --background bg.jpg --output out.mp4
    python onnx_inference.py --source 0 --model weights/modnet_webcam.onnx
"""

from __future__ import annotations

import argparse
import os
import time
from pathlib import Path

import cv2
import numpy as np

from models.modnet_onnx import MODNetONNX
from utils.helpers import compose, save_results

VIDEO_EXTENSIONS = {".mp4", ".avi", ".mov", ".mkv", ".webm"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="MODNet ONNX Inference")
    parser.add_argument("--source", type=str, required=True, help="Image path, video file, or camera index (e.g. 0)")
    parser.add_argument("--model", type=str, required=True, help="Path to .onnx model")
    parser.add_argument("--background", type=str, default=None, help="Custom background image for compositing")
    parser.add_argument("--output", type=str, default=None, help="Output directory (image) or video path (video/webcam)")
    return parser.parse_args()


def run_image(model: MODNetONNX, args: argparse.Namespace) -> None:
    image = cv2.imread(args.source)
    if image is None:
        raise ValueError(f"Failed to read image: {args.source}")

    output_dir = args.output or os.path.dirname(args.source) or "."
    os.makedirs(output_dir, exist_ok=True)

    background = cv2.imread(args.background) if args.background else None
    if args.background and background is None:
        print(f"Warning: cannot read background '{args.background}', skipping custom-bg output")

    print(f"Input:  {args.source} ({image.shape[1]}x{image.shape[0]})")

    t0 = time.perf_counter()
    matte = model.predict(image)
    elapsed = (time.perf_counter() - t0) * 1000
    print(f"Inference: {elapsed:.1f} ms")

    save_results(args.source, matte, image, output_dir, background=background)


def run_video(model: MODNetONNX, args: argparse.Namespace) -> None:
    cap = cv2.VideoCapture(args.source)
    if not cap.isOpened():
        raise RuntimeError(f"Cannot open video: {args.source}")

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    background = cv2.imread(args.background) if args.background else None

    stem = Path(args.source).stem
    output_path = args.output or f"{stem}_out.mp4"
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    writer = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    print(f"Video:  {args.source} ({width}x{height} @ {fps:.0f}fps, {total} frames)")

    idx = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        t0 = time.perf_counter()
        matte = model.predict(frame)
        elapsed = (time.perf_counter() - t0) * 1000

        composed = compose(frame, matte, background)
        writer.write(composed)

        idx += 1
        if idx % 30 == 0 or idx == total:
            print(f"  Frame {idx}/{total}  ({elapsed:.0f}ms/frame)")

    cap.release()
    writer.release()
    print(f"Saved: {output_path}")


def run_webcam(model: MODNetONNX, args: argparse.Namespace) -> None:
    camera_idx = int(args.source)
    cap = cv2.VideoCapture(camera_idx)
    if not cap.isOpened():
        raise RuntimeError(f"Cannot open camera {camera_idx}")

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0

    background = cv2.imread(args.background) if args.background else None

    writer = None
    if args.output:
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        writer = cv2.VideoWriter(args.output, fourcc, fps, (width * 2, height))

    print(f"Camera: {camera_idx} ({width}x{height} @ {fps:.0f}fps)")
    print("Press 'q' to quit")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        t0 = time.perf_counter()
        matte = model.predict(frame)
        elapsed = (time.perf_counter() - t0) * 1000

        composed = compose(frame, matte, background)
        display = np.hstack([frame, composed])

        cv2.putText(
            display, f"{elapsed:.0f}ms", (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2,
        )
        cv2.imshow("MODNet Webcam (ONNX)", display)

        if writer is not None:
            writer.write(display)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    if writer is not None:
        writer.release()
        print(f"Saved: {args.output}")
    cv2.destroyAllWindows()


def main() -> None:
    args = parse_args()

    if not os.path.isfile(args.model):
        raise FileNotFoundError(f"Model not found: {args.model}")

    model = MODNetONNX(model_path=args.model)
    print(f"Model:  {args.model}")

    if args.source.isdigit():
        run_webcam(model, args)
    elif Path(args.source).suffix.lower() in VIDEO_EXTENSIONS:
        run_video(model, args)
    else:
        run_image(model, args)


if __name__ == "__main__":
    main()
