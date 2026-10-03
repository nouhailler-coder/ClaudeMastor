import React, { useState, useEffect, useMemo } from 'react';
import { TabType } from '../types';
import { OFFICIAL_CERTIFICATIONS, OFFICIAL_DOMAINS, TRICKY_QUESTIONS } from '../data/mockData';
import { getFlashcardsByCertification } from '../data/flashcardsData';
import { useAuth } from '../context/AuthContext';
import { loadUserFlashcardProgress, loadUserSRSProgress } from '../firebase';
import { loadLocalSRSRecords, isCardDueForReview } from '../utils/srsEngine';
import {
  Target,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  Circle,
  ArrowRight,
  AlertTriangle,
  Layers,
  FileQuestion,
  Terminal,
  BookMarked,
  RotateCcw,
  TrendingUp,
  Award,
  SlidersHorizontal,
  Info,
  Zap,
  Check,
} from 'lucide-react';

interface StudyPlanViewProps {
  activeCertId: string;
  onSelectCertification: (certId: string) => void;
  onNavigateTab: (tab: TabType) => void;
  onSelectDomainFlashcards: (domainId: number) => void;
  onLaunchDomainDrill: (domainId: number) => void;
  onOpenEncyclopedia: (articleId: string) => void;
}

interface CoachingProfile {
  certId: string;
  estimatedLevel: number;
  targetLevel: number;
  daysRemaining: number;
  dailyMinutes: number;
  primaryWeakDomainId: number;
  secondaryWeakDomainId: number;
  strongestDomainId: number;
  domainErrorRates: Record<number, number>;
  flashcardCounts: {
    weakDomainCards: number;
    previousErrorsCount: number;
    dueSpacedRepetitionCards: number;
  };
  labTopic: string;
  miniCaseTitle: string;
  miniCaseArticleId: string;
  miniCaseScenario: string;
  miniCaseSolution: string;
  whyHeadline: string;
  whyDetails: string[];
  projectedGainPoints: number;
}

const COACHING_PROFILES: Record<string, CoachingProfile> = {
  'cca-p200': {
    certId: 'cca-p200',
    estimatedLevel: 71,
    targetLevel: 80,
    daysRemaining: 28,
    dailyMinutes: 35,
    primaryWeakDomainId: 3,
    secondaryWeakDomainId: 5,
    strongestDomainId: 1,
    domainErrorRates: {
      1: 14, // Architecture LLM (86% maîtrise)
      2: 19, // System Prompts & ReAct XML (81% maîtrise)
      3: 31, // Tool Use & MCP (69% maîtrise - Poids 40% !)
      4: 22, // Sécurité Agentique & HITL (78% maîtrise)
      5: 27, // Résilience & FinOps Agentique (73% maîtrise)
    },
    flashcardCounts: {
      weakDomainCards: 10,
      previousErrorsCount: 5,
      dueSpacedRepetitionCards: 6,
    },
    labTopic: 'Exercice Tool Use & Serveur MCP (Transport stdio vs SSE & is_error: true)',
    miniCaseTitle: 'Mini-cas d’architecture : Orchestrator-Workers avec reprise sur erreur MCP',
    miniCaseArticleId: 'mcp-protocol',
    miniCaseScenario:
      'Un agent orchestrateur Claude 3.5 Sonnet interroge 3 serveurs MCP (GitHub, Jira, PostgreSQL). Le serveur MCP Jira renvoie un timeout après 12 secondes tandis que PostgreSQL renvoie une erreur de syntaxe SQL. Comment structurer le retour vers le modèle sans interrompre les 2 autres branches parallèles ?',
    miniCaseSolution:
      '1) Appliquer un timeout strict de 5s par appel tools/call avec Promise.allSettled(). 2) Rassembler les 3 blocs tool_result dans un UNIQUE message role: "user". 3) Marquer les deux échecs avec is_error: true et le message précis du SGBD/timeout pour activer l’auto-correction de Claude au tour suivant.',
    whyHeadline:
      '« Votre taux d’erreur sur MCP & Systèmes Multi-Agents (Domaine 03) est de 31 %, contre 14 % sur Architecture LLM (Domaine 01). »',
    whyDetails: [
      'Le Domaine 03 (Tool Use & MCP) représente à lui seul 40 % de la note finale de la certification CCA-P200.',
      'Vos 3 dernières sessions montrent des hésitations sur le protocole JSON-RPC 2.0 MCP (stdio vs SSE) et le regroupement des blocs tool_result parallèles.',
      'En concentrant 22 minutes sur les 35 minutes d’aujourd’hui sur MCP et vos erreurs passées, votre gain estimé est de +4,2 % sur le score global.',
    ],
    projectedGainPoints: 4.2,
  },
  'cca-f100': {
    certId: 'cca-f100',
    estimatedLevel: 76,
    targetLevel: 85,
    daysRemaining: 21,
    dailyMinutes: 30,
    primaryWeakDomainId: 5,
    secondaryWeakDomainId: 3,
    strongestDomainId: 1,
    domainErrorRates: {
      1: 11, // Architecture LLM & Context Windows
      2: 14, // Prompt Engineering & XML
      3: 24, // Tool Use & MCP
      4: 16, // Sécurité & Constitutional AI
      5: 32, // FinOps, Latence & Production
    },
    flashcardCounts: {
      weakDomainCards: 10,
      previousErrorsCount: 5,
      dueSpacedRepetitionCards: 6,
    },
    labTopic: 'Placement optimal des 4 breakpoints cache_control & Prefilling JSON',
    miniCaseTitle: 'Mini-cas d’architecture : Arbitrage Batch API (-50%) vs Cascade Haiku/Sonnet',
    miniCaseArticleId: 'batch-api',
    miniCaseScenario:
      'Une banque traite chaque nuit 80 000 contrats PDF (non urgents) et gère en journée un chat client exigeant un TTFT < 700 ms. Quelle architecture combine le coût minimal et le respect du SLA ?',
    miniCaseSolution:
      'Router les 80 000 contrats nocturnes vers la Message Batches API (-50% cumulable avec le Prompt Caching du System Prompt) et déployer en journée une cascade Claude 3.5 Haiku (filtrage 70% du trafic) vers Sonnet 3.5 avec streaming SSE.',
    whyHeadline:
      '« Votre taux d’erreur sur FinOps, Latence & Production (Domaine 05) est de 32 %, contre 11 % sur Architecture LLM (Domaine 01). »',
    whyDetails: [
      'Vous maîtrisez déjà 89 % du Domaine 01 (KV-Cache et fenêtre 200k), mais perdez des points sur la réservation OTPM (max_tokens) et la Batch API.',
      'Corriger vos 5 erreurs récurrentes sur le calcul des Rate Limits et le Streaming SSE vous fait franchir directement la barre des 80 %.',
    ],
    projectedGainPoints: 3.8,
  },
  'cca-s300': {
    certId: 'cca-s300',
    estimatedLevel: 68,
    targetLevel: 82,
    daysRemaining: 35,
    dailyMinutes: 40,
    primaryWeakDomainId: 4,
    secondaryWeakDomainId: 3,
    strongestDomainId: 1,
    domainErrorRates: {
      1: 15, // Isolation KV-Cache & ZDR
      2: 18, // Prompts Défensifs & XML
      3: 26, // Sécurité MCP & Anti-Exfiltration
      4: 33, // Constitutional AI, HIPAA & RSP (Poids 45%)
      5: 24, // DLP, SIEM & Anti-DoW
    },
    flashcardCounts: {
      weakDomainCards: 12,
      previousErrorsCount: 5,
      dueSpacedRepetitionCards: 8,
    },
    labTopic: 'Isolation XML avec Nonce Aléatoire & Neutralisation d’Injection Indirecte RAG',
    miniCaseTitle: 'Mini-cas d’architecture : Conformité HIPAA (BAA + ZDR) & Trifecta Létale',
    miniCaseArticleId: 'indirect-prompt-injection',
    miniCaseScenario:
      'Un assistant médical résume des courriers externes de laboratoires (non fiables) et dispose d’un outil d’accès au dossier patient (PHI) ainsi que d’un outil d’envoi d’email externe. Identifiez la vulnérabilité architecturale et le correctif.',
    miniCaseSolution:
      'La combinaison réunit la « Trifecta Létale » (Entrée non fiable + Accès données privées PHI + Exfiltration externe). Il faut supprimer l’outil d’envoi automatique ou imposer une validation Human-in-the-Loop (HITL) signée hors-bande, encapsuler les courriers dans <untrusted_document> échappé et opérer sous BAA + Zero-Data-Retention.',
    whyHeadline:
      '« Votre taux d’erreur sur Constitutional AI, HIPAA & Gouvernance RSP (Domaine 04) est de 33 %, contre 15 % sur Isolation KV-Cache (Domaine 01). »',
    whyDetails: [
      'Le Domaine 04 compte pour 45 % du score de la spécialité CCA-S300 (seuil d’admission exigeant fixé à 800/1000).',
      'Le renforcement ciblé sur les niveaux ASL-2/ASL-3 (Responsible Scaling Policy) et la prévention du Tool Poisoning MCP sécurise vos points les plus fortement pondérés.',
    ],
    projectedGainPoints: 4.9,
  },
  'cca-e400': {
    certId: 'cca-e400',
    estimatedLevel: 66,
    targetLevel: 84,
    daysRemaining: 42,
    dailyMinutes: 45,
    primaryWeakDomainId: 5,
    secondaryWeakDomainId: 1,
    strongestDomainId: 2,
    domainErrorRates: {
      1: 25, // KV-Cache Distribué & Multi-Cloud (Poids 30%)
      2: 13, // Tokenomics & Compression
      3: 21, // Infra MCP HA & Cache Outils
      4: 22, // Gouvernance FinOps & DRP
      5: 34, // Batch API (-50%), Routing & SLA (Poids 35%)
    },
    flashcardCounts: {
      weakDomainCards: 12,
      previousErrorsCount: 6,
      dueSpacedRepetitionCards: 8,
    },
    labTopic: 'Équation Break-Even du KV-Cache & Failover Multi-Cloud (Anthropic / Bedrock / Vertex)',
    miniCaseTitle: 'Mini-cas d’architecture : Délestage QoS (P0/P1/P2) et réservation OTPM sous pic de charge',
    miniCaseArticleId: 'rate-limiting',
    miniCaseScenario:
      'Votre passerelle LLM traite 2 000 req/min mais subit des erreurs HTTP 429 sur le quota OTPM alors que la consommation réelle moyenne n’est que de 180 tokens de sortie par requête. Quelle en est la cause racine et le correctif ?',
    miniCaseSolution:
      'Les développeurs ont laissé max_tokens: 8192 par défaut : l’admission control réserve 8 192 tokens par requête en vol sur le quota OTPM. Calibrer max_tokens au P99 réel (~350 tokens) multiplie par 23 la concurrence autorisée sans erreur 429.',
    whyHeadline:
      '« Votre taux d’erreur sur l’Ingénierie SLA, Batch API & Routage (Domaine 05) est de 34 %, contre 13 % sur la Compression de Prompts (Domaine 02). »',
    whyDetails: [
      'Les Domaines 01 (30 %) et 05 (35 %) totalisent 65 % de l’examen Principal Expert CCA-E400.',
      'Travailler la réservation OTPM, le Provisioned Throughput vs On-Demand et le failover multi-cloud conforme offre le levier de progression le plus rapide.',
    ],
    projectedGainPoints: 5.1,
  },
};

export const StudyPlanView: React.FC<StudyPlanViewProps> = ({
  activeCertId,
  onSelectCertification,
  onNavigateTab,
  onSelectDomainFlashcards,
  onLaunchDomainDrill,
  onOpenEncyclopedia,
}) => {
  const { currentUser } = useAuth();
  const [selectedCertId, setSelectedCertId] = useState<string>(activeCertId || 'cca-p200');
  const [customDays, setCustomDays] = useState<number | null>(null);
  const [customDailyMinutes, setCustomDailyMinutes] = useState<number | null>(null);
  const [customTarget, setCustomTarget] = useState<number | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [showMiniCaseModal, setShowMiniCaseModal] = useState<boolean>(false);
  const [showCaseAnswer, setShowCaseAnswer] = useState<boolean>(false);
  const [userCardProgress, setUserCardProgress] = useState<Record<number, 'mastered' | 'review' | 'unread'>>({});
  const [srsRecords, setSrsRecords] = useState(() => loadLocalSRSRecords());

  useEffect(() => {
    setSrsRecords(loadLocalSRSRecords());
  }, [selectedCertId]);

  useEffect(() => {
    if (activeCertId) {
      setSelectedCertId(activeCertId);
      setCustomDays(null);
      setCustomDailyMinutes(null);
      setCustomTarget(null);
    }
  }, [activeCertId]);

  useEffect(() => {
    const saved = localStorage.getItem(`coaching_tasks_${selectedCertId}`);
    if (saved) {
      try {
        setCompletedTasks(JSON.parse(saved));
      } catch {
        setCompletedTasks({});
      }
    } else {
      setCompletedTasks({});
    }
  }, [selectedCertId]);

  useEffect(() => {
    if (currentUser) {
      loadUserFlashcardProgress(currentUser.uid).then((progress) => {
        if (progress) setUserCardProgress(progress);
      });
      loadUserSRSProgress(currentUser.uid).then((remoteSrs) => {
        if (remoteSrs && Object.keys(remoteSrs).length > 0) {
          setSrsRecords((prev) => ({ ...prev, ...remoteSrs }));
        }
      });
    }
  }, [currentUser]);

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => {
      const next = { ...prev, [taskId]: !prev[taskId] };
      localStorage.setItem(`coaching_tasks_${selectedCertId}`, JSON.stringify(next));
      return next;
    });
  };

  const profile = COACHING_PROFILES[selectedCertId] || COACHING_PROFILES['cca-p200'];
  const certInfo =
    OFFICIAL_CERTIFICATIONS.find((c) => c.id === selectedCertId) || OFFICIAL_CERTIFICATIONS[1];

  const certDeck = useMemo(() => getFlashcardsByCertification(selectedCertId), [selectedCertId]);
  const srsDueCount = useMemo(
    () => certDeck.filter((c) => isCardDueForReview(srsRecords[c.id])).length,
    [certDeck, srsRecords]
  );
  const userMasteredCount = useMemo(
    () =>
      certDeck.filter(
        (c) =>
          userCardProgress[c.id] === 'mastered' ||
          srsRecords[c.id]?.stage === 'acquired' ||
          srsRecords[c.id]?.stage === 'consolidated'
      ).length,
    [certDeck, userCardProgress, srsRecords]
  );

  // Dynamic adjustments based on real flashcard progress if user has interacted
  const dynamicEstimatedLevel = Math.min(
    98,
    profile.estimatedLevel + Math.floor(userMasteredCount / 15)
  );
  const targetLevel = customTarget ?? profile.targetLevel;
  const daysRemaining = customDays ?? profile.daysRemaining;
  const dailyMinutes = customDailyMinutes ?? profile.dailyMinutes;
  const dueCardsCount =
    srsDueCount > 0 ? srsDueCount : profile.flashcardCounts.dueSpacedRepetitionCards;

  const weakDomain =
    OFFICIAL_DOMAINS.find((d) => d.id === profile.primaryWeakDomainId) || OFFICIAL_DOMAINS[2];
  const strongDomain =
    OFFICIAL_DOMAINS.find((d) => d.id === profile.strongestDomainId) || OFFICIAL_DOMAINS[0];

  const dailyExercises = [
    {
      id: 'task-flashcards-weak',
      title: `${profile.flashcardCounts.weakDomainCards} flashcards Domaine ${weakDomain.id} — ${weakDomain.shortTitle || weakDomain.title}`,
      subtitle: `Priorité n°1 • Pondération ${
        certInfo.domainWeights.find((w) => w.domainId === weakDomain.id)?.weight ?? 25
      }% de l'examen ${certInfo.code} • Taux d'erreur actuel : ${
        profile.domainErrorRates[weakDomain.id]
      }%`,
      durationMin: Math.round(dailyMinutes * 0.28),
      icon: Layers,
      actionLabel: `Lancer les ${profile.flashcardCounts.weakDomainCards} cartes`,
      onAction: () => onSelectDomainFlashcards(weakDomain.id),
    },
    {
      id: 'task-previous-errors',
      title: `${profile.flashcardCounts.previousErrorsCount} questions sur les erreurs précédentes`,
      subtitle: `Ciblage des pièges d'examen identifiés lors de vos dernières sessions (${TRICKY_QUESTIONS[0].domainTag}, ${TRICKY_QUESTIONS[1].domainTag})`,
      durationMin: Math.round(dailyMinutes * 0.28),
      icon: FileQuestion,
      actionLabel: 'Corriger mes erreurs',
      onAction: () => onLaunchDomainDrill(weakDomain.id),
    },
    {
      id: 'task-lab-exercise',
      title: `1 exercice pratique : ${profile.labTopic}`,
      subtitle: 'Mise en situation technique dans le Laboratoire interactif Prompt & MCP',
      durationMin: Math.round(dailyMinutes * 0.2),
      icon: Terminal,
      actionLabel: 'Ouvrir le Lab',
      onAction: () => onNavigateTab('lab'),
    },
    {
      id: 'task-mini-case',
      title: `1 mini-cas d'architecture (${certInfo.code})`,
      subtitle: profile.miniCaseTitle,
      durationMin: Math.round(dailyMinutes * 0.14),
      icon: BookMarked,
      actionLabel: 'Étudier le mini-cas',
      onAction: () => {
        setShowCaseAnswer(false);
        setShowMiniCaseModal(true);
      },
    },
    {
      id: 'task-spaced-repetition',
      title: `Révision de ${dueCardsCount} cartes arrivant à échéance`,
      subtitle: 'Répétition espacée (Spaced Repetition) pour consolider la mémoire à long terme avant J-0',
      durationMin: Math.max(3, dailyMinutes - Math.round(dailyMinutes * 0.9)),
      icon: RotateCcw,
      actionLabel: `Réviser les ${dueCardsCount} cartes`,
      onAction: () => onSelectDomainFlashcards(profile.secondaryWeakDomainId),
    },
  ];

  const completedCount = dailyExercises.filter((t) => completedTasks[t.id]).length;
  const dailyProgressPct = Math.round((completedCount / dailyExercises.length) * 100);
  const gapToTarget = Math.max(0, targetLevel - dynamicEstimatedLevel);

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Top Header & Certification Selector */}
      <section className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-4 mb-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap font-mono text-[11px]">
            <span className="text-[#99462a] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Système de Coaching Adaptatif • {certInfo.code}
            </span>
            <span className="text-[#dbc1b9]">·</span>
            <span className="text-[#55433d]">
              Calibré sur vos scores d'examens, vos flashcards et votre historique d'erreurs
            </span>
          </div>
          <h1 className="font-headline text-[32px] lg:text-[40px] text-[#1c1b1b] font-bold tracking-tight leading-tight">
            Plan de Révision Personnalisé
          </h1>
          <p className="text-[15px] text-[#55433d] mt-1 max-w-3xl">
            Votre feuille de route quotidienne générée automatiquement en fonction de l'écart entre votre niveau actuel ({dynamicEstimatedLevel} %) et votre objectif ({targetLevel} %) ainsi que de vos taux d'erreur par domaine.
          </p>
        </div>

        {/* Certification Switcher Pills */}
        <div className="flex items-center gap-1.5 bg-[#f6f3f2] p-1.5 rounded-xl border border-[#eae7e7] flex-wrap">
          {OFFICIAL_CERTIFICATIONS.map((c) => {
            const isSelected = c.id === selectedCertId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setSelectedCertId(c.id);
                  onSelectCertification(c.id);
                }}
                className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-semibold transition-all ${
                  isSelected
                    ? 'bg-[#99462a] text-white shadow-2xs'
                    : 'text-[#55433d] hover:bg-[#eae7e7] hover:text-[#1c1b1b]'
                }`}
              >
                {c.code}
              </button>
            );
          })}
        </div>
      </section>

      {/* Hero Target & Telemetry Summary Card */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Card 1: Objectif Certification */}
        <div className="bg-white rounded-2xl p-5 border border-[#99462a]/40 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#88726c] font-bold">
              Votre Objectif
            </span>
            <Award className="w-4 h-4 text-[#99462a]" />
          </div>
          <div>
            <div className="font-headline text-[28px] text-[#1c1b1b] font-bold leading-none">
              {certInfo.code}
            </div>
            <div className="text-[13px] text-[#55433d] font-medium mt-1 truncate">
              {certInfo.shortTitle}
            </div>
          </div>
          <div className="font-mono text-[10px] text-[#99462a] pt-2 border-t border-[#eae7e7]">
            Seuil officiel : {certInfo.passingScore}/1000 ({certInfo.questionsCount} Qs)
          </div>
        </div>

        {/* Card 2: Échéance Examen */}
        <div className="bg-[#f6f3f2] rounded-2xl p-5 border border-[#eae7e7] shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#88726c] font-bold">
              Échéance Examen
            </span>
            <Calendar className="w-4 h-4 text-[#99462a]" />
          </div>
          <div>
            <div className="font-headline text-[28px] text-[#1c1b1b] font-bold leading-none">
              Dans {daysRemaining} jours
            </div>
            <div className="text-[13px] text-[#55433d] mt-1">
              Rythme : {dailyMinutes} min / jour
            </div>
          </div>
          <div className="flex items-center gap-1.5 pt-2 border-t border-[#eae7e7] font-mono text-[10px]">
            <span className="text-[#88726c]">Ajuster :</span>
            {[14, 28, 45].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setCustomDays(d)}
                className={`px-1.5 py-0.5 rounded ${
                  daysRemaining === d
                    ? 'bg-[#99462a] text-white font-bold'
                    : 'bg-white text-[#55433d] hover:bg-[#eae7e7]'
                }`}
              >
                {d}j
              </button>
            ))}
          </div>
        </div>

        {/* Card 3: Niveau Actuel Estimé */}
        <div className="bg-[#f6f3f2] rounded-2xl p-5 border border-[#eae7e7] shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#88726c] font-bold">
              Niveau Actuel Estimé
            </span>
            <TrendingUp className="w-4 h-4 text-[#99462a]" />
          </div>
          <div>
            <div className="font-headline text-[28px] text-[#1c1b1b] font-bold leading-none">
              {dynamicEstimatedLevel} %
            </div>
            <div className="text-[13px] text-[#55433d] mt-1">
              +{profile.projectedGainPoints}% projetés après la séance
            </div>
          </div>
          <div className="w-full bg-[#e5e2e1] h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="bg-[#99462a] h-full rounded-full transition-all duration-500"
              style={{ width: `${dynamicEstimatedLevel}%` }}
            />
          </div>
        </div>

        {/* Card 4: Objectif Cible */}
        <div className="bg-[#f6f3f2] rounded-2xl p-5 border border-[#eae7e7] shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#88726c] font-bold">
              Objectif Cible
            </span>
            <Target className="w-4 h-4 text-[#2e7d32]" />
          </div>
          <div>
            <div className="font-headline text-[28px] text-[#2e7d32] font-bold leading-none">
              {targetLevel} %
            </div>
            <div className="text-[13px] text-[#55433d] mt-1">
              Écart à combler : +{gapToTarget} points
            </div>
          </div>
          <div className="flex items-center gap-1.5 pt-2 border-t border-[#eae7e7] font-mono text-[10px]">
            <span className="text-[#88726c]">Durée/j :</span>
            {[20, 35, 60].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setCustomDailyMinutes(m)}
                className={`px-1.5 py-0.5 rounded ${
                  dailyMinutes === m
                    ? 'bg-[#99462a] text-white font-bold'
                    : 'bg-white text-[#55433d] hover:bg-[#eae7e7]'
                }`}
              >
                {m}m
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Two-Column Coaching Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Aujourd'hui — 35 min Daily Actionable Checklist */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <div className="bg-[#f6f3f2] rounded-2xl p-6 border border-[#eae7e7] shadow-xs flex flex-col gap-5">
            {/* Session Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#eae7e7]">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 font-mono text-[11px] text-[#99462a] font-bold uppercase tracking-wider">
                  <Clock className="w-4 h-4" />
                  <span>Session Quotidienne Recommandée</span>
                </div>
                <h2 className="font-headline text-[26px] text-[#1c1b1b] font-bold mt-0.5">
                  Aujourd'hui — {dailyMinutes} min
                </h2>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-1">
                <span className="font-mono text-[11px] text-[#55433d] font-semibold">
                  {completedCount} / {dailyExercises.length} exercices terminés ({dailyProgressPct}%)
                </span>
                <div className="w-36 bg-[#e5e2e1] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#2e7d32] h-full rounded-full transition-all duration-500"
                    style={{ width: `${dailyProgressPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 5 Daily Coaching Tasks */}
            <div className="flex flex-col gap-3">
              {dailyExercises.map((exercise, index) => {
                const Icon = exercise.icon;
                const isDone = !!completedTasks[exercise.id];
                return (
                  <div
                    key={exercise.id}
                    className={`rounded-xl p-4 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isDone
                        ? 'bg-[#f0eded]/60 border-[#2e7d32]/30'
                        : 'bg-white border-[#eae7e7] hover:border-[#dbc1b9] shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleTask(exercise.id)}
                        className="mt-0.5 text-[#99462a] hover:scale-105 transition-transform shrink-0"
                        title={isDone ? 'Marquer comme à faire' : 'Marquer comme terminé'}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-[#2e7d32]" />
                        ) : (
                          <Circle className="w-5 h-5 text-[#88726c]" />
                        )}
                      </button>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] font-bold text-[#99462a] uppercase">
                            Étape 0{index + 1} · {exercise.durationMin} min
                          </span>
                          {isDone && (
                            <span className="font-mono text-[10px] text-[#2e7d32] font-bold">
                              · Validé ✓
                            </span>
                          )}
                        </div>
                        <h3
                          className={`font-headline text-[18px] font-semibold leading-snug mt-0.5 ${
                            isDone ? 'line-through text-[#88726c]' : 'text-[#1c1b1b]'
                          }`}
                        >
                          {exercise.title}
                        </h3>
                        <p className="text-[12.5px] text-[#55433d] mt-0.5 leading-relaxed">
                          {exercise.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 sm:pl-2">
                      <button
                        type="button"
                        onClick={exercise.onAction}
                        className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-[#99462a] hover:bg-[#7a2f15] text-white font-mono text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{exercise.actionLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4-Week Progression Roadmap */}
          <div className="bg-[#f6f3f2] rounded-2xl p-6 border border-[#eae7e7] shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#99462a] font-bold">
                  Trajectoire jusqu'à J-0 ({daysRemaining} jours)
                </span>
                <h3 className="font-headline text-[20px] text-[#1c1b1b] font-semibold">
                  Projection de Progression vers {targetLevel} %
                </h3>
              </div>
              <span className="font-mono text-[11px] text-[#2e7d32] font-bold">
                +{gapToTarget} pts en 4 semaines
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {[
                {
                  week: 'Semaine 1',
                  focus: `Correction ${weakDomain.code} (${weakDomain.shortTitle})`,
                  target: `${Math.min(targetLevel, dynamicEstimatedLevel + 3)}%`,
                  active: true,
                },
                {
                  week: 'Semaine 2',
                  focus: 'Drills Erreurs Passées & Labs MCP',
                  target: `${Math.min(targetLevel, dynamicEstimatedLevel + 6)}%`,
                  active: false,
                },
                {
                  week: 'Semaine 3',
                  focus: 'Examens Blancs Chronométrés',
                  target: `${Math.min(targetLevel, dynamicEstimatedLevel + 8)}%`,
                  active: false,
                },
                {
                  week: 'Semaine 4',
                  focus: 'Spaced Repetition & Simulation J-0',
                  target: `${targetLevel}%+`,
                  active: false,
                },
              ].map((step) => (
                <div
                  key={step.week}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2 ${
                    step.active
                      ? 'bg-white border-[#99462a] shadow-2xs'
                      : 'bg-[#f0eded]/70 border-[#eae7e7]'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="font-bold text-[#99462a]">{step.week}</span>
                    <span className="font-bold text-[#1c1b1b]">Cible {step.target}</span>
                  </div>
                  <p className="text-[12px] text-[#55433d] font-medium leading-snug">
                    {step.focus}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Pourquoi ces exercices ? (Diagnostic & Justification) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Diagnostic Rationale Card */}
          <div className="bg-white rounded-2xl p-6 border-2 border-[#99462a]/30 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2 font-mono text-[11px] text-[#99462a] font-bold uppercase tracking-wider">
              <Info className="w-4 h-4" />
              <span>Diagnostic du Coach IA</span>
            </div>

            <h2 className="font-headline text-[24px] text-[#1c1b1b] font-bold leading-snug">
              Pourquoi ces exercices ?
            </h2>

            <blockquote className="p-4 rounded-xl bg-[#ffdbd0]/35 border-l-4 border-[#99462a] font-headline italic text-[17px] text-[#1c1b1b] leading-relaxed">
              {profile.whyHeadline}
            </blockquote>

            <div className="flex flex-col gap-2.5 pt-1">
              {profile.whyDetails.map((detail, i) => (
                <div key={i} className="flex items-start gap-2.5 text-[13.5px] text-[#55433d] leading-relaxed">
                  <span className="font-mono text-[11px] font-bold text-[#99462a] mt-0.5">
                    0{i + 1}.
                  </span>
                  <span>{detail}</span>
                </div>
              ))}
            </div>

            {/* Domain Error Rate vs Exam Weight Comparison */}
            <div className="pt-4 mt-2 border-t border-[#eae7e7] flex flex-col gap-3">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-[#88726c] font-bold">
                <span>Taux d'erreur par domaine vs Poids {certInfo.code}</span>
                <span>Priorité</span>
              </div>

              {OFFICIAL_DOMAINS.map((d) => {
                const errRate = profile.domainErrorRates[d.id] ?? 20;
                const weight =
                  certInfo.domainWeights.find((w) => w.domainId === d.id)?.weight ?? 20;
                const isPrimaryWeak = d.id === profile.primaryWeakDomainId;
                const isStrongest = d.id === profile.strongestDomainId;

                return (
                  <div
                    key={d.id}
                    className={`p-3 rounded-xl border flex flex-col gap-1.5 ${
                      isPrimaryWeak
                        ? 'bg-[#ffdad6]/25 border-[#ba1a1a]/40'
                        : 'bg-[#f6f3f2] border-[#eae7e7]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-bold text-[#1c1b1b] truncate">
                        0{d.id}. {d.shortTitle || d.title}
                      </span>
                      <div className="flex items-center gap-2 shrink-0 font-mono text-[10px]">
                        <span className="text-[#55433d]">Poids {weight}%</span>
                        <span>·</span>
                        <span
                          className={`font-bold ${
                            errRate >= 28
                              ? 'text-[#ba1a1a]'
                              : errRate >= 20
                              ? 'text-[#99462a]'
                              : 'text-[#2e7d32]'
                          }`}
                        >
                          {errRate}% d'erreur
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-[#e5e2e1] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          errRate >= 28
                            ? 'bg-[#ba1a1a]'
                            : errRate >= 20
                            ? 'bg-[#d97757]'
                            : 'bg-[#2e7d32]'
                        }`}
                        style={{ width: `${errRate * 2.2}%` }}
                      />
                    </div>

                    {isPrimaryWeak && (
                      <span className="font-mono text-[10px] text-[#ba1a1a] font-semibold">
                        ⚡ Cible prioritaire de la séance d'aujourd'hui (+{profile.projectedGainPoints}% estimés)
                      </span>
                    )}
                    {isStrongest && (
                      <span className="font-mono text-[10px] text-[#2e7d32] font-semibold">
                        ✓ Acquis solide (maintien par répétition espacée uniquement)
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Mini-Case Architecture Modal */}
      {showMiniCaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1c1b1b]/50 backdrop-blur-xs">
          <div className="bg-[#fcf9f8] border border-[#eae7e7] rounded-2xl max-w-2xl w-full p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#eae7e7]">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#99462a] font-bold">
                  Exercice Quotidien · {certInfo.code} (5 min)
                </span>
                <h3 className="font-headline text-[22px] text-[#1c1b1b] font-bold">
                  {profile.miniCaseTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMiniCaseModal(false)}
                className="font-mono text-[12px] text-[#55433d] hover:text-[#1c1b1b] px-2.5 py-1 rounded-lg bg-[#f0eded]"
              >
                Fermer
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#f6f3f2] border border-[#eae7e7]">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#88726c] font-bold">
                Énoncé du Scénario d'Architecture
              </span>
              <p className="text-[14.5px] text-[#1c1b1b] mt-1.5 leading-relaxed">
                {profile.miniCaseScenario}
              </p>
            </div>

            {!showCaseAnswer ? (
              <button
                type="button"
                onClick={() => setShowCaseAnswer(true)}
                className="w-full py-3 rounded-xl bg-[#99462a] hover:bg-[#7a2f15] text-white font-mono text-[12px] font-semibold transition-colors"
              >
                Révéler la Solution Architecturale Officielle
              </button>
            ) : (
              <div className="p-4 rounded-xl bg-white border border-[#2e7d32]/40 flex flex-col gap-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#2e7d32] font-bold">
                  Solution & Règle d'Architecture {certInfo.code}
                </span>
                <p className="text-[14px] text-[#1c1b1b] leading-relaxed">
                  {profile.miniCaseSolution}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-[#eae7e7]">
              <button
                type="button"
                onClick={() => {
                  setShowMiniCaseModal(false);
                  onOpenEncyclopedia(profile.miniCaseArticleId);
                }}
                className="font-mono text-[11px] text-[#99462a] hover:underline font-semibold"
              >
                Ouvrir le traité complet dans l'Encyclopédie →
              </button>
              <button
                type="button"
                onClick={() => {
                  setCompletedTasks((prev) => {
                    const next = { ...prev, 'task-mini-case': true };
                    localStorage.setItem(`coaching_tasks_${selectedCertId}`, JSON.stringify(next));
                    return next;
                  });
                  setShowMiniCaseModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#2e7d32] text-white font-mono text-[11px] font-semibold flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Valider ce mini-cas (+5 min)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
