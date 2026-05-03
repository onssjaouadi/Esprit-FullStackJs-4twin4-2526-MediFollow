# 📚 INDEX DE LA DOCUMENTATION

Bienvenue dans la documentation complète du projet **MediFollow – Post-Hospitalization Remote Monitoring Platform** !

---

## 📖 Documents Disponibles

### 1️⃣ **README-FR.md** - Vue d'ensemble

📄 [Lire le README](README-FR.md)

**Contenu :**

- ✨ Aperçu du projet
- 🎯 Fonctionnalités principales
- 🚀 Installation rapide
- 📱 Guide d'utilisation
- 🛠️ Stack technique
- 📊 Statistiques

**👉 Commencez par ici pour avoir une vue globale du projet**

---

### 2️⃣ **GUIDE-DEMARRAGE.md** - Guide de démarrage rapide

📄 [Lire le Guide](GUIDE-DEMARRAGE.md)

**Contenu :**

- ⚡ Installation en 5 minutes
- 🎯 Tester l'application (étape par étape)
- 🔧 Scripts disponibles
- ⚙️ Configuration détaillée
- 🐛 Dépannage complet
- 💡 Conseils pratiques
- ✅ Checklist de démarrage

**👉 Parfait pour démarrer et utiliser l'application rapidement**

---

### 3️⃣ **DOCUMENTATION.md** - Documentation technique complète

📄 [Lire la Documentation](DOCUMENTATION.md)

**Contenu :**

- 🏗️ Architecture du projet (détaillée)
- 🗄️ Base de données Appwrite (toutes les collections)
- 🚀 Flux de l'application (patient & admin)
- 📱 Description de toutes les pages
- 🔧 Composants React (description complète)
- 🔐 Authentification & sécurité
- 📊 Gestion des données (Server Actions)
- 🎨 Design & styles
- 🔍 Validation des données (Zod)
- 🚨 Monitoring & erreurs
- 📦 Dépendances détaillées
- ⚙️ Configuration avancée
- 🔄 Workflow de développement
- 📈 Données de démonstration
- 🎯 Fonctionnalités (liste complète)
- 🐛 Bugs corrigés
- 📞 Support & ressources

**👉 Document de référence pour les développeurs**

---

### 4️⃣ **DIAGRAMMES.md** - Schémas visuels

📄 [Lire les Diagrammes](DIAGRAMMES.md)

**Contenu :**

- 🏗️ Architecture globale (schéma)
- 🔄 Flux détaillé patient (avec ASCII art)
- 👨‍💼 Flux détaillé admin (avec ASCII art)
- 🗄️ Structure base de données (schéma)
- 🔗 Relations entre entités
- 🎨 Hiérarchie des composants
- 🔄 Cycle de vie d'un rendez-vous
- 📦 Stack technique complet (visuel)

**👉 Pour comprendre visuellement l'architecture et les flux**

---

## 🎯 Par Où Commencer ?

### **Je veux juste utiliser l'app**

1. [README-FR.md](README-FR.md) - Section "Démarrage Rapide"
2. [GUIDE-DEMARRAGE.md](GUIDE-DEMARRAGE.md) - Section "Installation"
3. Lancez `npm run dev`

### **Je veux comprendre le projet**

1. [README-FR.md](README-FR.md) - Vue d'ensemble complète
2. [DIAGRAMMES.md](DIAGRAMMES.md) - Schémas visuels
3. [DOCUMENTATION.md](DOCUMENTATION.md) - Architecture détaillée

### **Je veux développer/modifier**

1. [GUIDE-DEMARRAGE.md](GUIDE-DEMARRAGE.md) - Configuration
2. [DOCUMENTATION.md](DOCUMENTATION.md) - Composants & API
3. [DIAGRAMMES.md](DIAGRAMMES.md) - Flux de données

### **J'ai un problème**

1. [GUIDE-DEMARRAGE.md](GUIDE-DEMARRAGE.md) - Section "Dépannage"
2. [DOCUMENTATION.md](DOCUMENTATION.md) - Section "Bugs corrigés"

---

## 📊 Résumé Rapide

### **Technologies**

- Next.js 14, TypeScript, Tailwind CSS
- MongoDB + Prisma ORM, JWT Auth, Aptos Blockchain
- Twilio (SMS), SendGrid (Email), Firebase (Push), Sentry (Monitoring)

### **Fonctionnalités**

- 👤 Authentification & gestion utilisateurs (Patient/Doctor/Admin)
- ❤️ Saisie constantes vitales (BP, HR, Temp, SpO2, Poids)
- 🚨 Alertes automatiques (détection anomalies)
- 📊 Tableaux de bord personnalisés par rôle
- 📱 Notifications multi-canaux (SMS, Email, Push, In-App)
- ⛓️ Audit trail + preuve blockchain (Aptos)
- 🔐 Sessions sécurisées avec refresh tokens

### **Base de données MongoDB + Prisma**

- 11 modèles : User, Patient, VitalRecord, Symptom, Alert, Service, Questionnaire, AuditLog, BlockchainProof, Notification, Session
- Relations : User → Patient, Patient → VitalRecords/Alerts/Symptoms
- Blockchain : Preuves d'intégrité pour VitalRecords et AuditLogs
- Données démo : Patients post-op, constantes vitales, alertes

### **Démarrage**

```bash
npm install
npm run dev
```

---

## 🔍 Navigation Rapide

### Par Sujet

#### **Installation & Configuration**

- [Installation rapide](GUIDE-DEMARRAGE.md#-installation-en-5-minutes)
- [Variables d'environnement](GUIDE-DEMARRAGE.md#️-configuration)
- [Scripts disponibles](GUIDE-DEMARRAGE.md#-scripts-utiles)

#### **Architecture & Design**

- [Architecture globale](DIAGRAMMES.md#️-architecture-globale)
- [Structure du projet](DOCUMENTATION.md#️-architecture-du-projet)
- [Composants](DOCUMENTATION.md#-composants-principaux)

#### **Base de Données**

- [Collections Appwrite](DOCUMENTATION.md#️-base-de-données-appwrite)
- [Schéma de la BDD](DIAGRAMMES.md#️-structure-base-de-données)
- [Relations](DIAGRAMMES.md#-relations-entre-entités)

#### **Flux de l'Application**

- [Flux patient](DIAGRAMMES.md#-flux-détaillé-patient)
- [Flux admin](DIAGRAMMES.md#-flux-détaillé-admin)
- [Cycle de vie RDV](DIAGRAMMES.md#-cycle-de-vie-dun-rendez-vous)

#### **Développement**

- [Server Actions](DOCUMENTATION.md#-gestion-des-données)
- [Validation](DOCUMENTATION.md#-validation-des-données)
- [Personnalisation](GUIDE-DEMARRAGE.md#-personnalisation)

#### **Support**

- [Dépannage](GUIDE-DEMARRAGE.md#-dépannage)
- [Bugs corrigés](DOCUMENTATION.md#-bugs-corrigés)
- [Ressources](DOCUMENTATION.md#-support--ressources)

---

## 📝 Contributeurs

Documents créés le **2 Mars 2026** par l'équipe de documentation.

### Historique des versions

- **v1.0** (2 Mars 2026) - Documentation initiale complète

---

## 💡 Comment Utiliser Cette Documentation

### **Format Markdown**

Tous les documents sont en Markdown (.md) avec :

- ✅ Tables des matières cliquables
- ✅ Liens internes entre documents
- ✅ Code formaté avec coloration syntaxique
- ✅ Tableaux, listes, schémas ASCII

### **Navigation**

- Cliquez sur les liens bleus pour naviguer
- Utilisez Ctrl+F pour rechercher
- Tous les titres sont des ancres cliquables

### **Impression**

Les documents sont optimisés pour l'impression :

- Format A4
- Police lisible
- Pas de couleurs excessives

---

## 🎓 Parcours Pédagogique Recommandé

### **Niveau Débutant**

1. ✅ Lire [README-FR.md](README-FR.md) - Section "Aperçu"
2. ✅ Suivre [GUIDE-DEMARRAGE.md](GUIDE-DEMARRAGE.md) - Installation
3. ✅ Tester l'application (créer un patient)
4. ✅ Explorer [DIAGRAMMES.md](DIAGRAMMES.md) - Flux patient

### **Niveau Intermédiaire**

1. ✅ Lire [DOCUMENTATION.md](DOCUMENTATION.md) - Architecture
2. ✅ Explorer [DIAGRAMMES.md](DIAGRAMMES.md) - Tous les flux
3. ✅ Modifier un composant
4. ✅ Personnaliser les couleurs/styles

### **Niveau Avancé**

1. ✅ Étudier [DOCUMENTATION.md](DOCUMENTATION.md) - Server Actions
2. ✅ Comprendre [DOCUMENTATION.md](DOCUMENTATION.md) - Validation
3. ✅ Ajouter une fonctionnalité
4. ✅ Optimiser les performances

---

## 📞 Besoin d'Aide ?

### **Questions Fréquentes**

**Q: Par où commencer ?**  
R: Lisez [README-FR.md](README-FR.md) puis [GUIDE-DEMARRAGE.md](GUIDE-DEMARRAGE.md)

**Q: Comment installer l'app ?**  
R: Voir [GUIDE-DEMARRAGE.md](GUIDE-DEMARRAGE.md#-étapes-dinstallation)

**Q: J'ai une erreur ?**  
R: Consultez [GUIDE-DEMARRAGE.md](GUIDE-DEMARRAGE.md#-dépannage)

**Q: Comment fonctionne la BDD ?**  
R: Voir [DOCUMENTATION.md](DOCUMENTATION.md#️-base-de-données-appwrite)

**Q: Où sont les schémas ?**  
R: Dans [DIAGRAMMES.md](DIAGRAMMES.md)

**Q: Comment contribuer ?**  
R: Voir [README-FR.md](README-FR.md#-contribution)

### **Support**

medifollow.health

- 💬 Discord : [MediFollow Community](https://discord.gg/medifollow)
- 🐛 Issues : [GitHub](https://github.com/medifollow/platformEdbFJ)
- 🐛 Issues : [GitHub](https://github.com/adrianhajdin/healthcare/issues)

---

## ✨ Mise à Jour

Cette documentation est maintenue et mise à jour régulièrement.

**Dernière mise à jour** : 2 Mars 2026

**Prochaines mises à jour prévues** :

- 🔜 Tutoriels vidéo
- 🔜 Exemples de code supplémentaires
- 🔜 FAQ étendue
- 🔜 Glossaire technique

---

## 🎉 Bon Développement !

Vous avez maintenant accès à toute la documentation nécessaire pour :

- ✅ Installer et utiliser l'application
- ✅ Comprendre l'architecture
- ✅ Développer de nouvelles fonctionnalités
- ✅ Résoudre les problèmes
- ✅ Contribuer au projet

**N'hésitez pas à explorer tous les documents ! 🚀**

---

<div align="center">

**📖 Documentation MediFollow**

[README](README-FR.md) • [Guide](GUIDE-DEMARRAGE.md) • [Docs](DOCUMENTATION.md) • [Diagrammes](DIAGRAMMES.md)

_Fait avec ❤️ pour la santé numérique au Maghreb_

</div>
