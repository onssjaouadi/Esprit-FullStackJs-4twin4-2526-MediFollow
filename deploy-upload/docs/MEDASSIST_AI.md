# MedAssist AI - Assistant Médical Intelligent

## Vue d'ensemble

MedAssist AI est un assistant médical intelligent intégré dans le dashboard du médecin. Il utilise Azure OpenAI GPT-4o pour fournir une assistance basée sur les données réelles de la base de données.

## Caractéristiques principales

### 1. **Connexion à la base de données**

- Accès direct aux données patients depuis MongoDB
- Chargement automatique du contexte médical complet
- Données en temps réel

### 2. **Contexte médical complet**

Pour chaque patient, MedAssist AI a accès à :

#### Informations patient

- Nom, âge, date de naissance
- Sexe, groupe sanguin
- Numéro de dossier médical
- Diagnostic principal
- Date de sortie d'hospitalisation

#### Traitements en cours

- Liste des médicaments
- Dosages et fréquences
- Dates de début/fin
- Notes associées

#### Signes vitaux

- 10 dernières mesures
- Tension artérielle (systolique/diastolique)
- Fréquence cardiaque
- Température
- Saturation en oxygène
- Poids
- Notes de mesure

#### Symptômes

- 5 derniers symptômes rapportés
- Type et sévérité
- Descriptions détaillées
- Dates d'occurrence

#### Alertes médicales

- 10 dernières alertes
- Type et sévérité
- Statut (ouvert/acquitté/résolu)
- Messages d'alerte
- Résolutions

#### Seuils configurés

- Plages normales pour chaque signe vital
- Personnalisé par patient

#### Contact d'urgence

- Nom et relation
- Numéro de téléphone

## Utilisation

### 1. Ouvrir l'assistant

Cliquer sur le bouton flottant en bas à droite du dashboard médecin.

### 2. Sélectionner un patient

- Le dropdown affiche tous les patients actifs
- Nombre d'alertes actives visible pour chaque patient
- Après sélection, le contexte médical est chargé automatiquement

### 3. Poser des questions

Exemples de questions que vous pouvez poser :

#### Résumé patient

```
"Donne-moi un résumé complet de ce patient"
"Quel est l'état général du patient ?"
```

#### Analyse des signes vitaux

```
"Analyse les dernières mesures de tension"
"Y a-t-il des valeurs anormales dans les signes vitaux ?"
"Quelle est la tendance de la fréquence cardiaque ?"
```

#### Interactions médicamenteuses

```
"Y a-t-il des interactions entre les médicaments actuels ?"
"Ce traitement est-il compatible avec ses antécédents ?"
```

#### Historique et suivi

```
"Quand a eu lieu la dernière mesure ?"
"Quelle est l'évolution des symptômes ?"
"Y a-t-il des alertes non résolues ?"
```

#### Recommandations

```
"Que recommandes-tu pour ce patient ?"
"Quel suivi est nécessaire ?"
"Quels examens complémentaires suggères-tu ?"
```

## Règles de sécurité

### 1. **Basé uniquement sur les données disponibles**

- Ne jamais inventer d'informations
- Si une donnée est absente : "Information non disponible dans le dossier patient"

### 2. **Réponses structurées**

Chaque réponse suit ce format :

1. Résumé patient
2. Données cliniques pertinentes
3. Analyse
4. Recommandation
5. Alertes éventuelles

### 3. **Priorité à la sécurité**

L'assistant signale automatiquement :

- ⚠️ Allergies connues
- ⚠️ Interactions médicamenteuses potentielles
- ⚠️ Valeurs biologiques anormales
- ⚠️ Alertes critiques non résolues

### 4. **Clause de non-responsabilité**

Toutes les réponses se terminent par :

> "Cette analyse est une assistance et ne remplace pas votre jugement clinique."

## Architecture technique

### Backend - Server Actions

**Fichier**: `lib/actions/medassist.actions.ts`

#### `getPatientMedicalContext(patientId)`

- Récupère toutes les données médicales d'un patient
- Vérifie que l'utilisateur est un médecin
- Formate les données pour l'IA
- Retourne un contexte structuré

#### `getDoctorPatientsList()`

- Liste tous les patients actifs
- Nombre d'alertes actives par patient
- Pour la sélection dans le ChatBot

### API Route

**Fichier**: `app/api/chatbot/route.ts`

- Endpoint POST `/api/chatbot`
- Reçoit les messages + contexte patient
- Construit le prompt système avec le contexte
- Appelle Azure OpenAI GPT-4o
- Retourne la réponse de l'IA

### Frontend - React Component

**Fichier**: `components/ChatBot.tsx`

Fonctionnalités :

- Sélecteur de patient avec dropdown
- Chargement automatique du contexte
- Interface de chat en temps réel
- Messages horodatés
- États de chargement
- Gestion des erreurs

## Prompt système

Le prompt système est conçu pour :

1. **Définir le rôle** : Assistant médical intelligent
2. **Règles strictes** : Utiliser uniquement les données disponibles
3. **Format de réponse** : Structuré et professionnel
4. **Sécurité** : Signaler les risques
5. **Limitation** : Ne pas remplacer le jugement médical

Le contexte patient est injecté directement dans le prompt système sous format JSON structuré.

## Limites et considérations

### Ce que MedAssist AI peut faire ✅

- Analyser les données disponibles
- Détecter des tendances
- Suggérer des pistes de diagnostic
- Vérifier les interactions médicamenteuses
- Rappeler les guidelines médicales
- Signaler les anomalies

### Ce que MedAssist AI ne peut pas faire ❌

- Poser un diagnostic définitif
- Prescrire des traitements
- Remplacer une consultation
- Accéder à des données non présentes dans la base
- Prendre des décisions cliniques à la place du médecin

## Confidentialité

- ✅ Accès restreint aux médecins uniquement
- ✅ Contexte patient chargé à la demande
- ✅ Pas de stockage des conversations
- ✅ Données transitent via API sécurisée
- ✅ Conforme RGPD (données médicales)

## Configuration requise

### Variables d'environnement

```env
AZURE_OPENAI_API_KEY=votre_clé
AZURE_OPENAI_ENDPOINT=https://votre-instance.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

### Dépendances

- Azure OpenAI Service
- MongoDB avec Prisma
- Next.js 14+
- React 18+

## Exemples d'utilisation

### Scénario 1 : Patient avec tension élevée

**Médecin** : "Analyse les dernières mesures de tension de ce patient"

**MedAssist AI** :

```
📊 RÉSUMÉ PATIENT
- Patient : Jean Dupont, 58 ans
- Diagnostic : Hypertension artérielle

📈 DONNÉES CLINIQUES PERTINENTES
Dernières mesures (3 derniers jours) :
- 02/03/2026 : 145/95 mmHg ⚠️
- 01/03/2026 : 140/90 mmHg ⚠️
- 28/02/2026 : 135/88 mmHg

Seuils configurés : 120-130 / 70-85 mmHg

🔍 ANALYSE
Tension systolique constamment au-dessus du seuil (145 vs 130 max).
Tendance à la hausse sur les 3 derniers jours.
Tension diastolique également élevée.

💡 RECOMMANDATION
- Vérifier l'observance du traitement antihypertenseur
- Envisager un ajustement de dosage
- Contrôle rapproché recommandé
- Évaluer facteurs de stress récents

⚠️ ALERTES
2 alertes actives pour hypertension

Cette analyse est une assistance et ne remplace pas votre jugement clinique.
```

### Scénario 2 : Vérification interactions médicamenteuses

**Médecin** : "Y a-t-il des interactions entre les médicaments actuels ?"

**MedAssist AI** :

```
💊 TRAITEMENTS EN COURS
1. Ramipril 10mg - 1x/jour (antihypertenseur)
2. Atorvastatine 20mg - 1x/jour (statine)
3. Aspirine 100mg - 1x/jour (antiagrégant)

🔍 ANALYSE DES INTERACTIONS
✅ Pas d'interaction majeure détectée
⚠️ Attention : Association Ramipril + Aspirine
   → Surveillance fonction rénale recommandée

💡 RECOMMANDATIONS
- Contrôle créatinine et kaliémie régulier
- Surveillance pression artérielle
- Respect des heures de prise (Atorvastatine le soir)

Cette analyse est une assistance et ne remplace pas votre jugement clinique.
```

## Support et maintenance

Pour toute question ou problème :

1. Vérifier les logs dans la console du navigateur
2. Vérifier les logs API dans `/app/api/chatbot/route.ts`
3. Vérifier la configuration Azure OpenAI
4. Vérifier la connexion base de données

## Évolutions futures

- [ ] Support multilingue
- [ ] Historique des conversations
- [ ] Export des analyses
- [ ] Suggestions proactives
- [ ] Intégration avec systèmes externes
- [ ] Analyse d'images médicales
- [ ] Recherche dans la littérature médicale
