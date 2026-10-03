import React, { useState, useMemo, useEffect } from 'react';
import { updateResumeCheckpoint } from '../utils/resumeEngine';
import {
  Network,
  ShieldCheck,
  Coins,
  Timer,
  Activity,
  Users,
  Database,
  Wrench,
  Lock,
  Cpu,
  ArrowDown,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RotateCcw,
  Sliders,
  ChevronRight,
  Info,
} from 'lucide-react';

type NodeId = 'gateway' | 'agent' | 'rag' | 'tools' | 'memory' | 'guardrails';

interface NodeOption {
  id: string;
  label: string;
  badge: string;
  summary: string;
  deltas: {
    architecture: number;
    security: number;
    cost: number;
    latency: number;
    resilience: number;
  };
  monthlyCostImpactEur: number;
  p95ImpactMs: number;
}

interface ArchitectureCaseSpec {
  id: string;
  caseNumber: string;
  title: string;
  sector: string;
  constraints: {
    users: string;
    contextWindow: string;
    slaP95: string;
    dataSensitivity: string;
    monthlyBudget: string;
  };
  baselineScores: {
    architecture: number;
    security: number;
    cost: number;
    latency: number;
    resilience: number;
  };
}

const CASES_CATALOG: ArchitectureCaseSpec[] = [
  {
    id: 'case-027-bank',
    caseNumber: 'Cas #027',
    title: 'Assistant bancaire',
    sector: 'Retail & Private Banking • Critique',
    constraints: {
      users: '2 millions d’utilisateurs',
      contextWindow: '200k contexte',
      slaP95: 'P95 < 2 s',
      dataSensitivity: 'données sensibles (PCI-DSS / RGPD)',
      monthlyBudget: 'budget : 50k €/mois',
    },
    baselineScores: {
      architecture: 78,
      security: 91,
      cost: 63,
      latency: 74,
      resilience: 81,
    },
  },
  {
    id: 'case-014-health',
    caseNumber: 'Cas #014',
    title: 'Triage clinique & Dossier Patient',
    sector: 'Santé & Hôpitaux • HIPAA / HDS',
    constraints: {
      users: '450k praticiens & patients',
      contextWindow: '200k contexte',
      slaP95: 'P95 < 1,8 s',
      dataSensitivity: 'données sensibles (PHI / HDS / ZDR)',
      monthlyBudget: 'budget : 35k €/mois',
    },
    baselineScores: {
      architecture: 80,
      security: 93,
      cost: 68,
      latency: 72,
      resilience: 84,
    },
  },
  {
    id: 'case-042-legal',
    caseNumber: 'Cas #042',
    title: 'Audit M&A & Corpus Juridique',
    sector: 'LegalTech & Due Diligence',
    constraints: {
      users: '120k juristes & auditeurs',
      contextWindow: '200k contexte',
      slaP95: 'P95 < 2,5 s',
      dataSensitivity: 'secret professionnel & MNDA',
      monthlyBudget: 'budget : 40k €/mois',
    },
    baselineScores: {
      architecture: 82,
      security: 89,
      cost: 61,
      latency: 76,
      resilience: 80,
    },
  },
];

const NODE_CONFIG_OPTIONS: Record<
  NodeId,
  {
    title: string;
    subtitle: string;
    options: NodeOption[];
  }
> = {
  gateway: {
    title: 'API Gateway',
    subtitle: 'Point d’entrée, Rate Limiting & Redaction PII',
    options: [
      {
        id: 'gw-standard',
        label: 'Kong / Envoy + DLP PII Redaction + Rate Limit par tenant',
        badge: 'Sélection actuelle',
        summary:
          'Masque les IBAN/PAN à la volée avant l’appel Anthropic et protège contre le Denial of Wallet.',
        deltas: { architecture: 0, security: 0, cost: 0, latency: 0, resilience: 0 },
        monthlyCostImpactEur: 0,
        p95ImpactMs: 0,
      },
      {
        id: 'gw-semantic-cache',
        label: 'Gateway + Semantic Cache Redis + Streaming SSE direct',
        badge: 'Optimisé Latence & Coût',
        summary:
          'Absorbe 28 % des questions bancaires fréquentes (FAQ, plafonds carte) sans appel LLM et réduit le TTFT.',
        deltas: { architecture: 4, security: 1, cost: 11, latency: 8, resilience: 4 },
        monthlyCostImpactEur: -8500,
        p95ImpactMs: -220,
      },
      {
        id: 'gw-naive',
        label: 'Reverse Proxy simple sans filtrage PII ni quotas tokens',
        badge: 'Risqué',
        summary:
          'Expose les numéros de compte en clair et vulnérable aux attaques par saturation de contexte 200k.',
        deltas: { architecture: -12, security: -34, cost: -18, latency: 2, resilience: -15 },
        monthlyCostImpactEur: 14000,
        p95ImpactMs: -40,
      },
    ],
  },
  agent: {
    title: 'Agent (Orchestrateur LLM)',
    subtitle: 'Choix du modèle Claude, routage & Prompt Caching',
    options: [
      {
        id: 'agent-standard',
        label: 'Claude 3.5 Sonnet unique sur 100 % du trafic (Prompt Caching partiel)',
        badge: 'Sélection actuelle',
        summary:
          'Excellente qualité de raisonnement, mais sur-dimensionné pour 70 % des requêtes simples (solde, statut carte), ce qui dégrade le score Coût (63 %).',
        deltas: { architecture: 0, security: 0, cost: 0, latency: 0, resilience: 0 },
        monthlyCostImpactEur: 0,
        p95ImpactMs: 0,
      },
      {
        id: 'agent-cascade',
        label: 'Routeur Cascade : Haiku 3.5 (70 % intentions simples) + Sonnet 3.5 (30 % complexe)',
        badge: 'Recommandé FinOps',
        summary:
          'Divise par 3,5 la facture mensuelle tout en abaissant le P95 sous 1,55 s grâce à la vélocité de Haiku.',
        deltas: { architecture: 9, security: 1, cost: 22, latency: 12, resilience: 5 },
        monthlyCostImpactEur: -16500,
        p95ImpactMs: -380,
      },
      {
        id: 'agent-opus',
        label: 'Claude 3 Opus / Extended Thinking 8k tokens sur chaque tour',
        badge: 'Hors budget & SLA',
        summary:
          'Explose le budget de 50k €/mois (> 160k €/mois) et fait grimper le P95 au-delà de 6,5 secondes.',
        deltas: { architecture: -15, security: 0, cost: -38, latency: -42, resilience: -8 },
        monthlyCostImpactEur: 95000,
        p95ImpactMs: 4200,
      },
    ],
  },
  rag: {
    title: 'RAG (200k Contexte)',
    subtitle: 'Stratégie d’injection documentaire & KV-Cache',
    options: [
      {
        id: 'rag-standard',
        label: 'Injection 200k Conditions Générales + Contrats avec 1 breakpoint cache_control',
        badge: 'Sélection actuelle',
        summary:
          'Bonne couverture des 200k tokens, mais en cas de cache miss (expiration TTL 5 min), la latence P95 grimpe à 2,35 s.',
        deltas: { architecture: 0, security: 0, cost: 0, latency: 0, resilience: 0 },
        monthlyCostImpactEur: 0,
        p95ImpactMs: 0,
      },
      {
        id: 'rag-contextual',
        label: 'Contextual Retrieval (Top-15 chunks XML) + Préfixe Réglementaire Caché (4 breakpoints)',
        badge: 'Optimal P95 < 2s',
        summary:
          'Garde le socle réglementaire en KV-Cache chaud (>92 % hit rate) et n’injecte que les clauses pertinentes du client.',
        deltas: { architecture: 6, security: 2, cost: 9, latency: 9, resilience: 4 },
        monthlyCostImpactEur: -6200,
        p95ImpactMs: -310,
      },
    ],
  },
  tools: {
    title: 'Tool Server (MCP Bancaire)',
    subtitle: 'Exécution des outils Core Banking, parallélisme & résilience',
    options: [
      {
        id: 'tools-standard',
        label: 'Serveur MCP Core Banking avec mTLS (appels séquentiels sans Circuit Breaker)',
        badge: 'Sélection actuelle',
        summary:
          'Sécurité mTLS irréprochable, mais l’exécution séquentielle de get_account() puis check_limits() pénalise le P95.',
        deltas: { architecture: 0, security: 0, cost: 0, latency: 0, resilience: 0 },
        monthlyCostImpactEur: 0,
        p95ImpactMs: 0,
      },
      {
        id: 'tools-parallel-cb',
        label: 'MCP Parallèle (Promise.allSettled) + Circuit Breaker 1,2s + Idempotency Key',
        badge: 'Haute Résilience',
        summary:
          'Exécute les lectures en parallèle en 1 seul aller-retour et isole les pannes via is_error: true.',
        deltas: { architecture: 4, security: 2, cost: 2, latency: 6, resilience: 12 },
        monthlyCostImpactEur: -800,
        p95ImpactMs: -190,
      },
    ],
  },
  memory: {
    title: 'Memory (État Conversationnel)',
    subtitle: 'Gestion de l’historique multi-tours pour 2M d’utilisateurs',
    options: [
      {
        id: 'mem-standard',
        label: 'Historique intégral non compressé + Redis TTL 30 min',
        badge: 'Sélection actuelle',
        summary:
          'Conserve tout le fil mais alourdit progressivement les tokens d’entrée après le 6e tour de conversation.',
        deltas: { architecture: 0, security: 0, cost: 0, latency: 0, resilience: 0 },
        monthlyCostImpactEur: 0,
        p95ImpactMs: 0,
      },
      {
        id: 'mem-sliding-kv',
        label: 'Fenêtre glissante (6 derniers tours) + Synthèse structurée XML cachée',
        badge: 'Économe en tokens',
        summary:
          'Stabilise la taille du prompt quel que soit le nombre de tours et maintient le coût sous contrôle.',
        deltas: { architecture: 3, security: 1, cost: 6, latency: 4, resilience: 2 },
        monthlyCostImpactEur: -4200,
        p95ImpactMs: -90,
      },
    ],
  },
  guardrails: {
    title: 'Guardrails & Conformité',
    subtitle: 'Protection ZDR, Anti-Injection & Validation Humaine (HITL)',
    options: [
      {
        id: 'guard-standard',
        label: 'Zero Data Retention (ZDR) + Filtre Prompt Injection + Balisage XML strict',
        badge: 'Sélection actuelle',
        summary:
          'Confère un score Sécurité élevé (91 %). Il ne manque que le jeton de validation 2FA/HITL obligatoire sur les virements sortants.',
        deltas: { architecture: 0, security: 0, cost: 0, latency: 0, resilience: 0 },
        monthlyCostImpactEur: 0,
        p95ImpactMs: 0,
      },
      {
        id: 'guard-hitl-complete',
        label: 'ZDR + Validation HITL 2FA sur outils d’écriture + Guardrails asynchrones parallèles',
        badge: 'Sécurité 98 %',
        summary:
          'Verrouille les opérations sensibles par signature 2FA côté serveur MCP sans ajouter de latence série.',
        deltas: { architecture: 2, security: 7, cost: 0, latency: 1, resilience: 3 },
        monthlyCostImpactEur: 0,
        p95ImpactMs: -20,
      },
    ],
  },
};

export const ArchitectureCasesView: React.FC = () => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case-027-bank');
  const activeCase =
    CASES_CATALOG.find((c) => c.id === selectedCaseId) || CASES_CATALOG[0];

  const [selectedNodeId, setSelectedNodeId] = useState<NodeId>('agent');
  const [nodeChoices, setNodeChoices] = useState<Record<NodeId, string>>({
    gateway: 'gw-standard',
    agent: 'agent-standard',
    rag: 'rag-standard',
    tools: 'tools-standard',
    memory: 'mem-standard',
    guardrails: 'guard-standard',
  });

  // Reset to baseline (78% Architecture, 91% Sécurité, 63% Coût, 74% Latence, 81% Résilience)
  const handleResetBaseline = () => {
    setNodeChoices({
      gateway: 'gw-standard',
      agent: 'agent-standard',
      rag: 'rag-standard',
      tools: 'tools-standard',
      memory: 'mem-standard',
      guardrails: 'guard-standard',
    });
  };

  // Apply optimal architecture across all 6 nodes
  const handleApplyOptimalArchitecture = () => {
    setNodeChoices({
      gateway: 'gw-semantic-cache',
      agent: 'agent-cascade',
      rag: 'rag-contextual',
      tools: 'tools-parallel-cb',
      memory: 'mem-sliding-kv',
      guardrails: 'guard-hitl-complete',
    });
  };

  // Compute the 5 evaluation scores + projected Cost & P95 + causal explanations ("Et explique pourquoi")
  const evaluation = useMemo(() => {
    const base = activeCase.baselineScores;
    let arch = base.architecture;
    let sec = base.security;
    let cost = base.cost;
    let lat = base.latency;
    let res = base.resilience;

    let projectedMonthlyEur = 64500; // Baseline exceeds 50k€ budget -> explains why Cost is 63%!
    let projectedP95Ms = 2350; // Baseline is 2.35s -> explains why Latency is 74% vs < 2s target!

    (Object.keys(nodeChoices) as NodeId[]).forEach((nodeKey) => {
      const choiceId = nodeChoices[nodeKey];
      const foundOpt = NODE_CONFIG_OPTIONS[nodeKey].options.find((o) => o.id === choiceId);
      if (foundOpt) {
        arch += foundOpt.deltas.architecture;
        sec += foundOpt.deltas.security;
        cost += foundOpt.deltas.cost;
        lat += foundOpt.deltas.latency;
        res += foundOpt.deltas.resilience;
        projectedMonthlyEur += foundOpt.monthlyCostImpactEur;
        projectedP95Ms += foundOpt.p95ImpactMs;
      }
    });

    const clamp = (v: number) => Math.max(15, Math.min(99, v));
    arch = clamp(arch);
    sec = clamp(sec);
    cost = clamp(cost);
    lat = clamp(lat);
    res = clamp(res);

    const globalAvg = Math.round((arch + sec + cost + lat + res) / 5);

    const isCascadeActive = nodeChoices.agent === 'agent-cascade';
    const isContextualRag = nodeChoices.rag === 'rag-contextual';
    const isParallelTools = nodeChoices.tools === 'tools-parallel-cb';
    const isHitlActive = nodeChoices.guardrails === 'guard-hitl-complete';

    const criteria = [
      {
        id: 'architecture',
        label: 'Architecture',
        score: arch,
        whyTitle: isCascadeActive
          ? 'Découplage modulaire & Routage Cascade Haiku/Sonnet optimal'
          : 'Séparation propre Agent / RAG / MCP, mais absence de routage par complexité',
        whyExplanation: isCascadeActive
          ? 'Votre pipeline sépare clairement l’API Gateway, le routeur Haiku/Sonnet et les 4 sous-systèmes (RAG, Tool Server, Memory, Guardrails) avec 4 breakpoints KV-Cache.'
          : 'La topologie User → API Gateway → Agent → [RAG, Tool Server, Memory, Guardrails] est bien découplée (78 %), mais envoyer 100 % des requêtes des 2M d’utilisateurs vers un modèle unique sans triage d’intention crée un goulot architectural.',
        targetNode: 'agent' as NodeId,
      },
      {
        id: 'security',
        label: 'Sécurité',
        score: sec,
        whyTitle: isHitlActive
          ? 'Protection bancaire complète : DLP + ZDR + Confirmation HITL 2FA'
          : 'Excellente isolation des données sensibles (91 %), manque uniquement le verrou HITL sur virement',
        whyExplanation: isHitlActive
          ? 'Masquage PII sur l’API Gateway, accord Zero Data Retention (ZDR) et validation 2FA obligatoire sur le Tool Server avant tout mouvement financier.'
          : 'Le filtrage PII sur l’API Gateway et l’isolation XML dans les Guardrails protègent efficacement les données sensibles (91 %). Pour dépasser 95 %, imposez un jeton de confirmation 2FA (HITL) côté Tool Server sur les outils transactionnels.',
        targetNode: 'guardrails' as NodeId,
      },
      {
        id: 'cost',
        label: 'Coût',
        score: cost,
        whyTitle:
          projectedMonthlyEur <= 50000
            ? `Budget respecté : ~${Math.round(projectedMonthlyEur / 1000)}k €/mois (cible ≤ 50k €/mois)`
            : `Dépassement budgétaire : ~${(projectedMonthlyEur / 1000).toFixed(1)}k €/mois pour une cible de 50k €/mois`,
        whyExplanation:
          projectedMonthlyEur <= 50000
            ? 'Grâce au routage Haiku 3.5 sur les requêtes simples + Semantic Cache + 4 breakpoints Prompt Caching, la facture mensuelle descend sous la barre des 50k €/mois.'
            : 'Point faible principal (63 %) : avec 2 millions d’utilisateurs et un contexte pouvant atteindre 200k tokens, l’utilisation systématique de Sonnet 3.5 sans routeur Haiku ni compression de mémoire projette un coût de 64,5k €/mois (+29 % hors budget).',
        targetNode: 'agent' as NodeId,
      },
      {
        id: 'latency',
        label: 'Latence',
        score: lat,
        whyTitle:
          projectedP95Ms <= 2000
            ? `SLA tenu : P95 estimé à ${(projectedP95Ms / 1000).toFixed(2)} s (cible < 2,0 s)`
            : `SLA dépassé : P95 estimé à ${(projectedP95Ms / 1000).toFixed(2)} s (cible < 2,0 s)`,
        whyExplanation:
          projectedP95Ms <= 2000
            ? 'Le pré-chauffage du KV-Cache combiné aux appels MCP parallèles (Promise.allSettled) maintient le P95 largement sous la barre des 2 secondes.'
            : 'À 74 %, votre P95 atteint ~2,35 s lors des pics : l’injection de larges blocs 200k en cache froid combinée aux appels séquentiels vers le Tool Server ajoute ~450 ms de trop. Parallélisez RAG + Guardrails et activez Contextual Retrieval.',
        targetNode: 'rag' as NodeId,
      },
      {
        id: 'resilience',
        label: 'Résilience',
        score: res,
        whyTitle: isParallelTools
          ? 'Isolation des pannes MCP (Promise.allSettled + Circuit Breaker 1,2s)'
          : 'Bonne tolérance aux pannes LLM (81 %), mais Tool Server sans Circuit Breaker',
        whyExplanation: isParallelTools
          ? 'En cas de lenteur d’une API bancaire interne, le Circuit Breaker coupe à 1,2 s et renvoie is_error: true sans bloquer la réponse globale de l’agent.'
          : 'Le basculement multi-région est bien prévu (81 %), mais si un sous-service du Tool Server met 4 secondes à répondre, toute la requête utilisateur bloque. Ajoutez un Circuit Breaker court et une clé d’idempotence.',
        targetNode: 'tools' as NodeId,
      },
    ];

    return {
      arch,
      sec,
      cost,
      lat,
      res,
      globalAvg,
      projectedMonthlyEur,
      projectedP95Ms,
      criteria,
    };
  }, [activeCase, nodeChoices]);

  const activeNodeConfig = NODE_CONFIG_OPTIONS[selectedNodeId];

  useEffect(() => {
    updateResumeCheckpoint(
      'architecture',
      {
        progressPercent: evaluation.globalAvg,
        lastSessionTitle: `${activeCase.caseNumber} — ${activeCase.title}`,
        stepProgressLabel: `Score global : ${evaluation.globalAvg} % (Nœud : ${activeNodeConfig.title})`,
        subDetailLabel: `Architecture ${evaluation.arch}% · Sécurité ${evaluation.sec}% · Coût ${evaluation.cost}% · Latence ${evaluation.lat}%`,
        payload: {
          architectureCaseId: selectedCaseId,
          architectureNodeId: selectedNodeId,
        },
      },
      true
    );
  }, [selectedCaseId, selectedNodeId, evaluation.globalAvg]);

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Top Header & Case Selector */}
      <section className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-4 mb-6 pb-4 border-b border-[#eae7e7]">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#99462a] uppercase tracking-widest font-bold">
            <Network className="w-4 h-4" />
            <span>Simulateur de Design Système LLM • Architecture Cases</span>
          </div>
          <h1 className="font-headline text-[30px] lg:text-[36px] text-[#1c1b1b] font-bold tracking-tight leading-tight">
            Architecture Cases — Conception & Arbitrages
          </h1>
          <p className="text-[14.5px] text-[#55433d] max-w-3xl">
            Construisez votre architecture cible sous contraintes réelles de trafic, de contexte, de latence P95, de conformité et de budget FinOps, puis analysez le diagnostic causal sur 5 axes.
          </p>
        </div>

        {/* Case Switcher */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {CASES_CATALOG.map((c) => {
            const isSelected = c.id === selectedCaseId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setSelectedCaseId(c.id);
                  handleResetBaseline();
                }}
                className={`px-3.5 py-2 rounded-xl font-mono text-[12px] border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#1c1b1b] text-white border-[#1c1b1b] font-bold shadow-xs'
                    : 'bg-white text-[#55433d] border-[#eae7e7] hover:bg-[#f6f3f2]'
                }`}
              >
                {c.caseNumber} — {c.title}
              </button>
            );
          })}
        </div>
      </section>

      {/* Case Constraints Banner (Cas #027 — Assistant bancaire : 2M users, 200k contexte, P95 < 2s, données sensibles, budget : 50k €/mois) */}
      <section className="bg-gradient-to-r from-[#1c1b1b] via-[#2b221f] to-[#3a261f] text-white rounded-3xl p-6 mb-6 shadow-sm flex flex-col gap-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-md bg-[#d97757] text-white font-mono text-[11px] font-bold uppercase tracking-wider">
                {activeCase.caseNumber} — {activeCase.title}
              </span>
              <span className="font-mono text-[11px] text-[#d5c2bc]">{activeCase.sector}</span>
            </div>
            <h2 className="font-headline text-[26px] sm:text-[30px] font-bold text-white mt-0.5">
              {activeCase.caseNumber} — {activeCase.title}
            </h2>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleResetBaseline}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-[11px] font-semibold border border-white/15 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Architecture Initiale (78% / 91% / 63% / 74% / 81%)</span>
            </button>
            <button
              type="button"
              onClick={handleApplyOptimalArchitecture}
              className="px-4 py-2 rounded-xl bg-[#d97757] hover:bg-[#c06142] text-white font-mono text-[11px] font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Appliquer les optimisations FinOps & P95</span>
            </button>
          </div>
        </div>

        {/* The 5 Official Constraints Pills */}
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#ffb59c] font-bold">
            Contraintes impératives du cahier des charges :
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="bg-white/8 border border-white/12 rounded-2xl p-3.5 flex items-center gap-3">
              <Users className="w-5 h-5 text-[#ffb59c] shrink-0" />
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-[#d5c2bc] uppercase">Volumétrie</span>
                <span className="font-headline text-[17px] font-bold text-white">
                  {activeCase.constraints.users}
                </span>
              </div>
            </div>

            <div className="bg-white/8 border border-white/12 rounded-2xl p-3.5 flex items-center gap-3">
              <Database className="w-5 h-5 text-[#ffb59c] shrink-0" />
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-[#d5c2bc] uppercase">Fenêtre</span>
                <span className="font-headline text-[17px] font-bold text-white">
                  {activeCase.constraints.contextWindow}
                </span>
              </div>
            </div>

            <div className="bg-white/8 border border-white/12 rounded-2xl p-3.5 flex items-center gap-3">
              <Timer className="w-5 h-5 text-[#ffb59c] shrink-0" />
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-[#d5c2bc] uppercase">SLA Latence</span>
                <span className="font-headline text-[17px] font-bold text-white">
                  {activeCase.constraints.slaP95}
                </span>
              </div>
            </div>

            <div className="bg-white/8 border border-white/12 rounded-2xl p-3.5 flex items-center gap-3">
              <Lock className="w-5 h-5 text-[#ffb59c] shrink-0" />
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-[#d5c2bc] uppercase">Conformité</span>
                <span className="font-headline text-[16px] font-bold text-white leading-tight">
                  {activeCase.constraints.dataSensitivity}
                </span>
              </div>
            </div>

            <div className="bg-white/8 border border-white/12 rounded-2xl p-3.5 flex items-center gap-3 col-span-2 sm:col-span-1">
              <Coins className="w-5 h-5 text-[#ffb59c] shrink-0" />
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-[#d5c2bc] uppercase">Cible FinOps</span>
                <span className="font-headline text-[17px] font-bold text-white">
                  {activeCase.constraints.monthlyBudget}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main 2-Column Interactive Architecture Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT 6 COLS: Interactive Architecture Blueprint (User -> API Gateway -> Agent -> [RAG, Tool Server, Memory, Guardrails]) + Node Configurator */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          {/* Interactive Topology Canvas */}
          <div className="bg-white rounded-3xl p-6 border border-[#eae7e7] shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#f0eded] pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#99462a] font-bold">
                  Schéma d’Architecture Interactif
                </span>
                <h3 className="font-headline text-[21px] text-[#1c1b1b] font-bold">
                  Cliquez sur une brique pour configurer ses composants
                </h3>
              </div>
              <span className="font-mono text-[11px] text-[#88726c]">6 briques actives</span>
            </div>

            {/* Visual Tree Diagram:
                User
                 ↓
                API Gateway
                 ↓
                Agent
                 ├── RAG
                 ├── Tool Server
                 ├── Memory
                 └── Guardrails
            */}
            <div className="bg-[#f6f3f2] rounded-2xl p-5 border border-[#eae7e7] flex flex-col items-center">
              {/* 1. USER NODE */}
              <div className="px-5 py-2.5 rounded-xl bg-white border border-[#eae7e7] font-mono text-[12px] font-bold text-[#1c1b1b] flex items-center gap-2 shadow-2xs">
                <Users className="w-4 h-4 text-[#99462a]" />
                <span>User (2M clients bancaires · Web & Mobile)</span>
              </div>

              <ArrowDown className="w-4 h-4 text-[#88726c] my-1.5" />

              {/* 2. API GATEWAY NODE */}
              <button
                type="button"
                onClick={() => setSelectedNodeId('gateway')}
                className={`w-full max-w-md p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  selectedNodeId === 'gateway'
                    ? 'bg-[#fff8f5] border-[#99462a] ring-2 ring-[#99462a]/20 shadow-xs'
                    : 'bg-white border-[#eae7e7] hover:border-[#dbc1b9]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#99462a] text-white flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-mono text-[12px] font-bold text-[#1c1b1b]">
                      API Gateway
                    </div>
                    <div className="font-mono text-[10.5px] text-[#55433d] truncate">
                      {
                        NODE_CONFIG_OPTIONS.gateway.options.find(
                          (o) => o.id === nodeChoices.gateway
                        )?.label
                      }
                    </div>
                  </div>
                </div>
                <Sliders className="w-4 h-4 text-[#99462a] shrink-0 ml-2" />
              </button>

              <ArrowDown className="w-4 h-4 text-[#88726c] my-1.5" />

              {/* 3. AGENT NODE */}
              <button
                type="button"
                onClick={() => setSelectedNodeId('agent')}
                className={`w-full max-w-md p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  selectedNodeId === 'agent'
                    ? 'bg-[#fff8f5] border-[#99462a] ring-2 ring-[#99462a]/20 shadow-xs'
                    : 'bg-white border-[#eae7e7] hover:border-[#dbc1b9]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#1c1b1b] text-white flex items-center justify-center shrink-0">
                    <Cpu className="w-4 h-4 text-[#ffb59c]" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-mono text-[13px] font-bold text-[#1c1b1b]">
                      Agent (Orchestrateur Claude)
                    </div>
                    <div className="font-mono text-[10.5px] text-[#55433d] truncate">
                      {
                        NODE_CONFIG_OPTIONS.agent.options.find(
                          (o) => o.id === nodeChoices.agent
                        )?.label
                      }
                    </div>
                  </div>
                </div>
                <Sliders className="w-4 h-4 text-[#99462a] shrink-0 ml-2" />
              </button>

              {/* 4. TREE BRANCHES: ├── RAG, ├── Tool Server, ├── Memory, └── Guardrails */}
              <div className="w-full max-w-md pl-5 sm:pl-8 mt-2 flex flex-col gap-2.5 border-l-2 border-[#dbc1b9] ml-6">
                {(
                  [
                    { id: 'rag' as NodeId, prefix: '├──', label: 'RAG', icon: Database },
                    {
                      id: 'tools' as NodeId,
                      prefix: '├──',
                      label: 'Tool Server',
                      icon: Wrench,
                    },
                    { id: 'memory' as NodeId, prefix: '├──', label: 'Memory', icon: Activity },
                    {
                      id: 'guardrails' as NodeId,
                      prefix: '└──',
                      label: 'Guardrails',
                      icon: Lock,
                    },
                  ] as const
                ).map((branch) => {
                  const Icon = branch.icon;
                  const isSel = selectedNodeId === branch.id;
                  const currentOpt = NODE_CONFIG_OPTIONS[branch.id].options.find(
                    (o) => o.id === nodeChoices[branch.id]
                  );

                  return (
                    <button
                      key={branch.id}
                      type="button"
                      onClick={() => setSelectedNodeId(branch.id)}
                      className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isSel
                          ? 'bg-[#fff8f5] border-[#99462a] ring-1 ring-[#99462a]/25 shadow-2xs'
                          : 'bg-white border-[#eae7e7] hover:border-[#dbc1b9]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono text-[12px] text-[#99462a] font-bold shrink-0">
                          {branch.prefix}
                        </span>
                        <Icon className="w-4 h-4 text-[#99462a] shrink-0" />
                        <div className="min-w-0">
                          <div className="font-mono text-[12px] font-bold text-[#1c1b1b]">
                            {branch.label}
                          </div>
                          <div className="font-mono text-[10px] text-[#55433d] truncate">
                            {currentOpt?.label}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#88726c] shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Selected Node Configuration Drawer */}
          <div className="bg-white rounded-3xl p-6 border-2 border-[#99462a]/25 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#f0eded] pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#99462a] font-bold">
                  Paramétrage de la brique sélectionnée
                </span>
                <h3 className="font-headline text-[22px] text-[#1c1b1b] font-bold">
                  {activeNodeConfig.title} — {activeNodeConfig.subtitle}
                </h3>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              {activeNodeConfig.options.map((opt) => {
                const isChosen = nodeChoices[selectedNodeId] === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      setNodeChoices((prev) => ({
                        ...prev,
                        [selectedNodeId]: opt.id,
                      }))
                    }
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col gap-1.5 cursor-pointer ${
                      isChosen
                        ? 'bg-[#fff8f5] border-[#99462a] ring-1 ring-[#99462a]/25'
                        : 'bg-[#fcf9f8] border-[#eae7e7] hover:bg-[#f6f3f2]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-semibold text-[14px] text-[#1c1b1b]">
                        {opt.label}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                          isChosen
                            ? 'bg-[#99462a] text-white'
                            : 'bg-[#eae7e7] text-[#55433d]'
                        }`}
                      >
                        {isChosen ? '✓ Actif' : opt.badge}
                      </span>
                    </div>
                    <p className="text-[12.5px] text-[#55433d] leading-relaxed">{opt.summary}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT 6 COLS: 5-Axis Evaluation & Causal Explanations ("Et explique pourquoi") */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-7 border border-[#eae7e7] shadow-sm flex flex-col gap-6">
          {/* Header + Live Financial & Latency Telemetry */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#f0eded]">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-widest text-[#99462a] font-bold">
                Audit d’Architecture & Pourquoi
              </span>
              <h3 className="font-headline text-[28px] text-[#1c1b1b] font-bold leading-tight mt-0.5">
                Évaluation sur 5 Piliers
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`px-3.5 py-2 rounded-2xl border font-mono text-[11px] ${
                  evaluation.projectedMonthlyEur <= 50000
                    ? 'bg-[#e8f5e9] border-[#2e7d32]/30 text-[#1b5e20]'
                    : 'bg-[#ffdad6]/60 border-[#ba1a1a]/30 text-[#ba1a1a]'
                }`}
              >
                <span className="block text-[9.5px] uppercase opacity-80">Coût projeté</span>
                <strong className="text-[14px]">
                  {(evaluation.projectedMonthlyEur / 1000).toFixed(1)}k € / mois
                </strong>
              </div>

              <div
                className={`px-3.5 py-2 rounded-2xl border font-mono text-[11px] ${
                  evaluation.projectedP95Ms <= 2000
                    ? 'bg-[#e8f5e9] border-[#2e7d32]/30 text-[#1b5e20]'
                    : 'bg-[#fff3e0] border-[#ffb74d] text-[#c65102]'
                }`}
              >
                <span className="block text-[9.5px] uppercase opacity-80">Latence P95</span>
                <strong className="text-[14px]">
                  {(evaluation.projectedP95Ms / 1000).toFixed(2)} s
                </strong>
              </div>
            </div>
          </div>

          {/* 5 Score Cards:
              Architecture : 78 %
              Sécurité : 91 %
              Coût : 63 %
              Latence : 74 %
              Résilience : 81 %
              + Detailed "Pourquoi" explanation for each!
          */}
          <div className="flex flex-col gap-4">
            {evaluation.criteria.map((item) => {
              const isStrong = item.score >= 85;
              const isMid = item.score >= 70 && item.score < 85;
              const barColor = isStrong
                ? 'bg-[#2e7d32]'
                : isMid
                ? 'bg-[#d97757]'
                : 'bg-[#ba1a1a]';
              const scoreColor = isStrong
                ? 'text-[#2e7d32]'
                : isMid
                ? 'text-[#99462a]'
                : 'text-[#ba1a1a]';

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[#fcf9f8] border border-[#eae7e7] flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-headline text-[21px] font-bold text-[#1c1b1b]">
                        {item.label}
                      </span>
                      <span
                        className={`font-mono text-[20px] font-bold ${scoreColor}`}
                      >
                        {item.score} %
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedNodeId(item.targetNode)}
                      className="font-mono text-[11px] text-[#99462a] hover:underline font-semibold cursor-pointer"
                    >
                      Inspecter la brique →
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[#eae7e7] h-2 rounded-full overflow-hidden">
                    <div
                      className={`${barColor} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>

                  {/* Causal Explanation ("Et explique pourquoi") */}
                  <div className="pt-1 flex flex-col gap-1">
                    <div className="font-mono text-[11px] font-bold text-[#1c1b1b] flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-[#99462a] shrink-0" />
                      <span>Pourquoi {item.score} % : {item.whyTitle}</span>
                    </div>
                    <p className="text-[12.5px] text-[#55433d] leading-relaxed pl-5">
                      {item.whyExplanation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
