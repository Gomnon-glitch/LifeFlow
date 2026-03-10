// ============================================
// FIREBASE CONFIGURATION & HELPERS
// ============================================

// ⚠️ REMPLACE CES VALEURS par celles de ton projet Firebase
// (Tu les trouveras dans Console Firebase > Paramètres du projet > Général > Tes applications)
const firebaseConfig = {
    apiKey: "AIzaSyClve-uqDvoyT4MdmjSNKqTDBsEVeQeC7Q",
    authDomain: "lifeflow-61d9c.firebaseapp.com",
    projectId: "lifeflow-61d9c",
    storageBucket: "lifeflow-61d9c.firebasestorage.app",
    messagingSenderId: "888515442764",
    appId: "1:888515442764:web:67aac367b8708dbb275ce9",
    measurementId: "G-88ZFT6EVQJ"
};

// ============================================
// INITIALIZATION
// ============================================
let db = null;
let auth = null;
let provider = null;

try {
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    // Initialize services
    auth = firebase.auth();
    db = firebase.firestore();
    provider = new firebase.auth.GoogleAuthProvider();

    // Enable offline persistence
    db.enablePersistence()
        .catch((err) => {
            if (err.code == 'failed-precondition') {
                console.warn('Firebase: Múltiples tabs ouverts, la persistance hors-ligne ne fonctionne que sur un seul.');
            } else if (err.code == 'unimplemented') {
                console.warn('Firebase: Le navigateur ne supporte pas la persistance hors-ligne.');
            }
        });

    console.log("🔥 Firebase initialisé avec succès");
} catch (error) {
    console.error("Erreur d'initialisation Firebase:", error);
}

// ============================================
// EXPORTED FUNCTIONS FOR APP.JS
// ============================================
window.firebaseAPI = {
    /**
     * Écoute les changements d'état de connexion
     */
    onAuthStateChanged: (callback) => {
        if (!auth) return;
        auth.onAuthStateChanged((user) => {
            callback(user);
        });
    },

    /**
     * Connexion avec Google
     */
    signIn: async () => {
        if (!auth) throw new Error("Firebase non initialisé");
        try {
            // Utilisation de signInWithRedirect pour PWA/Mobile
            await auth.signInWithRedirect(provider);
        } catch (error) {
            console.error("Erreur de connexion:", error);
            throw error;
        }
    },

    /**
     * Déconnexion
     */
    signOut: async () => {
        if (!auth) return;
        try {
            await auth.signOut();
        } catch (error) {
            console.error("Erreur de déconnexion:", error);
            throw error;
        }
    },

    /**
     * Sauvegarde le state entier de l'app dans Firestore
     */
    saveToCloud: async (userId, appState) => {
        if (!db) return false;
        try {
            // Ajout d'un timestamp de dernière modification
            const dataToSave = {
                ...appState,
                _lastModified: firebase.firestore.FieldValue.serverTimestamp()
            };

            await db.collection('users').doc(userId).collection('data').doc('state').set(dataToSave);
            return true;
        } catch (error) {
            console.error("Erreur de sauvegarde Cloud:", error);
            return false;
        }
    },

    /**
     * Charge le state depuis Firestore
     */
    loadFromCloud: async (userId) => {
        if (!db) return null;
        try {
            const doc = await db.collection('users').doc(userId).collection('data').doc('state').get();
            if (doc.exists) {
                return doc.data();
            }
            return null;
        } catch (error) {
            console.error("Erreur de chargement Cloud:", error);
            return null;
        }
    },

    /**
     * Supprime les données du cloud (Reset)
     */
    deleteCloudData: async (userId) => {
        if (!db) return false;
        try {
            await db.collection('users').doc(userId).collection('data').doc('state').delete();
            return true;
        } catch (error) {
            console.error("Erreur de suppression Cloud:", error);
            return false;
        }
    }
};
