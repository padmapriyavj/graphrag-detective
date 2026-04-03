# GraphRAG Incident Detective

> When a microservice fails, GraphRAG Detective traces the blast radius across your dependency graph and surfaces similar past incidents, giving engineers a ranked root-cause hypothesis in seconds instead of hours.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Neo4j](https://img.shields.io/badge/Neo4j-008CC1?style=flat&logo=neo4j&logoColor=white)
![Kafka](https://img.shields.io/badge/Apache_Kafka-231F20?style=flat&logo=apache-kafka&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=flat&logo=docker&logoColor=white)

---

## What it does

Incident response in distributed systems is slow. When `payments-service` goes down, an engineer has to manually trace which services depend on it, check logs across 10 services, and dig through Slack history for similar past incidents. That process takes hours.

GraphRAG Incident Detective automates it in three steps:

1. **Graph traversal** — queries a Neo4j dependency graph to find every service in the blast radius (up to N hops deep)
2. **Semantic retrieval** — searches a vector store of past incident reports for historically similar failures
3. **LLM synthesis** — an agent orchestrates both, then generates a ranked root-cause hypothesis with remediation steps

---

## Architecture

```
Kafka Alert
    │
    ▼
┌─────────────────────────────────────────────┐
│              LLM Agent (LangChain.js)        │
│                                             │
│   ┌─────────────────┐  ┌─────────────────┐  │
│   │  queryGraph()   │  │searchIncidents()│  │
│   └────────┬────────┘  └────────┬────────┘  │
└────────────┼────────────────────┼────────────┘
             │                    │
             ▼                    ▼
       Neo4j AuraDB          pgvector (PostgreSQL)
    (dependency graph)     (incident embeddings)
             │                    │
             └──────────┬─────────┘
                        ▼
              Ranked hypothesis JSON
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript / Node.js |
| Graph DB | Neo4j AuraDB |
| Vector Store | pgvector (PostgreSQL) |
| LLM Agent | LangChain.js |
| LLM Provider | Groq API |
| Message Queue | Kafka (kafkajs) |
| Containerization | Docker |

---
## Getting Started

### Prerequisites

- Node.js 18+
- Docker (for local Kafka)
- Neo4j AuraDB free account → [console.neo4j.io](https://console.neo4j.io)
- Groq API key (free) → [console.groq.com](https://console.groq.com)

---

## Why GraphRAG?

Standard RAG retrieves past incidents by text similarity alone. GraphRAG adds a structural layer — the dependency graph — so the agent understands *which services are actually connected* before deciding which past incidents are relevant. A timeout in `payments-service` and a timeout in `logging-service` look similar in text but are completely different in graph context.

This combination of graph traversal + semantic retrieval is what makes the hypotheses structurally grounded, not just lexically similar.

---

## Roadmap

- [ ] REST API endpoint (`POST /analyze`) for programmatic access
- [ ] Slack webhook integration for real-time alert posting
- [ ] Dynamic graph updates (services register/deregister via API)
- [ ] Confidence scoring calibration across incident types
- [ ] Multi-hop root cause chaining

---

## Author

**Padmapriya Vijayaragava Rengaraj**

---

## License

MIT
