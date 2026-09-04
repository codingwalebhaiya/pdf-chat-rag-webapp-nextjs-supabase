# 📄 PDF Chat AI

> A production-ready SaaS application for chatting with your PDF documents using **RAG, vector search, and LLMs**.

Upload a PDF, ask questions in natural language, and get accurate, context-aware answers with source references.

## ✨ Features

* 🔐 **Authentication & Authorization** — Secure user authentication with Supabase
* 📄 **PDF Upload & Storage** — Upload and manage documents securely
* 🧠 **RAG Pipeline** — Chunk, embed, retrieve, and generate context-aware answers
* 🔎 **Vector Search** — Fast semantic search with Pinecone
* 💬 **AI Chat** — Chat with documents using LLMs
* ⚡ **Streaming Responses** — Real-time AI response streaming
* 📚 **Source Citations** — View the PDF pages used to generate answers
* 💳 **SaaS Billing** — Free and Pro plans with Stripe
* 📊 **Usage Limits** — Track document, query, token, and storage usage
* 🛡️ **Secure by Design** — Supabase RLS, validation, authorization, and rate limiting

## 🏗️ Architecture

```text
                         ┌──────────────┐
                         │     User     │
                         └──────┬───────┘
                                │
                                ▼
                         ┌──────────────┐
                         │   Next.js    │
                         └──────┬───────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
              ▼                 ▼                 ▼
         ┌─────────┐       ┌──────────┐      ┌─────────┐
         │Supabase │       │ Inngest  │      │ Stripe  │
         │Auth/DB/ │       │  Worker  │      │ Billing │
         │ Storage │       └────┬─────┘      └─────────┘
         └─────────┘            │
                                ▼
                          ┌───────────┐
                          │ LangChain │
                          └─────┬─────┘
                                │
                         ┌──────┴──────┐
                         ▼             ▼
                    ┌──────────┐  ┌────────┐
                    │ Pinecone │  │  LLM   │
                    │  Vector  │  │ Gemini │
                    │  Search  │  │        │
                    └──────────┘  └────────┘
```

## 🧠 RAG Pipeline

```text
PDF Upload
    ↓
Supabase Storage
    ↓
Background Processing
    ↓
PDF Parsing
    ↓
Text Chunking
    ↓
Embeddings
    ↓
Pinecone
    ↓
Semantic Retrieval
    ↓
LLM
    ↓
Streaming Answer + Sources
```

## 🛠️ Tech Stack

**Frontend**

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui

**Backend & Data**

* Supabase Auth
* Supabase PostgreSQL
* Supabase Storage
* Drizzle ORM
* Pinecone

**AI**

* LangChain
* Gemini
* RAG
* Vector Search

**Infrastructure**

* Inngest
* Stripe
* Vercel
* Sentry
* Upstash Redis

## 🚀 Getting Started

### 1. Clone

```bash
git clone https://github.com/codingwalebhaiya/pdf-chat-rag-webapp-nextjs-supabase.git
cd pdf-chat-rag-webapp-nextjs-supabase
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

PINECONE_API_KEY=
PINECONE_INDEX=

GOOGLE_API_KEY=

INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

SENTRY_AUTH_TOKEN=
```

### 4. Run development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## 🗺️ Roadmap

* [x] Authentication & Authorization
* [x] PDF Upload & Storage
* [x] RAG Ingestion Pipeline
* [x] Pinecone Vector Search
* [x] AI Chat
* [x] Streaming Responses
* [x] Source Citations
* [ ] Stripe Subscriptions
* [ ] Usage & Quota Management
* [ ] Rate Limiting
* [ ] Production Monitoring
* [ ] Team Workspaces
* [ ] Multi-document Chat

## 🔒 Security

* Supabase Row Level Security (RLS)
* Server-side authorization
* Secure file access policies
* API input validation
* User/document-level vector filtering
* Rate limiting
* Environment-based secrets

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">
  Built with ❤️ using Next.js, Supabase, Pinecone, LangChain & Gemini
</p>
