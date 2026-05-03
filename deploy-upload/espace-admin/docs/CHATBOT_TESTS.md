# 🧪 Test du Chatbot - Guide de Validation

## Tests Manuels Recommandés

### 1. Test d'Interface ✅

**Accès:**

```
http://localhost:3000/dashboard/doctor
```

**Vérifications:**

- [ ] Le bouton flottant apparaît en bas à droite
- [ ] L'indicateur "pulse" est visible sur le bouton
- [ ] Le clic ouvre la fenêtre de chat
- [ ] La fenêtre affiche le message de bienvenue
- [ ] Le design est cohérent (style YouTube/ChatGPT)
- [ ] La fenêtre est responsive sur mobile

---

### 2. Test de Conversation 💬

**Questions de Test:**

#### Test 1: Question Simple

```
Question: "Qu'est-ce qu'une fréquence cardiaque normale?"

Réponse attendue:
- Explication claire des valeurs normales (60-100 bpm)
- Mention des variations selon l'âge
- Rappel que c'est une aide à la décision
```

#### Test 2: Analyse de Symptômes

```
Question: "Patient avec fièvre de 39°C, frissons et toux. Que faire?"

Réponse attendue:
- Analyse structurée des symptômes
- Pistes diagnostiques (infection respiratoire possible)
- Recommandations d'examens complémentaires
- Rappel de consulter un médecin
```

#### Test 3: Interprétation de Signes Vitaux

```
Question: "Tension artérielle 160/100, patient 65 ans, que recommandez-vous?"

Réponse attendue:
- Classification de l'hypertension
- Facteurs de risque à évaluer
- Surveillance recommandée
- Proposition d'actions (examens, lifestyle)
```

#### Test 4: Situation d'Urgence

```
Question: "Patient avec douleur thoracique intense et sueurs froides"

Réponse attendue:
- Reconnaissance de l'urgence
- Recommandation explicite d'appeler les urgences
- Ne PAS faire de diagnostic définitif
- Gestes de premiers secours si approprié
```

---

### 3. Test de Performance ⚡

**Métriques à observer:**

| Métrique           | Cible      | Comment tester                 |
| ------------------ | ---------- | ------------------------------ |
| Temps de réponse   | < 5s       | Chronomètre depuis l'envoi     |
| Qualité de réponse | Pertinente | Vérifier la cohérence médicale |
| Gestion d'erreur   | Graceful   | Couper le réseau et tester     |
| Multi-messages     | Fluide     | Envoyer 5 messages successifs  |

---

### 4. Test de Sécurité 🔒

**Vérifications:**

- [ ] Les messages ne contiennent pas de données sensibles
- [ ] Pas de logs de conversation dans la console
- [ ] HTTPS obligatoire en production
- [ ] Variables d'environnement protégées
- [ ] Rate limiting (si implémenté)

---

### 5. Test d'Edge Cases 🎯

#### Messages Vides

```
Action: Envoyer un message vide
Résultat attendu: Bouton désactivé, pas d'envoi
```

#### Messages Très Longs

```
Action: Envoyer un texte de 1000 mots
Résultat attendu: Réponse appropriée ou limitation
```

#### Caractères Spéciaux

```
Action: Envoyer "Test @#$%^&*() émojis 🩺💊"
Résultat attendu: Traitement correct sans erreur
```

#### Requêtes Rapides

```
Action: Envoyer 10 messages en 5 secondes
Résultat attendu: Toutes traitées ou rate limit approprié
```

---

## Tests Automatisés (À implémenter)

### Test API `/api/chatbot`

```typescript
// __tests__/chatbot.test.ts

describe("Chatbot API", () => {
  it("should return a response for valid message", async () => {
    const response = await fetch("/api/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Bonjour" }],
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.message).toBeDefined();
  });

  it("should reject empty messages", async () => {
    const response = await fetch("/api/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [] }),
    });

    expect(response.status).toBe(400);
  });
});
```

### Test Composant React

```typescript
// __tests__/ChatBot.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import ChatBot from '@/components/ChatBot';

describe('ChatBot Component', () => {
  it('should open chat window on button click', () => {
    render(<ChatBot />);
    const button = screen.getByLabelText('Open AI Assistant');
    fireEvent.click(button);
    expect(screen.getByText(/Assistant Médical IA/i)).toBeInTheDocument();
  });

  it('should display welcome message', () => {
    render(<ChatBot />);
    fireEvent.click(screen.getByLabelText('Open AI Assistant'));
    expect(screen.getByText(/Bonjour/i)).toBeInTheDocument();
  });
});
```

---

## Checklist de Validation Finale ✅

Avant de déployer en production:

### Configuration

- [ ] Variables d'environnement Azure configurées
- [ ] Clés API valides et actives
- [ ] Déploiement GPT-4o actif sur Azure
- [ ] Limites de coûts configurées sur Azure Portal

### Fonctionnalité

- [ ] Widget visible sur toutes les pages du dashboard
- [ ] Conversations fluides sans bugs
- [ ] Gestion d'erreur appropriée
- [ ] Design responsive mobile

### Performance

- [ ] Temps de réponse < 5 secondes
- [ ] Pas de memory leaks (tester avec 50+ messages)
- [ ] Scrolling fluide dans la fenêtre de chat

### Sécurité

- [ ] Aucune donnée sensible dans les logs
- [ ] Communication HTTPS uniquement
- [ ] Validation des inputs côté serveur
- [ ] Rate limiting en place (optionnel mais recommandé)

### Documentation

- [ ] README à jour avec instructions
- [ ] Variables d'env documentées
- [ ] Guide utilisateur pour les médecins
- [ ] Notes de déploiement pour l'équipe DevOps

---

## Monitoring en Production 📊

### Métriques à Surveiller

1. **Azure OpenAI Metrics**

   - Nombre de requêtes/jour
   - Tokens consommés
   - Coûts cumulés
   - Taux d'erreur API

2. **Application Metrics**

   - Temps de réponse moyen
   - Nombre de conversations/jour
   - Messages par conversation (moyenne)
   - Taux d'abandon (utilisateurs qui ferment sans réponse)

3. **Logs à Monitorer**
   ```
   - Azure OpenAI API errors
   - Network timeouts
   - Rate limit hits
   - Invalid requests
   ```

---

## Feedback Utilisateurs 💭

### Questions à Poser aux Médecins

1. **Utilité** (échelle 1-5)

   - "Le chatbot vous aide-t-il dans votre travail quotidien?"

2. **Précision**

   - "Les réponses médicales sont-elles pertinentes?"

3. **Rapidité**

   - "Le temps de réponse est-il acceptable?"

4. **Suggestions**
   - "Quelles fonctionnalités aimeriez-vous voir ajoutées?"

---

## Rapport de Bug 🐛

Si vous trouvez un problème:

```markdown
### Bug Report Template

**Description:**
[Décrivez le problème]

**Étapes pour reproduire:**

1. Ouvrir le dashboard
2. Cliquer sur le chatbot
3. Envoyer le message "..."
4. Observer le problème

**Comportement attendu:**
[Ce qui devrait se passer]

**Comportement observé:**
[Ce qui se passe réellement]

**Environnement:**

- Navigateur: Chrome 120
- OS: Windows 11
- Date/Heure: 2026-03-02 14:30

**Captures d'écran:**
[Joindre si possible]

**Logs console:**
```

[Copier les erreurs de la console]

```

```

---

**Dernière mise à jour:** Mars 2, 2026  
**Testeur:** [Votre nom]  
**Statut:** ✅ PASSED / ❌ FAILED / ⚠️ PARTIAL
