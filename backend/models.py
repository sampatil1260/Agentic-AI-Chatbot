from pydantic import BaseModel, Field
from typing import Optional, List

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    user_email: Optional[str] = None

class Source(BaseModel):
    product_name: str
    product_category: str = ""
    product_sub_category: str = ""
    score: float = 0.0
    product_id: str = ""

class ChatResponse(BaseModel):
    answer: str
    sources: List[Source] = Field(default_factory=list)
    conversation_id: str
    query_type: str

class PolicyRequest(BaseModel):
    policy_name: str

class PolicyResponse(BaseModel):
    policy: str
    policy_details: str
    last_updated: str

class ServiceHistoryRequest(BaseModel):
    user_email: str

class ServiceHistoryEntry(BaseModel):
    returns_last_12_months: int
    issue_category: str
    todays_date: str

class ServiceHistoryResponse(BaseModel):
    entries: List[ServiceHistoryEntry]
    user_email: str

class HealthResponse(BaseModel):
    status: str
    model: str
    vector_search_endpoint: str
