from pydantic import BaseModel
from typing import List, Optional, Tuple

class VisionResponse(BaseModel):
    status: str
    bbox: Optional[Tuple[int, int, int, int]] = None

class FrameInput(BaseModel):
    # client will send frames as base64-encoded JPEG
    jpeg_b64: str
