import logging
import re
from typing import Tuple, List
from databricks.vector_search.client import VectorSearchClient
from backend.config import get_settings
from backend.models import Source

logger = logging.getLogger(__name__)

class VectorSearchService:
    def __init__(self):
        self.settings = get_settings()
        try:
            self.vsc = VectorSearchClient(
                workspace_url=self.settings.databricks_host,
                service_principal_client_id=self.settings.sp_client_id,
                service_principal_client_secret=self.settings.sp_client_secret,
                disable_notice=True
            )
            self.index = self.vsc.get_index(
                endpoint_name=self.settings.vs_endpoint,
                index_name=self.settings.vs_index
            )
        except Exception as e:
            logger.error(f"Failed to initialize VectorSearchService: {e}")
            self.index = None

    def parse_indexed_doc(self, indexed_doc: str) -> dict:
        result = {
            "product_name": "",
            "product_category": "",
            "product_sub_category": "",
            "product_doc": ""
        }
        
        try:
            name_match = re.search(r'<product_name>(.*?)</product_name>', indexed_doc, re.IGNORECASE | re.DOTALL)
            if name_match: result["product_name"] = name_match.group(1).strip()
            
            cat_match = re.search(r'<product_category>(.*?)</product_category>', indexed_doc, re.IGNORECASE | re.DOTALL)
            if cat_match: result["product_category"] = cat_match.group(1).strip()
            
            subcat_match = re.search(r'<product_sub_category>(.*?)</product_sub_category>', indexed_doc, re.IGNORECASE | re.DOTALL)
            if subcat_match: result["product_sub_category"] = subcat_match.group(1).strip()
            
            doc_match = re.search(r'<product_doc>(.*?)</product_doc>', indexed_doc, re.IGNORECASE | re.DOTALL)
            if doc_match: result["product_doc"] = doc_match.group(1).strip()
            
        except Exception as e:
            logger.error(f"Error parsing indexed_doc: {e}")
            
        return result

    def search(self, query_text: str, num_results: int = None) -> Tuple[List[Source], str]:
        if num_results is None:
            num_results = self.settings.vs_num_results
            
        sources = []
        context = ""
        
        if not self.index:
            logger.warning("Vector search index not initialized. Returning empty results.")
            return sources, context
            
        try:
            response = self.index.similarity_search(
                query_text=query_text,
                columns=["indexed_doc", "product_id"],
                num_results=num_results,
                query_type="HYBRID"
            )
            
            result_data = response.get('result', {}).get('data_array', [])
            
            for item in result_data:
                if len(item) >= 3:
                    indexed_doc = item[0]
                    product_id = item[1]
                    score = item[2]
                    
                    parsed = self.parse_indexed_doc(indexed_doc)
                    
                    source = Source(
                        product_name=parsed.get("product_name", "Unknown Product"),
                        product_category=parsed.get("product_category", ""),
                        product_sub_category=parsed.get("product_sub_category", ""),
                        score=float(score),
                        product_id=str(product_id)
                    )
                    sources.append(source)
                    
                    context += f"Product: {source.product_name}\nCategory: {source.product_category}\nDetails: {parsed.get('product_doc', '')}\n\n"
                    
        except Exception as e:
            logger.error(f"Error performing vector search: {e}")
            
        return sources, context.strip()
