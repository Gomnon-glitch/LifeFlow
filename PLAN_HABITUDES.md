# Prompt pour mise à jour du suivi des habitudes - LifeFlow

## Objectif
Mettre à jour la section "Suivi des habitudes" de l'onglet "Habitudes" pour permettre la modification/suppression et la personnalisation des couleurs, tout en préservant les streaks et en impactant la vue mensuelle.

## Détails de l'implémentation

### 1. Structure des données
- Ajouter une propriété `color` à chaque objet dans `state.habits`.
- Valeurs par défaut suggérées : `--accent-blue`, `--accent-purple`, `--accent-green`, `--accent-orange`, `--accent-pink`, `--accent-cyan`.

### 2. Interface Utilisateur (UI)
- **Liste des habitudes** : Ajouter des icônes d'action sur chaque carte (`habit-card`) :
    - ✏️ (Modifier) : Ouvre un modal pré-rempli.
    - 🗑️ (Supprimer) : Demande confirmation avant suppression.
- **Modaux** : 
    - Mettre à jour `openAddHabitModal()` pour inclure un choix de couleur.
    - Créer `openEditHabitModal(habitId)` pour gérer la modification du nom et de la couleur.

### 3. Logique (JS)
- **Persistance des streaks** : S'assurer que la modification d'une habitude (nom/couleur) conserve le même `id`. La fonction `calculateHabitStreak(habitId)` restera valide.
- **Création** : Une nouvelle habitude génère un nouvel ID (`hab-timestamp`), démarrant son streak à 0.
- **Suppression** : Supprimer l'entrée dans `state.habits` et idéalement nettoyer `state.habitChecks` (optionnel mais propre).

### 4. Vue Mensuelle (Calendrier)
- **Fonction `renderVisualCalendar()`** : 
    - Actuellement, elle affiche un point générique `dot-habit`.
    - La modifier pour boucler sur `state.habits`.
    - Pour chaque habitude validée à la date `key`, afficher une gommette (`day-dot`) utilisant la couleur définie dans l'objet habitude (`background-color: var(habit.color)` ou valeur hexa).

### 5. Styles (CSS)
- Ajouter les classes ou styles inline nécessaires pour les gommettes colorées.
- Styliser les boutons d'édition/suppression pour qu'ils soient subtils (ex: visibles au survol).
