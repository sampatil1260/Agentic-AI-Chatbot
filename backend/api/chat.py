import uuid
import logging
from fastapi import APIRouter, HTTPException, Depends
from backend.models import ChatRequest, ChatResponse, PolicyRequest, PolicyResponse, ServiceHistoryRequest, ServiceHistoryResponse, HealthResponse
from backend.services.databricks_llm import DatabricksLLM
from backend.services.vector_search import VectorSearchService
from backend.services.policies import PolicyService
from backend.services.customer_service import CustomerServiceService
from backend.services.intent_classifier import IntentClassifier
from backend.config import get_settings, Settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")

# Lazy loading of services
llm_service = None
vs_service = None
policy_service = None
cs_service = None
intent_classifier = None

def get_services():
    global llm_service, vs_service, policy_service, cs_service, intent_classifier
    if llm_service is None: llm_service = DatabricksLLM()
    if vs_service is None: vs_service = VectorSearchService()
    if policy_service is None: policy_service = PolicyService()
    if cs_service is None: cs_service = CustomerServiceService()
    if intent_classifier is None: intent_classifier = IntentClassifier()
    return llm_service, vs_service, policy_service, cs_service, intent_classifier

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        llm, vs, policy, cs, classifier = get_services()
        
        conv_id = request.conversation_id or str(uuid.uuid4())
        
        classification = classifier.classify(request.message)
        intent = classification["intent"]
        entities = classification["entities"]
        
        if intent == "policy_query":
            policy_name = entities.get("policy_name", "Return Policy")
            policy_res = policy.get_policy(policy_name)
            if policy_res:
                answer = llm.generate_policy_response({
                    "policy": policy_res.policy,
                    "policy_details": policy_res.policy_details,
                    "last_updated": policy_res.last_updated
                })
            else:
                answer = f"I'm sorry, I couldn't retrieve the information for the {policy_name}."
            return ChatResponse(answer=answer, sources=[], conversation_id=conv_id, query_type=intent)
            
        elif intent == "service_history":
            email = request.user_email or entities.get("email")
            if not email:
                return ChatResponse(
                    answer="Please provide your email address to look up your service history.",
                    sources=[], conversation_id=conv_id, query_type=intent
                )
            history_res = cs.get_service_history(email)
            if history_res:
                answer = llm.generate_service_history_response(
                    {"entries": [entry.model_dump() for entry in history_res.entries]}, 
                    email
                )
            else:
                answer = "I'm sorry, I couldn't retrieve your service history at this time."
            return ChatResponse(answer=answer, sources=[], conversation_id=conv_id, query_type=intent)
            
        else:
            # product_query or general
            sources, context = vs.search(request.message)
            answer = llm.generate_response(request.message, context)
            return ChatResponse(answer=answer, sources=sources, conversation_id=conv_id, query_type=intent)
            
    except Exception as e:
        logger.error(f"Chat error: {e}")
        return ChatResponse(
            answer="I'm sorry, I'm having trouble connecting to the AI service right now. Please make sure the backend is configured with valid Databricks credentials and try again.",
            sources=[],
            conversation_id=request.conversation_id or str(uuid.uuid4()),
            query_type="error"
        )

@router.get("/health", response_model=HealthResponse)
async def health(settings: Settings = Depends(get_settings)):
    return HealthResponse(
        status="ok",
        model=settings.llm_model,
        vector_search_endpoint=settings.vs_endpoint
    )

@router.post("/policy", response_model=PolicyResponse)
async def get_policy_api(request: PolicyRequest):
    _, _, policy, _, _ = get_services()
    res = policy.get_policy(request.policy_name)
    if not res:
        raise HTTPException(status_code=404, detail="Policy not found or failed to retrieve")
    return res

@router.post("/service-history", response_model=ServiceHistoryResponse)
async def get_service_history_api(request: ServiceHistoryRequest):
    _, _, _, cs, _ = get_services()
    res = cs.get_service_history(request.user_email)
    if not res:
        raise HTTPException(status_code=404, detail="Service history not found or failed to retrieve")
    return res
