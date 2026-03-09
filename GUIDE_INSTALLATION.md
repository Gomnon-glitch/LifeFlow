# ⚡ LifeFlow — Guide d'installation sur Pixel via GitHub Pages

---

## 📋 Pré-requis

- Un compte GitHub (gratuit) → [github.com](https://github.com)
- Git installé sur ton PC → [git-scm.com](https://git-scm.com/downloads)
- Google Chrome sur ton Pixel

---

## 🚀 Partie 1 : Mise en ligne (première fois)

### Étape 1 — Créer un compte GitHub (si pas déjà fait)
1. Va sur **github.com** → **Sign up**
2. Choisis un nom d'utilisateur (ex: `jason-music`)
3. Confirme ton email

### Étape 2 — Créer un repository
1. Sur GitHub, clique le bouton vert **"New"** (ou **"+"** en haut à droite → **New repository**)
2. Remplis :
   - **Repository name** : `lifeflow`
   - **Description** : `Dashboard personnel d'optimisation`
   - **Public** ✅ (obligatoire pour GitHub Pages gratuit)
   - ❌ Ne coche PAS "Add a README file"
3. Clique **"Create repository"**

### Étape 3 — Envoyer les fichiers depuis ton PC
Ouvre un **terminal / PowerShell** dans le dossier `Documents\AI\Lifestyle` et tape ces commandes **une par une** :

```bash
git init
git add .
git commit -m "LifeFlow v1"
git branch -M main
git remote add origin https://github.com/TON-USERNAME/lifeflow.git
git push -u origin main
```

> ⚠️ Remplace `TON-USERNAME` par ton nom d'utilisateur GitHub

Si c'est la première fois que tu utilises Git, il te demandera de te connecter. Suis les instructions à l'écran.

### Étape 4 — Activer GitHub Pages
1. Sur GitHub, va dans ton repo `lifeflow`
2. Clique **Settings** (engrenage en haut)
3. Dans le menu à gauche, clique **Pages**
4. Sous **"Source"**, sélectionne :
   - **Branch** : `main`
   - **Folder** : `/ (root)`
5. Clique **Save**
6. ⏳ Attends 1-2 minutes

### Étape 5 — Récupérer ton URL
1. Retourne dans **Settings → Pages**
2. Tu verras un message : **"Your site is live at"** suivi d'une URL comme :
   ```
   https://TON-USERNAME.github.io/lifeflow/
   ```
3. **Copie cette URL** — c'est l'adresse de ton app !

### Étape 6 — Installer sur ton Pixel
1. Ouvre **Chrome** sur ton Pixel
2. Va à l'URL : `https://TON-USERNAME.github.io/lifeflow/`
3. Attends que la page charge complètement
4. **Option A** : Un bandeau apparaît en bas → tape **"Installer"**
5. **Option B** : Tape les **3 points ⋮** en haut à droite → **"Installer l'application"**
6. Confirme → ⚡ **LifeFlow apparaît sur ton écran d'accueil !**

### Étape 7 — Activer les notifications
1. Ouvre l'app LifeFlow depuis ton écran d'accueil
2. Va dans l'onglet **⚙️ Config**
3. Descends jusqu'à **🔔 Notifications**
4. Clique **"Activer les notifications"**
5. Autorise quand Chrome te le demande
6. ✅ Tu recevras désormais tes rappels !

---

## 🔄 Partie 2 : Mettre à jour l'app après des modifications

Chaque fois que tu modifies un fichier (ex: ajouter une habitude, changer le planning, ou que je fais une modification), voici comment mettre à jour l'app sur ton Pixel :

### Sur ton PC — Envoyer les modifications

Ouvre un **terminal / PowerShell** dans le dossier `Documents\AI\Lifestyle` :

```bash
git add .
git commit -m "Description de la modification"
git push
```

> 💡 Exemples de messages de commit :
> - `git commit -m "Ajout nouveau template déplacement"`
> - `git commit -m "Correction KPI japonais"`
> - `git commit -m "Nouvelle habitude méditation"`

### Sur ton Pixel — Rafraîchir l'app

1. **Ouvre LifeFlow** sur ton Pixel
2. **Tire vers le bas** pour rafraîchir (pull-to-refresh) — OU —
3. Va dans les **⋮ → Actualiser** si l'app est en mode PWA

> ⏳ GitHub Pages met environ **1-2 minutes** à se mettre à jour après un `git push`.
> Si tu ne vois pas les changements immédiatement, attends un peu et rafraîchis à nouveau.

### 🧹 Si l'ancienne version reste bloquée (cache)

Le Service Worker met les fichiers en cache pour le mode hors-ligne. Si une vieille version reste :

1. Ouvre Chrome sur ton Pixel
2. Va à l'adresse de ton app
3. **⋮ → Paramètres du site → Effacer les données**
4. Recharge la page

---

## ☁️ Synchronisation Cloud & Multi-appareils

LifeFlow intègre désormais une synchronisation Cloud via Firebase pour partager tes données entre ton PC et ton Pixel en temps réel.

👉 **Lis le fichier `GUIDE_FIREBASE.md` pour savoir comment configurer cette synchronisation (c'est gratuit et ça prend 5 minutes !).**

---

## 📝 Résumé rapide

| Action | Commande / Étape |
|--------|-----------------|
| **Première installation** | `git init` → `git push` → GitHub Pages → Chrome → Installer |
| **Mise à jour** | `git add .` → `git commit -m "..."` → `git push` |
| **Voir sur Pixel** | Ouvrir l'app → tirer pour rafraîchir |
| **Forcer la MAJ** | Effacer les données du site dans Chrome |

---

## ❓ En cas de problème

| Problème | Solution |
|----------|----------|
| `git push` demande un mot de passe | Utilise un **Personal Access Token** (GitHub → Settings → Developer settings → Tokens) |
| La page affiche une erreur 404 | Vérifie que GitHub Pages pointe sur `main` / `root` dans Settings → Pages |
| L'app ne se met pas à jour sur Pixel | Attends 2 min + efface le cache du site |
| "Installer l'application" n'apparaît pas | L'app doit être servie en HTTPS (GitHub Pages le fait automatiquement) |
