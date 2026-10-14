from __future__ import annotations

import cv2
import numpy as np
import onnxruntime as ort


class MODNetONNX:
    """MODNet portrait matting using ONNX Runtime.

    Args:
        model_path: Path to ``.onnx`` weights file.
        session: Pre-built session. If provided, ``model_path`` is ignored.
        input_size: Target size for the shorter side (default 512).
    """

    def __init__(
        self, model_path: str, session: ort.InferenceSession | None = None, input_size: int = 512,
    ) -> None:
        self.input_size = input_size
        self.session = session
        if self.session is None:
            assert model_path is not None, "Model path is required when no session is provided."
            self.session = ort.InferenceSession(
                model_path, providers=["CUDAExecutionProvider", "CPUExecutionProvider"]
            )

        input_cfg = self.session.get_inputs()[0]
        self.input_name = input_cfg.name

        outputs = self.session.get_outputs()
        self.output_names = [o.name for o in outputs]

    def preprocess(self, image: np.ndarray) -> tuple[np.ndarray, int, int]:
        """BGR uint8 ``(H, W, 3)`` to normalised NCHW float32 tensor + original dims."""
        orig_h, orig_w = image.shape[:2]
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        if max(orig_h, orig_w) < self.input_size or min(orig_h, orig_w) > self.input_size:
            if orig_w >= orig_h:
                new_h = self.input_size
                new_w = int(orig_w / orig_h * self.input_size)
            else:
                new_w = self.input_size
                new_h = int(orig_h / orig_w * self.input_size)
        else:
            new_h, new_w = orig_h, orig_w

        new_h = new_h - (new_h % 32)
        new_w = new_w - (new_w % 32)
        image = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)

        x = image.astype(np.float32) / 255.0
        x = (x - 0.5) / 0.5
        x = np.transpose(x, (2, 0, 1))  # HWC -> CHW
        return np.expand_dims(x, axis=0), orig_h, orig_w

    def predict(self, image: np.ndarray) -> np.ndarray:
        """Run matting on a BGR image, return ``(H, W)`` float32 matte in ``[0, 1]``."""
        tensor, orig_h, orig_w = self.preprocess(image)
        matte = self.session.run(self.output_names, {self.input_name: tensor})[0]
        matte = matte[0, 0]
        matte = cv2.resize(matte, (orig_w, orig_h), interpolation=cv2.INTER_AREA)
        return matte
