export type TabType =
  | 'dashboard'
  | 'daily-challenge'
  | 'study-plan'
  | 'architecture-cases'
  | 'skills-badges'
  | 'my-mistakes'
  | 'exam'
  | 'scorecard'
  | 'lab'
  | 'flashcards'
  | 'encyclopedia';

export type TrainingDurationMode =
  | '5min'
  | 'today-5q'
  | '15min'
  | '30min'
  | 'exam-full'
  | 'arch-case';

export interface Flashcard {
  id: number;
  certificationId?: string;
  domainId: number;
  domainCode: string;
  domainTitle: string;
  topic: string;
  question: string;
  answerTitle: string;
  answerBullets: string[];
  keyTakeaway: string;
  docRef: string;
  difficulty: 'Fondamental' | 'Intermédiaire' | 'Avancé';
  relatedArticleId?: string;
}

export interface EncyclopediaArticle {
  id: string;
  term: string;
  acronym?: string;
  domainId: number;
  domainCode: string;
  domainTitle: string;
  shortDefinition: string;
  detailedExplanation: string;
  architecturePrinciple: string;
  codeSnippet?: string;
  codeLanguage?: string;
  codeTitle?: string;
  commonPitfalls: string[];
  bestPractices: string[];
  officialDocUrl?: string;
  relatedFlashcardIds: number[];
}

export interface DomainInfo {
  id: number;
  code: string;
  title: string;
  shortTitle?: string;
  description: string;
  percentage: number;
  weight?: string;
  flashcardsCount?: number;
  keyTopics?: string[];
  status: 'Maîtrisé' | 'En cours' | 'À renforcer';
  questionsCount: number;
  badgeClass: string;
}

export interface CertificationInfo {
  id: string;
  code: string;
  title: string;
  shortTitle: string;
  level: 'Foundations' | 'Professional' | 'Specialty' | 'Expert';
  description: string;
  durationMinutes: number;
  questionsCount: number;
  passingScore: number;
  readinessPercentage: number;
  status: 'En cours' | 'Disponible' | 'Recommandé';
  domainWeights: { domainId: number; weight: number }[];
  targetRole: string;
}

export interface QuestionOption {
  id: string;
  text: string;
  subtext?: string;
  isCorrect?: boolean;
}

export interface ExamQuestion {
  id: number;
  domainId: number;
  domainCode: string;
  domainTitle: string;
  category: string;
  weight: number;
  scenario: string;
  question: string;
  codeSnippet?: string;
  codeLanguage?: string;
  codeFilename?: string;
  slaLatency?: string;
  tokensContext?: string;
  cacheHitTarget?: string;
  diagramNote?: string;
  options: QuestionOption[];
  correctOptionId: string;
  rationale: string;
  sourceDoc: string;
}

export interface ScheduledSession {
  dayOfWeek: string;
  dayNumber: string;
  month: string;
  time: string;
  title: string;
  subtitle: string;
  isOfficialExam?: boolean;
  isOfficeHours?: boolean;
}

export interface TrickyQuestion {
  id: string;
  domainTag: string;
  timeAgo: string;
  title: string;
  description: string;
  userAnswer: string;
  correctAnswer: string;
}

export interface LabWorkshop {
  id: string;
  code: string;
  category: string;
  title: string;
  description: string;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Expert';
}

export type SRSStage = 'new' | 'difficult' | 'review' | 'acquired' | 'consolidated';

export type SRSRating = 'again' | 'hard' | 'good' | 'easy';

export interface SRSCardRecord {
  cardId: number;
  domainId: number;
  stage: SRSStage;
  status: 'mastered' | 'review' | 'unread';
  intervalDays: number; // 0 | 1 | 3 | 7 | 14 | 30 | 60
  repetitions: number;
  easeFactor: number;
  lastRating?: SRSRating;
  nextReviewAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

