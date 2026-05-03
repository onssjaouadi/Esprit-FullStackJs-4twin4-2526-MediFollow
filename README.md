# 🏥 MediFollow – Post-Hospitalization Remote Monitoring Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14.0-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green?logo=mongodb)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker)](https://www.docker.com/)
[![Aptos](https://img.shields.io/badge/Aptos-Blockchain-00D4AA)](https://aptoslabs.com/)

---

## Overview

This project was developed as part of the **FullStackJs – 4th Year Engineering Program** at **Esprit School of Engineering** (Academic Year 2025–2026).

**MediFollow** is a full-stack web platform for post-hospitalization remote patient monitoring. It bridges the gap between hospital discharge and complete recovery by enabling patients to record vital signs from home, triggering automated alerts to healthcare providers when abnormal values are detected, and storing a tamper-proof audit trail on the Aptos blockchain.

> **Why Blockchain?** Medical data integrity is critical for regulatory compliance and legal protection. Aptos was selected for its high throughput (up to 160,000 TPS), sub-second finality, and cost-efficient transactions — making it well-suited for real-time health alerting.

---

## Features

- 📊 **Vital Sign Recording** — Patients submit blood pressure, heart rate, temperature, SpO2, and weight from any device
- 🚨 **Intelligent Alert System** — Automated threshold comparison triggers multi-channel notifications (email, SMS, in-app) with severity levels (Low / Medium / High / Critical)
- 👥 **Multi-Patient Dashboard** — Doctors monitor all assigned patients from a single interface with trend charts and alert queues
- 🔐 **Role-Based Access Control (RBAC)** — Fine-grained permissions for Patient, Doctor, and Administrator roles
- ⛓ **Blockchain Audit Trail** — Every vital record and sensitive action is hashed (SHA-256) and stored immutably on Aptos via a Move smart contract
- 📝 **Symptom & Questionnaire Tracking** — Daily symptom reports, pain scale, post-discharge questionnaires
- 📄 **Report Generation** — Export patient analytics to PDF/Excel
- 🔍 **Audit Logs** — Complete, blockchain-verified activity history accessible to administrators

---

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router) + TypeScript 5
- **Styling**: TailwindCSS 3.4 + Radix UI + HeadlessUI
- **Charts**: Recharts / Chart.js
- **Forms**: React Hook Form + Zod

### Backend
- **Runtime**: Node.js 20 LTS
- **API**: Next.js API Routes + Server Actions
- **Auth**: JWT (HTTP-only cookies, HMAC-SHA256, 7-day expiry)
- **Rate Limiting**: Custom Redis-backed middleware (100 req/min per user)
- **Hashing**: bcrypt (12 rounds)

### Database
- **Primary**: MongoDB 7.0 + Mongoose 8
- **Cache / Sessions**: Redis 7.2
- **Connection Pool**: 100 connections

### Blockchain
- **Network**: Aptos (Testnet / Mainnet)
- **Language**: Move
- **SDK**: `@aptos-labs/ts-sdk`

### DevOps
- **Containerization**: Docker 24 + Docker Compose
- **Reverse Proxy**: NGINX (production)
- **Logging**: Winston + Morgan
- **CI/CD**: GitHub Actions

---

## Architecture

MediFollow follows a layered monolithic architecture deployed via Docker Compose:

```
┌──────────────────────────────────────────────┐
│              Client Layer                    │
│   Patient Interface · Doctor Dashboard ·    │
│   Admin Panel  (Next.js, HTTPS)             │
└────────────────────┬─────────────────────────┘
                     │
┌────────────────────▼─────────────────────────┐
│        Next.js Application Layer             │
│  App Router · API Routes · Server Actions   │
│  JWT Middleware → RBAC → Rate Limiting      │
└──────┬──────────────────────┬────────────────┘
       │                      │
┌──────▼──────┐        ┌──────▼──────────────┐
│  MongoDB    │        │  Aptos Blockchain    │
│  + Redis    │        │  (Audit Proof Hash)  │
└─────────────┘        └──────────────────────┘
       │
┌──────▼──────────────────────────────────────┐
│  External Services                          │
│  SMTP (Email) · SMS Gateway (Twilio)        │
└─────────────────────────────────────────────┘
```

**Key design decisions:**
- Frontend and backend unified in a single Next.js deployable unit
- Blockchain writes are asynchronous and non-blocking for the user
- Redis handles session storage shared across horizontal replicas
- NGINX terminates TLS and applies API-level rate limiting

### UML Diagrams

Full UML diagrams (Use Case, Class, Activity, Component, Sequence) are available in [`/docs/UML.md`](./docs/UML.md).

### Database Schema

The main collections are `users`, `patients`, `vital_records`, `alerts`, `audit_logs`, `questionnaires`, and `blockchain_proofs`. Key design principles:

- Embedded documents for frequently co-accessed data (e.g. address inside patient)
- Soft deletes via `isActive` flag for audit compliance
- Unique indexes on `email`, `medicalRecordNumber`, `txHash`
- Automatic `createdAt`/`updatedAt` via Mongoose timestamps

### RBAC Matrix

| Resource | Patient | Doctor | Admin |
|---|---|---|---|
| Own vitals (read/write) | ✅ | ❌ | ❌ |
| Assigned patients' vitals | ❌ | ✅ | ✅ |
| Create / resolve alerts | ❌ | ✅ | ✅ |
| User management | ❌ | ❌ | ✅ |
| Audit logs | ❌ | ❌ | ✅ |

### Alert Severity Levels

| Level | Condition |
|---|---|
| **Low** | Single parameter 5–10% outside threshold |
| **Medium** | Single parameter 10–20% outside threshold |
| **High** | Single parameter >20% outside threshold |
| **Critical** | Multiple parameters out of range or life-threatening single value |

---

## Getting Started

### Prerequisites

- Node.js 20+, npm 10+
- Docker 24+ and Docker Compose 2+
- Git

### Local Development

```bash
# 1. Clone
git clone https://github.com/<your-username>/Esprit-PIDEV-3A-2026-MediFollow.git
cd Esprit-PIDEV-3A-2026-MediFollow

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your values (see Environment section below)

# 4. Start MongoDB and Redis via Docker
docker-compose up -d mongodb redis

# 5. (Optional) Seed the database
npm run seed

# 6. Start dev server
npm run dev
# → http://localhost:3000
```

**Default seed credentials:**

| Role | Email | Password |
|---|---|---|
| Admin | admin@medifollow.dz | admin123 |
| Doctor | doctor@medifollow.dz | doctor123 |
| Patient | patient@medifollow.dz | patient123 |

### Environment Variables

Copy `.env.example` to `.env.local` and fill in the required fields:

```bash
# App
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# MongoDB
MONGODB_URI=mongodb://user:password@localhost:27017/medifollow?authSource=admin

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password

# Auth
JWT_SECRET=your_minimum_32_char_random_secret   # openssl rand -base64 32
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12

# Blockchain (Aptos)
APTOS_NETWORK=testnet
APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com/v1
APTOS_PRIVATE_KEY=0x...
APTOS_ACCOUNT_ADDRESS=0x...
APTOS_MODULE_ADDRESS=0x...

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# SMS (Twilio – for critical alerts)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+213...

# Feature flags
ENABLE_BLOCKCHAIN=true
ENABLE_SMS_ALERTS=false
ENABLE_EMAIL_ALERTS=true
```

> ⚠️ Never commit `.env` files. Use strong, randomly generated secrets and rotate them regularly.

### Docker (Full Stack)

```bash
# Development
docker-compose up -d
docker-compose logs -f web

# Production
docker-compose -f docker-compose.prod.yml up -d --build

# Teardown
docker-compose down -v
```

The production compose file runs MongoDB 7, Redis 7 Alpine, the Next.js app (multi-stage build, non-root user), and an NGINX reverse proxy with TLS termination and API rate limiting.

### API Reference

All endpoints return a consistent envelope:

```json
{ "success": true, "data": { ... } }
{ "success": false, "error": { "code": "...", "message": "...", "details": [] } }
```

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register user |
| POST | `/api/auth/login` | — | Login, receive JWT |
| GET | `/api/patients` | Doctor / Admin | List patients |
| POST | `/api/vitals` | Patient | Submit vital record |
| GET | `/api/alerts` | Doctor / Admin | List alerts |
| PATCH | `/api/alerts/:id` | Doctor / Admin | Acknowledge / resolve |
| POST | `/api/blockchain/verify` | Admin | Verify data hash on-chain |
| GET | `/api/health` | — | Service health check |

Full request/response schemas are in [`/docs/API.md`](./docs/API.md).

---

## Project Structure

```
medifollow/
├── app/               # Next.js App Router (auth, dashboard, api routes)
├── components/        # Reusable React components (ui, dashboard, forms, layout)
├── lib/               # Core logic (db, auth, services, utils, types)
├── models/            # Mongoose models
├── middleware/        # Auth, RBAC, rate limiting, logging
├── blockchain/        # Aptos SDK wrapper + Move smart contracts
├── docker/            # Dockerfiles + nginx.conf
├── scripts/           # DB seed, contract deploy, backup
├── docs/              # API, UML, architecture, deployment guides
├── .env.example
├── docker-compose.yml
├── docker-compose.prod.yml
└── README.md
```

---

## Contributors

| Name | Role |
|---|---|
| Arij Mahjoub | Full-Stack Developer |
| Walaeddine Riahi | Full-Stack Developer |
| Ons Jaouadi | Full-Stack Developer |
| Eya Nefzi | Full-Stack Developer |
| Nizar Chaieb | Full-Stack Developer |

---

## Academic Context

Developed at **Esprit School of Engineering – Tunisia**
**PIDEV – 3rd Year Engineering Program** | Academic Year 2025–2026
Supervisor: Pr. Asma Ayari

---

## Acknowledgments

- [Next.js](https://nextjs.org/docs) — React framework
- [Aptos Labs](https://aptoslabs.com/) — Blockchain infrastructure
- [MongoDB](https://university.mongodb.com/) — Database
- [Docker](https://docs.docker.com/) — Containerization
- Healthcare professionals who provided domain feedback

---

## License

This project is licensed under the [MIT License](LICENSE).
