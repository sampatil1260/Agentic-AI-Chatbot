import logging
from openai import OpenAI
from backend.config import get_settings

logger = logging.getLogger(__name__)

class DatabricksLLM:
    def __init__(self):
        self.settings = get_settings()
        self.client = None
        self.model = self.settings.llm_model
        
        if not self.settings.databricks_token:
            logger.warning("DATABRICKS_TOKEN not set. LLM service will not be available.")
            return
            
        try:
            base_url = self.settings.databricks_host.rstrip('/')
            if not base_url.endswith('/serving-endpoints'):
                base_url = f"{base_url}/serving-endpoints"
                
            self.client = OpenAI(
                base_url=base_url,
                api_key=self.settings.databricks_token
            )
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI client: {e}")
        
    def generate_response(self, question: str, context: str = "", conversation_history: list = None) -> str:
        if self.client is None:
            return "I'm sorry, the AI service is not configured yet. Please ask your administrator to set the DATABRICKS_HOST and DATABRICKS_TOKEN environment variables."
        try:
            messages = [
                {"role": "system", "content": "You are a helpful AI customer support assistant. Use the provided context to answer questions accurately. If the context doesn't contain relevant information, say so honestly. Format responses with markdown when helpful."}
            ]
            
            if context:
                messages.append({
                    "role": "system", 
                    "content": f"Here is relevant product documentation to help answer the question:\n\n{context}"
                })
                
            if conversation_history:
                messages.extend(conversation_history)
                
            messages.append({"role": "user", "content": question})
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=self.settings.llm_max_tokens
            )
            
            content = response.choices[0].message.content
            if isinstance(content, list):
                for item in content:
                    if isinstance(item, dict) and item.get("type") == "text":
                        return item.get("text", "")
                return str(content)
            
            return str(content)
            
        except Exception as e:
            logger.error(f"Error generating LLM response: {e}")
            return "I apologize, but I encountered an error while processing your request."

    def generate_policy_response(self, policy_data: dict) -> str:
        try:
            prompt = f"Format the following policy information into a natural, helpful response for a customer:\nPolicy Name: {policy_data.get('policy', 'Unknown')}\nDetails: {policy_data.get('policy_details', 'None')}\nLast Updated: {policy_data.get('last_updated', 'Unknown')}"
            return self.generate_response(prompt)
        except Exception as e:
            logger.error(f"Error generating policy response: {e}")
            return "I apologize, but I could not retrieve the policy information at this time."

    def generate_service_history_response(self, history_data: dict, user_email: str) -> str:
        try:
            prompt = f"Format the following customer service history into a natural, helpful response for the user ({user_email}):\nHistory entries: {history_data.get('entries', [])}"
            return self.generate_response(prompt)
        except Exception as e:
            logger.error(f"Error generating service history response: {e}")
            return "I apologize, but I could not retrieve your service history at this time."
