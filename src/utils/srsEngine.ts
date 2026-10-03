import { SRSCardRecord, SRSRating, SRSStage } from '../types';

export const SRS_INTERVAL_LADDER = [1, 3, 7, 14, 30, 60] as const;

export interface SRSStageMeta {
  id: SRSStage;
  label: string;
  shortLabel: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  dotColor: string;
  stepIndex: number;
}

export const SRS_STAGE_META: Record<SRSStage, SRSStageMeta> = {
  new: {
    id: 'new',
    label: 'Nouvelle',
    shortLabel: 'Nouvelle',
    description: 'Carte non encore étudiée dans le cycle SRS',
    badgeBg: 'bg-[#f0eded]',
    badgeText: 'text-[#55433d]',
    borderColor: 'border-[#eae7e7]',
    dotColor: 'bg-[#88726c]',
    stepIndex: 0,
  },
  difficult: {
    id: 'difficult',
    label: 'Difficile',
    shortLabel: 'Difficile',
    description: 'Concept non su ou oublié — révision rapprochée à J+1',
    badgeBg: 'bg-[#ffdad6]',
    badgeText: 'text-[#ba1a1a]',
    borderColor: 'border-[#ba1a1a]/30',
    dotColor: 'bg-[#ba1a1a]',
    stepIndex: 1,
  },
  review: {
    id: 'review',
    label: 'À revoir',
    shortLabel: 'À revoir',
    description: 'Maîtrise partielle ou en cours de stabilisation (J+3 à J+7)',
    badgeBg: 'bg-[#fff3e0]',
    badgeText: 'text-[#c65102]',
    borderColor: 'border-[#ffb74d]/50',
    dotColor: 'bg-[#e65100]',
    stepIndex: 2,
  },
  acquired: {
    id: 'acquired',
    label: 'Acquise',
    shortLabel: 'Acquise',
    description: 'Concept su avec assurance — ancrage intermédiaire (J+7 à J+14)',
    badgeBg: 'bg-[#ffdbd0]',
    badgeText: 'text-[#7a2f15]',
    borderColor: 'border-[#d97757]/40',
    dotColor: 'bg-[#d97757]',
    stepIndex: 3,
  },
  consolidated: {
    id: 'consolidated',
    label: 'Consolidée',
    shortLabel: 'Consolidée',
    description: 'Mémoire à long terme validée (J+30 à J+60)',
    badgeBg: 'bg-[#e8f5e9]',
    badgeText: 'text-[#1b5e20]',
    borderColor: 'border-[#2e7d32]/30',
    dotColor: 'bg-[#2e7d32]',
    stepIndex: 4,
  },
};

export interface SRSRatingOption {
  rating: SRSRating;
  emoji: string;
  label: string;
  shortcut: string;
  sublabel: string;
  buttonBg: string;
  buttonHover: string;
  buttonText: string;
  buttonBorder: string;
}

export const SRS_RATING_OPTIONS: SRSRatingOption[] = [
  {
    rating: 'again',
    emoji: '❌',
    label: 'Je ne savais pas',
    shortcut: '1',
    sublabel: 'Retour à Difficile',
    buttonBg: 'bg-white',
    buttonHover: 'hover:bg-[#ffdad6]/60',
    buttonText: 'text-[#ba1a1a]',
    buttonBorder: 'border-[#ffdad6]',
  },
  {
    rating: 'hard',
    emoji: '🟠',
    label: 'Je savais partiellement',
    shortcut: '2',
    sublabel: 'Palier À revoir',
    buttonBg: 'bg-white',
    buttonHover: 'hover:bg-[#fff3e0]',
    buttonText: 'text-[#c65102]',
    buttonBorder: 'border-[#ffe0b2]',
  },
  {
    rating: 'good',
    emoji: '🟢',
    label: 'Je savais',
    shortcut: '3',
    sublabel: 'Progression normale',
    buttonBg: 'bg-[#99462a]',
    buttonHover: 'hover:bg-[#7a2f15]',
    buttonText: 'text-white',
    buttonBorder: 'border-[#99462a]',
  },
  {
    rating: 'easy',
    emoji: '⚡',
    label: 'Trop facile',
    shortcut: '4',
    sublabel: 'Saut de palier SRS',
    buttonBg: 'bg-[#1b5e20]',
    buttonHover: 'hover:bg-[#144718]',
    buttonText: 'text-white',
    buttonBorder: 'border-[#1b5e20]',
  },
];

export interface SRSTransitionOutcome {
  nextStage: SRSStage;
  intervalDays: number;
  legacyStatus: 'mastered' | 'review' | 'unread';
  repetitions: number;
  easeFactor: number;
  nextReviewAt: string;
}

/**
 * Computes the next SRS state and review interval (1, 3, 7, 14, 30, 60 days)
 * based on the card's current SRS record and the user's self-assessment rating.
 *
 * State Machine:
 *   Nouvelle (new)
 *      ↓
 *   Difficile (difficult) ──────┐
 *      ↓                        │ (En cas d'oubli ❌)
 *   À revoir (review)           │
 *      ↓                        │
 *   Acquise (acquired)          │
 *      ↓                        │
 *   Consolidée (consolidated) ←─┘
 */
export function computeNextSRSState(
  current: SRSCardRecord | undefined,
  rating: SRSRating,
  now: Date = new Date()
): SRSTransitionOutcome {
  const currentStage: SRSStage = current?.stage || 'new';
  const currentInterval = current?.intervalDays || 0;
  const prevReps = current?.repetitions || 0;
  const prevEase = current?.easeFactor || 2.5;

  let nextStage: SRSStage = 'review';
  let intervalDays = 1;
  let repetitions = prevReps + 1;
  let easeFactor = prevEase;

  if (rating === 'again') {
    // ❌ Je ne savais pas -> Drops immediately to "Difficile" (including from Consolidée!) with 1 day interval
    nextStage = 'difficult';
    intervalDays = 1;
    repetitions = 0;
    easeFactor = Math.max(1.3, Number((prevEase - 0.2).toFixed(2)));
  } else if (rating === 'hard') {
    // 🟠 Je savais partiellement -> Moves to or stays in "À revoir" with short consolidation (1, 3, or 7 days)
    easeFactor = Math.max(1.3, Number((prevEase - 0.15).toFixed(2)));
    if (currentStage === 'new') {
      nextStage = 'difficult';
      intervalDays = 1;
    } else if (currentStage === 'difficult') {
      nextStage = 'review';
      intervalDays = 3;
    } else if (currentStage === 'review') {
      nextStage = 'review';
      intervalDays = 3;
    } else if (currentStage === 'acquired') {
      nextStage = 'review';
      intervalDays = 7;
    } else {
      // consolidated -> steps back to review (7 days)
      nextStage = 'review';
      intervalDays = 7;
    }
  } else if (rating === 'good') {
    // 🟢 Je savais -> Climbs the state machine and interval ladder (1 -> 3 -> 7 -> 14 -> 30 -> 60)
    easeFactor = Number(prevEase.toFixed(2));
    if (currentStage === 'new') {
      nextStage = 'review';
      intervalDays = 3;
    } else if (currentStage === 'difficult') {
      nextStage = 'review';
      intervalDays = 3;
    } else if (currentStage === 'review') {
      if (currentInterval < 7) {
        nextStage = 'acquired';
        intervalDays = 7;
      } else {
        nextStage = 'acquired';
        intervalDays = 14;
      }
    } else if (currentStage === 'acquired') {
      if (currentInterval < 14) {
        nextStage = 'acquired';
        intervalDays = 14;
      } else {
        nextStage = 'consolidated';
        intervalDays = 30;
      }
    } else {
      // consolidated -> 30d -> 60d
      nextStage = 'consolidated';
      intervalDays = currentInterval >= 30 ? 60 : 30;
    }
  } else {
    // ⚡ Trop facile -> Jumps ahead in the state machine (7 -> 14 -> 30 -> 60 days)
    easeFactor = Math.min(3.0, Number((prevEase + 0.15).toFixed(2)));
    if (currentStage === 'new') {
      nextStage = 'acquired';
      intervalDays = 7;
    } else if (currentStage === 'difficult') {
      nextStage = 'acquired';
      intervalDays = 7;
    } else if (currentStage === 'review') {
      nextStage = 'acquired';
      intervalDays = 14;
    } else if (currentStage === 'acquired') {
      nextStage = 'consolidated';
      intervalDays = 30;
    } else {
      nextStage = 'consolidated';
      intervalDays = 60;
    }
  }

  const legacyStatus: 'mastered' | 'review' | 'unread' =
    nextStage === 'acquired' || nextStage === 'consolidated'
      ? 'mastered'
      : nextStage === 'difficult' || nextStage === 'review'
      ? 'review'
      : 'unread';

  const nextDate = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

  return {
    nextStage,
    intervalDays,
    legacyStatus,
    repetitions,
    easeFactor,
    nextReviewAt: nextDate.toISOString(),
  };
}

export function formatIntervalLabel(days: number): string {
  if (days <= 0) return 'Aujourd’hui';
  if (days === 1) return '1 jour';
  return `${days} jours`;
}

export function isCardDueForReview(record: SRSCardRecord | undefined, now: Date = new Date()): boolean {
  if (!record || record.stage === 'new') return false;
  if (!record.nextReviewAt) return record.stage === 'difficult' || record.stage === 'review';
  const dueTime = new Date(record.nextReviewAt).getTime();
  return !isNaN(dueTime) && dueTime <= now.getTime();
}

export function getDaysUntilDue(record: SRSCardRecord | undefined, now: Date = new Date()): number | null {
  if (!record || record.stage === 'new' || !record.nextReviewAt) return null;
  const diffMs = new Date(record.nextReviewAt).getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

const LOCAL_STORAGE_SRS_KEY = 'claude_architect_srs_records_v1';

/**
 * Generates an initial realistic SRS dataset so the user immediately has
 * cards across all 5 stages (Nouvelle, Difficile, À revoir, Acquise, Consolidée)
 * and due cards ready to test.
 */
function createInitialSeedSRSRecords(): Record<number, SRSCardRecord> {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const seeds: Array<{
    cardId: number;
    domainId: number;
    stage: SRSStage;
    intervalDays: number;
    dueOffsetDays: number; // negative = overdue/due today, positive = in the future
    lastRating: SRSRating;
    repetitions: number;
  }> = [
    // CCA-F100 seeds
    { cardId: 1, domainId: 1, stage: 'consolidated', intervalDays: 30, dueOffsetDays: 18, lastRating: 'good', repetitions: 4 },
    { cardId: 2, domainId: 1, stage: 'acquired', intervalDays: 14, dueOffsetDays: 9, lastRating: 'good', repetitions: 3 },
    { cardId: 3, domainId: 1, stage: 'difficult', intervalDays: 1, dueOffsetDays: 0, lastRating: 'again', repetitions: 1 },
    { cardId: 4, domainId: 1, stage: 'review', intervalDays: 3, dueOffsetDays: -1, lastRating: 'hard', repetitions: 2 },
    { cardId: 5, domainId: 1, stage: 'consolidated', intervalDays: 60, dueOffsetDays: 45, lastRating: 'easy', repetitions: 5 },
    { cardId: 201, domainId: 3, stage: 'difficult', intervalDays: 1, dueOffsetDays: 0, lastRating: 'again', repetitions: 1 },
    { cardId: 202, domainId: 3, stage: 'review', intervalDays: 3, dueOffsetDays: 0, lastRating: 'hard', repetitions: 2 },
    { cardId: 203, domainId: 3, stage: 'acquired', intervalDays: 7, dueOffsetDays: -1, lastRating: 'good', repetitions: 2 },
    { cardId: 204, domainId: 3, stage: 'consolidated', intervalDays: 30, dueOffsetDays: 22, lastRating: 'good', repetitions: 4 },
    // CCA-P200 seeds (IDs 1001-1500)
    { cardId: 1001, domainId: 1, stage: 'consolidated', intervalDays: 60, dueOffsetDays: 52, lastRating: 'easy', repetitions: 5 },
    { cardId: 1002, domainId: 1, stage: 'acquired', intervalDays: 14, dueOffsetDays: 11, lastRating: 'good', repetitions: 3 },
    { cardId: 1201, domainId: 3, stage: 'difficult', intervalDays: 1, dueOffsetDays: 0, lastRating: 'again', repetitions: 1 },
    { cardId: 1202, domainId: 3, stage: 'difficult', intervalDays: 1, dueOffsetDays: -1, lastRating: 'again', repetitions: 1 },
    { cardId: 1203, domainId: 3, stage: 'review', intervalDays: 3, dueOffsetDays: 0, lastRating: 'hard', repetitions: 2 },
    { cardId: 1204, domainId: 3, stage: 'review', intervalDays: 7, dueOffsetDays: 0, lastRating: 'good', repetitions: 2 },
    { cardId: 1205, domainId: 3, stage: 'acquired', intervalDays: 14, dueOffsetDays: 0, lastRating: 'good', repetitions: 3 },
    { cardId: 1206, domainId: 3, stage: 'consolidated', intervalDays: 30, dueOffsetDays: 0, lastRating: 'good', repetitions: 4 },
  ];

  const map: Record<number, SRSCardRecord> = {};
  for (const s of seeds) {
    map[s.cardId] = {
      cardId: s.cardId,
      domainId: s.domainId,
      stage: s.stage,
      status: s.stage === 'acquired' || s.stage === 'consolidated' ? 'mastered' : 'review',
      intervalDays: s.intervalDays,
      repetitions: s.repetitions,
      easeFactor: s.stage === 'difficult' ? 2.1 : s.stage === 'consolidated' ? 2.65 : 2.5,
      lastRating: s.lastRating,
      nextReviewAt: new Date(now + s.dueOffsetDays * dayMs).toISOString(),
      updatedAt: new Date(now - 2 * dayMs).toISOString(),
    };
  }
  return map;
}

export function loadLocalSRSRecords(): Record<number, SRSCardRecord> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SRS_KEY);
    if (!raw) {
      const seeded = createInitialSeedSRSRecords();
      localStorage.setItem(LOCAL_STORAGE_SRS_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw) as Record<number, SRSCardRecord>;
  } catch {
    return createInitialSeedSRSRecords();
  }
}

export function saveLocalSRSRecord(record: SRSCardRecord): void {
  try {
    const current = loadLocalSRSRecords();
    current[record.cardId] = record;
    localStorage.setItem(LOCAL_STORAGE_SRS_KEY, JSON.stringify(current));
  } catch {
    // ignore storage quota errors
  }
}

export function resetLocalSRSRecords(): Record<number, SRSCardRecord> {
  try {
    localStorage.setItem(LOCAL_STORAGE_SRS_KEY, JSON.stringify({}));
  } catch {
    // ignore
  }
  return {};
}
