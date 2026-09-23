import logging
import requests
from typing import Optional
from backend.config import get_settings
from backend.models import ServiceHistoryResponse, ServiceHistoryEntry

logger = logging.getLogger(__name__)

class CustomerServiceService:
    def __init__(self):
        self.settings = get_settings()
        self.base_url = self.settings.databricks_host.rstrip('/')
        self.api_url = f"{self.base_url}/api/2.0/sql/statements"
        self.headers = {
            "Authorization": f"Bearer {self.settings.databricks_token}",
            "Content-Type": "application/json"
        }

    def get_service_history(self, user_email: str) -> Optional[ServiceHistoryResponse]:
        try:
            payload = {
                "warehouse_id": self.settings.databricks_warehouse_id,
                "statement": "SELECT * FROM agentic_catalog.agentic_schema.get_service_history(:user_email)",
                "parameters": [
                    {
                        "name": "user_email",
                        "value": user_email,
                        "type": "STRING"
                    }
                ]
            }
            
            response = requests.post(self.api_url, headers=self.headers, json=payload)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get("status", {}).get("state") == "SUCCEEDED":
                result = data.get("result", {})
                data_array = result.get("data_array", [])
                
                entries = []
                for row in data_array:
                    if len(row) >= 3:
                        entries.append(ServiceHistoryEntry(
                            returns_last_12_months=int(row[0] if row[0] is not None else 0),
                            issue_category=str(row[1] if row[1] is not None else ""),
                            todays_date=str(row[2] if row[2] is not None else "")
                        ))
                
                return ServiceHistoryResponse(
                    entries=entries,
                    user_email=user_email
                )
            
            logger.warning(f"Failed to get service history synchronously or no data returned: {data}")
            return None
            
        except Exception as e:
            logger.error(f"Error fetching service history: {e}")
            return None
