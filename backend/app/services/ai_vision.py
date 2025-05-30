import base64
import cv2
import numpy as np
import mediapipe as mp
import pickle
from ..schemas import VisionResponse

_model_dict = pickle.load(open("model.p", "rb"))
_model = _model_dict["model"]
_labels = {0: "Open", 1: "Closed", 2: "Yawning"}

_face_mesh = mp.solutions.face_mesh.FaceMesh(
    static_image_mode=False,
    refine_landmarks=True,
    max_num_faces=1,
    min_detection_confidence=0.5
)

EYE_INDICES = [
    33, 133, 160, 159, 158, 157, 173, 246,
    362, 263, 387, 386, 385, 384, 398, 466
]

MOUTH_INDICES = [
    78, 95, 88, 178, 87, 14, 317, 402,
    318, 324, 308, 415, 310, 311, 312, 13, 82
]

ALL_INDICES = EYE_INDICES + MOUTH_INDICES

def _decode_frame(jpeg_b64: str) -> np.ndarray:
    data = base64.b64decode(jpeg_b64)
    arr = np.frombuffer(data, np.uint8)
    return cv2.imdecode(arr, cv2.IMREAD_COLOR)

def _extract_features(landmarks, W, H):
    xs, ys = [], []
    for i in ALL_INDICES:
        xs.append(landmarks[i].x)
        ys.append(landmarks[i].y)

    data = []
    min_x, min_y = min(xs), min(ys)
    for i in ALL_INDICES:
        data.append(landmarks[i].x - min_x)
        data.append(landmarks[i].y - min_y)

    return np.asarray(data), xs, ys

def analyze_frame(jpeg_b64: str) -> VisionResponse:
    frame = _decode_frame(jpeg_b64)
    H, W = frame.shape[:2]
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = _face_mesh.process(rgb)

    status = "No face"
    bbox = None

    if results.multi_face_landmarks:
        face_landmarks = results.multi_face_landmarks[0]
        landmarks = face_landmarks.landmark

        feat, xs, ys = _extract_features(landmarks, W, H)
        pred = _model.predict([feat])[0]
        status = _labels[int(pred)]

        x1 = int(min(xs) * W) - 10
        y1 = int(min(ys) * H) - 10
        x2 = int(max(xs) * W) + 10
        y2 = int(max(ys) * H) + 10
        bbox = (x1, y1, x2, y2)
    return VisionResponse(status=status, bbox=bbox)
