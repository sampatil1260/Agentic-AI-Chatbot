import re

class IntentClassifier:
    def __init__(self):
        self.policy_keywords = ["return policy", "refund policy", "exchange policy", "warranty", "cancellation policy", "privacy policy", "can i return", "return my", "what is your policy", "what are your policies"]
        self.history_keywords = ["service history", "my history", "my returns", "my account history", "order history", "my orders", "show my service"]
        self.product_keywords = [
            "tutorial", "documentation", "system requirements", "features",
            "how to", "guide", "setup", "install", "tell me about",
            "what is", "what are", "accountease", "accubooks", "effigy",
            "shopease", "soundwave", "product"
        ]
        
        self.policies = {
            "cancellation": "Account Cancellation Policy",
            "exchange": "Exchange Policy",
            "refund": "Refund Policy",
            "warranty": "Warranty Policy",
            "privacy": "Privacy Policy",
            "return": "Return Policy"
        }

    def classify(self, message: str) -> dict:
        msg_lower = message.lower()
        entities = {}
        
        # Check for policy
        for kw in self.policy_keywords:
            if kw in msg_lower:
                for key, full_name in self.policies.items():
                    if key in msg_lower:
                        entities["policy_name"] = full_name
                        break
                if "policy_name" not in entities:
                    entities["policy_name"] = "Return Policy"
                return {"intent": "policy_query", "entities": entities}
                
        # Check for service history
        for kw in self.history_keywords:
            if kw in msg_lower:
                return {"intent": "service_history", "entities": entities}
                
        # Check for product queries
        for kw in self.product_keywords:
            if kw in msg_lower:
                return {"intent": "product_query", "entities": entities}
                
        # Email extraction fallback for entities
        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', message)
        if email_match:
            entities["email"] = email_match.group(0)
            
        return {"intent": "general", "entities": entities}
