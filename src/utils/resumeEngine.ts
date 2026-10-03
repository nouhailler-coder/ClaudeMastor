import { TabType } from '../types';

export type ResumableModuleType = 'drill' | 'exam' | 'flashcards' | 'architecture' | 'lab';

export interface ResumeCheckpoint {
  moduleType: ResumableModuleType;
  moduleBadge: string;
  certId: string;
  certCode: string;
  progressPercent: number;
  lastSessionTitle: string;
  stepProgressLabel: string; // e.g., "Question 37 / 50", "Question 24 / 60", "Carte 142 / 500"
  subDetailLabel: string;
  targetTab: TabType;
  updatedAt: string;
  payload: {
    questionId?: number;
    domainId?: number;
    flashcardId?: number;
    architectureCaseId?: string;
    architectureNodeId?: string;
    labExerciseId?: string;
    timeLeftSeconds?: number;
  };
}

export interface ResumeStateStore {
  primaryModule: ResumableModuleType;
  checkpoints: Record<ResumableModuleType, ResumeCheckpoint>;
}

const STORAGE_KEY_RESUME = 'claudemastor_continue_where_left_off_v1';

export const DEFAULT_RESUME_STORE: ResumeStateStore = {
  primaryModule: 'drill',
  checkpoints: {
    drill: {
      moduleType: 'drill',
      moduleBadge: 'Drill ciblé',
      certId: 'cca-p200',
      certCode: 'CCA-P200',
      progressPercent: 64,
      lastSessionTitle: 'Tool Use & MCP',
      stepProgressLabel: 'Question 37 / 50',
      subDetailLabel: 'Série : MCP Resources, tool_choice & is_error',
      targetTab: 'exam',
      updatedAt: 'Il y a 14 min',
      payload: {
        questionId: 37,
        domainId: 3,
      },
    },
    exam: {
      moduleType: 'exam',
      moduleBadge: 'Examen interrompu',
      certId: 'cca-p200',
      certCode: 'CCA-P200',
      progressPercent: 40,
      lastSessionTitle: 'Simulation Officielle CCA-P200',
      stepProgressLabel: 'Question 24 / 60',
      subDetailLabel: 'Temps restant : 01:14:18 · 3 questions marquées',
      targetTab: 'exam',
      updatedAt: 'Hier à 21:40',
      payload: {
        questionId: 24,
        timeLeftSeconds: 74 * 60 + 18,
      },
    },
    flashcards: {
      moduleType: 'flashcards',
      moduleBadge: 'Flashcards SRS',
      certId: 'cca-p200',
      certCode: 'CCA-P200',
      progressPercent: 72,
      lastSessionTitle: 'Tool Use & Model Context Protocol (MCP)',
      stepProgressLabel: 'Carte 37 / 100 (Domaine 3)',
      subDetailLabel: 'Palier SRS : À revoir (intervalle 3j) · 14 cartes dues',
      targetTab: 'flashcards',
      updatedAt: 'Il y a 2 heures',
      payload: {
        flashcardId: 201,
        domainId: 3,
      },
    },
    architecture: {
      moduleType: 'architecture',
      moduleBadge: 'Cas d’architecture',
      certId: 'cca-p200',
      certCode: 'CCA-P200',
      progressPercent: 78,
      lastSessionTitle: 'Cas #027 — Assistant bancaire',
      stepProgressLabel: '4 / 6 briques optimisées (Score : 78 %)',
      subDetailLabel: '2M utilisateurs · P95 < 2s · Budget 50k €/mois (Coût : 63 %)',
      targetTab: 'architecture-cases',
      updatedAt: 'Aujourd’hui',
      payload: {
        architectureCaseId: 'case-027-bank',
        architectureNodeId: 'tools',
      },
    },
    lab: {
      moduleType: 'lab',
      moduleBadge: 'Laboratoire pratique',
      certId: 'cca-p200',
      certCode: 'CCA-P200',
      progressPercent: 82,
      lastSessionTitle: 'Exercice : Tool Use — book_hotel()',
      stepProgressLabel: 'Score actuel : 82 / 100',
      subDetailLabel: 'Schema 100% · Description 80% · Sécurité 60% · Erreur 90%',
      targetTab: 'lab',
      updatedAt: 'Aujourd’hui',
      payload: {
        labExerciseId: 'ex-hotel-tool-use',
      },
    },
  },
};

export function loadResumeStore(): ResumeStateStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RESUME);
    if (!raw) return DEFAULT_RESUME_STORE;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.checkpoints) return DEFAULT_RESUME_STORE;
    return {
      primaryModule: parsed.primaryModule || 'drill',
      checkpoints: {
        ...DEFAULT_RESUME_STORE.checkpoints,
        ...parsed.checkpoints,
      },
    };
  } catch {
    return DEFAULT_RESUME_STORE;
  }
}

export function saveResumeStore(store: ResumeStateStore): void {
  try {
    localStorage.setItem(STORAGE_KEY_RESUME, JSON.stringify(store));
  } catch {
    // ignore storage errors
  }
}

export function updateResumeCheckpoint(
  moduleType: ResumableModuleType,
  partial: Partial<ResumeCheckpoint>,
  makePrimary = true
): ResumeStateStore {
  const current = loadResumeStore();
  const existing = current.checkpoints[moduleType] || DEFAULT_RESUME_STORE.checkpoints[moduleType];
  const updatedCheckpoint: ResumeCheckpoint = {
    ...existing,
    ...partial,
    payload: {
      ...existing.payload,
      ...(partial.payload || {}),
    },
    updatedAt: partial.updatedAt || 'À l’instant',
  };

  const nextStore: ResumeStateStore = {
    primaryModule: makePrimary ? moduleType : current.primaryModule,
    checkpoints: {
      ...current.checkpoints,
      [moduleType]: updatedCheckpoint,
    },
  };

  saveResumeStore(nextStore);
  return nextStore;
}

export function resetResumeStoreToDefaults(): ResumeStateStore {
  saveResumeStore(DEFAULT_RESUME_STORE);
  return DEFAULT_RESUME_STORE;
}
