# Databricks AI Customer Support Chatbot

A production-grade AI-powered customer support chatbot built with React and FastAPI, powered by Databricks GPT OSS 120B and Databricks Vector Search.

## Architecture

This project uses a full-stack architecture to deliver a seamless customer support experience:
- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Python + FastAPI  
- **AI/Data**: Databricks GPT OSS 120B, Vector Search (HYBRID), SQL Functions

```text
+-----------------------+       HTTP/REST        +-----------------------+
|                       |                        |                       |
|   React Frontend      +----------------------->+   FastAPI Backend     |
|   (Vite, TS, Tailwind)|                        |   (Python)            |
|                       |                        |                       |
+-----------------------+                        +-----------+-----------+
                                                             |
                                                             | API Calls (Databricks SDK / HTTP)
                                                             v
                                                 +-----------+-----------+
                                                 |                       |
                                                 |   Databricks          |
                                                 |   - GPT OSS 120B      |
                                                 |   - Vector Search     |
                                                 |   - SQL Functions     |
                                                 |                       |
                                                 +-----------------------+
```

## Features
- AI-powered product documentation search (RAG with Vector Search)
- Natural language Q&A using Databricks GPT OSS 120B
- Policy lookup (Return, Refund, Exchange, Warranty, Privacy, Account Cancellation)
- Customer service history retrieval
- Chat history with local storage
- Markdown-rendered responses
- Source attribution for document-based answers
- Responsive design (desktop + mobile)

## Tech Stack
| Component | Technology |
|---|---|
| Frontend | React, Vite, TypeScript, Tailwind CSS, Lucide React, Markdown-to-JSX |
| Backend | Python 3.10+, FastAPI, Pydantic, Uvicorn, Databricks SDK |
| AI / LLM | Databricks Model Serving (GPT OSS 120B), OpenAI Python Client |
| Vector DB | Databricks Vector Search |
| SQL / Data | Databricks SQL Warehouse, Unity Catalog |

## Prerequisites
- Node.js 18+
- Python 3.10+
- Databricks workspace with:
  - GPT OSS 120B model serving endpoint
  - Vector Search endpoint `vs_endpoint_1`
  - Vector Search index `agentic_catalog.agentic_schema.product_docs_index`
  - SQL Warehouse
  - Tables: `agentic_catalog.agentic_schema.product_docs_combined`, `agentic_catalog.agentic_schema.policies`, `agentic_catalog.agentic_schema.cust_service_data`
  - Functions: `agentic_catalog.agentic_schema.get_return_policy`, `agentic_catalog.agentic_schema.get_service_history`

## Project Structure
```
databricks-ai-chatbot/
├── backend/
│   ├── main.py
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── notebooks/
│   ├── 01_LLM_Interaction.ipynb
│   ├── 02_Parse_PDF_Docs.ipynb
│   ├── 03_Enrich_PDF_File.ipynb
│   ├── 04_Query_VS_Index.py.ipynb
│   └── 05_Create_User_Defined_Functions.ipynb
├── .gitignore
└── README.md
```

## Environment Variables
| Variable | Description |
|---|---|
| DATABRICKS_HOST | Databricks workspace URL |
| DATABRICKS_TOKEN | Personal Access Token (PAT) for API access |
| DATABRICKS_SQL_WAREHOUSE_ID | ID of the SQL Warehouse to run queries |
| DATABRICKS_VECTOR_SEARCH_ENDPOINT | Vector Search Endpoint Name (e.g., vs_endpoint_1) |
| DATABRICKS_VECTOR_SEARCH_INDEX | Vector Search Index Name |
| DATABRICKS_LLM_ENDPOINT | LLM Model Serving Endpoint Name |

## Quick Start

### 1. Clone and Setup
```bash
cd databricks-ai-chatbot
cp backend/.env.example backend/.env
# Edit backend/.env with your Databricks credentials
```

### 2. Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```
Note: Run uvicorn from the project root (parent of `backend/`), not from inside the `backend/` directory.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Access
Open http://localhost:5173

## How It Works

### RAG Pipeline
1. **User sends question**: The user submits a query through the React frontend.
2. **Intent classifier determines question type**: The backend uses an initial LLM call to classify the intent (product, policy, service history, general).
3. **For product questions**: Vector Search retrieves relevant docs → context sent to LLM → answer generated.
4. **For policy questions**: SQL function retrieves policy → LLM formats response.
5. **For service history**: SQL function retrieves history → LLM formats response.

### Vector Search
The system uses HYBRID search on the `product_docs_index`, returning the `indexed_doc` containing XML-tagged metadata to provide rich context to the LLM.

### LLM Integration
We use the OpenAI-compatible API to communicate with the Databricks GPT OSS 120B model serving endpoint for seamless chat completions.

### SQL Functions
Custom user-defined functions like `get_return_policy` and `get_service_history` allow the LLM to access structured tabular data seamlessly through function calling or direct execution.

## API Endpoints
| Method | Path | Description | Request | Response |
|---|---|---|---|---|
| POST | `/api/chat` | Main chat endpoint | `{ "message": "...", "history": [...] }` | `{ "response": "...", "sources": [...] }` |
| GET | `/health` | Health check endpoint | N/A | `{ "status": "ok" }` |

## Troubleshooting
- **CORS issues**: Ensure the FastAPI backend has CORS middleware configured to allow `http://localhost:5173`.
- **Authentication errors**: Double check `DATABRICKS_HOST` and `DATABRICKS_TOKEN`. Ensure the PAT hasn't expired.
- **Vector Search connection issues**: Verify the endpoint is running and the index name matches exactly.

## Security Notes
- All credentials stored server-side only.
- No secrets in frontend code.
- Environment variables via `.env` file.
- `.env` excluded from version control.
- CORS restricted to localhost dev servers.

## Notebooks Reference
- `01_LLM_Interaction.ipynb`: Basic interactions with Databricks LLM.
- `02_Parse_PDF_Docs.ipynb`: Parsing PDF product documents.
- `03_Enrich_PDF_File.ipynb`: Enriching extracted text.
- `04_Query_VS_Index.py.ipynb`: Setting up and querying Vector Search.
- `05_Create_User_Defined_Functions.ipynb`: Creating the SQL UDFs.
