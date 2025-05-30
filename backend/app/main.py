from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse
from .routers import aiRouter

#init app
app = FastAPI(default_response_class=ORJSONResponse)

origins = [
  "http://localhost:5173",
  "https://davintanaya.me"
]

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

#routers
app.include_router(aiRouter, prefix="/vision", tags=["Ai Vision"])
