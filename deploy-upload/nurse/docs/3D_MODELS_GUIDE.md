# 🎨 Guide des Modèles 3D Gratuits pour Corps Humain

## 📦 Sources recommandées de modèles 3D gratuits

### 1. **Sketchfab** ⭐ (Recommandé)

🔗 https://sketchfab.com/3d-models?features=downloadable&sort_by=-likeCount&q=human+anatomy

**Avantages :**

- ✅ Modèles de haute qualité
- ✅ Format GLB/GLTF natif (compatible Three.js)
- ✅ Licence Creative Commons clairement indiquée
- ✅ Prévisualisation 3D avant téléchargement
- ✅ Anatomie détaillée avec organes

**Modèles recommandés :**

- "Human Anatomy" par various artists
- "Male/Female Body Anatomy"
- "Heart 3D Model"
- "Human Skeleton"

**Comment télécharger :**

1. Cliquez sur le modèle
2. Bouton "Download 3D Model"
3. Sélectionnez format **GLB** ou **GLTF**
4. Vérifiez la licence (CC BY, CC0, etc.)

---

### 2. **CGTrader**

🔗 https://www.cgtrader.com/free-3d-models/character/anatomy

**Avantages :**

- ✅ Section dédiée aux modèles gratuits
- ✅ Qualité professionnelle
- ✅ Divers formats disponibles

**Formats à privilégier :**

- GLB (optimisé, un seul fichier)
- GLTF (standard web)
- FBX (conversion possible)

---

### 3. **Mixamo** (Adobe)

🔗 https://www.mixamo.com

**Avantages :**

- ✅ Gratuit avec compte Adobe
- ✅ Personnages 3D animés
- ✅ Animations préfabriquées
- ✅ Export FBX

**Note :** Nécessite conversion FBX → GLB

---

### 4. **TurboSquid Free Models**

🔗 https://www.turbosquid.com/Search/3D-Models/free/human-anatomy

**Avantages :**

- ✅ Certains modèles gratuits de qualité
- ✅ Anatomie détaillée

---

### 5. **Free3D**

🔗 https://free3d.com/3d-models/human-anatomy

**Avantages :**

- ✅ 100% gratuit
- ✅ Pas d'inscription requise
- ✅ Plusieurs formats

---

### 6. **Poly Pizza** (anciennement Google Poly)

🔗 https://poly.pizza

**Avantages :**

- ✅ Modèles low-poly optimisés
- ✅ Format GLB direct
- ✅ Licence CC0 (domaine public)

---

## 🚀 Installation dans votre projet

### Étape 1 : Télécharger le modèle

```bash
# Créer le dossier models dans public
mkdir public/models
```

### Étape 2 : Placer le fichier GLB

```
healthcare-main/
├── public/
│   └── models/
│       └── human-body.glb    ← Placez votre modèle ici
```

### Étape 3 : Utiliser le composant

Le composant `HumanBody3DModel.tsx` est déjà configuré pour charger :

- `/public/models/human-body.glb`

### Étape 4 : Mettre à jour page.tsx

```tsx
import HumanBody3DModel from "@/components/HumanBody3DModel";

// Dans votre JSX :
<HumanBody3DModel />;
```

---

## 🔧 Conversion de formats

Si vous avez un modèle dans un autre format (FBX, OBJ, etc.), convertissez-le en GLB :

### Option 1 : Blender (Gratuit)

1. Installer Blender : https://www.blender.org/download/
2. Importer votre modèle : `File > Import > FBX/OBJ`
3. Exporter en GLB : `File > Export > glTF 2.0 (.glb)`

### Option 2 : Convertisseurs en ligne

- **glTF Converter** : https://products.aspose.app/3d/conversion/fbx-to-gltf
- **AnyConv** : https://anyconv.com/fbx-to-glb-converter/
- **CloudConvert** : https://cloudconvert.com/fbx-to-glb

---

## 📏 Optimisation du modèle

Pour de meilleures performances :

### Réduire la taille du fichier

1. **gltf-transform** (outil NPM) :

```bash
npx gltf-transform optimize input.glb output.glb
```

2. **Réduire les textures** :
   - Max 2048x2048 pixels
   - Format KTX2 ou compressé

3. **Réduire les polygones** :
   - Utilisez Blender : `Modifiers > Decimate`
   - Target : 10k-50k triangles

### Taille recommandée

- ✅ Optimal : < 5 MB
- ⚠️ Acceptable : 5-15 MB
- ❌ Trop lourd : > 15 MB

---

## 🎯 Modèles spécifiques recommandés

### Pour anatomie médicale :

1. **"Human Heart Anatomy"** sur Sketchfab
   - Détails des organes
   - Animations du cœur

2. **"Full Human Anatomy"**
   - Corps complet avec organes
   - Squelette et muscles

3. **"Anatomical Body"**
   - Style médical professionnel
   - Organes séparés

### Pour interface utilisateur :

1. **Low-poly human models**
   - Chargement rapide
   - Style moderne

2. **Stylized anatomy**
   - Coloré et attractif
   - Moins de détails, plus rapide

---

## 📝 Licences à vérifier

Avant d'utiliser un modèle, vérifiez la licence :

### ✅ Licences permissives (OK pour usage commercial) :

- **CC0** (Public Domain) - Aucune restriction
- **CC BY** - Attribution requise
- **CC BY-SA** - Attribution + même licence

### ⚠️ Licences restrictives :

- **CC BY-NC** - Pas d'usage commercial
- **CC BY-ND** - Pas de modification
- **CC BY-NC-ND** - Usage personnel uniquement

### Où trouver la licence ?

- Sur la page de téléchargement
- Dans le fichier LICENSE.txt inclus
- Dans les métadonnées du fichier GLB

---

## 🔍 Exemple de recherche efficace

### Sur Sketchfab :

```
"human anatomy" + filtre "Downloadable" + format "glTF"
```

### Mots-clés utiles :

- `human anatomy 3d model`
- `medical body scan`
- `anatomical model`
- `internal organs`
- `human heart 3d`
- `skeleton anatomy`

---

## 🎨 Alternative : Créer un modèle personnalisé

Si vous ne trouvez pas de modèle gratuit adapté :

### Services de scan 3D :

- **Polycam** (app mobile) - Scan avec smartphone
- **Meshroom** (gratuit) - Photogrammétrie

### Générateurs IA :

- **Meshy.ai** - Texte vers modèle 3D
- **Luma AI** - Photos vers 3D

---

## 💡 Astuce : Tester rapidement

Pour tester sans télécharger, utilisez une URL CDN temporaire :

```tsx
// Dans HumanBody3DModel.tsx
const modelUrl = "https://models.readyplayer.me/VOTRE_ID.glb";
```

Exemple avec Ready Player Me (avatars 3D gratuits) :

1. Créez un avatar : https://readyplayer.me/
2. Copiez l'URL GLB
3. Utilisez-la pour tester

---

## 🆘 Problèmes courants

### Le modèle ne s'affiche pas

- ✅ Vérifiez le chemin : `/models/human-body.glb`
- ✅ Vérifiez dans `public/models/`
- ✅ Redémarrez le serveur Next.js

### Le modèle est trop grand/petit

```tsx
<primitive object={gltf.scene} scale={2} /> // Ajustez le scale
```

### Le modèle est trop sombre

```tsx
<ambientLight intensity={1.5} /> // Augmentez l'intensité
```

### Performance lente

- Réduisez la taille du fichier (< 5 MB)
- Optimisez avec gltf-transform
- Utilisez le format Draco compressé

---

## 📚 Ressources supplémentaires

- **Three.js Documentation** : https://threejs.org/docs/
- **React Three Fiber** : https://docs.pmnd.rs/react-three-fiber
- **glTF Viewer** : https://gltf-viewer.donmccurdy.com/ (tester vos modèles)
- **Blender Tutorials** : https://www.blender.org/support/tutorials/

---

## ✨ Résumé rapide

1. 🔍 **Cherchez** sur Sketchfab (meilleure source)
2. 📥 **Téléchargez** en format GLB
3. 📁 **Placez** dans `/public/models/`
4. 🔄 **Utilisez** `HumanBody3DModel` component
5. 🎨 **Personnalisez** les points vitaux et animations

**Temps estimé :** 10-15 minutes pour tout configurer ! 🚀
