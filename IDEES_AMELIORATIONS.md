# LifeFlow — Idées d'améliorations futures

> Document de référence pour les prochaines évolutions de l'application.
> Chaque idée est classée par **priorité** (🔴 haute, 🟡 moyenne, 🟢 bonus) et **difficulté** (⚡ rapide, 🔧 moyen, 🏗️ complexe).

---

## 🎮 Axe 1 — Ludique & Gamification

### Quêtes & Défis

| Idée | Description | Priorité | Difficulté |
|------|------------|----------|-----------|
| **Quêtes hebdomadaires** | 3 mini-défis générés chaque lundi (ex: "Cours 3× cette semaine", "30 min de japonais 5 jours") avec récompense XP bonus | 🔴 | 🔧 |
| **Défis mensuels** | Un grand défi thématique par mois (ex: "Mois du D+" = cumuler 2000m D+) avec badge spécial | 🔴 | 🔧 |
| **Quêtes chaînées** | Série de quêtes progressives qui racontent une "histoire" (ex: "Le Chemin de Compostelle" = courir 800 km cumulés) | 🟡 | 🔧 |
| **Défis flash** | Pop-up aléatoire proposant un micro-défi du jour ("Aujourd'hui, fais 5 min de japonais de plus que d'habitude") | 🟢 | ⚡ |

### Progression & Récompenses

| Idée | Description | Priorité | Difficulté |
|------|------------|----------|-----------|
| **Arbre de compétences** | Visualisation en arbre des badges par catégorie (Course → Endurance → Ultra), avec branches à débloquer | 🟡 | 🏗️ |
| **Titres débloquables** | Titres affichés sous le nom (ex: "Samouraï du Dimanche", "Chasseur de D+") gagnés par combinaisons de badges | 🟡 | ⚡ |
| **Séries (streaks) visuelles** | Calendrier type GitHub contribution avec couleurs par intensité d'activité, pour voir la régularité en un clin d'œil | 🔴 | 🔧 |
| **Animations de level-up** | Animation plein écran + son lors d'un passage de niveau ou badge épique | 🟡 | 🔧 |
| **Saisons** | Système de "saisons" trimestrielles avec classement personnel, badges saisonniers exclusifs, et reset partiel pour garder la motivation | 🟢 | 🏗️ |

### Social & Compétition (optionnel)

| Idée | Description | Priorité | Difficulté |
|------|------------|----------|-----------|
| **Duel contre soi-même** | Comparer sa semaine actuelle vs sa meilleure semaine passée, avec indicateur victoire/défaite | 🔴 | ⚡ |
| **Fantôme de la semaine passée** | Sur les graphiques, superposer les données de la semaine précédente en transparence | 🟡 | 🔧 |
| **Partage de badges** | Générer une image "carte de badge" partageable (Instagram story format) | 🟢 | 🔧 |

---

## ⚙️ Axe 2 — Fonctionnalités techniques

### Données & Intégrations

| Idée | Description | Priorité | Difficulté |
|------|------------|----------|-----------|
| **Import Strava** | Connecter l'API Strava pour importer automatiquement les km, D+, temps de course — plus besoin de saisie manuelle | 🔴 | 🏗️ |
| **Import/Export CSV** | Exporter toutes les données en CSV pour analyse dans Excel, et importer depuis un fichier | 🟡 | 🔧 |
| **Synchronisation cloud** | Stocker les données sur Firebase/Supabase pour synchroniser entre appareils sans passer par GitHub | 🟡 | 🏗️ |
| **Historique avec calendrier** | Vue calendrier mensuelle cliquable pour consulter/modifier les logs passés jour par jour | 🔴 | 🔧 |

### Visualisations & Analytics

| Idée | Description | Priorité | Difficulté |
|------|------------|----------|-----------|
| **Graphiques mensuels/trimestriels** | Courbes d'évolution sur 30/90/365 jours (km cumulés, score moyen, streaks) | 🔴 | 🔧 |
| **Heatmap d'activité** | Carte de chaleur annuelle style GitHub montrant les jours d'activité | 🟡 | 🔧 |
| **Rapport mensuel auto-généré** | Résumé PDF/page avec stats du mois, badges gagnés, progression, points forts/faibles | 🟡 | 🏗️ |
| **Tendances & prédictions** | "À ce rythme, tu atteindras 1000 km total dans X semaines" | 🟢 | 🔧 |

### UX & Confort

| Idée | Description | Priorité | Difficulté |
|------|------------|----------|-----------|
| **Mode sombre/clair** | Toggle pour basculer entre thème sombre (actuel) et thème clair | 🟢 | ⚡ |
| **Saisie rapide** | Widget résumé pour saisir les données essentielles en 3 clics (km + humeur + habitudes) | 🔴 | 🔧 |
| **Raccourcis clavier** | Navigation entre onglets avec les touches 1-5, Entrée pour sauvegarder | 🟢 | ⚡ |
| **Mode voyage** | Planning adapté automatiquement quand on est en déplacement (horaires flexibles, exercices hôtel) | 🟡 | 🔧 |

---

## 🧠 Axe 3 — Vision Coach & Développement personnel

### Périodisation & Planification intelligente

| Idée | Description | Priorité | Difficulté |
|------|------------|----------|-----------|
| **Plan d'entraînement trail** | Générateur de plan sur 12-16 semaines vers un objectif (50 km, 100 km) avec phases de base, intensité, affûtage, récup | 🔴 | 🏗️ |
| **Semaine de récupération auto** | Détection automatique après 3 semaines intenses → propose une semaine allégée (‑30% volume) | 🔴 | 🔧 |
| **Objectifs SMART** | Module de définition d'objectifs par trimestre avec jalons intermédiaires et suivi de progression visuel | 🟡 | 🔧 |
| **Review trimestrielle guidée** | Questionnaire guidé tous les 3 mois : "Qu'est-ce qui a marché ? Qu'est-ce qui a bloqué ? Ajustements ?" | 🟡 | ⚡ |

### Bien-être & Récupération

| Idée | Description | Priorité | Difficulté |
|------|------------|----------|-----------|
| **Suivi nutrition basique** | Tracker simple : hydratation (L/jour), qualité alimentation (1-5), compléments pris | 🟡 | ⚡ |
| **Score de récupération** | Indicateur calculé à partir de sommeil + humeur + intensité de la veille → "Prêt / Fatigué / Repos nécessaire" | 🔴 | 🔧 |
| **Suivi du poids/composition** | Graphique de suivi pondéral avec tendance sur 4 semaines (utile pour la perf trail) | 🟢 | ⚡ |
| **Rappels de stretching/mobilité** | Suggestions d'exercices de mobilité les jours de repos, avec timer intégré | 🟡 | 🔧 |

### Mindset & Motivation

| Idée | Description | Priorité | Difficulté |
|------|------------|----------|-----------|
| **Journal de gratitude** | 3 choses positives par jour — études montrent un impact significatif sur le bien-être et la motivation | 🔴 | ⚡ |
| **Citation du jour** | Citation motivante aléatoire sur le dashboard, renouvelée chaque jour | 🟢 | ⚡ |
| **Rétrospective de victoires** | Section "Tes victoires récentes" rappelant les badges gagnés, records battus, objectifs atteints cette semaine | 🟡 | ⚡ |
| **Détection de patterns** | Analyse automatique : "Tu cours mieux les jours où tu dors 7h+" ou "Ton humeur est plus haute les jours avec japonais" | 🟢 | 🏗️ |
| **Mentor virtuel** | Messages contextuels basés sur les données : encouragements quand le streak continue, alertes bienveillantes quand ça baisse | 🟡 | 🔧 |

### Élargissement des horizons

| Idée | Description | Priorité | Difficulté |
|------|------------|----------|-----------|
| **Module lecture** | Tracker de livres lus avec objectif annuel (ex: 12 livres/an = 1/mois) + notes courtes | 🟡 | ⚡ |
| **Compétences à développer** | Liste de skills à travailler (cuisine, bricolage, premiers secours...) avec progression par paliers | 🟢 | 🔧 |
| **Budget simplifié** | Suivi basique des dépenses par catégorie pour les mois de déplacement (transport, repas, loisirs) | 🟢 | 🔧 |
| **Réseau social minimal** | Rappel de contacts à recontacter (1/semaine) pour maintenir les liens malgré les déplacements constants | 🟡 | ⚡ |

---

## 🗺️ Roadmap suggérée

### Sprint 1 — Quick wins (1-2 sessions)
1. Journal de gratitude (3 lignes/jour)
2. Duel contre soi-même (semaine actuelle vs meilleure)
3. Séries visuelles (calendrier GitHub-style)
4. Saisie rapide (widget 3 clics)

### Sprint 2 — Coaching (2-3 sessions)
1. Score de récupération (sommeil + humeur + charge)
2. Quêtes hebdomadaires (3 défis/semaine)
3. Graphiques mensuels d'évolution
4. Review trimestrielle guidée

### Sprint 3 — Données (3-4 sessions)
1. Historique calendrier (consulter/modifier les jours passés)
2. Import Strava
3. Rapport mensuel auto-généré
4. Plan d'entraînement trail

### Sprint 4 — Polish (2 sessions)
1. Animations de level-up
2. Heatmap d'activité annuelle
3. Tendances & prédictions
4. Détection de patterns
