export type SkillTierId = 'beginner' | 'practitioner' | 'advanced' | 'expert';

export interface SkillBadgeCondition {
  id: string;
  label: string;
  targetText: string;
  currentValue: number;
  requiredValue: number;
  unit: 'questions' | 'percent' | 'exams' | 'labs';
  actionTab: 'exam' | 'lab' | 'flashcards' | 'architecture-cases' | 'daily-challenge';
  actionLabel: string;
}

export interface SkillBadgeLevel {
  id: string;
  tier: SkillTierId;
  tierLabel: 'Beginner' | 'Practitioner' | 'Advanced' | 'Expert';
  dotEmoji: '🔵' | '🟢' | '🟣' | '🔴';
  badgeName: string;
  shortDescription: string;
  competencyProof: string;
  unlockedByDefault: boolean;
  unlockedAt?: string;
  conditions: {
    questionsRequired: number;
    minAccuracyPercent: number;
    examsPassedRequired: number;
    practicalLabsRequired: number;
  };
  skillsValidated: string[];
}

export interface DomainSkillTrack {
  domainId: number;
  domainCode: string;
  shortTag: string;
  domainTitle: string;
  description: string;
  defaultStats: {
    questionsAnswered: number;
    accuracyPercent: number;
    examsPassed: number;
    practicalLabsPassed: number;
  };
  levels: SkillBadgeLevel[];
}

export const TIER_VISUAL_META: Record<
  SkillTierId,
  {
    dot: '🔵' | '🟢' | '🟣' | '🔴';
    label: string;
    rankNumber: number;
    colorHex: string;
    bgHex: string;
    borderHex: string;
    tagline: string;
  }
> = {
  beginner: {
    dot: '🔵',
    label: 'Beginner',
    rankNumber: 1,
    colorHex: '#1565c0',
    bgHex: '#f0f7ff',
    borderHex: '#bbdefb',
    tagline: 'Fondamentaux syntaxiques & concepts de base validés',
  },
  practitioner: {
    dot: '🟢',
    label: 'Practitioner',
    rankNumber: 2,
    colorHex: '#2e7d32',
    bgHex: '#f2faf3',
    borderHex: '#c8e6c9',
    tagline: 'Compétence opérationnelle prouvée sur examens et exercices Lab',
  },
  advanced: {
    dot: '🟣',
    label: 'Advanced',
    rankNumber: 3,
    colorHex: '#6a1b9a',
    bgHex: '#faf2ff',
    borderHex: '#e1bee7',
    tagline: 'Maîtrise des cas limites, erreurs parallèles et architectures complexes',
  },
  expert: {
    dot: '🔴',
    label: 'Expert',
    rankNumber: 4,
    colorHex: '#ba1a1a',
    bgHex: '#fff5f5',
    borderHex: '#ffcdd2',
    tagline: 'Autorité d’architecte certifié sous contraintes de production',
  },
};

export const DOMAIN_SKILL_TRACKS: DomainSkillTrack[] = [
  {
    domainId: 2,
    domainCode: 'DOMAINE 2',
    shortTag: 'MCP',
    domainTitle: 'Tool Use & Model Context Protocol (MCP)',
    description:
      'Conception de JSON Schemas stricts, serveurs MCP (Resources, Prompts, Tools), tool_choice forcé, appels parallèles et gestion granulaire via is_error.',
    defaultStats: {
      questionsAnswered: 58,
      accuracyPercent: 82,
      examsPassed: 3,
      practicalLabsPassed: 2,
    },
    levels: [
      {
        id: 'mcp-beginner',
        tier: 'beginner',
        tierLabel: 'Beginner',
        dotEmoji: '🔵',
        badgeName: 'MCP Beginner',
        shortDescription:
          'Compréhension du cycle tool_use / tool_result et de l’architecture client-serveur MCP.',
        competencyProof:
          'Capable de distinguer Resources, Prompts et Tools dans un serveur MCP et de déclarer un outil JSON Schema valide.',
        unlockedByDefault: true,
        unlockedAt: 'Acquis à J7',
        conditions: {
          questionsRequired: 20,
          minAccuracyPercent: 70,
          examsPassedRequired: 1,
          practicalLabsRequired: 1,
        },
        skillsValidated: [
          'Cycle tool_use → tool_result',
          'Primitives MCP (Resources vs Tools)',
          'Validation JSON Schema de base',
        ],
      },
      {
        id: 'mcp-practitioner',
        tier: 'practitioner',
        tierLabel: 'Practitioner',
        dotEmoji: '🟢',
        badgeName: 'MCP Practitioner',
        shortDescription:
          'Maîtrise opérationnelle des outils Claude et du protocole MCP en conditions réelles d’examen et de Lab.',
        competencyProof:
          '50 questions MCP validées avec ≥ 80 % de réussite, 3 examens réussis et 2 exercices pratiques d’implémentation d’outils réussis.',
        unlockedByDefault: true,
        unlockedAt: 'Acquis à J21',
        conditions: {
          questionsRequired: 50,
          minAccuracyPercent: 80,
          examsPassedRequired: 3,
          practicalLabsRequired: 2,
        },
        skillsValidated: [
          'Schémas JSON stricts (book_hotel, idempotence, gardes-fous)',
          'Gestion des erreurs d’outils avec is_error: true',
          'Sélection déterministe via tool_choice (auto, any, tool)',
          'Exposition de données passives via MCP Resources (URI)',
        ],
      },
      {
        id: 'mcp-advanced',
        tier: 'advanced',
        tierLabel: 'Advanced',
        dotEmoji: '🟣',
        badgeName: 'MCP Advanced',
        shortDescription:
          'Orchestration d’appels d’outils parallèles, sécurité anti-SSRF et transport MCP distribué.',
        competencyProof:
          'Résolution sans faute des cas d’erreurs parallèles (message user unique) et sécurisation des schémas contre les injections.',
        unlockedByDefault: false,
        conditions: {
          questionsRequired: 100,
          minAccuracyPercent: 85,
          examsPassedRequired: 5,
          practicalLabsRequired: 4,
        },
        skillsValidated: [
          'Agrégation de tool_result parallèles dans un seul message user',
          'Protection anti-injection et validation stricte additionalProperties: false',
          'Transport MCP Streamable HTTP / SSE avec authentification OAuth',
        ],
      },
      {
        id: 'mcp-expert',
        tier: 'expert',
        tierLabel: 'Expert',
        dotEmoji: '🔴',
        badgeName: 'MCP Expert',
        shortDescription:
          'Architecture de serveurs MCP fédérés à haute disponibilité et gouvernance d’outils bancaires/critiques.',
        competencyProof:
          'Excellence complète sur le corpus MCP (150+ questions ≥ 90 %, 8 examens, 6 exercices pratiques & cas d’architecture).',
        unlockedByDefault: false,
        conditions: {
          questionsRequired: 150,
          minAccuracyPercent: 90,
          examsPassedRequired: 8,
          practicalLabsRequired: 6,
        },
        skillsValidated: [
          'Architecture Tool Server isolé mTLS pour systèmes bancaires (Cas #027)',
          'Idempotence distribuée et disjoncteurs (circuit-breakers) sur outils',
          'Audit de conformité et traçabilité de bout en bout des appels MCP',
        ],
      },
    ],
  },
  {
    domainId: 1,
    domainCode: 'DOMAINE 1',
    shortTag: 'Agentic',
    domainTitle: 'Architecture Agentique & Orchestration',
    description:
      'Boucles autonomes vs workflows déterministes, routage multi-agents Orchestrator-Workers, délégation bornée et contrôle des coûts.',
    defaultStats: {
      questionsAnswered: 112,
      accuracyPercent: 88,
      examsPassed: 5,
      practicalLabsPassed: 4,
    },
    levels: [
      {
        id: 'agentic-beginner',
        tier: 'beginner',
        tierLabel: 'Beginner',
        dotEmoji: '🔵',
        badgeName: 'Agentic Beginner',
        shortDescription:
          'Distinction claire entre workflow prédéfini (Prompt Chaining, Routing) et boucle agentique autonome.',
        competencyProof:
          'Sait choisir le pattern minimaliste adapté au besoin sans sur-ingénierie multi-agent.',
        unlockedByDefault: true,
        unlockedAt: 'Acquis à J5',
        conditions: {
          questionsRequired: 20,
          minAccuracyPercent: 70,
          examsPassedRequired: 1,
          practicalLabsRequired: 1,
        },
        skillsValidated: [
          'Prompt Chaining vs Routing vs Parallelization',
          'Critères d’arrêt (stop_reason) d’une boucle agentique',
        ],
      },
      {
        id: 'agentic-practitioner',
        tier: 'practitioner',
        tierLabel: 'Practitioner',
        dotEmoji: '🟢',
        badgeName: 'Agentic Practitioner',
        shortDescription:
          'Conception d’architectures Orchestrator-Workers et Evaluator-Optimizer fiables.',
        competencyProof:
          '50 questions Architecture validées à ≥ 80 %, 3 examens et 2 cas pratiques d’orchestration réussis.',
        unlockedByDefault: true,
        unlockedAt: 'Acquis à J14',
        conditions: {
          questionsRequired: 50,
          minAccuracyPercent: 80,
          examsPassedRequired: 3,
          practicalLabsRequired: 2,
        },
        skillsValidated: [
          'Isolation du contexte des sous-agents Workers',
          'Prévention des boucles infinies (max_iterations & budget tokens)',
          'Routage hybride Haiku (triage) + Sonnet (raisonnement)',
        ],
      },
      {
        id: 'agentic-advanced',
        tier: 'advanced',
        tierLabel: 'Advanced',
        dotEmoji: '🟣',
        badgeName: 'Agentic Advanced',
        shortDescription:
          'Orchestration multi-agents tolérante aux pannes avec gestion d’état persistante et reprise sur erreur.',
        competencyProof:
          '100 questions Architecture ≥ 85 %, 5 examens réussis et 4 exercices/cas d’architecture validés.',
        unlockedByDefault: true,
        unlockedAt: 'Acquis à J28',
        conditions: {
          questionsRequired: 100,
          minAccuracyPercent: 85,
          examsPassedRequired: 5,
          practicalLabsRequired: 4,
        },
        skillsValidated: [
          'Checkpointing d’état inter-étapes et idempotence des workers',
          'Passerelles Human-in-the-Loop (HITL) sur actions irréversibles',
          'Validation de graphe complet dans Architecture Cases',
        ],
      },
      {
        id: 'agentic-expert',
        tier: 'expert',
        tierLabel: 'Expert',
        dotEmoji: '🔴',
        badgeName: 'Agentic Expert',
        shortDescription:
          'Conception de plateformes agentiques à l’échelle industrielle (millions d’utilisateurs, SLA P95 < 2s).',
        competencyProof:
          'Maîtrise complète des compromis Coût / Latence / Sécurité / Résilience sur tous les cas d’architecture.',
        unlockedByDefault: false,
        conditions: {
          questionsRequired: 150,
          minAccuracyPercent: 90,
          examsPassedRequired: 8,
          practicalLabsRequired: 6,
        },
        skillsValidated: [
          'Architecture bancaire 2M utilisateurs sous 50k €/mois (Cas #027)',
          'Dégradation gracieuse multi-région et bascule automatique',
        ],
      },
    ],
  },
  {
    domainId: 4,
    domainCode: 'DOMAINE 4',
    shortTag: 'Prompting',
    domainTitle: 'Prompt Engineering & Sorties Structurées',
    description:
      'Structuration XML, hiérarchie System/User, Extended Thinking calibré, citations documentaires et garanties JSON.',
    defaultStats: {
      questionsAnswered: 64,
      accuracyPercent: 81,
      examsPassed: 3,
      practicalLabsPassed: 3,
    },
    levels: [
      {
        id: 'prompting-beginner',
        tier: 'beginner',
        tierLabel: 'Beginner',
        dotEmoji: '🔵',
        badgeName: 'Prompting Beginner',
        shortDescription:
          'Séparation propre des instructions système et des données utilisateur via balises XML.',
        competencyProof:
          'Évite la pollution du contexte et structure les consignes avec <instructions>, <context> et <examples>.',
        unlockedByDefault: true,
        unlockedAt: 'Acquis à J7',
        conditions: {
          questionsRequired: 20,
          minAccuracyPercent: 70,
          examsPassedRequired: 1,
          practicalLabsRequired: 1,
        },
        skillsValidated: [
          'Délimitation XML anti-confusion instructions/données',
          'Few-shot prompting ciblé sur les cas ambigus',
        ],
      },
      {
        id: 'prompting-practitioner',
        tier: 'practitioner',
        tierLabel: 'Practitioner',
        dotEmoji: '🟢',
        badgeName: 'Prompting Practitioner',
        shortDescription:
          'Maîtrise des sorties JSON garanties, du budget Extended Thinking et de l’ancrage documentaire.',
        competencyProof:
          '50 questions Prompt Engineering validées à ≥ 80 %, 3 examens réussis et 2 exercices Lab Prompt réussis.',
        unlockedByDefault: true,
        unlockedAt: 'Acquis à J21',
        conditions: {
          questionsRequired: 50,
          minAccuracyPercent: 80,
          examsPassedRequired: 3,
          practicalLabsRequired: 2,
        },
        skillsValidated: [
          'Sorties structurées strictes sans texte parasite',
          'Calibration de thinking.budget_tokens selon la complexité',
          'Règle d’abstention explicite contre les hallucinations RAG',
        ],
      },
      {
        id: 'prompting-advanced',
        tier: 'advanced',
        tierLabel: 'Advanced',
        dotEmoji: '🟣',
        badgeName: 'Prompting Advanced',
        shortDescription:
          'Ingénierie de prompts défensive contre l’injection indirecte et évaluation automatisée LLM-as-a-Judge.',
        competencyProof:
          '100 questions ≥ 85 %, 5 examens et 4 ateliers de durcissement de prompts réussis.',
        unlockedByDefault: false,
        conditions: {
          questionsRequired: 100,
          minAccuracyPercent: 85,
          examsPassedRequired: 5,
          practicalLabsRequired: 4,
        },
        skillsValidated: [
          'Isolation sandboxée des documents externes non fiables',
          'Grilles de notation déterministes pour évaluateurs automatiques',
        ],
      },
      {
        id: 'prompting-expert',
        tier: 'expert',
        tierLabel: 'Expert',
        dotEmoji: '🔴',
        badgeName: 'Prompting Expert',
        shortDescription:
          'Optimisation industrielle de prompts long-contexte (200k tokens) à haute fidélité de rappel.',
        competencyProof:
          '150 questions ≥ 90 %, 8 examens et 6 ateliers pratiques validés sans régression.',
        unlockedByDefault: false,
        conditions: {
          questionsRequired: 150,
          minAccuracyPercent: 90,
          examsPassedRequired: 8,
          practicalLabsRequired: 6,
        },
        skillsValidated: [
          'Placement stratégique en tête/fin de fenêtre 200k (Lost-in-the-Middle)',
          'Pipelines d’évaluation continue CI/CD sur jeux de tests dorés',
        ],
      },
    ],
  },
  {
    domainId: 3,
    domainCode: 'DOMAINE 3',
    shortTag: 'Claude Code',
    domainTitle: 'Claude Code, Gouvernance & Workflows CLI',
    description:
      'Configuration hiérarchique CLAUDE.md, permissions granulaires, commandes slash, hooks déterministes et intégration CI/CD.',
    defaultStats: {
      questionsAnswered: 38,
      accuracyPercent: 79,
      examsPassed: 2,
      practicalLabsPassed: 2,
    },
    levels: [
      {
        id: 'claudecode-beginner',
        tier: 'beginner',
        tierLabel: 'Beginner',
        dotEmoji: '🔵',
        badgeName: 'Claude Code Beginner',
        shortDescription:
          'Maîtrise des fichiers CLAUDE.md, des commandes /compact et /clear et des modes de permission.',
        competencyProof:
          'Configure proprement la mémoire de projet et les règles de sécurité locales d’un dépôt.',
        unlockedByDefault: true,
        unlockedAt: 'Acquis à J10',
        conditions: {
          questionsRequired: 20,
          minAccuracyPercent: 70,
          examsPassedRequired: 1,
          practicalLabsRequired: 1,
        },
        skillsValidated: [
          'Hiérarchie CLAUDE.md (racine, sous-dossiers, CLAUDE.local.md)',
          'Gestion proactive du contexte avec /compact et /clear',
        ],
      },
      {
        id: 'claudecode-practitioner',
        tier: 'practitioner',
        tierLabel: 'Practitioner',
        dotEmoji: '🟢',
        badgeName: 'Claude Code Practitioner',
        shortDescription:
          'Automatisation via hooks PreToolUse/PostToolUse, serveurs MCP locaux et mode headless CI/CD.',
        competencyProof:
          '50 questions Claude Code ≥ 80 %, 3 examens réussis et 2 exercices pratiques réussis.',
        unlockedByDefault: false,
        conditions: {
          questionsRequired: 50,
          minAccuracyPercent: 80,
          examsPassedRequired: 3,
          practicalLabsRequired: 2,
        },
        skillsValidated: [
          'Hooks déterministes de vérification (lint, tests, blocage commandes)',
          'Exécution headless (claude -p) dans les pipelines GitHub Actions / GitLab',
        ],
      },
      {
        id: 'claudecode-advanced',
        tier: 'advanced',
        tierLabel: 'Advanced',
        dotEmoji: '🟣',
        badgeName: 'Claude Code Advanced',
        shortDescription:
          'Orchestration multi-worktrees Git et gouvernance sécurité entreprise (allowlists/denylists strictes).',
        competencyProof:
          '100 questions ≥ 85 %, 5 examens et 4 ateliers de gouvernance CLI validés.',
        unlockedByDefault: false,
        conditions: {
          questionsRequired: 100,
          minAccuracyPercent: 85,
          examsPassedRequired: 5,
          practicalLabsRequired: 4,
        },
        skillsValidated: [
          'Parallélisation d’agents Claude Code sur git worktrees isolés',
          'Politiques enterprise managed-settings.json non contournables',
        ],
      },
      {
        id: 'claudecode-expert',
        tier: 'expert',
        tierLabel: 'Expert',
        dotEmoji: '🔴',
        badgeName: 'Claude Code Expert',
        shortDescription:
          'Déploiement d’ingénierie assistée par agents à l’échelle d’une organisation entière.',
        competencyProof:
          '150 questions ≥ 90 %, 8 examens et 6 ateliers avancés validés.',
        unlockedByDefault: false,
        conditions: {
          questionsRequired: 150,
          minAccuracyPercent: 90,
          examsPassedRequired: 8,
          practicalLabsRequired: 6,
        },
        skillsValidated: [
          'Sandboxing réseau/système complet et audit SOC2 des sessions CLI',
          'Création de SDK d’agents internes et commandes personnalisées partagées',
        ],
      },
    ],
  },
  {
    domainId: 5,
    domainCode: 'DOMAINE 5',
    shortTag: 'Production',
    domainTitle: 'Context Management, Caching & Fiabilité Production',
    description:
      'Prompt Caching (ephemeral), Message Batches API (-50%), gestion du rate-limiting 429, observabilité et maîtrise du TCO.',
    defaultStats: {
      questionsAnswered: 54,
      accuracyPercent: 84,
      examsPassed: 3,
      practicalLabsPassed: 2,
    },
    levels: [
      {
        id: 'production-beginner',
        tier: 'beginner',
        tierLabel: 'Beginner',
        dotEmoji: '🔵',
        badgeName: 'Production Beginner',
        shortDescription:
          'Compréhension des limites de fenêtre de contexte, des coûts par million de tokens et du streaming SSE.',
        competencyProof:
          'Sait estimer le coût d’une requête et activer le streaming pour réduire le TTFT.',
        unlockedByDefault: true,
        unlockedAt: 'Acquis à J7',
        conditions: {
          questionsRequired: 20,
          minAccuracyPercent: 70,
          examsPassedRequired: 1,
          practicalLabsRequired: 1,
        },
        skillsValidated: [
          'Calcul du coût Input / Output / Cache Read tokens',
          'Streaming SSE pour abaisser le Time-To-First-Token (TTFT)',
        ],
      },
      {
        id: 'production-practitioner',
        tier: 'practitioner',
        tierLabel: 'Practitioner',
        dotEmoji: '🟢',
        badgeName: 'Production Practitioner',
        shortDescription:
          'Placement optimal des breakpoints cache_control et utilisation de la Message Batches API.',
        competencyProof:
          '50 questions Production ≥ 80 %, 3 examens réussis et 2 exercices d’optimisation réussis.',
        unlockedByDefault: true,
        unlockedAt: 'Acquis à J24',
        conditions: {
          questionsRequired: 50,
          minAccuracyPercent: 80,
          examsPassedRequired: 3,
          practicalLabsRequired: 2,
        },
        skillsValidated: [
          'Ordre canonique System → Tools → Contexte statique → Message dynamique',
          'Traitement asynchrone par lots (Message Batches API -50 % coût)',
          'Backoff exponentiel avec jitter respectant l’en-tête retry-after (HTTP 429)',
        ],
      },
      {
        id: 'production-advanced',
        tier: 'advanced',
        tierLabel: 'Advanced',
        dotEmoji: '🟣',
        badgeName: 'Production Advanced',
        shortDescription:
          'Ingénierie de résilience haute disponibilité, compaction mémoire glissante et observabilité OpenTelemetry.',
        competencyProof:
          '100 questions ≥ 85 %, 5 examens et 4 cas d’architecture sous contrainte budgétaire validés.',
        unlockedByDefault: false,
        conditions: {
          questionsRequired: 100,
          minAccuracyPercent: 85,
          examsPassedRequired: 5,
          practicalLabsRequired: 4,
        },
        skillsValidated: [
          'Stratégies de résumé incrémental pour conversations longues (200k tokens)',
          'Monitoring en temps réel du Cache Hit Ratio (> 85 %) et alertes de dérive',
        ],
      },
      {
        id: 'production-expert',
        tier: 'expert',
        tierLabel: 'Expert',
        dotEmoji: '🔴',
        badgeName: 'Production Expert',
        shortDescription:
          'Garantie de SLA P95 < 2s et maîtrise budgétaire stricte sur des infrastructures multi-millions d’utilisateurs.',
        competencyProof:
          '150 questions ≥ 90 %, 8 examens et 6 cas d’architecture de production validés.',
        unlockedByDefault: false,
        conditions: {
          questionsRequired: 150,
          minAccuracyPercent: 90,
          examsPassedRequired: 8,
          practicalLabsRequired: 6,
        },
        skillsValidated: [
          'Architecture multi-fournisseurs (Anthropic API + Bedrock/Vertex) avec failover',
          'Optimisation TCO avancée combinant Caching + Routing + Batching',
        ],
      },
    ],
  },
];
