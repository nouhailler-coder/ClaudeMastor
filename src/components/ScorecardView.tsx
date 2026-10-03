import React, { useState, useMemo } from 'react';
import { TabType } from '../types';
import { loadLocalSRSRecords } from '../utils/srsEngine';
import {
  EXAM_42_60_ERROR_ANALYSIS,
  TARGETED_MCP_DRILL_12_QUESTIONS,
} from '../data/errorAnalysisData';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Award,
  Download,
  Share2,
  Clock,
  Zap,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  PlusCircle,
  Check,
  TrendingUp,
  Activity,
  Flame,
  Layers,
  Target,
  Play,
  RotateCcw,
} from 'lucide-react';

interface ScorecardViewProps {
  onStartRetest: () => void;
  onNavigateTab: (tab: TabType) => void;
}

interface ProgressionMilestone {
  id: string;
  label: string; // J1, J7, J14, J21, J28
  dateLabel: string;
  globalScorePct: number;
  scaledScore: number;
  successRateText: string;
  avgTimePerQuestion: string;
  avgTimeSeconds: number;
  difficultQuestionsCount: number;
  weeklyDeltaPct: number;
  domainScoresPct: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  coachNote: string;
}

const PROGRESSION_TIMELINE: ProgressionMilestone[] = [
  {
    id: 'j1',
    label: 'J1',
    dateLabel: 'Semaine 1 · Diagnostic initial',
    globalScorePct: 58,
    scaledScore: 580,
    successRateText: '35 / 60 réussies (58%)',
    avgTimePerQuestion: '1m 45s',
    avgTimeSeconds: 105,
    difficultQuestionsCount: 24,
    weeklyDeltaPct: 0,
    domainScoresPct: { 1: 70, 2: 62, 3: 48, 4: 60, 5: 46 },
    coachNote: 'Point de départ avant structuration du Prompt Caching et du protocole MCP.',
  },
  {
    id: 'j7',
    label: 'J7',
    dateLabel: 'Semaine 2 · Fondations XML & Cache',
    globalScorePct: 66,
    scaledScore: 660,
    successRateText: '40 / 60 réussies (66%)',
    avgTimePerQuestion: '1m 32s',
    avgTimeSeconds: 92,
    difficultQuestionsCount: 19,
    weeklyDeltaPct: 8,
    domainScoresPct: { 1: 78, 2: 71, 3: 56, 4: 68, 5: 52 },
    coachNote: 'Hausse rapide sur les Domaines 01 & 02 grâce aux flashcards fondamentales.',
  },
  {
    id: 'j14',
    label: 'J14',
    dateLabel: 'Semaine 3 · Passage du seuil (72%)',
    globalScorePct: 73,
    scaledScore: 730,
    successRateText: '44 / 60 réussies (73%)',
    avgTimePerQuestion: '1m 21s',
    avgTimeSeconds: 81,
    difficultQuestionsCount: 15,
    weeklyDeltaPct: 7,
    domainScoresPct: { 1: 84, 2: 79, 3: 65, 4: 75, 5: 58 },
    coachNote: 'Premier passage au-dessus du seuil officiel d’admissibilité (720/1000).',
  },
  {
    id: 'j21',
    label: 'J21',
    dateLabel: 'Semaine dernière · Consolidation MCP',
    globalScorePct: 78,
    scaledScore: 780,
    successRateText: '47 / 60 réussies (78%)',
    avgTimePerQuestion: '1m 16s',
    avgTimeSeconds: 76,
    difficultQuestionsCount: 14,
    weeklyDeltaPct: 5,
    domainScoresPct: { 1: 90, 2: 82, 3: 69, 4: 80, 5: 60 },
    coachNote: 'Stabilisation des workflows multi-agents et baisse du temps de lecture.',
  },
  {
    id: 'j28',
    label: 'J28',
    dateLabel: 'Aujourd’hui · Simulation #04',
    globalScorePct: 85,
    scaledScore: 842,
    successRateText: '51 / 60 réussies (85%)',
    avgTimePerQuestion: '1m 08s',
    avgTimeSeconds: 68,
    difficultQuestionsCount: 9,
    weeklyDeltaPct: 7,
    domainScoresPct: { 1: 94, 2: 88, 3: 80, 4: 85, 5: 66 },
    coachNote: 'Accélération majeure (+11 pts sur Tool Use & MCP cette semaine, -5 questions difficiles).',
  },
];

const DOMAIN_SERIES_META: Array<{
  id: 1 | 2 | 3 | 4 | 5;
  code: string;
  shortName: string;
  color: string;
}> = [
  { id: 1, code: 'D01', shortName: 'Architecture & KV-Cache', color: '#99462a' },
  { id: 2, code: 'D02', shortName: 'Prompt & XML', color: '#d97757' },
  { id: 3, code: 'D03', shortName: 'Tool Use & MCP', color: '#1565c0' },
  { id: 4, code: 'D04', shortName: 'Sécurité & CAI', color: '#2e7d32' },
  { id: 5, code: 'D05', shortName: 'FinOps & Batch API', color: '#c65102' },
];

export const ScorecardView: React.FC<ScorecardViewProps> = ({
  onStartRetest,
  onNavigateTab,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'incorrect' | 'flagged'>('incorrect');
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>('j28');
  const [selectedDomainOverlay, setSelectedDomainOverlay] = useState<number | 'all'>('all');
  const [actionToast, setActionToast] = useState<string | null>(null);
  const [selectedErrorDomainId, setSelectedErrorDomainId] = useState<number>(3); // Default to Tool Use (58%, 7 erreurs)
  const [isTargetedDrillOpen, setIsTargetedDrillOpen] = useState<boolean>(false);
  const [drillSubtopicFilter, setDrillSubtopicFilter] = useState<string>('all');
  const [drillCurrentIdx, setDrillCurrentIdx] = useState<number>(0);
  const [drillAnswers, setDrillAnswers] = useState<Record<number, string>>({});

  const activeErrorDomain =
    EXAM_42_60_ERROR_ANALYSIS.find((d) => d.domainId === selectedErrorDomainId) ||
    EXAM_42_60_ERROR_ANALYSIS[2];

  const filteredDrillQuestions = useMemo(() => {
    if (drillSubtopicFilter === 'all') return TARGETED_MCP_DRILL_12_QUESTIONS;
    return TARGETED_MCP_DRILL_12_QUESTIONS.filter((q) => q.subtopicId === drillSubtopicFilter);
  }, [drillSubtopicFilter]);

  const currentDrillQuestion =
    filteredDrillQuestions[drillCurrentIdx] || TARGETED_MCP_DRILL_12_QUESTIONS[0];

  const drillAnsweredCount = Object.keys(drillAnswers).length;
  const drillCorrectCount = TARGETED_MCP_DRILL_12_QUESTIONS.filter(
    (q) => drillAnswers[q.id] === q.correctOptionId
  ).length;
  const [expandedQuestionIds, setExpandedQuestionIds] = useState<Record<number, boolean>>({
    42: true,
    18: false,
    27: false,
  });
  const [savedToNotebook, setSavedToNotebook] = useState<Record<number, boolean>>({});

  const srsRecords = useMemo(() => loadLocalSRSRecords(), []);
  const srsDifficultCount = useMemo(
    () => Object.values(srsRecords).filter((r) => r.stage === 'difficult').length,
    [srsRecords]
  );

  const selectedMilestone =
    PROGRESSION_TIMELINE.find((m) => m.id === selectedMilestoneId) ||
    PROGRESSION_TIMELINE[PROGRESSION_TIMELINE.length - 1];

  const toggleExpand = (id: number) => {
    setExpandedQuestionIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSaveNotebook = (id: number) => {
    setSavedToNotebook((prev) => ({ ...prev, [id]: true }));
  };

  // Helper to map (index 0..4, score 45..100) to SVG coordinates (width 720, height 240)
  const getChartPoint = (idx: number, pct: number) => {
    const padLeft = 52;
    const padRight = 34;
    const padTop = 22;
    const padBottom = 38;
    const usableW = 720 - padLeft - padRight;
    const usableH = 240 - padTop - padBottom;
    const x = padLeft + (idx / (PROGRESSION_TIMELINE.length - 1)) * usableW;
    const clamped = Math.max(45, Math.min(100, pct));
    const y = padTop + ((100 - clamped) / (100 - 45)) * usableH;
    return { x, y };
  };

  const globalPoints = PROGRESSION_TIMELINE.map((m, i) => getChartPoint(i, m.globalScorePct));
  const globalPolyline = globalPoints.map((p) => `${p.x},${p.y}`).join(' ');
  const globalAreaPath = `${globalPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ')} L ${globalPoints[globalPoints.length - 1].x} 202 L ${globalPoints[0].x} 202 Z`;

  const domainScores = [
    {
      id: 1 as const,
      code: 'DOMAINE 01',
      title: 'Architecture LLM, Tokenizer & Context Windows',
      score: '94%',
      j1Score: '70%',
      j21Score: '90%',
      weeklyGain: '+4%',
      ratio: '17 / 18 questions',
      status: 'Maîtrisé',
      statusColor: 'text-[#99462a]',
      barColor: 'bg-[#99462a]',
      width: '94%',
    },
    {
      id: 2 as const,
      code: 'DOMAINE 02',
      title: 'Prompt Engineering Avancé & Balisage XML',
      score: '88%',
      j1Score: '62%',
      j21Score: '82%',
      weeklyGain: '+6%',
      ratio: '14 / 16 questions',
      status: 'Maîtrisé',
      statusColor: 'text-[#99462a]',
      barColor: 'bg-[#99462a]',
      width: '88%',
    },
    {
      id: 3 as const,
      code: 'DOMAINE 03',
      title: 'Tool Use, JSON Schema & Workflows Multi-Agents (MCP)',
      score: '80%',
      j1Score: '48%',
      j21Score: '69%',
      weeklyGain: '+11%',
      ratio: '8 / 10 questions',
      status: 'Forte progression',
      statusColor: 'text-[#2e7d32]',
      barColor: 'bg-[#99462a]',
      width: '80%',
    },
    {
      id: 4 as const,
      code: 'DOMAINE 04',
      title: 'Sécurité, Constitutional AI & Garde-fous',
      score: '85%',
      j1Score: '60%',
      j21Score: '80%',
      weeklyGain: '+5%',
      ratio: '6 / 7 questions',
      status: 'Maîtrisé',
      statusColor: 'text-[#99462a]',
      barColor: 'bg-[#99462a]',
      width: '85%',
    },
    {
      id: 5 as const,
      code: 'DOMAINE 05',
      title: 'Optimisation Coûts, Latence & Batching API',
      score: '66%',
      j1Score: '46%',
      j21Score: '60%',
      weeklyGain: '+6%',
      ratio: '6 / 9 questions',
      status: 'Attention requise',
      statusColor: 'text-[#ba1a1a]',
      barColor: 'bg-[#ba1a1a]',
      width: '66%',
    },
  ];

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Top Banner: Exam Results & Candidate Attestation */}
      <section className="bg-[#f6f3f2] rounded-3xl p-6 lg:p-8 mb-8 border border-[#eae7e7] shadow-xs flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-mono text-[11px] bg-[#99462a] text-white px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                Résultat : Admissibilité Confirmée (PASS)
              </span>
              <span className="font-mono text-[12px] text-[#55433d]">
                Simulation Blanche #04 • 14 Octobre 2024
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <h1 className="font-headline text-[48px] lg:text-[56px] text-[#1c1b1b] font-bold tracking-tight leading-none">
                842
              </h1>
              <span className="font-headline text-[26px] text-[#88726c] font-normal">
                / 1000 pts
              </span>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <Award className="w-5 h-5 text-[#99462a]" />
              <span className="text-[14px] text-[#55433d] font-medium">
                <strong className="text-[#99462a] font-semibold">+122 points</strong> au-dessus du seuil de qualification officiel (720 pts requis).
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={onStartRetest}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#99462a] hover:bg-[#7a2f15] text-white font-mono text-[12px] font-bold shadow-xs transition-all flex-1 sm:flex-initial"
              type="button"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Lancer un quiz ciblé sur mes 9 erreurs</span>
            </button>

            <button
              onClick={() =>
                setActionToast(
                  'Rapport complet PDF (Certificat CCA-F-842) généré et prêt pour archivage.'
                )
              }
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#f0eded] hover:bg-[#eae7e7] text-[#1c1b1b] font-mono text-[12px] font-medium transition-colors border border-[#eae7e7]"
              type="button"
            >
              <Download className="w-4 h-4 text-[#88726c]" />
              <span>Rapport PDF</span>
            </button>

            <button
              onClick={() =>
                setActionToast(
                  'Lien de vérification d’attestation copié dans le presse-papiers.'
                )
              }
              className="p-3 rounded-xl bg-[#f0eded] hover:bg-[#eae7e7] text-[#55433d] transition-colors border border-[#eae7e7]"
              title="Partager mon attestation"
              type="button"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {actionToast && (
          <div className="px-4 py-2.5 rounded-xl bg-white border border-[#99462a]/30 text-[#1c1b1b] font-mono text-[12px] flex items-center justify-between">
            <span>✓ {actionToast}</span>
            <button
              type="button"
              onClick={() => setActionToast(null)}
              className="text-[#99462a] font-bold hover:underline"
            >
              Fermer
            </button>
          </div>
        )}

        {/* Global Performance Telemetry Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#eae7e7]">
          <div className="bg-[#f0eded] p-4 rounded-2xl flex flex-col border border-[#eae7e7]">
            <span className="font-mono text-[11px] text-[#88726c] uppercase">
              Précision globale
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-headline text-[24px] text-[#1c1b1b] font-bold">
                85.0%
              </span>
              <span className="font-mono text-[12px] text-[#88726c]">
                (51/60 questions)
              </span>
            </div>
          </div>

          <div className="bg-[#f0eded] p-4 rounded-2xl flex flex-col border border-[#eae7e7]">
            <span className="font-mono text-[11px] text-[#88726c] uppercase">
              Temps utilisé
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-headline text-[24px] text-[#1c1b1b] font-bold">
                68m 14s
              </span>
              <span className="font-mono text-[12px] text-[#88726c]">
                (sur 90m allouées)
              </span>
            </div>
          </div>

          <div className="bg-[#f0eded] p-4 rounded-2xl flex flex-col border border-[#eae7e7]">
            <span className="font-mono text-[11px] text-[#88726c] uppercase">
              Cadence moyenne
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-headline text-[24px] text-[#1c1b1b] font-bold">
                1m 08s
              </span>
              <span className="font-mono text-[12px] text-[#88726c]">
                / question (très fluide)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* NEW SECTION: ÉVOLUTION DANS LE TEMPS (J1 -> J7 -> J14 -> J21 -> J28) & "EST-CE QUE JE PROGRESSE ?" */}
      <section className="bg-white rounded-3xl p-6 lg:p-8 mb-10 border border-[#eae7e7] shadow-xs flex flex-col gap-6">
        {/* Header + "Est-ce que je progresse ?" Verdict Banner */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-[#f0eded]">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#99462a]" />
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#99462a] font-bold">
                Dynamique longitudinale (J1 → J28)
              </span>
            </div>
            <h2 className="font-headline text-[28px] lg:text-[32px] text-[#1c1b1b] font-bold leading-tight">
              Évolution dans le temps & Vélocité d’apprentissage
            </h2>
            <p className="text-[14px] text-[#55433d]">
              Suivi consolidé sur 4 semaines (J1, J7, J14, J21, J28) croisant vos examens blancs, le Daily Challenge et le moteur SRS.
            </p>
          </div>

          {/* "Est-ce que je progresse ?" Highlight Box */}
          <div className="bg-[#e8f5e9]/70 border-2 border-[#2e7d32]/30 rounded-2xl p-4 sm:px-5 flex flex-col gap-1 max-w-md shrink-0">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#1b5e20] font-bold flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#2e7d32]" />
                « Est-ce que je progresse ? »
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#2e7d32] text-white font-mono text-[10px] font-bold uppercase">
                OUI · +7% / sem.
              </span>
            </div>
            <p className="text-[13px] text-[#1c1b1b] font-medium leading-snug mt-0.5">
              Trajectoire ascendante continue : <strong>+27 pts</strong> depuis J1 (58% → 85%), temps par question réduit de <strong>37 secondes</strong> et stock de questions difficiles divisé par <strong>2,6</strong>.
            </p>
          </div>
        </div>

        {/* 6 Core Progression Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          <div className="bg-[#fcf9f8] p-3.5 rounded-2xl border border-[#eae7e7] flex flex-col justify-between gap-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#88726c]">
              1. Score global
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-headline text-[24px] font-bold text-[#1c1b1b]">
                {selectedMilestone.globalScorePct}%
              </span>
              <span className="font-mono text-[11px] text-[#2e7d32] font-bold">
                +27% vs J1
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#55433d]">
              {selectedMilestone.scaledScore} / 1000 pts ({selectedMilestone.label})
            </span>
          </div>

          <div className="bg-[#fcf9f8] p-3.5 rounded-2xl border border-[#eae7e7] flex flex-col justify-between gap-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#88726c]">
              2. Score par domaine
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-headline text-[24px] font-bold text-[#99462a]">
                5 / 5
              </span>
              <span className="font-mono text-[11px] text-[#2e7d32] font-bold">
                en hausse
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#55433d]">
              Top gain : MCP (+11% sem.)
            </span>
          </div>

          <div className="bg-[#fcf9f8] p-3.5 rounded-2xl border border-[#eae7e7] flex flex-col justify-between gap-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#88726c]">
              3. Taux de réussite
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-headline text-[24px] font-bold text-[#1c1b1b]">
                85,0%
              </span>
              <span className="font-mono text-[11px] text-[#2e7d32] font-bold">
                PASS
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#55433d]">
              {selectedMilestone.successRateText}
            </span>
          </div>

          <div className="bg-[#fcf9f8] p-3.5 rounded-2xl border border-[#eae7e7] flex flex-col justify-between gap-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#88726c]">
              4. Temps moyen / Q
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-headline text-[24px] font-bold text-[#1c1b1b]">
                {selectedMilestone.avgTimePerQuestion}
              </span>
              <span className="font-mono text-[11px] text-[#2e7d32] font-bold">
                -37s vs J1
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#55433d]">
              J1 : 1m 45s → J21 : 1m 16s
            </span>
          </div>

          <div className="bg-[#fcf9f8] p-3.5 rounded-2xl border border-[#eae7e7] flex flex-col justify-between gap-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#88726c]">
              5. Questions difficiles
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-headline text-[24px] font-bold text-[#ba1a1a]">
                {selectedMilestone.difficultQuestionsCount}
              </span>
              <span className="font-mono text-[11px] text-[#2e7d32] font-bold">
                -15 vs J1
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#55433d]">
              +{srsDifficultCount} cartes SRS « Difficile »
            </span>
          </div>

          <div className="bg-[#fff8f5] p-3.5 rounded-2xl border border-[#f5dad0] flex flex-col justify-between gap-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#99462a] font-bold">
              6. Depuis la sem. dernière
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-headline text-[24px] font-bold text-[#2e7d32]">
                +{selectedMilestone.weeklyDeltaPct}%
              </span>
              <span className="font-mono text-[11px] text-[#99462a] font-bold">
                (J21 → J28)
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#55433d]">
              78% (780 pts) → 85% (842 pts)
            </span>
          </div>
        </div>

        {/* Interactive Chart + Milestone Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left 8 Cols: Interactive SVG Line Chart (J1, J7, J14, J21, J28) */}
          <div className="lg:col-span-8 bg-[#f6f3f2] rounded-2xl p-5 border border-[#eae7e7] flex flex-col justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] uppercase font-bold text-[#1c1b1b]">
                  Courbe d’évolution du score (J1 → J28)
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white border border-[#eae7e7] text-[#99462a] font-bold">
                  Seuil officiel : 72%
                </span>
              </div>

              {/* Domain Overlay Selector */}
              <div className="flex items-center gap-1 flex-wrap font-mono text-[10px]">
                <button
                  type="button"
                  onClick={() => setSelectedDomainOverlay('all')}
                  className={`px-2.5 py-1 rounded-lg border transition-colors ${
                    selectedDomainOverlay === 'all'
                      ? 'bg-[#1c1b1b] text-white border-[#1c1b1b] font-bold'
                      : 'bg-white text-[#55433d] border-[#eae7e7] hover:bg-[#eae7e7]'
                  }`}
                >
                  Score Global + 5 Domaines
                </button>
                {DOMAIN_SERIES_META.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() =>
                      setSelectedDomainOverlay((prev) => (prev === d.id ? 'all' : d.id))
                    }
                    className={`px-2 py-1 rounded-lg border transition-colors flex items-center gap-1 ${
                      selectedDomainOverlay === d.id
                        ? 'bg-[#99462a] text-white border-[#99462a] font-bold'
                        : 'bg-white text-[#55433d] border-[#eae7e7] hover:bg-[#eae7e7]'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: d.color }}
                    />
                    <span>{d.code}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Graph */}
            <div className="w-full overflow-x-auto">
              <svg
                viewBox="0 0 720 240"
                className="w-full h-auto min-w-[520px] select-none"
                role="img"
                aria-label="Graphique d'évolution du score de J1 à J28"
              >
                <defs>
                  <linearGradient id="scoreAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#99462a" stopOpacity="0.24" />
                    <stop offset="100%" stopColor="#99462a" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid Lines: 60%, 70%, 80%, 90%, 100% */}
                {[60, 70, 80, 90, 100].map((val) => {
                  const { y } = getChartPoint(0, val);
                  return (
                    <g key={val}>
                      <line
                        x1={52}
                        y1={y}
                        x2={686}
                        y2={y}
                        stroke="#e2dedd"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                      <text
                        x={42}
                        y={y + 4}
                        textAnchor="end"
                        className="fill-[#88726c] font-mono text-[11px]"
                      >
                        {val}%
                      </text>
                    </g>
                  );
                })}

                {/* Official Passing Threshold Line at 72% */}
                {(() => {
                  const { y } = getChartPoint(0, 72);
                  return (
                    <g>
                      <line
                        x1={52}
                        y1={y}
                        x2={686}
                        y2={y}
                        stroke="#2e7d32"
                        strokeDasharray="6 4"
                        strokeWidth="1.5"
                      />
                      <text
                        x={684}
                        y={y - 5}
                        textAnchor="end"
                        className="fill-[#2e7d32] font-mono text-[9.5px] font-bold"
                      >
                        Seuil PASS (72%)
                      </text>
                    </g>
                  );
                })()}

                {/* Domain Overlay Curves */}
                {DOMAIN_SERIES_META.map((dom) => {
                  if (selectedDomainOverlay !== 'all' && selectedDomainOverlay !== dom.id) {
                    return null;
                  }
                  const pts = PROGRESSION_TIMELINE.map((m, i) =>
                    getChartPoint(i, m.domainScoresPct[dom.id])
                  );
                  const poly = pts.map((p) => `${p.x},${p.y}`).join(' ');
                  const isHighlighted = selectedDomainOverlay === dom.id;
                  return (
                    <g key={dom.id}>
                      <polyline
                        fill="none"
                        stroke={dom.color}
                        strokeWidth={isHighlighted ? '3' : '1.5'}
                        strokeOpacity={isHighlighted ? '1' : '0.45'}
                        strokeDasharray={isHighlighted ? undefined : '2 2'}
                        points={poly}
                      />
                      {isHighlighted &&
                        pts.map((p, idx) => (
                          <circle
                            key={idx}
                            cx={p.x}
                            cy={p.y}
                            r={4}
                            fill={dom.color}
                            stroke="#ffffff"
                            strokeWidth="1.5"
                          />
                        ))}
                    </g>
                  );
                })}

                {/* Area under Global Score Curve */}
                <path d={globalAreaPath} fill="url(#scoreAreaGrad)" />

                {/* Main Global Score Curve (58% -> 66% -> 73% -> 78% -> 85%) */}
                <polyline
                  fill="none"
                  stroke="#99462a"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={globalPolyline}
                />

                {/* Interactive Milestone Nodes (J1, J7, J14, J21, J28) */}
                {PROGRESSION_TIMELINE.map((m, i) => {
                  const pt = globalPoints[i];
                  const isSelected = m.id === selectedMilestone.id;
                  return (
                    <g
                      key={m.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedMilestoneId(m.id)}
                    >
                      {/* Vertical guide on selected milestone */}
                      {isSelected && (
                        <line
                          x1={pt.x}
                          y1={22}
                          x2={pt.x}
                          y2={202}
                          stroke="#99462a"
                          strokeWidth="1"
                          strokeDasharray="2 2"
                        />
                      )}

                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isSelected ? 7 : 5}
                        fill={isSelected ? '#99462a' : '#ffffff'}
                        stroke="#99462a"
                        strokeWidth="3"
                      />

                      {/* Score Label Above Point */}
                      <text
                        x={pt.x}
                        y={pt.y - 12}
                        textAnchor="middle"
                        className={`font-mono text-[11px] font-bold ${
                          isSelected ? 'fill-[#99462a]' : 'fill-[#1c1b1b]'
                        }`}
                      >
                        {m.globalScorePct}%
                      </text>

                      {/* X-Axis Milestone Label (J1, J7, J14, J21, J28) */}
                      <text
                        x={pt.x}
                        y={224}
                        textAnchor="middle"
                        className={`font-mono text-[12px] font-bold ${
                          isSelected ? 'fill-[#99462a]' : 'fill-[#55433d]'
                        }`}
                      >
                        {m.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Bottom Milestone Selector Pills */}
            <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-[#eae7e7] text-[11px] font-mono">
              <span className="text-[#88726c]">
                Cliquez sur un jalon pour inspecter vos métriques à cette date :
              </span>
              <div className="flex items-center gap-1.5">
                {PROGRESSION_TIMELINE.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMilestoneId(m.id)}
                    className={`px-2.5 py-1 rounded-lg border transition-all ${
                      selectedMilestone.id === m.id
                        ? 'bg-[#99462a] text-white border-[#99462a] font-bold shadow-2xs'
                        : 'bg-white text-[#55433d] border-[#eae7e7] hover:bg-[#eae7e7]'
                    }`}
                  >
                    {m.label} ({m.globalScorePct}%)
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right 4 Cols: Selected Milestone Deep-Dive & Domain Progression */}
          <div className="lg:col-span-4 bg-[#fcf9f8] rounded-2xl p-5 border border-[#eae7e7] flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-[#eae7e7] pb-3">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#99462a] font-bold">
                    Inspection du jalon {selectedMilestone.label}
                  </span>
                  <h3 className="font-headline text-[20px] text-[#1c1b1b] font-bold">
                    {selectedMilestone.dateLabel}
                  </h3>
                </div>
                <span className="px-3 py-1 rounded-xl bg-[#99462a] text-white font-headline text-[20px] font-bold">
                  {selectedMilestone.globalScorePct}%
                </span>
              </div>

              <p className="text-[12.5px] text-[#55433d] leading-relaxed bg-white p-3 rounded-xl border border-[#eae7e7]">
                {selectedMilestone.coachNote}
              </p>

              {/* Domain Breakdown at Selected Milestone */}
              <div className="flex flex-col gap-2 pt-1">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#88726c] font-bold">
                  Scores par domaine à {selectedMilestone.label} (vs J1)
                </span>
                {DOMAIN_SERIES_META.map((d) => {
                  const currentVal = selectedMilestone.domainScoresPct[d.id];
                  const j1Val = PROGRESSION_TIMELINE[0].domainScoresPct[d.id];
                  const diff = currentVal - j1Val;
                  return (
                    <div key={d.id} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="text-[#1c1b1b] font-medium">
                          {d.code} · {d.shortName}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#1c1b1b]">{currentVal}%</span>
                          {diff > 0 && (
                            <span className="text-[10px] text-[#2e7d32] font-bold">
                              (+{diff}%)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-full bg-[#eae7e7] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${currentVal}%`,
                            backgroundColor: d.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-[#eae7e7] flex items-center justify-between text-[11px] font-mono text-[#55433d]">
              <span>Cadence : {selectedMilestone.avgTimePerQuestion}/Q</span>
              <span>·</span>
              <span>Difficiles : {selectedMilestone.difficultQuestionsCount} Qs</span>
            </div>
          </div>
        </div>
      </section>

      {/* NEW SECTION: ANALYSE INTELLIGENTE DES ERREURS (42 / 60) & DRILL CIBLÉ (12 QUESTIONS) */}
      <section className="bg-white rounded-3xl p-6 lg:p-8 mb-10 border-2 border-[#99462a]/25 shadow-xs flex flex-col gap-6">
        {/* Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#f0eded]">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-[#ffdad6] text-[#ba1a1a] font-mono text-[10px] uppercase tracking-widest font-bold">
                Analyse Intelligente des Erreurs
              </span>
              <span className="font-mono text-[11px] text-[#55433d]">
                Diagnostic de causes racines post-examen & génération automatique de Drill
              </span>
            </div>
            <h2 className="font-headline text-[28px] lg:text-[32px] text-[#1c1b1b] font-bold leading-tight">
              Pourquoi avez-vous perdu des points ?
            </h2>
          </div>

          {/* Exam Snapshot Badge: 42 / 60 */}
          <div className="flex items-center gap-4 bg-[#fcf9f8] px-5 py-3 rounded-2xl border border-[#eae7e7] shrink-0">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#88726c]">
                Session analysée
              </span>
              <span className="font-headline text-[30px] font-bold text-[#1c1b1b] leading-none mt-0.5">
                42 / 60
              </span>
            </div>
            <div className="h-9 w-px bg-[#eae7e7]" />
            <div className="flex flex-col font-mono text-[11px]">
              <span className="text-[#ba1a1a] font-bold">18 erreurs détectées</span>
              <span className="text-[#55433d]">Dont 7 sur Tool Use (58%)</span>
            </div>
          </div>
        </div>

        {/* 2-Column Root-Cause Layout: Left = 5 Domains (Architecture 82%, Prompt 76%, Tool Use 58% <-, Security 81%, Production 69%) | Right = Pourquoi avez-vous perdu des points ? */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left 5 Cols: Exam 42/60 Domain Breakdown */}
          <div className="lg:col-span-5 bg-[#f6f3f2] rounded-2xl p-5 border border-[#eae7e7] flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#88726c] font-bold">
                Score par domaine (42 / 60) — Cliquez pour inspecter
              </span>
              <h3 className="font-headline text-[20px] text-[#1c1b1b] font-bold">
                Identification du goulot d’étranglement
              </h3>
            </div>

            <div className="flex flex-col gap-2.5">
              {EXAM_42_60_ERROR_ANALYSIS.map((dom) => {
                const isSelected = dom.domainId === selectedErrorDomainId;
                const isWeak = dom.scorePct < 70;
                return (
                  <button
                    key={dom.domainId}
                    type="button"
                    onClick={() => {
                      setSelectedErrorDomainId(dom.domainId);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-white border-[#99462a] ring-1 ring-[#99462a]/25 shadow-xs'
                        : 'bg-[#fcf9f8] border-[#eae7e7] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-bold text-[#1c1b1b]">
                          {dom.shortName}
                        </span>
                        {dom.isPrimaryWeakness && (
                          <span className="px-2 py-0.5 rounded bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-bold">
                            ← Priorité #1
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#88726c]">
                          ({dom.errorCount} {dom.errorCount > 1 ? 'erreurs' : 'erreur'})
                        </span>
                        <span
                          className={`text-[15px] font-bold ${
                            dom.isPrimaryWeakness
                              ? 'text-[#ba1a1a]'
                              : isWeak
                              ? 'text-[#c65102]'
                              : 'text-[#1c1b1b]'
                          }`}
                        >
                          {dom.scorePct}%
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-[#eae7e7] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          dom.isPrimaryWeakness
                            ? 'bg-[#ba1a1a]'
                            : isWeak
                            ? 'bg-[#e65100]'
                            : 'bg-[#99462a]'
                        }`}
                        style={{ width: `${dom.scorePct}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[#eae7e7] font-mono text-[11px] text-[#55433d] flex items-center justify-between">
              <span>Seuil de sécurité par domaine : 75%</span>
              <span className="text-[#ba1a1a] font-bold">Tool Use : -17 pts sous la cible</span>
            </div>
          </div>

          {/* Right 7 Cols: Pourquoi avez-vous perdu des points ? (Tool Use — 7 erreurs -> MCP Resources: 3, Tool choice: 2, erreurs parallèles: 1, is_error: 1) */}
          <div className="lg:col-span-7 bg-[#fff8f5] rounded-2xl p-6 border border-[#f5dad0] flex flex-col justify-between gap-5">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#f5dad0]">
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#99462a] font-bold">
                    Pourquoi avez-vous perdu des points ?
                  </span>
                  <h3 className="font-headline text-[24px] text-[#1c1b1b] font-bold mt-0.5">
                    {activeErrorDomain.shortName} — {activeErrorDomain.errorCount}{' '}
                    {activeErrorDomain.errorCount > 1 ? 'erreurs' : 'erreur'} ({activeErrorDomain.scorePct}%)
                  </h3>
                </div>

                <span className="px-3 py-1 rounded-full bg-white border border-[#f5dad0] font-mono text-[11px] font-bold text-[#99462a] self-start sm:self-center">
                  {activeErrorDomain.subtopics.length} sous-compétences touchées
                </span>
              </div>

              {/* Granular Error Breakdown List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeErrorDomain.subtopics.map((sub) => (
                  <div
                    key={sub.id}
                    className="bg-white rounded-xl p-4 border border-[#eae7e7] shadow-2xs flex flex-col justify-between gap-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[13px] font-bold text-[#1c1b1b]">
                        {sub.label}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] font-mono text-[12px] font-bold shrink-0">
                        {sub.errorCount} {sub.errorCount > 1 ? 'erreurs' : 'erreur'}
                      </span>
                    </div>

                    <p className="text-[12px] text-[#55433d] leading-relaxed">
                      {sub.rootCauseSummary}
                    </p>

                    <div className="pt-2 border-t border-[#f0eded] flex items-center justify-between font-mono text-[10.5px]">
                      <span className="text-[#99462a] font-semibold">
                        → Génère {sub.drillQuestionCount} Qs dans le Drill
                      </span>
                      {activeErrorDomain.domainId === 3 && (
                        <button
                          type="button"
                          onClick={() => {
                            setDrillSubtopicFilter(sub.id);
                            setDrillCurrentIdx(0);
                            setIsTargetedDrillOpen(true);
                          }}
                          className="text-[#1c1b1b] hover:text-[#99462a] underline font-bold cursor-pointer"
                        >
                          Cibler →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Auto-Generated Targeted Drill CTA Box */}
            <div className="bg-gradient-to-r from-[#1c1b1b] to-[#3a261f] text-white rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#ffb59c] font-bold">
                  <Zap className="w-3.5 h-3.5 text-[#d97757] fill-[#d97757]" />
                  <span>Génération automatique sur-mesure</span>
                </div>
                <div className="font-headline text-[22px] font-bold text-white leading-tight">
                  {activeErrorDomain.drillTitle}
                </div>
                <span className="font-mono text-[11px] text-[#d5c2bc]">
                  Calibré sur vos {activeErrorDomain.errorCount} erreurs : 5 MCP Resources · 3 Tool choice · 2 erreurs parallèles · 2 is_error
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setDrillSubtopicFilter('all');
                  setDrillCurrentIdx(0);
                  setIsTargetedDrillOpen((prev) => !prev);
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#d97757] hover:bg-[#c06142] text-white font-mono text-[12px] font-bold shadow-xs transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>
                  {isTargetedDrillOpen
                    ? 'Masquer le Drill MCP'
                    : 'Lancer un Drill ciblé (12 Qs)'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* INTERACTIVE DRILL RUNNER: "Drill MCP — 12 questions" */}
        {isTargetedDrillOpen && currentDrillQuestion && (
          <div className="mt-2 bg-[#fcf9f8] rounded-2xl p-6 border-2 border-[#99462a] flex flex-col gap-5 animate-in fade-in duration-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#eae7e7]">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-[#99462a] text-white font-mono text-[10px] uppercase font-bold">
                    Session d’entraînement corrective active
                  </span>
                  <span className="font-mono text-[11px] text-[#55433d]">
                    Score actuel : <strong>{drillCorrectCount} / {TARGETED_MCP_DRILL_12_QUESTIONS.length}</strong> ({drillAnsweredCount} répondues)
                  </span>
                </div>
                <h3 className="font-headline text-[24px] text-[#1c1b1b] font-bold">
                  Drill MCP — 12 questions (Ciblé sur vos 7 erreurs Tool Use)
                </h3>
              </div>

              {/* Filter by error subtopic */}
              <div className="flex items-center gap-1.5 flex-wrap font-mono text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setDrillSubtopicFilter('all');
                    setDrillCurrentIdx(0);
                  }}
                  className={`px-2.5 py-1 rounded-lg border transition-colors ${
                    drillSubtopicFilter === 'all'
                      ? 'bg-[#1c1b1b] text-white border-[#1c1b1b] font-bold'
                      : 'bg-white text-[#55433d] border-[#eae7e7]'
                  }`}
                >
                  Toutes (12)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDrillSubtopicFilter('mcp-resources');
                    setDrillCurrentIdx(0);
                  }}
                  className={`px-2.5 py-1 rounded-lg border transition-colors ${
                    drillSubtopicFilter === 'mcp-resources'
                      ? 'bg-[#99462a] text-white border-[#99462a] font-bold'
                      : 'bg-white text-[#55433d] border-[#eae7e7]'
                  }`}
                >
                  MCP Resources (5)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDrillSubtopicFilter('tool-choice');
                    setDrillCurrentIdx(0);
                  }}
                  className={`px-2.5 py-1 rounded-lg border transition-colors ${
                    drillSubtopicFilter === 'tool-choice'
                      ? 'bg-[#99462a] text-white border-[#99462a] font-bold'
                      : 'bg-white text-[#55433d] border-[#eae7e7]'
                  }`}
                >
                  Tool choice (3)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDrillSubtopicFilter('parallel-errors');
                    setDrillCurrentIdx(0);
                  }}
                  className={`px-2.5 py-1 rounded-lg border transition-colors ${
                    drillSubtopicFilter === 'parallel-errors'
                      ? 'bg-[#99462a] text-white border-[#99462a] font-bold'
                      : 'bg-white text-[#55433d] border-[#eae7e7]'
                  }`}
                >
                  Erreurs parallèles (2)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDrillSubtopicFilter('is-error');
                    setDrillCurrentIdx(0);
                  }}
                  className={`px-2.5 py-1 rounded-lg border transition-colors ${
                    drillSubtopicFilter === 'is-error'
                      ? 'bg-[#99462a] text-white border-[#99462a] font-bold'
                      : 'bg-white text-[#55433d] border-[#eae7e7]'
                  }`}
                >
                  is_error (2)
                </button>
              </div>
            </div>

            {/* 12-Question Number Bar */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {filteredDrillQuestions.map((q, idx) => {
                const ans = drillAnswers[q.id];
                const isCurrent = idx === drillCurrentIdx;
                let pillStyle = 'bg-white border-[#eae7e7] text-[#55433d]';
                if (isCurrent) {
                  pillStyle = 'bg-[#99462a] text-white border-[#99462a] font-bold';
                } else if (ans) {
                  pillStyle =
                    ans === q.correctOptionId
                      ? 'bg-[#e8f5e9] border-[#2e7d32]/40 text-[#1b5e20] font-bold'
                      : 'bg-[#ffdad6] border-[#ba1a1a]/40 text-[#ba1a1a] font-bold';
                }
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setDrillCurrentIdx(idx)}
                    className={`w-8 h-8 rounded-lg border font-mono text-[11px] flex items-center justify-center transition-all cursor-pointer ${pillStyle}`}
                  >
                    {q.id}
                  </button>
                );
              })}
            </div>

            {/* Current Drill Question Card */}
            <div className="bg-white rounded-2xl p-5 border border-[#eae7e7] flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2 font-mono text-[11px]">
                <span className="px-2.5 py-0.5 rounded-full bg-[#ffdbd0] text-[#7a2f15] font-bold">
                  Question #{currentDrillQuestion.id} / 12 · {currentDrillQuestion.subtopicLabel}
                </span>
                <button
                  type="button"
                  onClick={() => setDrillAnswers({})}
                  className="text-[#88726c] hover:text-[#1c1b1b] flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Réinitialiser le Drill
                </button>
              </div>

              <h4 className="font-headline text-[20px] text-[#1c1b1b] font-semibold leading-snug">
                {currentDrillQuestion.question}
              </h4>

              <div className="flex flex-col gap-2.5">
                {currentDrillQuestion.options.map((opt) => {
                  const chosen = drillAnswers[currentDrillQuestion.id];
                  const isThisSelected = chosen === opt.id;
                  const isCorrectOpt = opt.id === currentDrillQuestion.correctOptionId;

                  let optStyle = 'bg-[#fcf9f8] border-[#eae7e7] hover:bg-[#f6f3f2]';
                  if (chosen) {
                    if (isCorrectOpt) {
                      optStyle = 'bg-[#e8f5e9]/70 border-[#2e7d32] ring-1 ring-[#2e7d32]/25';
                    } else if (isThisSelected) {
                      optStyle = 'bg-[#ffdad6]/50 border-[#ba1a1a]';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        setDrillAnswers((prev) => ({
                          ...prev,
                          [currentDrillQuestion.id]: opt.id,
                        }))
                      }
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${optStyle}`}
                    >
                      <span className="w-6 h-6 rounded-md bg-white border border-[#eae7e7] font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {opt.id}
                      </span>
                      <span className="text-[13.5px] text-[#1c1b1b] leading-relaxed">
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              {drillAnswers[currentDrillQuestion.id] && (
                <div className="p-3.5 rounded-xl bg-[#f6f3f2] border border-[#eae7e7] text-[12.5px] text-[#1c1b1b] leading-relaxed">
                  <strong className="text-[#99462a] font-mono uppercase text-[11px] block mb-0.5">
                    Explication Architecture MCP :
                  </strong>
                  {currentDrillQuestion.explanation}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-[#f0eded]">
                <button
                  type="button"
                  onClick={() =>
                    setDrillCurrentIdx((prev) =>
                      prev > 0 ? prev - 1 : filteredDrillQuestions.length - 1
                    )
                  }
                  className="px-3.5 py-2 rounded-xl bg-[#f6f3f2] hover:bg-[#eae7e7] font-mono text-[11px] font-semibold text-[#1c1b1b]"
                >
                  ← Question précédente
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDrillCurrentIdx((prev) =>
                      prev < filteredDrillQuestions.length - 1 ? prev + 1 : 0
                    )
                  }
                  className="px-4 py-2 rounded-xl bg-[#99462a] hover:bg-[#7a2f15] font-mono text-[11px] font-bold text-white flex items-center gap-1.5"
                >
                  <span>Question suivante</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 2-Column Diagnostic Framework */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-10">
        {/* LEFT 7 COLS: Domain Comparative Analysis */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex flex-col">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#99462a] font-bold">
              Ventilation par compétence (J1 → J21 → J28)
            </span>
            <h2 className="font-headline text-[24px] text-[#1c1b1b]">
              Analyse comparée des 5 Domaines du Syllabus
            </h2>
          </div>

          <div className="bg-[#f6f3f2] rounded-2xl p-6 border border-[#eae7e7] shadow-xs flex flex-col gap-5">
            {domainScores.map((item, idx) => (
              <div key={idx} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#f0eded] text-[#55433d] font-bold">
                      {item.code}
                    </span>
                    <span className="font-headline text-[16px] text-[#1c1b1b] font-semibold">
                      {item.title}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-[11px] text-[#2e7d32] font-bold bg-[#e8f5e9] px-2 py-0.5 rounded">
                      {item.weeklyGain} cette sem.
                    </span>
                    <span className={`font-mono text-[13px] font-bold ${item.statusColor}`}>
                      {item.score}
                    </span>
                    <span className="font-mono text-[11px] text-[#88726c]">
                      ({item.ratio})
                    </span>
                  </div>
                </div>

                <div className="w-full bg-[#eae7e7] h-2 rounded-full overflow-hidden">
                  <div
                    className={`${item.barColor} h-full rounded-full transition-all duration-700`}
                    style={{ width: item.width }}
                  />
                </div>

                <div className="flex items-center justify-between font-mono text-[10px] text-[#88726c]">
                  <span>J1 : {item.j1Score}</span>
                  <span>Semaine dernière (J21) : {item.j21Score}</span>
                  <span className="text-[#1c1b1b] font-semibold">Aujourd’hui (J28) : {item.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT 5 COLS: AI Prescription & Actionable Revision Plan */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex flex-col">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#715a3e] font-bold">
              Recommandations personnalisées
            </span>
            <h2 className="font-headline text-[24px] text-[#1c1b1b]">
              Prescription IA / Plan de Révision Immédiat
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {/* Action 1 */}
            <div className="bg-[#f6f3f2] rounded-2xl p-5 border border-[#eae7e7] shadow-xs flex flex-col gap-2.5 hover:border-[#dbc1b9] transition-all">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] bg-[#ffdad6] text-[#93000a] px-2 py-0.5 rounded font-bold">
                  Domaine 05 • Priorité Haute
                </span>
                <span className="font-mono text-[11px] text-[#88726c]">~5 min</span>
              </div>
              <h3 className="font-headline text-[17px] text-[#1c1b1b] font-semibold leading-snug">
                Revoir le Prompt Caching sur Corpus & Documentation Statique
              </h3>
              <p className="text-[13px] text-[#55433d] leading-relaxed">
                Relire les règles d'abattement de 90% sur tokens de lecture et la politique TTL de 5 minutes.
              </p>
              <button
                onClick={() => onNavigateTab('lab')}
                className="mt-1 font-mono text-[12px] text-[#99462a] hover:underline flex items-center gap-1.5 font-bold"
              >
                <span>Lire la fiche mémo (5 min)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Action 2 */}
            <div className="bg-[#f6f3f2] rounded-2xl p-5 border border-[#eae7e7] shadow-xs flex flex-col gap-2.5 hover:border-[#dbc1b9] transition-all">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] bg-[#f0eded] text-[#55433d] px-2 py-0.5 rounded font-bold">
                  Domaine 03 • Pratique
                </span>
                <span className="font-mono text-[11px] text-[#88726c]">~15 min</span>
              </div>
              <h3 className="font-headline text-[17px] text-[#1c1b1b] font-semibold leading-snug">
                Sécuriser la parallélisation d'appels d'outils simultanés
              </h3>
              <p className="text-[13px] text-[#55433d] leading-relaxed">
                Pratiquer le retour d'arguments sous format JSON Schema strict avec required fields.
              </p>
              <button
                onClick={() => onNavigateTab('lab')}
                className="mt-1 font-mono text-[12px] text-[#99462a] hover:underline flex items-center gap-1.5 font-bold"
              >
                <span>Lancer le Lab #04 (15 min)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Action 3 */}
            <div className="bg-[#f6f3f2] rounded-2xl p-5 border border-[#eae7e7] shadow-xs flex flex-col gap-2.5 hover:border-[#dbc1b9] transition-all">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] bg-[#f0eded] text-[#55433d] px-2 py-0.5 rounded font-bold">
                  Domaine 05 • Quiz
                </span>
                <span className="font-mono text-[11px] text-[#88726c]">~7 min</span>
              </div>
              <h3 className="font-headline text-[17px] text-[#1c1b1b] font-semibold leading-snug">
                Batch API : Délais et garanties de livraison
              </h3>
              <p className="text-[13px] text-[#55433d] leading-relaxed">
                Approfondir le cycle asynchrone 24h et les codes HTTP de complétion.
              </p>
              <button
                onClick={onStartRetest}
                className="mt-1 font-mono text-[12px] text-[#99462a] hover:underline flex items-center gap-1.5 font-bold"
              >
                <span>Quiz flash 5 Qs (7 min)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Question-by-Question Granular Review */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#eae7e7]">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#99462a] font-bold">
              Audit granularisé
            </span>
            <h2 className="font-headline text-[24px] text-[#1c1b1b]">
              Revue détaillée des questions
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-medium transition-colors ${
                activeFilter === 'all'
                  ? 'bg-[#1c1b1b] text-white'
                  : 'bg-[#f0eded] text-[#55433d] hover:bg-[#eae7e7]'
              }`}
            >
              Toutes (60)
            </button>
            <button
              onClick={() => setActiveFilter('incorrect')}
              className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-medium transition-colors ${
                activeFilter === 'incorrect'
                  ? 'bg-[#ba1a1a] text-white font-bold'
                  : 'bg-[#ffdad6] text-[#93000a] hover:bg-[#ffcdd2]'
              }`}
            >
              Incorrectes (9)
            </button>
            <button
              onClick={() => setActiveFilter('flagged')}
              className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-medium transition-colors ${
                activeFilter === 'flagged'
                  ? 'bg-[#715a3e] text-white font-bold'
                  : 'bg-[#fdddb9] text-[#281803] hover:bg-[#e0c29f]'
              }`}
            >
              Marquées (6)
            </button>
          </div>
        </div>

        {/* Featured Detailed Question: Question 42 */}
        <div className="bg-[#f6f3f2] rounded-2xl p-6 border border-[#eae7e7] shadow-xs flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#ffdad6] text-[#93000a] flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[11px] font-bold text-[#ba1a1a]">
                    Incorrecte
                  </span>
                  <span className="text-[#88726c]">•</span>
                  <span className="font-mono text-[11px] text-[#55433d]">
                    Domaine 05 : Coûts, Latence & Batching API
                  </span>
                </div>
                <h3 className="font-headline text-[19px] text-[#1c1b1b] font-semibold mt-1">
                  Question 42 : Prompt Caching sur Corpus Volumineux
                </h3>
              </div>
            </div>

            <button
              onClick={() => toggleExpand(42)}
              className="p-1.5 rounded-lg text-[#88726c] hover:bg-[#f0eded]"
            >
              {expandedQuestionIds[42] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          {expandedQuestionIds[42] && (
            <div className="flex flex-col gap-4 pt-2">
              <p className="text-[14px] text-[#1c1b1b] leading-relaxed">
                Vous concevez un pipeline d'assistance documentaire analysant un corpus juridique statique de 140 000 tokens utilisé par 50 juristes simultanément. Quelle configuration d'API Anthropic garantit la latence au premier token la plus basse tout en réduisant le coût de calcul de manière optimale ?
              </p>

              {/* Your answer vs Correct Answer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Your wrong answer */}
                <div className="bg-white p-4 rounded-xl border border-[#ffdad6] flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[#ba1a1a]">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span className="font-mono text-[11px] font-bold uppercase">
                      Votre réponse : Choix B
                    </span>
                  </div>
                  <p className="text-[13px] text-[#1c1b1b] leading-snug">
                    Diviser le corpus en 14 chunks de 10 000 tokens dans un vector store pgvector et envoyer les 3 meilleurs passages via l'API standard sans cache.
                  </p>
                  <span className="font-mono text-[11px] text-[#ba1a1a]">
                    Entraîne une perte de contexte transversal des clauses juridiques et ne tire pas profit de la fenêtre de 200k.
                  </span>
                </div>

                {/* Correct answer */}
                <div className="bg-white p-4 rounded-xl border border-[#dbc1b9] flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[#99462a]">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span className="font-mono text-[11px] font-bold uppercase">
                      Bonne réponse : Choix D
                    </span>
                  </div>
                  <p className="text-[13px] text-[#1c1b1b] leading-snug">
                    Placer l'intégralité du corpus dans le System Prompt précédé du marqueur cache_control: {"{\"type\": \"ephemeral\"}"}, permettant un abattement de 90% sur les tokens en lecture et une latence divisée par 4.
                  </p>
                  <span className="font-mono text-[11px] text-[#99462a]">
                    Amortit le surcoût d'écriture dès la 2e requête dans la fenêtre TTL de 5 minutes.
                  </span>
                </div>
              </div>

              {/* Underlying Architecture Principle */}
              <div className="bg-[#f0eded] p-4 rounded-xl border border-[#eae7e7] flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[#715a3e]">
                  <BookOpen className="w-4 h-4" />
                  <span className="font-mono text-[11px] uppercase tracking-wider font-bold">
                    Règle d'Architecture Sous-Jacente
                  </span>
                </div>
                <p className="text-[13px] text-[#55433d] leading-relaxed">
                  Le modèle Claude 3.5 Sonnet prend en charge le Prompt Caching à partir de 1 024 tokens. Pour un corpus de 140 000 tokens interrogé en continu par 50 utilisateurs, la création du cache initial coûte 1.25x le prix standard d'écriture, mais toutes les lectures suivantes durant la fenêtre TTL de 5 minutes bénéficient d'une réduction de 90% du coût d'input et d'un gain de TTFT massif de l'ordre de 80%.
                </p>
              </div>

              {/* Source link & Action */}
              <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
                <a
                  href="https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching"
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[11px] text-[#99462a] hover:underline flex items-center gap-1.5"
                >
                  <span>Anthropic Documentation - Prompt Caching Best Practices (v2.1)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => handleSaveNotebook(42)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#eae7e7] font-mono text-[11px] text-[#1c1b1b] border border-[#eae7e7] transition-colors"
                >
                  {savedToNotebook[42] ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#99462a]" />
                      <span>Ajouté au carnet</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-3.5 h-3.5 text-[#88726c]" />
                      <span>Dans mon carnet d'erreurs</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Additional Accordion Question: Question 18 */}
        <div className="bg-[#f6f3f2] rounded-2xl p-5 border border-[#eae7e7] shadow-xs flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#ffdad6] text-[#93000a] flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[11px] font-bold text-[#ba1a1a]">
                    Incorrecte
                  </span>
                  <span className="text-[#88726c]">•</span>
                  <span className="font-mono text-[11px] text-[#55433d]">
                    Domaine 03 : Tool Use & Function Calling
                  </span>
                </div>
                <h3 className="font-headline text-[18px] text-[#1c1b1b] font-semibold mt-0.5">
                  Question 18 : Validation Schéma Strict & Paramètres Requis
                </h3>
              </div>
            </div>

            <button
              onClick={() => toggleExpand(18)}
              className="p-1.5 rounded-lg text-[#88726c] hover:bg-[#f0eded]"
            >
              {expandedQuestionIds[18] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          {expandedQuestionIds[18] && (
            <div className="flex flex-col gap-3 pt-2 text-[13px] text-[#55433d]">
              <p>
                Vous développez un agent de validation comptable connecté à une API SAP via function calling sur Claude 3.5 Sonnet. Comment garantir que le modèle fournisse obligatoirement tous les champs critiques sans omettre les paramètres facultatifs ?
              </p>
              <div className="p-3 bg-white rounded-xl border border-[#eae7e7]">
                <strong className="text-[#99462a]">Solution attendue :</strong> Déclarer les propriétés indispensables dans le tableau <code className="bg-[#f0eded] px-1 py-0.5 rounded text-[#1c1b1b]">required</code> du bloc <code className="bg-[#f0eded] px-1 py-0.5 rounded text-[#1c1b1b]">input_schema</code> sous JSON Schema v4 strict.
              </div>
            </div>
          )}
        </div>

        {/* Additional Accordion Question: Question 27 */}
        <div className="bg-[#f6f3f2] rounded-2xl p-5 border border-[#eae7e7] shadow-xs flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#fdddb9] text-[#281803] flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 text-[#715a3e]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[11px] font-bold text-[#715a3e]">
                    Marquée & Validée
                  </span>
                  <span className="text-[#88726c]">•</span>
                  <span className="font-mono text-[11px] text-[#55433d]">
                    Domaine 02 : Prompt Engineering Avancé
                  </span>
                </div>
                <h3 className="font-headline text-[18px] text-[#1c1b1b] font-semibold mt-0.5">
                  Question 27 : Balisage XML Canonique & Délimiteurs Sémantiques
                </h3>
              </div>
            </div>

            <button
              onClick={() => toggleExpand(27)}
              className="p-1.5 rounded-lg text-[#88726c] hover:bg-[#f0eded]"
            >
              {expandedQuestionIds[27] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          {expandedQuestionIds[27] && (
            <div className="flex flex-col gap-3 pt-2 text-[13px] text-[#55433d]">
              <p>
                L'utilisation de balises XML canoniques distinctes (<code className="bg-[#f0eded] px-1 py-0.5 rounded">&lt;instructions&gt;</code>, <code className="bg-[#f0eded] px-1 py-0.5 rounded">&lt;context&gt;</code>) permet d'isoler hermétiquement les instructions des données potentiellement non fiables.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
