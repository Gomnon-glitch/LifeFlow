# Plan d'Évolution LifeFlow — Révision Architecturale

> Ce document remplace et corrige `PLAN_ADAPTATION_GLOBALE.md`. Il intègre les retours d'analyse du code existant pour éviter les conflits de données et de structure. Les 6 phases sont conçues pour être implantées séquentiellement, chacune étant stable et déployable indépendamment.

---

## Vue d'Ensemble des Phases

| Phase | Nom | Statut | Risque | Prérequis |
|-------|-----|--------|--------|-----------|
| **0** | Migration des données & fondations habitudes | ✅ **Livré** (v1.1.1) | Faible | Aucun |
| **1** | Validation des créneaux planning | ✅ **Livré** (v1.3) | Moyen | Phase 0 |
| **2** | Noyau RPG & progression hors-ligne | ⏳ À faire | Élevé | Phase 0 |
| **3** | Synergies Planning ↔ Habitudes ↔ Buffs RPG | ⏳ À faire | Moyen | Phases 1 + 2 |
| **4** | Cosmétique, narratif & hero dans le calendrier | ⏳ À faire | Faible | Phase 3 |
| **5** | Mode Concentration (Pomodoro Combat) | ⏳ À faire | Élevé | Phase 3 |

---

## Phase 0 — Migration des Données & Fondations Habitudes ✅

> **Statut : Livré dans v1.1.1** — Implémenté le 2026-03-15.
>
> Objectif : Étendre la structure de données existante sans casser aucune fonctionnalité en production. Cette phase est un prérequis silencieux pour tout le reste.

### Résumé d'implémentation

| Fichier | Modifications |
|---------|--------------|
| `app.js` | `defaultHabits` étendu avec `color` + `linkedSlotCategory` ; `SLOT_TYPE_TO_CATEGORY` ajouté ; migration douce dans `loadData()` ; `renderHabits()` avec `--habit-accent` et boutons ✏️/🗑️ ; `_habitFormHTML()`, `openEditHabitModal()`, `saveHabitEdit()`, `deleteHabit()`, `confirmDeleteHabit()` créés ; `openAddHabitModal()` et `addHabit()` mis à jour ; `renderVisualCalendar()` avec gommettes colorées par habitude |
| `styles.css` | Bordure accent sur `.habit-card` ; `.habit-actions` (visible au survol) ; `.habit-action-btn` ; `.habit-color-picker` + `.color-swatch` ; `check-btn.checked` et `.today .check-btn` utilisent `--habit-accent` |

### Checklist Phase 0 — État Final
- [x] `loadData()` crée `rpg`, `slotValidations`, `planningStreak` si absents
- [x] Les habitudes existantes reçoivent `color` et `linkedSlotCategory` par défaut via migration douce
- [x] `habitChecks` format objet-booléen conservé (aucune migration)
- [x] Modal d'ajout habitude inclut sélecteur de couleur et liaison de catégorie
- [x] `renderVisualCalendar()` utilise les couleurs par habitude

### 0.1 Corrections Architecturales Critiques

#### ❌ Ne PAS changer le format de `habitChecks`

Le plan original proposait de migrer `habitChecks` vers un tableau d'IDs :
```javascript
// INCORRECT — format proposé par l'ancien plan
habitChecks: { "2026-03-15": ["hab-1", "hab-2"] }
```

Le format actuel doit être **conservé** car il distingue "jamais touché" vs "explicitement décoché", information précieuse pour les streaks :
```javascript
// CORRECT — format existant à conserver
habitChecks: { "2026-03-15": { "hab-routine-am": true, "hab-stretching": false } }
```

#### ❌ Ne PAS remplacer `weekPlannings` par `planning.slots`

Le plan original proposait un modèle événementiel avec heures libres. Le modèle grille existant est plus simple et déjà utilisé partout. Il sera étendu, pas remplacé.

---

### 0.2 Nouvelle Structure de Données Cible

La fonction `loadData()` doit intégrer une migration douce : si les champs n'existent pas, ils sont créés avec leurs valeurs par défaut sans toucher aux données existantes.

```javascript
state: {
  // --- Habitudes (EXTENSION des champs existants) ---
  habits: [
    {
      id: 'hab-routine-am',
      name: '🌅 Routine matin',
      icon: '🌅',
      frequency: 'daily',
      color: '--accent-orange',      // NOUVEAU : couleur personnalisable
      linkedSlotCategory: 'routine'  // NOUVEAU : catégorie de slot liée (voir table de mapping)
    }
  ],
  // habitChecks : format inchangé

  // --- Planning (EXTENSION sans remplacement) ---
  weekPlannings: {
    // Structure existante inchangée
    "2026-W11": {
      "mon-morning": { type: 'run', label: '🏃 Trail matinal' }
    }
  },
  // NOUVEAU : validations des créneaux (séparé pour ne pas polluer weekPlannings)
  slotValidations: {
    "2026-W11": {
      "mon-morning": { validatedAt: "2026-03-11T08:45:00", autoLoggedKm: 12 }
      // null ou absent = non validé
    }
  },
  planningStreak: 0, // NOUVEAU : jours consécutifs avec ≥ 3 créneaux validés

  // --- Idle RPG (NOUVEAU — créé si absent) ---
  rpg: {
    hero: {
      hp: 100, hpMax: 100,
      atk: 10, def: 10,
      speed: 1.0,    // multiplicateur, base 1.0
      luck: 1.0,     // multiplicateur, calculé dynamiquement depuis les habitudes
      lvl: 1, xp: 0,
      prestigePoints: 0, resets: 0
    },
    equipment: {
      weapon: null, head: null, torso: null,
      gloves: null, legs: null, boots: null,
      amulet: null, accessory: null
    },
    inventory: [],
    skillTree: {},       // { skillId: level }
    activeBuffs: [],     // [ { id, stat, multiplier, source, expiresAt } ]
    currentWave: 1,
    highestWave: 1,
    lastUpdate: null,    // timestamp pour calcul offline
    focusTimer: 0        // secondes restantes du Pomodoro (Phase 5)
  }
}
```

#### Table de Mapping des Types de Créneaux

Pour relier les types de planning existants aux catégories génériques des habitudes :

```javascript
const SLOT_TYPE_TO_CATEGORY = {
  'run':       'sport',
  'strength':  'sport',
  'outdoor':   'sport',
  'japanese':  'study',
  'discovery': 'discovery',
  'routine':   'routine',
  'gaming':    'leisure',
  'rest':      'leisure',
  'work':      'work',
  'free':      null  // pas de liaison automatique
};
```

`habit.linkedSlotCategory` prend une valeur de la colonne de droite (`'sport'`, `'study'`, etc.).

---

### 0.3 Implémentation : Habitudes — Couleurs & Édition

Source : `PLAN_HABITUDES.md`

**Modifications dans `app.js` :**

- Ajouter `color` et `linkedSlotCategory` (nullable) aux habitudes par défaut dans `loadData()`
- Modifier `openAddHabitModal()` pour inclure un sélecteur de couleur (6 couleurs CSS var)
- Créer `openEditHabitModal(habitId)` — pré-remplit nom, couleur, catégorie liée
- La modification conserve le même `id` → les streaks ne sont pas cassés
- La suppression nettoie `habitChecks` des entrées orphelines

**Modifications dans `renderHabits()` :**
- Ajouter boutons ✏️ et 🗑️ sur chaque `habit-card` (visibles au survol)

**Modifications dans `renderVisualCalendar()` :**
- Boucler sur `state.habits` au lieu d'afficher un point générique `dot-habit`
- Chaque habitude validée affiche un point avec `background-color: var(habit.color)`

**Palette de couleurs suggérée :**

| Variable CSS | Couleur | Usage par défaut |
|---|---|---|
| `--accent-blue` | Bleu | Sport / Trail |
| `--accent-purple` | Violet | Japonais / Étude |
| `--accent-green` | Vert | Journal / Nature |
| `--accent-orange` | Orange | Routine / Habitudes |
| `--accent-pink` | Rose | Social / Découverte |
| `--accent-cyan` | Cyan | Hydratation / Santé |

---

### 0.4 Points de Vigilance Phase 0

- La migration dans `loadData()` doit utiliser `??` ou `|| defaultValue` pour ne jamais écraser des données existantes
- Tester avec un localStorage peuplé de données réelles avant déploiement
- Le champ `rpg` est créé vide — aucun RPG ne tourne encore

---

## Phase 1 — Validation des Créneaux Planning ✅

> **Statut : Livré dans v1.3** — Implémenté le 2026-03-15.
>
> Objectif : Permettre à l'utilisateur de "tamponner" un créneau comme réalisé, en déclencher les effets sur le log quotidien, et poser les bases des synergies futures.

### Résumé d'implémentation

| Fichier | Modifications |
|---------|--------------|
| `app.js` | `isCurrentTimeSlot()`, `validateSlot()` (toggle + auto-log sport), `openSportLogModal()`, `saveSportLog()`, `updatePlanningStreak()`, `getValidatedSlotsForDay()`, `isPerfectDay()` ajoutés ; `renderPlanning()` étendu avec bouton `validate-btn`, glow `current-slot`, badge `validated-time` ; `renderVisualCalendar()` utilise `isPerfectDay()` ; `recalculateXP()` ajoute +25 XP Perfect Day ; `renderKPIs()` affiche planning streak ; `updateNowBanner()` affiche le créneau actuel en temps réel |
| `styles.css` | `@keyframes currentSlotPulse`, `.cell.current-slot`, `.validate-btn` / `.is-validated`, `.activity-block.validated`, `.validated-time`, `.calendar-day.perfect` renforcé |

### Checklist Phase 1 — État Final
- [x] Bouton ✅ visible sur les créneaux du jour courant et passés uniquement
- [x] `validateSlot()` enregistre dans `slotValidations`, toggle possible
- [x] Créneau sport → `openSportLogModal()` pré-rempli (fusion si log existant)
- [x] `updatePlanningStreak()` recalcule après chaque validation
- [x] "Perfect Day" (≥80% habits + ≥3 slots) déclenche glow doré sur le calendrier
- [x] +25 XP bonus Perfect Day dans `recalculateXP()`
- [x] KPI "Planning Streak" ajouté au dashboard
- [x] Créneau courant animé en glow néon bleu dans la grille hebdo
- [x] `updateNowBanner()` affiche le créneau en cours et le suivant depuis le planning réel

### 1.1 UI : Bouton de Validation dans la Grille

**Dans `index.html` (grille planning) :**
- Ajouter un bouton ✅ sur chaque créneau non-vide (en plus du bouton d'édition existant)
- Créneau validé : afficher un badge vert + timestamp "Fait à 08h45"
- Créneau actuel (heure courante) : animation `neon-glow` sur la bordure (effet Cyber-Focus)

**Règle d'affichage :**
- Seuls les créneaux du jour courant ou passés sont validables (pas les créneaux futurs)
- Un créneau déjà validé affiche le bouton en mode "annuler" (permet correction d'erreur)

### 1.2 Logique : `validateSlot(weekKey, slotKey)`

```javascript
function validateSlot(weekKey, slotKey) {
  const slot = state.weekPlannings[weekKey]?.[slotKey];
  if (!slot) return;

  // Enregistrer la validation
  if (!state.slotValidations[weekKey]) state.slotValidations[weekKey] = {};
  state.slotValidations[weekKey][slotKey] = { validatedAt: new Date().toISOString() };

  // Auto-log si créneau sport (pré-remplissage, pas écrasement)
  if (['run', 'strength', 'outdoor'].includes(slot.type)) {
    // Ouvrir le modal de log journalier pré-sélectionné
    // L'utilisateur confirme ou modifie les valeurs (km, D+)
  }

  // Ancrage d'habitude (Phase 3 — appel prévu ici, implémenté plus tard)
  // triggerHabitAnchor(slot.type);

  updatePlanningStreak();
  saveData();
  renderPlanning();
}
```

### 1.3 Planning Streak

`updatePlanningStreak()` recalcule le nombre de jours consécutifs où au moins **3 créneaux** ont été validés. Seuil configurable (défaut : 3).

- Le streak s'affiche dans le dashboard comme KPI secondaire
- Contribue à la protection RPG du héros (Phase 3)

### 1.4 "Perfect Day" — Condition Révisée

> Le plan original exigeait 100% habitudes + 100% planning. Condition trop stricte.

**Condition retenue :**
- ≥ 80% des habitudes cochées **ET**
- ≥ 3 créneaux du planning validés dans la journée

Si condition remplie :
- La case du jour dans le calendrier mensuel brille (`neon-glow` doré)
- +25 XP bonus
- Le héros prend une pose spéciale (Phase 4)

### 1.5 Points de Vigilance Phase 1

- `slotValidations` est indépendant de `weekPlannings` : modifier ou effacer un créneau ne supprime pas sa validation (comportement voulu — on peut valider un créneau qu'on a modifié après coup)
- L'Auto-log ne doit **jamais écraser** un log existant : proposer une fusion modale si le log du jour contient déjà des km

---

## Phase 2 — Noyau RPG & Progression Hors-Ligne

> Objectif : Implémenter le moteur de combat idle, le système d'équipement et le calcul offline. Cette phase est fonctionnelle en isolation — le RPG tourne seul, sans synergies IRL actives (ce sera la Phase 3).

### 2.1 Onglet RPG

Transformer l'onglet "Installer" (ou ajouter un nouvel onglet) en interface RPG. Structure :

- **Bandeau Héros** : avatar pixel art, HP bar, stats (ATK/DEF/SPD), niveau + XP bar
- **Zone de Combat** : ennemi actuel (vague N), animation d'attaque, loot récent
- **Inventaire** : grille 8 emplacements d'équipement + sac
- **Arbre de Compétences** : grille de skills débloquables avec Fragments de Code (Prestige)
- **Log Offline** : résumé textuel du farm effectué depuis la dernière ouverture

### 2.2 Moteur de Combat

**Calcul des stats ennemies :**
```javascript
function getEnemyStats(wave) {
  return {
    hp:  Math.floor(50 * Math.pow(1.15, wave)),
    atk: Math.floor(5  * Math.pow(1.15, wave)),
    def: Math.floor(2  * Math.pow(1.12, wave))
  };
}
```

**Cycle de combat (tick) :**
- 1 tick = 1 seconde de temps réel (ou calculé en batch pour le offline)
- `heroEffectiveAtk = hero.atk * activeSpeedMultiplier * equipmentBonuses`
- Si `heroEffectiveAtk > enemyDef` : l'ennemi perd `(heroEffectiveAtk - enemyDef)` HP
- Si `enemyAtk > heroEffectiveDef` : le héros perd des HP
- Mort ennemi → loot roll → vague suivante

**Calcul Hors-Ligne :**
```javascript
function calculateOfflineProgress() {
  const elapsed = Date.now() - state.rpg.lastUpdate; // ms
  const ticks = Math.floor(elapsed / 1000);
  const cappedTicks = Math.min(ticks, 8 * 3600); // cap à 8h offline
  // ... simulation en batch, accumuler xp/gold/loot
  state.rpg.lastUpdate = Date.now();
}
```

### 2.3 Système de Loot & Équipement

- **Loot Luck** : `luck` est un multiplicateur calculé dynamiquement (pas stocké) :
  ```javascript
  function getHeroLuck() {
    const todayHabitRate = getTodayHabitCompletionRate(); // 0.0 → 1.0
    const streakBonus = Math.min(state.rpg.hero.lvl * 0.01, 0.5); // max +50% au lvl 50
    return 1.0 + todayHabitRate + streakBonus;
  }
  ```
  > La `Luck` est dynamique, pas persistée, pour éviter les états périmés.

- **8 emplacements** : Arme, Tête, Torse, Gants, Jambières, Bottes, Amulette, Accessoire
- **Raretés** : Commun → Rare → Épique → Légendaire (couleur CSS var existantes : blanc → bleu → violet → orange)
- **Forge** : 3 objets identiques → fusion (tier supérieur ou rareté supérieure)
- **Noms narratifs** : les affixes évoquent les activités réelles (Trail, Kanji, Endurance...)

### 2.4 Prestige — Fragments de Code

- Reset à la Vague 1 en échange de **Fragments de Code** = `floor(currentWave / 10)`
- Les Fragments débloquent des nœuds dans l'arbre de compétences (multiplicateurs permanents)
- `hero.highestWave` n'est pas resetté — sert de record historique

### 2.5 Arbre Bio-Feedback

Certains nœuds de l'arbre nécessitent des KPIs réels pour être débloqués :

```javascript
const SKILL_TREE_UNLOCK_CONDITIONS = {
  'endurance-1': () => getWeeklyKmTotal() >= state.config.weeklyKm * 0.8,
  'concentration-1': () => getWeekJapaneseMinutes() >= 60,
  'resilience-1': () => state.planningStreak >= 7
};
```

### 2.6 Points de Vigilance Phase 2

- **Performance** : le calcul offline doit rester sous 50ms. Si trop long (wave > 500), utiliser une approximation mathématique plutôt qu'une simulation tick-by-tick
- **Économie du jeu** : les gains offline ne doivent pas trivialiser le contenu actif. Cap à 8h, pas de loot légendaire offline
- **Scaling** : `1.15^Vague` devient très grand rapidement. Tester les limites JS (Number.MAX_SAFE_INTEGER) au-delà de la vague 300

---

## Phase 3 — Synergies Planning ↔ Habitudes ↔ Buffs RPG

> Objectif : Tisser les connexions entre les trois systèmes. C'est la phase centrale qui donne du sens à tout le reste.

### 3.1 Du Réel vers le RPG — Buffs Temporels

**Structure d'un buff actif :**
```javascript
// Dans state.rpg.activeBuffs
{
  id: 'sport-atk-buff',
  stat: 'speed',        // 'atk' | 'def' | 'speed' | 'luck_flat'
  multiplier: 1.2,      // +20%
  source: 'slot-run',   // origine du buff (pour déduplication)
  expiresAt: 1710504000000  // timestamp Unix ms
}
```

**Buffs déclenchés par validation de créneau :**

| Type de créneau validé | Buff accordé | Durée |
|---|---|---|
| `run`, `outdoor` | Vitesse d'attaque +20% | 4h |
| `strength` | ATK +15%, DEF +10% | 4h |
| `japanese` | Puissance des sorts (ATK magique) +15% | 4h |
| `routine` | Régénération HP +5%/min | 2h |
| `discovery` | Luck +25% | Session (jusqu'à minuit) |

**Calcul des stats effectives :**
```javascript
function getEffectiveStat(statName) {
  const now = Date.now();
  // Nettoyer les buffs expirés
  state.rpg.activeBuffs = state.rpg.activeBuffs.filter(b => b.expiresAt > now);

  const baseValue = state.rpg.hero[statName];
  const multiplier = state.rpg.activeBuffs
    .filter(b => b.stat === statName)
    .reduce((acc, b) => acc * b.multiplier, 1.0);
  return baseValue * multiplier;
}
```

**Protection RPG par Planning Streak :**
- Streak ≥ 3 jours : boss infligent -10% de dégâts
- Streak ≥ 7 jours : -25% de dégâts des boss
- Streak ≥ 14 jours : immunité aux dégâts des boss de fin de zone (×10 vagues)

### 3.2 Ancrage Dynamique — Habitude ↔ Créneau

**Règle :** Valider un créneau peut auto-cocher l'habitude liée **si et seulement si** elle n'est pas déjà cochée (évite le double-comptage XP).

```javascript
function triggerHabitAnchor(slotType) {
  const slotCategory = SLOT_TYPE_TO_CATEGORY[slotType];
  const linkedHabits = state.habits.filter(h => h.linkedSlotCategory === slotCategory);
  const today = getDateKey(new Date());

  linkedHabits.forEach(habit => {
    const alreadyChecked = state.habitChecks[today]?.[habit.id];
    if (!alreadyChecked) {
      // Auto-check sans XP supplémentaire (pour éviter le double-comptage)
      if (!state.habitChecks[today]) state.habitChecks[today] = {};
      state.habitChecks[today][habit.id] = true;
      // Marquer comme "auto-validé" pour info visuelle (pas de XP double)
      state.habitChecks[today][`${habit.id}_auto`] = true;
    }
  });
}
```

**Affichage :** Les habitudes auto-validées affichent une icône ⚡ au lieu de ✅ pour distinguer validation manuelle et automatique.

### 3.3 Conseils du Héros dans le Planning

L'avatar du héros apparaît en bas de l'onglet Planning dans une bulle de dialogue contextuelle :

- Si buff ATK actif : *"Ma vitesse est décuplée grâce à ta course ! Valide ta session de japonais pour débloquer mes sorts."*
- Si aucun buff : *"Je manque d'énergie... Valide un créneau sport pour m'booster avant le prochain boss !"*
- Si Planning Streak ≥ 7 : *"Notre synergie est au maximum ! Les boss tremblent."*

### 3.4 Dashboard — Bandeau "Maintenant" Enrichi

Le bandeau `updateNowBanner()` existant est enrichi :

- Activité planning actuelle (déjà présent)
- **NOUVEAU :** Statut héros RPG en miniature : `⚔️ Vague 42 | ❤️ 87/100 | ⚡ ATK ×1.2`
- Si buff actif : icône animée et durée restante

### 3.5 Points de Vigilance Phase 3

- **Double-comptage XP** : L'ancrage automatique d'habitude NE doit PAS accorder d'XP supplémentaire. Seule la validation manuelle de l'habitude en donne.
- **Ordre d'exécution** : `validateSlot()` → buff RPG → ancrage habitude → `saveData()`. Ne jamais inverser.
- **Déduplication des buffs** : Si l'utilisateur valide deux créneaux `run` dans la même journée, le buff est refreshed (durée réinitialisée), pas stacké × 2.

---

## Phase 4 — Cosmétique, Narratif & Héros dans le Calendrier

> Objectif : Faire briller l'expérience utilisateur. Toutes les mécaniques sont en place — cette phase les habille.

### 4.1 Héros dans le Calendrier Mensuel

**Contrainte mobile résolu :** L'avatar n'apparaît que sur la cellule du **jour courant**, pas sur toutes les cellules. Il s'affiche en superposition légère (position absolute, coin bas-droit de la cellule, taille 16-18px).

Sur les jours passés :
- "Perfect Day" (≥ 80% habitudes + ≥ 3 slots validés) → bordure dorée + ✨ emoji
- Jour ordinaire → gommettes colorées existantes (inchangées)
- Jour vide → cellule standard

```css
/* Cellule "Perfect Day" */
.calendar-day.perfect-day {
  border: 1px solid var(--accent-orange);
  box-shadow: 0 0 8px var(--accent-orange);
}
.calendar-day.current .hero-avatar {
  position: absolute;
  bottom: 2px; right: 2px;
  font-size: 14px;
  filter: drop-shadow(0 0 4px var(--accent-blue));
}
```

### 4.2 Résumé Narratif Quotidien

Au chargement de l'app (si la dernière session date d'hier ou avant), afficher un modal "Résumé de guerre" :

**Template narratif :**
```
🏔️ Résumé du 14 mars
Pendant ton absence, [Héros] a combattu pendant 6h12
et atteint la Vague 47 (+5 vagues).

Grâce à tes 12.3 km courus hier, son buff de vitesse
a permis d'abattre le Boss de Zone en 3 minutes.
Ton streak d'habitudes à 14 jours lui a épargné
-25% de dégâts des boss.

Butin récolté : 2 objets Rares, 1 objet Épique.
```

Les valeurs sont injectées depuis les données réelles du log de la veille.

### 4.3 Badge Gallery — Enrichissement RPG

Ajouter une nouvelle catégorie de badges liés au RPG dans `checkAllBadges()` :

| Badge | Condition | XP |
|---|---|---|
| 🗡️ Premier Sang | Atteindre la Vague 10 | 50 |
| 🌊 Surfeur de Vagues | Atteindre la Vague 50 | 100 |
| 💀 Briseur de Boss | Vaincre 10 boss de zone | 150 |
| ♾️ Premier Prestige | Effectuer 1 reset de prestige | 200 |
| 🧬 Bio-Synchronisé | Débloquer un nœud Bio-Feedback | 75 |
| 🔱 Légende | Atteindre la Vague 200 | 500 |

### 4.4 Points de Vigilance Phase 4

- Le résumé narratif ne doit s'afficher qu'une fois par session (flag `state.rpg.summaryShownAt`)
- Sur mobile, la taille de l'avatar dans le calendrier doit rester ≤ 14px pour ne pas déborder
- Les badges RPG ne doivent pas inflater l'XP de progression habituelle — garder les valeurs modérées

---

## Phase 5 — Mode Concentration (Pomodoro Combat)

> Objectif : Lier un timer de travail réel à une phase de combat spéciale dans le RPG. Phase la plus complexe — à implanter en dernier.

### 5.1 Principe

L'utilisateur démarre un "Focus Session" depuis le Planning ou le Dashboard :
- Choisit une durée (25 min classique, ou créneau planning actif)
- Le héros entre en **"Méditation de Combat"** : vitesse de farm × 3, mais HP ne se régénèrent pas
- Si l'utilisateur ferme l'app ou change d'onglet avant la fin → le héros perd 30% de ses HP max
- Si le timer se termine → XP bonus + loot garanti de rareté élevée

### 5.2 State Machine du Focus

```
IDLE → [Démarrer Focus] → FOCUSING
FOCUSING → [Timer terminé] → REWARD → IDLE
FOCUSING → [Abandon / changback] → PENALTY → IDLE
FOCUSING → [App fermée] → (calcul à la réouverture via lastFocusStart + lastFocusEnd)
```

```javascript
// Dans state.rpg
focusSession: {
  active: false,
  startedAt: null,    // timestamp
  duration: 0,        // secondes prévues
  abandonned: false
}
```

### 5.3 Gestion de la Fermeture d'App

Le `visibilitychange` browser event détecte quand l'app passe en arrière-plan. À la réouverture :

```javascript
document.addEventListener('visibilitychange', () => {
  if (document.hidden && state.rpg.focusSession?.active) {
    state.rpg.focusSession.abandonned = true;
    // Le service worker peut stocker ce flag
  }
});
```

À la réouverture : si `abandonned === true`, appliquer la pénalité HP avant d'afficher le RPG.

### 5.4 UI Focus Mode

- Un bandeau plein-écran remplace temporairement le contenu principal
- Timer décompte, animation de combat en arrière-plan (CSS keyframes)
- Bouton "Abandonner" avec confirmation + avertissement de pénalité

### 5.5 Points de Vigilance Phase 5

- `visibilitychange` n'est pas 100% fiable sur iOS (PWA). Utiliser aussi `pagehide` + Service Worker
- Le mode Pomodoro ne doit être accessible que depuis un créneau de type `work`, `study` ou `japanese` pour rester cohérent
- La pénalité HP doit être visible mais pas punitive au point de décourager l'usage

---

## Annexe A — Économie du Jeu (Anti-Inflation)

Pour que le scaling reste un défi (objectif du plan original) :

| Mécanisme | Valeur |
|---|---|
| Scaling ennemi | `Base × 1.15^Vague` |
| Cap farm offline | 8 heures maximum |
| Buff max stackable | ×2.5 sur une même stat (toutes sources confondues) |
| Luck max | ×3.0 (100% habitudes + streak élevé + skill tree) |
| "Perfect Day" XP bonus | +25 XP (hors système RPG) |
| Seuil "Perfect Day" | ≥ 80% habitudes + ≥ 3 créneaux validés |

---

## Annexe B — Nettoyage des Données

La suppression d'une habitude doit :
1. Retirer l'entrée de `state.habits`
2. Nettoyer les clés `{ [habit.id]: true }` dans tous les `state.habitChecks[date]`
3. Retirer la liaison dans tout créneau planning (`linkedSlotCategory` de l'habitude supprimée n'affecte pas les créneaux — le mapping est dans la table constante, pas dans les données)

La suppression d'un créneau (reset à vide) doit :
1. Mettre `weekPlannings[weekKey][slotKey] = null`
2. Retirer `slotValidations[weekKey][slotKey]` si présent

---

## Annexe C — Checklist de Validation par Phase

### Phase 0
- [ ] `loadData()` crée `rpg`, `slotValidations`, `planningStreak` si absents
- [ ] Les habitudes existantes reçoivent `color` et `linkedSlotCategory: null` par défaut
- [ ] `habitChecks` format objet-booléen conservé (aucune migration)
- [ ] Modal d'ajout habitude inclut sélecteur de couleur
- [ ] `renderVisualCalendar()` utilise les couleurs par habitude

### Phase 1
- [ ] Bouton ✅ visible sur les créneaux du jour courant et passés uniquement
- [ ] `validateSlot()` enregistre dans `slotValidations`
- [ ] Créneau sport → modal auto-log pré-rempli (sans écrasement)
- [ ] `updatePlanningStreak()` recalcule après chaque validation
- [ ] "Perfect Day" déclenche `neon-glow` doré sur la case du calendrier
- [ ] Créneau courant animé en glow néon dans la grille hebdo

### Phase 2
- [ ] Onglet RPG accessible avec bandeau héros + zone combat
- [ ] Calcul offline exécuté au lancement si `lastUpdate` présent
- [ ] Cap offline 8h respecté
- [ ] Inventaire 8 emplacements fonctionnel
- [ ] `getHeroLuck()` calculé dynamiquement (non persisté)
- [ ] Prestige possible à partir de la Vague 10

### Phase 3
- [ ] `activeBuffs` nettoyé des entrées expirées à chaque tick et au chargement
- [ ] Buff refresh (pas stack) si même type déjà actif
- [ ] `triggerHabitAnchor()` ne donne pas de XP si habitude déjà cochée
- [ ] Habitudes auto-validées affichent ⚡ distinctif
- [ ] Bandeau "Maintenant" affiche statut RPG miniature
- [ ] Bulle de conseil héros dans l'onglet Planning

### Phase 4
- [ ] Avatar héros uniquement sur la cellule du jour courant
- [ ] "Perfect Day" bordure dorée sur jours passés
- [ ] Résumé narratif affiché une fois par session au chargement
- [ ] Badges RPG ajoutés à `checkAllBadges()`

### Phase 5
- [ ] State machine Focus (IDLE / FOCUSING / REWARD / PENALTY) fonctionnelle
- [ ] `visibilitychange` + `pagehide` écoutés pendant une session Focus
- [ ] Pénalité HP appliquée si `abandonned === true` à la réouverture
- [ ] Mode Focus accessible uniquement depuis créneaux `work`/`study`/`japanese`
