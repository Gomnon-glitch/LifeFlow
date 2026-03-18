# Plan d'Implémentation — Idle RPG LifeFlow

*Basé sur `IdleRPG_LifeFlow.md` · adapté à l'état réel de l'application au 2026-03-18*

---

## 1. État des lieux — Ce qui est déjà en place

| Élément | Statut | Notes |
|---------|--------|-------|
| `rpg.hero` (hp, atk, def, speed, lvl, xp, luck) | ✅ Implémenté | `checkLevelUp()`, `getHeroStats()` opérationnels |
| `rpg.equipment` (8 slots, tous null) | ✅ Structure | Slots définis, aucun item assigné |
| `rpg.inventory` (array vide) | ✅ Structure | Aucune logique de loot |
| `rpg.skillTree` (objet vide) | ✅ Structure | Jamais utilisé |
| `rpg.currentWave` / `highestWave` | ✅ Structure | Initialisés à 1, jamais incrémentés |
| `rpg.activeBuffs` | ✅ Structure | Défini, jamais rempli |
| `rpg.prestigePoints` / `resets` | ✅ Structure | Jamais incrémentés |
| `calculateOfflineGains()` | ✅ Partiel | Donne uniquement du XP héros. Pas d'or, pas de loot |
| `addXP(type, amount)` | ✅ Complet | Avec multiplicateurs saisonniers et héritage |
| Focus Timer (Pomodoro Combat) | ✅ Complet | Méditation de Combat opérationnelle |
| Système de saisons | ✅ Complet | Phases 2-3-4-5 implémentées |
| `renderGamification()` | ❌ BUG | Appelée dans `toggleSpecialQuest()` mais non définie → à corriger |

---

## 2. Déviations par rapport à `IdleRPG_LifeFlow.md`

### 2.1 Boucle de jeu — Pas de `setInterval` permanent

Le document originel imagine un combat continu. **Ce modèle est incompatible avec une PWA** (consommation CPU/batterie, wake-lock non disponible sur iOS). Le modèle retenu :

- **Calcul discret à l'ouverture** : quand l'app se rouvre, on calcule tout ce qui s'est passé depuis `rpg.lastUpdate` (XP, or, vagues franchies, loots).
- **Tick actif uniquement dans l'onglet RPG ouvert** : quand l'utilisateur est sur l'onglet Combat, un `setInterval` de 3s simule la progression en temps réel, stoppé dès qu'il quitte.
- `rpg.lastUpdate` est déjà en place — il suffit d'enrichir `calculateOfflineGains()`.

### 2.2 Style visuel — Glassmorphism, pas pixel art

Le style pixel art 2D est trop coûteux à produire en vanilla JS/CSS. Le rendu RPG utilisera le système de glassmorphism + variables saisonnières déjà en place, avec iconographie emoji pour les ennemis, équipements et sorts.

### 2.3 Onglet dédié — "Installer" repurposé

L'onglet **Installer** (installation PWA, usage unique) est repurposé en onglet **Héros** ⚔️. Les instructions d'installation sont déplacées dans l'onglet Config.

### 2.4 Gommettes RPG sur calendrier

L'avatar en surimpression sur le calendrier est une fonctionnalité cosmétique (Phase 4 du plan global). Elle sera traitée comme un add-on optionnel en fin de Phase RPG-D, pas comme un prérequis.

---

## 3. Architecture des données — Enrichissement de `state.rpg`

Les champs à ajouter dans la migration `loadData()` :

```javascript
// Phase RPG-A
rpg.hero.gold = 0;          // monnaie de combat (donjons)
rpg.combatLog = [];         // dernier log de combat (pour narrative)
rpg.pendingLoot = [];       // loots en attente de réclamation

// Phase RPG-B
// rpg.inventory et rpg.equipment existent déjà

// Phase RPG-C
// Pas de nouveaux champs — forge utilise inventory existant

// Phase RPG-D
rpg.hero.fragments = 0;     // Fragment de Code (monnaie de prestige)
// rpg.skillTree existe déjà (objet vide)

// Phase RPG-E
rpg.kanji = [];             // sorts débloqués via sessions japonaises
rpg.stravaBuff = null;      // { expiresAt: timestamp, speedBonus: 0.5 }
```

**Contrainte localStorage** : l'inventaire est plafonné à **60 items** (FIFO — supprime le plus ancien commun). Le `combatLog` ne conserve que les **10 dernières entrées**.

---

## 4. Mécanique de Combat — Spécifications techniques

### 4.1 Ennemi par vague

```
ennemi.hp   = 50  × (1.15 ^ (wave - 1))
ennemi.atk  = 8   × (1.15 ^ (wave - 1))
ennemi.def  = 3   × (1.15 ^ (wave - 1))
ennemi.gold = 5   × (1.12 ^ (wave - 1))   [plafonné à 5000]
ennemi.xp   = 10  × (1.12 ^ (wave - 1))   [plafonné à 10000]
```

### 4.2 Formule de combat (par tick de ~3s)

```
dégâts_héros   = max(1, hero.atk - ennemi.def)
dégâts_ennemi  = max(1, ennemi.atk - hero.def)

Cooldown d'attaque héros = 3s / hero.speed
→ si stravaBuff actif : hero.speed × 1.5 pendant 24h
```

### 4.3 Calcul hors-ligne

```
minutes_passées = min((Date.now() - lastUpdate) / 60000, 480)  // 8h max
vagues_par_minute = hero.atk / (ennemi.hp / max(1, hero.atk - ennemi.def)) × (hero.speed / 60)
vagues_gagnées = floor(minutes × vagues_par_minute)
or_gagné = sum(ennemi.gold × vagues_gagnées)
xp_gagné = sum(ennemi.xp × vagues_gagnées)
loots = [drop aléatoire si luck > threshold, 1 par tranche de 5 vagues]
```

### 4.4 Mort du héros

Si HP tombe à 0 en combat actif (onglet ouvert) :
- HP restauré à 50%
- On reste à la même vague (pas de perte de progression)
- Toast d'alerte

---

## 5. Système de Loot — Génération d'items

### 5.1 Structure d'un item

```javascript
{
  id: `item_${timestamp}_${random}`,
  slot: 'weapon',         // weapon | head | torso | gloves | legs | boots | amulet | accessory
  tier: 1,                // 1–5 (5 = légendaire)
  rarity: 'common',       // common | rare | epic | legendary
  name: 'Épée de Trail',  // généré (voir 5.2)
  emoji: '⚔️',
  atk: 5,
  def: 0,
  hp: 0,
  special: null,          // ex: { type: 'speed', value: 0.2 } pour Tier 3+
}
```

### 5.2 Génération thématique (adapté aux centres d'intérêt)

Chaque slot a une pool de noms basés sur le profil :

| Slot | Pool thématique |
|------|----------------|
| weapon | Bâton de Trail, Kodachi de Saison, Katana du Marcheur, Épée de l'Aube |
| head | Casque de Sentier, Bandeau Kanji, Capuche du Randonneur |
| torso | Armure de Montagne, Veste d'Endurance, Kimono de Combat |
| boots | Bottes de Trail, Sandales du Ninja, Chaussures d'Alpiniste |
| amulet | Amulette de Concentration, Fuda Saisonnier, Talisman de Streak |

**Tier 3+ uniquement** : affixe passif spécial (ex: "+0.2 vitesse pendant Focus Timer", "+5% XP habitudes").

### 5.3 Taux de drop

```
Luck 10 (base)   → 8% par vague
Luck 15          → 12%
Luck 20          → 18%
Luck 25 (max)    → 25%
Tier du drop = floor(wave / 10) + 1, max 5
```

### 5.4 Forge

```
3 items (même slot, même tier) → 1 item (même slot, tier+1)
```

Interface : glisser/sélectionner 3 items → bouton "Forger" → confirmation.

---

## 6. Arbre de Compétences — BioFeedback (Phase RPG-D)

### 6.1 Structure

4 branches déblocables par KPI hebdomadaire. **5 nœuds par branche**, coût en Fragments de Code.

| Branche | KPI débloquant | Bonus phares |
|---------|---------------|-------------|
| 🏃 **Endurance** | KPI Trail ≥ 60% | +ATK, +vitesse d'attaque, buff Strava ×2 |
| 🧘 **Concentration** | Focus sessions ≥ 3 cette semaine | +DEF, XP Focus ×1.5, timer pause réduit |
| 📿 **Discipline** | Streak habitudes ≥ 3 jours | +HP max, Luck+, streak bonus XP |
| 🔍 **Curiosité** | ≥ 2 découvertes cette semaine | Loot tier+1, drop rate+5%, sorts Kanji |

### 6.2 Prestige

- Disponible à partir de la **vague 50**
- Récompense : `floor(currentWave / 10)` Fragments de Code
- Reset : wave → 1, hero.lvl → 1, hero stats réinitialisés **mais** skillTree, highestWave et equipment conservés
- `resets++`, `prestigePoints += fragments_gagnés`

---

## 7. Synergies IRL ↔ RPG

| Action IRL | Effet RPG |
|-----------|----------|
| Km Strava enregistrés | `rpg.stravaBuff = { expiresAt: now+86400000, speedBonus: km×0.05 }` → hero.speed × (1 + speedBonus) pendant 24h |
| Session japonaise | Débloque un sort Kanji aléatoire (capacité spéciale en combat) |
| Planning streak | Buff DEF temporaire (1 vague) par semaine de streak |
| Focus session complète | Buff ATK +20% pendant 30 min (actif uniquement en onglet RPG) |
| Journée Parfaite (toutes habitudes + créneaux) | +Luck +2 pour la session du jour |

---

## 8. Interface Utilisateur

### 8.1 Onglet Héros ⚔️ (repurpose de l'onglet Installer)

Structure de l'onglet avec **sous-sections scrollables** (pas de sub-tabs pour éviter la complexité) :

```
[⚔️ Combat]          Section principale — arena, ennemi actuel, HP bars
[📦 Inventaire]      Grille 4×col, tap pour comparer
[🔨 Forge]           Sélection 3 items + bouton forger
[🌳 Arbre]           BioFeedback skill tree (débloqué au niveau 10)
[⭐ Prestige]         Bouton reset + historique (débloqué vague 50)
```

Navigation via boutons pills horizontaux (scroll horizontal si nécessaire).

### 8.2 Section Combat

```
┌─────────────────────────────┐
│  Vague 12 ┄┄ [Meilleure: 18] │
│                             │
│    👹 Gobelin Sombre        │
│    HP: ████████░░ 340/500   │
│                             │
│    ⚔️ Héros  HP: ██████ 120/150  │
│    ATK: 35  DEF: 18  SPD: 1.3  │
│    🎲 Luck: 15  💰 Gold: 420   │
│                             │
│  [▶️ Combat actif]  [⏸ Pause] │
│                             │
│  ⏰ Hors-ligne : +280 XP, +120💰│
│     Vagues 5→12 franchies   │
└─────────────────────────────┘
```

### 8.3 Inventaire

Grille responsive (3 colonnes sur mobile). Chaque item : emoji slot + tier stars + stat principale. Tap → modal détail avec comparaison équipé/proposé + bouton "Équiper".

---

## 9. Roadmap Phases

### ✅ Prérequis validés

Phases 0, 1, 2, 3, 4, 5 du `PLAN_ADAPTATION_GLOBALE.md` — toutes implémentées.

---

### Phase RPG-A — Moteur de Combat & Onglet Héros

*Scope : combat discret + UI minimale*

- [ ] **Corriger** `renderGamification()` manquante (bug existant)
- [ ] Migrer onglet "Installer" → onglet "Héros ⚔️" (index.html)
- [ ] Déplacer le contenu install dans Config
- [ ] Enrichir `calculateOfflineGains()` : vagues, or, loots basiques
- [ ] Ajouter `rpg.hero.gold = 0` dans la migration `loadData()`
- [ ] `tickCombat()` : progression active dans l'onglet (3s interval, stoppé en arrière-plan)
- [ ] `getEnnemyStats(wave)` : formule `Base × 1.15^(wave-1)`
- [ ] Incrémenter `currentWave` / `highestWave` lors des victoires
- [ ] Rendu : arena, HP bars ennemi/héros, stats actuelles, résumé offline
- [ ] Rendu équipement équipé (slots visuels, emplacements vides)

**Résultat** : L'utilisateur voit son héros combattre des ennemis, la vague progresser, l'or s'accumuler.

---

### Phase RPG-B — Loot & Équipement

*Scope : items, inventaire, équipement*

- [ ] `generateItem(wave, luck)` : création procédurale (slot, tier, stats, nom)
- [ ] Système de drop intégré à `calculateOfflineGains()` et `tickCombat()`
- [ ] Inventaire grid UI (3 colonnes, scroll)
- [ ] Modal détail item : stats + comparaison avec équipé
- [ ] `equipItem(itemId)` / `unequipItem(slot)`
- [ ] `rpg.pendingLoot` : file d'attente de loots → notification "Tu as du butin !"
- [ ] Plafond inventaire 60 items avec FIFO sur commons

**Résultat** : Le joueur collecte des items, les compare, s'équipe.

---

### Phase RPG-C — Forge & Économie

*Scope : forge, shop basique*

- [ ] UI Forge : sélection multi-item (même slot + même tier)
- [ ] `forgeItems(item1, item2, item3)` → génère tier+1
- [ ] Shop basique : acheter Potion de Soin (50 gold → +50 HP max temporaire)
- [ ] Affichage gold dans le hub RPG

**Résultat** : L'inventaire est gérable via la forge.

---

### Phase RPG-D — Arbre BioFeedback & Synergies IRL

*Scope : skill tree, synergies IRL enrichies*

- [ ] Définir les 20 nœuds de l'arbre (4 branches × 5 nœuds) avec coûts et effets
- [ ] `unlockSkill(skillId)` : vérifie KPI hebdo, dépense fragments
- [ ] Appliquer les bonus de l'arbre dans `getHeroStats()` et `calculateOfflineGains()`
- [ ] Buff Strava : `addStravaBuff(km)` appelé depuis `saveLog()` si km > 0
- [ ] Sorts Kanji : pool de 8 sorts, débloqués par session japonaise ≥ 10min
- [ ] Affichage sorts disponibles en combat (coût mana = `focusSessionsCompleted`)

**Résultat** : Les actions réelles impactent directement le combat.

---

### Phase RPG-E — Prestige & Polish

*Scope : reset prestige, narration enrichie*

- [ ] `canPrestige()` : wave ≥ 50
- [ ] `doPrestige()` : reset + attribution Fragments, conservation skillTree/equipment
- [ ] Modal prestige : bilan vague max, fragments gagnés, bonus héritage
- [ ] Enrichir `calculateOfflineGains()` avec summary narratif (texte généré)
- [ ] *[Optionnel]* Avatar héros (emoji) sur les jours Parfaits du calendrier
- [ ] Badges RPG : `wave-10`, `wave-50`, `prestige-1`, `full-equip`, `forged-epic`, `skill-tree-full`

---

## 10. Points de Vigilance

- **Performance** : `tickCombat()` ne tourne que si l'onglet RPG est actif (`document.visibilityState === 'visible'` + tab courante = 'install'). Nettoyé systématiquement avec `clearInterval` au changement d'onglet.
- **localStorage** : inventaire plafonné à 60 items, combatLog à 10 entrées, `pendingLoot` vidé après réclamation. Estimer ~2ko supplémentaires par 20 items.
- **Cohérence offline** : `calculateOfflineGains()` doit être idempotent — si elle est appelée deux fois (race condition avec cloud sync), ne pas doubler les gains. Utiliser un mutex `rpg.offlineProcessed = lastUpdate` pour déduplication.
- **Équilibre** : le gold et l'XP offline sont plafonné à 8h (déjà en place). Les vagues franchies offline sont aussi plafonnées pour éviter un skip trop rapide.
- **Buff Focus / Strava** : stocker le timestamp d'expiration, pas une durée, pour résister au calcul offline.
- **Service Worker** : chaque phase bump le `CACHE_NAME`.
