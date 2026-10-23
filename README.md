# Real-Estate-CRM

An AI-powered Real Estate Customer Relationship Management (CRM) platform that manages property listings, tracks client leads through a sales pipeline, schedules follow-ups, and assists real estate agents with an AI assistant that matches clients to available properties.

## Key Features

- **Smart Lead Management** – Track leads with contact details, budget range, preferred location, source, and interested properties; search, filter, and sort the lead list.
- **AI Property Matching** – A chat assistant searches live listings by city, property type, sale/rent, price range, and bedrooms, explains why each result fits the client's budget and requirements, and captures interested prospects as new leads.
- **Lead Pipeline Tracking** – Stage-based status for every lead (New → Contacted → Qualified → Negotiating → Won / Lost), with dashboard counts per stage.
- **Property Catalog & Filtering** – Centralized listings for houses, apartments, condos, townhouses, land, and commercial assets, with filtering, full-text search, and ordering.
- **Follow-Up Scheduling & AI Drafts** – Schedule calls, emails, SMS, WhatsApp messages, or meetings with leads, mark them complete, and generate AI-drafted follow-up notes.

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | Python, Django, Django REST Framework, django-filter, Groq LLM API (tool calling) |
| **Database** | SQLite (default) / PostgreSQL via `DATABASE_URL` (Properties, Leads, Follow-ups) |
| **Frontend** | React, React Router, Axios, Vite, Tailwind CSS |

## System Architecture

```
React (Vite)        Django API          AI Agent Service      Groq LLM            Database (SQL)
     |                  |                     |                   |                      |
     |-- POST /api/ai/chat/ (message + history) ->                |                      |
     |                  |-- run_agent() ------>|                   |                      |
     |                  |                     |-- prompt + tool schemas ->               |
     |                  |                     |<-- tool calls ----|                      |
     |                  |                     |-- search_properties / create_lead /      |
     |                  |                     |   schedule_followup (ORM) ------------->|
     |                  |                     |<-- matching listings, lead/follow-up ids-|
     |                  |                     |-- tool results -->|                      |
     |                  |                     |<-- final reply ---|                      |
     |                  |<-- reply + tool calls                   |                      |
     |<-- reply, matching properties          |                   |                      |
```

The server is stateless between chat turns: the client sends the conversation history with each message. The tool loop repeats until the model stops requesting tools (capped at 6 iterations).

## Project Structure

```
backend/
  config/        Django settings, URLs, database configuration
  leads/         Lead models, pipeline status, views, and dashboard stats
  properties/    Property listings, search filters, catalog, and seed_data command
  followups/     Follow-up scheduling, completion, and AI-drafted notes
  ai_engine/     Groq LLM integration, agent loop, and CRM tools (property matcher)
  requirements.txt
frontend/        React + Vite client (CRM Dashboard, Lead Detail, Property Search, AI Chat)
```

## Local Setup

### Prerequisites
Python 3.12+, Node.js 20.19+, and a Groq API key (optional — without it the CRM works and the AI endpoints return 503). SQLite is used by default; PostgreSQL is optional.

### Backend Setup

```bash
git clone <repo-url>
cd Real-Estate-CRM

python3 -m venv .venv
source .venv/bin/activate

pip install -r backend/requirements.txt

cp backend/.env.example backend/.env   # set GROQ_API_KEY; optionally DATABASE_URL for PostgreSQL

cd backend
python manage.py migrate
python manage.py seed_data             # optional: sample properties and leads
python manage.py runserver             # http://localhost:8000
```

### Frontend Setup

```bash
cd frontend
cp .env.example .env                   # VITE_API_BASE_URL=/api (proxied to http://127.0.0.1:8000)
npm install
npm run dev                            # http://localhost:5173
```

## Author

Abdullah Haroon Khan
