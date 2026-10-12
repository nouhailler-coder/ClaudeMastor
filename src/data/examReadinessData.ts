export interface ReadinessDomainItem {
  id: string;
  name: string;
  scorePct: number;
  status: 'solid' | 'reinforce';
  description: string;
  keyConcepts: string[];
  docRef: string;
  actionLabel: string;
  actionTab: 'exam' | 'lab' | 'flashcards' | 'architecture-cases' | 'my-mistakes' | 'scorecard';
  actionPayload?: {
    domainId?: number;
    subtopicId?: string;
  };
}

export interface DayTaskItem {
  id: string;
  dayNumber: 1 | 2 | 3 | 4;
  title: string;
  estimatedMinutes: number;
  category: 'Flashcards' | 'Drill' | 'Lab' | 'Architecture' | 'Simulation' | 'Erreurs';
  description: string;
  targetTab: 'exam' | 'lab' | 'flashcards' | 'architecture-cases' | 'my-mistakes' | 'scorecard' | 'dashboard';
  targetDomainId?: number;
  completed?: boolean;
}

export interface DayProgram {
  dayNumber: 1 | 2 | 3 | 4;
  dayTitle: string;
  theme: string;
  totalDurationMinutes: number;
  estimatedGainText: string;
  objective: string;
  tasks: DayTaskItem[];
}

export interface ExamReadinessReport {
  certId: string;
  certCode: string;
  certTitle: string;
  scorePercentage: number;
  asciiProgressBar: string;
  examVerdict: 'probablement' | 'oui' | 'pas-encore';
  verdictLabel: string;
  verdictExplanation: string;
  estimatedPassingScore: number;
  officialPassingThreshold: number;
  safetyMarginPts: number;
  daysUntilExam: number;
  solidDomains: ReadinessDomainItem[];
  reinforceTopics: ReadinessDomainItem[];
  fourDaysProgram: DayProgram[];
}

export const CCA_P200_READINESS_REPORT: ExamReadinessReport = {
  certId: 'cca-p200',
  certCode: 'CCA-P200',
  certTitle: 'Claude Certified Architect — Professional',
  scorePercentage: 78,
  asciiProgressBar: '██████████████░░░░ 78%',
  examVerdict: 'probablement',
  verdictLabel: "Prêt pour l'examen : probablement",
  verdictExplanation:
    "Votre score actuel de 78% (estimé à 780 pts pour un seuil officiel de 720 pts) vous place dans la zone d'admissibilité potentielle. Cependant, votre profil présente une vulnérabilité critique sur le Domaine 03 (MCP, boucles d'agents et typage Tool Use). En conditions réelles, 3 à 4 erreurs sur ces questions techniques pourraient vous faire basculer sous le seuil.",
  estimatedPassingScore: 780,
  officialPassingThreshold: 720,
  safetyMarginPts: 60,
  daysUntilExam: 12,
  solidDomains: [
    {
      id: 'solid-arch',
      name: 'Architecture',
      scorePct: 85,
      status: 'solid',
      description:
        'Maîtrise éprouvée des architectures hybrides RAG, de la fenêtre de 200k tokens, du Prompt Caching TTL (5 min) et du compactage contextuel.',
      keyConcepts: [
        'Hiérarchie System Prompt → Tools → Documents → Historique',
        'Breakpoints cache_control (max 4)',
        'Routage multi-modèles (Haiku pour le triage, Sonnet pour le raisonnement)',
      ],
      docRef: 'Anthropic Docs · Architecture Best Practices & Context Management',
      actionLabel: 'Revoir les cas d’architecture',
      actionTab: 'architecture-cases',
    },
    {
      id: 'solid-sec',
      name: 'Security',
      scorePct: 91,
      status: 'solid',
      description:
        'Excellente résilience face aux injections indirectes, application stricte des guardrails constitutionnels et isolation des privilèges de tokens.',
      keyConcepts: [
        'Défense contre les jailbreaks et instructions cachées dans les documents',
        'Zéro-rétention des données et conformité RGPD/HIPAA',
        'Principe du moindre privilège sur les autorisations d’outils',
      ],
      docRef: 'Anthropic Docs · Security, Privacy & Safety Alignment',
      actionLabel: 'Consulter les flashcards Sécurité',
      actionTab: 'flashcards',
      actionPayload: { domainId: 4 },
    },
  ],
  reinforceTopics: [
    {
      id: 'weak-mcp',
      name: 'MCP',
      scorePct: 58,
      status: 'reinforce',
      description:
        'Confusions récurrentes entre Primitives Resources (accès passif en lecture seule via URI) et Tools (actions actives avec effets de bord), ainsi que le protocole de transport stdio vs HTTP/SSE.',
      keyConcepts: [
        'Resources (URI type postgres://, read-only) vs Tools (fonctions d’exécution)',
        'Gestion des notifications de changement d’état MCP (resources/updated)',
        'Configuration du client MCP dans l’écosystème d’entreprise',
      ],
      docRef: 'Model Context Protocol Specification · Core Architecture & Transports',
      actionLabel: 'Lancer le Drill MCP ciblé',
      actionTab: 'exam',
      actionPayload: { domainId: 3, subtopicId: 'mcp-primitives' },
    },
    {
      id: 'weak-agentic',
      name: 'Agentic loops',
      scorePct: 62,
      status: 'reinforce',
      description:
        'Difficulté à concevoir des conditions d’arrêt strictes dans les boucles de raisonnement récursif, menant à des risques de boucles infinies ou de dépassement de budget de tokens.',
      keyConcepts: [
        'Détection des boucles de répétition de tool_calls identiques',
        'Budget de tokens dédié (max_tokens_to_sample) et seuil de récursion',
        'Incompatibilité formelle entre Extended Thinking et tool_choice forcé ("tool")',
      ],
      docRef: 'Anthropic Docs · Building Robust Multi-Turn Agentic Workflows',
      actionLabel: 'Réviser les erreurs d’Agents',
      actionTab: 'my-mistakes',
    },
    {
      id: 'weak-tool-use',
      name: 'Tool Use',
      scorePct: 64,
      status: 'reinforce',
      description:
        'Hésitations sur la syntaxe formelle de l’API Messages lors des retours d’outils parallèles : nécessité de regrouper tous les blocs tool_result dans un unique message role="user" avec is_error: true en cas d’échec partiel.',
      keyConcepts: [
        'Obligation d’un SEUL message user regroupant tous les tool_result d’un même tour',
        'Attribut is_error: true pour signifier un timeout ou une exception HTTP',
        'Validation stricte JSON Schema (propriétés required, enum et types stricts)',
      ],
      docRef: 'Anthropic Docs · Tool Use API Reference & Parallel Calling',
      actionLabel: 'Lab Pratique Tool Calling',
      actionTab: 'lab',
    },
  ],
  fourDaysProgram: [
    {
      dayNumber: 1,
      dayTitle: 'Jour 1',
      theme: 'Mastery MCP & Primitives Déterministes',
      totalDurationMinutes: 35,
      estimatedGainText: '+3 points de score global',
      objective:
        'Éliminer toute confusion entre MCP Resources et MCP Tools, et maîtriser le transport stdio / SSE.',
      tasks: [
        {
          id: 't-1-1',
          dayNumber: 1,
          title: 'Flashcards ciblées : 10 cartes Clés MCP (Domaine 03)',
          estimatedMinutes: 10,
          category: 'Flashcards',
          description:
            'Réviser les cartes portant sur la spécification formelle MCP, les schémas JSON-RPC et les URIs de Resources.',
          targetTab: 'flashcards',
          targetDomainId: 3,
        },
        {
          id: 't-1-2',
          dayNumber: 1,
          title: 'Drill ciblé MCP : 12 questions à haute rentabilité',
          estimatedMinutes: 15,
          category: 'Drill',
          description:
            'Traiter la série spécifique de 12 questions piégeuses sur les permissions de serveurs MCP et la gestion des protocoles.',
          targetTab: 'exam',
          targetDomainId: 3,
        },
        {
          id: 't-1-3',
          dayNumber: 1,
          title: 'Carnet d’erreurs : Réviser les 5 erreurs les plus fréquentes MCP',
          estimatedMinutes: 10,
          category: 'Erreurs',
          description:
            'Ouvrir My Mistakes et re-tester les 5 erreurs récidivistes du domaine MCP avec l’AI Tutor.',
          targetTab: 'my-mistakes',
        },
      ],
    },
    {
      dayNumber: 2,
      dayTitle: 'Jour 2',
      theme: 'Agentic Loops & Garde-fous Récursifs',
      totalDurationMinutes: 40,
      estimatedGainText: '+2.5 points de score global',
      objective:
        'Maîtriser les critères d’interruption, l’Extended Thinking et l’isolation contre les récursions infinies.',
      tasks: [
        {
          id: 't-2-1',
          dayNumber: 2,
          title: 'Lab Pratique : Détection et arrêt de boucle d’agent récursif',
          estimatedMinutes: 15,
          category: 'Lab',
          description:
            'Implémenter un intercepteur vérifiant le hash des arguments d’outils successifs et imposant un stop condition.',
          targetTab: 'lab',
        },
        {
          id: 't-2-2',
          dayNumber: 2,
          title: 'Architecture Cases : Cas #027 Assistant Bancaire (Section Guardrails)',
          estimatedMinutes: 15,
          category: 'Architecture',
          description:
            'Configurer les garde-fous de latence et les fallbacks de modèles en cas d’échec d’agent.',
          targetTab: 'architecture-cases',
        },
        {
          id: 't-2-3',
          dayNumber: 2,
          title: 'Quiz Flash : Extended Thinking & Contraintes tool_choice',
          estimatedMinutes: 10,
          category: 'Drill',
          description:
            'Valider la règle d’incompatibilité formelle entre Extended Thinking et tool_choice: {"type": "tool"}.',
          targetTab: 'exam',
          targetDomainId: 2,
        },
      ],
    },
    {
      dayNumber: 3,
      dayTitle: 'Jour 3',
      theme: 'Tool Use Avancé & Appels Parallèles',
      totalDurationMinutes: 30,
      estimatedGainText: '+2 points de score global',
      objective:
        'Gérer sans faute le format du message user de réponse aux appels parallèles, avec échec partiel.',
      tasks: [
        {
          id: 't-3-1',
          dayNumber: 3,
          title: 'Lab Pratique : Payload d’appels d’outils multiples et is_error',
          estimatedMinutes: 15,
          category: 'Lab',
          description:
            'Générer un tour complet avec 3 tool_result consécutifs dans un unique message utilisateur.',
          targetTab: 'lab',
        },
        {
          id: 't-3-2',
          dayNumber: 3,
          title: 'Quiz express : Typage JSON Schema & Propriétés Required',
          estimatedMinutes: 10,
          category: 'Drill',
          description:
            '10 questions sur les pièges de validation de schéma de paramètres d’outils Claude.',
          targetTab: 'exam',
          targetDomainId: 3,
        },
        {
          id: 't-3-3',
          dayNumber: 3,
          title: 'Flashcards SRS : Révision des 15 cartes prioritaires du Domaine 03',
          estimatedMinutes: 5,
          category: 'Flashcards',
          description:
            'Passer en revue les cartes en palier "À revoir" pour verrouiller la mémorisation.',
          targetTab: 'flashcards',
          targetDomainId: 3,
        },
      ],
    },
    {
      dayNumber: 4,
      dayTitle: 'Jour 4',
      theme: 'Simulation Complète & Validation de la Mention « OUI »',
      totalDurationMinutes: 65,
      estimatedGainText: '+3.5 points · Passage à « Prêt : OUI »',
      objective:
        'Passer une simulation blanche chronométrée de 60 questions pour valider un score supérieur à 820 pts.',
      tasks: [
        {
          id: 't-4-1',
          dayNumber: 4,
          title: 'Examen Blanc Chronométré : Simulation Complète CCA-P200 (60 Qs)',
          estimatedMinutes: 50,
          category: 'Simulation',
          description:
            'Conditions réelles d’examen : 60 questions, rythme imposé de 1m 15s par question, pas d’aide.',
          targetTab: 'exam',
        },
        {
          id: 't-4-2',
          dayNumber: 4,
          title: 'Scorecard & Diagnostic Final : Vérification du passage ≥ 820/1000',
          estimatedMinutes: 10,
          category: 'Simulation',
          description:
            'Inspecter la courbe de progression et confirmer que le Domaine 03 a dépassé 75% de réussite.',
          targetTab: 'scorecard',
        },
        {
          id: 't-4-3',
          dayNumber: 4,
          title: 'Validation de l’Attestation d’Admissibilité Officielle',
          estimatedMinutes: 5,
          category: 'Simulation',
          description:
            'Le verdict d’admissibilité bascule sur « Prêt pour l’examen : OUI (Confiance Élevée) ».',
          targetTab: 'dashboard',
        },
      ],
    },
  ],
};
