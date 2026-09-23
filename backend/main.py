from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.chat import router
from backend.config import get_settings

settings = get_settings()

app = FastAPI(
    title="Databricks AI Customer Support Chatbot",
    description="AI-powered customer support chatbot using Databricks GPT OSS 120B and Vector Search",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
