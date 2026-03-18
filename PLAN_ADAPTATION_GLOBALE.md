# Plan d'Adaptation Globale : LifeFlow Evolution

Ce document consolide les visions de l'Idle RPG, de l'amélioration du suivi des habitudes, du planning dynamique et du système de Saisons. L'objectif est de créer un écosystème cohérent où chaque action réelle alimente la progression virtuelle, sans conflits techniques ou visuels.

> **Statut des phases** : ✅ Phase 0 & 1 implémentées — Phase 2+ à venir.

---

## 1. Architecture des Données & État (State)

L'objet `state` est structuré pour permettre des références croisées entre tous les systèmes. La saison est intégrée dans `rpg` pour éviter toute fragmentation de l'état global.

```javascript
state: {
  // --- Habitudes ---
  habits: [
    { id: 'hab-1', name: 'Trail', color: '--accent-blue', linkedSlotCategory: 'run' },
    { id: 'hab-2', name: 'Japonais', color: '--accent-purple', linkedSlotCategory: 'japanese' }
  ],
  habitChecks: { "2024-03-15": { "hab-1": true, "hab-2": true } },
  // Format objet (clé→booléen) pour compatibilité avec la Phase 0 implémentée

  // --- Planning ---
  slotValidations: { "2026-W11": { "mon-morning": { validatedAt: "2026-03-16T07:32:00Z" } } },
  planningStreak: 3,
  weekPlannings: {},     // surcharges personnelles de la semaine vs. template
  currentTemplate: 'work',

  // --- Idle RPG --- (Phase 2+)
  rpg: {
    hero: { hp: 100, atk: 10, def: 10, lvl: 1, xp: 0, xpMultiplier: 1.0, buffs: {} },
    inventory: [],
    currentWave: 1,
    lastUpdate: null,       // timestamp — utilisé pour le calcul de gain hors-ligne
    bioFeedbackTree: { endurance: 0, concentration: 0, discipline: 0, curiosity: 0 },

    // --- Saisons (Phase 2+) ---
    season: {
      current: {
        id: 'spring-2026',     // ex: 'summer-2026'
        name: 'Printemps',
        startDate: '2026-03-01',
        xp: 0,                 // XP saisonnière — réinitialisée à chaque saison
        rank: 'Bronze',        // Bronze | Argent | Or | Platine | Maître
        xpMultiplier: 1.0      // bonus Héritage cumulé des saisons précédentes
      },
      history: []
      // { id, name, rank, xpEarned, endDate, heritageBonus }
      // Limité aux 8 dernières saisons (2 ans) pour économiser localStorage
    }
  }
}
```

**Règles de cohérence des données :**
- `habitChecks` conserve le format `{ "YYYY-MM-DD": { "hab-id": true } }` implémenté en Phase 0.
- `slotValidations` conserve le format `{ "weekKey": { "slotKey": { validatedAt } } }` implémenté en Phase 1.
- `rpg.season` est imbriqué sous `rpg` — jamais en top-level — pour éviter la fragmentation.
- `season.history` est plafonné à 8 entrées pour limiter l'empreinte `localStorage`.

---

## 2. Synergies Fonctionnelles (La Boucle de Feedback)

### A. Du Réel vers le RPG (Buffs & Progression)
- **Validation Planning** : Valider un créneau déclenche `addXP(type, amount)` qui incrémente l'XP globale **et** l'XP saisonnière simultanément, puis applique un buff RPG temporaire (ex: créneau `run` → +20% ATK pendant 4h).
- **Validation Habitudes** : Chaque habitude cochée augmente la `Luck` (chance de loot) du héros pour la session en cours et appelle `addXP('habit', baseAmount)`.
- **Ancrage Dynamique** : Valider un créneau de planning peut valider automatiquement l'habitude liée (`linkedSlotCategory` correspondant au type du créneau).
- **Mode Concentration (Pomodoro)** : Lance une "Méditation de Combat" RPG — le héros farme plus vite, mais sa HP décroît si le timer est interrompu.

### B. Multiplicateurs Saisonniers (Phase 3)
Chaque saison amplifie une catégorie d'XP spécifique :

| Saison | Bonus XP | Catégorie ciblée |
|--------|----------|-----------------|
| 🌿 Printemps | +15% | Type `discovery` (créneaux Découverte) |
| ☀️ Été | +15% | Type `run` / `outdoor` (distance Course/Trail) |
| 🍂 Automne | +15% | Type `japanese` / `free` (Mental, Lecture) |
| ❄️ Hiver | +15% | Habitudes quotidiennes (régularité, streak) |

Le multiplicateur s'applique dans `addXP(type, amount)` **avant** d'incrémenter les deux compteurs XP.

### C. Du RPG vers le Réel (Motivation & Gamification)
- **Conseils du Héros** : L'avatar apparaît dans Planning et Habitudes avec des messages contextuels (ex: "Valide cette séance pour booster ma DEF avant le boss !").
- **Récompenses Narratives** : Le résumé quotidien lie les succès réels aux exploits RPG.
- **Héritage de Saison** : En fin de saison, un bonus permanent `xpMultiplier += heritageBonus` est accordé selon le rang atteint. Ce bonus s'applique à la saison suivante sans nécessiter l'arbre RPG.

| Rang fin de saison | Bonus Héritage |
|-------------------|---------------|
| 🥉 Bronze (niv. 1-5) | +1% XP global |
| 🥈 Argent (niv. 6-10) | +2% XP global |
| 🥇 Or (niv. 11-15) | +3% XP global |
| 💎 Platine (niv. 16-20) | +5% XP global |
| 👑 Maître (niv. 20+) | +8% XP global |

> **Note Phase 4+** : Quand l'arbre RPG (`bioFeedbackTree`) sera implémenté, l'Héritage pourra aussi distribuer des points de compétence. La valeur numérique du `heritageBonus` sera réutilisée sans refactoring.

---

## 3. Interface & Expérience Utilisateur (UI/UX)

### A. La Vue Mensuelle (Calendrier)
- **Gommettes** : Couleurs personnalisées par habitude (implémenté Phase 0).
- **Le Héros** : Avatar en surimpression légère, sans remplacer les gommettes.
- **Effet "Perfect Day"** : Si toutes les habitudes et tous les créneaux du jour sont validés → la case brille (Neon Glow) et le héros prend une pose de victoire.

### B. Tableaux de Bord (Dashboard)
- **Bandeau "Maintenant"** : Affiche l'activité planning en cours + statut héros RPG (HP, Vitesse) + indicateur de saison courante.
- **Section Saison Actuelle** : Dans l'onglet Dashboard, un widget montre le rang saisonnier, la progression XP, et les jours restants dans la saison.

### C. Thèmes Visuels Saisonniers (Phase 4)
L'application adapte son apparence via des classes CSS appliquées sur `<body>` :

| Saison | Classe CSS | Accentuation visuelle |
|--------|-----------|----------------------|
| 🌿 Printemps | `.theme-spring` | Vert printanier + Rose cerisier |
| ☀️ Été | `.theme-summer` | Jaune solaire + Orange vif |
| 🍂 Automne | `.theme-autumn` | Brun terreux + Orange brûlé |
| ❄️ Hiver | `.theme-winter` | Bleu givré + Blanc cassé |

Les variables saisonnières (`--seasonal-accent`, `--seasonal-bg`) **surimposent** les variables existantes sans les remplacer. Transition CSS de 1.5s pour un changement fluide. Les couleurs structurelles du thème sombre restent intactes.

---

## 4. Roadmap d'Implémentation

### ✅ Phase 0 — Fondations des Données & Habitudes *(Implémentée)*
- Migration des données : ajout de `rpg`, `slotValidations`, `planningStreak` si absents.
- Système de couleurs des habitudes, édition et suppression.
- Fondations de l'état RPG (structure `rpg` vide en attente de Phase 2).

### ✅ Phase 1 — Planning & Validation *(Implémentée)*
- Validation des créneaux (bouton `○ Valider` / `✓ Fait`).
- Planning streak et Perfect Day.
- Bandeau "Live Now" (créneau courant).

### Phase 2 — Noyau RPG & Fondations Saisonnières
*Prérequis : Phase 1 terminée.*

**RPG Core :**
- Implémentation de `addXP(type, amount)` — incrémente `rpg.hero.xp` ET `rpg.season.current.xp`.
- Combat automatique hors-ligne : calcul basé sur `lastUpdate` timestamp.
- Système d'équipement de base (inventaire + stats).
- `checkLevelUp()` pour XP globale et XP saisonnière (seuils distincts).

**Saisons — Noyau minimal (sans dépendance RPG complète) :**
- `getCurrentSeason()` — retourne l'objet saison selon `new Date()` (sans `toISOString()` pour éviter les décalages UTC en France).
- `checkSeasonTransition()` — appelée à chaque `init()` et `loadData()`. Gère le rattrapage si plusieurs saisons ont été manquées (catch-up).
- Initialisation de `state.rpg.season` dans la migration `loadData()`.
- Indicateur de saison dans le `now-banner` (emoji + nom, pas encore de thème CSS).
- Ajout d'un **mode debug** : `app.debugSetSeason('winter')` utilisable depuis la console pour tester les transitions.

**Contrainte de données :**
- `season.history` plafonné à 8 entrées (FIFO) — supprime les plus anciennes au-delà.

### Phase 3 — Tissage des Synergies & Rang Saisonnier
*Prérequis : Phase 2 terminée.*

- Connexion Planning ↔ Habitudes : validation d'un créneau → `addXP()` + auto-validation habitude liée.
- Connexion Habitudes → Luck RPG.
- **Multiplicateurs saisonniers** dans `addXP()` selon la saison courante (tableau Section 2.B).
- **Rang saisonnier** : `updateSeasonRank()` — calcule Bronze/Argent/Or/Platine/Maître selon `season.current.xp`.
- Implémentation du Mode Concentration (Pomodoro → Méditation de Combat).
- Widget "Saison Actuelle" dans le Dashboard (rang, XP saisonnière, jours restants).
- Distribution du **bonus Héritage** à la transition de saison (valeur numérique `xpMultiplier`).

### Phase 4 — Cosmétique, Narration & Thèmes Saisonniers
*Prérequis : Phase 3 terminée.*

- Intégration du héros dans le calendrier (avatar + pose de victoire Perfect Day).
- Génération des résumés narratifs quotidiens.
- **Thèmes CSS saisonniers** (`.theme-spring` etc.) avec transition douce 1.5s.
- **Modal de fin de saison** : récap visuel (XP gagnée, rang, badge, bonus Héritage) avant reset.
- **Badges de rang** affichés dans le profil/historique :
  - 🥉 Bronze · 🥈 Argent · 🥇 Or · 💎 Platine · 👑 Maître de Saison
- Connexion Héritage → `bioFeedbackTree` (points de compétence) si l'arbre RPG est complet.

### Phase 5 — Moteur de Quêtes Saisonnières
*Prérequis : Phase 4 terminée. Scope distinct — ne pas mélanger avec Phase 4.*

Ce système est volontairement isolé en Phase 5 car il requiert un moteur de quêtes dédié absent des phases précédentes.

**Architecture :**
- `state.rpg.quests` : `[ { id, seasonId, type, target, current, completed, badge } ]`
- `checkQuestProgress(eventType, value)` — appelée par `addXP()` et les validations.
- Quêtes **configurables par l'utilisateur** (objectif km personnalisable, pas hardcodé) pour éviter les quêtes non-traçables.

**Quêtes saisonnières (exemples configurables) :**

| Saison | Challenge | Badge Exclusif |
|--------|-----------|---------------|
| 🌿 Printemps | X découvertes en un mois (défaut: 5) | 🌸 Bourgeon d'Or |
| ☀️ Été | Cumuler X km sur la saison (défaut: 200) | ☀️ Soleil Invaincu |
| 🍂 Automne | X jours de streak japonais consécutif (défaut: 30) | 🦉 Chouette de Bronze |
| ❄️ Hiver | Valider 100% des habitudes matin pendant X jours (défaut: 7) | ❄️ Cristal d'Éternité |

> Les quêtes requérant une donnée externe non-traçable (ex: "courir après 20h", "méditer en forêt") sont **exclues** ou converties en auto-déclaration manuelle par l'utilisateur.

---

## 5. Points de Vigilance

- **Économie du Jeu** : Les multiplicateurs saisonniers (+15%) et l'Héritage cumulé doivent rester dans des bornes raisonnables. Plafonner le multiplicateur total d'Héritage à +25% max (8 saisons × bonus moyen) pour éviter l'inflation XP.
- **Calcul UTC / Timezone** : Ne jamais utiliser `date.toISOString().split('T')[0]` pour les dates de l'utilisateur en France (UTC+1/+2). Utiliser `date.getFullYear()`, `date.getMonth()`, `date.getDate()` pour les comparaisons locales.
- **Performance** : Le calcul RPG hors-ligne ne doit pas bloquer le thread principal. Utiliser des calculs discrets basés sur les timestamps, pas de boucles.
- **Nettoyage des Données** : Supprimer une habitude doit nettoyer ses références dans `slotValidations` et les statistiques RPG associées.
- **Service Worker** : Tout changement de `app.js` ou `styles.css` doit s'accompagner d'un bump de la version dans `CACHE_NAME` (`lifeflow-vN`) pour forcer la mise à jour du cache.
- **Isolation des Thèmes CSS** : Les variables saisonnières (`--seasonal-*`) ne doivent jamais écraser les variables de structure du thème sombre (`--bg-primary`, `--text-primary`, etc.). Toujours surimposer, jamais remplacer.
- **Persistance Season History** : Plafonner `rpg.season.history` à 8 entrées (2 ans). Supprimer la plus ancienne (FIFO) au-delà du plafond.
