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
    calendarOffset: 0, // 0 = c. month, -1 = last month, etc.
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
      notes: '',
      enableSounds: true,
      polarClientId: '',
      polarClientSecret: '',
      polarProxyUrl: '',
    },
    discoveryAccepted: {},  // { weekKey: [index, index] }
    weekPlannings: {},      // { "2026-W10": { "mon-evening1": { type: 'run', label: '...' } } }
    strava: {
      connected: false,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      athleteId: null
    },
    polar: {
      connected: false,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      memberId: null,
      lastSync: null,
    },
    // Gamification
    level: 1,
    questCompleted: {},     // {"2026-W11": ["q_habit_1", "q_spec_5"]}
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
  // QUESTS DATABASE
  // ============================================
  habitQuestPool: [
    { id: 'q_run_3', title: 'Régularité', desc: 'Faire 3 sessions de course', type: 'run_sessions', target: 3, xp: 50 },
    { id: 'q_run_4', title: 'Marathonien', desc: 'Faire 4 sessions de course', type: 'run_sessions', target: 4, xp: 75 },
    { id: 'q_km_20', title: 'Bornes', desc: 'Courir 20 km au total', type: 'km', target: 20, xp: 50 },
    { id: 'q_km_30', title: 'Gros Kilométrage', desc: 'Courir 30 km au total', type: 'km', target: 30, xp: 75 },
    { id: 'q_dplus_300', title: 'Grimpeur', desc: 'Cumuler 300m de D+', type: 'dplus', target: 300, xp: 50 },
    { id: 'q_dplus_500', title: 'Chamois', desc: 'Cumuler 500m de D+', type: 'dplus', target: 500, xp: 75 },
    { id: 'q_jap_3', title: 'Nihongo 3', desc: 'Faire 3 sessions de japonais', type: 'jap_sessions', target: 3, xp: 50 },
    { id: 'q_jap_5', title: 'Nihongo 5', desc: 'Faire 5 sessions de japonais', type: 'jap_sessions', target: 5, xp: 75 },
    { id: 'q_jap_min_60', title: 'Immersion', desc: 'Cumuler 60 min de japonais', type: 'jap_minutes', target: 60, xp: 50 },
    { id: 'q_habit_15', title: 'Discipline', desc: 'Cocher 15 habitudes', type: 'habit_count', target: 15, xp: 50 },
    { id: 'q_habit_25', title: 'Rigueur', desc: 'Cocher 25 habitudes', type: 'habit_count', target: 25, xp: 75 },
    { id: 'q_log_5', title: 'Scribe', desc: 'Remplir le journal 5 fois', type: 'log_count', target: 5, xp: 40 },
    { id: 'q_mood_4', title: 'Good Vibes', desc: 'Avoir une humeur moyenne de 4', type: 'mood_avg', target: 4, xp: 60, requiresFullWeek: true },
    { id: 'q_screen_under_5', title: 'Déconnecté', desc: "Moins de 5h d'écran sur la semaine", type: 'screentime_max', target: 5, xp: 80, requiresFullWeek: true }
  ],

  specialQuestPool: [
    { id: 'sq_read', title: 'Rat de bibliothèque', desc: "Lire 30 min d'affilée", type: 'special', target: 1, xp: 100 },
    { id: 'sq_cook', title: 'Chef cuistot', desc: 'Cuisiner un plat sain inédit', type: 'special', target: 1, xp: 100 },
    { id: 'sq_social', title: 'Social', desc: 'Appeler un proche', type: 'special', target: 1, xp: 100 },
    { id: 'sq_stretch', title: 'Souplesse', desc: 'Session stretching de 20 min', type: 'special', target: 1, xp: 100 },
    { id: 'sq_walk', title: 'Flânerie', desc: 'Se promener 45 min sans téléphone', type: 'special', target: 1, xp: 100 },
    { id: 'sq_clean', title: 'Minimaliste', desc: 'Trier 5 objets inutiles', type: 'special', target: 1, xp: 100 },
    { id: 'sq_nature', title: 'Bain de forêt', desc: 'Passer 1h dans la nature', type: 'special', target: 1, xp: 100 },
    { id: 'sq_culture', title: 'Culture', desc: 'Documentaire instructif', type: 'special', target: 1, xp: 100 },
    { id: 'sq_tech_detox', title: 'Détox Digitale', desc: 'Aucun écran après 21h', type: 'special', target: 1, xp: 100 },
    { id: 'sq_meditate', title: 'Zen', desc: '15 min de méditation', type: 'special', target: 1, xp: 100 }
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
    { id: 'hab-routine-am', name: '🌅 Routine matin',       icon: '🌅', frequency: 'daily', color: '--accent-orange', linkedSlotCategory: 'routine' },
    { id: 'hab-stretching', name: '🤸 Étirements/Mobilité', icon: '🤸', frequency: 'daily', color: '--accent-blue',   linkedSlotCategory: 'sport'   },
    { id: 'hab-japanese',   name: '🇯🇵 Japonais (SRS)',      icon: '🇯🇵', frequency: 'daily', color: '--accent-purple', linkedSlotCategory: 'study'   },
    { id: 'hab-log',        name: '📝 Journal du soir',      icon: '📝', frequency: 'daily', color: '--accent-green',  linkedSlotCategory: null      },
    { id: 'hab-hydration',  name: '💧 Hydratation (2L+)',    icon: '💧', frequency: 'daily', color: '--accent-cyan',   linkedSlotCategory: null      },
    { id: 'hab-no-scroll',  name: '📵 Pas de scroll > 1h',  icon: '📵', frequency: 'daily', color: '--accent-pink',   linkedSlotCategory: null      },
  ],

  // Mapping type de créneau → catégorie générique (pour l'ancrage habitude↔planning)
  SLOT_TYPE_TO_CATEGORY: {
    'run':       'sport',
    'strength':  'sport',
    'outdoor':   'sport',
    'japanese':  'study',
    'discovery': 'discovery',
    'routine':   'routine',
    'gaming':    'leisure',
    'rest':      'leisure',
    'work':      'work',
    'free':      null,
  },

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
    { id: 'first-quest', emoji: '📜', name: 'Chasseur de primes', desc: 'Compléter ta première quête', category: 'général', horizon: 'quick' },

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
    { id: '10-quests', emoji: '⚔️', name: 'Mercenaire régulier', desc: 'Compléter 10 quêtes au total', category: 'général', horizon: 'medium' },
    { id: 'perfect-week-quests', emoji: '🎯', name: 'Le compte est bon', desc: "Compléter les 3 quêtes d'une semaine", category: 'général', horizon: 'medium' },

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
    { id: '50-quests', emoji: '🐺', name: 'Sorceleur', desc: 'Compléter 50 quêtes au total', category: 'général', horizon: 'long' },

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

    // ───── 🏅 SAISONNIERS (rang fin de saison) ─────
    { id: 'season-bronze',   emoji: '🥉', name: 'Vétéran Bronze',    desc: 'Terminer une saison au rang Bronze',   category: 'saison', horizon: 'quick' },
    { id: 'season-silver',   emoji: '🥈', name: 'Vétéran Argent',    desc: 'Terminer une saison au rang Argent',   category: 'saison', horizon: 'medium' },
    { id: 'season-gold',     emoji: '🥇', name: 'Vétéran Or',        desc: 'Terminer une saison au rang Or',       category: 'saison', horizon: 'long' },
    { id: 'season-platinum', emoji: '💎', name: 'Vétéran Platine',   desc: 'Terminer une saison au rang Platine',  category: 'saison', horizon: 'epic' },
    { id: 'season-master',   emoji: '👑', name: 'Maître de Saison',  desc: 'Terminer une saison au rang Maître',   category: 'saison', horizon: 'epic' },

    // ───── 🌿 PRINTEMPS — Curiosité & Nouveau Départ ─────
    { id: 'spring-curious',  emoji: '🌸', name: 'Bourgeon Curieux',    desc: 'Essayer 3 découvertes',                  category: 'saison', horizon: 'quick'  },
    { id: 'spring-growth',   emoji: '🌿', name: 'Croissance',          desc: 'Essayer 7 découvertes',                  category: 'saison', horizon: 'medium' },
    { id: 'spring-garden',   emoji: '🪴', name: 'Jardinier',           desc: 'Avoir 3 habitudes actives simultanément', category: 'saison', horizon: 'quick'  },
    { id: 'spring-bloom',    emoji: '✨', name: 'Floraison',           desc: 'Atteindre une Journée Parfaite',         category: 'saison', horizon: 'medium' },

    // ───── ☀️ ÉTÉ — Dépassement & Énergie ─────
    { id: 'summer-warmup',   emoji: '☀️', name: 'Échauffement',        desc: '20 km en une semaine',                   category: 'saison', horizon: 'quick'  },
    { id: 'summer-altitude', emoji: '⛰️', name: 'Conquête',            desc: '2 000m D+ en une semaine',               category: 'saison', horizon: 'medium' },
    { id: 'summer-century',  emoji: '🌞', name: 'Century',             desc: '300 km cumulés au total',                category: 'saison', horizon: 'medium' },
    { id: 'summer-beast',    emoji: '💪', name: 'Bête de Course',      desc: '3 semaines distinctes à 4+ sessions',    category: 'saison', horizon: 'long'   },

    // ───── 🍂 AUTOMNE — Sagesse & Réflexion ─────
    { id: 'autumn-leaf',     emoji: '🍂', name: 'Feuille d\'Automne',  desc: '30 min de japonais en une semaine',      category: 'saison', horizon: 'quick'  },
    { id: 'autumn-owl',      emoji: '🦉', name: 'Chouette',            desc: 'Renseigner son humeur 10 fois',          category: 'saison', horizon: 'quick'  },
    { id: 'autumn-harvest',  emoji: '🌾', name: 'Récolte',             desc: 'Remplir 20 journaux',                    category: 'saison', horizon: 'medium' },
    { id: 'autumn-scholar',  emoji: '📖', name: 'Érudit',              desc: 'Cumuler 200 min de japonais',            category: 'saison', horizon: 'medium' },

    // ───── ❄️ HIVER — Résilience & Discipline ─────
    { id: 'winter-spark',    emoji: '❄️', name: 'Étincelle',           desc: 'Compléter sa 1ère session Focus',        category: 'saison', horizon: 'quick'  },
    { id: 'winter-will',     emoji: '🌨️', name: 'Volonté',             desc: 'Compléter 5 sessions Focus',             category: 'saison', horizon: 'medium' },
    { id: 'winter-fortress', emoji: '🏔️', name: 'Forteresse',          desc: 'Planning streak de 3 semaines',          category: 'saison', horizon: 'medium' },
    { id: 'winter-iron',     emoji: '⚔️', name: 'Acier Trempé',        desc: '10 jours consécutifs d\'habitudes parfaites', category: 'saison', horizon: 'long' },

    // ───── 🏆 QUÊTES SAISONNIÈRES (Phase 5) ─────
    { id: 'quest-spring', emoji: '🌸', name: 'Bourgeon d\'Or',    desc: 'Accomplir la Quête Saisonnière de Printemps', category: 'saison', horizon: 'medium' },
    { id: 'quest-summer', emoji: '🌞', name: 'Soleil Invaincu',   desc: 'Accomplir la Quête Saisonnière d\'Été',       category: 'saison', horizon: 'medium' },
    { id: 'quest-autumn', emoji: '🦉', name: 'Chouette de Bronze',desc: 'Accomplir la Quête Saisonnière d\'Automne',   category: 'saison', horizon: 'medium' },
    { id: 'quest-winter', emoji: '🔮', name: 'Cristal d\'Éternité',desc: 'Accomplir la Quête Saisonnière d\'Hiver',    category: 'saison', horizon: 'medium' },

    // ───── 📅 PLANNING ─────
    { id: 'planner-1',       emoji: '📅', name: 'Premier Plan',        desc: 'Valider une semaine de planning',        category: 'planning', horizon: 'quick'  },
    { id: 'planner-5',       emoji: '🗓️', name: 'Planificateur',       desc: 'Planning streak de 5 semaines',          category: 'planning', horizon: 'long'   },

    // ───── 🎯 FOCUS ─────
    { id: 'focus-first',     emoji: '🎯', name: 'Dans la Zone',        desc: 'Compléter une session Focus Pomodoro',   category: 'focus', horizon: 'quick'  },
    { id: 'focus-10',        emoji: '⏱️', name: 'Zone de Flow',        desc: 'Compléter 10 sessions Focus',            category: 'focus', horizon: 'medium' },
    { id: 'focus-50',        emoji: '🔥', name: 'Maître du Focus',     desc: 'Compléter 50 sessions Focus',            category: 'focus', horizon: 'epic'   },

    // ───── 📝 JOURNAL & BIEN-ÊTRE ─────
    { id: 'log-20',          emoji: '📖', name: 'Mémorialiste',        desc: 'Remplir 20 journaux',                    category: 'journal', horizon: 'medium' },
    { id: 'log-50',          emoji: '📚', name: 'Chroniqueur',         desc: 'Remplir 50 journaux',                    category: 'journal', horizon: 'long'   },
    { id: 'mood-tracker',    emoji: '😊', name: 'Baromètre',           desc: 'Renseigner son humeur 7 fois',           category: 'journal', horizon: 'quick'  },

    // ───── 🎭 POLYVALENCE ─────
    { id: 'all-rounder',     emoji: '🎭', name: 'Touche-à-tout',       desc: 'Débloquer les 4 badges "Premier" (run, japonais, habitude, découverte)', category: 'général', horizon: 'medium' },
    { id: 'perfect-3',       emoji: '💫', name: 'Triplé Parfait',      desc: '3 Journées Parfaites consécutives',      category: 'général', horizon: 'long'   },
    // ───── ⚔️ IDLE RPG ─────
    { id: 'rpg-wave-10',     emoji: '⚔️',  name: 'Première Vague',   desc: 'Atteindre la vague 10 en combat',         category: 'rpg', horizon: 'quick'  },
    { id: 'rpg-wave-50',     emoji: '🏰',  name: 'Assiégeant',       desc: 'Atteindre la vague 50 en combat',         category: 'rpg', horizon: 'medium' },
    { id: 'rpg-wave-100',    emoji: '🐉',  name: 'Dragon Slayer',    desc: 'Atteindre la vague 100 en combat',        category: 'rpg', horizon: 'long'   },
    { id: 'rpg-prestige-1',  emoji: '🌟',  name: 'Renaissance',      desc: 'Effectuer son premier Prestige',          category: 'rpg', horizon: 'long'   },
    { id: 'rpg-full-equip',  emoji: '🛡️',  name: 'Chevalier Équipé', desc: 'Équiper les 8 emplacements',             category: 'rpg', horizon: 'medium' },
    { id: 'rpg-forged-epic', emoji: '🔨',  name: 'Forgeron',         desc: 'Forger un item de rareté Epic ou +',      category: 'rpg', horizon: 'long'   },
    { id: 'rpg-kanji-1',     emoji: '漢',  name: 'Premier Sort',     desc: 'Débloquer un sort Kanji',                category: 'rpg', horizon: 'quick'  },
    { id: 'rpg-skill-node',  emoji: '🌳',  name: 'Nœud Débloqué',   desc: 'Débloquer un nœud de l\'Arbre BioFeedback', category: 'rpg', horizon: 'medium' },
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
    kmRun: 10,              // per km
    dplusGained: 0.05,      // per meter D+
    japaneseMinute: 1,      // per minute
    habitChecked: 5,        // per habit
    journalFilled: 10,      // daily log
    discoveryTried: 25,     // per discovery
    badgeUnlocked: 50,      // per badge
    perfectHabitDay: 15,    // bonus: all habits in a day
    runSession: 15,         // per session logged
    perfectPlanningDay: 25, // bonus: Perfect Day (≥80% habits + ≥3 slots validés)
  },

  // ============================================
  // SEASON DATA (Phase 2)
  // ============================================
  // XP saisonnière accordée par type de créneau validé
  slotSeasonXP: {
    run: 20, strength: 15, outdoor: 15, japanese: 12,
    discovery: 20, routine: 8, rest: 5, free: 5, gaming: 5, work: 5,
  },

  // Définition statique des 4 saisons (mois en index JS, 0=Jan)
  seasonData: {
    spring: { key: 'spring', name: 'Printemps', emoji: '🌿', startMonth: 2, bonusTypes: ['discovery'] },
    summer: { key: 'summer', name: 'Été',       emoji: '☀️', startMonth: 5, bonusTypes: ['run', 'outdoor'] },
    autumn: { key: 'autumn', name: 'Automne',   emoji: '🍂', startMonth: 8, bonusTypes: ['japanese', 'free'] },
    winter: { key: 'winter', name: 'Hiver',     emoji: '❄️', startMonth: 11, bonusTypes: ['routine', 'habit'] },
  },

  // Seuils XP pour les niveaux saisonniers (reset chaque saison)
  seasonLevelThresholds: [
    0, 50, 120, 220, 350, 520, 730, 980, 1280, 1630,
    2030, 2480, 2980, 3530, 4130, 4780, 5480, 6230, 7030, 7880,
  ],

  // ============================================
  // PHASE RPG — DONNÉES STATIQUES
  // ============================================
  heroSection: 'combat',
  combatInterval: null,

  kanjiSpellPool: [
    { id: 'kj-fire',    kanji: '火', name: 'Flamme',   emoji: '🔥', desc: 'Dégâts ×1.5 ce tour',          type: 'damage_boost',  value: 0.5, turns: 1, cost: 1 },
    { id: 'kj-water',   kanji: '水', name: 'Flux',     emoji: '💧', desc: 'ATK ennemie −30% / 3 tours',   type: 'debuff_atk',    value: 0.3, turns: 3, cost: 1 },
    { id: 'kj-wind',    kanji: '風', name: 'Vent',     emoji: '💨', desc: '+0.5 vitesse / 5 tours',        type: 'speed_boost',   value: 0.5, turns: 5, cost: 2 },
    { id: 'kj-earth',   kanji: '土', name: 'Terre',    emoji: '⛰️', desc: '+10 DEF / 3 tours',             type: 'def_boost',     value: 10,  turns: 3, cost: 1 },
    { id: 'kj-thunder', kanji: '雷', name: 'Tonnerre', emoji: '⚡', desc: 'Frappe 3× ATK instantanée',    type: 'instant_damage', value: 3,  turns: 1, cost: 2 },
    { id: 'kj-heal',    kanji: '癒', name: 'Guérison', emoji: '✨', desc: 'Restaure 40% HP max',           type: 'heal',          value: 0.4, turns: 1, cost: 2 },
    { id: 'kj-gold',    kanji: '金', name: 'Fortune',  emoji: '💰', desc: 'Double gold prochaine victoire',type: 'gold_boost',    value: 2,   turns: 1, cost: 1 },
    { id: 'kj-shadow',  kanji: '影', name: 'Ombre',    emoji: '🌑', desc: 'Esquive prochaine attaque',     type: 'dodge',         value: 1,   turns: 1, cost: 1 },
  ],

  skillTreeDefs: {
    endurance: {
      label: '🏃 Endurance', kpiKey: 'trail', kpiThreshold: 0.6,
      nodes: [
        { id: 'end-1', name: 'Muscles d\'Acier',   desc: '+2 ATK',                    cost: 1, bonus: { atk: 2 } },
        { id: 'end-2', name: 'Souffle Long',        desc: '+10% HP max',               cost: 2, bonus: { hpPct: 0.1 } },
        { id: 'end-3', name: 'Frappe Rapide',       desc: '+0.2 vitesse attaque',      cost: 3, bonus: { speed: 0.2 } },
        { id: 'end-4', name: 'Buff Strava ×2',      desc: 'Bonus Strava doublé',       cost: 5, bonus: { stravaX2: true } },
        { id: 'end-5', name: 'Maître du Trail',     desc: '+5 ATK, +0.3 vitesse',      cost: 8, bonus: { atk: 5, speed: 0.3 } },
      ],
    },
    concentration: {
      label: '🧘 Concentration', kpiKey: 'focus', kpiThreshold: 3,
      nodes: [
        { id: 'con-1', name: 'Lucidité',            desc: '+1 Luck',                   cost: 1, bonus: { luck: 1 } },
        { id: 'con-2', name: 'Armure Mentale',      desc: '+3 DEF',                    cost: 2, bonus: { def: 3 } },
        { id: 'con-3', name: 'XP Focus ×1.5',       desc: 'XP Focus multiplié ×1.5',  cost: 3, bonus: { focusXP: 1.5 } },
        { id: 'con-4', name: 'Pause Réduite',        desc: 'Pause Pomodoro −1 min',    cost: 5, bonus: { pauseReduce: 1 } },
        { id: 'con-5', name: 'Maître du Focus',      desc: '+5 DEF, +3 Luck',          cost: 8, bonus: { def: 5, luck: 3 } },
      ],
    },
    discipline: {
      label: '📿 Discipline', kpiKey: 'habit', kpiThreshold: 3,
      nodes: [
        { id: 'dis-1', name: 'Volonté',             desc: '+20 HP max',                cost: 1, bonus: { hp: 20 } },
        { id: 'dis-2', name: 'Rigueur',             desc: '+2 DEF',                    cost: 2, bonus: { def: 2 } },
        { id: 'dis-3', name: 'Streak XP',           desc: '+10% XP par habitude',      cost: 3, bonus: { habitXP: 1.1 } },
        { id: 'dis-4', name: 'Résilience',          desc: '+2 Luck',                   cost: 5, bonus: { luck: 2 } },
        { id: 'dis-5', name: 'Maître Discipline',   desc: '+30 HP max, +5 DEF',        cost: 8, bonus: { hp: 30, def: 5 } },
      ],
    },
    curiosity: {
      label: '🔍 Curiosité', kpiKey: 'discovery', kpiThreshold: 2,
      nodes: [
        { id: 'cur-1', name: 'Œil Avisé',           desc: 'Loot tier +1',              cost: 1, bonus: { lootTierBonus: 1 } },
        { id: 'cur-2', name: 'Intuition',            desc: '+5% chance de loot',        cost: 2, bonus: { dropRate: 0.05 } },
        { id: 'cur-3', name: 'Connaissance',         desc: '+2 ATK',                    cost: 3, bonus: { atk: 2 } },
        { id: 'cur-4', name: 'Sorts Kanji',          desc: 'Débloque les sorts Kanji',  cost: 5, bonus: { kanjiUnlock: true } },
        { id: 'cur-5', name: 'Maître Curiosité',     desc: '+10% loot, Loot tier +2',  cost: 8, bonus: { dropRate: 0.1, lootTierBonus: 2 } },
      ],
    },
  },

  itemNamePool: {
    weapon: ['Bâton de Trail', 'Kodachi de Saison', 'Katana du Marcheur', 'Épée de l\'Aube', 'Lame Kanji', 'Bâton d\'Endurance'],
    head:   ['Casque de Sentier', 'Bandeau Kanji', 'Capuche du Randonneur', 'Kasa du Guerrier', 'Heaume du Pic'],
    torso:  ['Armure de Montagne', 'Veste d\'Endurance', 'Kimono de Combat', 'Cuirasse du Trail', 'Manteau Saisonnier'],
    gloves: ['Gants de Prise', 'Protège-poignets Ninja', 'Gantelets d\'Escalade', 'Gants du Grimpeur'],
    legs:   ['Jambières de Trail', 'Hakama du Guerrier', 'Cuissardes de Montagne', 'Jambières Renforcées'],
    boots:  ['Bottes de Trail', 'Sandales du Ninja', 'Chaussures d\'Alpiniste', 'Tabis du Vide', 'Bottes de Sprint'],
    amulet: ['Amulette de Concentration', 'Fuda Saisonnier', 'Talisman de Streak', 'Magatama Kanji', 'Pierre de Chance'],
    accessory: ['Ceinture de Force', 'Bague de Luck', 'Bracelet du Focus', 'Sash du Randonneur', 'Médaille d\'Honneur'],
  },

  enemyData: [
    { minWave: 1,  emoji: '🐀', name: 'Rat de Montagne'    },
    { minWave: 5,  emoji: '👺', name: 'Gobelin des Brumes'  },
    { minWave: 10, emoji: '💀', name: 'Squelette Ancien'    },
    { minWave: 15, emoji: '🧌', name: 'Troll de la Forêt'   },
    { minWave: 20, emoji: '🐉', name: 'Dragon de Bronze'    },
    { minWave: 25, emoji: '👹', name: 'Démon Rouge'         },
    { minWave: 30, emoji: '🦇', name: 'Vampire des Neiges'  },
    { minWave: 35, emoji: '🕷️', name: 'Araignée Géante'     },
    { minWave: 40, emoji: '🐍', name: 'Hydre Venimeuse'     },
    { minWave: 45, emoji: '🦂', name: 'Scorpion Géant'      },
    { minWave: 50, emoji: '👑', name: 'Titan du Chaos'      },
  ],

  // ============================================
  // INITIALIZATION
  // ============================================
  init() {
    this.currentUser = null;
    this.loadData();
    // Phase 2 — gains hors-ligne, transition de saison, indicateur
    this.calculateOfflineGains();
    this.checkRPGBadges();
    this.checkSeasonTransition();
    this.updateSeasonIndicator();
    // Phase 3 — réinitialiser le timer focus si le chargement interrompt une session
    if (this.state.rpg?.focusActive) this.state.rpg.focusActive = false;
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

    // Check OAuth callbacks (Strava & Polar)
    this.checkStravaAuthCallback();
    this.checkPolarAuthCallback();

    // Update "now" banner every minute
    setInterval(() => this.updateNowBanner(), 60000);
    // Check notifications every minute
    setInterval(() => this.checkScheduledNotifications(), 60000);

    // Initialize Firebase Auth Listener
    if (window.firebaseAPI) {
      // Check for magic link sign in (important for PWA)
      if (window.firebaseAPI.checkAndCompleteSignIn) {
        window.firebaseAPI.checkAndCompleteSignIn()
          .then(user => {
            if (user) {
              if (typeof this.showToast === 'function') {
                this.showToast('✅ Connecté avec succès via le lien !');
              }
            }
          })
          .catch(err => {
            console.error("Auth link error:", err);
            if (typeof this.showToast === 'function') {
              this.showToast('❌ Erreur de connexion : ' + (err.message || 'Lien expiré ou invalide'));
            }
          });
      }

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
  // STRAVA INTEGRATION
  // ============================================
  async getValidStravaToken() {
    if (!this.state.strava || !this.state.strava.connected) return null;
    
    // Check if token is expired (adding a 5-minute buffer)
    if (Date.now() > this.state.strava.expiresAt - 300000) {
      try {
        const response = await fetch('https://www.strava.com/oauth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            client_id: this.state.config.stravaClientId,
            client_secret: this.state.config.stravaClientSecret,
            grant_type: 'refresh_token',
            refresh_token: this.state.strava.refreshToken
          })
        });

        if (!response.ok) throw new Error('Token refresh failed');
        const data = await response.json();

        this.state.strava.accessToken = data.access_token;
        this.state.strava.refreshToken = data.refresh_token; // Sometimes they rotate refresh tokens
        this.state.strava.expiresAt = data.expires_at * 1000;
        this.saveData();

      } catch (err) {
        console.error("Erreur renouvellement token Strava:", err);
        return null;
      }
    }
    
    return this.state.strava.accessToken;
  },

  async syncStravaActivities(isBackground = false) {
    if (!this.state.strava || !this.state.strava.connected) {
      if (!isBackground) this.showToast('❌ Strava non connecté.');
      return;
    }

    if (!isBackground) this.showToast('🔄 Synchronisation Strava...');
    const btnSync = document.querySelector('button[onclick="app.syncStravaActivities()"]');
    if (btnSync) btnSync.classList.add('loading');

    const token = await this.getValidStravaToken();
    if (!token) {
      if (!isBackground) this.showToast('❌ Le token Strava a expiré. Veuillez vous reconnecter.');
      if (btnSync) btnSync.classList.remove('loading');
      return;
    }

    try {
      // Get Activities from Monday of the current week (to avoid messing up past data!)
      const monday = this.getMonday(new Date());
      monday.setHours(0, 0, 0, 0);
      const afterTimestamp = Math.floor(monday.getTime() / 1000);

      const response = await fetch(`https://www.strava.com/api/v3/athlete/activities?after=${afterTimestamp}&per_page=30`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch activities');

      const activities = await response.json();
      const updatedDays = this.processStravaActivities(activities);

      if (updatedDays > 0) {
        this.saveData();
        this.recalculateXP();
        this.updateRecords();
        this.checkWeeklyQuests();
        this.checkAllBadges();
        
        // Refresh UI
        this.renderDashboard();
        this.renderVisualCalendar();
        this.renderPlanning();
        
        this.showToast(`✅ Strava: ${updatedDays} activité(s) importée(s) cette semaine !`);
      } else {
        if (!isBackground) this.showToast('ℹ️ Strava: Aucune nouvelle activité cette semaine.');
      }

    } catch (err) {
      console.error('Strava Fetch Error:', err);
      if (!isBackground) this.showToast('❌ Erreur de synchronisation Strava.');
    } finally {
      if (btnSync) btnSync.classList.remove('loading');
    }
  },

  processStravaActivities(activities) {
    let updatedCount = 0;
    
    // Strava activity types that count as running
    const runTypes = ['Run', 'TrailRun', 'VirtualRun'];

    activities.forEach(activity => {
      // Ignore non-running activities if we only track runs
      if (!runTypes.includes(activity.type)) return;

      const dateObj = new Date(activity.start_date_local);
      const dateKey = this.getDateKey(dateObj);

      // Create log if it doesn't exist
      if (!this.state.logs[dateKey]) {
        this.state.logs[dateKey] = {};
      }
      
      const log = this.state.logs[dateKey];
      
      // Calculate km and D+
      const km = parseFloat((activity.distance / 1000).toFixed(1));
      const dplus = Math.round(activity.total_elevation_gain);

      // If there's an existing log with values, we might just be overwriting it to make sure it matches Strava.
      // Strava is the source of truth for distance/elevation.
      if (log.km !== km || log.dplus !== dplus) {
        log.km = km;
        log.dplus = dplus;
        // Don't overwrite mood or sleep, just the sports data
        updatedCount++;
      }
    });

    return updatedCount;
  },

  updateStravaStatus() {
    const statusEl = document.getElementById('stravaStatus');
    const btnConnect = document.getElementById('btnConnectStrava');
    const dashboardBtn = document.getElementById('dashboardSyncStravaBtn');
    
    if (this.state.strava && this.state.strava.connected) {
      if (statusEl) {
        statusEl.textContent = 'Statut : Connecté à Strava ✅';
        statusEl.style.color = 'var(--text-main)';
        statusEl.style.display = 'block';
      }
      if (btnConnect) {
        btnConnect.textContent = '🔄 Reconnecter / Mettre à jour API';
        btnConnect.classList.replace('btn-primary', 'btn-outline');
      }
      if (dashboardBtn) {
        dashboardBtn.style.display = 'block';
      }
    } else {
      if (statusEl) {
        statusEl.textContent = 'Statut : Déconnecté';
        statusEl.style.color = 'var(--text-secondary)';
        statusEl.style.display = 'block';
      }
      if (btnConnect) {
        btnConnect.textContent = '🔗 Se connecter à Strava';
        btnConnect.classList.replace('btn-outline', 'btn-primary');
      }
      if (dashboardBtn) {
        dashboardBtn.style.display = 'none';
      }
    }
  },

  async connectStrava() {
    const clientId = this.state.config.stravaClientId;
    
    // Save current config if changes were made
    this.saveConfig();

    if (!clientId) {
      this.showToast('❌ Veuillez renseigner le Client ID Strava.');
      return;
    }

    const redirectUri = window.location.href.split('?')[0]; // Current URL without params
    const scope = 'activity:read_all';
    const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&approval_prompt=force&scope=${scope}`;
    
    // Redirect user to Strava
    window.location.href = authUrl;
  },

  async checkStravaAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    // Guard: ne pas traiter si c'est un callback Polar
    if (urlParams.get('state') === 'polar_oauth') return;
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (code || error) {
      this.isResolvingStrava = true; // Protect from cloud sync overwriting
    }

    if (error) {
       this.showToast('❌ Connexion Strava refusée.');
       // Clean URL without reloading immediately
       window.history.replaceState({}, document.title, window.location.pathname);
       return;
    }

    if (code) {
      this.showToast('🔄 Finalisation de la connexion Strava...');
      
      const clientId = this.state.config.stravaClientId;
      const clientSecret = this.state.config.stravaClientSecret;

      if (!clientId || !clientSecret) {
        this.showToast('❌ Client ID ou Secret manquant. Reconfigurez Strava.');
        return;
      }

      try {
        const response = await fetch('https://www.strava.com/oauth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            code: code,
            grant_type: 'authorization_code'
          })
        });

        if (!response.ok) {
           throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Save Strava data deeply in app state
        this.state.strava = {
          connected: true,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt: data.expires_at * 1000, // Make it ms
          athleteId: data.athlete.id
        };

        this.saveData();
        this.updateStravaStatus();
        this.showToast('✅ Strava connecté avec succès !');

        // Automatically fetch data for the first time
        this.syncStravaActivities(true); // true = force fetch

      } catch (err) {
        console.error("Strava Auth Error:", err);
        this.showToast('❌ Erreur lors de l\'authentification Strava.');
      }

      // Cleanup URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Release the lock after a short delay to allow Firebase to settle
      setTimeout(() => { this.isResolvingStrava = false; }, 5000);
    }
  },

  // ============================================
  // POLAR INTEGRATION
  // ============================================

  // Retourne l'URL du proxy CORS sans slash final (évite les doubles slashes)
  getPolarProxyUrl() {
    return (this.state.config.polarProxyUrl || '').trim().replace(/\/+$/, '');
  },

  // Helper : requête authentifiée vers l'API Polar avec support proxy CORS optionnel
  async polarFetch(method, path, body = null) {
    const token = this.state.polar?.accessToken;
    if (!token) throw new Error('No Polar access token');

    const baseUrl = 'https://www.polaraccesslink.com';
    const proxyUrl = this.getPolarProxyUrl();
    const targetUrl = `${baseUrl}${path}`;
    const fullUrl = proxyUrl ? `${proxyUrl}/${targetUrl}` : targetUrl;

    const opts = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    };
    if (body !== null) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }

    return fetch(fullUrl, opts);
  },

  async getValidPolarToken() {
    if (!this.state.polar?.connected) return null;

    // Rafraîchir si expiration dans moins de 5 minutes
    if (Date.now() > this.state.polar.expiresAt - 300000) {
      try {
        const proxyUrl = this.getPolarProxyUrl();
        const tokenEndpoint = 'https://polarremote.com/v2/oauth2/token';
        const url = proxyUrl ? `${proxyUrl}/${tokenEndpoint}` : tokenEndpoint;

        // Polar exige les credentials en HTTP Basic Auth (RFC 6749 §2.3.1)
        const basicAuth = btoa(`${this.state.config.polarClientId}:${this.state.config.polarClientSecret}`);
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${basicAuth}`,
          },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: this.state.polar.refreshToken,
          }),
        });

        if (!response.ok) throw new Error(`Polar token refresh failed: ${response.status}`);
        const data = await response.json();

        this.state.polar.accessToken = data.access_token;
        if (data.refresh_token) this.state.polar.refreshToken = data.refresh_token;
        this.state.polar.expiresAt = Date.now() + (data.expires_in * 1000);
        this.saveData();

      } catch (err) {
        console.error('Erreur renouvellement token Polar:', err);
        return null;
      }
    }

    return this.state.polar.accessToken;
  },

  async connectPolar() {
    this.saveConfig();
    const clientId = this.state.config.polarClientId?.trim();

    if (!clientId) {
      this.showToast('❌ Veuillez renseigner le Client ID Polar.');
      return;
    }

    const redirectUri = window.location.href.split('?')[0];
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'accesslink.read_all',
      state: 'polar_oauth',   // Identifiant pour distinguer du callback Strava
    });

    window.location.href = `https://flow.polar.com/oauth2/authorization?${params.toString()}`;
  },

  async checkPolarAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const oauthState = urlParams.get('state');
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    // Traiter uniquement les callbacks Polar
    if (oauthState !== 'polar_oauth') return;

    if (error) {
      this.showToast('❌ Connexion Polar refusée.');
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (!code) return;

    this.showToast('🔄 Finalisation de la connexion Polar...');

    const clientId = this.state.config.polarClientId?.trim();
    const clientSecret = this.state.config.polarClientSecret?.trim();

    if (!clientId || !clientSecret) {
      this.showToast('❌ Client ID ou Secret Polar manquant. Reconfigurez.');
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    try {
      const proxyUrl = this.getPolarProxyUrl();
      const tokenEndpoint = 'https://polarremote.com/v2/oauth2/token';
      const tokenUrl = proxyUrl ? `${proxyUrl}/${tokenEndpoint}` : tokenEndpoint;
      const redirectUri = window.location.href.split('?')[0];

      // Polar exige les credentials en HTTP Basic Auth (RFC 6749 §2.3.1)
      const basicAuth = btoa(`${clientId}:${clientSecret}`);
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${basicAuth}`,
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
        }),
      });

      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        throw new Error(`Token exchange failed (${response.status}): ${errBody}`);
      }

      const data = await response.json();

      // Stocker les tokens — null si absent (Firebase rejette undefined)
      this.state.polar.accessToken = data.access_token || null;
      this.state.polar.refreshToken = data.refresh_token || null;
      this.state.polar.expiresAt = data.expires_in ? Date.now() + (data.expires_in * 1000) : null;

      // Étape obligatoire : enregistrer l'utilisateur dans AccessLink
      await this.registerPolarUser(data.access_token);

      this.state.polar.connected = true;
      this.state.polar.lastSync = null;
      this.saveData();
      this.updatePolarStatus();
      this.showToast('✅ Polar connecté avec succès ! Synchronisez vos données.');

    } catch (err) {
      console.error('Polar Auth Error:', err);
      // Réinitialiser les tokens en cas d'échec
      this.state.polar.accessToken = null;
      this.state.polar.refreshToken = null;
      this.state.polar.expiresAt = null;
      this.showToast('❌ Erreur lors de la connexion Polar. Vérifiez vos identifiants.');
    }

    window.history.replaceState({}, document.title, window.location.pathname);
  },

  async registerPolarUser(accessToken) {
    const proxyUrl = this.getPolarProxyUrl();
    const endpoint = 'https://www.polaraccesslink.com/v3/users';
    const url = proxyUrl ? `${proxyUrl}/${endpoint}` : endpoint;

    // Générer un member-id stable (requis par Polar AccessLink)
    if (!this.state.polar.memberId) {
      this.state.polar.memberId = 'lifeflow-' + Math.random().toString(36).slice(2, 11);
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ 'member-id': this.state.polar.memberId }),
    });

    if (res.status === 409) {
      // Utilisateur déjà enregistré dans cette app
      if (this.state.polar.memberId) {
        console.info('Polar: utilisateur déjà enregistré, memberId existant conservé.');
        return;
      }
      // Tenter d'extraire le memberId depuis la réponse 409 si disponible
      try {
        const body = await res.json();
        const id = body['polar-user-id'] || body['member-id'];
        if (id) { this.state.polar.memberId = String(id); return; }
      } catch (_) {}
      // memberId introuvable : on prévient mais on continue (la sync échouera avec 404)
      this.showToast('⚠️ Polar: compte déjà lié mais ID non récupéré. Si la sync échoue, déconnectez puis re-liez.', 'warning');
      return;
    }

    if (!res.ok) {
      throw new Error(`Polar registration failed: ${res.status}`);
    }

    const data = await res.json();
    this.state.polar.memberId = String(data['polar-user-id'] || data['member-id'] || '');
    console.info(`Polar: utilisateur enregistré, memberId = ${this.state.polar.memberId}`);
  },

  disconnectPolar() {
    this.state.polar = {
      connected: false,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      memberId: null,
      lastSync: null,
    };
    this.saveData();
    this.updatePolarStatus();
    this.showToast('🔌 Polar déconnecté.');
  },

  async syncPolarData() {
    if (!this.state.polar?.connected) {
      this.showToast('❌ Polar non connecté. Liez votre compte dans Config.');
      return;
    }
    if (!this.state.polar.memberId) {
      this.showToast('❌ ID utilisateur Polar manquant. Déconnectez et re-liez votre compte.');
      return;
    }

    this.showToast('🔄 Synchronisation Polar en cours...');
    const syncBtn = document.getElementById('polarSyncBtn');
    const dashBtn = document.getElementById('dashboardSyncPolarBtn');
    if (syncBtn) syncBtn.classList.add('loading');
    if (dashBtn) dashBtn.classList.add('loading');

    try {
      const token = await this.getValidPolarToken();
      if (!token) {
        this.showToast('❌ Token Polar expiré. Veuillez vous reconnecter.');
        return;
      }

      // 1. Sommeil — 7 derniers jours (endpoint direct, pas de transaction)
      const today = this.getDateKey(new Date());
      const weekAgo = this.getDateKey(new Date(Date.now() - 7 * 24 * 3600 * 1000));
      await this.syncPolarSleep(weekAgo, today);

      // 2. Activité quotidienne — steps + calories (via transaction)
      await this.syncPolarDailyActivity();

      this.state.polar.lastSync = Date.now();
      this.saveData();
      this.recalculateXP();
      this.checkWeeklyQuests();
      this.checkAllBadges();
      this.renderDashboard();
      this.renderVisualCalendar();
      this.updatePolarStatus();
      this.showToast('✅ Polar synchronisé !');

    } catch (err) {
      console.error('Polar sync error:', err);
      this.showToast('❌ Erreur sync Polar. Voir la console pour les détails.');
    } finally {
      if (syncBtn) syncBtn.classList.remove('loading');
      if (dashBtn) dashBtn.classList.remove('loading');
    }
  },

  async syncPolarSleep(fromDate, toDate) {
    const res = await this.polarFetch(
      'GET',
      `/v3/users/${this.state.polar.memberId}/sleep?from=${fromDate}&to=${toDate}`
    );

    if (res.status === 204 || res.status === 404) return; // Pas de données
    if (!res.ok) {
      console.warn(`Polar sleep sync: réponse ${res.status}`);
      return;
    }

    const data = await res.json();
    const nights = data['nights'] || [];

    for (const night of nights) {
      const dateKey = night.date;
      if (!dateKey) continue;

      if (!this.state.logs[dateKey]) this.state.logs[dateKey] = {};
      const log = this.state.logs[dateKey];

      // Durée totale sommeil : total_sleep_time (secondes) → heures
      if (typeof night.total_sleep_time === 'number') {
        log.sleepDuration = parseFloat((night.total_sleep_time / 3600).toFixed(2));
      }
      // Score qualité sommeil 0-100
      if (typeof night.sleep_score === 'number') {
        log.sleepQuality = night.sleep_score;
      }
      // FC repos nocturne
      if (typeof night.heart_rate_avg === 'number') {
        log.restingHR = night.heart_rate_avg;
      }
      // ANS Charge (1-5) converti en score 0-100
      if (typeof night.ans_charge === 'number') {
        log.recoveryScore = Math.round((night.ans_charge / 5) * 100);
      }
      // Statut Nightly Recharge (0=N/A, 1=Perturbé, 2=Compromis, 3=Soutenu, 4=Rechargé)
      if (typeof night.nightly_recharge_status === 'number') {
        log.nightlyRechargeStatus = night.nightly_recharge_status;
      }
    }

    console.info(`Polar sleep: ${nights.length} nuit(s) synchronisée(s)`);
  },

  async syncPolarDailyActivity() {
    const uid = this.state.polar.memberId;

    // Créer une transaction d'activité
    const txRes = await this.polarFetch('POST', `/v3/users/${uid}/activity-transactions`);

    // 204 = pas de nouvelles données depuis la dernière transaction
    if (txRes.status === 204) {
      console.info('Polar activity: aucune nouvelle donnée.');
      return;
    }
    if (!txRes.ok) {
      console.warn(`Polar activity transaction: ${txRes.status}`);
      return;
    }

    const txLocation = txRes.headers.get('Location');
    if (!txLocation) return;

    // Chemin relatif pour polarFetch
    const txPath = txLocation.replace('https://www.polaraccesslink.com', '');
    let txCommitted = false;

    try {
      const listRes = await this.polarFetch('GET', txPath);
      if (!listRes.ok) return;

      const listData = await listRes.json();
      const activityUrls = listData['activity-log'] || [];

      for (const url of activityUrls) {
        try {
          const path = url.replace('https://www.polaraccesslink.com', '');
          const dayRes = await this.polarFetch('GET', path);
          if (!dayRes.ok) continue;

          const day = await dayRes.json();
          const dateKey = day.date;
          if (!dateKey) continue;

          if (!this.state.logs[dateKey]) this.state.logs[dateKey] = {};
          const log = this.state.logs[dateKey];

          // Polar v3 utilise des tirets dans les noms de champs
          log.steps = day['active-steps'] ?? day.active_steps ?? 0;
          log.activeCalories = day['active-calories'] ?? day.active_calories ?? 0;

        } catch (e) {
          console.warn('Polar: erreur lecture jour activité', e);
        }
      }

      // CRITIQUE : committer la transaction (sinon les données restent bloquées)
      const commitRes = await this.polarFetch('PUT', txPath);
      txCommitted = commitRes.ok;
      console.info(`Polar activity: ${activityUrls.length} jour(s), commit: ${txCommitted}`);

    } catch (err) {
      if (!txCommitted) {
        // Transaction non committée → réessayable à la prochaine sync
        console.warn('Polar: transaction non committée, réessai à la prochaine sync.', err);
      }
      throw err;
    }
  },

  renderPolarHealthCard() {
    const container = document.getElementById('polarHealthCard');
    if (!container) return;

    if (!this.state.polar?.connected) {
      container.style.display = 'none';
      return;
    }

    const today = this.getDateKey(new Date());
    const log = this.state.logs[today] || {};
    const hasPolarData = log.sleepDuration != null || log.steps != null || log.recoveryScore != null;

    if (!hasPolarData) {
      container.style.display = 'block';
      container.innerHTML = `
        <div class="card" style="border:1px solid rgba(220,38,38,0.2);background:rgba(220,38,38,0.05);">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <div class="card-title">🫀 Santé Polar</div>
            <button class="btn btn-outline" style="font-size:0.8rem;padding:4px 10px;" onclick="app.syncPolarData()">🔄 Sync</button>
          </div>
          <p style="font-size:0.85rem;color:var(--text-muted);margin-top:0.5rem;">
            ${this.state.polar.lastSync ? "Aucune donnée Polar pour aujourd'hui." : 'Appuie sur Sync pour importer tes données de santé.'}
          </p>
        </div>`;
      return;
    }

    // Couleurs dynamiques
    const rec = log.recoveryScore ?? null;
    const recColor = rec == null ? 'var(--text-muted)' : rec >= 70 ? 'var(--accent-green)' : rec >= 40 ? 'var(--accent-orange)' : 'var(--accent-red)';
    const recLabel = rec == null ? '' : rec >= 70 ? 'Bonne' : rec >= 40 ? 'Moyenne' : 'Faible';

    const sleepH = log.sleepDuration != null ? Math.floor(log.sleepDuration) : null;
    const sleepM = log.sleepDuration != null ? Math.round((log.sleepDuration % 1) * 60) : null;
    const sleepStr = sleepH != null ? `${sleepH}h${sleepM > 0 ? sleepM + 'm' : ''}` : '—';
    const sleepColor = sleepH == null ? 'var(--text-muted)' : sleepH >= 8 ? 'var(--accent-green)' : sleepH >= 6 ? 'var(--accent-orange)' : 'var(--accent-red)';

    const steps = log.steps ?? null;
    const stepsStr = steps != null ? steps.toLocaleString('fr-FR') : '—';
    const stepsPct = steps != null ? Math.min(Math.round((steps / 10000) * 100), 100) : 0;
    const stepsColor = steps == null ? 'var(--accent-blue)' : steps >= 10000 ? 'var(--accent-green)' : steps >= 5000 ? 'var(--accent-orange)' : 'var(--accent-blue)';

    container.style.display = 'block';
    container.innerHTML = `
      <div class="card" style="border:1px solid rgba(220,38,38,0.2);background:rgba(220,38,38,0.04);">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
          <div class="card-title">🫀 Santé Polar</div>
          <button class="btn btn-outline" style="font-size:0.8rem;padding:4px 10px;" onclick="app.syncPolarData()">🔄 Sync</button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:0.75rem;text-align:center;margin-bottom:1rem;">
          <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:0.75rem 0.25rem;">
            <div style="font-size:1.4rem;">😴</div>
            <div style="font-size:1.1rem;font-weight:700;color:${sleepColor};">${sleepStr}</div>
            <div style="font-size:0.72rem;color:var(--text-muted);">Sommeil</div>
            ${log.sleepQuality != null ? `<div style="font-size:0.7rem;color:var(--text-secondary);">Score ${log.sleepQuality}</div>` : ''}
          </div>
          <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:0.75rem 0.25rem;">
            <div style="font-size:1.4rem;">💚</div>
            <div style="font-size:1.1rem;font-weight:700;color:${recColor};">${rec != null ? rec : '—'}</div>
            <div style="font-size:0.72rem;color:var(--text-muted);">Récupération</div>
            ${recLabel ? `<div style="font-size:0.7rem;color:${recColor};">${recLabel}</div>` : ''}
          </div>
          <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:0.75rem 0.25rem;">
            <div style="font-size:1.4rem;">🚶</div>
            <div style="font-size:1rem;font-weight:700;color:${stepsColor};">${stepsStr}</div>
            <div style="font-size:0.72rem;color:var(--text-muted);">Pas</div>
            <div style="font-size:0.7rem;color:var(--text-secondary);">${stepsPct}%</div>
          </div>
          <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:0.75rem 0.25rem;">
            <div style="font-size:1.4rem;">❤️</div>
            <div style="font-size:1.1rem;font-weight:700;color:var(--accent-red);">${log.restingHR != null ? log.restingHR : '—'}</div>
            <div style="font-size:0.72rem;color:var(--text-muted);">FC repos</div>
          </div>
        </div>
        ${steps != null ? `
        <div>
          <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--text-muted);margin-bottom:4px;">
            <span>🚶 Objectif pas quotidien</span><span>${stepsStr} / 10 000</span>
          </div>
          <div style="height:6px;background:rgba(255,255,255,0.08);border-radius:3px;overflow:hidden;">
            <div style="height:100%;width:${stepsPct}%;background:${stepsColor};border-radius:3px;transition:width 0.4s;"></div>
          </div>
        </div>` : ''}
      </div>`;
  },

  updatePolarStatus() {
    const statusEl = document.getElementById('polarStatus');
    const btnConnect = document.getElementById('btnConnectPolar');
    const btnDisconnect = document.getElementById('btnDisconnectPolar');
    const syncBtn = document.getElementById('polarSyncBtn');
    const lastSyncEl = document.getElementById('polarLastSync');
    const dashboardBtn = document.getElementById('dashboardSyncPolarBtn');

    const connected = this.state.polar?.connected;

    if (connected) {
      if (statusEl) {
        statusEl.textContent = 'Statut : Connecté à Polar ✅';
        statusEl.style.color = 'var(--accent-green)';
        statusEl.style.display = 'block';
      }
      if (btnConnect) {
        btnConnect.textContent = '🔄 Reconnecter';
        btnConnect.classList.remove('btn-primary');
        btnConnect.classList.add('btn-outline');
      }
      if (btnDisconnect) btnDisconnect.style.display = 'inline-flex';
      if (syncBtn) syncBtn.style.display = 'block';
      if (dashboardBtn) dashboardBtn.style.display = 'block';
      if (lastSyncEl) {
        const ls = this.state.polar.lastSync;
        lastSyncEl.textContent = ls
          ? `Dernière sync : ${new Date(ls).toLocaleString('fr-FR')}`
          : 'Jamais synchronisé';
        lastSyncEl.style.display = 'block';
      }
    } else {
      if (statusEl) {
        statusEl.textContent = 'Statut : Déconnecté';
        statusEl.style.color = 'var(--text-secondary)';
        statusEl.style.display = 'block';
      }
      if (btnConnect) {
        btnConnect.textContent = '🔗 Lier mon compte Polar';
        btnConnect.classList.remove('btn-outline');
        btnConnect.classList.add('btn-primary');
      }
      if (btnDisconnect) btnDisconnect.style.display = 'none';
      if (syncBtn) syncBtn.style.display = 'none';
      if (dashboardBtn) dashboardBtn.style.display = 'none';
      if (lastSyncEl) lastSyncEl.style.display = 'none';
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
      // Phase 0 — Migration : ajouter color et linkedSlotCategory aux habitudes existantes
      this.state.habits = this.state.habits.map((h, i) => {
        const defaults = this.defaultHabits.find(d => d.id === h.id);
        return {
          color: defaults?.color ?? ['--accent-orange','--accent-blue','--accent-purple','--accent-green','--accent-cyan','--accent-pink'][i % 6],
          linkedSlotCategory: null,
          ...h,
        };
      });
      // Ensure gamification state exists (for data saved before gamification was added)
      if (!this.state.questCompleted) this.state.questCompleted = {};
      if (!this.state.unlockedBadges) this.state.unlockedBadges = {};
      if (!this.state.records) this.state.records = {
        longestRun: 0, biggestDplus: 0, bestWeekKm: 0, bestWeekScore: 0,
        longestJapStreak: 0, longestHabitStreak: 0,
        totalKm: 0, totalDplus: 0, totalJapMinutes: 0, totalDiscoveries: 0,
      };
      if (typeof this.state.xp !== 'number') this.state.xp = 0;
      if (typeof this.state.level !== 'number') this.state.level = 1;
      // Phase 0 — Migration : nouveaux champs state pour phases futures
      if (!this.state.slotValidations) this.state.slotValidations = {};
      if (typeof this.state.planningStreak !== 'number') this.state.planningStreak = 0;
      if (!this.state.rpg) this.state.rpg = {
        hero: { hp: 100, hpMax: 100, atk: 10, def: 10, speed: 1.0, lvl: 1, xp: 0, prestigePoints: 0, resets: 0 },
        equipment: { weapon: null, head: null, torso: null, gloves: null, legs: null, boots: null, amulet: null, accessory: null },
        inventory: [],
        skillTree: {},
        activeBuffs: [],
        currentWave: 1,
        highestWave: 1,
        lastUpdate: null,
        focusTimer: 0,
      };
      // Phase 3 — Migration : champs manquants sur hero + focus timer
      if (typeof this.state.rpg.hero.luck !== 'number') this.state.rpg.hero.luck = 10;
      if (typeof this.state.rpg.focusActive !== 'boolean') this.state.rpg.focusActive = false;
      if (!this.state.rpg.focusPhase) this.state.rpg.focusPhase = 'work';
      if (typeof this.state.rpg.focusSessionsCompleted !== 'number') this.state.rpg.focusSessionsCompleted = 0;
      // Phase 2 — Migration : ajouter rpg.season si absent
      if (!this.state.rpg.season) {
        const cs = this.getCurrentSeason();
        const now = new Date();
        this.state.rpg.season = {
          current: {
            id: this.getSeasonIdForDate(now),
            name: cs.name,
            startDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`,
            xp: 0,
            rank: 'Bronze',
            xpMultiplier: 1.0,
          },
          history: [],
        };
      }
      // Phase 5 — Migration : quêtes saisonnières
      if (!this.state.rpg.seasonQuests) {
        this.state.rpg.seasonQuests = {
          active: this.initSeasonalQuest(),
          history: [],
        };
      }
      // Phase RPG-A — Migration
      if (typeof this.state.rpg.hero.gold !== 'number') this.state.rpg.hero.gold = 0;
      if (!Array.isArray(this.state.rpg.combatLog)) this.state.rpg.combatLog = [];
      if (!Array.isArray(this.state.rpg.pendingLoot)) this.state.rpg.pendingLoot = [];
      if (typeof this.state.rpg.offlineProcessed !== 'number') this.state.rpg.offlineProcessed = 0;
      // Phase RPG-D — Migration
      if (typeof this.state.rpg.hero.fragments !== 'number') this.state.rpg.hero.fragments = 0;
      if (!Array.isArray(this.state.rpg.kanji)) this.state.rpg.kanji = [];
      if (this.state.rpg.stravaBuff === undefined) this.state.rpg.stravaBuff = null;
      if (!this.state.rpg.combatState) this.state.rpg.combatState = null;
      if (typeof this.state.rpg.hero.hpMax !== 'number') this.state.rpg.hero.hpMax = 100;
      // Polar — Migration
      if (!this.state.polar) this.state.polar = { connected: false, accessToken: null, refreshToken: null, expiresAt: null, memberId: null, lastSync: null };
      if (!this.state.config.polarClientId) this.state.config.polarClientId = '';
      if (!this.state.config.polarClientSecret) this.state.config.polarClientSecret = '';
      if (!this.state.config.polarProxyUrl) this.state.config.polarProxyUrl = '';
      // Polar RPG buffs — Migration
      if (this.state.rpg.polarStepsBuff === undefined) this.state.rpg.polarStepsBuff = null;
      if (this.state.rpg.polarSleepDebuff === undefined) this.state.rpg.polarSleepDebuff = null;
    } catch (e) {
      console.warn('Could not load saved data:', e);
    }
  },

  saveData() {
    try {
      // Mettre à jour le timestamp hors-ligne avant toute sauvegarde
      if (this.state.rpg) this.state.rpg.lastUpdate = Date.now();
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
  async sendMagicLink() {
    const emailInput = document.getElementById('authEmailInput');
    const email = emailInput ? emailInput.value.trim() : '';

    if (!email || !email.includes('@')) {
      this.showToast('❌ Veuillez entrer une adresse email valide.');
      return;
    }

    try {
      this.showToast('🔄 Envoi du lien de connexion...');
      await window.firebaseAPI.sendSignInLink(email);
      this.showToast('✅ Lien envoyé ! Vérifiez votre boîte mail.');
      if (emailInput) emailInput.value = ''; // Clean up input
    } catch (err) {
      this.showToast('❌ Erreur lors de l\'envoi du lien.');
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

    // Prevent overwriting local state if we are currently resolving a Strava OAuth callback
    if (this.isResolvingStrava) {
      console.log("Strava Auth in progress, skipping cloud sync to prevent state overwrite.");
      return;
    }

    this.updateSyncIndicator('syncing');
    const cloudState = await window.firebaseAPI.loadFromCloud(this.currentUser.uid);

    if (cloudState) {
      // Pour faire simple, on écrase les données locales avec celles du cloud
      // Une meilleure implémentation gèrerait les conflits selon _lastModified
      const { _lastModified, ...cleanCloudState } = cloudState;

      // Préserver les badges gagnés localement (le cloud peut être plus ancien)
      const localBadges = { ...this.state.unlockedBadges };

      this.state = { ...this.state, ...cleanCloudState };
      this.state.config = { ...this.state.config, ...cleanCloudState.config };

      // Merge: on garde l'union des badges locaux et cloud (jamais de régression)
      this.state.unlockedBadges = { ...cleanCloudState.unlockedBadges, ...localBadges };

      // Sauvegarde dans le localStorage
      localStorage.setItem('lifeflow-data', JSON.stringify(this.state));

      this.showToast('☁️ Données synchronisées depuis le Cloud !');
      this.updateSyncIndicator('success');

      // Re-évaluer les badges avec le state mergé (sans toast) + pousser vers le cloud
      this.checkAllBadges(true);  // silent=true — pas de nouveaux toasts
      // saveData() est appelé dans checkAllBadges(), ce qui push aussi vers le cloud

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
    const btnSignInContainer = document.getElementById('emailSignInContainer'); // Updated to new container
    const btnSignOut = document.getElementById('btnGoogleSignOut');
    const syncTimeStatus = document.getElementById('syncTimeStatus');

    // On s'assure que l'élément UI existe (sinon ça plante sur de vieilles versions en cache)
    if (!authStatusText) return;

    if (this.currentUser) {
      // User can have display name if they set it later, or null for magic link
      const displayName = this.currentUser.displayName || this.currentUser.email.split('@')[0];
      authStatusText.textContent = `Connecté : ${displayName}`;
      authStatusText.style.color = 'var(--text-main)';
      authEmailText.textContent = `Synchro Cloud activée (${this.currentUser.email})`;

      if (this.currentUser.photoURL) {
        authAvatar.src = this.currentUser.photoURL;
        authAvatar.style.display = 'block';
      }

      if (btnSignInContainer) btnSignInContainer.style.display = 'none';
      btnSignOut.style.display = 'block';
      syncTimeStatus.style.display = 'block';

      this.updateSyncIndicator('success');
    } else {
      authStatusText.textContent = 'Déconnecté (Mode Local)';
      authStatusText.style.color = 'var(--text-secondary)';
      authEmailText.textContent = 'Données stockées uniquement sur cet appareil.';
      authAvatar.style.display = 'none';

      if (btnSignInContainer) btnSignInContainer.style.display = 'flex';
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
    // Hero tab — start/stop combat tick
    if (tabName === 'hero') {
      this.renderHeroTab();
      this.startCombatTick();
    } else {
      this.stopCombatTick();
    }
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

    // Créneau actuel depuis le planning réel
    const dayKey = this.getDayKey((now.getDay() + 6) % 7);
    const planning = this.getCurrentTemplate();
    const slotOrder = ['morning', 'day', 'evening1', 'evening2', 'evening3'];
    const currentSlotKey = slotOrder.find(s => this.isCurrentTimeSlot(s));
    const currentSlot = currentSlotKey ? planning[`${dayKey}-${currentSlotKey}`] : null;
    const nextSlotKey = currentSlotKey
      ? slotOrder[slotOrder.indexOf(currentSlotKey) + 1]
      : slotOrder.find(s => {
          const ranges = { morning:[7*60,8*60+30], day:[9*60,18*60], evening1:[18*60+30,20*60], evening2:[20*60,21*60+30], evening3:[21*60+30,23*60] };
          return ranges[s] && (hours * 60 + now.getMinutes()) < ranges[s][0];
        });
    const nextSlot = nextSlotKey ? planning[`${dayKey}-${nextSlotKey}`] : null;

    let greeting, activity, nextUp;

    if (hours < 8) {
      greeting = `Bonjour ${name} 🌅`;
      activity = currentSlot ? `En cours : ${currentSlot.label}` : 'C\'est le matin — prends ton temps pour ta routine.';
      nextUp = nextSlot ? `Prochain : ${nextSlot.label}` : 'Routine matin → Journée de travail';
    } else if (hours < 12) {
      greeting = `Bonne matinée ${name} ☀️`;
      activity = currentSlot ? `En cours : ${currentSlot.label}` : (now.getDay() === 0 || now.getDay() === 6 ? 'Weekend ! Check ton planning.' : 'En plein travail — focus ! 💪');
      nextUp = nextSlot ? `Prochain : ${nextSlot.label}` : 'Pause déjeuner bientôt';
    } else if (hours < 14) {
      greeting = `Bon appétit ${name} 🍽️`;
      activity = currentSlot ? `En cours : ${currentSlot.label}` : 'Pause midi — recharge tes batteries.';
      nextUp = nextSlot ? `Prochain : ${nextSlot.label}` : 'Reprise à 14h';
    } else if (hours < 18) {
      greeting = `Bon après-midi ${name} 💼`;
      activity = currentSlot ? `En cours : ${currentSlot.label}` : (now.getDay() === 0 || now.getDay() === 6 ? 'Profite de ton après-midi libre !' : 'Dernière ligne droite au travail.');
      nextUp = nextSlot ? `Prochain : ${nextSlot.label}` : 'Fin de journée → activité du soir';
    } else if (hours < 20) {
      greeting = `Bonsoir ${name} 🌆`;
      activity = currentSlot ? `En cours : ${currentSlot.label}` : 'C\'est l\'heure de ton activité du soir !';
      nextUp = nextSlot ? `Prochain : ${nextSlot.label}` : 'Bonne soirée !';
    } else if (hours < 22) {
      greeting = `Bonsoir ${name} 🌙`;
      activity = currentSlot ? `En cours : ${currentSlot.label}` : 'Temps de détente — profites-en bien.';
      nextUp = nextSlot ? `Prochain : ${nextSlot.label}` : 'N\'oublie pas ton journal du soir !';
    } else {
      greeting = `Bonne nuit ${name} 😴`;
      activity = currentSlot ? `En cours : ${currentSlot.label}` : 'Il est temps de préparer le sommeil.';
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
    // RPG-D: Strava buff from manual log + Kanji unlock
    const logKm = parseFloat(document.getElementById('log-km')?.value) || 0;
    const logJap = parseFloat(document.getElementById('log-japanese')?.value) || 0;
    if (logKm > 0) this.addStravaBuff(logKm);
    if (logJap >= 10) this.checkKanjiUnlock(logJap);
    this.saveData();
    this.recalculateXP();
    this.updateRecords();
    this.checkWeeklyQuests();
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
    this.renderPolarHealthCard();
    this.renderKPIs();
    this.renderWeeklyScore();
    this.renderMiniCharts();
    this.renderQuests();
    this.renderDiscovery();
    this.renderSeasonWidget(); // Phase 3
    this.renderGameSection();
  },

  renderQuests() {
      const container = document.getElementById('questsContainer');
      if (!container) return;

      const today = new Date();
      const weekKey = this.getWeekKey(today);
      const quests = this.getWeekQuests(weekKey);
      
      const weekLogs = this.getWeekLogs();
      const dates = this.getWeekDates(0);
      const weekHabitChecks = {};
      dates.forEach(d => {
          const k = this.getDateKey(d);
          if (this.state.habitChecks[k]) {
              weekHabitChecks[k] = this.state.habitChecks[k];
          }
      });

      const completed = this.state.questCompleted[weekKey] || [];

      container.innerHTML = quests.map(q => {
          const isDone = completed.includes(q.id);
          const progress = isDone ? q.target : this.getQuestProgress(q, weekLogs, weekHabitChecks);
          const pct = Math.min((progress / q.target) * 100, 100);

          let actionHtml = '';
          if (q.type === 'special') {
              actionHtml = `<button class="btn ${isDone ? 'btn-primary' : ''}" style="padding: 4px 8px; font-size: 0.8rem;" onclick="app.toggleSpecialQuest('${q.id}')">${isDone ? '✅ Fait' : 'Valider'}</button>`;
          } else {
              actionHtml = `<span style="font-size: 0.8rem; color: var(--text-muted);">${typeof progress === 'number' && !Number.isInteger(progress) ? progress.toFixed(1) : progress} / ${q.target}</span>`;
          }

          return `
            <div style="background: var(--bg-card); padding: 0.75rem; border-radius: 8px; display: flex; flex-direction: column; gap: 0.5rem; opacity: ${isDone ? '0.7' : '1'};">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <div style="font-weight: 600; font-size: 0.95rem; display: flex; align-items: center; gap: 6px;">
                    ${isDone ? '✅' : '🔸'} ${q.title}
                  </div>
                  <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">${q.desc} <span style="color: var(--accent-purple); font-weight: 600;">(+${q.xp} XP)</span></div>
                </div>
                ${actionHtml}
              </div>
              <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; margin-top: 4px;">
                <div style="height: 100%; width: ${pct}%; background: ${isDone ? 'var(--accent-green)' : 'var(--accent-purple)'}; transition: width 0.3s ease;"></div>
              </div>
            </div>
          `;
      }).join('');
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
      { icon: '📅', label: 'Planning Streak', value: `${this.state.planningStreak}j`, target: 'Obj: ≥ 3 créneaux/j', pct: Math.min(this.state.planningStreak / 7 * 100, 100), color: this.state.planningStreak >= 7 ? 'green' : 'orange', streak: this.state.planningStreak },
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
  // WEEKLY QUESTS
  // ============================================
  getWeekQuests(weekKey) {
    let hash = 0;
    for (let i = 0; i < weekKey.length; i++) {
      hash = ((hash << 5) - hash) + weekKey.charCodeAt(i);
      hash |= 0;
    }
    hash = Math.abs(hash);

    const habitQuests = [];
    let hPool = [...this.habitQuestPool];
    for(let i=0; i<2; i++) {
        const idx = (hash + i * 17) % hPool.length;
        habitQuests.push(hPool.splice(idx, 1)[0]);
    }

    const specialIdx = (hash * 13) % this.specialQuestPool.length;
    const specialQuest = this.specialQuestPool[specialIdx];

    return [...habitQuests, specialQuest];
  },

  getQuestProgress(quest, weekLogs, weekHabitChecks) {
    if (quest.type === 'special') {
        const weekKey = this.getWeekKey(new Date());
        return (this.state.questCompleted[weekKey] && this.state.questCompleted[weekKey].includes(quest.id)) ? 1 : 0;
    }

    let progress = 0;
    if (quest.type === 'run_sessions') {
        progress = weekLogs.filter(l => l && l.km > 0).length;
    } else if (quest.type === 'km') {
        progress = weekLogs.reduce((sum, l) => sum + (l?.km || 0), 0);
    } else if (quest.type === 'dplus') {
        progress = weekLogs.reduce((sum, l) => sum + (l?.dplus || 0), 0);
    } else if (quest.type === 'jap_sessions') {
        progress = weekLogs.filter(l => l && l.japanese > 0).length;
    } else if (quest.type === 'jap_minutes') {
        progress = weekLogs.reduce((sum, l) => sum + (l?.japanese || 0), 0);
    } else if (quest.type === 'habit_count') {
        Object.values(weekHabitChecks).forEach(dayHabits => {
            progress += Object.values(dayHabits).filter(v => v).length;
        });
    } else if (quest.type === 'log_count') {
        progress = weekLogs.filter(l => l && l.saved).length;
    } else if (quest.type === 'mood_avg') {
        const moodLogs = weekLogs.filter(l => l && l.mood > 0);
        progress = moodLogs.length > 0 ? (moodLogs.reduce((sum, l) => sum + (l.mood || 0), 0) / moodLogs.length) : 0;
    } else if (quest.type === 'screentime_max') {
        progress = weekLogs.reduce((sum, l) => sum + (l?.screentime || 0), 0);
    }

    return progress;
  },

  checkWeeklyQuests() {
    const today = new Date();
    const weekKey = this.getWeekKey(today);
    const quests = this.getWeekQuests(weekKey);
    
    if (!this.state.questCompleted[weekKey]) {
      this.state.questCompleted[weekKey] = [];
    }
    
    const weekLogs = this.getWeekLogs();
    const dates = this.getWeekDates(0);
    const weekHabitChecks = {};
    dates.forEach(d => {
        const k = this.getDateKey(d);
        if (this.state.habitChecks[k]) {
            weekHabitChecks[k] = this.state.habitChecks[k];
        }
    });

    let newlyCompleted = false;

    quests.forEach(q => {
      if (this.state.questCompleted[weekKey].includes(q.id)) return;

      const progress = this.getQuestProgress(q, weekLogs, weekHabitChecks);
      
      let isCompleted = false;
      if (q.type === 'screentime_max') {
          const isSunday = today.getDay() === 0;
          if (isSunday && progress <= q.target) isCompleted = true;
      } else {
          isCompleted = progress >= q.target;
      }

      if (isCompleted) {
          this.state.questCompleted[weekKey].push(q.id);
          newlyCompleted = true;
          this.showToast(`🎉 Quête accomplie : ${q.title} (+${q.xp} XP)`);
      }
    });

    if (newlyCompleted) {
        this.recalculateXP();
        this.checkAllBadges();
        this.saveData();
        this.renderDashboard();
    }
  },

  toggleSpecialQuest(questId) {
      const weekKey = this.getWeekKey(new Date());
      if (!this.state.questCompleted[weekKey]) {
          this.state.questCompleted[weekKey] = [];
      }
      
      const isCompleted = this.state.questCompleted[weekKey].includes(questId);
      if (isCompleted) {
          this.state.questCompleted[weekKey] = this.state.questCompleted[weekKey].filter(id => id !== questId);
          this.saveData();
      } else {
          this.state.questCompleted[weekKey].push(questId);
          const q = this.specialQuestPool.find(sp => sp.id === questId);
          this.showToast(`🎉 Quête spéciale accomplie : ${q?.title} (+${q?.xp} XP)`);
          this.recalculateXP();
          this.checkAllBadges();
          this.saveData();
      }
      // Assuming rendering is done via UI interactions
      this.renderGameSection();
  },

  // ============================================
  // GAMIFICATION REWARD ANIMATIONS
  // ============================================
  rewardQueue: [],
  isShowingReward: false,

  queueRewardAnimation(rewardData) {
    this.rewardQueue.push(rewardData);
    if (!this.isShowingReward) {
      this.playNextReward();
    }
  },

  playNextReward() {
    if (this.rewardQueue.length === 0) {
      this.isShowingReward = false;
      return;
    }

    this.isShowingReward = true;
    const reward = this.rewardQueue.shift();
    
    const overlay = document.getElementById('rewardOverlay');
    const content = overlay.querySelector('.reward-content');
    const icon = document.getElementById('rewardIcon');
    const title = document.getElementById('rewardTitle');
    const subtitle = document.getElementById('rewardSubtitle');

    // Haptic Feedback & Sound
    if (this.state.config.enableSounds !== false) {
      if (window.navigator && window.navigator.vibrate) {
        try { navigator.vibrate([100, 50, 200]); } catch(e) {}
      }
      try {
        const audio = new Audio(reward.type === 'level' ? 'assets/level-up.mp3' : 'assets/badge.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Audio autoplays prevented by browser', e));
      } catch(e) {}
    }

    if (reward.type === 'level') {
      icon.textContent = '🎖️';
      title.textContent = 'Niveau Supérieur !';
      subtitle.textContent = `Bravo, tu as atteint le niveau ${reward.level} : ${reward.name}`;
      content.setAttribute('data-glow', 'level');
    } else if (reward.type === 'badge') {
      icon.textContent = reward.badge.emoji;
      title.textContent = 'Badge Débloqué !';
      subtitle.textContent = `Tu as obtenu le badge épique : ${reward.badge.name}`;
      content.setAttribute('data-glow', reward.badge.horizon === 'epic' ? 'badge-epic' : 'badge-long');
    }

    overlay.classList.add('active');

    // Trigger Confetti
    if (typeof confetti === 'function') {
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: this.randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: this.randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }.bind(this), 250);
    }
  },

  randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  },

  closeRewardAnimation() {
    const overlay = document.getElementById('rewardOverlay');
    if (overlay) overlay.classList.remove('active');
    
    // Slight delay before reading the next queue item to let CSS transition finish
    setTimeout(() => {
      this.playNextReward();
    }, 500);
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
        const isPastOrToday = this.getDateKey(d) <= today;
        const isCurrentSlot = isToday && this.isCurrentTimeSlot(slot.key);
        const validation = this.state.slotValidations[weekKey]?.[slotKey];
        const isValidated = !!validation;

        html += `<div class="cell ${isToday ? 'today-col' : ''} ${isCurrentSlot ? 'current-slot' : ''}" onclick="app.editSlot('${weekKey}', '${slotKey}')">`;
        if (activity) {
          const validatedTime = isValidated
            ? new Date(validation.validatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            : '';
          html += `<div class="activity-block ${activity.type} ${isValidated ? 'validated' : ''}">
            ${activity.label}
            ${isValidated ? `<span class="validated-time">✓ ${validatedTime}</span>` : ''}
          </div>`;
          if (isPastOrToday) {
            html += `<button class="validate-btn ${isValidated ? 'is-validated' : ''}"
              onclick="event.stopPropagation(); app.validateSlot('${weekKey}', '${slotKey}')"
              title="${isValidated ? 'Annuler la validation' : 'Valider ce créneau'}">
              ${isValidated ? '✓ Fait' : '○ Valider'}
            </button>`;
          }
        }
        html += '</div>';
      });
    });

    grid.innerHTML = html;
    this.renderFocusTimer(); // Phase 3 — met à jour le timer Pomodoro
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
  // SEASONS (Phase 2)
  // ============================================

  // Retourne l'objet seasonData correspondant à la date actuelle (mois local, sans UTC)
  getCurrentSeason() {
    const month = new Date().getMonth(); // 0=Jan … 11=Dec, heure locale
    if (month >= 2 && month <= 4)  return this.seasonData.spring;
    if (month >= 5 && month <= 7)  return this.seasonData.summer;
    if (month >= 8 && month <= 10) return this.seasonData.autumn;
    return this.seasonData.winter;
  },

  // Retourne l'identifiant unique d'une saison pour une date donnée (ex: "spring-2026")
  getSeasonIdForDate(date) {
    const month = date.getMonth();
    const year  = date.getFullYear();
    if (month >= 2 && month <= 4)  return `spring-${year}`;
    if (month >= 5 && month <= 7)  return `summer-${year}`;
    if (month >= 8 && month <= 10) return `autumn-${year}`;
    return `winter-${year}`;
  },

  // Ajoute de l'XP saisonnière sans toucher à state.xp (géré par recalculateXP)
  // Ne sauvegarde PAS — la fonction appelante doit sauvegarder.
  // Incrémente l'XP saisonnière en appliquant les multiplicateurs (saison + héritage)
  addXP(type, amount) {
    if (!this.state.rpg?.season?.current) return;
    const season = this.state.rpg.season.current;
    // Multiplicateur saisonnier : +15% si le type est dans les bonusTypes de la saison courante
    const sd = this.getCurrentSeason();
    const seasonalMult = sd.bonusTypes.includes(type) ? 1.15 : 1.0;
    // Multiplicateur héritage cumulé des saisons précédentes
    const heritageMult = season.xpMultiplier || 1.0;
    const finalAmount = Math.round(amount * seasonalMult * heritageMult);
    season.xp = (season.xp || 0) + finalAmount;
    season.rank = this.getSeasonRank(season.xp);
    // Phase 2 — incrémenter aussi l'XP globale du héros
    if (this.state.rpg.hero) {
      this.state.rpg.hero.xp = (this.state.rpg.hero.xp || 0) + finalAmount;
      this.checkLevelUp();
    }
  },

  // Fait monter le héros de niveau si son XP est suffisant
  // Chaque niveau coûte lvl * 100 XP (seuil linéaire simple)
  checkLevelUp() {
    const hero = this.state.rpg?.hero;
    if (!hero) return;
    let leveled = false;
    while (hero.xp >= hero.lvl * 100) {
      hero.xp -= hero.lvl * 100;
      hero.lvl = (hero.lvl || 1) + 1;
      hero.hpMax = 100 + (hero.lvl - 1) * 10;
      hero.hp = hero.hpMax;          // restaurer HP au level-up
      hero.atk = 10 + (hero.lvl - 1) * 2;
      hero.def = 10 + (hero.lvl - 1) * 1;
      leveled = true;
    }
    if (leveled) {
      this.showToast(`⚡ Héros niveau ${hero.lvl} ! HP+, ATK+, DEF+`);
    }
  },

  calculateOfflineGains() {
    const rpg = this.state.rpg;
    if (!rpg?.hero || !rpg.lastUpdate) {
      rpg.lastUpdate = Date.now();
      return;
    }
    // Idempotency guard
    if (rpg.offlineProcessed === rpg.lastUpdate) return;
    const elapsed = Date.now() - rpg.lastUpdate;
    const minutes = Math.min(Math.floor(elapsed / 60000), 480);
    if (minutes < 1) {
      rpg.offlineProcessed = rpg.lastUpdate;
      rpg.lastUpdate = Date.now();
      return;
    }
    const hero = this.getHeroStats();
    const wave = rpg.currentWave || 1;
    const enemy = this.getEnemyStats(wave);
    // Vagues par minute selon les stats du héros
    const heroDmg = Math.max(1, (hero.atk - enemy.def));
    const hitsToKill = Math.ceil(enemy.hp / heroDmg);
    const secsPerWave = (hitsToKill * 3) / (hero.speed || 1);
    const wavesPerMin = 60 / secsPerWave;
    const wavesGained = Math.min(Math.floor(minutes * wavesPerMin), minutes * 5);
    // Efficacité hors-ligne : 50% (le héros n'est pas là pour gérer les défaites)
    const offlineEfficiency = 0.5;
    let xpGained = 0, goldGained = 0;
    const lootItems = [];
    const luck = hero.luck || 10;
    for (let i = 0; i < wavesGained; i++) {
      const e = this.getEnemyStats(wave + i);
      xpGained  += e.xp;
      goldGained += e.gold;
      if ((i + 1) % 5 === 0) {
        const lootRate = this.getLootRate(luck) * offlineEfficiency;
        if (Math.random() < lootRate) {
          const item = this.generateItem(wave + i);
          this.addToInventory(item);
          lootItems.push(item);
        }
      }
    }
    // Appliquer l'efficacité et les caps hors-ligne
    xpGained   = Math.round(Math.min(xpGained   * offlineEfficiency, 5000));
    goldGained = Math.round(Math.min(goldGained  * offlineEfficiency, 5000));
    const lvlBefore = rpg.hero.lvl || 1;
    rpg.hero.xp   = (rpg.hero.xp   || 0) + xpGained;
    rpg.hero.gold = (rpg.hero.gold  || 0) + goldGained;
    // Avancer la vague (plafonné à highestWave + 5 hors-ligne)
    if (wavesGained > 0) {
      const maxOfflineWave = (rpg.highestWave || 1) + 5;
      rpg.currentWave = Math.min(wave + wavesGained, maxOfflineWave);
      if (rpg.currentWave > (rpg.highestWave || 1)) rpg.highestWave = rpg.currentWave;
    }
    this.checkLevelUp();
    this.checkRPGBadges();
    rpg.offlineProcessed = rpg.lastUpdate;
    rpg.lastUpdate = Date.now();
    const lvlAfter = rpg.hero.lvl || 1;
    // Afficher le rituel de retour si absence significative (≥5 min), sinon toast simple
    const hasGains = xpGained > 0 || goldGained > 0 || wavesGained > 0;
    if (!hasGains) return;
    if (minutes >= 5) {
      // Délai pour laisser le DOM s'initialiser complètement
      setTimeout(() => this.showOfflineReturnModal({
        minutes, xpGained, goldGained, wavesGained,
        lootItems, lvlBefore, lvlAfter,
        currentWave: rpg.currentWave || 1,
        highestWave: rpg.highestWave || 1,
      }), 600);
    } else {
      const parts = [];
      if (xpGained > 0)         parts.push(`+${xpGained} XP`);
      if (lvlAfter > lvlBefore) parts.push(`Niv. ${lvlBefore}→${lvlAfter} ⚡`);
      if (goldGained > 0)       parts.push(`+${goldGained}💰`);
      if (wavesGained > 0)      parts.push(`${wavesGained} vagues`);
      this.showToast(`⏰ Hors-ligne (${minutes} min) : ${parts.join(' · ')}`);
    }
  },

  // ─── Rituel de Retour Hors-ligne ─────────────────────────────────────────
  showOfflineReturnModal({ minutes, xpGained, goldGained, wavesGained, lootItems, lvlBefore, lvlAfter, currentWave, highestWave }) {
    const overlay = document.getElementById('offlineReturnOverlay');
    const modal   = document.getElementById('offlineReturnModal');
    if (!overlay || !modal) {
      // fallback toast
      this.showToast(`⏰ Hors-ligne (${minutes} min) : +${xpGained} XP · +${goldGained}💰`);
      return;
    }

    const fmt = (m) => m >= 60
      ? `${Math.floor(m / 60)}h${m % 60 > 0 ? String(m % 60).padStart(2,'0') : ''}`
      : `${m} min`;

    const lvlUpHtml = lvlAfter > lvlBefore ? `
      <div class="orm-levelup-banner">
        ⚡ Niveau <span class="orm-lvl-before">${lvlBefore}</span>
        <span class="orm-lvl-arrow">→</span>
        <span class="orm-lvl-after">${lvlAfter}</span>
      </div>` : '';

    const lootHtml = lootItems.length > 0 ? `
      <div class="orm-loot-section">
        <div class="orm-section-label">📦 Butins récupérés</div>
        <div class="orm-loot-list">
          ${lootItems.map(it => `<span class="orm-loot-badge">${it.emoji} ${it.name}</span>`).join('')}
        </div>
      </div>` : '';

    modal.innerHTML = `
      <div class="orm-particles" id="ormParticles"></div>
      <div class="orm-icon">⏰</div>
      <div class="orm-title">Retour après <strong>${fmt(minutes)}</strong></div>
      <div class="orm-subtitle">Ton héros a tenu le combat en ton absence</div>
      ${lvlUpHtml}
      <div class="orm-gains-grid">
        <div class="orm-gain-cell">
          <div class="orm-gain-icon">⚡</div>
          <div class="orm-gain-value" id="ormXp">0</div>
          <div class="orm-gain-label">XP héros</div>
        </div>
        <div class="orm-gain-cell">
          <div class="orm-gain-icon">💰</div>
          <div class="orm-gain-value" id="ormGold">0</div>
          <div class="orm-gain-label">Gold pillé</div>
        </div>
        <div class="orm-gain-cell">
          <div class="orm-gain-icon">🌊</div>
          <div class="orm-gain-value" id="ormWaves">0</div>
          <div class="orm-gain-label">Vagues</div>
        </div>
      </div>
      ${lootHtml}
      <div class="orm-wave-status">
        Vague <strong>${currentWave}</strong> · Record <strong>${highestWave}</strong>
      </div>
      <button class="btn btn-primary orm-collect-btn" onclick="app.closeOfflineReturnModal()">
        ✨ Récupérer les gains
      </button>
    `;

    overlay.classList.add('active');

    // Particules flottantes
    const particlesEl = document.getElementById('ormParticles');
    if (particlesEl) {
      const emojis = ['⭐','💰','⚡','🔮','✨','🎯'];
      for (let i = 0; i < 12; i++) {
        const p = document.createElement('span');
        p.className = 'orm-particle';
        p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        p.style.cssText = `left:${5 + Math.random() * 88}%;animation-delay:${Math.random() * 2.5}s;animation-duration:${1.8 + Math.random() * 1.5}s`;
        particlesEl.appendChild(p);
      }
    }

    // Compteurs animés (démarrent 400ms après ouverture)
    setTimeout(() => {
      this.animateCountUp(document.getElementById('ormXp'),    xpGained,   1200);
      this.animateCountUp(document.getElementById('ormGold'),  goldGained, 1000);
      this.animateCountUp(document.getElementById('ormWaves'), wavesGained, 900);
    }, 400);
  },

  animateCountUp(el, target, duration) {
    if (!el) return;
    if (target === 0) { el.textContent = '0'; return; }
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      el.textContent = Math.round(target * eased).toLocaleString('fr-FR');
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  },

  closeOfflineReturnModal() {
    const overlay = document.getElementById('offlineReturnOverlay');
    if (!overlay) return;
    overlay.classList.add('orm-exit');
    setTimeout(() => { overlay.classList.remove('active', 'orm-exit'); }, 350);
  },

  getHeroStats() {
    const hero = this.state.rpg?.hero;
    if (!hero) return null;
    const eq = this.state.rpg?.equipment || {};
    let atkBonus = 0, defBonus = 0, hpBonus = 0, speedBonus = 0, luckBonus = 0;
    Object.values(eq).forEach(item => {
      if (!item) return;
      atkBonus  += item.atk  || 0;
      defBonus  += item.def  || 0;
      hpBonus   += item.hp   || 0;
      if (item.special?.type === 'speed') speedBonus += item.special.value;
    });
    // Strava buff
    const stravaBuff = this.state.rpg?.stravaBuff;
    if (stravaBuff && stravaBuff.expiresAt > Date.now()) {
      speedBonus += stravaBuff.speedBonus || 0;
    }
    // Skill tree bonuses
    const tree = this.state.rpg?.skillTree || {};
    Object.keys(tree).forEach(nodeId => {
      if (!tree[nodeId]) return;
      const node = this.getSkillNode(nodeId);
      if (!node) return;
      const b = node.bonus;
      atkBonus  += b.atk   || 0;
      defBonus  += b.def   || 0;
      hpBonus   += b.hp    || 0;
      speedBonus += b.speed || 0;
      luckBonus  += b.luck  || 0;
    });
    // hpPct bonus from skill tree
    const hpPct = this.getSkillBonus('hpPct');
    const hpPctBonus = Math.round((hero.hpMax || 100) * hpPct);
    return {
      lvl:   hero.lvl,
      hp:    hero.hp,
      hpMax: (hero.hpMax || 100) + hpBonus + hpPctBonus,
      atk:   (hero.atk || 10) + atkBonus,
      def:   (hero.def || 10) + defBonus,
      speed: Math.max(0.1, (hero.speed || 1.0) + speedBonus),
      luck:  Math.min(25, (hero.luck || 10) + luckBonus),
      xp:    hero.xp,
      gold:  hero.gold || 0,
      fragments: hero.fragments || 0,
    };
  },

  // Retourne le niveau saisonnier (1-20) pour une valeur d'XP saisonnière
  getSeasonLevelForXP(xp) {
    let level = 1;
    for (let i = 0; i < this.seasonLevelThresholds.length; i++) {
      if (xp >= this.seasonLevelThresholds[i]) level = i + 1;
      else break;
    }
    return level;
  },

  // Retourne le rang saisonnier (Bronze → Maître) selon l'XP
  getSeasonRank(xp) {
    const level = this.getSeasonLevelForXP(xp);
    if (level >= 20) return 'Maître';
    if (level >= 16) return 'Platine';
    if (level >= 11) return 'Or';
    if (level >= 6)  return 'Argent';
    return 'Bronze';
  },

  // Retourne le bonus Héritage (multiplicateur à ajouter) selon le rang de fin de saison
  getHeritageBonus(rank) {
    const bonuses = { 'Bronze': 0.01, 'Argent': 0.02, 'Or': 0.03, 'Platine': 0.05, 'Maître': 0.08 };
    return bonuses[rank] || 0.01;
  },

  // Vérifie si la saison a changé depuis la dernière sauvegarde ; déclenche la transition si besoin
  // ============================================
  // PHASE 5 — QUÊTES SAISONNIÈRES
  // ============================================

  initSeasonalQuest() {
    const season = this.state.rpg?.season?.current;
    const seasonType = season?.id?.split('-')[0] || 'spring';
    const questDefs = {
      spring: { type: 'discoveries', label: 'Découvertes de Printemps', emoji: '🌸', defaultTarget: 5,   badgeId: 'quest-spring', xpReward: 200, unit: 'découvertes' },
      summer: { type: 'km',          label: 'Conquête Estivale',        emoji: '🌞', defaultTarget: 200,  badgeId: 'quest-summer', xpReward: 300, unit: 'km' },
      autumn: { type: 'jap_streak',  label: 'Sagesse d\'Automne',       emoji: '🦉', defaultTarget: 30,   badgeId: 'quest-autumn', xpReward: 250, unit: 'jours streak' },
      winter: { type: 'habit_days',  label: 'Discipline Hivernale',     emoji: '🔮', defaultTarget: 7,    badgeId: 'quest-winter', xpReward: 200, unit: 'jours parfaits' },
    };
    const def = questDefs[seasonType] || questDefs.spring;
    return {
      id: season?.id || this.getSeasonIdForDate(new Date()),
      season: seasonType,
      type: def.type,
      label: def.label,
      emoji: def.emoji,
      unit: def.unit,
      target: def.defaultTarget,
      completed: false,
      completedDate: null,
      badgeId: def.badgeId,
      xpReward: def.xpReward,
    };
  },

  computeSeasonQuestProgress() {
    const q = this.state.rpg?.seasonQuests?.active;
    if (!q) return 0;
    const startDate = this.state.rpg?.season?.current?.startDate || '2000-01-01';

    if (q.type === 'discoveries') {
      let count = 0;
      Object.entries(this.state.discoveryAccepted).forEach(([date, arr]) => {
        if (date >= startDate) count += arr.length;
      });
      return count;
    }
    if (q.type === 'km') {
      let total = 0;
      Object.entries(this.state.logs).forEach(([date, log]) => {
        if (date >= startDate) total += log.km || 0;
      });
      return Math.round(total * 10) / 10;
    }
    if (q.type === 'jap_streak') {
      return this.calculateStreak('japanese');
    }
    if (q.type === 'habit_days') {
      let count = 0;
      const habitCount = this.state.habits.length;
      if (habitCount === 0) return 0;
      Object.entries(this.state.habitChecks).forEach(([date, checks]) => {
        if (date >= startDate && this.state.habits.every(h => checks[h.id])) count++;
      });
      return count;
    }
    return 0;
  },

  checkSeasonQuestProgress(silent = false) {
    const q = this.state.rpg?.seasonQuests?.active;
    if (!q || q.completed) return;
    const current = this.computeSeasonQuestProgress();
    if (current >= q.target) {
      q.completed = true;
      q.completedDate = this.getDateKey(new Date());
      // Grant badge directly (avoid recursion — checkAllBadges called this)
      if (q.badgeId && !this.state.unlockedBadges[q.badgeId]) {
        this.state.unlockedBadges[q.badgeId] = q.completedDate;
      }
      this.addXP('quest', q.xpReward);
      if (!silent) {
        this.showToast(`🎉 Quête Saisonnière : ${q.emoji} ${q.label} accomplie ! (+${q.xpReward} XP)`);
      }
    }
  },

  updateSeasonQuestTarget(value) {
    const q = this.state.rpg?.seasonQuests?.active;
    if (!q || q.completed) return;
    const v = Math.max(1, Math.min(9999, parseInt(value) || 1));
    q.target = v;
    this.saveData();
    this.renderSeasonWidget();
  },

  checkSeasonTransition() {
    if (!this.state.rpg?.season?.current) return;
    const expectedId = this.getSeasonIdForDate(new Date());
    if (expectedId !== this.state.rpg.season.current.id) {
      // Snapshot de la saison qui se termine avant de la remplacer
      const oldSeason = { ...this.state.rpg.season.current };

      // Phase 5 — archiver la quête saisonnière terminée
      if (this.state.rpg.seasonQuests?.active) {
        const endedQuest = { ...this.state.rpg.seasonQuests.active };
        endedQuest.endedAt = this.getDateKey(new Date());
        this.state.rpg.seasonQuests.history = [
          ...(this.state.rpg.seasonQuests.history || []),
          endedQuest,
        ].slice(-8);
      }

      this.applySeasonTransition();

      // Phase 5 — créer la quête pour la nouvelle saison
      if (!this.state.rpg.seasonQuests) this.state.rpg.seasonQuests = { active: null, history: [] };
      this.state.rpg.seasonQuests.active = this.initSeasonalQuest();

      // Phase 4 — afficher le modal de fin de saison
      setTimeout(() => this.showSeasonEndModal(oldSeason), 800);
    }
  },

  // Archive la saison terminée, applique le bonus Héritage, et initialise la nouvelle saison
  applySeasonTransition() {
    const season = this.state.rpg.season;
    const old = { ...season.current };

    // Calcul du bonus Héritage (plafonné à +25% cumulé)
    const bonus = this.getHeritageBonus(old.rank);
    const newMultiplier = Math.min((old.xpMultiplier || 1.0) + bonus, 1.25);

    // Archiver (max 8 entrées — FIFO)
    const now = new Date();
    season.history.push({
      id: old.id,
      name: old.name,
      rank: old.rank,
      xpEarned: old.xp,
      endDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
      heritageBonus: bonus,
    });
    if (season.history.length > 8) season.history.shift();

    // Phase 4 — accorder le badge de rang saisonnier correspondant
    const rankBadgeMap = { 'Bronze': 'season-bronze', 'Argent': 'season-silver', 'Or': 'season-gold', 'Platine': 'season-platinum', 'Maître': 'season-master' };
    const badgeId = rankBadgeMap[old.rank];
    if (badgeId && !this.state.unlockedBadges[badgeId]) {
      this.state.unlockedBadges[badgeId] = this.getDateKey(now);
    }

    // Nouvelle saison
    const newSD = this.getCurrentSeason();
    season.current = {
      id: this.getSeasonIdForDate(now),
      name: newSD.name,
      startDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`,
      xp: 0,
      rank: 'Bronze',
      xpMultiplier: newMultiplier,
    };

    this.saveData();
  },

  // Modal récapitulatif de fin de saison (Phase 4)
  showSeasonEndModal(oldSeason) {
    const rankEmojis = { 'Bronze': '🥉', 'Argent': '🥈', 'Or': '🥇', 'Platine': '💎', 'Maître': '👑' };
    const rankEmoji = rankEmojis[oldSeason.rank] || '🏅';
    const bonusPct = Math.round(this.getHeritageBonus(oldSeason.rank) * 100);
    const newSd = this.getCurrentSeason();
    const overlay = document.getElementById('modalOverlay');
    const container = document.getElementById('modal');
    if (!overlay || !container) return;
    container.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">🌟 Fin de Saison</h2>
        <button class="modal-close" onclick="app.closeModal()">✕</button>
      </div>
      <div class="modal-body season-end-modal">
        <div class="season-end-icon">${rankEmoji}</div>
        <h3 class="season-end-rank">${oldSeason.name} — ${oldSeason.rank}</h3>
        <p class="season-end-xp">${Math.round(oldSeason.xp)} XP saisonnière accumulée</p>
        <div class="season-end-bonus">
          <span>Bonus Héritage obtenu :</span>
          <strong>+${bonusPct}% XP permanents</strong>
        </div>
        <p class="season-end-next">Prochaine saison : ${newSd.emoji} <strong>${newSd.name}</strong></p>
        <button class="btn btn-primary reward-btn" onclick="app.startNewSeason()">Commencer la nouvelle saison !</button>
      </div>
    `;
    overlay.classList.add('active');
  },

  // Ferme le modal de fin de saison et rafraîchit l'UI
  startNewSeason() {
    this.closeModal();
    this.updateSeasonIndicator();
    this.renderSeasonWidget();
    this.renderDashboard();
  },

  // Met à jour l'indicateur visuel de saison dans le banner
  updateSeasonIndicator() {
    const el = document.getElementById('seasonIndicator');
    if (!el) return;
    const season = this.state.rpg?.season?.current;
    if (!season) return;
    const sd = this.getCurrentSeason();
    const rankEmojis = { 'Bronze': '🥉', 'Argent': '🥈', 'Or': '🥇', 'Platine': '💎', 'Maître': '👑' };
    el.textContent = `${sd.emoji} ${season.name} · ${rankEmojis[season.rank] || ''} ${season.rank}`;
    el.title = `Saison ${season.name} — ${Math.round(season.xp)} XP saisonnière`;
    this.applySeasonTheme(sd.key);
  },

  // Injecte les variables CSS saisonnières directement sur :root (garantit leur disponibilité)
  // + ajoute la classe body.theme-X pour les règles CSS qui en ont besoin
  applySeasonTheme(seasonKey) {
    const palette = {
      spring: { accent: '#4ade80', bg: 'rgba(74, 222, 128, 0.12)',  border: 'rgba(74, 222, 128, 0.35)',  glow: 'rgba(74, 222, 128, 0.28)' },
      summer: { accent: '#fbbf24', bg: 'rgba(251, 191, 36, 0.12)',  border: 'rgba(251, 191, 36, 0.35)',  glow: 'rgba(251, 191, 36, 0.28)' },
      autumn: { accent: '#fb923c', bg: 'rgba(251, 146, 60, 0.12)',  border: 'rgba(251, 146, 60, 0.35)',  glow: 'rgba(251, 146, 60, 0.28)' },
      winter: { accent: '#60a5fa', bg: 'rgba(96, 165, 250, 0.12)',  border: 'rgba(96, 165, 250, 0.35)',  glow: 'rgba(96, 165, 250, 0.28)' },
    };
    const c = palette[seasonKey] || palette.spring;
    const root = document.documentElement;
    root.style.setProperty('--seasonal-accent', c.accent);
    root.style.setProperty('--seasonal-bg',     c.bg);
    root.style.setProperty('--seasonal-border', c.border);
    root.style.setProperty('--seasonal-glow',   c.glow);
    // Classe body pour les règles CSS ::before et éventuels overrides
    ['theme-spring','theme-summer','theme-autumn','theme-winter'].forEach(t => document.body.classList.remove(t));
    document.body.classList.add(`theme-${seasonKey}`);
  },

  // Utilitaire debug (console) : forcer une saison pour tester la transition
  // Usage : app.debugSetSeason('winter')
  debugSetSeason(key) {
    const sd = this.seasonData[key];
    if (!sd) { console.warn('[LifeFlow] Saison invalide. Valeurs : spring, summer, autumn, winter'); return; }
    const now = new Date();
    this.state.rpg.season.current.id   = `${key}-${now.getFullYear()}`;
    this.state.rpg.season.current.name = sd.name;
    this.state.rpg.season.current.startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    this.saveData();
    this.updateSeasonIndicator();
    this.applySeasonTheme(key);
    console.log('[LifeFlow] Saison forcée :', key, this.state.rpg.season.current);
  },

  // ============================================
  // SYNERGIES Planning ↔ Habitudes ↔ RPG (Phase 3)
  // ============================================

  // Valide automatiquement les habitudes liées au type du créneau validé (uniquement pour aujourd'hui)
  triggerHabitAnchor(slotType) {
    const category = this.SLOT_TYPE_TO_CATEGORY[slotType];
    if (!category) return;
    const linked = this.state.habits.filter(h => h.linkedSlotCategory === category);
    if (linked.length === 0) return;

    const today = this.getDateKey(new Date());
    if (!this.state.habitChecks[today]) this.state.habitChecks[today] = {};

    let count = 0;
    linked.forEach(habit => {
      if (!this.state.habitChecks[today][habit.id]) {
        this.state.habitChecks[today][habit.id] = true;
        this.state.habitChecks[today][`${habit.id}_auto`] = true; // marque l'auto-validation
        this.addXP('habit', this.xpRewards.habitChecked);         // XP saisonnière
        count++;
      }
    });

    if (count > 0) {
      this.showToast(`⚡ ${count} habitude${count > 1 ? 's' : ''} auto-validée${count > 1 ? 's' : ''} !`);
    }
  },

  // Met à jour la Luck du héros selon le taux de complétion des habitudes du jour (5–25)
  updateHeroLuck() {
    if (!this.state.rpg?.hero) return;
    const today = this.getDateKey(new Date());
    const checks = this.state.habitChecks[today] || {};
    const total = this.state.habits.length;
    if (total === 0) { this.state.rpg.hero.luck = 10; return; }
    const checked = this.state.habits.filter(h => checks[h.id]).length;
    this.state.rpg.hero.luck = Math.round(5 + (checked / total) * 20);
  },

  // Retourne la date de fin de la saison courante (1er jour de la saison suivante)
  getSeasonEndDate(date) {
    const month = date.getMonth();
    const year  = date.getFullYear();
    if (month >= 2 && month <= 4)  return new Date(year, 5, 1);   // Printemps → 1er Juin
    if (month >= 5 && month <= 7)  return new Date(year, 8, 1);   // Été → 1er Sept
    if (month >= 8 && month <= 10) return new Date(year, 11, 1);  // Automne → 1er Déc
    return month === 11 ? new Date(year + 1, 2, 1) : new Date(year, 2, 1); // Hiver → 1er Mars
  },

  // Affiche le widget Saison Actuelle dans le Dashboard
  renderSeasonWidget() {
    const el = document.getElementById('seasonWidget');
    if (!el) return;
    const season = this.state.rpg?.season?.current;
    if (!season) { el.innerHTML = ''; return; }

    const sd = this.getCurrentSeason();
    const rankEmojis  = { 'Bronze': '🥉', 'Argent': '🥈', 'Or': '🥇', 'Platine': '💎', 'Maître': '👑' };
    const rankColors  = { 'Bronze': '#cd7f32', 'Argent': '#c0c0c0', 'Or': '#ffd700', 'Platine': '#e5e4e2', 'Maître': '#f59e0b' };
    const rankXPRanges = {
      'Bronze':  { min: this.seasonLevelThresholds[0],  max: this.seasonLevelThresholds[5],  next: 'Argent'  },
      'Argent':  { min: this.seasonLevelThresholds[5],  max: this.seasonLevelThresholds[10], next: 'Or'      },
      'Or':      { min: this.seasonLevelThresholds[10], max: this.seasonLevelThresholds[15], next: 'Platine' },
      'Platine': { min: this.seasonLevelThresholds[15], max: this.seasonLevelThresholds[19], next: 'Maître'  },
      'Maître':  { min: this.seasonLevelThresholds[19], max: null, next: null },
    };

    const range   = rankXPRanges[season.rank] || rankXPRanges['Bronze'];
    const xpIn    = season.xp - range.min;
    const xpSpan  = range.max ? range.max - range.min : 1;
    const rankPct = range.max ? Math.min((xpIn / xpSpan) * 100, 100) : 100;
    const toNext  = range.max ? Math.max(0, range.max - season.xp) : 0;
    const color   = rankColors[season.rank] || '#cd7f32';

    const now = new Date();
    const daysLeft = Math.max(0, Math.ceil((this.getSeasonEndDate(now) - now) / 86400000));

    const bonusLabel = sd.bonusTypes
      .filter(t => t !== 'habit')
      .map(t => ({ run: 'Course', outdoor: 'Extérieur', japanese: 'Japonais', free: 'Lecture', discovery: 'Découverte', routine: 'Routine' })[t] || t)
      .join(' & ');
    const habitBonus = sd.bonusTypes.includes('habit') ? ' + Habitudes' : '';
    const heritageLabel = season.xpMultiplier > 1.0
      ? `🏛️ +${Math.round((season.xpMultiplier - 1.0) * 100)}% héritage`
      : null;
    const luck = this.state.rpg?.hero?.luck || 10;

    // ── Quête saisonnière active ──
    const sq = this.state.rpg?.seasonQuests?.active;
    let questHtml = '';
    if (sq) {
      const sqProgress = this.computeSeasonQuestProgress();
      const sqPct      = Math.min((sqProgress / sq.target) * 100, 100);
      const sqDone     = sq.completed;
      questHtml = `
        <div class="season-quest-card ${sqDone ? 'completed' : ''}">
          <div class="season-quest-header">
            <span class="season-quest-emoji">${sq.emoji}</span>
            <div style="flex:1">
              <div class="season-quest-title">${sq.label}</div>
              <div class="season-quest-sub">${sqDone ? '✅ Accomplie !' : `${sqProgress} / ${sq.target} ${sq.unit}`}</div>
            </div>
            <div class="season-quest-badge-preview" title="Badge récompense">${sq.emoji}</div>
          </div>
          <div class="season-quest-bar-wrap">
            <div class="season-quest-bar">
              <div class="season-quest-bar-fill" style="width:${sqPct}%"></div>
            </div>
            <span class="season-quest-pct">${Math.round(sqPct)}%</span>
          </div>
          ${!sqDone ? `
          <div class="season-quest-footer">
            <span style="font-size:0.75rem;color:var(--text-muted)">Objectif :</span>
            <input class="season-quest-input" type="number" min="1" max="9999" value="${sq.target}"
              onchange="app.updateSeasonQuestTarget(this.value)" />
            <span style="font-size:0.75rem;color:var(--text-muted)">${sq.unit}</span>
            <span style="margin-left:auto;font-size:0.75rem;color:var(--accent-purple)">+${sq.xpReward} XP</span>
          </div>` : `
          <div class="season-quest-footer">
            <span style="font-size:0.75rem;color:var(--accent-green)">🏅 Badge ${sq.emoji} débloqué !</span>
            <span style="margin-left:auto;font-size:0.75rem;color:var(--accent-purple)">+${sq.xpReward} XP accordés</span>
          </div>`}
        </div>
      `;
    }

    el.innerHTML = `
      <div class="season-widget-card">
        <div class="season-widget-header">
          <span class="season-widget-emoji">${sd.emoji}</span>
          <div style="flex:1">
            <div class="season-widget-title">Saison ${season.name}</div>
            <div class="season-widget-bonus">+15% XP : ${bonusLabel}${habitBonus}</div>
          </div>
          <div class="season-widget-rank-badge" style="color:${color}">
            ${rankEmojis[season.rank]} ${season.rank}
          </div>
        </div>
        <div class="season-widget-bar-label">
          <span>${Math.round(season.xp)} XP saisonnière</span>
          <span style="color:var(--text-muted)">${range.next ? `→ ${range.next} dans ${toNext} XP` : '👑 Rang max !'}</span>
        </div>
        <div class="season-widget-bar">
          <div class="season-widget-bar-fill" style="width:${rankPct}%; background:${color}"></div>
        </div>
        <div class="season-widget-footer">
          <span>⏳ ${daysLeft}j restants</span>
          <span>🎲 Luck héros : ${luck}/25</span>
          ${heritageLabel ? `<span>${heritageLabel}</span>` : ''}
          ${season.history?.length > 0 ? `<span>📜 ${season.history.length} saison${season.history.length > 1 ? 's' : ''} archivée${season.history.length > 1 ? 's' : ''}</span>` : ''}
        </div>
      </div>
      ${questHtml}
    `;
  },

  // ============================================
  // FOCUS TIMER — Méditation de Combat (Phase 3)
  // ============================================

  startFocusTimer() {
    if (this.state.rpg.focusActive) return;
    const phase = this.state.rpg.focusPhase || 'work';
    if (this.state.rpg.focusTimer <= 0) {
      this.state.rpg.focusTimer = phase === 'work' ? 25 * 60 : 5 * 60;
    }
    this.state.rpg.focusActive = true;
    this.saveData();
    this.focusInterval = setInterval(() => this.tickFocus(), 1000);
    this.renderFocusTimer();
  },

  stopFocusTimer() {
    if (!this.state.rpg.focusActive) return;
    clearInterval(this.focusInterval);
    this.focusInterval = null;
    this.state.rpg.focusActive = false;
    // Pénalité uniquement si interruption d'une session de travail
    if (this.state.rpg.focusPhase === 'work' && this.state.rpg.hero) {
      this.state.rpg.hero.hp = Math.max(1, (this.state.rpg.hero.hp || 100) - 5);
      this.showToast('💔 Concentration brisée ! −5 HP héros');
    }
    this.saveData();
    this.renderFocusTimer();
  },

  resetFocusTimer() {
    clearInterval(this.focusInterval);
    this.focusInterval = null;
    this.state.rpg.focusActive = false;
    this.state.rpg.focusPhase  = 'work';
    this.state.rpg.focusTimer  = 0;
    this.saveData();
    this.renderFocusTimer();
  },

  tickFocus() {
    if (!this.state.rpg.focusActive) { clearInterval(this.focusInterval); return; }
    this.state.rpg.focusTimer = Math.max(0, (this.state.rpg.focusTimer || 0) - 1);

    if (this.state.rpg.focusTimer <= 0) {
      clearInterval(this.focusInterval);
      this.focusInterval = null;

      if (this.state.rpg.focusPhase === 'work') {
        this.state.rpg.focusSessionsCompleted = (this.state.rpg.focusSessionsCompleted || 0) + 1;
        this.addXP('focus', 50); // +50 XP saisonnière par session complète
        this.showToast('🎯 Session complète ! +50 XP saisonnière · Pause méritée !');
        this.state.rpg.focusPhase = 'break';
        this.state.rpg.focusTimer = 5 * 60;
      } else {
        this.showToast('☕ Pause terminée ! Prêt pour un nouveau round ?');
        this.state.rpg.focusPhase = 'work';
        this.state.rpg.focusTimer = 25 * 60;
      }
      this.state.rpg.focusActive = false;
      this.saveData();
      this.renderSeasonWidget();
    }
    this.renderFocusTimer();
  },

  renderFocusTimer() {
    const el = document.getElementById('focusTimerUI');
    if (!el) return;
    const active   = this.state.rpg.focusActive;
    const phase    = this.state.rpg.focusPhase  || 'work';
    const sessions = this.state.rpg.focusSessionsCompleted || 0;
    const hp       = this.state.rpg.hero?.hp    || 100;
    const hpMax    = this.state.rpg.hero?.hpMax || 100;

    const defaultTime = phase === 'work' ? 25 * 60 : 5 * 60;
    const remaining   = this.state.rpg.focusTimer > 0 ? this.state.rpg.focusTimer : defaultTime;
    const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
    const secs = String(remaining % 60).padStart(2, '0');

    const phaseLabel = phase === 'work' ? '🧠 Concentration (25 min)' : '☕ Pause (5 min)';
    const phaseColor = phase === 'work' ? 'var(--accent-purple)' : 'var(--accent-green)';
    const hpPct      = Math.round((hp / hpMax) * 100);
    const hpColor    = hp > 50 ? 'var(--accent-green)' : hp > 20 ? 'var(--accent-orange)' : 'var(--accent-pink)';

    const statusEl = document.getElementById('focusStatus');
    if (statusEl) statusEl.textContent = active ? (phase === 'work' ? '⚔️ Combat actif' : '☕ Pause') : 'Inactif';

    el.innerHTML = `
      <div class="focus-body">
        <div class="focus-phase-label" style="color:${phaseColor}">${phaseLabel}</div>
        <div class="focus-timer-display">${mins}:${secs}</div>
        <div class="focus-hp-bar">
          <div class="focus-hp-label"><span>❤️ HP Héros</span><span>${hp}/${hpMax}</span></div>
          <div class="focus-bar-track">
            <div class="focus-bar-fill" style="width:${hpPct}%; background:${hpColor}"></div>
          </div>
        </div>
        <div class="focus-controls">
          ${!active
            ? `<button class="btn btn-primary" onclick="app.startFocusTimer()">▶ Démarrer</button>`
            : `<button class="btn focus-btn-stop" onclick="app.stopFocusTimer()">⏹ Interrompre</button>`}
          <button class="btn" onclick="app.resetFocusTimer()">↺ Reset</button>
        </div>
        <div class="focus-sessions">
          Sessions : ${sessions} ${sessions > 0 ? '🎯'.repeat(Math.min(sessions, 5)) : '—'}
          ${active && phase === 'work' ? '<span class="focus-warning">⚠️ Interrompre = −5 HP</span>' : ''}
        </div>
      </div>
    `;
  },

  // ============================================
  // SLOT VALIDATION (Phase 1)
  // ============================================

  // Retourne true si le slot correspond à la plage horaire actuelle (aujourd'hui)
  isCurrentTimeSlot(slotKey) {
    const now = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    const ranges = {
      morning:  [7 * 60,       8 * 60 + 30],
      day:      [9 * 60,       18 * 60],
      evening1: [18 * 60 + 30, 20 * 60],
      evening2: [20 * 60,      21 * 60 + 30],
      evening3: [21 * 60 + 30, 23 * 60],
    };
    const r = ranges[slotKey];
    return r ? mins >= r[0] && mins < r[1] : false;
  },

  validateSlot(weekKey, slotKey) {
    // Chercher le slot comme renderPlanning : weekPlannings d'abord, sinon template
    const planning = this.state.weekPlannings[weekKey]
      || this.templates[this.state.currentTemplate]?.slots
      || this.templates.work.slots;
    const slot = planning[slotKey];
    if (!slot) return;
    // S'assurer que la semaine existe dans weekPlannings pour pouvoir sauvegarder
    if (!this.state.weekPlannings[weekKey]) {
      this.state.weekPlannings[weekKey] = { ...planning };
    }

    if (!this.state.slotValidations[weekKey]) this.state.slotValidations[weekKey] = {};
    const alreadyValidated = !!this.state.slotValidations[weekKey][slotKey];

    if (alreadyValidated) {
      // Toggle off — annuler la validation
      delete this.state.slotValidations[weekKey][slotKey];
      this.updatePlanningStreak();
      this.saveData();
      this.renderPlanning();
      this.renderVisualCalendar();
      this.showToast('↩️ Validation annulée');
      return;
    }

    // Enregistrer la validation
    this.state.slotValidations[weekKey][slotKey] = { validatedAt: new Date().toISOString() };

    // Phase 2 — XP saisonnière pour la validation du créneau
    this.addXP(slot.type, this.slotSeasonXP[slot.type] || 5);

    // Auto-log modal si créneau sport (sans écraser le log existant)
    if (['run', 'strength', 'outdoor'].includes(slot.type)) {
      // Extraire la date du slotKey (ex: "mon-morning" dans weekKey "2026-W11")
      const dayKeys = ['mon','tue','wed','thu','fri','sat','sun'];
      const dayPart = slotKey.split('-')[0];
      const dayIdx = dayKeys.indexOf(dayPart);
      if (dayIdx !== -1) {
        const dates = this.getWeekDates(this.state.currentWeekOffset);
        const slotDate = dates[dayIdx];
        const dateKey = this.getDateKey(slotDate);
        this.openSportLogModal(dateKey, slot);
      }
    }

    // Phase 3 — ancrage automatique de l'habitude liée au type du créneau
    this.triggerHabitAnchor(slot.type);

    this.updatePlanningStreak();
    this.saveData();
    this.renderPlanning();
    this.renderHabits();        // Phase 3 — rafraîchir si habitude auto-validée
    this.renderVisualCalendar();
    this.recalculateXP();
    this.checkAllBadges();
    this.showToast('✅ Créneau validé !');
  },

  openSportLogModal(dateKey, slot) {
    const existing = this.state.logs[dateKey] || {};
    const hasExistingKm = existing.km && existing.km > 0;

    document.getElementById('modalTitle').textContent = `🏃 Logger l'activité — ${slot.label || slot.type}`;
    document.getElementById('modalBody').innerHTML = `
      ${hasExistingKm ? `<div style="background:rgba(245,158,11,0.15);border:1px solid var(--accent-orange);border-radius:8px;padding:8px 12px;margin-bottom:12px;font-size:0.85rem;">
        ⚠️ Un log existe déjà pour ce jour (${existing.km} km). Les valeurs seront ajoutées au log existant.
      </div>` : ''}
      <div class="form-group">
        <label>Distance (km)</label>
        <input type="number" class="form-input" id="sportLogKm" step="0.1" min="0" placeholder="0.0" value="">
      </div>
      <div class="form-group">
        <label>Dénivelé positif (m)</label>
        <input type="number" class="form-input" id="sportLogDplus" step="1" min="0" placeholder="0" value="">
      </div>
    `;
    document.getElementById('modalFooter').innerHTML = `
      <button class="btn" onclick="app.closeModal()">Passer</button>
      <button class="btn btn-primary" onclick="app.saveSportLog('${dateKey}', ${hasExistingKm})">💾 Enregistrer</button>
    `;
    this.openModal();
  },

  saveSportLog(dateKey, additive) {
    const km    = parseFloat(document.getElementById('sportLogKm').value) || 0;
    const dplus = parseFloat(document.getElementById('sportLogDplus').value) || 0;
    if (km === 0 && dplus === 0) { this.closeModal(); return; }

    if (!this.state.logs[dateKey]) this.state.logs[dateKey] = {};
    if (additive) {
      this.state.logs[dateKey].km    = (this.state.logs[dateKey].km    || 0) + km;
      this.state.logs[dateKey].dplus = (this.state.logs[dateKey].dplus || 0) + dplus;
    } else {
      this.state.logs[dateKey].km    = km;
      this.state.logs[dateKey].dplus = dplus;
      this.state.logs[dateKey].saved = true;
    }
    this.saveData();
    this.recalculateXP();
    this.updateRecords();
    this.checkAllBadges();
    this.renderDashboard();
    this.closeModal();
    this.showToast(`✅ ${km} km + ${dplus}m D+ enregistrés`);
  },

  // Recalcule le nombre de jours consécutifs avec ≥3 créneaux validés
  updatePlanningStreak() {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const validatedCount = this.getValidatedSlotsForDay(d);

      if (validatedCount >= 3) {
        streak++;
      } else if (i === 0) {
        // Jour en cours pas encore validé — on continue en arrière
        continue;
      } else {
        break;
      }
    }
    this.state.planningStreak = streak;
  },

  // Compte le nombre de créneaux validés pour un jour donné (objet Date)
  getValidatedSlotsForDay(date) {
    const weekKey = this.getWeekKey(date);
    const dayKeys = ['mon','tue','wed','thu','fri','sat','sun'];
    const jsDay = date.getDay(); // 0=dim, 1=lun...
    const dayIdx = jsDay === 0 ? 6 : jsDay - 1;
    const dayKey = dayKeys[dayIdx];
    const slotSuffixes = ['morning','day','evening1','evening2','evening3'];
    const validations = this.state.slotValidations[weekKey] || {};
    return slotSuffixes.filter(s => validations[`${dayKey}-${s}`]).length;
  },

  // True si ≥80% des habitudes sont cochées ET ≥3 créneaux validés
  isPerfectDay(dateKey) {
    const habits = this.state.habitChecks[dateKey] || {};
    const total = this.state.habits.length;
    if (total === 0) return false;
    const checked = this.state.habits.filter(h => habits[h.id]).length;
    const habitPct = checked / total;

    const d = new Date(dateKey);
    const slotCount = this.getValidatedSlotsForDay(d);

    return habitPct >= 0.8 && slotCount >= 3;
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
      const accentColor = `var(${habit.color || '--accent-orange'})`;

      return `
        <div class="habit-card" style="--habit-accent: ${accentColor}">
          <div class="habit-header">
            <div class="habit-name">${habit.name}</div>
            <div class="habit-header-right">
              <div class="habit-streak">
                ${streak >= 3 ? '🔥' : '📊'} ${streak}j
              </div>
              <div class="habit-actions">
                <button class="habit-action-btn" onclick="app.openEditHabitModal('${habit.id}')" title="Modifier">✏️</button>
                <button class="habit-action-btn habit-action-delete" onclick="app.deleteHabit('${habit.id}')" title="Supprimer">🗑️</button>
              </div>
            </div>
          </div>
          <div class="habit-week">
            ${dates.map((d, i) => {
        const key = this.getDateKey(d);
        const isChecked = this.state.habitChecks[key]?.[habit.id] || false;
        const isAuto = this.state.habitChecks[key]?.[`${habit.id}_auto`] || false;
        const isToday = key === today;
        const isPast = d < new Date() && !isToday;
        return `
                <div class="habit-day ${isToday ? 'today' : ''}">
                  <span class="day-label">${this.getDayAbbr(i)}</span>
                  <button class="check-btn ${isChecked ? 'checked' : (isPast && !isChecked ? 'missed' : '')}"
                    onclick="app.toggleHabit('${key}', '${habit.id}')"
                    id="habit-${habit.id}-${key}">
                    ${isChecked ? (isAuto ? '⚡' : '✓') : (isPast ? '✕' : '')}
                  </button>
                </div>
              `;
      }).join('')}
          </div>
        </div>
      `;
    }).join('');

    this.renderVisualCalendar();
  },

  toggleHabit(dateKey, habitId) {
    if (!this.state.habitChecks[dateKey]) {
      this.state.habitChecks[dateKey] = {};
    }
    const newValue = !this.state.habitChecks[dateKey][habitId];
    this.state.habitChecks[dateKey][habitId] = newValue;
    // Phase 2 — XP saisonnière uniquement lors du cochage (pas du décochage)
    if (newValue) this.addXP('habit', this.xpRewards.habitChecked);
    // Phase 3 — mettre à jour la Luck du héros selon le taux de complétion du jour
    this.updateHeroLuck();
    this.saveData();
    this.recalculateXP();
    this.checkWeeklyQuests();
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

  changeCalendarMonth(offset) {
    this.state.calendarOffset += offset;
    this.renderVisualCalendar();
  },

  calculateCurrentStreak() {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // On recule jour par jour pour voir s'il y a de l'activité.
    for (let i = 0; i < 365 * 5; i++) { // Vérifie sur grand max 5 ans
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = this.getDateKey(d);

      const log = this.state.logs[key];
      const habits = this.state.habitChecks[key];

      let hasActivity = false;
      if (log && ((log.km && log.km > 0) || (log.japanese && log.japanese > 0) || log.saved)) {
        hasActivity = true;
      }
      if (habits && Object.values(habits).some(v => v === true)) {
        hasActivity = true;
      }

      if (hasActivity) {
        streak++;
      } else if (i === 0) {
        // C'est possible que la journée d'aujourd'hui ne soit pas encore remplie. On continue au jour d'avant.
        continue;
      } else {
        // La chaîne est brisée
        break;
      }
    }
    return streak;
  },

  showDayDetailsModal(dateKey) {
    const log = this.state.logs[dateKey] || {};
    const habits = this.state.habitChecks[dateKey] || {};

    // Check habits done
    const habitsListHTML = this.state.habits.map(h => {
      const done = habits[h.id] ? '✅' : '❌';
      return `<div style="font-size: 0.85rem; padding: 4px 0; border-bottom: 1px solid var(--border-glass)">${done} ${h.name}</div>`;
    }).join('');

    const runIcon = log.km > 0 ? '🏃' : '🛌';
    const jpIcon = log.japanese > 0 ? '🇯🇵' : '🤷';

    // Phase 4 — résumé narratif en haut du modal
    const narrative = this._generateDayNarrative(log, habits);

    document.getElementById('modalTitle').textContent = `📅 Résumé du ${dateKey}`;
    document.getElementById('modalBody').innerHTML = `
      ${narrative ? `<div class="day-narrative">${narrative}</div>` : ''}
      <div style="display: flex; gap: var(--space-md); margin-bottom: var(--space-md);">
        <div class="card" style="flex: 1; text-align: center; padding: var(--space-sm);">
          <div style="font-size: 1.5rem;">${runIcon}</div>
          <div style="font-weight: bold;">${log.km || 0} km</div>
          <div style="font-size: 0.7rem; color: var(--text-muted)">+${log.dplus || 0}m D+</div>
        </div>
        <div class="card" style="flex: 1; text-align: center; padding: var(--space-sm);">
          <div style="font-size: 1.5rem;">${jpIcon}</div>
          <div style="font-weight: bold;">${log.japanese || 0} min</div>
        </div>
      </div>
      <div style="margin-bottom: var(--space-md);">
        <strong>📝 Journal du soir:</strong> ${log.saved ? 'Rempli' : 'Vide'} <br/>
        <strong>🎭 Humeur:</strong> ${log.mood || '?'}⭐ | <strong>💤 Sommeil:</strong> ${log.sleep || '?'}⭐
      </div>
      <div>
        <strong>✅ Habitudes:</strong>
        <div style="margin-top: 8px;">
           ${habitsListHTML || '<div style="font-size: 0.85rem; color: var(--text-muted);">Aucune habitude suivie</div>'}
        </div>
      </div>
    `;
    document.getElementById('modalFooter').innerHTML = `
      <button class="btn btn-primary" onclick="app.closeModal()">Fermer</button>
    `;
    this.openModal();
  },

  // Génère un court résumé narratif de la journée liant les exploits réels aux exploits RPG
  _generateDayNarrative(log, habits) {
    const heroLvl = this.state.rpg?.hero?.lvl || 1;
    const lines = [];

    const checkedCount = this.state.habits.filter(h => habits[h.id]).length;
    const totalHabits  = this.state.habits.length;
    const isPerfect    = totalHabits > 0 && checkedCount === totalHabits;

    if (isPerfect) {
      lines.push(`⚔️ Journée Parfaite ! Le héros (niv.${heroLvl}) affronte les boss avec toutes ses forces.`);
    } else if (checkedCount > 0) {
      lines.push(`🛡️ ${checkedCount}/${totalHabits} habitude${checkedCount > 1 ? 's' : ''} accomplie${checkedCount > 1 ? 's' : ''} — le héros gagne en endurance.`);
    }

    if (log.km > 0) {
      const dplusStr = log.dplus > 0 ? ` (+${log.dplus}m D+)` : '';
      lines.push(`🏃 ${log.km} km courus${dplusStr} — l'ATK du héros grimpe en flèche !`);
    }

    if (log.japanese > 0) {
      lines.push(`🇯🇵 ${log.japanese} min de japonais — sagesse et concentration renforcées.`);
    }

    if (log.mood >= 4) {
      lines.push(`✨ Excellente humeur (${log.mood}⭐) — la Luck héros est au maximum.`);
    } else if (log.mood && log.mood <= 2) {
      lines.push(`😔 Journée difficile (${log.mood}⭐) — mais le héros tient bon.`);
    }

    if (lines.length === 0) return '';
    return lines.join('<br>');
  },

  renderVisualCalendar() {
    const calendarEl = document.getElementById('visualCalendar');
    const monthLabelEl = document.getElementById('calendarMonthLabel');
    const streakCountEl = document.getElementById('streakCount');

    if (!calendarEl) return;

    // 1. Update Streak
    const currentStreak = this.calculateCurrentStreak();
    if (streakCountEl) {
      streakCountEl.textContent = `${currentStreak} Jour${currentStreak > 1 ? 's' : ''}`;
    }

    // 2. Determine target month
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() + this.state.calendarOffset);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    if (monthLabelEl) {
      monthLabelEl.textContent = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    }

    // 3. Calendar calculations
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    // JS getDay() returns 0 for Sunday, 1 for Monday. Convert to Monday-first (0-6)
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6; // Sunday becomes 6

    const todayDateKey = this.getDateKey(new Date());

    // 4. Build Header
    const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    let html = `<div class="calendar-header">
      ${weekDays.map(d => `<div>${d}</div>`).join('')}
    </div><div class="calendar-grid">`;

    // 5. Empty padding before first day
    for (let i = 0; i < startDayOfWeek; i++) {
      html += `<div class="calendar-day empty"></div>`;
    }

    // 6. Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const key = this.getDateKey(d);
      const isToday = key === todayDateKey;

      const log = this.state.logs[key] || {};
      const habits = this.state.habitChecks[key] || {};

      // Compute dots
      const hasRun = log.km && log.km > 0;
      const hasJp = log.japanese && log.japanese > 0;
      const hasJournal = log.saved === true;

      const checkedHabits = Object.values(habits).filter(v => v === true).length;
      const hasHabits = checkedHabits > 0;
      const isPerfectDay = this.isPerfectDay(key);

      const getStickerStyle = (seed) => {
          let hash = 0;
          for (let i = 0; i < seed.length; i++) {
              hash = ((hash << 5) - hash) + seed.charCodeAt(i);
              hash |= 0;
          }
          const r1 = Math.abs(Math.sin(hash)) * 2 - 1;
          const r2 = Math.abs(Math.cos(hash)) * 2 - 1;
          const r3 = Math.abs(Math.sin(hash * 2)) * 2 - 1;
          
          const rot = r1 * 30; // -30 to 30 deg
          const tx = r2 * 6; // -6px to 6px
          const ty = r3 * 6; // -6px to 6px
          return `transform: translate(${tx}px, ${ty}px) rotate(${rot}deg);`;
      };

      let dotsHtml = '';
      if (hasRun) dotsHtml += `<div class="day-dot dot-run" title="Course" style="${getStickerStyle(key+'run')}"></div>`;
      if (hasJp) dotsHtml += `<div class="day-dot dot-japanese" title="Japonais" style="${getStickerStyle(key+'jp')}"></div>`;
      if (hasJournal) dotsHtml += `<div class="day-dot dot-log" title="Journal" style="${getStickerStyle(key+'log')}"></div>`;
      // Gommettes colorées par habitude (Phase 0)
      this.state.habits.forEach((habit) => {
        const checked = this.state.habitChecks[key]?.[habit.id];
        if (checked) {
          const color = `var(${habit.color || '--accent-orange'})`;
          dotsHtml += `<div class="day-dot" title="${habit.name}" style="background:${color}; ${getStickerStyle(key + habit.id)}"></div>`;
        }
      });

      const hasActivity = hasRun || hasJp || hasJournal || hasHabits;

      // Phase 4 — badge héros niveau sur les Perfect Days
      const heroLvl = this.state.rpg?.hero?.lvl || 1;
      const heroBadge = isPerfectDay ? `<div class="day-hero-badge" title="Héros niv.${heroLvl}">⚔️</div>` : '';

      html += `
        <div class="calendar-day ${isToday ? 'today' : ''} ${isPerfectDay ? 'perfect' : ''} ${hasActivity ? 'has-activity' : ''} month-${month}"
             onclick="app.showDayDetailsModal('${key}')"
             title="${isPerfectDay ? '⭐ Journée Parfaite ! Héros niv.' + heroLvl : 'Clique pour les détails'}">
          <div class="calendar-date">${day}</div>
          ${heroBadge}
          <div class="day-dots">
            ${dotsHtml}
          </div>
        </div>
      `;
    }

    html += `</div>`;
    calendarEl.innerHTML = html;
  },

  _habitFormHTML(habit = null) {
    const colors = [
      { var: '--accent-orange', label: 'Orange' },
      { var: '--accent-blue',   label: 'Bleu'   },
      { var: '--accent-purple', label: 'Violet' },
      { var: '--accent-green',  label: 'Vert'   },
      { var: '--accent-cyan',   label: 'Cyan'   },
      { var: '--accent-pink',   label: 'Rose'   },
    ];
    const categories = [
      { val: null,        label: '— Aucune liaison —' },
      { val: 'sport',     label: '🏃 Sport'           },
      { val: 'study',     label: '📚 Étude'           },
      { val: 'routine',   label: '🔄 Routine'         },
      { val: 'discovery', label: '🌟 Découverte'      },
      { val: 'leisure',   label: '🎮 Loisir'          },
      { val: 'work',      label: '💼 Travail'         },
    ];
    const selectedColor = habit?.color || '--accent-orange';
    const selectedCat   = habit?.linkedSlotCategory ?? null;
    return `
      <div class="form-group">
        <label>Nom de l'habitude</label>
        <input type="text" class="form-input" id="habitFormName" placeholder="Ex: 🧘 Méditation 10 min" value="${habit?.name || ''}">
      </div>
      <div class="form-group">
        <label>Couleur</label>
        <div class="habit-color-picker">
          ${colors.map(c => `
            <button type="button" class="color-swatch ${selectedColor === c.var ? 'selected' : ''}"
              style="background: var(${c.var})"
              data-color="${c.var}"
              title="${c.label}"
              onclick="app.selectHabitColor(this)">
            </button>
          `).join('')}
        </div>
        <input type="hidden" id="habitFormColor" value="${selectedColor}">
      </div>
      <div class="form-group">
        <label>Lier à un type d'activité (planning)</label>
        <select class="form-input" id="habitFormCategory">
          ${categories.map(c => `<option value="${c.val ?? ''}" ${selectedCat === c.val ? 'selected' : ''}>${c.label}</option>`).join('')}
        </select>
      </div>
    `;
  },

  selectHabitColor(btn) {
    document.querySelectorAll('#modalBody .color-swatch').forEach(s => s.classList.remove('selected'));
    btn.classList.add('selected');
    document.getElementById('habitFormColor').value = btn.dataset.color;
  },

  openAddHabitModal() {
    document.getElementById('modalTitle').textContent = '➕ Nouvelle habitude';
    document.getElementById('modalBody').innerHTML = this._habitFormHTML();
    document.getElementById('modalFooter').innerHTML = `
      <button class="btn" onclick="app.closeModal()">Annuler</button>
      <button class="btn btn-primary" onclick="app.addHabit()">➕ Ajouter</button>
    `;
    this.openModal();
  },

  addHabit() {
    const name = document.getElementById('habitFormName').value.trim();
    if (!name) return;
    const color = document.getElementById('habitFormColor').value || '--accent-orange';
    const catVal = document.getElementById('habitFormCategory').value;
    const linkedSlotCategory = catVal === '' ? null : catVal;
    const id = 'hab-' + Date.now();
    this.state.habits.push({ id, name, icon: '✅', frequency: 'daily', color, linkedSlotCategory });
    this.saveData();
    this.renderHabits();
    this.closeModal();
    this.showToast(`✅ Habitude "${name}" ajoutée`);
  },

  openEditHabitModal(habitId) {
    const habit = this.state.habits.find(h => h.id === habitId);
    if (!habit) return;
    document.getElementById('modalTitle').textContent = '✏️ Modifier l\'habitude';
    document.getElementById('modalBody').innerHTML = this._habitFormHTML(habit);
    document.getElementById('modalFooter').innerHTML = `
      <button class="btn" onclick="app.closeModal()">Annuler</button>
      <button class="btn btn-primary" onclick="app.saveHabitEdit('${habitId}')">💾 Sauvegarder</button>
    `;
    this.openModal();
  },

  saveHabitEdit(habitId) {
    const habit = this.state.habits.find(h => h.id === habitId);
    if (!habit) return;
    const name = document.getElementById('habitFormName').value.trim();
    if (!name) return;
    const color = document.getElementById('habitFormColor').value || '--accent-orange';
    const catVal = document.getElementById('habitFormCategory').value;
    habit.name = name;
    habit.color = color;
    habit.linkedSlotCategory = catVal === '' ? null : catVal;
    // id conservé → les streaks restent valides
    this.saveData();
    this.renderHabits();
    this.closeModal();
    this.showToast(`✅ Habitude modifiée`);
  },

  deleteHabit(habitId) {
    const habit = this.state.habits.find(h => h.id === habitId);
    if (!habit) return;
    document.getElementById('modalTitle').textContent = '🗑️ Supprimer l\'habitude';
    document.getElementById('modalBody').innerHTML = `
      <p style="text-align:center; padding: 1rem 0">Supprimer <strong>${habit.name}</strong> ?<br>
      <span style="font-size:0.85rem; opacity:0.7">L'historique de cette habitude sera également effacé.</span></p>
    `;
    document.getElementById('modalFooter').innerHTML = `
      <button class="btn" onclick="app.closeModal()">Annuler</button>
      <button class="btn" style="background:var(--accent-pink);color:#fff" onclick="app.confirmDeleteHabit('${habitId}')">🗑️ Supprimer</button>
    `;
    this.openModal();
  },

  confirmDeleteHabit(habitId) {
    this.state.habits = this.state.habits.filter(h => h.id !== habitId);
    // Nettoyer habitChecks
    Object.keys(this.state.habitChecks).forEach(dateKey => {
      if (this.state.habitChecks[dateKey]) {
        delete this.state.habitChecks[dateKey][habitId];
        delete this.state.habitChecks[dateKey][`${habitId}_auto`];
      }
    });
    this.saveData();
    this.renderHabits();
    this.closeModal();
    this.showToast(`🗑️ Habitude supprimée`);
  },

  // ============================================
  // CONFIG
  // ============================================
  saveConfig() {
    const fields = ['name', 'wakeTime', 'bedTime', 'workEnd', 'weeklyKm', 'runningSessions', 'weeklyDplus', 'japaneseWords', 'maxScreentime', 'discoveries', 'monthGoal', 'notes', 'stravaClientId', 'stravaClientSecret', 'polarClientId', 'polarClientSecret', 'polarProxyUrl'];
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
    this.updateStravaStatus();
    this.updatePolarStatus();
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
      // Bonus Perfect Day (Phase 1) : ≥80% habitudes + ≥3 créneaux validés
      if (this.isPerfectDay(dateKey)) { xp += r.perfectPlanningDay; }
    });

    // XP from discoveries
    Object.values(this.state.discoveryAccepted).forEach(arr => {
      xp += (arr.length || 0) * r.discoveryTried;
    });

    // XP from badges
    xp += Object.keys(this.state.unlockedBadges).length * r.badgeUnlocked;

    // XP from quests
    Object.values(this.state.questCompleted || {}).forEach(arr => {
        arr.forEach(questId => {
            const allQuests = [...this.habitQuestPool, ...this.specialQuestPool];
            const q = allQuests.find(poolQ => poolQ.id === questId);
            if (q) xp += q.xp;
        });
    });

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

  checkAllBadges(silent = false) {
    const logs = this.state.logs;
    const rec = this.state.records;
    const weekLogs = this.getWeekLogs();
    const weekKm = weekLogs.reduce((s, l) => s + (l?.km || 0), 0);
    const weekDplus = weekLogs.reduce((s, l) => s + (l?.dplus || 0), 0);
    const runningSessions = weekLogs.filter(l => l?.km > 0).length;
    const japStreak = this.calculateStreak('japanese');
    const weekScore = this.getCurrentWeekScore();

    // Total discoveries
    let totalDisc = 0;
    Object.values(this.state.discoveryAccepted).forEach(arr => totalDisc += arr.length);

    // Total quests
    let totalQuests = 0;
    let perfectQuestWeeks = 0;
    let hasAnyQuest = false;
    Object.values(this.state.questCompleted || {}).forEach(arr => {
      totalQuests += arr.length;
      if (arr.length > 0) hasAnyQuest = true;
      if (arr.length >= 3) perfectQuestWeeks++;
    });

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

    // ── Données supplémentaires pour nouveaux badges ──
    const totalLogs    = Object.keys(logs).length;
    const weekJap      = weekLogs.reduce((s, l) => s + (l?.japanese || 0), 0);
    const moodDays     = Object.values(logs).filter(l => l.mood > 0).length;
    const focusDone    = this.state.rpg?.focusSessionsCompleted || 0;
    const activeHabits = this.state.habits.length;

    // ── Additive badge system: only ADD to existing unlockedBadges, never wipe ──
    // This means cloud sync or any timing issue can never cause a badge to "disappear".
    if (!this.state.unlockedBadges) this.state.unlockedBadges = {};
    const badges = this.state.unlockedBadges;
    const today = this.getDateKey(new Date());
    const newlyGranted = [];  // track which badges are granted THIS call (for toasts)

    // Helper: add badge if condition met AND not yet earned. Never removes (except level badges below).
    const grant = (id, condition) => {
      if (condition && !badges[id]) {
        badges[id] = today;
        newlyGranted.push(id);
      }
    };

    // ── Quick badges ──
    grant('first-run', hasAnyRun);
    grant('first-quest', hasAnyQuest);
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
    grant('10-quests', totalQuests >= 10);
    grant('perfect-week-quests', perfectQuestWeeks >= 1);
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

    // ── Long badges ──
    grant('streak-60-jap', japStreak >= 60);
    grant('streak-90-jap', japStreak >= 90);
    grant('500km-total', rec.totalKm >= 500);
    grant('50-quests', totalQuests >= 50);
    grant('1000km-total', rec.totalKm >= 1000);
    grant('5000m-dplus', rec.totalDplus >= 5000);
    grant('10000m-dplus', rec.totalDplus >= 10000);
    grant('80km-week', weekKm >= 80);
    grant('25-discoveries', totalDisc >= 25);
    grant('habits-100-month', habitPerfectStreak >= 30);
    grant('500-jap-min', rec.totalJapMinutes >= 500);

    // ── Epic badges ──
    grant('streak-180-jap', japStreak >= 180);
    grant('streak-365-jap', japStreak >= 365);
    grant('2000km-total', rec.totalKm >= 2000);
    grant('5000km-total', rec.totalKm >= 5000);
    grant('50000m-dplus', rec.totalDplus >= 50000);
    grant('50-discoveries', totalDisc >= 50);
    grant('1000-jap-min', rec.totalJapMinutes >= 1000);

    // ── Badges saisonniers (accordés selon le rang atteint dans l'historique) ──
    const rankOrder = ['Bronze', 'Argent', 'Or', 'Platine', 'Maître'];
    const seasonHistory = this.state.rpg?.season?.history || [];
    let highestRankIdx = -1;
    seasonHistory.forEach(s => {
      const idx = rankOrder.indexOf(s.rank);
      if (idx > highestRankIdx) highestRankIdx = idx;
    });
    if (highestRankIdx >= 0) grant('season-bronze',   true);
    if (highestRankIdx >= 1) grant('season-silver',   true);
    if (highestRankIdx >= 2) grant('season-gold',     true);
    if (highestRankIdx >= 3) grant('season-platinum', true);
    if (highestRankIdx >= 4) grant('season-master',   true);

    // ── Badges thématiques 🌿 Printemps ──
    grant('spring-curious',  totalDisc >= 3);
    grant('spring-growth',   totalDisc >= 7);
    grant('spring-garden',   activeHabits >= 3);
    grant('spring-bloom',    todayAllChecked);

    // ── Badges thématiques ☀️ Été ──
    grant('summer-warmup',   weekKm >= 20);
    grant('summer-altitude', weekDplus >= 2000);
    grant('summer-century',  rec.totalKm >= 300);
    grant('summer-beast',    fourSessionWeeks >= 3);

    // ── Badges thématiques 🍂 Automne ──
    grant('autumn-leaf',     weekJap >= 30);
    grant('autumn-owl',      moodDays >= 10);
    grant('autumn-harvest',  totalLogs >= 20);
    grant('autumn-scholar',  rec.totalJapMinutes >= 200);

    // ── Badges thématiques ❄️ Hiver ──
    grant('winter-spark',    focusDone >= 1);
    grant('winter-will',     focusDone >= 5);
    grant('winter-fortress', this.state.planningStreak >= 3);
    grant('winter-iron',     habitPerfectStreak >= 10);

    // ── Badges Planning ──
    grant('planner-1',       this.state.planningStreak >= 1);
    grant('planner-5',       this.state.planningStreak >= 5);

    // ── Badges Focus ──
    grant('focus-first',     focusDone >= 1);
    grant('focus-10',        focusDone >= 10);
    grant('focus-50',        focusDone >= 50);

    // ── Badges Journal & Bien-être ──
    grant('log-20',          totalLogs >= 20);
    grant('log-50',          totalLogs >= 50);
    grant('mood-tracker',    moodDays >= 7);

    // ── Badges Polyvalence ──
    const firstBadgesDone = ['first-run','first-japanese','first-habit','first-discovery'].every(id => badges[id]);
    grant('all-rounder',     firstBadgesDone);
    grant('perfect-3',       habitPerfectStreak >= 3);

    // ── Phase RPG — Badges RPG ──
    this.checkRPGBadges();

    // ── Phase 5 — Quêtes Saisonnières : vérifier complétion + accorder badge ──
    this.checkSeasonQuestProgress(silent);
    const sqHistory = this.state.rpg?.seasonQuests?.history || [];
    const sqActive  = this.state.rpg?.seasonQuests?.active;
    const completedSeasons = new Set([
      ...sqHistory.filter(q => q.completed).map(q => q.season),
      ...(sqActive?.completed ? [sqActive.season] : []),
    ]);
    grant('quest-spring', completedSeasons.has('spring'));
    grant('quest-summer', completedSeasons.has('summer'));
    grant('quest-autumn', completedSeasons.has('autumn'));
    grant('quest-winter', completedSeasons.has('winter'));

    // ── Level badges: recalculate XP/level first, then grant/revoke ──
    this.recalculateXP();  // updates this.state.level based on current badge count
    const levelThresholds = { 'level-5': 5, 'level-10': 10, 'level-20': 20, 'level-50': 50 };
    Object.entries(levelThresholds).forEach(([id, threshold]) => {
      if (this.state.level >= threshold) {
        grant(id, true);
      } else {
        // Revoke level badge if level drops below threshold
        if (badges[id]) delete badges[id];
      }
    });

    // Recalculate XP one more time to account for level badge changes
    this.recalculateXP();

    // ── Show toasts only for badges earned THIS call (not in silent mode) ──
    if (!silent) {
      newlyGranted.forEach(id => {
        const badge = this.badges.find(b => b.id === id);
        if (badge) this.showToast(`🏅 Badge débloqué : ${badge.emoji} ${badge.name} !`);
      });
    }

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

      // Accent : couleur saisonnière si badge de saison, sinon couleur de rareté
      const accentPalette = {
        quick:  { border: 'rgba(16,185,129,0.45)',  bg: 'rgba(16,185,129,0.10)',  glow: 'rgba(16,185,129,0.20)' },
        medium: { border: 'rgba(59,130,246,0.45)',   bg: 'rgba(59,130,246,0.10)',   glow: 'rgba(59,130,246,0.20)' },
        long:   { border: 'rgba(168,85,247,0.45)',   bg: 'rgba(168,85,247,0.10)',   glow: 'rgba(168,85,247,0.20)' },
        epic:   { border: 'rgba(251,191,36,0.55)',   bg: 'rgba(251,191,36,0.12)',   glow: 'rgba(251,191,36,0.28)' },
        spring: { border: 'rgba(74,222,128,0.50)',   bg: 'rgba(74,222,128,0.12)',   glow: 'rgba(74,222,128,0.24)' },
        summer: { border: 'rgba(251,191,36,0.50)',   bg: 'rgba(251,191,36,0.12)',   glow: 'rgba(251,191,36,0.24)' },
        autumn: { border: 'rgba(251,146,60,0.50)',   bg: 'rgba(251,146,60,0.12)',   glow: 'rgba(251,146,60,0.24)' },
        winter: { border: 'rgba(96,165,250,0.50)',   bg: 'rgba(96,165,250,0.12)',   glow: 'rgba(96,165,250,0.24)' },
        season: { border: 'rgba(251,191,36,0.55)',   bg: 'rgba(251,191,36,0.12)',   glow: 'rgba(251,191,36,0.28)' },
      };

      let accentKey;
      if      (b.id.startsWith('spring-')) accentKey = 'spring';
      else if (b.id.startsWith('summer-')) accentKey = 'summer';
      else if (b.id.startsWith('autumn-')) accentKey = 'autumn';
      else if (b.id.startsWith('winter-')) accentKey = 'winter';
      else if (b.category === 'saison')    accentKey = 'season';
      else                                  accentKey = b.horizon;

      const ac = accentPalette[accentKey] || accentPalette.medium;
      const cardStyle = unlocked
        ? `background: linear-gradient(135deg, ${ac.bg}, rgba(0,0,0,0)); border-color: ${ac.border}; box-shadow: 0 0 14px ${ac.glow}, inset 0 0 20px ${ac.bg};`
        : '';

      return `
        <div class="badge-card ${unlocked ? 'unlocked' : 'locked'}" data-horizon="${b.horizon}" style="${cardStyle}">
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
  // PHASE RPG-A — MOTEUR DE COMBAT
  // ============================================

  getEnemyStats(wave) {
    const w = Math.max(1, wave);
    const p15 = Math.pow(1.15, w - 1);
    const p12 = Math.pow(1.12, w - 1);
    let name = 'Rat de Montagne', emoji = '🐀';
    for (const e of this.enemyData) {
      if (w >= e.minWave) { name = e.name; emoji = e.emoji; }
    }
    return {
      wave: w, name: `${name} (vague ${w})`, emoji,
      hp:   Math.round(50  * p15),
      atk:  Math.round(8   * p15),
      def:  Math.round(3   * p15),
      gold: Math.min(5000, Math.round(5  * p12)),
      xp:   Math.min(10000,Math.round(10 * p12)),
    };
  },

  getLootRate(luck) {
    return Math.min(0.25, 0.04 + (luck - 10) * 0.014 + this.getSkillBonus('dropRate'));
  },

  startCombatTick() {
    this.stopCombatTick();
    this.combatInterval = setInterval(() => this.tickCombat(), 3000);
  },

  stopCombatTick() {
    if (this.combatInterval) { clearInterval(this.combatInterval); this.combatInterval = null; }
  },

  tickCombat() {
    const rpg = this.state.rpg;
    if (!rpg?.hero) return;
    if (this.state.currentTab !== 'hero') { this.stopCombatTick(); return; }
    const hero = this.getHeroStats();
    const enemy = this.getEnemyStats(rpg.currentWave);
    if (!rpg.combatState || rpg.combatState.wave !== rpg.currentWave) {
      rpg.combatState = { wave: rpg.currentWave, enemyHp: enemy.hp };
    }
    // Hero attack
    const heroDmg = Math.max(1, Math.round((hero.atk - enemy.def) * hero.speed));
    let finalHeroDmg = heroDmg;
    if (rpg.activeSpell?.type === 'damage_boost') finalHeroDmg = Math.round(heroDmg * (1 + rpg.activeSpell.value));
    if (rpg.activeSpell?.type === 'instant_damage') finalHeroDmg += Math.round(hero.atk * rpg.activeSpell.value);
    rpg.combatState.enemyHp -= finalHeroDmg;
    if (rpg.activeSpell) { rpg.activeSpell.turnsLeft--; if (rpg.activeSpell.turnsLeft <= 0) delete rpg.activeSpell; }
    if (rpg.combatState.enemyHp <= 0) {
      // Victoire
      let goldGain = enemy.gold;
      if (rpg.activeSpell?.type === 'gold_boost') { goldGain *= rpg.activeSpell.value; delete rpg.activeSpell; }
      rpg.hero.gold = (rpg.hero.gold || 0) + Math.round(goldGain);
      rpg.hero.xp   = (rpg.hero.xp   || 0) + enemy.xp;
      this.checkLevelUp();
      rpg.currentWave++;
      if (rpg.currentWave > (rpg.highestWave || 1)) rpg.highestWave = rpg.currentWave;
      rpg.combatState = null;
      // Loot
      const lootRate = this.getLootRate(hero.luck);
      if (Math.random() < lootRate) {
        const item = this.generateItem(rpg.currentWave - 1);
        this.addToInventory(item);
        rpg.pendingLoot = rpg.pendingLoot || [];
        rpg.pendingLoot.push(item.id);
        this.showToast(`📦 ${item.emoji} ${item.name} (Tier ${item.tier}) !`);
      }
      rpg.combatLog = rpg.combatLog || [];
      rpg.combatLog.unshift(`Vague ${rpg.currentWave-1} ✓ +${Math.round(goldGain)}💰 +${enemy.xp}XP`);
      if (rpg.combatLog.length > 10) rpg.combatLog = rpg.combatLog.slice(0, 10);
      this.checkRPGBadges();
      this.saveData();
    } else {
      // Riposte ennemie
      let enemyDmg = Math.max(1, enemy.atk - hero.def);
      if (rpg.activeSpell?.type === 'dodge') { enemyDmg = 0; delete rpg.activeSpell; }
      else if (rpg.activeSpell?.type === 'debuff_atk') enemyDmg = Math.round(enemyDmg * (1 - rpg.activeSpell.value));
      else if (rpg.activeSpell?.type === 'def_boost') enemyDmg = Math.max(0, enemyDmg - rpg.activeSpell.value);
      rpg.hero.hp -= enemyDmg;
      if (rpg.hero.hp <= 0) {
        rpg.hero.hp = Math.ceil((hero.hpMax || 100) * 0.5);
        rpg.combatState = null;
        // Régression d'une vague sur défaite (retour à la vague précédente)
        const prevWave = rpg.currentWave || 1;
        rpg.currentWave = Math.max(1, prevWave - 1);
        rpg.combatLog = rpg.combatLog || [];
        rpg.combatLog.unshift(`💀 Vague ${prevWave} perdue → retour vague ${rpg.currentWave}`);
        if (rpg.combatLog.length > 10) rpg.combatLog = rpg.combatLog.slice(0, 10);
        this.showToast(`💀 Vaincu vague ${prevWave} ! Retour vague ${rpg.currentWave}`);
      }
    }
    this.renderCombatSection();
  },

  castKanjiSpell(spellId) {
    const rpg = this.state.rpg;
    const spell = this.kanjiSpellPool.find(s => s.id === spellId);
    if (!spell || !rpg.kanji.includes(spellId)) return;
    const focusCost = spell.cost;
    if ((rpg.focusSessionsCompleted || 0) < focusCost) {
      this.showToast(`⚡ Il faut ${focusCost} session(s) Focus pour lancer ce sort !`); return;
    }
    rpg.focusSessionsCompleted -= focusCost;
    if (spell.type === 'heal') {
      const hero = this.getHeroStats();
      rpg.hero.hp = Math.min(hero.hpMax, Math.round(rpg.hero.hp + hero.hpMax * spell.value));
    } else {
      rpg.activeSpell = { type: spell.type, value: spell.value, turnsLeft: spell.turns };
    }
    this.saveData();
    this.showToast(`✨ Sort ${spell.emoji} ${spell.name} lancé !`);
    this.renderCombatSection();
  },

  renderHeroTab() {
    const el = document.getElementById('heroContent');
    if (!el) return;
    const section = this.heroSection || 'combat';
    // Update pills
    document.querySelectorAll('.hero-pill').forEach(p => {
      p.classList.toggle('active', p.dataset.section === section);
    });
    switch(section) {
      case 'combat':    el.innerHTML = this.buildCombatHTML(); break;
      case 'inventory': el.innerHTML = this.buildInventoryHTML(); break;
      case 'forge':     el.innerHTML = this.buildForgeHTML(); break;
      case 'tree':      el.innerHTML = this.buildSkillTreeHTML(); break;
      case 'prestige':  el.innerHTML = this.buildPrestigeHTML(); break;
      default:          el.innerHTML = this.buildCombatHTML();
    }
  },

  switchHeroSection(section) {
    this.heroSection = section;
    this.renderHeroTab();
  },

  renderCombatSection() {
    if (this.state.currentTab !== 'hero' || this.heroSection !== 'combat') return;
    const el = document.getElementById('heroContent');
    if (!el) return;
    el.innerHTML = this.buildCombatHTML();
  },

  buildCombatHTML() {
    const rpg = this.state.rpg;
    const hero = this.getHeroStats();
    if (!hero) return '<p>Erreur : héros introuvable</p>';
    const enemy = this.getEnemyStats(rpg.currentWave || 1);
    const cs = rpg.combatState;
    const enemyHp = cs ? cs.enemyHp : enemy.hp;
    const enemyHpPct = Math.max(0, Math.min(100, (enemyHp / enemy.hp) * 100));
    const heroHpPct  = Math.max(0, Math.min(100, (rpg.hero.hp / hero.hpMax) * 100));
    const xpForNext = (rpg.hero.lvl || 1) * 100;
    const xpPct = Math.min(100, ((rpg.hero.xp || 0) / xpForNext) * 100);
    // Offline summary
    const offlineSummary = (rpg.combatLog || []).length > 0
      ? `<div class="combat-log">${(rpg.combatLog||[]).slice(0,3).map(l=>`<div class="combat-log-entry">${l}</div>`).join('')}</div>` : '';
    // Kanji spells
    const unlocked = rpg.kanji || [];
    const spellsHtml = unlocked.length > 0 ? `
      <div class="combat-spells">
        <div class="combat-spells-title">✨ Sorts (${rpg.focusSessionsCompleted||0} Focus dispo)</div>
        <div class="spells-grid">
          ${unlocked.map(id => {
            const s = this.kanjiSpellPool.find(sp => sp.id === id);
            if (!s) return '';
            const canCast = (rpg.focusSessionsCompleted || 0) >= s.cost;
            return `<button class="spell-btn ${canCast ? '' : 'disabled'}" onclick="app.castKanjiSpell('${s.id}')" title="${s.desc} (Coût: ${s.cost} Focus)">
              <span class="spell-kanji">${s.kanji}</span>
              <span class="spell-name">${s.emoji} ${s.name}</span>
              <span class="spell-cost">${s.cost}⚡</span>
            </button>`;
          }).join('')}
        </div>
      </div>` : '';
    // Active buff display
    const buffHtml = rpg.activeSpell ? `<div class="active-buff">✨ ${rpg.activeSpell.type} (${rpg.activeSpell.turnsLeft} tours)</div>` : '';
    // Strava buff
    const strava = rpg.stravaBuff && rpg.stravaBuff.expiresAt > Date.now()
      ? `<div class="strava-buff">🏃 Buff Strava actif : +${(rpg.stravaBuff.speedBonus * 100).toFixed(0)}% vitesse</div>` : '';
    return `
      <div class="combat-arena">
        <div class="wave-header">
          <span>Vague <strong>${rpg.currentWave}</strong></span>
          <span style="color:var(--text-muted)">Record : ${rpg.highestWave||1}</span>
        </div>
        <div class="enemy-section">
          <div class="enemy-emoji">${enemy.emoji}</div>
          <div class="enemy-name">${enemy.name}</div>
          <div class="hp-bar-container">
            <div class="hp-bar-label"><span>HP Ennemi</span><span>${Math.max(0,enemyHp)} / ${enemy.hp}</span></div>
            <div class="hp-bar"><div class="hp-bar-fill enemy-hp" style="width:${enemyHpPct}%"></div></div>
          </div>
        </div>
        <div class="hero-combat-section">
          <div class="hero-combat-title">⚔️ Héros — Niv. ${hero.lvl}</div>
          <div class="hp-bar-container">
            <div class="hp-bar-label"><span>HP</span><span>${Math.round(rpg.hero.hp)} / ${hero.hpMax}</span></div>
            <div class="hp-bar"><div class="hp-bar-fill hero-hp" style="width:${heroHpPct}%"></div></div>
          </div>
          <div class="hp-bar-container" style="margin-top:0.4rem">
            <div class="hp-bar-label"><span>XP Niv.${hero.lvl}</span><span>${rpg.hero.xp||0}/${xpForNext}</span></div>
            <div class="hp-bar"><div class="hp-bar-fill xp-bar" style="width:${xpPct}%"></div></div>
          </div>
          <div class="hero-stats-grid">
            <div class="stat-chip">⚔️ ATK <strong>${hero.atk}</strong></div>
            <div class="stat-chip">🛡️ DEF <strong>${hero.def}</strong></div>
            <div class="stat-chip">⚡ SPD <strong>${hero.speed.toFixed(1)}</strong></div>
            <div class="stat-chip">🎲 Luck <strong>${hero.luck}</strong></div>
            <div class="stat-chip">💰 Gold <strong>${rpg.hero.gold||0}</strong></div>
            <div class="stat-chip">🔮 Frag <strong>${rpg.hero.fragments||0}</strong></div>
          </div>
        </div>
        ${buffHtml}${strava}
        <div class="combat-status">
          ${this.combatInterval ? '▶️ Combat actif' : '⏸ Combat en pause (ouvre cet onglet)'}
        </div>
        ${offlineSummary}
        ${spellsHtml}
        <!-- Équipement équipé -->
        <div class="equipped-section">
          <div class="equipped-title">🛡️ Équipement</div>
          <div class="equipped-grid">
            ${['weapon','head','torso','gloves','legs','boots','amulet','accessory'].map(slot => {
              const item = (rpg.equipment||{})[slot];
              const slotEmojis = {weapon:'⚔️',head:'🪖',torso:'🥋',gloves:'🧤',legs:'👖',boots:'👟',amulet:'📿',accessory:'💍'};
              return `<div class="equip-slot ${item ? 'filled' : 'empty'}" title="${item ? item.name : slot}" onclick="${item ? `app.openItemModal('${item.id}')` : ''}">
                ${item ? `<span>${item.emoji}</span><span class="equip-tier">${'★'.repeat(item.tier)}</span>` : `<span style="opacity:0.3">${slotEmojis[slot]}</span>`}
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  },

  // ============================================
  // PHASE RPG-B — LOOT & ÉQUIPEMENT
  // ============================================

  generateItem(wave) {
    const slots = Object.keys(this.itemNamePool);
    const slot = slots[Math.floor(Math.random() * slots.length)];
    const tierBonus = this.getSkillBonus('lootTierBonus');
    const tier = Math.min(5, Math.max(1, Math.floor(wave / 10) + 1 + tierBonus));
    const rarity = tier >= 5 ? 'legendary' : tier >= 4 ? 'epic' : tier >= 3 ? 'rare' : 'common';
    const names = this.itemNamePool[slot] || ['Objet Mystérieux'];
    const name = names[Math.floor(Math.random() * names.length)];
    const emojis = {weapon:'⚔️',head:'🪖',torso:'🥋',gloves:'🧤',legs:'👖',boots:'👟',amulet:'📿',accessory:'💍'};
    const atk = slot === 'weapon' ? tier * 4 : Math.max(0, tier - 1);
    const def = ['torso','legs'].includes(slot) ? tier * 3 : ['head','gloves','boots'].includes(slot) ? tier * 2 : tier;
    const hp  = slot === 'torso' ? tier * 10 : Math.max(0, tier * 2 - 2);
    return {
      id: `item_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
      slot, tier, rarity, name, emoji: emojis[slot] || '📦',
      atk, def, hp,
      special: tier >= 3 ? this.generateSpecial(tier) : null,
    };
  },

  generateSpecial(tier) {
    const pool = [
      { type: 'speed',    label: `+${(tier*0.05).toFixed(2)} vitesse`,    value: tier * 0.05 },
      { type: 'luck',     label: `+${tier} Luck`,                         value: tier },
      { type: 'xp',       label: `+${(tier*3)}% XP`,                      value: tier * 0.03 },
      { type: 'hp_regen', label: `+${tier*2} régén HP`,                   value: tier * 2 },
    ];
    return pool[Math.floor(Math.random() * pool.length)];
  },

  addToInventory(item) {
    const inv = this.state.rpg.inventory;
    inv.push(item);
    // Cap at 60 items: FIFO on commons
    if (inv.length > 60) {
      const commonIdx = inv.findIndex(i => i.rarity === 'common' && !(this.state.rpg.equipment?.[i.slot]?.id === i.id));
      if (commonIdx >= 0) inv.splice(commonIdx, 1);
      else inv.shift();
    }
  },

  equipItem(itemId) {
    const inv = this.state.rpg.inventory;
    const item = inv.find(i => i.id === itemId);
    if (!item) return;
    const eq = this.state.rpg.equipment;
    // Unequip current item in that slot back to inventory
    if (eq[item.slot]) {
      const old = eq[item.slot];
      if (!inv.find(i => i.id === old.id)) inv.push(old);
    }
    eq[item.slot] = item;
    // Remove from inventory
    const idx = inv.findIndex(i => i.id === itemId);
    if (idx >= 0) inv.splice(idx, 1);
    this.checkRPGBadges();
    this.saveData();
    this.showToast(`🛡️ ${item.emoji} ${item.name} équipé !`);
    this.renderHeroTab();
  },

  unequipItem(slot) {
    const eq = this.state.rpg.equipment;
    const item = eq[slot];
    if (!item) return;
    this.addToInventory(item);
    eq[slot] = null;
    this.saveData();
    this.showToast(`📦 ${item.name} retiré.`);
    this.renderHeroTab();
  },

  openItemModal(itemId) {
    const allItems = [...this.state.rpg.inventory, ...Object.values(this.state.rpg.equipment).filter(Boolean)];
    const item = allItems.find(i => i.id === itemId);
    if (!item) return;
    const equipped = this.state.rpg.equipment[item.slot];
    const isEquipped = equipped?.id === itemId;
    const rarityColors = {common:'var(--text-muted)',rare:'var(--accent-blue)',epic:'var(--accent-purple)',legendary:'var(--accent-orange)'};
    const compare = equipped && !isEquipped ? `
      <div style="margin-top:1rem;padding-top:1rem;border-top:1px solid var(--border-color)">
        <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.5rem">Actuellement équipé :</div>
        <div style="font-size:0.85rem">${equipped.emoji} ${equipped.name} (T${equipped.tier}) — ATK:${equipped.atk} DEF:${equipped.def} HP:${equipped.hp}</div>
        <div style="font-size:0.8rem;color:var(--text-muted);margin-top:0.25rem">
          Δ ATK: ${item.atk-equipped.atk>=0?'+':''}${item.atk-equipped.atk} · DEF: ${item.def-equipped.def>=0?'+':''}${item.def-equipped.def} · HP: ${item.hp-equipped.hp>=0?'+':''}${item.hp-equipped.hp}
        </div>
      </div>` : '';
    document.getElementById('modalTitle').textContent = `${item.emoji} ${item.name}`;
    document.getElementById('modalBody').innerHTML = `
      <div style="display:flex;flex-direction:column;gap:0.5rem">
        <div style="color:${rarityColors[item.rarity]};font-weight:600;text-transform:capitalize">${item.rarity} — Tier ${item.tier} — ${'★'.repeat(item.tier)}</div>
        <div style="font-size:0.85rem;color:var(--text-muted)">Slot : ${item.slot}</div>
        <div class="hero-stats-grid" style="margin-top:0.5rem">
          <div class="stat-chip">⚔️ ATK <strong>+${item.atk}</strong></div>
          <div class="stat-chip">🛡️ DEF <strong>+${item.def}</strong></div>
          <div class="stat-chip">❤️ HP <strong>+${item.hp}</strong></div>
        </div>
        ${item.special ? `<div style="margin-top:0.5rem;padding:0.5rem;background:rgba(139,92,246,0.1);border-radius:8px;font-size:0.85rem">✨ Passif : ${item.special.label}</div>` : ''}
        ${compare}
      </div>
    `;
    document.getElementById('modalFooter').innerHTML = isEquipped
      ? `<button class="btn" onclick="app.unequipItem('${item.slot}');app.closeModal()">📦 Déséquiper</button>`
      : `<button class="btn btn-primary" onclick="app.equipItem('${itemId}');app.closeModal()">🛡️ Équiper</button>
         <button class="btn" onclick="app.closeModal()">Fermer</button>`;
    document.getElementById('modalOverlay').classList.add('active');
  },

  buildInventoryHTML() {
    const inv = this.state.rpg.inventory || [];
    const eq  = this.state.rpg.equipment || {};
    const equippedSet = new Set(Object.values(eq).filter(Boolean).map(i => i.id));
    const rarityColors = {common:'var(--text-muted)',rare:'var(--accent-blue)',epic:'var(--accent-purple)',legendary:'var(--accent-orange)'};
    if (inv.length === 0) return `
      <div class="hero-section-card">
        <h3 class="hero-section-title">📦 Inventaire (0/60)</h3>
        <p style="color:var(--text-muted);text-align:center;padding:2rem">Aucun item pour l'instant. Combats pour obtenir du loot !</p>
      </div>`;
    return `
      <div class="hero-section-card">
        <h3 class="hero-section-title">📦 Inventaire (${inv.length}/60)</h3>
        <div class="inventory-grid">
          ${inv.map(item => {
            const isEquipped = equippedSet.has(item.id);
            return `
            <div class="inv-item${isEquipped ? ' inv-item-equipped' : ''}" onclick="app.openItemModal('${item.id}')" style="border-color:${rarityColors[item.rarity]}">
              ${isEquipped ? '<div class="inv-equipped-badge">✓</div>' : ''}
              <div class="inv-item-emoji">${item.emoji}</div>
              <div class="inv-item-name">${item.name}</div>
              <div class="inv-item-tier" style="color:${rarityColors[item.rarity]}">${'★'.repeat(item.tier)} T${item.tier}</div>
              <div class="inv-item-stats">ATK+${item.atk} DEF+${item.def}</div>
            </div>`;
          }).join('')}
        </div>
      </div>
    `;
  },

  // ============================================
  // PHASE RPG-C — FORGE & ÉCONOMIE
  // ============================================

  buildForgeHTML() {
    const inv = this.state.rpg.inventory || [];
    // Group by slot+tier
    const groups = {};
    inv.forEach(item => {
      const key = `${item.slot}-${item.tier}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    const forgeableGroups = Object.entries(groups).filter(([,items]) => items.length >= 3);
    const forgeHtml = forgeableGroups.length > 0 ? forgeableGroups.map(([key, items]) => {
      const [slot, tierStr] = key.split('-');
      const tier = parseInt(tierStr);
      const sample = items[0];
      return `
        <div class="forge-group">
          <div class="forge-group-info">
            <span>${sample.emoji} ${slot} T${tier} ×${items.length}</span>
            <span style="color:var(--text-muted);font-size:0.8rem">${items.length >= 3 ? '→ Peut forger T'+(tier+1) : `Besoin ${3-items.length} de plus`}</span>
          </div>
          ${items.length >= 3 && tier < 5 ? `<button class="btn btn-primary" onclick="app.forgeItems('${slot}',${tier})">🔨 Forger (T${tier+1})</button>` : ''}
        </div>`;
    }).join('') : '<p style="color:var(--text-muted);text-align:center;padding:1rem">Pas assez d\'items identiques. Accumule 3 items du même slot et tier !</p>';
    // Shop
    const hero = this.getHeroStats();
    return `
      <div class="hero-section-card">
        <h3 class="hero-section-title">🔨 Forge</h3>
        <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1rem">3 items (même slot, même tier) → 1 item tier supérieur</p>
        ${forgeHtml}
      </div>
      <div class="hero-section-card" style="margin-top:1rem">
        <h3 class="hero-section-title">🏪 Boutique (💰 ${hero.gold})</h3>
        <div class="shop-item">
          <div>
            <div style="font-weight:600">🧪 Potion de Soin</div>
            <div style="font-size:0.8rem;color:var(--text-muted)">Restaure 50% HP max</div>
          </div>
          <button class="btn btn-primary" onclick="app.buyPotion()" ${(hero.gold||0) < 50 ? 'disabled' : ''}>50💰</button>
        </div>
        <div class="shop-item" style="margin-top:0.75rem">
          <div>
            <div style="font-weight:600">⚡ Fragment de Code</div>
            <div style="font-size:0.8rem;color:var(--text-muted)">Échange 200💰 contre 1 Fragment</div>
          </div>
          <button class="btn" onclick="app.buyFragment()" ${(hero.gold||0) < 200 ? 'disabled' : ''}>200💰</button>
        </div>
      </div>
    `;
  },

  forgeItems(slot, tier) {
    const inv = this.state.rpg.inventory;
    const toForge = inv.filter(i => i.slot === slot && i.tier === tier).slice(0, 3);
    if (toForge.length < 3) { this.showToast('❌ Pas assez d\'items à forger !'); return; }
    if (tier >= 5) { this.showToast('❌ Tier 5 est le maximum !'); return; }
    // Remove the 3 items
    toForge.forEach(item => {
      const idx = inv.findIndex(i => i.id === item.id);
      if (idx >= 0) inv.splice(idx, 1);
    });
    // Create tier+1 item
    const newItem = this.generateItem((tier) * 10, this.getHeroStats()?.luck || 10);
    newItem.slot = slot;
    newItem.tier = tier + 1;
    newItem.rarity = tier + 1 >= 5 ? 'legendary' : tier + 1 >= 4 ? 'epic' : tier + 1 >= 3 ? 'rare' : 'common';
    this.addToInventory(newItem);
    if (tier + 1 >= 3) this.checkRPGBadges();
    this.saveData();
    this.showToast(`🔨 Forgé : ${newItem.emoji} ${newItem.name} Tier ${newItem.tier} !`);
    this.renderHeroTab();
  },

  buyPotion() {
    const hero = this.getHeroStats();
    if ((hero.gold || 0) < 50) { this.showToast('❌ Pas assez d\'or !'); return; }
    this.state.rpg.hero.gold -= 50;
    const heal = Math.round(hero.hpMax * 0.5);
    this.state.rpg.hero.hp = Math.min(hero.hpMax, (this.state.rpg.hero.hp || 0) + heal);
    this.saveData();
    this.showToast(`🧪 Potion utilisée : +${heal} HP !`);
    this.renderHeroTab();
  },

  buyFragment() {
    const hero = this.getHeroStats();
    if ((hero.gold || 0) < 200) { this.showToast('❌ Pas assez d\'or !'); return; }
    this.state.rpg.hero.gold -= 200;
    this.state.rpg.hero.fragments = (this.state.rpg.hero.fragments || 0) + 1;
    this.saveData();
    this.showToast('🔮 Fragment de Code obtenu !');
    this.renderHeroTab();
  },

  // ============================================
  // PHASE RPG-D — ARBRE BIOFEEDBACK & SYNERGIES IRL
  // ============================================

  getSkillNode(nodeId) {
    for (const branch of Object.values(this.skillTreeDefs)) {
      const node = branch.nodes.find(n => n.id === nodeId);
      if (node) return node;
    }
    return null;
  },

  getSkillBonus(bonusType) {
    const tree = this.state.rpg?.skillTree || {};
    let total = 0;
    Object.keys(tree).forEach(nodeId => {
      if (!tree[nodeId]) return;
      const node = this.getSkillNode(nodeId);
      if (node?.bonus[bonusType]) total += node.bonus[bonusType];
    });
    return total;
  },

  isKPIUnlocked(branchKey) {
    const weekDates = this.getWeekDates(0);
    const mon = weekDates[0];
    const weekKey = this.getWeekKey(mon);
    switch(branchKey) {
      case 'trail': {
        const weekKm = weekDates.reduce((sum, d) => sum + (this.state.logs[this.getDateKey(d)]?.km || 0), 0);
        return (weekKm / (this.state.config.weeklyKm || 40)) >= 0.6;
      }
      case 'focus':
        return (this.state.rpg?.focusSessionsCompleted || 0) >= 3;
      case 'habit': {
        // Check if last 3 days had at least one habit checked
        let streak3 = 0;
        const today = new Date();
        for (let i = 0; i < 3; i++) {
          const d = new Date(today); d.setDate(d.getDate() - i);
          const checks = this.state.habitChecks[this.getDateKey(d)] || {};
          if (Object.values(checks).some(v => v)) streak3++;
        }
        return streak3 >= 3;
      }
      case 'discovery': {
        const accepted = this.state.discoveryAccepted[weekKey] || [];
        return accepted.length >= 2;
      }
      default: return false;
    }
  },

  unlockSkill(nodeId) {
    const node = this.getSkillNode(nodeId);
    if (!node) return;
    const branchEntry = Object.entries(this.skillTreeDefs).find(([,b]) => b.nodes.find(n => n.id === nodeId));
    if (!branchEntry) return;
    const [, branch] = branchEntry;
    // Check prerequisites: previous node in branch must be unlocked
    const nodeIndex = branch.nodes.findIndex(n => n.id === nodeId);
    if (nodeIndex > 0) {
      const prevNode = branch.nodes[nodeIndex - 1];
      if (!this.state.rpg.skillTree[prevNode.id]) {
        this.showToast('❌ Débloque d\'abord le nœud précédent !'); return;
      }
    }
    // Check KPI
    if (!this.isKPIUnlocked(branch.kpiKey)) {
      this.showToast(`❌ KPI ${branch.label} insuffisant cette semaine !`); return;
    }
    // Check fragments
    if ((this.state.rpg.hero.fragments || 0) < node.cost) {
      this.showToast(`❌ Il faut ${node.cost} Fragment(s) de Code !`); return;
    }
    this.state.rpg.hero.fragments -= node.cost;
    this.state.rpg.skillTree[nodeId] = true;
    // Special unlock: kanji spells
    if (node.bonus.kanjiUnlock) {
      this.unlockRandomKanji();
    }
    this.checkRPGBadges();
    this.saveData();
    this.showToast(`🌳 Nœud débloqué : ${node.name} !`);
    this.renderHeroTab();
  },

  unlockRandomKanji() {
    const rpg = this.state.rpg;
    rpg.kanji = rpg.kanji || [];
    const locked = this.kanjiSpellPool.filter(s => !rpg.kanji.includes(s.id));
    if (locked.length === 0) return;
    const spell = locked[Math.floor(Math.random() * locked.length)];
    rpg.kanji.push(spell.id);
    this.showToast(`⚡ Sort Kanji débloqué : ${spell.emoji} ${spell.kanji} ${spell.name} !`);
    this.checkAllBadges(true);
  },

  buildSkillTreeHTML() {
    const tree = this.state.rpg?.skillTree || {};
    const hero = this.getHeroStats();
    return `
      <div class="hero-section-card">
        <h3 class="hero-section-title">🌳 Arbre BioFeedback</h3>
        <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:1rem">Fragments disponibles : <strong>${hero.fragments||0}</strong> 🔮</p>
        ${Object.entries(this.skillTreeDefs).map(([, branch]) => {
          const kpiOk = this.isKPIUnlocked(branch.kpiKey);
          return `
            <div class="skill-branch ${kpiOk ? 'kpi-ok' : 'kpi-locked'}">
              <div class="branch-header">
                <span class="branch-label">${branch.label}</span>
                <span class="branch-kpi ${kpiOk ? 'ok' : 'fail'}">${kpiOk ? '✅ KPI atteint' : '❌ KPI insuffisant'}</span>
              </div>
              <div class="branch-nodes">
                ${branch.nodes.map((node, idx) => {
                  const unlocked = !!tree[node.id];
                  const prevOk = idx === 0 || !!tree[branch.nodes[idx-1].id];
                  const canUnlock = !unlocked && prevOk && kpiOk && (hero.fragments||0) >= node.cost;
                  return `
                    <div class="skill-node ${unlocked ? 'unlocked' : canUnlock ? 'available' : 'locked'}">
                      <div class="skill-node-name">${node.name}</div>
                      <div class="skill-node-desc">${node.desc}</div>
                      ${unlocked ? '<div class="skill-node-status">✅ Débloqué</div>'
                        : `<button class="btn skill-unlock-btn ${canUnlock ? '' : 'disabled'}" onclick="app.unlockSkill('${node.id}')" ${canUnlock ? '' : 'disabled'}>
                          🔮 ${node.cost} Fragment(s)
                        </button>`}
                    </div>`;
                }).join('<div class="node-connector">→</div>')}
              </div>
            </div>`;
        }).join('')}
        <!-- Sorts Kanji débloqués -->
        ${(this.state.rpg?.kanji||[]).length > 0 ? `
          <div class="kanji-unlocked">
            <div class="branch-header"><span class="branch-label">⚡ Sorts Kanji débloqués</span></div>
            <div class="spells-grid">
              ${(this.state.rpg.kanji||[]).map(id => {
                const s = this.kanjiSpellPool.find(sp => sp.id === id);
                return s ? `<div class="spell-card">${s.emoji} ${s.kanji} <strong>${s.name}</strong><br><span style="font-size:0.75rem;color:var(--text-muted)">${s.desc}</span></div>` : '';
              }).join('')}
            </div>
          </div>` : ''}
      </div>
    `;
  },

  addStravaBuff(km) {
    if (!km || km <= 0) return;
    const speedBonus = Math.min(1.5, km * 0.05);
    const doubleStrava = this.getSkillBonus('stravaX2') > 0;
    this.state.rpg.stravaBuff = {
      expiresAt: Date.now() + 86400000,
      speedBonus: doubleStrava ? speedBonus * 2 : speedBonus,
      km,
    };
    this.saveData();
    this.showToast(`🏃 Buff Strava activé 24h : +${(speedBonus * 100).toFixed(0)}% vitesse !`);
  },

  checkKanjiUnlock(japMinutes) {
    if (!japMinutes || japMinutes < 10) return;
    const rpg = this.state.rpg;
    rpg.kanji = rpg.kanji || [];
    if (rpg.kanji.length >= this.kanjiSpellPool.length) return;
    // 30% chance per session ≥10min
    if (Math.random() < 0.3) {
      this.unlockRandomKanji();
    }
  },

  // ============================================
  // PHASE RPG-E — PRESTIGE
  // ============================================

  canPrestige() {
    return (this.state.rpg?.currentWave || 1) >= 50;
  },

  doPrestige() {
    const rpg = this.state.rpg;
    if (!this.canPrestige()) { this.showToast('❌ Atteins la vague 50 pour le Prestige !'); return; }
    const fragments = Math.floor((rpg.currentWave || 1) / 10);
    rpg.hero.fragments = (rpg.hero.fragments || 0) + fragments;
    rpg.prestigePoints = (rpg.prestigePoints || 0) + fragments;
    rpg.hero.resets = (rpg.hero.resets || 0) + 1;
    // Save highestWave and skillTree/equipment
    const savedHighest   = rpg.highestWave;
    const savedSkillTree = { ...rpg.skillTree };
    const savedEquipment = { ...rpg.equipment };
    const savedFragments = rpg.hero.fragments;
    const savedResets    = rpg.hero.resets;
    const savedPPoints   = rpg.prestigePoints;
    // Reset hero
    rpg.hero = { hp: 100, hpMax: 100, atk: 10, def: 10, speed: 1.0, lvl: 1, xp: 0, luck: 10, gold: 0, prestigePoints: savedPPoints, resets: savedResets, fragments: savedFragments };
    rpg.currentWave  = 1;
    rpg.highestWave  = savedHighest;
    rpg.skillTree    = savedSkillTree;
    rpg.equipment    = savedEquipment;
    rpg.combatState  = null;
    rpg.combatLog    = [];
    this.checkRPGBadges();
    this.saveData();
    this.closeModal();
    this.showToast(`🌟 Prestige ! +${fragments} Fragments de Code. Reset de la progression !`);
    this.renderHeroTab();
  },

  buildPrestigeHTML() {
    const rpg = this.state.rpg;
    const canP = this.canPrestige();
    const fragmentsGain = Math.floor((rpg.currentWave || 1) / 10);
    return `
      <div class="hero-section-card">
        <h3 class="hero-section-title">⭐ Prestige</h3>
        <div class="prestige-info">
          <div class="prestige-stat"><span>Prestige effectués</span><strong>${rpg.hero.resets||0}</strong></div>
          <div class="prestige-stat"><span>Vague actuelle</span><strong>${rpg.currentWave||1}</strong></div>
          <div class="prestige-stat"><span>Meilleure vague</span><strong>${rpg.highestWave||1}</strong></div>
          <div class="prestige-stat"><span>Fragments gagnés</span><strong>${rpg.prestigePoints||0}</strong></div>
        </div>
        ${canP ? `
          <div class="prestige-available">
            <p>🌟 Tu peux effectuer un Prestige !</p>
            <p style="font-size:0.85rem;color:var(--text-muted)">Gain : <strong>+${fragmentsGain} Fragment(s) de Code</strong></p>
            <p style="font-size:0.8rem;color:var(--accent-orange)">⚠️ Reset : Vague, Niveau, or, HP/ATK/DEF retournent à 1.<br>Conservés : Arbre des Compétences, Équipement, Meilleure Vague.</p>
            <button class="btn btn-primary" onclick="app.confirmPrestige()">⭐ Effectuer le Prestige</button>
          </div>` : `
          <div class="prestige-locked">
            <p style="color:var(--text-muted)">🔒 Déblocage à la vague 50</p>
            <div class="hp-bar-container" style="margin-top:0.75rem">
              <div class="hp-bar-label"><span>Progression</span><span>Vague ${rpg.currentWave||1}/50</span></div>
              <div class="hp-bar"><div class="hp-bar-fill xp-bar" style="width:${Math.min(100,((rpg.currentWave||1)/50)*100)}%"></div></div>
            </div>
          </div>`}
      </div>
    `;
  },

  confirmPrestige() {
    document.getElementById('modalTitle').textContent = '⭐ Confirmer le Prestige ?';
    document.getElementById('modalBody').innerHTML = `
      <p style="color:var(--text-secondary)">Un Prestige réinitialisera ta vague, niveau, or et stats de base.</p>
      <p style="color:var(--accent-orange)">En échange, tu reçois des <strong>Fragments de Code</strong> pour l'Arbre BioFeedback.</p>
      <p>Ton équipement et ton Arbre sont conservés.</p>`;
    document.getElementById('modalFooter').innerHTML = `
      <button class="btn btn-primary" onclick="app.doPrestige()">⭐ Confirmer</button>
      <button class="btn" onclick="app.closeModal()">Annuler</button>`;
    document.getElementById('modalOverlay').classList.add('active');
  },

  // ============================================
  // PHASE RPG — BADGES RPG
  // ============================================

  checkRPGBadges() {
    const rpg = this.state.rpg;
    if (!rpg) return;
    const badges = this.state.unlockedBadges;
    const today = this.getDateKey(new Date());
    const grant = (id, cond) => { if (cond && !badges[id]) { badges[id] = today; this.showToast(`🏅 Badge : ${this.badges.find(b=>b.id===id)?.emoji||''} ${this.badges.find(b=>b.id===id)?.name||id} !`); } };
    grant('rpg-wave-10',    (rpg.highestWave || 0) >= 10);
    grant('rpg-wave-50',    (rpg.highestWave || 0) >= 50);
    grant('rpg-wave-100',   (rpg.highestWave || 0) >= 100);
    grant('rpg-prestige-1', (rpg.hero.resets || 0) >= 1);
    const equippedCount = Object.values(rpg.equipment || {}).filter(Boolean).length;
    grant('rpg-full-equip', equippedCount >= 8);
    // Check forged epic: any item in inventory or equipped with rarity epic/legendary
    const allItems = [...(rpg.inventory||[]), ...Object.values(rpg.equipment||{}).filter(Boolean)];
    grant('rpg-forged-epic', allItems.some(i => i.rarity === 'epic' || i.rarity === 'legendary'));
    grant('rpg-kanji-1',    (rpg.kanji||[]).length >= 1);
    const unlockedNodes = Object.values(rpg.skillTree||{}).filter(Boolean).length;
    grant('rpg-skill-node', unlockedNodes >= 1);
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
  focusInterval: null,        // Phase 3 — setInterval handle pour le Pomodoro

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
