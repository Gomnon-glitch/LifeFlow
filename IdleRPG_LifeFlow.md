# Idle RPG LifeFlow — Design & Spécifications

## 1. Vision Générale
Transformer l'onglet "Installer" en un mini-jeu RPG Idle (Cyber-Fantasy) intégré à la boucle de productivité de LifeFlow. Le jeu est conçu pour une progression sur le long terme (1 an+) via des mécaniques de prestige et de scaling infini, avec une synergie forte entre vos performances réelles et votre puissance en jeu.

## 2. Système de Combat & Progression
- **Combat Automatique** : Le héros progresse par vagues d'ennemis de plus en plus forts.
- **Stats de Base** : HP, ATK, DEF, Vitesse.
- **Synergie IRL ↔ RPG** :
    - **Trail (Strava)** : Les km courus donnent un buff de "Vitesse d'Attaque" pendant 24h. Le dénivelé cumulé recharge une jauge de capacité spéciale.
    - **Japonais** : Réussir des sessions de japonais permet d'utiliser des Kanji comme incantations de sorts.
- **Scaling des Ennemis** : Les statistiques augmentent de manière exponentielle par vague (`Stat = Base * (1.15 ^ Vague)`).
- **Progression Hors-ligne** : Le calcul du farm (XP, pièces, loot) se fait au retour du joueur basé sur le `lastUpdate` timestamp.

## 3. Équipement & Butin (Loot)
- **8 Emplacements** : Arme, Tête, Torse, Gants, Jambières, Bottes, Amulette, Accessoire.
- **Rareté & Passions** : Les affixes d'objets rappellent vos centres d'intérêt (ex: *"Bottes de Trail d'Endurance Infatigable"*).
- **Loot Narratif & Streaks** : La chance de loot (`Luck`) augmente proportionnellement à votre streak actuel d'habitudes.
- **Système de Tiers** : Multiplicateur de puissance par étage.
- **Fusion (Forge)** : Combinez 3 objets identiques pour monter de Tier ou de rareté.
- **Lien Quêtes** : Terminer des quêtes quotidiennes/hebdo offre des coffres d'équipement de haut Tier.

## 4. Système de Prestige & Nanotech
- **Reset de Synchronisation** : Redémarrage à la Vague 1 contre des **Fragments de Code**.
- **Nanotech "Bio-Feedback"** : L'accès à certaines branches de l'arbre dépend de vos KPIs hebdomadaires (ex: branche "Endurance" débloquée si KPI Trail > 80%).
- **Compétences Permanentes** : Multiplicateurs ATK/DEF, chance de loot, réduction du temps de combat.

## 5. Fonctionnalités Avancées
- **Mode Concentration (Pomodoro Combat)** : Un timer de travail réel. Pendant qu'il tourne, le héros entre en "Méditation de Combat" (gros bonus de farm). Si vous quittez l'app trop tôt, le héros subit des dégâts.
- **Résumé Narratif** : Lors de la réouverture, un texte généré ou descriptif résume vos exploits en liant vos actions réelles à celles du héros.

## 6. Interface (UI/UX)
- **Style Visual** : Pixel art 2D (ambiance mélange Fantastique/SF).
- **Gommette RPG** : Sur le calendrier mensuel, l'avatar du héros (portant son équipement actuel) remplace les simples gommettes.
- **Grille d'Inventaire** : Gestion avec comparaison rapide des stats.

## 7. Structure Technique (State)
```javascript
rpg: {
  hero: { hp, atk, def, lvl, xp, prestigePoints, resets, focusTimer: 0 },
  equipment: { weapon, head, torso... },
  inventory: [],
  skillTree: { skillId: level },
  currentWave: 1,
  highestWave: 1,
  lastUpdate: Date.now()
}
```
