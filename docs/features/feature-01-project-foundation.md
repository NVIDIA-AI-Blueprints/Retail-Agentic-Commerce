# Feature 1: Project Foundation & Setup

**Goal**: Scaffold the FastAPI backend with all required dependencies and configuration.

## Tasks

- [x] Initialize Python 3.12+ project with `pyproject.toml` or `requirements.txt`
- [x] Install core dependencies:
  - `fastapi`
  - `uvicorn`
  - `sqlmodel`
  - `nemo-agent-toolkit`
  - `pydantic`
- [x] Create FastAPI application entry point (`main.py`)
- [x] Configure environment variables:
  ```env
  # NIM Configuration
  NIM_ENDPOINT=https://integrate.api.nvidia.com/v1
  NVIDIA_API_KEY=nvapi-xxx
  
  # Webhook Configuration
  WEBHOOK_URL=https://your-client.example.com/webhooks/acp
  WEBHOOK_SECRET=whsec_xxx
  
  # API Security
  API_KEY=your-api-key
  ```
- [x] Create basic health check endpoint (`GET /health`)
- [x] Set up project folder structure:
  ```
  src/
  └── merchant/
      ├── __init__.py
      ├── main.py
      ├── config.py
      ├── api/
      │   ├── __init__.py
      │   ├── dependencies.py
      │   └── routes/
      │       ├── __init__.py
      │       └── health.py
      ├── agents/
      │   └── __init__.py
      ├── db/
      │   ├── __init__.py
      │   ├── models.py
      │   └── database.py
      └── services/
          └── __init__.py
  ```

## Acceptance Criteria

- Server starts with `uvicorn src.merchant.main:app`
- Health endpoint returns 200 OK
- Environment variables are loaded correctly

---

[← Back to Feature Overview](./index.md)
