from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ..schemas import FrameInput, VisionResponse
from ..services import analyze_frame

router = APIRouter()

@router.post(
    "/frame",
    response_model=VisionResponse,
    summary="Analyze one JPEG‐frame (base64) synchronously"
)
def analyze_frame_endpoint(frame: FrameInput):
    return analyze_frame(frame.jpeg_b64)


@router.websocket("/ws")
async def vision_ws(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            data = await ws.receive_json()
            frame = FrameInput(**data)
            resp = analyze_frame(frame.jpeg_b64)
            await ws.send_json(resp.dict())
    except WebSocketDisconnect:
        return
