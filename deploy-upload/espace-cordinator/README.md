# 🏥 MediFollow – Post-Hospitalization Remote Monitoring Platform

<div align="center">

![MediFollow Banner](https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=300&fit=crop)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14.0-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green?logo=mongodb)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker)](https://www.docker.com/)
[![Aptos](https://img.shields.io/badge/Aptos-Blockchain-00D4AA)](https://aptoslabs.com/)

**Enterprise-grade web platform for post-hospitalization remote patient monitoring**  
Built with Next.js • MongoDB • Docker • Aptos Blockchain

[Demo](#-demo) • [Features](#-key-features) • [Architecture](#-system-architecture) • [Quick Start](#-quick-start) • [Documentation](#-documentation)

</div>

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
   - [The Healthcare Challenge](#the-healthcare-challenge)
   - [Our Solution](#our-solution)
   - [Why Blockchain](#why-blockchain)
2. [UML Diagrams](#-uml-diagrams)
   - [Use Case Diagram](#use-case-diagram)
   - [Class Diagram](#class-diagram)
   - [Activity Diagram](#activity-diagram)
   - [Component Diagram](#component-diagram)
3. [System Architecture](#-system-architecture)
4. [Docker Deployment Architecture](#-docker-deployment-architecture)
5. [Database Schema](#-database-schema)
6. [RBAC Permission Flow](#-rbac-permission-flow)
7. [Alert System Workflow](#-alert-system-workflow)
8. [Blockchain Integration](#-blockchain-integration)
9. [Key Features](#-key-features)
10. [Tech Stack](#-tech-stack)
11. [Folder Structure](#-folder-structure)
12. [Quick Start](#-quick-start)
13. [Environment Configuration](#-environment-configuration)
14. [Docker Setup](#-docker-setup)
15. [Security Architecture](#-security-architecture)
16. [Production Deployment](#-production-deployment)
17. [Project Timeline](#-project-timeline)
18. [API Documentation](#-api-documentation)
19. [Contributing](#-contributing)
20. [License](#-license)

---

## 🌍 Project Overview

### The Healthcare Challenge

In Algeria, Tunisia, and across the Arab Maghreb region, post-hospitalization care faces critical challenges:

- **Limited Hospital Capacity**: Overcrowded facilities necessitate early patient discharge
- **Geographical Barriers**: Remote areas lack access to specialized healthcare facilities
- **Fragmented Care**: Lack of continuity between hospitalization and home care
- **Reactive Healthcare**: Medical intervention occurs only after complications arise
- **Resource Constraints**: Shortage of healthcare professionals for routine follow-ups
- **Data Loss**: Patient health records scattered across paper files and disconnected systems

These challenges result in preventable complications, emergency readmissions, and increased healthcare costs.

<div align="center">
  <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80" alt="Healthcare Challenge" width="700"/>
  <p><em>Modern healthcare requires innovative solutions for post-hospitalization monitoring</em></p>
</div>

### Our Solution

**MediFollow** is a comprehensive digital platform that bridges the gap between hospital discharge and complete recovery. The system enables:

- **Remote Vital Monitoring**: Patients record vital signs (blood pressure, heart rate, temperature, oxygen saturation) from home
- **Intelligent Alert System**: Automated detection of abnormal values triggers immediate notifications to healthcare providers
- **Centralized Data Management**: Unified dashboard for healthcare professionals to monitor multiple patients efficiently
- **Proactive Intervention**: Early detection of complications enables preventive care
- **Complete Audit Trail**: Blockchain-backed immutable record of all medical data and actions
- **Role-Based Access Control**: Secure, granular access to sensitive medical information

<div align="center">
  <img src="https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&q=80" alt="Remote Patient Monitoring" width="700"/>
  <p><em>Remote patient monitoring enables continuous care from home</em></p>
</div>

### Value Proposition for the Arab Maghreb Region

MediFollow addresses the specific healthcare needs of Algeria, Tunisia, and the broader Maghreb region:

✅ **Reduces Hospital Burden**: Enables safe early discharge by ensuring continuous monitoring  
✅ **Extends Healthcare Reach**: Bridges urban-rural healthcare divide through remote monitoring  
✅ **Improves Patient Outcomes**: Proactive intervention reduces complications and readmissions  
✅ **Optimizes Resources**: Healthcare professionals monitor multiple patients efficiently  
✅ **Ensures Data Integrity**: Blockchain-based audit trail meets regulatory requirements  
✅ **Empowers Patients**: Active participation in recovery process improves adherence

### Why Blockchain?

Medical data integrity and audit trails are critical for:

- **Regulatory Compliance**: Healthcare regulations require tamper-proof audit logs
- **Legal Protection**: Immutable records protect against liability disputes
- **Data Integrity**: Cryptographic proof prevents unauthorized data modification
- **Trust**: Patients and institutions gain confidence in system reliability
- **Interoperability**: Blockchain enables secure data sharing between healthcare institutions

**Aptos Blockchain** was selected for:

- **High Throughput**: Up to 160,000 transactions per second
- **Low Latency**: Sub-second finality for critical health alerts
- **Parallel Execution**: Move language enables safe concurrent transactions
- **Cost Efficiency**: Affordable transaction fees for healthcare applications
- **Modern Architecture**: Purpose-built for Web3 applications with developer-friendly tools

<div align="center">
  <img src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80" alt="Blockchain Technology" width="700"/>
  <p><em>Aptos blockchain ensures data integrity and immutable audit trails</em></p>
</div>

---

## 📐 UML Diagrams

### Use Case Diagram

This diagram illustrates the main actors and their interactions with the MediFollow system:

```mermaid
graph TB
    subgraph "MediFollow System"
        UC1[Record Vital Signs]
        UC2[View Health Dashboard]
        UC3[Report Symptoms]
        UC4[Manage Profile]
        UC5[Monitor Patients]
        UC6[View Alerts]
        UC7[Acknowledge Alerts]
        UC8[Validate Alerts]
        UC9[Generate Reports]
        UC10[Manage Users]
        UC11[Configure System]
        UC12[View Audit Logs]
        UC13[Manage Thresholds]
        UC14[Send Notifications]
        UC15[Store Blockchain Proof]
    end

    Patient([👤 Patient])
    Doctor([👨‍⚕️ Doctor])
    Admin([👨‍💼 Administrator])
    System([🤖 System])
    Blockchain([⛓️ Blockchain])

    Patient --> UC1
    Patient --> UC2
    Patient --> UC3
    Patient --> UC4

    Doctor --> UC5
    Doctor --> UC6
    Doctor --> UC7
    Doctor --> UC8
    Doctor --> UC9
    Doctor --> UC13

    Admin --> UC10
    Admin --> UC11
    Admin --> UC12
    Admin --> UC9

    UC1 -.-> System
    System -.-> UC6
    System -.-> UC14
    System -.-> UC15
    UC15 -.-> Blockchain

    style Patient fill:#e1f5ff
    style Doctor fill:#e1f5ff
    style Admin fill:#e1f5ff
    style System fill:#ffd700
    style Blockchain fill:#00d4aa
```

**Use Cases Description:**

| Actor             | Use Cases              | Description                                                       |
| ----------------- | ---------------------- | ----------------------------------------------------------------- |
| **Patient**       | Record Vital Signs     | Submit daily vital parameters (BP, heart rate, temperature, etc.) |
|                   | View Health Dashboard  | Visualize personal health trends and history                      |
|                   | Report Symptoms        | Log symptoms and medication side effects                          |
|                   | Manage Profile         | Update personal and emergency contact information                 |
| **Doctor**        | Monitor Patients       | View real-time status of all assigned patients                    |
|                   | View Alerts            | Access critical patient alerts requiring attention                |
|                   | Acknowledge Alerts     | Confirm receipt and review of alert notifications                 |
|                   | Validate Alerts        | Assess and resolve patient health alerts                          |
|                   | Generate Reports       | Create medical reports and analytics                              |
|                   | Manage Thresholds      | Configure patient-specific vital sign thresholds                  |
| **Administrator** | Manage Users           | Create, update, and deactivate user accounts                      |
|                   | Configure System       | Set system-wide parameters and alert rules                        |
|                   | View Audit Logs        | Access complete system activity history                           |
|                   | Generate Reports       | Create system usage and performance reports                       |
| **System**        | Send Notifications     | Automated email/SMS alerts for critical events                    |
|                   | Store Blockchain Proof | Save cryptographic audit trail to Aptos blockchain                |

---

### Class Diagram

Core domain model showing the main entities and their relationships:

```mermaid
classDiagram
    class User {
        -ObjectId _id
        -string email
        -string passwordHash
        -string firstName
        -string lastName
        -Role role
        -string phoneNumber
        -boolean isActive
        -Date lastLogin
        +authenticate()
        +hashPassword()
        +generateToken()
        +hasPermission()
    }

    class Patient {
        -ObjectId _id
        -ObjectId userId
        -string medicalRecordNumber
        -Date dateOfBirth
        -string gender
        -string bloodType
        -Address address
        -Date dischargeDate
        -string diagnosis
        -Medication[] medications
        -VitalThresholds thresholds
        +getAge()
        +isVitalInRange()
        +updateThresholds()
    }

    class VitalRecord {
        -ObjectId _id
        -ObjectId patientId
        -number systolicBP
        -number diastolicBP
        -number heartRate
        -number temperature
        -number oxygenSaturation
        -Date recordedAt
        -string blockchainTxHash
        +checkThresholds()
        +calculateRisk()
        +storeOnBlockchain()
    }

    class Alert {
        -ObjectId _id
        -ObjectId patientId
        -AlertType type
        -Severity severity
        -string message
        -AlertStatus status
        -ObjectId acknowledgedBy
        -Date acknowledgedAt
        +acknowledge()
        +resolve()
        +escalate()
        +sendNotification()
    }

    class AuditLog {
        -ObjectId _id
        -ObjectId userId
        -string action
        -string entityType
        -ObjectId entityId
        -object changes
        -string blockchainTxHash
        -Date timestamp
        +logAction()
        +verifyIntegrity()
    }

    class Service {
        -ObjectId _id
        -string serviceName
        -string description
        -number consultationFee
        -number averageDuration
        -boolean isActive
        +calculateCost()
        +checkAvailability()
    }

    class Questionnaire {
        -ObjectId _id
        -ObjectId patientId
        -string type
        -object responses
        -number overallScore
        -Date completedAt
        +calculateScore()
        +generateReport()
    }

    class BlockchainProof {
        -ObjectId _id
        -string dataHash
        -string txHash
        -string network
        -number blockNumber
        -Date timestamp
        +verify()
        +getBlockDetails()
    }

    class NotificationService {
        <<service>>
        +sendEmail()
        +sendSMS()
        +sendInApp()
    }

    class BlockchainService {
        <<service>>
        +storeHash()
        +verifyHash()
        +getTransaction()
    }

    User "1" --> "0..1" Patient : has
    Patient "1" --> "*" VitalRecord : records
    Patient "1" --> "*" Alert : triggers
    Patient "1" --> "*" Questionnaire : completes
    User "1" --> "*" AuditLog : creates
    Alert "1" --> "1" Patient : belongs to
    Alert "*" --> "1" User : acknowledged by
    VitalRecord "1" --> "0..1" BlockchainProof : backed by
    AuditLog "1" --> "0..1" BlockchainProof : backed by
    Alert ..> NotificationService : uses
    VitalRecord ..> BlockchainService : uses
    AuditLog ..> BlockchainService : uses
```

**Design Patterns Applied:**

- **Repository Pattern**: Data access layer abstraction (Mongoose models)
- **Service Layer Pattern**: Business logic separation (services)
- **Observer Pattern**: Alert system with notification subscribers
- **Strategy Pattern**: Multiple notification channels (email, SMS, in-app)
- **Factory Pattern**: User and patient creation with role-specific initialization

---

### Activity Diagram

Workflow for vital signs recording and alert generation:

```mermaid
stateDiagram-v2
    [*] --> PatientLogin
    PatientLogin --> Dashboard
    Dashboard --> SelectRecordVitals

    SelectRecordVitals --> EnterVitalData
    EnterVitalData --> ValidateInput

    ValidateInput --> CheckValidation : Valid
    ValidateInput --> ShowError : Invalid
    ShowError --> EnterVitalData

    CheckValidation --> SaveToDatabase
    SaveToDatabase --> CheckThresholds

    CheckThresholds --> WithinRange : Normal
    CheckThresholds --> OutOfRange : Abnormal

    WithinRange --> GenerateHash
    OutOfRange --> CreateAlert

    CreateAlert --> DetermineSeverity
    DetermineSeverity --> SaveAlert
    SaveAlert --> NotifyDoctor

    NotifyDoctor --> SendEmail : High/Critical
    NotifyDoctor --> SendSMS : Critical Only
    NotifyDoctor --> InAppNotification : All Levels

    SendEmail --> GenerateHash
    SendSMS --> GenerateHash
    InAppNotification --> GenerateHash

    GenerateHash --> StoreOnBlockchain
    StoreOnBlockchain --> UpdateRecord
    UpdateRecord --> ShowSuccess
    ShowSuccess --> Dashboard
    Dashboard --> [*]

    note right of CheckThresholds
        Compare against
        patient-specific
        threshold configuration
    end note

    note right of DetermineSeverity
        Low: 5-10% deviation
        Medium: 10-20% deviation
        High: 20%+ deviation
        Critical: Multiple params
    end note
```

**Activity Flow Description:**

1. **Patient Authentication**: Secure login with JWT token
2. **Data Entry**: User-friendly form with input validation
3. **Validation**: Client-side and server-side data validation
4. **Threshold Check**: Automated comparison against personalized thresholds
5. **Alert Generation**: Intelligent alert creation for abnormal values
6. **Severity Assessment**: Risk-based severity level calculation
7. **Multi-Channel Notification**: Email, SMS, and in-app notifications
8. **Blockchain Recording**: Immutable audit trail on Aptos blockchain
9. **Confirmation**: User feedback and dashboard update

---

### Component Diagram

High-level architecture showing system components and their interactions:

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[React Components]
        Pages[Next.js Pages]
        Forms[Form Management]
        Charts[Data Visualization]
    end

    subgraph "Application Layer"
        API[API Routes]
        ServerActions[Server Actions]
        Middleware[Middleware Chain]
        Auth[Auth Module]
    end

    subgraph "Business Logic Layer"
        PatientService[Patient Service]
        VitalService[Vital Service]
        AlertService[Alert Service]
        AuditService[Audit Service]
        NotificationService[Notification Service]
    end

    subgraph "Data Access Layer"
        UserRepo[User Repository]
        PatientRepo[Patient Repository]
        VitalRepo[Vital Repository]
        AlertRepo[Alert Repository]
        AuditRepo[Audit Repository]
    end

    subgraph "External Services"
        MongoDB[(MongoDB)]
        Redis[(Redis Cache)]
        SMTP[Email Service]
        SMS[SMS Gateway]
        Aptos[Aptos Blockchain]
    end

    subgraph "Infrastructure"
        Docker[Docker Containers]
        Network[Private Network]
        Volumes[Persistent Volumes]
    end

    UI --> Pages
    Pages --> Forms
    Pages --> Charts
    Pages --> API

    API --> Middleware
    Middleware --> Auth
    API --> ServerActions

    ServerActions --> PatientService
    ServerActions --> VitalService
    ServerActions --> AlertService
    ServerActions --> AuditService

    PatientService --> PatientRepo
    VitalService --> VitalRepo
    VitalService --> AlertService
    AlertService --> AlertRepo
    AlertService --> NotificationService
    AuditService --> AuditRepo

    PatientRepo --> MongoDB
    VitalRepo --> MongoDB
    AlertRepo --> MongoDB
    AuditRepo --> MongoDB

    Auth --> Redis
    NotificationService --> SMTP
    NotificationService --> SMS
    VitalService --> Aptos
    AuditService --> Aptos

    MongoDB -.-> Docker
    Redis -.-> Docker
    API -.-> Docker
    Docker -.-> Network
    Docker -.-> Volumes

    style UI fill:#61dafb
    style API fill:#0070f3
    style MongoDB fill:#00ed64
    style Redis fill:#dc382d
    style Aptos fill:#00d4aa
    style Docker fill:#2496ed
```

**Component Responsibilities:**

| Layer              | Components                 | Responsibilities                                |
| ------------------ | -------------------------- | ----------------------------------------------- |
| **Frontend**       | React Components, Pages    | User interface, routing, state management       |
| **Application**    | API Routes, Middleware     | Request handling, authentication, authorization |
| **Business Logic** | Services                   | Core business rules, validation, orchestration  |
| **Data Access**    | Repositories               | Database operations, query optimization         |
| **External**       | MongoDB, Redis, Blockchain | Data persistence, caching, audit storage        |
| **Infrastructure** | Docker, Network            | Containerization, isolation, deployment         |

**Communication Patterns:**

- **Synchronous**: REST API calls between frontend and backend
- **Asynchronous**: Blockchain transactions, notification dispatch
- **Event-Driven**: Alert system with real-time notifications
- **Caching**: Redis layer for session and frequently accessed data

---

## 🏗 System Architecture

MediFollow follows a modern full-stack architecture with blockchain integration:

```mermaid
graph TB
    subgraph "Client Layer"
        Patient[👤 Patient Interface]
        Doctor[👨‍⚕️ Doctor Dashboard]
        Admin[👨‍💼 Admin Panel]
    end

    subgraph "Next.js Application Layer"
        NextJS[Next.js Frontend<br/>App Router + TypeScript]
        API[API Routes<br/>REST + Server Actions]
        Auth[Auth Middleware<br/>JWT + RBAC]
    end

    subgraph "Data Layer"
        MongoDB[(MongoDB<br/>Patient Data + Alerts)]
        Cache[Redis Cache<br/>Session Storage]
    end

    subgraph "Blockchain Layer"
        Aptos[Aptos Blockchain<br/>Audit Proof Storage]
        Contract[Move Smart Contract<br/>Data Hash Registry]
    end

    subgraph "External Services"
        Email[Email Service<br/>SMTP/SendGrid]
        SMS[SMS Gateway<br/>Alert Notifications]
    end

    Patient -->|HTTPS| NextJS
    Doctor -->|HTTPS| NextJS
    Admin -->|HTTPS| NextJS

    NextJS --> Auth
    Auth --> API

    API -->|Mongoose ORM| MongoDB
    API -->|Cache Layer| Cache
    API -->|Hash Storage| Aptos
    API -->|Notifications| Email
    API -->|Critical Alerts| SMS

    Aptos --> Contract
    Contract -.->|Verification| API

    style Patient fill:#e1f5ff
    style Doctor fill:#e1f5ff
    style Admin fill:#e1f5ff
    style NextJS fill:#000000,color:#fff
    style API fill:#0070f3,color:#fff
    style MongoDB fill:#00ed64,color:#000
    style Aptos fill:#00d4aa,color:#fff
    style Contract fill:#00d4aa,color:#fff
```

**Architecture Highlights:**

- **Monolithic Next.js**: Frontend and backend unified in single deployable unit
- **API Routes**: RESTful endpoints with TypeScript type safety
- **Server Components**: Optimized rendering with React Server Components
- **Middleware Chain**: Authentication → Authorization → Rate Limiting → Logging
- **Blockchain Layer**: Asynchronous audit proof submission (non-blocking)
- **Caching Strategy**: Redis for session management and API response caching

---

## 🐳 Docker Deployment Architecture

MediFollow uses Docker Compose for consistent, reproducible deployments:

```mermaid
graph TB
    subgraph "Docker Host"
        subgraph "Docker Network: medifollow-network"
            WebContainer[Web Container<br/>medifollow-web<br/>Port: 3000]
            MongoContainer[MongoDB Container<br/>medifollow-db<br/>Port: 27017]
            RedisContainer[Redis Container<br/>medifollow-cache<br/>Port: 6379]
        end

        subgraph "Volumes"
            MongoVolume[(mongo-data<br/>Persistent Storage)]
            RedisVolume[(redis-data<br/>Cache Storage)]
        end

        subgraph "Environment"
            EnvFile[.env.production<br/>Configuration]
        end
    end

    subgraph "External Access"
        Client[Client Browser]
        Blockchain[Aptos Network]
    end

    Client -->|HTTP/HTTPS :3000| WebContainer
    WebContainer -->|MongoDB Protocol| MongoContainer
    WebContainer -->|Redis Protocol| RedisContainer
    WebContainer -->|HTTPS| Blockchain

    MongoContainer -.->|Persist| MongoVolume
    RedisContainer -.->|Persist| RedisVolume

    EnvFile -.->|Inject| WebContainer
    EnvFile -.->|Inject| MongoContainer

    style WebContainer fill:#0070f3,color:#fff
    style MongoContainer fill:#00ed64,color:#000
    style RedisContainer fill:#dc382d,color:#fff
    style MongoVolume fill:#ffa500
    style RedisVolume fill:#ffa500
```

**Deployment Configuration:**

- **Web Service**: Node.js 20 Alpine image, multi-stage build for optimization
- **MongoDB Service**: Official MongoDB 7.0 image with authentication enabled
- **Redis Service**: Official Redis 7 Alpine image for caching layer
- **Network Isolation**: Private Docker network prevents external database access
- **Volume Persistence**: Named volumes ensure data survives container restarts
- **Health Checks**: Automatic container health monitoring and restart policies
- **Resource Limits**: CPU and memory constraints for production stability

---

## 📊 Database Schema

MediFollow uses MongoDB for flexible, scalable data storage:

```mermaid
erDiagram
    USERS ||--o{ PATIENTS : "manages"
    USERS ||--o{ AUDIT_LOGS : "creates"
    USERS {
        ObjectId _id PK
        string email UK
        string passwordHash
        string firstName
        string lastName
        enum role "admin|doctor|patient"
        string phoneNumber
        boolean isActive
        Date lastLogin
        Date createdAt
        Date updatedAt
    }

    PATIENTS ||--o{ VITAL_RECORDS : "has"
    PATIENTS ||--o{ SYMPTOMS : "reports"
    PATIENTS ||--o{ ALERTS : "triggers"
    PATIENTS ||--o{ QUESTIONNAIRES : "completes"
    PATIENTS {
        ObjectId _id PK
        ObjectId userId FK
        string medicalRecordNumber UK
        Date dateOfBirth
        string gender
        string bloodType
        object address
        string emergencyContact
        Date dischargeDate
        string diagnosis
        array medications
        object vitalThresholds
        boolean isActive
        Date createdAt
        Date updatedAt
    }

    VITAL_RECORDS ||--|| BLOCKCHAIN_PROOF : "backed_by"
    VITAL_RECORDS {
        ObjectId _id PK
        ObjectId patientId FK
        number systolicBP
        number diastolicBP
        number heartRate
        number temperature
        number oxygenSaturation
        number weight
        string notes
        Date recordedAt
        string blockchainTxHash
        Date createdAt
    }

    SYMPTOMS {
        ObjectId _id PK
        ObjectId patientId FK
        string symptomType
        enum severity "mild|moderate|severe"
        string description
        Date occurredAt
        Date createdAt
    }

    ALERTS ||--o{ AUDIT_LOGS : "logged_in"
    ALERTS {
        ObjectId _id PK
        ObjectId patientId FK
        ObjectId triggeredBy FK
        enum alertType "vital|symptom|medication"
        enum severity "low|medium|high|critical"
        string message
        object data
        enum status "open|acknowledged|resolved|closed"
        ObjectId acknowledgedBy FK
        Date acknowledgedAt
        ObjectId resolvedBy FK
        Date resolvedAt
        string resolution
        Date createdAt
        Date updatedAt
    }

    SERVICES {
        ObjectId _id PK
        string serviceName UK
        string description
        number consultationFee
        number averageDuration
        boolean isActive
        array specializations
        Date createdAt
        Date updatedAt
    }

    QUESTIONNAIRES {
        ObjectId _id PK
        ObjectId patientId FK
        string questionnaireType
        object responses
        number overallScore
        Date completedAt
        Date createdAt
    }

    AUDIT_LOGS ||--|| BLOCKCHAIN_PROOF : "backed_by"
    AUDIT_LOGS {
        ObjectId _id PK
        ObjectId userId FK
        string action
        string entityType
        ObjectId entityId
        object changes
        string ipAddress
        string userAgent
        string blockchainTxHash
        Date timestamp
    }

    BLOCKCHAIN_PROOF {
        ObjectId _id PK
        string dataHash
        string txHash UK
        string blockchainNetwork
        number blockNumber
        Date timestamp
        string status
    }
```

**Schema Design Principles:**

- **Embedded Documents**: Frequently accessed related data embedded (e.g., address in patient)
- **Referential Integrity**: ObjectId references with Mongoose populate for relationships
- **Indexed Fields**: Unique indexes on email, medicalRecordNumber, txHash for fast lookups
- **Soft Deletes**: isActive flag preserves data for audit compliance
- **Timestamp Tracking**: Automatic createdAt/updatedAt via Mongoose timestamps
- **Flexible Schema**: MongoDB allows schema evolution without migrations

---

## 🔐 RBAC Permission Flow

MediFollow implements fine-grained role-based access control:

```mermaid
sequenceDiagram
    actor User
    participant Client
    participant Middleware
    participant JWT
    participant RBAC
    participant API
    participant DB

    User->>Client: Request Protected Resource
    Client->>Middleware: HTTP Request + JWT Cookie

    alt No Token
        Middleware-->>Client: 401 Unauthorized
        Client-->>User: Redirect to Login
    end

    Middleware->>JWT: Verify Token Signature

    alt Invalid/Expired Token
        JWT-->>Middleware: Verification Failed
        Middleware-->>Client: 401 Unauthorized
        Client-->>User: Session Expired
    end

    JWT->>JWT: Extract User Payload
    JWT->>Middleware: Return {userId, role, permissions}

    Middleware->>RBAC: Check Role Permissions
    RBAC->>RBAC: Match Route to Required Permission

    alt Insufficient Permissions
        RBAC-->>Middleware: Access Denied
        Middleware-->>Client: 403 Forbidden
        Client-->>User: Access Denied Message
    end

    RBAC-->>Middleware: Permission Granted
    Middleware->>API: Forward Request with User Context
    API->>DB: Execute Query with User Scope
    DB-->>API: Return Data
    API-->>Client: 200 OK + Response Data
    Client-->>User: Display Resource
```

**Role Definitions:**

| Role        | Permissions                                                                   | Access Level      |
| ----------- | ----------------------------------------------------------------------------- | ----------------- |
| **Patient** | View own records, submit vitals, view own alerts                              | Self-only         |
| **Doctor**  | View assigned patients, create alerts, update patient status, validate alerts | Assigned patients |
| **Admin**   | Full system access, user management, system configuration, reports            | System-wide       |

**Middleware Implementation:**

```typescript
// Middleware checks executed on every API request
1. Authentication: Verify JWT token validity
2. Authorization: Match user role to route permissions
3. Rate Limiting: Prevent API abuse (100 req/min per user)
4. Audit Logging: Record all sensitive operations
5. Data Filtering: Return only user-authorized data
```

---

## 🚨 Alert System Workflow

Intelligent automated alert generation based on configurable thresholds:

```mermaid
sequenceDiagram
    actor Patient
    participant WebApp
    participant API
    participant ValidationService
    participant ThresholdEngine
    participant AlertService
    participant NotificationService
    participant DB
    participant Doctor

    Patient->>WebApp: Submit Vital Signs Data
    WebApp->>API: POST /api/vitals
    API->>ValidationService: Validate Input Data

    alt Invalid Data
        ValidationService-->>API: Validation Error
        API-->>WebApp: 400 Bad Request
        WebApp-->>Patient: Show Error Message
    end

    ValidationService-->>API: Data Valid
    API->>DB: Save Vital Record
    DB-->>API: Record Saved

    API->>ThresholdEngine: Check Against Patient Thresholds
    ThresholdEngine->>DB: Fetch Patient Threshold Config
    DB-->>ThresholdEngine: Return Thresholds
    ThresholdEngine->>ThresholdEngine: Compare Values

    alt Within Normal Range
        ThresholdEngine-->>API: No Alert Needed
        API-->>WebApp: 201 Created
        WebApp-->>Patient: Success Message
    end

    alt Threshold Exceeded
        ThresholdEngine->>ThresholdEngine: Calculate Severity Level
        ThresholdEngine->>AlertService: Create Alert
        AlertService->>DB: Save Alert Record
        DB-->>AlertService: Alert Created

        AlertService->>NotificationService: Send Notification

        par Notification Channels
            NotificationService->>Doctor: Email Notification
            NotificationService->>Doctor: SMS Alert (Critical Only)
            NotificationService->>Doctor: In-App Notification
        end

        NotificationService-->>AlertService: Notifications Sent
        AlertService-->>API: Alert Created Successfully
        API-->>WebApp: 201 Created + Alert Info
        WebApp-->>Patient: Warning Message
    end

    Doctor->>WebApp: View Alert Dashboard
    WebApp->>API: GET /api/alerts
    API->>DB: Fetch Open Alerts
    DB-->>API: Return Alerts
    API-->>WebApp: Alert List
    WebApp-->>Doctor: Display Alerts

    Doctor->>WebApp: Acknowledge/Resolve Alert
    WebApp->>API: PATCH /api/alerts/:id
    API->>DB: Update Alert Status
    DB-->>API: Updated
    API-->>WebApp: 200 OK
    WebApp-->>Doctor: Confirmation
```

**Threshold Configuration:**

```typescript
// Patient-specific thresholds (configurable by doctors)
{
  systolicBP: { min: 90, max: 140 },
  diastolicBP: { min: 60, max: 90 },
  heartRate: { min: 60, max: 100 },
  temperature: { min: 36.1, max: 37.5 },
  oxygenSaturation: { min: 95, max: 100 }
}
```

**Severity Levels:**

- **Low**: Single parameter slightly outside range (5-10%)
- **Medium**: Parameter moderately outside range (10-20%)
- **High**: Parameter significantly outside range (>20%)
- **Critical**: Multiple parameters outside range OR life-threatening single value

---

## ⛓ Blockchain Integration

MediFollow uses Aptos blockchain for immutable audit trails:

```mermaid
sequenceDiagram
    participant API
    participant HashService
    participant AptosSDK
    participant AptosNode
    participant SmartContract
    participant DB

    Note over API: Critical Data Event<br/>(Vital Record Saved)

    API->>HashService: Generate Data Hash
    HashService->>HashService: SHA-256(data + timestamp + userId)
    HashService-->>API: Return Hash

    API->>AptosSDK: Submit Hash to Blockchain
    AptosSDK->>AptosSDK: Create Transaction Payload
    AptosSDK->>AptosSDK: Sign with Private Key

    AptosSDK->>AptosNode: Submit Transaction
    AptosNode->>AptosNode: Validate Transaction
    AptosNode->>SmartContract: Execute store_audit_hash()

    SmartContract->>SmartContract: Verify Hash Format
    SmartContract->>SmartContract: Store in AuditRegistry
    SmartContract->>SmartContract: Emit HashStored Event

    SmartContract-->>AptosNode: Execution Success
    AptosNode->>AptosNode: Include in Block
    AptosNode-->>AptosSDK: Transaction Hash + Status

    AptosSDK-->>API: Return TX Hash
    API->>DB: Update Record with TX Hash
    DB-->>API: Updated

    Note over API,DB: Async Process<br/>Non-blocking for User

    opt Verification Request
        API->>AptosSDK: Verify Hash
        AptosSDK->>AptosNode: Query SmartContract
        SmartContract-->>AptosSDK: Return Stored Hash + Timestamp
        AptosSDK->>AptosSDK: Compare Hashes
        AptosSDK-->>API: Verification Result
    end
```

**Smart Contract (Move Language):**

```move
module medifollow::audit_registry {
    use std::string::String;
    use std::signer;
    use aptos_framework::event;
    use aptos_framework::timestamp;

    struct AuditRegistry has key {
        hashes: vector<AuditEntry>,
        hash_stored_events: event::EventHandle<HashStoredEvent>,
    }

    struct AuditEntry has store, drop, copy {
        data_hash: String,
        timestamp: u64,
        entity_type: String,
    }

    struct HashStoredEvent has drop, store {
        data_hash: String,
        timestamp: u64,
    }

    public entry fun store_audit_hash(
        account: &signer,
        data_hash: String,
        entity_type: String,
    ) acquires AuditRegistry {
        let registry = borrow_global_mut<AuditRegistry>(signer::address_of(account));
        let entry = AuditEntry {
            data_hash,
            timestamp: timestamp::now_seconds(),
            entity_type,
        };
        vector::push_back(&mut registry.hashes, entry);
        event::emit_event(&mut registry.hash_stored_events, HashStoredEvent {
            data_hash,
            timestamp: timestamp::now_seconds(),
        });
    }
}
```

**Blockchain Integration Benefits:**

✅ **Immutability**: Data hashes cannot be altered once stored  
✅ **Timestamp Proof**: Cryptographic proof of when data was created  
✅ **Audit Trail**: Complete history of all medical record modifications  
✅ **Compliance**: Meets regulatory requirements for data integrity  
✅ **Non-Repudiation**: Actions cannot be denied by users

---

## ✨ Key Features

### For Patients

<div align="center">
  <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80" alt="Patient Care" width="700"/>
  <p><em>Empowering patients with easy-to-use health monitoring tools</em></p>
</div>

- 📊 **Vital Sign Recording**: Easy-to-use interface for daily vital measurements
- 📱 **Mobile-Responsive Design**: Record data from any device
- 🔔 **Smart Notifications**: Receive alerts when values need attention
- 📈 **Personal Health Dashboard**: Visualize health trends with interactive charts
- 📝 **Symptom Reporting**: Document symptoms and medication side effects
- 🏥 **Medication Tracker**: Reminders and adherence monitoring

### For Healthcare Professionals

<div align="center">
  <img src="https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=800&q=80" alt="Doctor Dashboard" width="700"/>
  <p><em>Comprehensive dashboards for healthcare professionals</em></p>
</div>

- 👥 **Multi-Patient Dashboard**: Monitor all assigned patients from single interface
- 🚨 **Real-Time Alerts**: Immediate notification of critical values
- 📊 **Advanced Analytics**: Trend analysis and predictive insights
- 📋 **Patient Management**: Comprehensive patient profiles with full history
- ✅ **Alert Validation**: Review, acknowledge, and resolve patient alerts
- 📄 **Report Generation**: Export patient data for medical records

### For Administrators

<div align="center">
  <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80" alt="Admin Dashboard" width="700"/>
  <p><em>Powerful administrative tools for system management</em></p>
</div>

- 👤 **User Management**: Create and manage user accounts and permissions
- ⚙️ **System Configuration**: Configure thresholds, alert rules, and workflows
- 📊 **Analytics Dashboard**: System usage statistics and performance metrics
- 🔒 **Audit Logs**: Complete system activity tracking with blockchain verification
- 🏥 **Service Management**: Configure available medical services and pricing
- 📈 **Performance Monitoring**: System health and response time tracking

---

## 🛠 Tech Stack

### Frontend

<div align="center">
  <img src="https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80" alt="Modern Tech Stack" width="700"/>
  <p><em>Built with cutting-edge technologies for performance and scalability</em></p>
</div>

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.0
- **Styling**: TailwindCSS 3.4 + HeadlessUI
- **Charts**: Chart.js / Recharts
- **Forms**: React Hook Form + Zod validation
- **State Management**: React Context + SWR for data fetching
- **UI Components**: Custom component library with Radix UI primitives

### Backend

- **Runtime**: Node.js 20 LTS
- **API**: Next.js API Routes + Server Actions
- **Language**: TypeScript
- **Validation**: Zod schema validation
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Rate Limiting**: Custom middleware with Redis backend

### Database

- **Primary Database**: MongoDB 7.0
- **ODM**: Mongoose 8.0
- **Caching**: Redis 7.2
- **Connection Pooling**: MongoDB connection pool (100 connections)
- **Backup Strategy**: Automated daily backups with point-in-time recovery

### Blockchain

- **Network**: Aptos Mainnet / Testnet
- **Smart Contract Language**: Move
- **SDK**: @aptos-labs/ts-sdk
- **Wallet Integration**: Petra Wallet (optional for administrators)

### DevOps & Infrastructure

- **Containerization**: Docker 24+ / Docker Compose
- **Process Manager**: PM2 (production)
- **Logging**: Winston + Morgan
- **Monitoring**: Custom health check endpoints
- **CI/CD**: GitHub Actions (optional)
- **Reverse Proxy**: NGINX (production recommendation)

### Development Tools

- **Package Manager**: npm / yarn
- **Code Quality**: ESLint + Prettier
- **Git Hooks**: Husky + lint-staged
- **Testing**: Jest + React Testing Library (optional setup)

---

## 📁 Folder Structure

```
medifollow/
│
├── 📂 app/                          # Next.js App Router
│   ├── 📂 (auth)/                   # Authentication routes
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── 📂 (dashboard)/              # Protected dashboard routes
│   │   ├── patient/
│   │   │   ├── vitals/
│   │   │   ├── alerts/
│   │   │   └── profile/
│   │   ├── doctor/
│   │   │   ├── patients/
│   │   │   ├── alerts/
│   │   │   └── analytics/
│   │   ├── admin/
│   │   │   ├── users/
│   │   │   ├── system/
│   │   │   └── reports/
│   │   └── layout.tsx
│   ├── 📂 api/                      # API Routes
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── register/route.ts
│   │   │   └── logout/route.ts
│   │   ├── patients/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── vitals/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── alerts/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── blockchain/
│   │   │   ├── verify/route.ts
│   │   │   └── store/route.ts
│   │   └── health/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── 📂 components/                    # Reusable React components
│   ├── 📂 ui/                       # Base UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Table.tsx
│   ├── 📂 dashboard/                # Dashboard-specific components
│   │   ├── VitalChart.tsx
│   │   ├── AlertCard.tsx
│   │   ├── PatientList.tsx
│   │   └── StatsCard.tsx
│   ├── 📂 forms/                    # Form components
│   │   ├── VitalRecordForm.tsx
│   │   ├── PatientForm.tsx
│   │   └── LoginForm.tsx
│   └── 📂 layout/                   # Layout components
│       ├── Navbar.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
│
├── 📂 lib/                           # Core business logic
│   ├── 📂 db/                       # Database utilities
│   │   ├── mongodb.ts               # MongoDB connection
│   │   └── redis.ts                 # Redis client
│   ├── 📂 auth/                     # Authentication logic
│   │   ├── jwt.ts                   # JWT utilities
│   │   ├── bcrypt.ts                # Password hashing
│   │   └── session.ts               # Session management
│   ├── 📂 services/                 # Business logic services
│   │   ├── patientService.ts
│   │   ├── vitalService.ts
│   │   ├── alertService.ts
│   │   └── auditService.ts
│   ├── 📂 utils/                    # Helper functions
│   │   ├── validation.ts
│   │   ├── dateUtils.ts
│   │   └── constants.ts
│   └── 📂 types/                    # TypeScript type definitions
│       ├── user.types.ts
│       ├── patient.types.ts
│       └── api.types.ts
│
├── 📂 models/                        # Mongoose models
│   ├── User.ts
│   ├── Patient.ts
│   ├── VitalRecord.ts
│   ├── Symptom.ts
│   ├── Alert.ts
│   ├── AuditLog.ts
│   ├── Service.ts
│   ├── Questionnaire.ts
│   └── BlockchainProof.ts
│
├── 📂 middleware/                    # Next.js middleware
│   ├── auth.middleware.ts           # Authentication check
│   ├── rbac.middleware.ts           # Role-based access control
│   ├── rateLimit.middleware.ts      # API rate limiting
│   └── logger.middleware.ts         # Request logging
│
├── 📂 blockchain/                    # Blockchain integration
│   ├── 📂 contracts/                # Move smart contracts
│   │   ├── AuditRegistry.move
│   │   └── Move.toml
│   ├── 📂 sdk/                      # Blockchain SDK wrapper
│   │   ├── aptosClient.ts
│   │   ├── hashService.ts
│   │   └── transactionBuilder.ts
│   └── config.ts                    # Blockchain configuration
│
├── 📂 public/                        # Static assets
│   ├── images/
│   ├── icons/
│   └── favicon.ico
│
├── 📂 docker/                        # Docker configuration
│   ├── Dockerfile.dev
│   ├── Dockerfile.prod
│   └── nginx.conf
│
├── 📂 scripts/                       # Utility scripts
│   ├── seed-db.ts                   # Database seeding
│   ├── deploy-contract.ts           # Deploy smart contract
│   └── backup-db.sh                 # Database backup
│
├── 📂 tests/                         # Test files (optional)
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.local                        # Local environment variables
├── .env.production                   # Production environment variables
├── .env.example                      # Environment template
├── .gitignore
├── .dockerignore
├── docker-compose.yml                # Docker Compose configuration
├── docker-compose.prod.yml           # Production Docker Compose
├── next.config.js                    # Next.js configuration
├── tsconfig.json                     # TypeScript configuration
├── tailwind.config.ts                # TailwindCSS configuration
├── package.json
├── package-lock.json
└── README.md                         # This file
```

---

## 🚀 Quick Start

<div align="center">
  <img src="https://images.unsplash.com/photo-1618401479427-c8ef9465fbe1?w=800&q=80" alt="Getting Started" width="700"/>
  <p><em>Get started with MediFollow in minutes</em></p>
</div>

### Prerequisites

Ensure you have the following installed:

- **Node.js**: 20.x or higher ([Download](https://nodejs.org/))
- **npm**: 10.x or higher (comes with Node.js)
- **Docker**: 24.x or higher ([Download](https://www.docker.com/))
- **Docker Compose**: 2.x or higher
- **Git**: For version control

### Local Development Setup

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/medifollow.git
cd medifollow
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration (see [Environment Configuration](#-environment-configuration))

4. **Start MongoDB and Redis locally** (or use Docker Compose)

```bash
# Option 1: Using Docker Compose (recommended)
docker-compose up -d mongodb redis

# Option 2: Install MongoDB and Redis locally
# Follow official installation guides
```

5. **Run database migrations/seed** (optional)

```bash
npm run seed
```

6. **Start development server**

```bash
npm run dev
```

7. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

**Default credentials** (if using seed data):

- **Admin**: admin@medifollow.dz / admin123
- **Doctor**: doctor@medifollow.dz / doctor123
- **Patient**: patient@medifollow.dz / patient123

---

## ⚙️ Environment Configuration

Create a `.env.local` file in the root directory:

```bash
# ==============================================
# APPLICATION CONFIGURATION
# ==============================================
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
PORT=3000

# ==============================================
# DATABASE CONFIGURATION
# ==============================================
# MongoDB Connection String
# Format: mongodb://username:password@host:port/database
MONGODB_URI=mongodb://medifollow_user:your_secure_password@localhost:27017/medifollow?authSource=admin

# MongoDB Options
MONGODB_DB_NAME=medifollow
MONGODB_MAX_POOL_SIZE=100

# Redis Configuration (for session & caching)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password
REDIS_TTL=3600

# ==============================================
# AUTHENTICATION & SECURITY
# ==============================================
# JWT Secret (use strong random string: openssl rand -base64 32)
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long_random_string

# JWT Expiration (in seconds or string: '1h', '7d', '30d')
JWT_EXPIRES_IN=7d

# Bcrypt Salt Rounds (10-12 recommended for production)
BCRYPT_SALT_ROUNDS=12

# Session Secret
SESSION_SECRET=your_session_secret_key

# ==============================================
# BLOCKCHAIN CONFIGURATION
# ==============================================
# Aptos Network Configuration
APTOS_NETWORK=testnet
# Options: devnet, testnet, mainnet

# Aptos Node URLs
APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com/v1
APTOS_FAUCET_URL=https://faucet.testnet.aptoslabs.com

# Aptos Account Private Key (HEX format without 0x prefix)
# Generate: aptos key generate --output-file key.json
APTOS_PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

# Aptos Account Address
APTOS_ACCOUNT_ADDRESS=0xYourAccountAddress

# Smart Contract Module Address
APTOS_MODULE_ADDRESS=0xYourModuleAddress

# ==============================================
# NOTIFICATION SERVICES
# ==============================================
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@medifollow.dz

# SendGrid (Alternative to SMTP)
# SENDGRID_API_KEY=SG.your_sendgrid_api_key

# SMS Gateway (for critical alerts)
SMS_PROVIDER=twilio
# Options: twilio, nexmo, africas-talking

# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+213xxxxxxxxx

# ==============================================
# LOGGING & MONITORING
# ==============================================
# Log Level: error, warn, info, debug
LOG_LEVEL=debug

# Enable request logging
ENABLE_REQUEST_LOGGING=true

# ==============================================
# RATE LIMITING
# ==============================================
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# ==============================================
# CORS CONFIGURATION
# ==============================================
CORS_ORIGIN=http://localhost:3000
# For production, use your domain: https://medifollow.dz

# ==============================================
# FILE UPLOAD CONFIGURATION
# ==============================================
MAX_FILE_SIZE=5242880
# 5MB in bytes

ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf

# ==============================================
# FEATURE FLAGS
# ==============================================
ENABLE_BLOCKCHAIN=true
ENABLE_SMS_ALERTS=false
ENABLE_EMAIL_ALERTS=true
ENABLE_ANALYTICS=true

# ==============================================
# PRODUCTION-SPECIFIC
# ==============================================
# (Only for production .env.production)
# NEXT_PUBLIC_API_URL=https://api.medifollow.dz
# DATABASE_SSL=true
# ENABLE_COMPRESSION=true
# TRUST_PROXY=true
```

### Environment Variables Explanation

| Variable            | Description                    | Required       | Default     |
| ------------------- | ------------------------------ | -------------- | ----------- |
| `MONGODB_URI`       | MongoDB connection string      | ✅ Yes         | -           |
| `JWT_SECRET`        | Secret key for JWT signing     | ✅ Yes         | -           |
| `APTOS_PRIVATE_KEY` | Blockchain account private key | ✅ Yes         | -           |
| `SMTP_HOST`         | Email server hostname          | ⚠️ Conditional | -           |
| `REDIS_URL`         | Redis connection URL           | ⚠️ Optional    | -           |
| `NODE_ENV`          | Environment mode               | ✅ Yes         | development |

**Security Notes:**

- Never commit `.env` files to version control
- Use strong, randomly generated secrets (minimum 32 characters)
- Rotate secrets regularly in production
- Use environment-specific variables (development/staging/production)

---

## 🐳 Docker Setup

### Development with Docker Compose

**File**: `docker-compose.yml`

```yaml
version: "3.9"

services:
  # MongoDB Database
  mongodb:
    image: mongo:7.0
    container_name: medifollow-mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: medifollow_admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
      MONGO_INITDB_DATABASE: medifollow
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
      - mongodb_config:/data/configdb
    networks:
      - medifollow-network
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: medifollow-redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - medifollow-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Next.js Web Application
  web:
    build:
      context: .
      dockerfile: docker/Dockerfile.dev
    container_name: medifollow-web
    restart: unless-stopped
    environment:
      - NODE_ENV=development
      - MONGODB_URI=mongodb://medifollow_admin:${MONGO_ROOT_PASSWORD}@mongodb:27017/medifollow?authSource=admin
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - APTOS_PRIVATE_KEY=${APTOS_PRIVATE_KEY}
      - APTOS_NODE_URL=${APTOS_NODE_URL}
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      mongodb:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - medifollow-network
    command: npm run dev

networks:
  medifollow-network:
    driver: bridge

volumes:
  mongodb_data:
    driver: local
  mongodb_config:
    driver: local
  redis_data:
    driver: local
```

**File**: `docker/Dockerfile.dev`

```dockerfile
# Development Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]
```

### Production Docker Setup

**File**: `docker-compose.prod.yml`

```yaml
version: "3.9"

services:
  mongodb:
    image: mongo:7.0
    container_name: medifollow-mongodb-prod
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_ROOT_USERNAME}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
      MONGO_INITDB_DATABASE: medifollow
    volumes:
      - mongodb_prod_data:/data/db
      - mongodb_prod_config:/data/configdb
    networks:
      - medifollow-prod-network
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: "2"
          memory: 2G

  redis:
    image: redis:7-alpine
    container_name: medifollow-redis-prod
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD} --maxmemory 512mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_prod_data:/data
    networks:
      - medifollow-prod-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: "1"
          memory: 512M

  web:
    build:
      context: .
      dockerfile: docker/Dockerfile.prod
    container_name: medifollow-web-prod
    restart: always
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://${MONGO_ROOT_USERNAME}:${MONGO_ROOT_PASSWORD}@mongodb:27017/medifollow?authSource=admin
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - APTOS_PRIVATE_KEY=${APTOS_PRIVATE_KEY}
      - APTOS_NODE_URL=${APTOS_NODE_URL}
      - APTOS_NETWORK=mainnet
    ports:
      - "3000:3000"
    depends_on:
      mongodb:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - medifollow-prod-network
    healthcheck:
      test:
        [
          "CMD",
          "wget",
          "--quiet",
          "--tries=1",
          "--spider",
          "http://localhost:3000/api/health",
        ]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          cpus: "2"
          memory: 2G
      replicas: 1

  # NGINX Reverse Proxy (Optional but recommended)
  nginx:
    image: nginx:alpine
    container_name: medifollow-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - web
    networks:
      - medifollow-prod-network

networks:
  medifollow-prod-network:
    driver: bridge

volumes:
  mongodb_prod_data:
  mongodb_prod_config:
  redis_prod_data:
```

**File**: `docker/Dockerfile.prod`

```dockerfile
# Multi-stage production Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY . .

# Build Next.js application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Change ownership to nextjs user
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Start application
CMD ["node", "server.js"]
```

### Docker Commands

```bash
# Development
docker-compose up -d                    # Start all services
docker-compose down                     # Stop all services
docker-compose logs -f web              # View web app logs
docker-compose exec mongodb mongosh     # Access MongoDB shell
docker-compose restart web              # Restart web service

# Production
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml ps

# Cleanup
docker-compose down -v                  # Remove volumes
docker system prune -a                  # Clean up unused images
```

---

## 🔒 Security Architecture

<div align="center">
  <img src="https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80" alt="Security Architecture" width="700"/>
  <p><em>Enterprise-grade security protecting sensitive medical data</em></p>
</div>

MediFollow implements multiple security layers:

### 1. Authentication Security

```typescript
// JWT Token Structure
{
  userId: string,
  email: string,
  role: 'admin' | 'doctor' | 'patient',
  iat: number,    // Issued at
  exp: number     // Expiration (7 days)
}
```

**Security Measures:**

- ✅ Tokens signed with HMAC-SHA256
- ✅ HTTP-only cookies prevent XSS attacks
- ✅ SameSite=Strict prevents CSRF attacks
- ✅ Short-lived tokens (7 days) limit exposure
- ✅ Secure flag enforced in production (HTTPS only)
- ✅ Token refresh mechanism for extended sessions

### 2. Password Security

- **Hashing Algorithm**: bcrypt with 12 salt rounds
- **Minimum Requirements**: 8 characters, 1 uppercase, 1 number, 1 special character
- **Password Reset**: Time-limited tokens (1 hour expiration)
- **Rate Limiting**: Max 5 failed login attempts per hour

### 3. API Security

```typescript
// Rate Limiting Configuration
{
  windowMs: 60000,           // 1 minute
  maxRequests: 100,          // per user
  skipSuccessfulRequests: false,
  keyGenerator: (req) => req.user.id  // Per-user limits
}
```

**API Protection:**

- ✅ Rate limiting prevents brute force attacks
- ✅ Input validation with Zod schemas
- ✅ SQL/NoSQL injection prevention (parameterized queries)
- ✅ XSS protection (sanitized inputs)
- ✅ CORS whitelist for allowed origins
- ✅ Helmet.js security headers

### 4. Data Security

**Encryption at Rest:**

- MongoDB encryption enabled (WiredTiger engine)
- TLS/SSL for database connections in production
- Encrypted backups with AES-256

**Encryption in Transit:**

- HTTPS/TLS 1.3 for all connections
- Certificate pinning for mobile apps (future)
- Secure WebSocket connections (WSS)

**Data Privacy:**

- GDPR-compliant data handling
- Patient data pseudonymization
- Right to be forgotten implementation
- Data retention policies (7 years medical records)
- Audit trail for all data access

### 5. Blockchain Security

- **Immutable Audit Trail**: All critical operations hashed and stored on-chain
- **Non-Repudiation**: Cryptographic proof of actions
- **Timestamp Verification**: Blockchain-backed timestamps
- **Smart Contract Audit**: Formally verified Move contracts

### 6. RBAC Security Matrix

| Resource              | Patient | Doctor        | Admin    |
| --------------------- | ------- | ------------- | -------- |
| Own Vitals (Read)     | ✅      | ❌            | ❌       |
| Own Vitals (Write)    | ✅      | ❌            | ❌       |
| Patient Vitals (Read) | ❌      | ✅ (assigned) | ✅ (all) |
| Alerts (Create)       | ❌      | ✅            | ✅       |
| Alerts (Resolve)      | ❌      | ✅ (assigned) | ✅ (all) |
| User Management       | ❌      | ❌            | ✅       |
| System Config         | ❌      | ❌            | ✅       |
| Audit Logs            | ❌      | ❌            | ✅       |

### 7. Compliance

- **HIPAA Alignment**: Technical safeguards implemented
- **GDPR Compliance**: Data protection and privacy rights
- **Maghreb Health Regulations**: Compliant with Algerian, Tunisian, and regional healthcare data laws
- **SOC 2 Readiness**: Security controls documented

---

## 🌐 Production Deployment

<div align="center">
  <img src="https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&q=80" alt="Cloud Deployment" width="700"/>
  <p><em>Production-ready deployment with Docker and cloud infrastructure</em></p>
</div>

### Deployment Checklist

- [ ] Environment variables configured in `.env.production`
- [ ] MongoDB replica set configured for high availability
- [ ] Redis persistence enabled
- [ ] SSL/TLS certificates installed
- [ ] NGINX reverse proxy configured
- [ ] Firewall rules configured
- [ ] Automated backup system enabled
- [ ] Monitoring and alerting configured
- [ ] Domain DNS configured
- [ ] CDN configured for static assets (optional)

### Deployment Steps

#### 1. Server Setup (Ubuntu 22.04 LTS)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin

# Create application directory
sudo mkdir -p /opt/medifollow
cd /opt/medifollow

# Clone repository
git clone https://github.com/yourusername/medifollow.git .
```

#### 2. Configure Environment

```bash
# Copy production environment template
cp .env.example .env.production

# Edit environment variables
nano .env.production

# Set secure passwords
MONGO_ROOT_PASSWORD=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)
```

#### 3. SSL Certificate Setup (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d medifollow.dz -d www.medifollow.dz

# Auto-renewal
sudo certbot renew --dry-run
```

#### 4. Build and Deploy

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

#### 5. NGINX Configuration

**File**: `docker/nginx.conf`

```nginx
events {
    worker_connections 1024;
}

http {
    upstream nextjs {
        server web:3000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

    server {
        listen 80;
        server_name medifollow.dz www.medifollow.dz;

        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name medifollow.dz www.medifollow.dz;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        # Security Headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # Gzip Compression
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

        # Proxy to Next.js
        location / {
            proxy_pass http://nextjs;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # API Rate Limiting
        location /api/ {
            limit_req zone=api_limit burst=20 nodelay;
            proxy_pass http://nextjs;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # Static file caching
        location /_next/static/ {
            proxy_pass http://nextjs;
            proxy_cache_valid 200 7d;
            add_header Cache-Control "public, max-age=604800, immutable";
        }
    }
}
```

### Monitoring and Maintenance

#### Health Check Endpoints

```typescript
// app/api/health/route.ts
GET /api/health
Response:
{
  status: "healthy",
  timestamp: "2026-02-18T10:30:00Z",
  services: {
    database: "connected",
    redis: "connected",
    blockchain: "operational"
  },
  uptime: 86400,
  version: "1.0.0"
}
```

#### Backup Strategy

```bash
# Automated daily backups (cron job)
0 2 * * * /opt/medifollow/scripts/backup-db.sh

# Backup script (scripts/backup-db.sh)
#!/bin/bash
BACKUP_DIR="/opt/backups/medifollow"
DATE=$(date +%Y%m%d_%H%M%S)
docker exec medifollow-mongodb-prod mongodump --out /backup/$DATE
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz /backup/$DATE
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +30 -delete
```

#### Log Management

```bash
# View application logs
docker-compose -f docker-compose.prod.yml logs -f web

# Log rotation (logrotate)
/var/log/medifollow/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
}
```

### Scaling Considerations

**Horizontal Scaling:**

- Deploy multiple web container instances behind load balancer
- Use Redis for session storage (shared across instances)
- MongoDB replica set for read scaling

**Vertical Scaling:**

- Increase container resource limits
- Optimize Next.js bundle size
- Implement CDN for static assets

**Database Optimization:**

- Index frequently queried fields
- Implement data archiving for old records
- Use MongoDB aggregation pipeline for analytics

---

## 📅 Project Timeline

MediFollow development follows an agile methodology with 4-week sprints:

```mermaid
gantt
    title MediFollow Development Timeline
    dateFormat YYYY-MM-DD
    section Phase 1: Foundation
    Project Setup & Architecture    :done, p1, 2025-09-01, 7d
    Database Schema Design          :done, p2, 2025-09-08, 5d
    Authentication System           :done, p3, 2025-09-13, 10d
    RBAC Implementation             :done, p4, 2025-09-23, 7d

    section Phase 2: Core Features
    Patient Management Module       :done, p5, 2025-10-01, 14d
    Vital Records System            :done, p6, 2025-10-15, 14d
    Alert System Development        :done, p7, 2025-10-29, 14d
    Dashboard Development           :done, p8, 2025-11-12, 14d

    section Phase 3: Advanced Features
    Blockchain Integration          :done, p9, 2025-11-26, 14d
    Analytics & Reporting           :done, p10, 2025-12-10, 10d
    Notification System             :done, p11, 2025-12-20, 10d

    section Phase 4: DevOps & Testing
    Docker Configuration            :done, p12, 2026-01-01, 7d
    Security Audit                  :done, p13, 2026-01-08, 7d
    Performance Testing             :active, p14, 2026-01-15, 10d
    User Acceptance Testing         :active, p15, 2026-01-25, 14d

    section Phase 5: Deployment
    Production Setup                :crit, p16, 2026-02-08, 7d
    Data Migration                  :crit, p17, 2026-02-15, 3d
    Go-Live                         :milestone, p18, 2026-02-18, 1d
    Post-Launch Support             :p19, 2026-02-19, 30d
```

### Sprint Breakdown

#### Sprint 1-2: Foundation (Weeks 1-8)

- ✅ Next.js project setup with TypeScript
- ✅ MongoDB schema design and implementation
- ✅ JWT authentication system
- ✅ Role-based access control middleware
- ✅ Basic UI component library

#### Sprint 3-4: Core Features (Weeks 9-16)

- ✅ Patient registration and management
- ✅ Vital signs recording interface
- ✅ Automated alert generation system
- ✅ Doctor and admin dashboards
- ✅ Real-time data visualization

#### Sprint 5-6: Advanced Features (Weeks 17-24)

- ✅ Aptos blockchain integration
- ✅ Smart contract deployment
- ✅ Advanced analytics and reports
- ✅ Email and SMS notification system
- ✅ Audit log implementation

#### Sprint 7-8: DevOps & Quality Assurance (Weeks 25-32)

- ✅ Docker containerization
- ✅ Security penetration testing
- ✅ Performance optimization
- 🔄 User acceptance testing (in progress)
- 📅 Documentation finalization

#### Sprint 9: Deployment (Week 33)

- 📅 Production server setup
- 📅 Data migration from staging
- 📅 Go-live preparation
- 📅 Post-launch monitoring

---

## 📖 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`

Register a new user account.

**Request Body:**

```json
{
  "email": "doctor@medifollow.dz",
  "password": "SecurePass123!",
  "firstName": "Ahmed",
  "lastName": "Benali",
  "role": "doctor",
  "phoneNumber": "+213555123456"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "email": "doctor@medifollow.dz",
    "firstName": "Ahmed",
    "lastName": "Benali",
    "role": "doctor"
  }
}
```

#### POST `/api/auth/login`

Authenticate user and receive JWT token.

**Request Body:**

```json
{
  "email": "doctor@medifollow.dz",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "email": "doctor@medifollow.dz",
    "role": "doctor"
  }
}
```

### Patient Endpoints

#### GET `/api/patients`

List all patients (doctors see assigned only, admins see all).

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Results per page (default: 20)
- `search` (string): Search by name or medical record number

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "65f1a2b3c4d5e6f7g8h9i0j2",
      "firstName": "Fatima",
      "lastName": "Khalil",
      "medicalRecordNumber": "MRN-2026-001",
      "dateOfBirth": "1985-05-15",
      "diagnosis": "Post-cardiac surgery monitoring",
      "lastVitalRecord": "2026-02-18T08:30:00Z",
      "alertCount": 2
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalResults": 97
  }
}
```

#### POST `/api/vitals`

Submit new vital signs record.

**Request Body:**

```json
{
  "patientId": "65f1a2b3c4d5e6f7g8h9i0j2",
  "systolicBP": 130,
  "diastolicBP": 85,
  "heartRate": 78,
  "temperature": 37.2,
  "oxygenSaturation": 97,
  "weight": 72.5,
  "notes": "Feeling slightly dizzy after medication"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j3",
    "recordedAt": "2026-02-18T10:30:00Z",
    "alertGenerated": false,
    "blockchainTxHash": "0xabc123def456..."
  }
}
```

### Alert Endpoints

#### GET `/api/alerts`

Retrieve alerts (filtered by role).

**Query Parameters:**

- `status` (string): Filter by status (open, acknowledged, resolved, closed)
- `severity` (string): Filter by severity (low, medium, high, critical)
- `patientId` (string): Filter by patient

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "65f1a2b3c4d5e6f7g8h9i0j4",
      "patientId": "65f1a2b3c4d5e6f7g8h9i0j2",
      "patientName": "Fatima Khalil",
      "alertType": "vital",
      "severity": "high",
      "message": "Systolic BP exceeded threshold: 165 mmHg (max: 140)",
      "status": "open",
      "createdAt": "2026-02-18T09:15:00Z"
    }
  ]
}
```

#### PATCH `/api/alerts/:id`

Update alert status (acknowledge/resolve).

**Request Body:**

```json
{
  "status": "resolved",
  "resolution": "Patient contacted. Medication adjusted. Follow-up scheduled for tomorrow."
}
```

**Response:** `200 OK`

### Blockchain Endpoints

#### POST `/api/blockchain/verify`

Verify data integrity against blockchain.

**Request Body:**

```json
{
  "entityType": "vital_record",
  "entityId": "65f1a2b3c4d5e6f7g8h9i0j3"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "verified": true,
  "blockchainData": {
    "txHash": "0xabc123def456...",
    "blockNumber": 12345678,
    "timestamp": "2026-02-18T10:30:05Z",
    "dataHash": "0x789ghi012jkl..."
  }
}
```

**Error Responses:**

All endpoints return consistent error format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "systolicBP",
        "message": "Must be between 70 and 250"
      }
    ]
  }
}
```

Common HTTP status codes:

- `400` Bad Request - Invalid input
- `401` Unauthorized - Missing/invalid token
- `403` Forbidden - Insufficient permissions
- `404` Not Found - Resource not found
- `429` Too Many Requests - Rate limit exceeded
- `500` Internal Server Error - Server error

---

## 👥 Contributing

We welcome contributions from the community! Here's how you can help:

### Development Workflow

1. **Fork the repository**

```bash
git clone https://github.com/yourusername/medifollow.git
cd medifollow
git remote add upstream https://github.com/original/medifollow.git
```

2. **Create a feature branch**

```bash
git checkout -b feature/your-feature-name
```

3. **Make your changes**

- Follow TypeScript and React best practices
- Maintain consistent code style (Prettier/ESLint)
- Write meaningful commit messages
- Add tests for new features

4. **Test your changes**

```bash
npm run lint
npm run type-check
npm run build
```

5. **Submit a pull request**

- Describe your changes clearly
- Reference related issues
- Ensure CI checks pass

### Code Style Guidelines

```typescript
// Use TypeScript strict mode
// Define proper types/interfaces
interface VitalRecord {
  systolicBP: number;
  diastolicBP: number;
  heartRate: number;
  temperature: number;
  oxygenSaturation: number;
}

// Use async/await instead of promises
async function fetchPatients(): Promise<Patient[]> {
  const response = await fetch("/api/patients");
  return response.json();
}

// Use meaningful variable names
const activeAlertCount = alerts.filter((a) => a.status === "open").length;
```

### Reporting Issues

Found a bug? Have a feature request?

1. Check existing issues first
2. Create a new issue with:
   - Clear description
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details

---

## 📜 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 MediFollow Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

This project was developed as part of an engineering thesis at:

**University**: École Nationale Supérieure d'Informatique (ESI), Algiers, Algeria  
**Program**: Master's in Software Engineering  
**Regional Scope**: Algeria, Tunisia, and Arab Maghreb Countries  
**Academic Year**: 2025-2026  
**Supervisor**: Dr. [Supervisor Name]

**Technologies & Resources:**

- [Next.js Documentation](https://nextjs.org/docs)
- [Aptos Blockchain](https://aptoslabs.com/)
- [MongoDB University](https://university.mongodb.com/)
- [Docker Documentation](https://docs.docker.com/)

**Inspiration:**
MediFollow was inspired by the need to improve post-hospitalization care across the Arab Maghreb region, addressing real challenges faced by patients and healthcare providers in Algeria, Tunisia, and neighboring countries.

---

## 📧 Contact & Support

**Project Maintainer**: [Your Name]  
**Email**: contact@medifollow.dz  
**GitHub**: [@yourusername](https://github.com/yourusername)  
**LinkedIn**: [Your LinkedIn](https://linkedin.com/in/yourprofile)

**Project Links:**

- 🌐 **Live Demo**: https://demo.medifollow.dz
- 📚 **Documentation**: https://docs.medifollow.dz
- 🐛 **Issue Tracker**: https://github.com/yourusername/medifollow/issues
- 💬 **Discussions**: https://github.com/yourusername/medifollow/discussions

---

<div align="center">

**⭐ If you find this project useful, please consider giving it a star on GitHub! ⭐**

Made with ❤️ in the Arab Maghreb (Algeria, Tunisia & Region) for better healthcare

**[Back to Top](#-medifollow--post-hospitalization-remote-monitoring-platform)**

</div>
- 🛡️ **Risk Reduction**: Minimize complications and preventable readmissions
- 📊 **Data Centralization**: Consolidate all patient follow-up data in one secure location
- ⚡ **Real-time Monitoring**: Provide instant alerts for critical health indicators
- 💬 **Enhanced Communication**: Improve interaction between patients and healthcare teams
- 📈 **Data-Driven Insights**: Enable evidence-based decision making through analytics

---

## 👥 Target Users

<table>
  <tr>
    <td align="center">
      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=patient&backgroundColor=b6e3f4" width="80"/><br/>
      <b>🧑‍⚕️ Patients</b>
    </td>
    <td align="center">
      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=doctor&backgroundColor=c0aede" width="80"/><br/>
      <b>👨‍⚕️ Physicians</b>
    </td>
    <td align="center">
      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=nurse&backgroundColor=ffd5dc" width="80"/><br/>
      <b>👩‍⚕️ Nurses</b>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=coordinator&backgroundColor=d1d4f9" width="80"/><br/>
      <b>👔 Coordinators</b>
    </td>
    <td align="center">
      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin&backgroundColor=ffdfbf" width="80"/><br/>
      <b>⚙️ Administrators</b>
    </td>
    <td align="center">
      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=auditor&backgroundColor=d4f1f4" width="80"/><br/>
      <b>📊 Auditors</b>
    </td>
  </tr>
</table>

---

## ⚙️ Key Features

### 🔐 Authentication & Security

- Secure multi-factor authentication (MFA)
- Role-based access control (RBAC)
- Session management and token refresh

### 👤 Patient Management

- Comprehensive patient profiles
- Medical history tracking
- Treatment plans and medication management
- Appointment scheduling

<div align="center">
  <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&q=80" alt="Patient Dashboard" width="700"/>
</div>

### 📊 Vital Signs Monitoring

- Blood pressure tracking
- Heart rate monitoring
- Temperature logs
- Weight and BMI tracking
- Blood glucose levels
- Oxygen saturation (SpO2)

### 🩺 Symptom Tracking

- Daily symptom reports
- Pain scale assessment
- Symptom severity tracking
- Trend analysis and visualization

### 🔔 Alerts & Notifications

- Real-time critical alerts
- Automated threshold-based notifications
- Email and SMS alerts
- Push notifications
- Escalation protocols

<div align="center">
  <img src="https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=900&q=80" alt="Alert System" width="700"/>
</div>

### 📝 Questionnaire Management

- Post-discharge questionnaires
- Quality of life assessments
- Patient satisfaction surveys
- Custom form builder

### 📈 Dashboards & Analytics

- Interactive data visualization
- Real-time statistics
- Trend analysis
- Customizable reports
- Export functionality (PDF, Excel)

### 🔍 Audit & Traceability

- Complete activity logs
- User action tracking
- Data access audit trails
- Compliance reporting

---

## 🏗️ Project Architecture

<div align="center">
  <img src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1000&q=80" alt="System Architecture" width="800"/>
</div>

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend Layer                       │
│         (Next.js/React + Tailwind CSS)                  │
└────────────────────┬────────────────────────────────────┘
                     │ REST API / WebSocket
┌────────────────────▼────────────────────────────────────┐
│                   API Gateway                            │
│              (Express/NestJS)                           │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐       ┌───────▼────────┐
│ Business Logic │       │  Auth Service  │
│    Services    │       │      (JWT)     │
└───────┬────────┘       └────────────────┘
        │
┌───────▼────────────────────────────────────────────────┐
│              Database Layer                             │
│         (MongoDB / PostgreSQL)                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🧩 Project Modules (Branches)

```text
main                                    # Production-ready code
│
├── develop                            # Integration branch
│
├── feature/user-management            # Authentication & user roles
├── feature/patient-followup           # Patient profiles & records
├── feature/vitals-management          # Vital signs tracking
├── feature/symptom-tracking           # Symptom reporting
├── feature/alerts-and-notifications   # Alert system
├── feature/questionnaire-management   # Forms & surveys
├── feature/dashboards                 # Analytics & visualization
└── feature/audit-and-traceability     # Logging & compliance
```

---

## 🛠️ Tech Stack

### Frontend

<p align="left">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Material_UI-0081CB?style=for-the-badge&logo=mui&logoColor=white" />
</p>

### Backend

<p align="left">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" />
</p>

### Database

<p align="left">
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
</p>

### DevOps & Tools

<p align="left">
  <img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white" />
  <img src="https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white" />
  <img src="https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white" />
</p>

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB or PostgreSQL
- Git

### 1️⃣ Clone the repository

```bash
git clone https://github.com/<your-username>/medifollow.git
cd medifollow
```

### 2️⃣ Install dependencies

#### Frontend

```bash
cd frontend
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

#### Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=3001
DATABASE_URL=mongodb://localhost:27017/medifollow
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
```

Start the development server:

```bash
npm run start:dev
```

The API will be available at `http://localhost:3001`

### 3️⃣ Run with Docker (Optional)

```bash
docker-compose up -d
```

---

## 📸 Screenshots

### Dashboard Overview

<div align="center">
  <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&q=80" alt="Dashboard" width="800"/>
</div>

### Patient Monitoring

<div align="center">
  <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1000&q=80" alt="Patient Monitoring" width="800"/>
</div>

### Vital Signs Tracking

<div align="center">
  <img src="https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=1000&q=80" alt="Vital Signs" width="800"/>
</div>

### Alert Management

<div align="center">
  <img src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1000&q=80" alt="Alerts" width="800"/>
</div>

---

## 🔐 Security & Data Privacy

- ✅ **Role-based Access Control (RBAC)** – Granular permissions for each user role
- ✅ **Secure Authentication** – JWT tokens with refresh mechanism
- ✅ **Data Encryption** – End-to-end encryption for sensitive medical data
- ✅ **HIPAA Compliance** – Following healthcare data protection standards
- ✅ **Audit Logs** – Complete traceability of all system actions
- ✅ **Data Anonymization** – All medical data used in development is fictitious or anonymized
- ✅ **HTTPS Only** – Secure communication channels
- ✅ **Rate Limiting** – Protection against brute force attacks

<div align="center">
  <img src="https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80" alt="Security" width="600"/>
</div>

---

## 📚 Documentation

- 📖 [Technical Documentation](./docs/TECHNICAL.md)
- 🔌 [API Documentation](./docs/API.md)
- 🎨 [Design System](./docs/DESIGN.md)
- 📊 [UML Diagrams](./docs/UML.md)
- 🏗️ [Architecture Guide](./docs/ARCHITECTURE.md)
- 🚀 [Deployment Guide](./docs/DEPLOYMENT.md)

---

## 🧪 Testing

### Unit Tests

```bash
npm run test
```

### Integration Tests

```bash
npm run test:integration
```

### End-to-End Tests

```bash
npm run test:e2e
```

### Code Coverage

```bash
npm run test:coverage
```

<div align="center">
  <img src="https://img.shields.io/badge/Coverage-85%25-brightgreen" />
  <img src="https://img.shields.io/badge/Tests-142%20passed-success" />
</div>

---

## 🤝 Team & Contribution

This project is developed as part of an academic full-stack development program.

### Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code of Conduct

Please read our [Code of Conduct](./CODE_OF_CONDUCT.md) before contributing.

---

## 📞 Contact & Support

- 📧 Email: support@medifollow.com
- 💬 Discord: [Join our community](https://discord.gg/medifollow)
- 🐛 Issues: [GitHub Issues](https://github.com/<your-username>/medifollow/issues)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Thanks to all contributors who helped build this project
- Medical professionals who provided valuable feedback
- Open source community for amazing tools and libraries

---

<div align="center">

**Made with ❤️ by the MediFollow Team**

⭐ Star us on GitHub — it motivates us a lot!

[⬆ Back to Top](#-medifollow--post-hospitalization-remote-monitoring-platform)

</div>
