import logging
import requests
from typing import Optional
from backend.config import get_settings
from backend.models import PolicyResponse

logger = logging.getLogger(__name__)

class PolicyService:
    AVAILABLE_POLICIES = [
        "Account Cancellation Policy", 
        "Exchange Policy", 
        "Refund Policy", 
        "Warranty Policy", 
        "Privacy Policy", 
        "Return Policy"
    ]

    def __init__(self):
        self.settings = get_settings()
        self.base_url = self.settings.databricks_host.rstrip('/')
        self.api_url = f"{self.base_url}/api/2.0/sql/statements"
        self.headers = {
            "Authorization": f"Bearer {self.settings.databricks_token}",
            "Content-Type": "application/json"
        }

    def get_policy(self, policy_name: str) -> Optional[PolicyResponse]:
        try:
            payload = {
                "warehouse_id": self.settings.databricks_warehouse_id,
                "statement": "SELECT * FROM agentic_catalog.agentic_schema.get_return_policy(:policy_name)",
                "parameters": [
                    {
                        "name": "policy_name",
                        "value": policy_name,
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
                if data_array and len(data_array) > 0:
                    row = data_array[0]
                    return PolicyResponse(
                        policy=row[0] if len(row) > 0 else policy_name,
                        policy_details=row[1] if len(row) > 1 else "",
                        last_updated=row[2] if len(row) > 2 else ""
                    )
            
            logger.warning(f"Failed to get policy synchronously or no data returned: {data}")
            return None
            
        except Exception as e:
            logger.error(f"Error fetching policy: {e}")
            return None
