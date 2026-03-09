# ☁️ Guide Configuration Firebase — LifeFlow

Ce guide va t'expliquer étape par étape comment créer ton projet Firebase pour activer la **Synchronisation Cloud et Multi-appareils** dans ton application LifeFlow. C'est 100% gratuit !

---

## Étape 1 : Créer le projet Firebase

1. Rends-toi sur la [Console Firebase](https://console.firebase.google.com/) et connecte-toi avec ton compte Google.
2. Clique sur le bouton **"Ajouter un projet"** (ou "Créer un projet").
3. Nomme le projet (par exemple `lifeflow-sync`).
4. Firebase te demandera si tu veux activer Google Analytics. **Désactive-le** (tu n'en as pas besoin pour ce projet perso) et clique sur **Créer le projet**.
5. Attends quelques secondes... puis clique sur **Continuer**.

---

## Étape 2 : Activer l'Authentification Google

Pour sécuriser tes données, on va s'assurer que seul TOI puisses y accéder via ton compte Google.

1. Dans la console Firebase, regarde le menu de gauche. Clique sur **Développer** (l'icône avec les blocs) puis sur **Authentication**.
2. Clique sur **Commencer**.
3. Dans l'onglet **"Sign-in method"** (Mode de connexion), clique sur le fournisseur **Google**.
4. Active l'interrupteur en haut à droite.
5. Choisis un nom public pour le projet (ex: *LifeFlow*) et sélectionne ton email dans la liste déroulante "E-mail d'assistance du projet".
6. Clique sur **Enregistrer**.

### Autoriser ton adresse (Très Important !)
Par sécurité, Firebase refuse les connexions Google si elles ne viennent pas de ton localhost. Comme ton application sera hébergée sur GitHub, il faut dire à Firebase que ce site est sûr :

1. Toujours dans **Authentication**, clique sur l'onglet **Paramètres** (Settings).
2. Dans le menu de gauche des paramètres, clique sur **Domaines autorisés** (Authorized domains).
3. Par défaut, tu as `localhost`. Clique sur le bouton bleu **Ajouter un domaine**.
4. Tape : `ton-nom-utilisateur.github.io` (remplace par ton vrai pseudo GitHub, ex: `gomnon-glitch.github.io`).
5. Clique sur **Ajouter**.

---

## Étape 3 : Créer la Base de données (Firestore)

C'est ici que tes données seront stockées et synchronisées en temps réel.

1. Retourne dans le menu de gauche et clique sur **Vue d'ensemble de la version** ou directement sur **Firestore Database**.
2. Clique sur **Créer une base de données**.
3. Une fenêtre apparaît sur les "Règles de sécurité". Garde la valeur par défaut et clique sur **Suivant**.
4. Choisis un emplacement pour ta base de données (choisis la zone d'Europe la plus proche, ex: `eur3` ou `europe-west`).
5. Clique sur **Activer**.

### Configurer les règles de sécurité

Par défaut, ta base de données est complètement fermée. On va dire à Firestore : *"Autorise seulement l'utilisateur à lire et modifier ses PROPRES données"*.

1. Dans Firestore, clique sur l'onglet **Règles**.
2. Remplace tout le texte par ceci (copie **uniquement** les lignes ci-dessous, sans aucun autre texte autour) :

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}

3. Clique sur **Publier**. Tes données sont maintenant sécurisées !

---

## Étape 4 : Lier ton projet Firebase à LifeFlow

Il faut maintenant donner les clés de ton projet Firebase au code de ton application pour qu'elle puisse s'y connecter.

1. Clique sur l'**icône d'engrenage / Paramètres du projet** tout en haut à gauche (à côté de *"Vue d'ensemble du projet"*).
2. Dans l'onglet **Général**, descends tout en bas jusqu'à la section **"Vos applications"**.
3. Clique sur la troisième icône **`</>`** (l'icône Web).
4. Un panneau "Enregistrer l'application" apparaît :
   - Pseudo : *LifeFlow Web*
   - Ne coche pas "Configurer l'hébergement Firebase" (on utilise GitHub Pages).
5. Clique sur **Enregistrer l'application**.
6. Une fenêtre pleine de code va apparaître. Regarde la partie `const firebaseConfig = { ... }`.
7. **Copie toutes les valeurs**.

### Mise à jour de ton code :

Ouvre ton fichier local `firebase-config.js` sur ton ordinateur.
Remplace l'extrait factice en haut par **ta propre configuration**, ce qui donnera quelque chose comme ceci :

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBxxxxxxx_xxxxxxx",
  authDomain: "lifeflow-sync-xxxx.firebaseapp.com",
  projectId: "lifeflow-sync-xxxx",
  storageBucket: "lifeflow-sync-xxxx.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdefghijk"
};
```

*(Laisse le reste du fichier intact).*

---

## Étape 5 : Mise en ligne 🎉

Voilà, c'est fait côté code !

1. Ouvre un terminal sur ton PC dans le dossier `Lifestyle` et envoie le nouveau code sur GitHub : 
   `git add .`
   `git commit -m "Activation Synchronisation Firebase"`
   `git push`
2. Va sur la page de ton application hébergée via ton PC. 
3. Va dans l'onglet **Config** et clique sur **"Se connecter avec Google"**.
4. *(Magie !)* L'application remarquera que c'est ta première connexion, et **elle sauvegardera automatiquement toutes tes données actuelles dans le Cloud !** ☁️
5. Relance l'application sur ton Pixel, connecte-toi, et retrouve toutes tes données instantanément synchronisées.
