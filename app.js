/* ============================================
   LIFEFLOW — Application Logic
   ============================================ */

const app = {
  // ============================================
  // STATE
  // ============================================
  state: {
    currentTab: 'dashboard',
    currentWeekOffset: 0,
    currentTemplate: 'work',
    ratings: { mood: 0, sleep: 0 },
    habits: [],
    logs: {},       // { "2026-03-08": { km: 5, dplus: 100, japanese: 15, screentime: 1, mood: 4, sleep: 4 } }
    habitChecks: {},// { "2026-03-08": { "habit-id": true/false } }
    config: {
      name: 'Jason',
      wakeTime: '07:30',
      bedTime: '23:00',
      workEnd: '18:30',
      weeklyKm: 40,
      runningSessions: 4,
      weeklyDplus: 500,
      japaneseWords: 35,
      maxScreentime: 7,
      discoveries: 2,
      monthGoal: '',
      notes: ''
    },
    discoveryAccepted: {},  // { weekKey: [index, index] }
    weekPlannings: {},      // { "2026-W10": { "mon-evening1": { type: 'run', label: '...' } } }
    // Gamification
    xp: 0,
    level: 1,
    unlockedBadges: {},     // { "badge-id": "2026-03-08" (date unlocked) }
    records: {              // Personal bests
      longestRun: 0,
      biggestDplus: 0,
      bestWeekKm: 0,
      bestWeekScore: 0,
      longestJapStreak: 0,
      longestHabitStreak: 0,
      totalKm: 0,
      totalDplus: 0,
      totalJapMinutes: 0,
      totalDiscoveries: 0,
    }
  },

  // ============================================
  // DISCOVERY DATABASE
  // ============================================
  discoveryPool: [
    { emoji: '🧘', title: 'Méditation guidée', desc: '10 min de méditation pour débutants (YouTube/Headspace)', category: 'bien-être' },
    { emoji: '📷', title: 'Photographie mobile', desc: 'Apprendre les bases de la composition photo avec ton smartphone', category: 'créatif' },
    { emoji: '🎨', title: 'Dessin — Croquis rapides', desc: '15 min de croquis quotidien (DrawABox, YouTube)', category: 'créatif' },
    { emoji: '🧑‍🍳', title: 'Cuisine — Nouvelle recette', desc: 'Essayer une recette simple d\'un pays différent', category: 'lifestyle' },
    { emoji: '📚', title: 'Lecture — 20 pages', desc: 'Lire 20 pages d\'un livre (fiction ou non-fiction)', category: 'apprentissage' },
    { emoji: '🎵', title: 'Découverte musicale', desc: 'Écouter un album entier d\'un genre que tu ne connais pas', category: 'culture' },
    { emoji: '🧩', title: 'Puzzle logique', desc: 'Sudoku, mots croisés ou puzzle en ligne (15 min)', category: 'mental' },
    { emoji: '🌱', title: 'Jardinage / Plantes', desc: 'S\'occuper de plantes d\'intérieur ou planter quelque chose', category: 'lifestyle' },
    { emoji: '✍️', title: 'Écriture libre', desc: 'Journaling : écrire tes pensées pendant 10 min', category: 'bien-être' },
    { emoji: '🗺️', title: 'Exploration locale', desc: 'Découvrir un lieu/sentier près de chez toi que tu n\'as jamais visité', category: 'outdoor' },
    { emoji: '🎸', title: 'Instrument — Bases', desc: 'Apprendre un accord de guitare ou une mélodie au piano (YouTube)', category: 'créatif' },
    { emoji: '🧠', title: 'Apprendre un fait', desc: 'Regarder une vidéo éducative (Kurzgesagt, Veritasium...)', category: 'apprentissage' },
    { emoji: '🏊', title: 'Natation', desc: 'Une session de natation libre (30 min)', category: 'sport' },
    { emoji: '🚴', title: 'Vélo — Balade', desc: 'Sortie vélo découverte (1h)', category: 'sport' },
    { emoji: '🥋', title: 'Étirements/Yoga', desc: 'Session de yoga pour coureurs (20 min)', category: 'sport' },
    { emoji: '🎬', title: 'Film en VO japonaise', desc: 'Regarder un film ou anime en japonais sous-titré', category: 'culture' },
    { emoji: '🛠️', title: 'DIY — Petit projet', desc: 'Fabriquer ou réparer quelque chose de simple', category: 'lifestyle' },
    { emoji: '🌍', title: 'Géographie — Pays du jour', desc: 'Découvrir un pays : culture, géographie, food (15 min)', category: 'culture' },
    { emoji: '🎯', title: 'Origami', desc: 'Apprendre à plier une figure en origami (lien avec le Japon !)', category: 'créatif' },
    { emoji: '🧗', title: 'Escalade en salle', desc: 'Tester une session de bloc en salle d\'escalade', category: 'sport' },
    { emoji: '📝', title: 'Calligraphie japonaise', desc: 'Pratiquer l\'écriture de 5 kanji au pinceau', category: 'créatif' },
    { emoji: '🎲', title: 'Jeu de société solo', desc: 'Découvrir un jeu de société jouable seul', category: 'détente' },
    { emoji: '🌄', title: 'Lever/coucher de soleil', desc: 'Sortir observer un lever/coucher de soleil dehors', category: 'outdoor' },
    { emoji: '🔬', title: 'Science du trail', desc: 'Lire un article sur la physiologie du trail (nutrition, récup...)', category: 'apprentissage' },
    { emoji: '💡', title: 'Productivité — Nouvelle méthode', desc: 'Tester une technique (Pomodoro, GTD, time blocking...)', category: 'apprentissage' },
    { emoji: '🏛️', title: 'Visite culturelle', desc: 'Musée, expo, monument historique local', category: 'culture' },
    { emoji: '🎧', title: 'Podcast découverte', desc: 'Écouter un podcast sur un sujet nouveau (pendant la course !)', category: 'culture' },
    { emoji: '🌿', title: 'Randonnée nature', desc: 'Randonnée découverte — nouveau sentier (2-3h)', category: 'outdoor' },
    { emoji: '🗣️', title: 'Conversation avec un inconnu', desc: 'Engager une conversation avec quelqu\'un de nouveau (défi social)', category: 'social' },
    { emoji: '🧪', title: 'Expérience culinaire', desc: 'Cuisiner un plat japonais (onigiri, ramen, gyoza...)', category: 'lifestyle' },
  ],

  // ============================================
  // WEEKLY PLANNING TEMPLATES
  // ============================================
  templates: {
    work: {
      name: '💼 Semaine travail',
      slots: {
        // Monday
        'mon-morning': { type: 'routine', label: '🔄 Routine matin' },
        'mon-day': { type: 'work', label: '💼 Travail' },
        'mon-evening1': { type: 'rest', label: '🧘 Repos / Mobilité' },
        'mon-evening2': { type: 'japanese', label: '🇯🇵 Japonais (15 min)' },
        'mon-evening3': { type: 'gaming', label: '🎮 Jeux vidéo' },
        // Tuesday
        'tue-morning': { type: 'routine', label: '🔄 Routine matin' },
        'tue-day': { type: 'work', label: '💼 Travail' },
        'tue-evening1': { type: 'run', label: '🏃 Course moyenne — rythme rapide' },
        'tue-evening2': { type: 'free', label: '📖 Temps libre' },
        'tue-evening3': { type: 'free', label: '📖 Détente' },
        // Wednesday
        'wed-morning': { type: 'routine', label: '🔄 Routine matin' },
        'wed-day': { type: 'work', label: '💼 Travail' },
        'wed-evening1': { type: 'strength', label: '💪 Renforcement musculaire' },
        'wed-evening2': { type: 'japanese', label: '🇯🇵 Japonais (15 min)' },
        'wed-evening3': { type: 'gaming', label: '🎮 Jeux vidéo' },
        // Thursday
        'thu-morning': { type: 'routine', label: '🔄 Routine matin' },
        'thu-day': { type: 'work', label: '💼 Travail' },
        'thu-evening1': { type: 'run', label: '🏃 Fractionné' },
        'thu-evening2': { type: 'free', label: '📖 Temps libre' },
        'thu-evening3': { type: 'free', label: '📖 Détente' },
        // Friday
        'fri-morning': { type: 'routine', label: '🔄 Routine matin' },
        'fri-day': { type: 'work', label: '💼 Travail' },
        'fri-evening1': { type: 'discovery', label: '🌟 Découverte semaine' },
        'fri-evening2': { type: 'japanese', label: '🇯🇵 Japonais (15 min)' },
        'fri-evening3': { type: 'gaming', label: '🎮 Jeux / Sortie' },
        // Saturday
        'sat-morning': { type: 'run', label: '🏃 Course courte — récup (lent)' },
        'sat-day': { type: 'outdoor', label: '☀️ Activité extérieure' },
        'sat-evening1': { type: 'discovery', label: '🌟 Découverte semaine' },
        'sat-evening2': { type: 'gaming', label: '🎮 Jeux vidéo' },
        'sat-evening3': { type: 'free', label: '📖 Détente' },
        // Sunday
        'sun-morning': { type: 'run', label: '🏃 Sortie longue' },
        'sun-day': { type: 'rest', label: '🧘 Repos / Balade' },
        'sun-evening1': { type: 'japanese', label: '🇯🇵 Session japonais +' },
        'sun-evening2': { type: 'free', label: '📋 Prépa semaine' },
        'sun-evening3': { type: 'free', label: '📖 Détente' },
      }
    },
    rest: {
      name: '🏖️ Semaine repos',
      slots: {
        'mon-morning': { type: 'rest', label: '😴 Grasse matinée' },
        'mon-day': { type: 'outdoor', label: '☀️ Activité extérieure' },
        'mon-evening1': { type: 'run', label: '🏃 Course facile' },
        'mon-evening2': { type: 'japanese', label: '🇯🇵 Japonais' },
        'mon-evening3': { type: 'gaming', label: '🎮 Jeux vidéo' },
        'tue-morning': { type: 'routine', label: '🔄 Routine' },
        'tue-day': { type: 'discovery', label: '🌟 Exploration / Découverte' },
        'tue-evening1': { type: 'run', label: '🏃 Course moyenne — rythme rapide' },
        'tue-evening2': { type: 'free', label: '📖 Temps libre' },
        'tue-evening3': { type: 'free', label: '📖 Détente' },
        'wed-morning': { type: 'routine', label: '🔄 Routine' },
        'wed-day': { type: 'outdoor', label: '☀️ Sortie / Visite' },
        'wed-evening1': { type: 'strength', label: '💪 Renfo' },
        'wed-evening2': { type: 'japanese', label: '🇯🇵 Japonais' },
        'wed-evening3': { type: 'gaming', label: '🎮 Jeux' },
        'thu-morning': { type: 'routine', label: '🔄 Routine' },
        'thu-day': { type: 'free', label: '📖 Temps libre' },
        'thu-evening1': { type: 'run', label: '🏃 Fractionné' },
        'thu-evening2': { type: 'free', label: '📖 Temps libre' },
        'thu-evening3': { type: 'free', label: '📖 Détente' },
        'fri-morning': { type: 'routine', label: '🔄 Routine' },
        'fri-day': { type: 'discovery', label: '🌟 Découverte (journée)' },
        'fri-evening1': { type: 'japanese', label: '🇯🇵 Japonais' },
        'fri-evening2': { type: 'gaming', label: '🎮 Jeux' },
        'fri-evening3': { type: 'free', label: '📖 Détente' },
        'sat-morning': { type: 'run', label: '🏃 Course courte — récup' },
        'sat-day': { type: 'outdoor', label: '☀️ Rando / Sortie' },
        'sat-evening1': { type: 'free', label: '📖 Temps libre' },
        'sat-evening2': { type: 'gaming', label: '🎮 Jeux' },
        'sat-evening3': { type: 'free', label: '📖 Détente' },
        'sun-morning': { type: 'run', label: '🏃 Sortie longue' },
        'sun-day': { type: 'rest', label: '🧘 Repos' },
        'sun-evening1': { type: 'japanese', label: '🇯🇵 Japonais session longue' },
        'sun-evening2': { type: 'free', label: '📋 Prépa semaine' },
        'sun-evening3': { type: 'free', label: '📖 Détente' },
      }
    },
    travel: {
      name: '✈️ Déplacement',
      slots: {
        'mon-morning': { type: 'routine', label: '🔄 Routine rapide' },
        'mon-day': { type: 'work', label: '💼 Travail / Déplacement' },
        'mon-evening1': { type: 'run', label: '🏃 Course découverte (nouveau lieu)' },
        'mon-evening2': { type: 'japanese', label: '🇯🇵 Japonais (15 min)' },
        'mon-evening3': { type: 'free', label: '📖 Repos' },
        'tue-morning': { type: 'routine', label: '🔄 Routine rapide' },
        'tue-day': { type: 'work', label: '💼 Travail' },
        'tue-evening1': { type: 'run', label: '🏃 Course moyenne — rythme rapide' },
        'tue-evening2': { type: 'free', label: '📖 Temps libre' },
        'tue-evening3': { type: 'free', label: '📖 Repos' },
        'wed-morning': { type: 'routine', label: '🔄 Routine rapide' },
        'wed-day': { type: 'work', label: '💼 Travail' },
        'wed-evening1': { type: 'strength', label: '💪 Renfo (hôtel/chambre)' },
        'wed-evening2': { type: 'japanese', label: '🇯🇵 Japonais' },
        'wed-evening3': { type: 'free', label: '📖 Repos' },
        'thu-morning': { type: 'routine', label: '🔄 Routine rapide' },
        'thu-day': { type: 'work', label: '💼 Travail' },
        'thu-evening1': { type: 'run', label: '🏃 Fractionné' },
        'thu-evening2': { type: 'free', label: '📖 Temps libre' },
        'thu-evening3': { type: 'free', label: '📖 Repos' },
        'fri-morning': { type: 'routine', label: '🔄 Routine rapide' },
        'fri-day': { type: 'work', label: '💼 Travail / Retour' },
        'fri-evening1': { type: 'rest', label: '🧘 Repos / Transit' },
        'fri-evening2': { type: 'japanese', label: '🇯🇵 Japonais' },
        'fri-evening3': { type: 'gaming', label: '🎮 Jeux' },
        'sat-morning': { type: 'run', label: '🏃 Course récup' },
        'sat-day': { type: 'outdoor', label: '☀️ Activité' },
        'sat-evening1': { type: 'discovery', label: '🌟 Découverte' },
        'sat-evening2': { type: 'gaming', label: '🎮 Jeux' },
        'sat-evening3': { type: 'free', label: '📖 Détente' },
        'sun-morning': { type: 'run', label: '🏃 Sortie longue' },
        'sun-day': { type: 'rest', label: '🧘 Repos' },
        'sun-evening1': { type: 'japanese', label: '🇯🇵 Japonais' },
        'sun-evening2': { type: 'free', label: '📋 Prépa semaine' },
        'sun-evening3': { type: 'free', label: '📖 Détente' },
      }
    }
  },

  // ============================================
  // DEFAULT HABITS
  // ============================================
  defaultHabits: [
    { id: 'hab-routine-am', name: '🌅 Routine matin', icon: '🌅', frequency: 'daily' },
    { id: 'hab-stretching', name: '🤸 Étirements/Mobilité', icon: '🤸', frequency: 'daily' },
    { id: 'hab-japanese', name: '🇯🇵 Japonais (SRS)', icon: '🇯🇵', frequency: 'daily' },
    { id: 'hab-log', name: '📝 Journal du soir', icon: '📝', frequency: 'daily' },
    { id: 'hab-hydration', name: '💧 Hydratation (2L+)', icon: '💧', frequency: 'daily' },
    { id: 'hab-no-scroll', name: '📵 Pas de scroll > 1h', icon: '📵', frequency: 'daily' },
  ],

  // ============================================
  // GAMIFICATION — BADGE DATABASE
  // ============================================
  badges: [
    // ───── 🟢 QUICK (1 semaine / premiers pas) ─────
    { id: 'first-run', emoji: '👟', name: 'Premiers pas', desc: 'Logger ta première sortie course', category: 'course', horizon: 'quick' },
    { id: 'first-log', emoji: '📝', name: 'Journal ouvert', desc: 'Remplir ton premier journal du jour', category: 'général', horizon: 'quick' },
    { id: 'first-japanese', emoji: '🎌', name: 'Konnichiwa', desc: 'Logger ta première session japonais', category: 'japonais', horizon: 'quick' },
    { id: 'first-habit', emoji: '✅', name: 'Prise d\'habitude', desc: 'Cocher ta première habitude', category: 'habitudes', horizon: 'quick' },
    { id: 'first-discovery', emoji: '🔭', name: 'Curieux', desc: 'Essayer ta première découverte', category: 'découverte', horizon: 'quick' },
    { id: '10km-week', emoji: '🏃', name: '10 bornes', desc: 'Courir 10+ km en une semaine', category: 'course', horizon: 'quick' },
    { id: 'streak-3-jap', emoji: '🔥', name: 'Flamme naissante', desc: 'Streak japonais de 3 jours', category: 'japonais', horizon: 'quick' },
    { id: 'score-50', emoji: '⭐', name: 'Demi-étoile', desc: 'Atteindre un score hebdo ≥ 50', category: 'score', horizon: 'quick' },
    { id: 'habits-100-day', emoji: '💯', name: 'Journée parfaite', desc: '100% habitudes en une journée', category: 'habitudes', horizon: 'quick' },
    { id: '4-sessions', emoji: '🏅', name: 'Programme respecté', desc: '4 sessions de course en une semaine', category: 'course', horizon: 'quick' },

    // ───── 🔵 MEDIUM (1 mois) ─────
    { id: 'streak-7-jap', emoji: '🔥', name: 'Flamme 7', desc: 'Streak japonais de 7 jours', category: 'japonais', horizon: 'medium' },
    { id: 'streak-14-jap', emoji: '🔥', name: 'Flamme 14', desc: 'Streak japonais de 14 jours', category: 'japonais', horizon: 'medium' },
    { id: 'streak-30-jap', emoji: '🌋', name: 'Flamme 30', desc: 'Streak japonais de 30 jours', category: 'japonais', horizon: 'medium' },
    { id: '50km-week', emoji: '🏃‍♂️', name: 'Semaine 50', desc: 'Courir 50+ km en une semaine', category: 'course', horizon: 'medium' },
    { id: '1000m-dplus', emoji: '⛰️', name: 'Grimpeur', desc: '1000m D+ en une semaine', category: 'course', horizon: 'medium' },
    { id: '100km-total', emoji: '🛤️', name: 'Centenaire', desc: 'Cumuler 100 km au total', category: 'course', horizon: 'medium' },
    { id: 'score-70', emoji: '🌟', name: 'Bonne semaine', desc: 'Atteindre un score hebdo ≥ 70', category: 'score', horizon: 'medium' },
    { id: 'score-90', emoji: '💎', name: 'Semaine parfaite', desc: 'Atteindre un score hebdo ≥ 90', category: 'score', horizon: 'medium' },
    { id: '10-discoveries', emoji: '🌍', name: 'Explorateur', desc: '10 découvertes essayées au total', category: 'découverte', horizon: 'medium' },
    { id: 'habits-100-week', emoji: '🏆', name: 'Habitude de fer', desc: '100% habitudes pendant 7 jours d\'affilée', category: 'habitudes', horizon: 'medium' },
    { id: '200km-total', emoji: '🗺️', name: 'Routard', desc: 'Cumuler 200 km au total', category: 'course', horizon: 'medium' },
    { id: 'streak-7-log', emoji: '📖', name: 'Chroniqueur', desc: 'Remplir le journal 7 jours d\'affilée', category: 'général', horizon: 'medium' },
    { id: '4-sessions-4weeks', emoji: '📅', name: 'Régularité', desc: '4 sessions/sem pendant 4 semaines', category: 'course', horizon: 'medium' },
    { id: 'level-5', emoji: '🎖️', name: 'Trailer', desc: 'Atteindre le niveau 5', category: 'général', horizon: 'medium' },

    // ───── 🟣 LONG (3-6 mois) ─────
    { id: 'streak-60-jap', emoji: '🏯', name: 'Samouraï', desc: 'Streak japonais de 60 jours', category: 'japonais', horizon: 'long' },
    { id: 'streak-90-jap', emoji: '🐉', name: 'Ryū (龍)', desc: 'Streak japonais de 90 jours', category: 'japonais', horizon: 'long' },
    { id: '500km-total', emoji: '🏔️', name: 'Montagnard', desc: 'Cumuler 500 km au total', category: 'course', horizon: 'long' },
    { id: '5000m-dplus', emoji: '🦅', name: 'Aigle', desc: 'Cumuler 5000m D+ au total', category: 'course', horizon: 'long' },
    { id: '80km-week', emoji: '💪', name: 'Ultra mindset', desc: '80+ km en une semaine', category: 'course', horizon: 'long' },
    { id: 'score-90-4weeks', emoji: '👑', name: 'Roi du mois', desc: 'Score ≥ 90 pendant 4 semaines', category: 'score', horizon: 'long' },
    { id: '25-discoveries', emoji: '🧭', name: 'Aventurier', desc: '25 découvertes essayées au total', category: 'découverte', horizon: 'long' },
    { id: '1000km-total', emoji: '🌋', name: 'Millionnaire', desc: 'Cumuler 1000 km au total', category: 'course', horizon: 'long' },
    { id: 'level-10', emoji: '🏅', name: 'Montagnard confirmé', desc: 'Atteindre le niveau 10', category: 'général', horizon: 'long' },
    { id: '10000m-dplus', emoji: '🏔️', name: 'Himalayiste', desc: 'Cumuler 10 000m D+ au total', category: 'course', horizon: 'long' },
    { id: 'habits-100-month', emoji: '🔱', name: 'Discipline absolue', desc: '100% habitudes pendant 30 jours', category: 'habitudes', horizon: 'long' },
    { id: '500-jap-min', emoji: '📚', name: 'Étudiant assidu', desc: 'Cumuler 500 minutes de japonais', category: 'japonais', horizon: 'long' },

    // ───── 🟡 EPIC (1 an+) ─────
    { id: 'streak-180-jap', emoji: '🎎', name: 'Sensei (先生)', desc: 'Streak japonais de 180 jours', category: 'japonais', horizon: 'epic' },
    { id: 'streak-365-jap', emoji: '🗾', name: 'Nihon Master', desc: 'Streak japonais de 365 jours', category: 'japonais', horizon: 'epic' },
    { id: '2000km-total', emoji: '🌍', name: 'Tour du monde', desc: 'Cumuler 2000 km au total', category: 'course', horizon: 'epic' },
    { id: '50000m-dplus', emoji: '🚀', name: 'Everest x6', desc: 'Cumuler 50 000m D+ (6× l\'Everest)', category: 'course', horizon: 'epic' },
    { id: '50-discoveries', emoji: '🏛️', name: 'Renaissance', desc: '50 découvertes essayées', category: 'découverte', horizon: 'epic' },
    { id: 'level-20', emoji: '🦅', name: 'Ultra-Trailer', desc: 'Atteindre le niveau 20', category: 'général', horizon: 'epic' },
    { id: 'level-50', emoji: '🐐', name: 'G.O.A.T.', desc: 'Atteindre le niveau 50', category: 'général', horizon: 'epic' },
    { id: '1000-jap-min', emoji: '🏯', name: 'Maître de dojo', desc: 'Cumuler 1000 minutes de japonais', category: 'japonais', horizon: 'epic' },
    { id: '5000km-total', emoji: '🌌', name: 'Légende', desc: 'Cumuler 5000 km au total', category: 'course', horizon: 'epic' },
  ],

  // ============================================
  // GAMIFICATION — LEVELS
  // ============================================
  levels: [
    { level: 1, name: '🥾 Débutant', xpRequired: 0 },
    { level: 2, name: '🚶 Marcheur', xpRequired: 100 },
    { level: 3, name: '🏃 Jogger', xpRequired: 300 },
    { level: 4, name: '🏃‍♂️ Coureur', xpRequired: 600 },
    { level: 5, name: '🥾 Trailer', xpRequired: 1000 },
    { level: 6, name: '⛰️ Traileur confirmé', xpRequired: 1500 },
    { level: 7, name: '🏔️ Grimpeur', xpRequired: 2200 },
    { level: 8, name: '🦅 Montagnard', xpRequired: 3000 },
    { level: 9, name: '🗻 Alpiniste', xpRequired: 4000 },
    { level: 10, name: '🏔️ Sommet', xpRequired: 5500 },
    { level: 11, name: '🌄 Horizon', xpRequired: 7000 },
    { level: 12, name: '⚡ Endurant', xpRequired: 9000 },
    { level: 13, name: '🔥 Infatigable', xpRequired: 11500 },
    { level: 14, name: '💎 Diamant', xpRequired: 14500 },
    { level: 15, name: '🌟 Étoile', xpRequired: 18000 },
    { level: 16, name: '🏅 Champion', xpRequired: 22000 },
    { level: 17, name: '👑 Roi du trail', xpRequired: 27000 },
    { level: 18, name: '🦁 Indomptable', xpRequired: 33000 },
    { level: 19, name: '🐺 Loup solitaire', xpRequired: 40000 },
    { level: 20, name: '🦅 Ultra-Trailer', xpRequired: 50000 },
    { level: 25, name: '🌋 Volcan', xpRequired: 80000 },
    { level: 30, name: '🐉 Dragon', xpRequired: 120000 },
    { level: 35, name: '🌌 Cosmique', xpRequired: 175000 },
    { level: 40, name: '☄️ Météore', xpRequired: 250000 },
    { level: 45, name: '🌠 Constellation', xpRequired: 350000 },
    { level: 50, name: '🐐 G.O.A.T.', xpRequired: 500000 },
  ],

  // XP rewards per action
  xpRewards: {
    kmRun: 10,            // per km
    dplusGained: 0.05,    // per meter D+
    japaneseMinute: 1,    // per minute
    habitChecked: 5,      // per habit
    journalFilled: 10,    // daily log
    discoveryTried: 25,   // per discovery
    badgeUnlocked: 50,    // per badge
    perfectHabitDay: 15,  // bonus: all habits in a day
    runSession: 15,       // per session logged
  },

  // ============================================
  // INITIALIZATION
  // ============================================
  init() {
    this.currentUser = null;
    this.loadData();
    this.setupNavigation();
    this.updateDateDisplay();
    this.renderDashboard();
    this.renderPlanning();
    this.renderHabits();
    this.loadConfigUI();
    this.updateNowBanner();
    this.registerServiceWorker();
    this.setupNotifications();
    this.setupPwaInstall();
    this.loadNotifPrefs();

    // Bootstrap gamification from existing data
    this.recalculateXP();
    this.updateRecords();
    this.checkAllBadges();

    // Update "now" banner every minute
    setInterval(() => this.updateNowBanner(), 60000);
    // Check notifications every minute
    setInterval(() => this.checkScheduledNotifications(), 60000);

    // Initialize Firebase Auth Listener
    if (window.firebaseAPI) {
      window.firebaseAPI.onAuthStateChanged((user) => {
        const wasLoggedOut = !this.currentUser;
        this.currentUser = user;
        this.updateAuthUI();

        if (user && wasLoggedOut) {
          // Just logged in, sync from cloud or migrate local data
          this.syncFromCloud();
        }
      });
    }
  },

  // ============================================
  // DATA PERSISTENCE
  // ============================================
  loadData() {
    try {
      const saved = localStorage.getItem('lifeflow-data');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.state = { ...this.state, ...parsed };
        // Ensure config has all default keys
        this.state.config = { ...this.state.config, ...parsed.config };
      }
      // Ensure habits exist
      if (!this.state.habits || this.state.habits.length === 0) {
        this.state.habits = [...this.defaultHabits];
      }
      // Ensure gamification state exists (for data saved before gamification was added)
      if (!this.state.unlockedBadges) this.state.unlockedBadges = {};
      if (!this.state.records) this.state.records = {
        longestRun: 0, biggestDplus: 0, bestWeekKm: 0, bestWeekScore: 0,
        longestJapStreak: 0, longestHabitStreak: 0,
        totalKm: 0, totalDplus: 0, totalJapMinutes: 0, totalDiscoveries: 0,
      };
      if (typeof this.state.xp !== 'number') this.state.xp = 0;
      if (typeof this.state.level !== 'number') this.state.level = 1;
    } catch (e) {
      console.warn('Could not load saved data:', e);
    }
  },

  saveData() {
    try {
      localStorage.setItem('lifeflow-data', JSON.stringify(this.state));
      this.updateSyncIndicator('syncing');

      // Sync to cloud if user is logged in
      if (this.currentUser && window.firebaseAPI) {
        window.firebaseAPI.saveToCloud(this.currentUser.uid, this.state).then(success => {
          if (success) {
            this.updateSyncIndicator('success');
          } else {
            this.updateSyncIndicator('error');
          }
        });
      } else {
        this.updateSyncIndicator('local');
      }
    } catch (e) {
      console.error('Could not save data:', e);
      this.updateSyncIndicator('error');
    }
  },

  exportData() {
    const dataStr = JSON.stringify(this.state, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifeflow-backup-${this.getDateKey(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('✅ Données exportées !');
  },

  importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        this.state = { ...this.state, ...imported };
        this.saveData();
        this.showToast('✅ Données importées avec succès !');
        // Re-render everything
        this.renderDashboard();
        this.renderPlanning();
        this.renderHabits();
        this.loadConfigUI();
      } catch (err) {
        this.showToast('❌ Erreur lors de l\'import');
      }
    };
    reader.readAsText(file);
  },

  async resetData() {
    if (confirm('⚠️ Supprimer TOUTES les données ? Cette action est irréversible.')) {
      if (this.currentUser && window.firebaseAPI) {
        await window.firebaseAPI.deleteCloudData(this.currentUser.uid);
      }
      localStorage.removeItem('lifeflow-data');
      location.reload();
    }
  },

  // ============================================
  // FIREBASE AUTH & SYNC
  // ============================================
  async signIn() {
    try {
      this.showToast('🔄 Redirection vers Google...');
      await window.firebaseAPI.signIn();
    } catch (err) {
      this.showToast('❌ Erreur de connexion');
    }
  },

  async signOut() {
    try {
      await window.firebaseAPI.signOut();
      this.showToast('ℹ️ Déconnecté. Mode local activé.');
    } catch (err) {
      this.showToast('❌ Erreur de déconnexion');
    }
  },

  async syncFromCloud() {
    if (!this.currentUser || !window.firebaseAPI) return;

    this.updateSyncIndicator('syncing');
    const cloudState = await window.firebaseAPI.loadFromCloud(this.currentUser.uid);

    if (cloudState) {
      // Pour faire simple, on écrase les données locales avec celles du cloud
      // Une meilleure implémentation gèrerait les conflits selon _lastModified
      const { _lastModified, ...cleanCloudState } = cloudState;

      this.state = { ...this.state, ...cleanCloudState };
      this.state.config = { ...this.state.config, ...cleanCloudState.config };

      // Sauvegarde dans le localStorage
      localStorage.setItem('lifeflow-data', JSON.stringify(this.state));

      this.showToast('☁️ Données synchronisées depuis le Cloud !');
      this.updateSyncIndicator('success');

      // Re-render everything
      this.renderDashboard();
      this.renderPlanning();
      this.renderHabits();
      this.loadConfigUI();
    } else {
      // Pas de données cloud: c'est la première connexion, on migre les données locales vers le cloud
      this.showToast('☁️ Première connexion : Mémorisation de vos données locales vers le Cloud...');
      this.saveData();
    }
  },

  updateAuthUI() {
    const authStatusText = document.getElementById('authStatusText');
    const authEmailText = document.getElementById('authEmailText');
    const authAvatar = document.getElementById('authAvatar');
    const btnSignIn = document.getElementById('btnGoogleSignIn');
    const btnSignOut = document.getElementById('btnGoogleSignOut');
    const syncTimeStatus = document.getElementById('syncTimeStatus');

    if (this.currentUser) {
      authStatusText.textContent = `Connecté : ${this.currentUser.displayName}`;
      authStatusText.style.color = 'var(--text-main)';
      authEmailText.textContent = `Synchro Cloud activée (${this.currentUser.email})`;

      if (this.currentUser.photoURL) {
        authAvatar.src = this.currentUser.photoURL;
        authAvatar.style.display = 'block';
      }

      btnSignIn.style.display = 'none';
      btnSignOut.style.display = 'block';
      syncTimeStatus.style.display = 'block';

      this.updateSyncIndicator('success');
    } else {
      authStatusText.textContent = 'Déconnecté (Mode Local)';
      authStatusText.style.color = 'var(--text-secondary)';
      authEmailText.textContent = 'Données stockées uniquement sur cet appareil.';
      authAvatar.style.display = 'none';

      btnSignIn.style.display = 'flex';
      btnSignOut.style.display = 'none';
      syncTimeStatus.style.display = 'none';
      this.updateSyncIndicator('local');
    }
  },

  updateSyncIndicator(status) {
    const indicator = document.getElementById('syncIndicator');
    if (!indicator) return;

    indicator.classList.remove('sync-pulse');
    switch (status) {
      case 'local':
        indicator.textContent = '☁️';
        indicator.style.opacity = '0.5';
        indicator.title = 'Statut de synchronisation : Mode local';
        break;
      case 'syncing':
        indicator.textContent = '🔄';
        indicator.style.opacity = '1';
        indicator.classList.add('sync-pulse');
        indicator.title = 'Synchronisation en cours...';
        break;
      case 'success':
        indicator.textContent = '✅';
        indicator.style.opacity = '1';
        indicator.title = 'Synchronisé avec le Cloud';
        const syncStatus = document.getElementById('syncTimeStatus');
        if (syncStatus && this.currentUser) {
          const now = new Date();
          syncStatus.textContent = `Dernière sync : ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        }
        break;
      case 'error':
        indicator.textContent = '❌';
        indicator.style.opacity = '1';
        indicator.title = 'Erreur de synchronisation (hors ligne ?)';
        break;
    }
  },

  // ============================================
  // NAVIGATION
  // ============================================
  setupNavigation() {
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        this.switchTab(target);
      });
    });
  },

  switchTab(tabName) {
    this.state.currentTab = tabName;
    // Update nav tabs
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    // Update content
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`content-${tabName}`).classList.add('active');
  },

  // ============================================
  // DATE HELPERS
  // ============================================
  getDateKey(date) {
    return date.toISOString().split('T')[0];
  },

  getWeekKey(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    const weekNum = 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
  },

  getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  },

  getWeekDates(offset = 0) {
    const now = new Date();
    now.setDate(now.getDate() + offset * 7);
    const monday = this.getMonday(now);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d);
    }
    return dates;
  },

  updateDateDisplay() {
    const now = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const formatted = now.toLocaleDateString('fr-FR', options);
    document.getElementById('dateDisplay').textContent = formatted.charAt(0).toUpperCase() + formatted.slice(1);
  },

  getDayAbbr(dayIndex) {
    return ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][dayIndex];
  },

  getDayKey(dayIndex) {
    return ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'][dayIndex];
  },

  // ============================================
  // NOW BANNER
  // ============================================
  updateNowBanner() {
    const now = new Date();
    const hours = now.getHours();
    const name = this.state.config.name || 'Jason';

    let greeting, activity, nextUp;

    if (hours < 8) {
      greeting = `Bonjour ${name} 🌅`;
      activity = 'C\'est le matin — prends ton temps pour ta routine.';
      nextUp = 'Routine matin → Journée de travail';
    } else if (hours < 12) {
      greeting = `Bonne matinée ${name} ☀️`;
      activity = now.getDay() === 0 || now.getDay() === 6
        ? 'Weekend ! Check ton planning pour ce matin.'
        : 'En plein travail — focus ! 💪';
      nextUp = 'Pause déjeuner bientôt';
    } else if (hours < 14) {
      greeting = `Bon appétit ${name} 🍽️`;
      activity = 'Pause midi — recharge tes batteries.';
      nextUp = 'Reprise à 14h';
    } else if (hours < 18) {
      greeting = `Bon après-midi ${name} 💼`;
      activity = now.getDay() === 0 || now.getDay() === 6
        ? 'Profite de ton après-midi libre !'
        : 'Dernière ligne droite au travail.';
      nextUp = 'Fin de journée bientôt → activité du soir';
    } else if (hours < 20) {
      greeting = `Bonsoir ${name} 🌆`;
      activity = 'C\'est l\'heure de ton activité du soir !';
      const dayKey = this.getDayKey((now.getDay() + 6) % 7);
      const slot = this.getCurrentTemplate()[`${dayKey}-evening1`];
      nextUp = slot ? slot.label : 'Check ton planning';
    } else if (hours < 22) {
      greeting = `Bonsoir ${name} 🌙`;
      activity = 'Temps de détente — profites-en bien.';
      nextUp = 'N\'oublie pas ton journal du soir !';
    } else {
      greeting = `Bonne nuit ${name} 😴`;
      activity = 'Il est temps de préparer le sommeil.';
      nextUp = 'Repos → Demain est un nouveau jour !';
    }

    document.getElementById('greeting').textContent = greeting;
    document.getElementById('currentActivity').textContent = activity;
    document.getElementById('nextUpText').textContent = nextUp;
  },

  getCurrentTemplate() {
    const weekKey = this.getWeekKey(new Date());
    if (this.state.weekPlannings[weekKey]) {
      return this.state.weekPlannings[weekKey];
    }
    return this.templates[this.state.currentTemplate]?.slots || this.templates.work.slots;
  },

  // ============================================
  // RATINGS
  // ============================================
  setRating(type, value) {
    this.state.ratings[type] = value;
    const container = document.getElementById(`${type}Rating`);
    container.querySelectorAll('.star').forEach((star, i) => {
      star.classList.toggle('active', i < value);
    });
  },

  // ============================================
  // DAILY LOG
  // ============================================
  saveDailyLog() {
    const today = this.getDateKey(new Date());
    this.state.logs[today] = {
      km: parseFloat(document.getElementById('log-km').value) || 0,
      dplus: parseFloat(document.getElementById('log-dplus').value) || 0,
      japanese: parseFloat(document.getElementById('log-japanese').value) || 0,
      screentime: parseFloat(document.getElementById('log-screentime').value) || 0,
      mood: this.state.ratings.mood,
      sleep: this.state.ratings.sleep,
    };
    this.saveData();
    this.recalculateXP();
    this.updateRecords();
    this.checkAllBadges();
    this.renderDashboard();
    this.showToast('✅ Journal sauvegardé !');
  },

  loadTodayLog() {
    const today = this.getDateKey(new Date());
    const log = this.state.logs[today];
    if (log) {
      document.getElementById('log-km').value = log.km || '';
      document.getElementById('log-dplus').value = log.dplus || '';
      document.getElementById('log-japanese').value = log.japanese || '';
      document.getElementById('log-screentime').value = log.screentime || '';
      if (log.mood) this.setRating('mood', log.mood);
      if (log.sleep) this.setRating('sleep', log.sleep);
    }
  },

  // ============================================
  // DASHBOARD / KPIs
  // ============================================
  renderDashboard() {
    this.loadTodayLog();
    this.renderKPIs();
    this.renderWeeklyScore();
    this.renderMiniCharts();
    this.renderDiscovery();
    this.renderGameSection();
  },

  getWeekLogs() {
    const dates = this.getWeekDates(0);
    return dates.map(d => {
      const key = this.getDateKey(d);
      return this.state.logs[key] || null;
    });
  },

  renderKPIs() {
    const weekLogs = this.getWeekLogs();
    const config = this.state.config;

    const weekKm = weekLogs.reduce((s, l) => s + (l?.km || 0), 0);
    const weekDplus = weekLogs.reduce((s, l) => s + (l?.dplus || 0), 0);
    const runningSessions = weekLogs.filter(l => l?.km > 0).length;
    const weekJapanese = weekLogs.reduce((s, l) => s + (l?.japanese || 0), 0);
    const weekScreentime = weekLogs.reduce((s, l) => s + (l?.screentime || 0), 0);
    const moodAvg = this.avgNonZero(weekLogs.map(l => l?.mood || 0));
    const sleepAvg = this.avgNonZero(weekLogs.map(l => l?.sleep || 0));

    // Japanese streak
    const japStreak = this.calculateStreak('japanese');

    // Habit completion
    const habitScore = this.calculateHabitScore();

    // Discovery count
    const weekKey = this.getWeekKey(new Date());
    const discoveryCount = (this.state.discoveryAccepted[weekKey] || []).length;

    const kpis = [
      { icon: '🏃', label: 'Km Hebdo', value: weekKm.toFixed(1), target: `Obj: ${config.weeklyKm} km`, pct: (weekKm / config.weeklyKm * 100), color: 'blue' },
      { icon: '🏃', label: 'Sessions Course', value: runningSessions, target: `Obj: ${config.runningSessions}/sem`, pct: (runningSessions / config.runningSessions * 100), color: 'cyan' },
      { icon: '⛰️', label: 'D+ Hebdo', value: `${weekDplus}m`, target: `Obj: ${config.weeklyDplus}m`, pct: (weekDplus / config.weeklyDplus * 100), color: 'green' },
      { icon: '🇯🇵', label: 'Japonais Streak', value: `${japStreak}j`, target: 'Obj: 7/7 jours', pct: (japStreak / 7 * 100), color: 'purple', streak: japStreak },
      { icon: '🇯🇵', label: 'Min Japonais/Sem', value: Math.round(weekJapanese), target: `Total semaine`, pct: Math.min(weekJapanese / 105 * 100, 100), color: 'purple' },
      { icon: '📱', label: 'Heures "perdues"', value: weekScreentime.toFixed(1), target: `Max: ${config.maxScreentime}h/sem`, pct: Math.max(0, 100 - (weekScreentime / config.maxScreentime * 100)), color: weekScreentime > config.maxScreentime ? 'red' : 'green' },
      { icon: '😊', label: 'Humeur Moy.', value: moodAvg.toFixed(1), target: 'Obj: ≥ 3.5', pct: (moodAvg / 5 * 100), color: 'orange' },
      { icon: '😴', label: 'Sommeil Moy.', value: sleepAvg.toFixed(1), target: 'Obj: ≥ 3.5', pct: (sleepAvg / 5 * 100), color: 'cyan' },
      { icon: '✅', label: 'Habitudes', value: `${habitScore}%`, target: 'Obj: > 80%', pct: habitScore, color: habitScore >= 80 ? 'green' : 'orange' },
      { icon: '🌟', label: 'Découvertes', value: discoveryCount, target: `Obj: ${config.discoveries}/sem`, pct: (discoveryCount / config.discoveries * 100), color: 'pink' },
    ];

    const grid = document.getElementById('kpiGrid');
    grid.innerHTML = kpis.map(k => `
      <div class="kpi-card" data-color="${k.color}">
        <div class="kpi-icon">${k.icon}</div>
        <div class="kpi-label">${k.label}</div>
        <div class="kpi-value">${k.value}${k.streak >= 3 ? ` <span class="streak-badge fire">🔥${k.streak}</span>` : ''}</div>
        <div class="kpi-target">${k.target}</div>
        <div class="kpi-progress">
          <div class="kpi-progress-bar" style="width: ${Math.min(k.pct, 100)}%"></div>
        </div>
      </div>
    `).join('');
  },

  avgNonZero(arr) {
    const nonZero = arr.filter(v => v > 0);
    return nonZero.length > 0 ? nonZero.reduce((a, b) => a + b, 0) / nonZero.length : 0;
  },

  calculateStreak(field) {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = this.getDateKey(d);
      const log = this.state.logs[key];
      if (log && log[field] > 0) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  },

  calculateHabitScore() {
    const dates = this.getWeekDates(0);
    let total = 0;
    let checked = 0;
    const daysUpToToday = dates.filter(d => d <= new Date());
    for (const d of daysUpToToday) {
      const key = this.getDateKey(d);
      for (const habit of this.state.habits) {
        total++;
        if (this.state.habitChecks[key]?.[habit.id]) checked++;
      }
    }
    return total > 0 ? Math.round(checked / total * 100) : 0;
  },

  renderWeeklyScore() {
    const weekLogs = this.getWeekLogs();
    const config = this.state.config;

    // Calculate component scores
    const weekKm = weekLogs.reduce((s, l) => s + (l?.km || 0), 0);
    const sessions = weekLogs.filter(l => l?.km > 0).length;
    const weekDplus = weekLogs.reduce((s, l) => s + (l?.dplus || 0), 0);
    const japStreak = this.calculateStreak('japanese');
    const habitScore = this.calculateHabitScore();
    const moodAvg = this.avgNonZero(weekLogs.map(l => l?.mood || 0));
    const weekScreentime = weekLogs.reduce((s, l) => s + (l?.screentime || 0), 0);

    const scores = [
      Math.min(weekKm / config.weeklyKm, 1) * 20,           // 20pts running km
      Math.min(sessions / config.runningSessions, 1) * 10,    // 10pts sessions
      Math.min(weekDplus / config.weeklyDplus, 1) * 10,       // 10pts D+
      Math.min(japStreak / 7, 1) * 15,                        // 15pts japanese
      (habitScore / 100) * 20,                                 // 20pts habits
      Math.min(moodAvg / 5, 1) * 10,                          // 10pts mood
      Math.max(0, 1 - weekScreentime / (config.maxScreentime * 2)) * 10, // 10pts screentime
      5,                                                        // 5pts base (you showed up!)
    ];

    const total = Math.round(scores.reduce((a, b) => a + b, 0));
    const circumference = 2 * Math.PI * 42;
    const offset = circumference - (total / 100) * circumference;

    document.getElementById('scoreValue').textContent = total;
    const circle = document.getElementById('scoreCircle');
    // Animate after a short delay
    setTimeout(() => {
      circle.style.strokeDashoffset = offset;
    }, 300);
  },

  renderMiniCharts() {
    const weekLogs = this.getWeekLogs();
    const charts = [
      { id: 'chartKm', field: 'km', max: 30, color: 'var(--accent-blue)' },
      { id: 'chartJapanese', field: 'japanese', max: 30, color: 'var(--accent-purple)' },
      { id: 'chartMood', field: 'mood', max: 5, color: 'var(--accent-orange)' },
      { id: 'chartSleep', field: 'sleep', max: 5, color: 'var(--accent-cyan)' },
    ];

    charts.forEach(chart => {
      const el = document.getElementById(chart.id);
      const dayLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
      el.innerHTML = weekLogs.map((log, i) => {
        const val = log?.[chart.field] || 0;
        const height = Math.max(4, (val / chart.max) * 100);
        return `<div class="bar" style="height: ${height}%; background: ${chart.color};" title="${dayLabels[i]}: ${val}"></div>`;
      }).join('');
    });
  },

  // ============================================
  // DISCOVERY
  // ============================================
  renderDiscovery() {
    const weekKey = this.getWeekKey(new Date());
    const accepted = this.state.discoveryAccepted[weekKey] || [];

    // Generate consistent suggestions based on week
    const suggestions = this.getWeekDiscoveries(weekKey);

    const container = document.getElementById('discoverySuggestions');
    container.innerHTML = suggestions.map((s, i) => {
      const isAccepted = accepted.includes(i);
      return `
        <div class="discovery-item">
          <span class="discovery-emoji">${s.emoji}</span>
          <div class="discovery-text">
            <h4>${s.title}</h4>
            <p>${s.desc}</p>
          </div>
          <button class="discovery-action ${isAccepted ? 'accepted' : ''}"
            onclick="app.toggleDiscovery('${weekKey}', ${i})"
            id="discovery-${i}">
            ${isAccepted ? '✅ Fait !' : '→ Essayer'}
          </button>
        </div>
      `;
    }).join('');
  },

  getWeekDiscoveries(weekKey) {
    // Use week key as seed for consistent suggestions
    let hash = 0;
    for (let i = 0; i < weekKey.length; i++) {
      hash = ((hash << 5) - hash) + weekKey.charCodeAt(i);
      hash |= 0;
    }
    const count = this.state.config.discoveries || 2;
    const pool = [...this.discoveryPool];
    const suggestions = [];
    for (let i = 0; i < count; i++) {
      const idx = Math.abs((hash + i * 7 + i * i * 13) % pool.length);
      suggestions.push(pool.splice(idx, 1)[0]);
    }
    return suggestions;
  },

  toggleDiscovery(weekKey, index) {
    if (!this.state.discoveryAccepted[weekKey]) {
      this.state.discoveryAccepted[weekKey] = [];
    }
    const arr = this.state.discoveryAccepted[weekKey];
    const pos = arr.indexOf(index);
    if (pos >= 0) {
      arr.splice(pos, 1);
    } else {
      arr.push(index);
    }
    this.saveData();
    this.renderDiscovery();
    this.renderKPIs();
    this.renderWeeklyScore();
  },

  // ============================================
  // PLANNING
  // ============================================
  renderPlanning() {
    const dates = this.getWeekDates(this.state.currentWeekOffset);
    const today = this.getDateKey(new Date());
    const weekKey = this.getWeekKey(dates[0]);

    // Update week label
    const weekNum = weekKey.split('-W')[1];
    const monthNames = ['jan', 'fév', 'mar', 'avr', 'mai', 'jun', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc'];
    const startMonth = monthNames[dates[0].getMonth()];
    const endMonth = monthNames[dates[6].getMonth()];
    const dateRange = startMonth === endMonth
      ? `${dates[0].getDate()} - ${dates[6].getDate()} ${startMonth}`
      : `${dates[0].getDate()} ${startMonth} - ${dates[6].getDate()} ${endMonth}`;
    document.getElementById('weekLabel').textContent = `Semaine ${weekNum} — ${dateRange}`;

    // Get planning for this week
    const planning = this.state.weekPlannings[weekKey] || this.templates[this.state.currentTemplate]?.slots || this.templates.work.slots;

    const timeSlots = [
      { key: 'morning', label: '🌅 Matin', time: '7h-8h30' },
      { key: 'day', label: '☀️ Journée', time: '9h-18h' },
      { key: 'evening1', label: '🌆 18h30-20h', time: '18h30' },
      { key: 'evening2', label: '🌙 20h-21h30', time: '20h' },
      { key: 'evening3', label: '💤 21h30-23h', time: '21h30' },
    ];

    const grid = document.getElementById('weekGrid');
    let html = '';

    // Header row
    html += '<div class="time-header"></div>';
    dates.forEach((d, i) => {
      const isToday = this.getDateKey(d) === today;
      const dayName = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][i];
      html += `<div class="day-header ${isToday ? 'today' : ''}">
        <span class="day-name">${dayName}</span>
        <span class="day-date">${d.getDate()}/${d.getMonth() + 1}</span>
      </div>`;
    });

    // Time slot rows
    timeSlots.forEach(slot => {
      html += `<div class="time-slot">${slot.label}<br><small>${slot.time}</small></div>`;
      dates.forEach((d, i) => {
        const dayKey = this.getDayKey(i);
        const slotKey = `${dayKey}-${slot.key}`;
        const activity = planning[slotKey];
        const isToday = this.getDateKey(d) === today;
        html += `<div class="cell ${isToday ? 'today-col' : ''}" onclick="app.editSlot('${weekKey}', '${slotKey}')">`;
        if (activity) {
          html += `<div class="activity-block ${activity.type}">${activity.label}</div>`;
        }
        html += '</div>';
      });
    });

    grid.innerHTML = html;
  },

  changeWeek(delta) {
    this.state.currentWeekOffset += delta;
    this.renderPlanning();
  },

  goToCurrentWeek() {
    this.state.currentWeekOffset = 0;
    this.renderPlanning();
  },

  applyTemplate(templateName) {
    this.state.currentTemplate = templateName;
    const dates = this.getWeekDates(this.state.currentWeekOffset);
    const weekKey = this.getWeekKey(dates[0]);
    this.state.weekPlannings[weekKey] = { ...this.templates[templateName].slots };
    this.saveData();
    this.renderPlanning();

    // Update button states
    document.querySelectorAll('.template-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.template === templateName);
    });

    this.showToast(`✅ Template "${this.templates[templateName].name}" appliqué`);
  },

  editSlot(weekKey, slotKey) {
    const planning = this.state.weekPlannings[weekKey] || { ...this.templates[this.state.currentTemplate].slots };
    const current = planning[slotKey];

    const activityTypes = [
      { type: 'run', label: '🏃 Course', examples: ['Course facile', 'Fractionné', 'Sortie longue', 'Récup', 'Course moyenne — rapide'] },
      { type: 'japanese', label: '🇯🇵 Japonais', examples: ['Japonais (15 min)', 'Session longue', 'Kanji', 'Grammaire'] },
      { type: 'gaming', label: '🎮 Jeux vidéo', examples: ['Jeux vidéo', 'Gaming session'] },
      { type: 'strength', label: '💪 Renforcement', examples: ['Renfo musculaire', 'Gainage', 'Pompes/squats'] },
      { type: 'discovery', label: '🌟 Découverte', examples: ['Découverte semaine', 'Exploration'] },
      { type: 'outdoor', label: '☀️ Extérieur', examples: ['Activité extérieure', 'Rando', 'Balade', 'Visite'] },
      { type: 'routine', label: '🔄 Routine', examples: ['Routine matin', 'Prépa semaine'] },
      { type: 'rest', label: '🧘 Repos', examples: ['Repos', 'Mobilité', 'Étirements'] },
      { type: 'free', label: '📖 Libre', examples: ['Temps libre', 'Détente', 'Lecture'] },
      { type: 'work', label: '💼 Travail', examples: ['Travail', 'Réunion'] },
    ];

    document.getElementById('modalTitle').textContent = '✏️ Modifier l\'activité';
    document.getElementById('modalBody').innerHTML = `
      <div class="form-group">
        <label>Type d'activité</label>
        <select class="form-select" id="editSlotType">
          ${activityTypes.map(at => `<option value="${at.type}" ${current?.type === at.type ? 'selected' : ''}>${at.label}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Description</label>
        <input type="text" class="form-input" id="editSlotLabel" value="${current?.label || ''}" placeholder="Description de l'activité">
      </div>
      <div class="form-group">
        <label>Suggestions rapides</label>
        <div id="editSuggestions" style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px;"></div>
      </div>
    `;

    // Render suggestions based on selected type
    const renderSuggestions = () => {
      const type = document.getElementById('editSlotType').value;
      const at = activityTypes.find(a => a.type === type);
      const sugEl = document.getElementById('editSuggestions');
      sugEl.innerHTML = (at?.examples || []).map(ex => {
        const emojis = { run: '🏃', japanese: '🇯🇵', gaming: '🎮', strength: '💪', discovery: '🌟', outdoor: '☀️', routine: '🔄', rest: '🧘', free: '📖', work: '💼' };
        return `<button class="btn" style="font-size: 0.75rem; padding: 4px 8px;" onclick="document.getElementById('editSlotLabel').value='${emojis[type] || ''} ${ex}'">${ex}</button>`;
      }).join('');
    };

    renderSuggestions();
    document.getElementById('editSlotType').addEventListener('change', renderSuggestions);

    document.getElementById('modalFooter').innerHTML = `
      <button class="btn btn-danger" onclick="app.deleteSlot('${weekKey}', '${slotKey}')">🗑️ Vider</button>
      <button class="btn btn-primary" onclick="app.saveSlot('${weekKey}', '${slotKey}')">💾 Sauvegarder</button>
    `;

    this.openModal();
  },

  saveSlot(weekKey, slotKey) {
    if (!this.state.weekPlannings[weekKey]) {
      this.state.weekPlannings[weekKey] = { ...this.templates[this.state.currentTemplate].slots };
    }
    const type = document.getElementById('editSlotType').value;
    const label = document.getElementById('editSlotLabel').value;
    this.state.weekPlannings[weekKey][slotKey] = { type, label };
    this.saveData();
    this.renderPlanning();
    this.closeModal();
    this.showToast('✅ Activité mise à jour');
  },

  deleteSlot(weekKey, slotKey) {
    if (!this.state.weekPlannings[weekKey]) {
      this.state.weekPlannings[weekKey] = { ...this.templates[this.state.currentTemplate].slots };
    }
    delete this.state.weekPlannings[weekKey][slotKey];
    this.saveData();
    this.renderPlanning();
    this.closeModal();
  },

  // ============================================
  // HABITS
  // ============================================
  renderHabits() {
    const dates = this.getWeekDates(0);
    const today = this.getDateKey(new Date());
    const grid = document.getElementById('habitsGrid');

    grid.innerHTML = this.state.habits.map(habit => {
      // Calculate streak
      const streak = this.calculateHabitStreak(habit.id);

      return `
        <div class="habit-card">
          <div class="habit-header">
            <div class="habit-name">${habit.name}</div>
            <div class="habit-streak">
              ${streak >= 3 ? '🔥' : '📊'} ${streak}j
            </div>
          </div>
          <div class="habit-week">
            ${dates.map((d, i) => {
        const key = this.getDateKey(d);
        const isChecked = this.state.habitChecks[key]?.[habit.id] || false;
        const isToday = key === today;
        const isPast = d < new Date() && !isToday;
        return `
                <div class="habit-day ${isToday ? 'today' : ''}">
                  <span class="day-label">${this.getDayAbbr(i)}</span>
                  <button class="check-btn ${isChecked ? 'checked' : (isPast && !isChecked ? 'missed' : '')}"
                    onclick="app.toggleHabit('${key}', '${habit.id}')"
                    id="habit-${habit.id}-${key}">
                    ${isChecked ? '✓' : (isPast ? '✕' : '')}
                  </button>
                </div>
              `;
      }).join('')}
          </div>
        </div>
      `;
    }).join('');

    this.renderMonthlyHeatmap();
  },

  toggleHabit(dateKey, habitId) {
    if (!this.state.habitChecks[dateKey]) {
      this.state.habitChecks[dateKey] = {};
    }
    this.state.habitChecks[dateKey][habitId] = !this.state.habitChecks[dateKey][habitId];
    this.saveData();
    this.recalculateXP();
    this.checkAllBadges();
    this.renderHabits();
    this.renderKPIs();
    this.renderWeeklyScore();
    this.renderGameSection();
  },

  calculateHabitStreak(habitId) {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = this.getDateKey(d);
      if (this.state.habitChecks[key]?.[habitId]) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  },

  renderMonthlyHeatmap() {
    const heatmap = document.getElementById('monthlyHeatmap');
    const today = new Date();
    const days = [];

    // Last 35 days (5 weeks)
    for (let i = 34; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push(d);
    }

    heatmap.innerHTML = days.map(d => {
      const key = this.getDateKey(d);
      const checks = this.state.habitChecks[key] || {};
      const totalHabits = this.state.habits.length;
      const checkedCount = Object.values(checks).filter(v => v).length;
      const level = totalHabits > 0 ? Math.ceil((checkedCount / totalHabits) * 4) : 0;
      return `<div class="heatmap-cell level-${level}" title="${d.toLocaleDateString('fr-FR')}: ${checkedCount}/${totalHabits}"></div>`;
    }).join('');
  },

  openAddHabitModal() {
    document.getElementById('modalTitle').textContent = '➕ Nouvelle habitude';
    document.getElementById('modalBody').innerHTML = `
      <div class="form-group">
        <label>Nom de l'habitude</label>
        <input type="text" class="form-input" id="newHabitName" placeholder="Ex: 🧘 Méditation 10 min">
      </div>
    `;
    document.getElementById('modalFooter').innerHTML = `
      <button class="btn" onclick="app.closeModal()">Annuler</button>
      <button class="btn btn-primary" onclick="app.addHabit()">➕ Ajouter</button>
    `;
    this.openModal();
  },

  addHabit() {
    const name = document.getElementById('newHabitName').value.trim();
    if (!name) return;
    const id = 'hab-' + Date.now();
    this.state.habits.push({ id, name, icon: '✅', frequency: 'daily' });
    this.saveData();
    this.renderHabits();
    this.closeModal();
    this.showToast(`✅ Habitude "${name}" ajoutée`);
  },

  // ============================================
  // CONFIG
  // ============================================
  saveConfig() {
    const fields = ['name', 'wakeTime', 'bedTime', 'workEnd', 'weeklyKm', 'runningSessions', 'weeklyDplus', 'japaneseWords', 'maxScreentime', 'discoveries', 'monthGoal', 'notes'];
    fields.forEach(field => {
      const el = document.getElementById(`config-${field}`);
      if (el) {
        const val = el.type === 'number' ? parseFloat(el.value) : el.value;
        this.state.config[field] = val;
      }
    });
    this.saveData();
    this.renderDashboard();
  },

  loadConfigUI() {
    const config = this.state.config;
    Object.keys(config).forEach(key => {
      const el = document.getElementById(`config-${key}`);
      if (el) el.value = config[key] || '';
    });
  },

  // ============================================
  // MODAL
  // ============================================
  openModal() {
    document.getElementById('modalOverlay').classList.add('active');
  },

  closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
  },

  // ============================================
  // TOAST
  // ============================================
  showToast(message) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  },

  // ============================================
  // GAMIFICATION ENGINE
  // ============================================

  recalculateXP() {
    let xp = 0;
    const r = this.xpRewards;

    // XP from all daily logs
    Object.values(this.state.logs).forEach(log => {
      if (log.km > 0) { xp += log.km * r.kmRun + r.runSession; }
      if (log.dplus > 0) { xp += log.dplus * r.dplusGained; }
      if (log.japanese > 0) { xp += log.japanese * r.japaneseMinute; }
      xp += r.journalFilled; // logging itself gives XP
    });

    // XP from habits
    Object.entries(this.state.habitChecks).forEach(([dateKey, checks]) => {
      let checkedCount = 0;
      Object.values(checks).forEach(v => { if (v) { xp += r.habitChecked; checkedCount++; } });
      if (checkedCount === this.state.habits.length && checkedCount > 0) { xp += r.perfectHabitDay; }
    });

    // XP from discoveries
    Object.values(this.state.discoveryAccepted).forEach(arr => {
      xp += (arr.length || 0) * r.discoveryTried;
    });

    // XP from badges
    xp += Object.keys(this.state.unlockedBadges).length * r.badgeUnlocked;

    this.state.xp = Math.round(xp);
    this.state.level = this.getLevelForXP(xp);
    this.saveData();
  },

  getLevelForXP(xp) {
    let currentLevel = 1;
    for (const lvl of this.levels) {
      if (xp >= lvl.xpRequired) { currentLevel = lvl.level; }
      else break;
    }
    return currentLevel;
  },

  getLevelInfo(level) {
    // Find the exact level or the nearest lower one
    let found = this.levels[0];
    for (const lvl of this.levels) {
      if (lvl.level <= level) found = lvl;
      else break;
    }
    return found;
  },

  getNextLevelInfo(level) {
    for (const lvl of this.levels) {
      if (lvl.level > level) return lvl;
    }
    return null;
  },

  updateRecords() {
    const rec = this.state.records;

    // Reset max records before recalculating from actual data
    rec.longestRun = 0;
    rec.biggestDplus = 0;
    rec.bestWeekKm = 0;
    rec.longestJapStreak = 0;

    // Totals from all logs
    let totalKm = 0, totalDplus = 0, totalJap = 0;
    Object.values(this.state.logs).forEach(log => {
      totalKm += log.km || 0;
      totalDplus += log.dplus || 0;
      totalJap += log.japanese || 0;
      rec.longestRun = Math.max(rec.longestRun, log.km || 0);
      rec.biggestDplus = Math.max(rec.biggestDplus, log.dplus || 0);
    });
    rec.totalKm = Math.round(totalKm * 10) / 10;
    rec.totalDplus = Math.round(totalDplus);
    rec.totalJapMinutes = Math.round(totalJap);

    // Best week km
    const weekLogs = this.getWeekLogs();
    const weekKm = weekLogs.reduce((s, l) => s + (l?.km || 0), 0);
    rec.bestWeekKm = Math.max(rec.bestWeekKm, Math.round(weekKm * 10) / 10);

    // Streaks
    rec.longestJapStreak = Math.max(rec.longestJapStreak, this.calculateStreak('japanese'));

    // Total discoveries
    let totalDisc = 0;
    Object.values(this.state.discoveryAccepted).forEach(arr => totalDisc += arr.length);
    rec.totalDiscoveries = totalDisc;

    this.saveData();
  },

  unlockBadge(badgeId) {
    if (this.state.unlockedBadges[badgeId]) return false;
    this.state.unlockedBadges[badgeId] = this.getDateKey(new Date());
    const badge = this.badges.find(b => b.id === badgeId);
    if (badge) {
      this.showToast(`🏅 Badge débloqué : ${badge.emoji} ${badge.name} !`);
    }
    this.saveData();
    return true;
  },

  checkAllBadges() {
    const logs = this.state.logs;
    const rec = this.state.records;
    const weekLogs = this.getWeekLogs();
    const weekKm = weekLogs.reduce((s, l) => s + (l?.km || 0), 0);
    const weekDplus = weekLogs.reduce((s, l) => s + (l?.dplus || 0), 0);
    const runningSessions = weekLogs.filter(l => l?.km > 0).length;
    const japStreak = this.calculateStreak('japanese');
    const habitScore = this.calculateHabitScore();
    const weekScore = this.getCurrentWeekScore();

    // Total discoveries
    let totalDisc = 0;
    Object.values(this.state.discoveryAccepted).forEach(arr => totalDisc += arr.length);

    // Any log exists?
    const hasAnyLog = Object.keys(logs).length > 0;
    const hasAnyRun = Object.values(logs).some(l => l.km > 0);
    const hasAnyJap = Object.values(logs).some(l => l.japanese > 0);
    const hasAnyHabit = Object.keys(this.state.habitChecks).length > 0 &&
      Object.values(this.state.habitChecks).some(d => Object.values(d).some(v => v));
    const hasAnyDiscovery = totalDisc > 0;

    // Check perfect habit day (today)
    const todayKey = this.getDateKey(new Date());
    const todayChecks = this.state.habitChecks[todayKey] || {};
    const todayAllChecked = this.state.habits.length > 0 &&
      this.state.habits.every(h => todayChecks[h.id]);

    // Consecutive habit perfect days
    const habitPerfectStreak = this.calculatePerfectHabitStreak();

    // Consecutive weeks with 4+ sessions
    const fourSessionWeeks = this.countConsecutive4SessionWeeks();

    // ── Build fresh badge map (recalculate from scratch) ──
    const oldBadges = { ...this.state.unlockedBadges };
    const newBadges = {};
    const today = this.getDateKey(new Date());

    // Helper: grant badge if condition met, preserving original unlock date
    const grant = (id, condition) => {
      if (condition) {
        newBadges[id] = oldBadges[id] || today;
      }
    };

    // ── Quick badges ──
    grant('first-run', hasAnyRun);
    grant('first-log', hasAnyLog);
    grant('first-japanese', hasAnyJap);
    grant('first-habit', hasAnyHabit);
    grant('first-discovery', hasAnyDiscovery);
    grant('10km-week', weekKm >= 10);
    grant('streak-3-jap', japStreak >= 3);
    grant('score-50', weekScore >= 50);
    grant('habits-100-day', todayAllChecked);
    grant('4-sessions', runningSessions >= 4);

    // ── Medium badges ──
    grant('streak-7-jap', japStreak >= 7);
    grant('streak-14-jap', japStreak >= 14);
    grant('streak-30-jap', japStreak >= 30);
    grant('50km-week', weekKm >= 50);
    grant('1000m-dplus', weekDplus >= 1000);
    grant('100km-total', rec.totalKm >= 100);
    grant('200km-total', rec.totalKm >= 200);
    grant('score-70', weekScore >= 70);
    grant('score-90', weekScore >= 90);
    grant('10-discoveries', totalDisc >= 10);
    grant('habits-100-week', habitPerfectStreak >= 7);
    grant('streak-7-log', this.calculateLogStreak() >= 7);
    grant('4-sessions-4weeks', fourSessionWeeks >= 4);
    grant('level-5', this.state.level >= 5);

    // ── Long badges ──
    grant('streak-60-jap', japStreak >= 60);
    grant('streak-90-jap', japStreak >= 90);
    grant('500km-total', rec.totalKm >= 500);
    grant('1000km-total', rec.totalKm >= 1000);
    grant('5000m-dplus', rec.totalDplus >= 5000);
    grant('10000m-dplus', rec.totalDplus >= 10000);
    grant('80km-week', weekKm >= 80);
    grant('25-discoveries', totalDisc >= 25);
    grant('level-10', this.state.level >= 10);
    grant('habits-100-month', habitPerfectStreak >= 30);
    grant('500-jap-min', rec.totalJapMinutes >= 500);

    // ── Epic badges ──
    grant('streak-180-jap', japStreak >= 180);
    grant('streak-365-jap', japStreak >= 365);
    grant('2000km-total', rec.totalKm >= 2000);
    grant('5000km-total', rec.totalKm >= 5000);
    grant('50000m-dplus', rec.totalDplus >= 50000);
    grant('50-discoveries', totalDisc >= 50);
    grant('level-20', this.state.level >= 20);
    grant('level-50', this.state.level >= 50);
    grant('1000-jap-min', rec.totalJapMinutes >= 1000);

    // ── Stabilization: update badges → recalculate XP/level → re-check level badges ──
    this.state.unlockedBadges = newBadges;
    this.recalculateXP();  // recalc XP with updated badge count → updates level

    // Re-check level-dependent badges after XP recalculation
    grant('level-5', this.state.level >= 5);
    grant('level-10', this.state.level >= 10);
    grant('level-20', this.state.level >= 20);
    grant('level-50', this.state.level >= 50);

    // Remove level badges that no longer qualify
    ['level-5', 'level-10', 'level-20', 'level-50'].forEach(id => {
      const thresholds = { 'level-5': 5, 'level-10': 10, 'level-20': 20, 'level-50': 50 };
      if (this.state.level < thresholds[id]) delete newBadges[id];
    });

    // Final apply
    this.state.unlockedBadges = newBadges;
    this.recalculateXP();  // Final XP with correct badge count

    // ── Show toasts only for newly unlocked badges ──
    Object.keys(newBadges).forEach(id => {
      if (!oldBadges[id]) {
        const badge = this.badges.find(b => b.id === id);
        if (badge) this.showToast(`🏅 Badge débloqué : ${badge.emoji} ${badge.name} !`);
      }
    });

    this.saveData();
    this.renderGameSection();
  },

  calculateLogStreak() {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = this.getDateKey(d);
      if (this.state.logs[key]) streak++;
      else if (i > 0) break;
    }
    return streak;
  },

  calculatePerfectHabitStreak() {
    let streak = 0;
    const today = new Date();
    const habitCount = this.state.habits.length;
    if (habitCount === 0) return 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = this.getDateKey(d);
      const checks = this.state.habitChecks[key] || {};
      const allChecked = this.state.habits.every(h => checks[h.id]);
      if (allChecked) streak++;
      else if (i > 0) break;
    }
    return streak;
  },

  countConsecutive4SessionWeeks() {
    let count = 0;
    for (let w = 0; w < 52; w++) {
      const dates = this.getWeekDates(-w);
      const sessions = dates.filter(d => {
        const log = this.state.logs[this.getDateKey(d)];
        return log && log.km > 0;
      }).length;
      if (sessions >= 4) count++;
      else break;
    }
    return count;
  },

  getCurrentWeekScore() {
    const weekLogs = this.getWeekLogs();
    const config = this.state.config;
    const weekKm = weekLogs.reduce((s, l) => s + (l?.km || 0), 0);
    const sessions = weekLogs.filter(l => l?.km > 0).length;
    const weekDplus = weekLogs.reduce((s, l) => s + (l?.dplus || 0), 0);
    const japStreak = this.calculateStreak('japanese');
    const habitScore = this.calculateHabitScore();
    const moodAvg = this.avgNonZero(weekLogs.map(l => l?.mood || 0));
    const weekScreentime = weekLogs.reduce((s, l) => s + (l?.screentime || 0), 0);
    const scores = [
      Math.min(weekKm / config.weeklyKm, 1) * 20,
      Math.min(sessions / config.runningSessions, 1) * 10,
      Math.min(weekDplus / config.weeklyDplus, 1) * 10,
      Math.min(japStreak / 7, 1) * 15,
      (habitScore / 100) * 20,
      Math.min(moodAvg / 5, 1) * 10,
      Math.max(0, 1 - weekScreentime / (config.maxScreentime * 2)) * 10,
      5,
    ];
    return Math.round(scores.reduce((a, b) => a + b, 0));
  },

  renderGameSection() {
    const el = document.getElementById('gameSection');
    if (!el) return;

    const xp = this.state.xp;
    const level = this.state.level;
    const levelInfo = this.getLevelInfo(level);
    const nextLevel = this.getNextLevelInfo(level);
    const xpInLevel = xp - levelInfo.xpRequired;
    const xpForNext = nextLevel ? nextLevel.xpRequired - levelInfo.xpRequired : 1;
    const pct = nextLevel ? Math.min((xpInLevel / xpForNext) * 100, 100) : 100;

    const unlockedCount = Object.keys(this.state.unlockedBadges).length;
    const totalBadges = this.badges.length;
    const rec = this.state.records;

    el.innerHTML = `
      <!-- XP Bar -->
      <div class="game-xp-card">
        <div class="game-xp-header">
          <div class="game-level-badge">
            <span class="game-level-num">Niv. ${level}</span>
            <span class="game-level-name">${levelInfo.name}</span>
          </div>
          <div class="game-xp-total">${xp.toLocaleString()} XP</div>
        </div>
        <div class="game-xp-bar">
          <div class="game-xp-fill" style="width: ${pct}%"></div>
        </div>
        <div class="game-xp-labels">
          <span>${xpInLevel.toLocaleString()} XP</span>
          <span>${nextLevel ? nextLevel.xpRequired.toLocaleString() + ' XP → ' + nextLevel.name : '👑 Niveau max !'}</span>
        </div>
      </div>

      <!-- Records -->
      <div class="game-records">
        <h3>🏆 Records personnels</h3>
        <div class="records-grid">
          <div class="record-item"><span class="record-val">${rec.totalKm}</span><span class="record-label">km total</span></div>
          <div class="record-item"><span class="record-val">${rec.totalDplus}</span><span class="record-label">m D+ total</span></div>
          <div class="record-item"><span class="record-val">${rec.longestRun}</span><span class="record-label">km max/jour</span></div>
          <div class="record-item"><span class="record-val">${rec.bestWeekKm}</span><span class="record-label">km max/sem</span></div>
          <div class="record-item"><span class="record-val">${rec.longestJapStreak}j</span><span class="record-label">火 streak jap</span></div>
          <div class="record-item"><span class="record-val">${rec.totalJapMinutes}</span><span class="record-label">min japonais</span></div>
          <div class="record-item"><span class="record-val">${rec.totalDiscoveries}</span><span class="record-label">découvertes</span></div>
          <div class="record-item"><span class="record-val">${unlockedCount}/${totalBadges}</span><span class="record-label">badges</span></div>
        </div>
      </div>

      <!-- Badge Gallery -->
      <div class="game-badges">
        <h3>🏅 Badges (${unlockedCount}/${totalBadges})</h3>
        <div class="badge-filters">
          <button class="badge-filter active" data-filter="all" onclick="app.filterBadges('all')">Tous</button>
          <button class="badge-filter" data-filter="unlocked" onclick="app.filterBadges('unlocked')">Débloqués</button>
          <button class="badge-filter" data-filter="quick" onclick="app.filterBadges('quick')">1 sem</button>
          <button class="badge-filter" data-filter="medium" onclick="app.filterBadges('medium')">1 mois</button>
          <button class="badge-filter" data-filter="long" onclick="app.filterBadges('long')">3-6 mois</button>
          <button class="badge-filter" data-filter="epic" onclick="app.filterBadges('epic')">1 an+</button>
        </div>
        <div class="badge-grid" id="badgeGrid">
          ${this.renderBadgeGrid('all')}
        </div>
      </div>
    `;
  },

  renderBadgeGrid(filter) {
    let filtered = this.badges;
    if (filter === 'unlocked') {
      filtered = this.badges.filter(b => this.state.unlockedBadges[b.id]);
    } else if (filter !== 'all') {
      filtered = this.badges.filter(b => b.horizon === filter);
    }

    if (filtered.length === 0) {
      return '<div style="text-align:center; color:var(--text-muted); padding:2rem;">Aucun badge dans cette catégorie</div>';
    }

    return filtered.map(b => {
      const unlocked = this.state.unlockedBadges[b.id];
      const horizonColors = { quick: 'green', medium: 'blue', long: 'purple', epic: 'orange' };
      const horizonLabels = { quick: '1 sem', medium: '1 mois', long: '3-6 mois', epic: '1 an+' };
      return `
        <div class="badge-card ${unlocked ? 'unlocked' : 'locked'}" data-horizon="${b.horizon}">
          <div class="badge-emoji">${unlocked ? b.emoji : '🔒'}</div>
          <div class="badge-name">${unlocked ? b.name : '???'}</div>
          <div class="badge-desc">${b.desc}</div>
          <div class="badge-horizon" data-color="${horizonColors[b.horizon]}">${horizonLabels[b.horizon]}</div>
          ${unlocked ? '<div class="badge-date">' + unlocked + '</div>' : ''}
        </div>
      `;
    }).join('');
  },

  filterBadges(filter) {
    const grid = document.getElementById('badgeGrid');
    if (grid) grid.innerHTML = this.renderBadgeGrid(filter);
    // Update active filter button
    document.querySelectorAll('.badge-filter').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
  },

  // ============================================
  // PWA — Service Worker Registration
  // ============================================
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.register('./service-worker.js');
        this.swRegistration = reg;
        console.log('✅ Service Worker registered:', reg.scope);
        this.updatePwaStatus();
      } catch (err) {
        console.warn('Service Worker registration failed:', err);
      }
    }
  },

  // ============================================
  // PWA — Install Prompt
  // ============================================
  deferredInstallPrompt: null,

  setupPwaInstall() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredInstallPrompt = e;
      // Show install button
      const btn = document.getElementById('installPwaBtn');
      if (btn) btn.classList.remove('hidden');
      this.updatePwaStatus();
    });

    window.addEventListener('appinstalled', () => {
      this.deferredInstallPrompt = null;
      const btn = document.getElementById('installPwaBtn');
      if (btn) btn.classList.add('hidden');
      this.showToast('✅ LifeFlow installé avec succès !');
      this.updatePwaStatus();
    });
  },

  async installPwa() {
    if (!this.deferredInstallPrompt) return;
    this.deferredInstallPrompt.prompt();
    const result = await this.deferredInstallPrompt.userChoice;
    if (result.outcome === 'accepted') {
      this.showToast('✅ Installation en cours...');
    }
    this.deferredInstallPrompt = null;
  },

  updatePwaStatus() {
    const statusEl = document.getElementById('pwaStatus');
    if (!statusEl) return;

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true;

    if (isStandalone) {
      statusEl.innerHTML = '✅ <strong>LifeFlow est installé</strong> et fonctionne en mode application !';
      statusEl.style.color = 'var(--accent-green)';
    } else if (this.deferredInstallPrompt) {
      statusEl.innerHTML = '📲 LifeFlow peut être installé sur cet appareil. Clique le bouton ci-dessous !';
      statusEl.style.color = 'var(--accent-blue)';
    } else if ('serviceWorker' in navigator) {
      statusEl.innerHTML = '🌐 LifeFlow fonctionne dans le navigateur. Pour l\'installer, suis le tutoriel ci-dessus.';
      statusEl.style.color = 'var(--text-secondary)';
    } else {
      statusEl.innerHTML = '⚠️ Ton navigateur ne supporte pas les PWA. Utilise Chrome ou Edge.';
      statusEl.style.color = 'var(--accent-orange)';
    }
  },

  // ============================================
  // NOTIFICATIONS
  // ============================================
  notifPrefs: {
    running: true,
    japanese: true,
    log: true,
    habits: true,
    morning: true,
  },

  lastNotifKey: '', // To avoid duplicate notifications

  setupNotifications() {
    this.updateNotifStatus();
  },

  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      this.showToast('❌ Ton navigateur ne supporte pas les notifications');
      return;
    }

    const permission = await Notification.requestPermission();
    this.updateNotifStatus();

    if (permission === 'granted') {
      this.showToast('✅ Notifications activées !');
      // Send a test notification
      this.sendNotification(
        '⚡ LifeFlow activé !',
        'Tu recevras désormais des rappels pour tes activités.',
        'test'
      );
    } else {
      this.showToast('❌ Notifications refusées. Active-les dans les paramètres du navigateur.');
    }
  },

  updateNotifStatus() {
    const statusEl = document.getElementById('notifStatus');
    if (!statusEl) return;

    if (!('Notification' in window)) {
      statusEl.innerHTML = '⚠️ Notifications non supportées par ton navigateur.';
      statusEl.style.background = 'rgba(245, 158, 11, 0.1)';
      statusEl.style.color = 'var(--accent-orange)';
      return;
    }

    const perm = Notification.permission;
    if (perm === 'granted') {
      statusEl.innerHTML = '✅ Notifications <strong>activées</strong> — tu recevras tes rappels !';
      statusEl.style.background = 'rgba(16, 185, 129, 0.1)';
      statusEl.style.color = 'var(--accent-green)';
      const btn = document.getElementById('notifPermBtn');
      if (btn) btn.style.display = 'none';
    } else if (perm === 'denied') {
      statusEl.innerHTML = '❌ Notifications <strong>bloquées</strong>. Va dans les paramètres de ton navigateur pour les réactiver.';
      statusEl.style.background = 'rgba(239, 68, 68, 0.1)';
      statusEl.style.color = 'var(--accent-red)';
    } else {
      statusEl.innerHTML = '🔔 Clique le bouton ci-dessous pour activer les notifications.';
      statusEl.style.background = 'rgba(59, 130, 246, 0.1)';
      statusEl.style.color = 'var(--accent-blue)';
    }
  },

  saveNotifPrefs() {
    const prefs = {};
    ['running', 'japanese', 'log', 'habits', 'morning'].forEach(key => {
      const el = document.getElementById(`notif-${key}`);
      prefs[key] = el ? el.checked : true;
    });
    this.notifPrefs = prefs;
    localStorage.setItem('lifeflow-notif-prefs', JSON.stringify(prefs));
  },

  loadNotifPrefs() {
    try {
      const saved = localStorage.getItem('lifeflow-notif-prefs');
      if (saved) {
        this.notifPrefs = JSON.parse(saved);
        Object.keys(this.notifPrefs).forEach(key => {
          const el = document.getElementById(`notif-${key}`);
          if (el) el.checked = this.notifPrefs[key];
        });
      }
    } catch (e) {
      console.warn('Could not load notif prefs:', e);
    }
  },

  sendNotification(title, body, tag) {
    if (Notification.permission !== 'granted') return;

    // Try via service worker first (works when app is in background)
    if (this.swRegistration) {
      this.swRegistration.showNotification(title, {
        body,
        icon: './icon-192.png',
        badge: './icon-192.png',
        tag: tag || 'lifeflow-reminder',
        vibrate: [200, 100, 200],
        requireInteraction: false,
        data: { url: './index.html' }
      });
    } else {
      // Fallback to regular notification
      new Notification(title, {
        body,
        icon: './icon-192.png',
        tag: tag || 'lifeflow-reminder',
      });
    }
  },

  // Check and send scheduled notifications
  checkScheduledNotifications() {
    if (Notification.permission !== 'granted') return;

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const dayKey = this.getDayKey((now.getDay() + 6) % 7);
    const planning = this.getCurrentTemplate();
    const notifKey = `${this.getDateKey(now)}-${hours}:${minutes}`;

    // Prevent duplicate notifications (same minute)
    if (this.lastNotifKey === notifKey) return;

    // Morning routine reminder (wake time)
    if (this.notifPrefs.morning) {
      const [wh, wm] = (this.state.config.wakeTime || '07:30').split(':').map(Number);
      if (hours === wh && minutes === wm) {
        this.lastNotifKey = notifKey;
        this.sendNotification(
          '🌅 Bonjour Jason !',
          'C\'est l\'heure de ta routine matinale. Bonne journée !',
          'morning-routine'
        );
        return;
      }
    }

    // Scheduled activity reminders (5 min before each slot)
    const slotTimes = {
      'evening1': { h: 18, m: 25 },  // 5 min before 18:30
      'evening2': { h: 19, m: 55 },  // 5 min before 20:00
      'evening3': { h: 21, m: 25 },  // 5 min before 21:30
    };

    for (const [slot, time] of Object.entries(slotTimes)) {
      if (hours === time.h && minutes === time.m) {
        const activity = planning[`${dayKey}-${slot}`];
        if (!activity) continue;

        // Check notification preferences based on activity type
        if (activity.type === 'run' && !this.notifPrefs.running) continue;
        if (activity.type === 'japanese' && !this.notifPrefs.japanese) continue;

        this.lastNotifKey = notifKey;
        this.sendNotification(
          `⏰ Dans 5 minutes : ${activity.label}`,
          'C\'est bientôt l\'heure ! Prépare-toi.',
          `activity-${slot}`
        );
        return;
      }
    }

    // Japanese daily reminder (20:30 if not logged today)
    if (this.notifPrefs.japanese && hours === 20 && minutes === 30) {
      const todayLog = this.state.logs[this.getDateKey(now)];
      if (!todayLog || !todayLog.japanese || todayLog.japanese === 0) {
        this.lastNotifKey = notifKey;
        this.sendNotification(
          '🇯🇵 Japonais du jour !',
          'Tu n\'as pas encore pratiqué aujourd\'hui. 15 minutes suffisent !',
          'japanese-reminder'
        );
        return;
      }
    }

    // Evening journal reminder (22:00)
    if (this.notifPrefs.log && hours === 22 && minutes === 0) {
      const todayLog = this.state.logs[this.getDateKey(now)];
      if (!todayLog) {
        this.lastNotifKey = notifKey;
        this.sendNotification(
          '📝 Journal du soir',
          'N\'oublie pas de remplir ton journal ! Ouvre LifeFlow.',
          'evening-log'
        );
        return;
      }
    }

    // Habits reminder (21:00 if habits unchecked)
    if (this.notifPrefs.habits && hours === 21 && minutes === 0) {
      const todayKey = this.getDateKey(now);
      const checks = this.state.habitChecks[todayKey] || {};
      const unchecked = this.state.habits.filter(h => !checks[h.id]);
      if (unchecked.length > 0) {
        this.lastNotifKey = notifKey;
        this.sendNotification(
          `✅ ${unchecked.length} habitude(s) restante(s)`,
          `Il te reste : ${unchecked.slice(0, 3).map(h => h.name).join(', ')}`,
          'habits-reminder'
        );
        return;
      }
    }
  },
};

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => app.init());

// Close modal on outside click
document.addEventListener('click', (e) => {
  if (e.target.id === 'modalOverlay') {
    app.closeModal();
  }
});
