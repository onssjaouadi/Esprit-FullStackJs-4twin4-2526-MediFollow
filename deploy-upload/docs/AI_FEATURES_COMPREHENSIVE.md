# MediFollow AI Features Implementation Guide

**Date**: April 15, 2026  
**Version**: 1.0  
**Document**: Comprehensive AI Services & APIs Documentation

---

## Table des Matières

1. [Vue d'ensemble des Services AI](#vue-densemble)
2. [Services par Module](#services-par-module)
3. [APIs et Intégrations](#apis-et-intégrations)
4. [Détails Techniques](#détails-techniques)
5. [Guide d'Implémentation](#guide-dimplémentation)

---

## Vue d'ensemble des Services AI

MediFollow intègre **3 principaux fournisseurs AI** pour différents cas d'usage :

| Fournisseur      | Modèle           | Usage                                           | Statut   |
| ---------------- | ---------------- | ----------------------------------------------- | -------- |
| **Groq**         | Llama 3.1 70B    | Parse vitals, Risk analysis, Report generation  | ✅ Actif |
| **Azure OpenAI** | GPT-4o           | Vital status classification, Admin intelligence | ✅ Actif |
| **Face-API**     | Face Recognition | Facial login, Identity verification             | ✅ Actif |

---

## Services par Module

### 1. MODULE PATIENT - Questionnaire & Profil

#### 1.1 Chatbot Assistant Patient

**Endpoint**: `POST /api/patient/chatbot`

**Description**:  
Assistant conversationnel IA pour aider les patients à :

- Comprendre leur santé
- Utiliser l'application MediFollow
- Obtenir des conseils de bien-être
- Signaler les symptômes

**API Utilisée**:

- **Azure OpenAI** (Chat Completions)
- Model: `gpt-4` ou `gpt-3.5-turbo`
- Endpoint: `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions`

**Configuration Requise**:

```env
AZURE_OPENAI_API_KEY=xxx
AZURE_OPENAI_ENDPOINT=https://xxx.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

**Fonctionnalités**:

- ✅ Historique de conversation persistant
- ✅ Réponses contextuelles
- ✅ Support multilingue (FR/EN)
- ✅ Filtrage des réponses sensibles
- ✅ Logging des interactions

**Exemple d'Utilisation**:

```typescript
const response = await fetch("/api/patient/chatbot", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: [{ role: "user", content: "Comment prendre ma tension?" }],
  }),
});
```

---

#### 1.2 Questionnaire Intelligence

**Service**: `POST /api/patient/questionnaire`

**Description**:  
Système intelligente pour :

- Valider les réponses du questionnaire
- Détecter les incohérences
- Suggérer des clarifications

**API Utilisée**:

- **Groq** (JSON completions)
- Model: `llama-3.1-70b-versatile`

**Statut**: 🔄 À Implémenter

---

### 2. MODULE VITAL SIGNS - Analyse Intelligente

#### 2.1 Vital Signs Parser (Analysis de Transcription Vocale)

**Service**: `lib/ai/vitalParser.ts`

**Description**:  
Extraction intelligente des constantes vitales à partir de transcriptions vocales :

- Systolic BP, Diastolic BP
- Heart Rate
- Temperature
- Oxygen Saturation
- Weight
- Notes additionnelles

**API Utilisée**:

- **Groq** (JSON completions)
- Model: `llama-3.3-70b-versatile`
- Temperature: `0.3` (precision maximale)
- Max Tokens: `500`

**Entrée**:

```json
{
  "transcript": "Ma tension est 140 sur 90, mon cœur bat à 75, et j'ai 36.8 degrés"
}
```

**Sortie**:

```json
{
  "systolicBP": 140,
  "diastolicBP": 90,
  "heartRate": 75,
  "temperature": 36.8,
  "oxygenSaturation": null,
  "weight": null,
  "notes": "Patient reported measurements verbally"
}
```

**Validation Intégrée**:

- ✅ Systolic BP: 50-250 mmHg
- ✅ Diastolic BP: 30-150 mmHg
- ✅ Heart Rate: 30-200 bpm
- ✅ Temperature: 35-42°C
- ✅ Oxygen Saturation: 70-100%
- ✅ Weight: 30-300 kg

**Code**:

```typescript
import { parseVitalSigns } from "@/lib/ai/vitalParser";

const result = await parseVitalSigns(voiceTranscript);
if (result.success) {
  console.log(result.vitals); // Constantes vitales parsées
}
```

---

#### 2.2 AI Vital Status Classification

**Service**: `lib/services/vitals-ai-status.service.ts`

**Description**:  
Classification intelligente et contextuelle des constantes vitales au-delà des simples seuils :

- Analyse holistique de la santé
- Corrélations entre vitals
- Recommandations d'action
- Identification des facteurs de risque

**API Utilisée**:

- **Azure OpenAI** (Chat Completions)
- Model: `gpt-4o` (GPT-4 Omni)
- Temperature: `0.7`
- Max Tokens: `1500`

**Entrée**:

```typescript
const vitals = {
  temperature: 38.5,
  heartRate: 95,
  systolicBP: 145,
  diastolicBP: 92,
  oxygenSaturation: 94,
  respiratoryRate: 20,
};

const patientContext = {
  age: 65,
  specialty: "CARDIOLOGY",
  medicalHistory: ["hypertension", "diabetes"],
  currentMedications: ["metoprolol", "lisinopril"],
};
```

**Sortie**:

```json
{
  "severity": "POOR",
  "classification": "Fever with elevated BP - Monitor closely",
  "insights": "Patient shows fever (38.5°C) combined with elevated BP and respiration...",
  "recommendations": [
    "Administer antipyretic",
    "Recheck vitals in 2 hours",
    "Consider COVID-19 screening"
  ],
  "riskFactors": [
    "Fever + tachycardia",
    "Hypertensive response",
    "Age >60 with comorbidities"
  ],
  "correlations": [
    "Fever correlates with elevated HR",
    "BP elevation pattern consistent with stress response"
  ]
}
```

**Sévérités Supportées**:

- `EXCELLENT` - All vitals normal
- `GOOD` - Minor variations, well-controlled
- `FAIR` - Moderate anomalies, monitoring needed
- `POOR` - Multiple concerning values
- `CRITICAL` - Dangerous values, urgent intervention

**Code**:

```typescript
import { classifyVitalsWithAI } from "@/lib/services/vitals-ai-status.service";

const status = await classifyVitalsWithAI(vitals, symptoms, patientContext);
```

---

#### 2.3 Risk Analysis Engine

**Service**: `lib/ai/riskAnalysis.ts`

**Description**:  
Analyse intelligente du risque patient basée sur :

- Historique des vitals
- Conditions médicales
- Tendances sur le temps
- Facteurs de comorbidité

**API Utilisée**:

- **Groq** (JSON completions)
- Model: `llama-3.3-70b-versatile`
- Temperature: `0.3` (stabilité médicale)
- Max Tokens: `1000`

**Entrée**:

```typescript
const riskData = {
  patientName: "John Doe",
  age: 62,
  conditions: ["hypertension", "diabetes"],
  baseline: {
    systolicBP: 130,
    heartRate: 75,
    temperature: 37,
  },
  vitalHistory: [
    /* array of vital records */
  ],
  latestVitals: {
    systolicBP: 165,
    heartRate: 102,
    temperature: 38.2,
  },
};
```

**Sortie**:

```json
{
  "riskScore": 78,
  "riskLevel": "HIGH",
  "trendIndicator": "declining",
  "concerns": [
    "Significant BP elevation from baseline",
    "Sustained tachycardia",
    "Fever development"
  ],
  "recommendations": [
    "Immediate medical evaluation needed",
    "ECG monitoring recommended",
    "Consider hospital referral"
  ],
  "summary": "Patient shows deteriorating vital pattern...",
  "urgency": "high"
}
```

**Résultat Score Risk**:

- 0-30: Low risk
- 31-50: Moderate risk
- 51-75: High risk
- 76-90: Very high risk
- 91-100: Critical risk

---

### 3. MODULE INFIRMIÈRE - Rapports & Analyses

#### 3.1 Automated Report Generation

**Service**: `lib/ai/reportGeneration.ts`

**Description**:  
Génération automatique de rapports infirmiers complets incluant :

- Résumé clinique
- Analyse des vitals
- Évolution du patient
- Recommandations d'action

**API Utilisée**:

- **Groq** (Text completions)
- Model: `llama-3.3-70b-versatile`
- Temperature: `0.5` (équilibre créativité/cohérence)
- Max Tokens: `2000`

**Entrée**:

```typescript
const reportData = {
  patientName: "Jane Smith",
  age: 58,
  mrn: "MR-2024-001234",
  conditions: ["post-cardiac procedure"],
  vitalData: {
    systolicBP: 135,
    heartRate: 78,
    temperature: 36.8,
    oxygenSaturation: 97,
  },
  previousVitals: [
    /* historic data */
  ],
  alerts: [
    /* recent alerts */
  ],
  enteredBy: "Nurse Alice",
};
```

**Sortie**: Rapport formaté en markdown avec :

- Introduction clinique
- Analyse des vitals actuelles
- Comparaison avec historique
- Alertes et préoccupations
- Plan de suivi
- Recommandations

**Code**:

```typescript
import { generateNursingReport } from "@/lib/ai/reportGeneration";

const { report } = await generateNursingReport(reportData);
```

---

#### 3.2 Quick Summary Generation

**Service**: `lib/ai/reportGeneration.ts`

**Description**:  
Résumé rapide 2-3 phrases pour dashboard :

- État de santé immédiat
- Observations critiques
- Actions urgentes

**API Utilisée**: Groq (même que ci-dessus)

**Code**:

```typescript
import { generateQuickSummary } from "@/lib/ai/reportGeneration";

const { summary } = await generateQuickSummary({
  patientName: "Jane Smith",
  vitalData: vitals,
  concerns: ["fever", "elevated BP"],
});
```

---

### 4. MODULE ADMIN - Intelligence & Gestion

#### 4.1 Admin Copilot - Next Best Actions

**Service**: `lib/ai/admin-intelligence.ts`

**Description**:  
Assistant IA pour aider l'admin à :

- Analyser les alertes
- Recommander les actions prioritaires
- Naviguer vers les bons écrans
- Accélérer la gestion des tâches

**API Utilisée**:

- **Azure OpenAI** (JSON mode)
- Model: `gpt-4` ou `gpt-3.5-turbo`
- Temperature: `0.15` (consistency maximale)
- Max Tokens: `1200`

**Fonctionnalités**:

- ✅ Analyse intelligente des alertes
- ✅ Recommandations d'actions avec score de confiance
- ✅ Navigation contextualisée
- ✅ Suggestions basées sur patterns

**Sortie**:

```json
{
  "nextActions": [
    {
      "title": "Acknowledge alert and assign owner",
      "rationale": "Immediate ownership shortens response time",
      "confidence": 0.95
    },
    {
      "title": "Request immediate pulse-ox recheck",
      "rationale": "Oxygen fluctuations can escalate quickly",
      "confidence": 0.9
    }
  ],
  "urgencyLevel": "CRITICAL",
  "patientName": "John Doe",
  "recommendation": "Route to ICU for immediate evaluation"
}
```

**Code**:

```typescript
import { recommendNextActions } from "@/lib/ai/admin-intelligence";

const actions = await recommendNextActions(alert, recentAlerts, patientHistory);
```

---

### 5. MODULE AUTHENTIFICATION - Facial Recognition

#### 5.1 Face Recognition Login

**Service**: `components/FaceLoginModal.tsx`

**Description**:  
Authentification sécurisée par reconnaissance faciale :

- Capture face en temps réel
- Comparaison avec profil enregistré
- Fallback sur password
- Support pour authentification 2FA

**API Utilisée**:

- **@vladmandic/face-api** (Client-side)
- **TensorFlow.js** (Inference)
- No external API calls

**Modèles Utilisés**:

- `tinyFaceDetector` - Detection rapide
- `faceLandmarkNet` - Landmarks extraction
- `faceRecognitionNet` - Face descriptor (128D vector)

**Fonctionnalités**:

- ✅ Real-time face detection
- ✅ Anti-spoofing measures
- ✅ Distance calculation (face matching)
- ✅ Lighting adjustment
- ✅ Face quality validation

**Statut**: ✅ Actif

---

### 6. MODULE SANTÉ CONNECT - OAuth Integration

#### 6.1 OAuth2 Authorization

**Service**: `app/api/wearables/santeconnect/authorize/route.ts`

**Description**:  
Intégration sécurisée avec Santé Connect pour :

- Authentification des patients
- Accès aux données wearable
- Partage de données sécurisé

**API Utilisée**:

- **Santé Connect OAuth2**
- Endpoint: `https://auth.sante-connect.fr/authorize`

**Flow**:

1. Patient clique "Santé Connect"
2. Redirect vers authorization endpoint
3. User authentication
4. Consent prompt
5. Authorization code
6. Token exchange
7. User info retrieval
8. Device registration

**Code**:

```typescript
// 1. Generate authorization URL
const authUrl = new URL("https://auth.sante-connect.fr/authorize");
authUrl.searchParams.append("client_id", SANTE_CONNECT_CLIENT_ID);
authUrl.searchParams.append("redirect_uri", redirectUri);
authUrl.searchParams.append("response_type", "code");

// 2. Callback receives code
const code = req.query.code;

// 3. Exchange for token
const tokenResponse = await fetch("https://auth.sante-connect.fr/token", {
  method: "POST",
  body: urlEncoded({
    grant_type: "authorization_code",
    code,
    client_id: SANTE_CONNECT_CLIENT_ID,
    client_secret: SANTE_CONNECT_CLIENT_SECRET,
  }),
});
```

---

## APIs et Intégrations

### Configuration Groq API

```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxx
```

**Modèles disponibles**:

- `llama-3.1-70b-versatile` - Fast general purpose
- `llama-3.3-70b-versatile` - Improved instructions following
- `mixtral-8x7b-32768` - MoE model

**Pricing**: Gratuit avec rate limit - Excellent pour développement

---

### Configuration Azure OpenAI

```env
AZURE_OPENAI_API_KEY=xxxxxxxxxxxxxx
AZURE_OPENAI_ENDPOINT=https://xxx.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

**Modèles déployés**:

- `gpt-4` - Most capable, higher latency
- `gpt-4o` - GPT-4 Omni (multimodal)
- `gpt-3.5-turbo` - Fast, cost-effective

---

### Configuration Santé Connect

```env
SANTE_CONNECT_CLIENT_ID=xxxxxxxxxxxxxx
SANTE_CONNECT_CLIENT_SECRET=xxxxxxxxxxxxxx
SANTE_CONNECT_REDIRECT_URI=https://yourdomain.com/api/wearables/santeconnect/callback
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## Détails Techniques

### Prompts Intelligence

**Vital Parser Prompt** (`lib/ai/prompts.ts`):

```typescript
function getVitalParserPrompt(transcript: string): string {
  return `Extract vital signs from this patient transcript and return JSON:
  
  Transcript: "${transcript}"
  
  JSON Format:
  {
    systolicBP: number|null,
    diastolicBP: number|null,
    heartRate: number|null,
    temperature: number|null,
    oxygenSaturation: number|null,
    weight: number|null,
    notes: string
  }`;
}
```

**Risk Analysis Prompt**:

```typescript
function getRiskAnalysisPrompt(data): string {
  return `As a clinical AI, analyze patient risk:
  
  Patient: ${data.patientName}, Age: ${data.age}
  Conditions: ${data.conditions.join(", ")}
  
  Current Vitals:
  - BP: ${data.latestVitals.systolicBP}/${data.latestVitals.diastolicBP}
  - HR: ${data.latestVitals.heartRate}
  - Temp: ${data.latestVitals.temperature}
  
  Return JSON with riskScore (0-100), riskLevel, concerns, recommendations...`;
}
```

---

### Error Handling

```typescript
// Always implement try-catch for AI calls
try {
  const result = await AIService.analyze(data);
  if (!result.success) {
    // Fallback to rule-based logic
    return getDefaultAnalysis(data);
  }
  return result;
} catch (error) {
  logger.error("AI service failed", error);
  // Return safe default
  return getDefaultAnalysis(data);
}
```

---

### Token Usage Tracking

```typescript
import { getTokenUsage, resetTokenUsage } from "@/lib/ai/openai.service";

// Get current usage
const usage = getTokenUsage();
console.log(`Total tokens used: ${usage.totalTokens}`);

// Reset for new billing period
resetTokenUsage();
```

---

## Guide d'Implémentation

### Step 1: Configuration

1. **Setup API Keys**:

   ```bash
   # Copy .env.example to .env.local
   cp .env.example .env.local

   # Fill in your API keys
   GROQ_API_KEY=gsk_...
   AZURE_OPENAI_API_KEY=...
   SANTE_CONNECT_CLIENT_ID=...
   ```

2. **Install Dependencies**:
   ```bash
   npm install groq-sdk openai @azure/communication-email
   ```

### Step 2: Testing

```typescript
// Test Groq API
import { chatCompletion } from "@/lib/ai/openai.service";

const result = await chatCompletion([
  { role: "user", content: "Hello, test Groq API" },
]);

console.log(result.content); // Should return response
```

### Step 3: Integration

1. Use in Patient Module (`/api/patient/chatbot`)
2. Use in Vital Analysis (`/api/patient/vitals-symptoms`)
3. Use in Nurse Reports (`/api/nurse/reports`)
4. Use in Admin Dashboard (`/api/admin/alerts`)

### Step 4: Monitoring

```typescript
// Monitor AI usage and performance
import { telemetry } from "@/lib/telemetry";

telemetry.trackAICall({
  service: "groq",
  model: "llama-3.1-70b",
  duration: 1200,
  tokens: 350,
  success: true,
});
```

---

## Services à Implémenter (Roadmap)

| Service              | Module        | Priorité   | Statut  |
| -------------------- | ------------- | ---------- | ------- |
| Vital Parser         | Patient/Nurse | 🔴 Haute   | ⏳ TODO |
| Risk Analysis        | Dashboard     | 🔴 Haute   | ⏳ TODO |
| Report Generation    | Nurse         | 🔴 Haute   | ⏳ TODO |
| Admin Copilot        | Admin         | 🟡 Moyenne | ⏳ TODO |
| Translation Service  | Global        | 🟡 Moyenne | ⏳ TODO |
| FAQ Generator        | Patient       | 🟢 Basse   | ⏳ TODO |
| Predictive Analytics | Dashboard     | 🟢 Basse   | ⏳ TODO |

---

## Support & Ressources

- **Groq Docs**: https://console.groq.com/docs
- **Azure OpenAI**: https://learn.microsoft.com/en-us/azure/cognitive-services/openai/
- **Santé Connect**: https://sante-connect.fr/dev
- **Face-API Docs**: https://github.com/vladmandic/face-api

---

**Document créé le**: April 15, 2026  
**Prochaine révision**: May 15, 2026
