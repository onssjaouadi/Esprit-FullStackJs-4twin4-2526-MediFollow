# 🤖 Assistant Médical IA - Chatbot Azure OpenAI

## 📋 Vue d'ensemble

Le chatbot médical IA est intégré dans le dashboard docteur de MediFollow. Il utilise **Azure OpenAI (GPT-4o)** pour fournir une assistance médicale intelligente aux médecins.

## ✨ Fonctionnalités

### Assistance Médicale

- 🩺 **Analyse des signes vitaux** - Interprétation des données physiologiques
- 💊 **Suggestions de diagnostic** - Pistes basées sur les symptômes rapportés
- ⚠️ **Gestion des alertes** - Recommandations pour les situations critiques
- 📚 **Informations médicales** - Connaissances médicales et best practices
- 🎯 **Aide à la décision** - Support pour le jugement clinique

### Interface Utilisateur

- 💬 Widget de chat flottant (coin inférieur droit)
- 🎨 Design moderne et épuré (style YouTube/ChatGPT)
- ⚡ Réponses en temps réel
- 📱 Responsive (mobile et desktop)
- 🌊 Animation fluide et intuitive

## 🔧 Configuration Technique

### Variables d'environnement (.env)

```env
# Azure OpenAI
AZURE_OPENAI_API_KEY="your-api-key"
AZURE_OPENAI_ENDPOINT="https://survive-openai.openai.azure.com/"
AZURE_OPENAI_DEPLOYMENT="gpt-4o"
AZURE_OPENAI_API_VERSION="2024-02-15-preview"
```

### Architecture

```
├── app/api/chatbot/route.ts          # API endpoint (Edge runtime)
├── components/ChatBot.tsx             # Composant React du chatbot
└── app/dashboard/doctor/layout.tsx   # Intégration dans le dashboard
```

## 🚀 Utilisation

### Pour les Médecins

1. **Ouvrir le chat**

   - Cliquer sur l'icône de chat flottante (coin inférieur droit)
   - L'assistant se présente avec un message de bienvenue

2. **Poser une question**

   - Tapez votre question dans le champ de texte
   - Appuyez sur Entrée ou cliquez sur le bouton d'envoi
   - L'assistant analyse et répond en quelques secondes

3. **Exemples de questions**
   ```
   - "Comment interpréter une fréquence cardiaque élevée chez un patient post-opératoire?"
   - "Quels sont les signes d'une infection post-chirurgicale?"
   - "Recommandations pour un patient avec une tension artérielle de 160/95?"
   - "Analyse des symptômes: fièvre, douleur abdominale, nausées"
   ```

### Bonnes Pratiques

✅ **À faire:**

- Poser des questions claires et spécifiques
- Fournir le contexte médical pertinent
- Utiliser les suggestions comme aide à la décision
- Toujours vérifier les recommandations avec votre expertise

❌ **À éviter:**

- Ne pas partager d'informations personnelles identifiables
- Ne pas se fier uniquement à l'IA pour des décisions critiques
- Ne pas utiliser pour des urgences vitales (appeler le 911)

## 🔒 Sécurité et Confidentialité

### Protection des Données

- ✅ Aucune donnée patient stockée dans les messages
- ✅ Communication chiffrée (HTTPS)
- ✅ Pas de logs de conversations côté Azure
- ✅ Respect du RGPD et HIPAA

### Limitations

- ⚠️ L'IA est un **outil d'assistance**, pas un remplacement du médecin
- ⚠️ Les réponses doivent être **validées par un professionnel**
- ⚠️ Ne convient pas pour les **urgences médicales**

## 🎯 Contexte du Prompt Système

L'assistant est configuré avec un prompt médical spécifique:

```typescript
Tu es un assistant médical IA pour MediFollow, une plateforme de suivi post-hospitalisation.

Ton rôle est d'aider les médecins avec:
- Analyse des signes vitaux et interprétation des données
- Suggestions de diagnostic basées sur les symptômes
- Recommandations pour la gestion des alertes critiques
- Informations médicales générales et best practices
- Aide à la prise de décision clinique

Règles importantes:
- Réponds en français de manière professionnelle et concise
- Base tes réponses sur des connaissances médicales validées
- Rappelle toujours que tu es un outil d'aide à la décision
- En cas de situation critique, recommande une intervention humaine
- Ne fournis jamais de diagnostic définitif
```

## 📊 Métriques et Performance

### Temps de Réponse

- Moyenne: 2-4 secondes
- Dépend de la complexité de la question
- Edge runtime pour une latence minimale

### Coûts Azure OpenAI

- Modèle: GPT-4o
- ~1000 tokens par requête moyenne
- Estimer les coûts via Azure Portal

## 🛠️ Développement

### Tester localement

```bash
# Démarrer le serveur Next.js
npm run dev

# Accéder au dashboard docteur
http://localhost:3000/dashboard/doctor

# Le chatbot apparaît automatiquement en bas à droite
```

### Modifier le Prompt Système

Éditer [app/api/chatbot/route.ts](../app/api/chatbot/route.ts):

```typescript
const systemMessage: Message = {
  role: "system",
  content: `Votre nouveau prompt ici...`,
};
```

### Personnaliser le Design

Éditer [components/ChatBot.tsx](../components/ChatBot.tsx) pour modifier:

- Couleurs (classes Tailwind)
- Taille de la fenêtre
- Animations
- Messages par défaut

## 🐛 Dépannage

### Erreur: "Azure OpenAI configuration is missing"

- Vérifier que toutes les variables d'env sont définies dans `.env`
- Redémarrer le serveur après modification du `.env`

### Erreur: "Failed to get response from AI"

- Vérifier la clé API Azure
- Vérifier que le déploiement GPT-4o est actif dans Azure Portal
- Consulter les logs d'erreur Azure

### Le chatbot ne s'affiche pas

- Vérifier que vous êtes sur une page du dashboard docteur
- Ouvrir la console navigateur pour voir les erreurs
- Vérifier que le composant ChatBot est importé dans le layout

## 📚 Ressources

- [Documentation Azure OpenAI](https://learn.microsoft.com/azure/cognitive-services/openai/)
- [GPT-4o Model](https://platform.openai.com/docs/models/gpt-4o)
- [Next.js Edge Runtime](https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes)

## 📝 Notes Importantes

1. **Responsabilité Médicale**

   - L'assistant IA ne remplace pas le jugement médical professionnel
   - Toujours valider les recommandations avant application
   - En cas de doute, consulter un spécialiste

2. **Évolution Future**

   - Intégration avec les données patients (avec consentement)
   - Analyse contextuelle basée sur l'historique
   - Suggestions prédictives basées sur les patterns
   - Multi-langues (anglais, arabe, etc.)

3. **Feedback**
   - Les retours des médecins sont essentiels
   - Rapporter les réponses incorrectes ou inappropriées
   - Suggérer des améliorations via les issues GitHub

---

**Version:** 1.0.0  
**Dernière mise à jour:** Mars 2, 2026  
**Contact:** dev@medifollow.health
