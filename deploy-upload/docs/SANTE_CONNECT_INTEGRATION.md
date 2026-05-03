# Intégration Santé Connect - Enzo200

Ce document explique comment configurer et utiliser l'intégration Santé Connect pour connecter une montre Enzo200 à MediFollow.

## Vue d'ensemble

L'intégration Santé Connect permet aux patients de :

- Se connecter de manière sécurisée via leur compte Santé Connect
- Autoriser automatiquement l'accès à leurs données Enzo200
- Synchroniser leurs constantes vitales en temps réel
- Partager leurs données avec leur médecin de manière sécurisée

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Patient Dashboard                         │
├─────────────────────────────────────────────────────────────┤
│  /dashboard/patient/wearables/enzo200-connect               │
│                                                               │
│  1. SanteConnectIntegration Component                        │
│     └─> Affiche le bouton "Se connecter avec Santé Connect" │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend - API Routes                            │
├─────────────────────────────────────────────────────────────┤
│  POST /api/wearables/santeconnect/authorize                │
│  ├─> Génère une URL d'autorisation Santé Connect           │
│  └─> Stocke l'état de session                               │
│                                                               │
│  GET /api/wearables/santeconnect/callback                  │
│  ├─> Reçoit le code d'autorisation                         │
│  ├─> Échange le code contre un token d'accès              │
│  ├─> Récupère les infos utilisateur                        │
│  └─> Enregistre le dispositif dans la BD                   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                Santé Connect OAuth2                          │
├─────────────────────────────────────────────────────────────┤
│  1. https://auth.sante-connect.fr/authorize                │
│  2. User Authentication & Consent                          │
│  3. https://auth.sante-connect.fr/token                    │
│  4. https://auth.sante-connect.fr/userinfo                 │
└─────────────────────────────────────────────────────────────┘
```

## Installation et Configuration

### 1. Inscription Santé Connect

1. Allez sur [sante-connect.fr](https://sante-connect.fr)
2. Créez un compte développeur
3. Créez une nouvelle application
4. Obtenez votre `CLIENT_ID` et `CLIENT_SECRET`

### 2. Configuration des Variables d'Environnement

Ajoutez ces variables dans votre `.env.local` :

```bash
# Santé Connect OAuth2
SANTE_CONNECT_CLIENT_ID=votre_client_id
SANTE_CONNECT_CLIENT_SECRET=votre_client_secret
SANTE_CONNECT_REDIRECT_URI=http://localhost:3000/api/wearables/santeconnect/callback

# URL de l'application (utilisée pour les redirections)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Pour la production :

```bash
SANTE_CONNECT_REDIRECT_URI=https://votre-domaine.com/api/wearables/santeconnect/callback
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
```

### 3. Configuration de la Base de Données

Le schéma `WearableDevice` dans Prisma supporte déjà :

- `deviceId` : Identifiant unique du dispositif
- `authToken` : Token d'accès Santé Connect
- `metadata` : Données additionnelles (sub Santé Connect, email, etc.)
- `lastSyncedAt` : Dernière synchronisation

## Flux d'Utilisation

### 1. Accès à la Page de Connexion

```
/dashboard/patient/wearables/enzo200-connect
```

### 2. Clique sur "Se connecter avec Santé Connect"

- Le composant `SanteConnectIntegration` génère un state token
- Appel à `/api/wearables/santeconnect/authorize`
- Redirection vers Santé Connect

### 3. Authentification Santé Connect

- L'utilisateur se connecte avec ses identifiants
- Santé Connect demande l'autorisation
- Redirection vers `/api/wearables/santeconnect/callback`

### 4. Enregistrement du Dispositif

- Échange du code contre un token d'accès
- Récupération des infos utilisateur
- Enregistrement du dispositif dans la BD
- Redirection vers la page de succès

## API Endpoints

### POST /api/wearables/santeconnect/authorize

Génère une URL d'autorisation Santé Connect.

**Request:**

```json
{
  "patientId": "patient_id",
  "state": "random_state_token",
  "deviceType": "ENZO_200"
}
```

**Response:**

```json
{
  "success": true,
  "authorizationUrl": "https://auth.sante-connect.fr/authorize?..."
}
```

### GET /api/wearables/santeconnect/callback

Callback Santé Connect pour compléter l'authentification.

**Query Parameters:**

- `code`: Authorization code
- `state`: State token (doit correspondre)
- `error`: Error code si erreur

**Behavior:**

- Échange le code contre un token
- Crée un dispositif `WearableDevice`
- Redirige vers `/dashboard/patient/wearables?device_connected=true`

## Server Actions

### `registerSanteConnectDevice(deviceId, accessToken, metadata)`

Enregistre un dispositif Santé Connect.

```typescript
const result = await registerSanteConnectDevice(
  "enzo200_sub_123456",
  "access_token_from_sante_connect",
  { santeConnectSub: "sub_123", santeConnectEmail: "user@example.com" }
);
```

### `getSanteConnectDevices()`

Récupère les dispositifs connectés via Santé Connect.

```typescript
const result = await getSanteConnectDevices();
// { success: true, data: [ { id, deviceId, deviceType, ... } ] }
```

### `disconnectSanteConnectDevice(deviceId)`

Déconnecte un dispositif.

```typescript
const result = await disconnectSanteConnectDevice("device_id");
```

## Composants

### `<SanteConnectIntegration />`

Component React pour l'intégration Santé Connect.

**Props:**

```typescript
interface SanteConnectIntegrationProps {
  patientId: string; // ID du patient
  onSuccess?: (deviceData) => void; // Callback de succès
  onError?: (error: string) => void; // Callback d'erreur
}
```

**Usage:**

```tsx
<SanteConnectIntegration
  patientId="patient_123"
  onSuccess={() => loadDevices()}
  onError={(err) => setError(err)}
/>
```

## Pages

### `/dashboard/patient/wearables/enzo200-connect`

Page complète de connexion Enzo200 via Santé Connect.

Fonctionnalités :

- Formulaire Santé Connect
- Affichage des dispositifs connectés
- Gestion des déconnexions
- Informations des sauvegardes

## Sécurité

### Protection CSRF

- Chaque authentification génère un `state` token unique
- Le token est vérifié lors du callback
- Stocké dans une cookie httpOnly sécurisée

### Tokens d'Accès

- Jamais exposés au client
- Stockés de manière sécurisée
- Expiration automatique
- Refresh token pour réapprovisionner

### Données Sensibles

- Chiffrement des métadonnées
- Pas de stockage d'identifiants
- PII conforme RGPD

## Troubleshooting

### "Configuration Santé Connect manquante"

**Cause**: Les variables d'environnement `SANTE_CONNECT_CLIENT_ID` ou `SANTE_CONNECT_CLIENT_SECRET` ne sont pas définies.

**Solution**: Vérifiez votre `.env.local`.

### "Invalid redirect_uri"

**Cause**: L'URI de redirection ne correspond pas à celle enregistrée chez Santé Connect.

**Solution**: Vérifiez que `SANTE_CONNECT_REDIRECT_URI` correspond exactement.

### "State mismatch"

**Cause**: Le token state n'est pas conservé entre la demande et le callback.

**Solution**: Faites un seul onglet, assurez que les cookies sont activés.

### Pas de token d'accès

**Cause**: Santé Connect n'a pas retourné le token dans la réponse.

**Solution**: Vérifiez les logs du serveur, contactez Santé Connect support.

## Ressources

- [Santé Connect Documentation](https://sante-connect.fr/dev)
- [OAuth2 Standard](https://tools.ietf.org/html/rfc6749)
- [Enzo200 API Documentation](https://enzo200.fr/api)
