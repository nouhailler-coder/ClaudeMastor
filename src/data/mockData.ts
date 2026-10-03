import { DomainInfo, CertificationInfo, ExamQuestion, ScheduledSession, TrickyQuestion, LabWorkshop } from '../types';

export const OFFICIAL_CERTIFICATIONS: CertificationInfo[] = [
  {
    id: 'cca-f100',
    code: 'CCA-F100',
    title: 'Claude Certified Architect — Foundations',
    shortTitle: 'Architect Foundations',
    level: 'Foundations',
    description:
      'Maîtrise complète du syllabus fondamental : fenêtre de contexte 200k, Prompt Caching, structuration XML, Tool Use / MCP, Constitutional AI et optimisation des coûts en production.',
    durationMinutes: 90,
    questionsCount: 60,
    passingScore: 750,
    readinessPercentage: 82,
    status: 'En cours',
    targetRole: 'AI Solutions Architect & Lead Developer',
    domainWeights: [
      { domainId: 1, weight: 20 },
      { domainId: 2, weight: 22 },
      { domainId: 3, weight: 24 },
      { domainId: 4, weight: 16 },
      { domainId: 5, weight: 18 },
    ],
  },
  {
    id: 'cca-p200',
    code: 'CCA-P200',
    title: 'Claude Certified Agentic Systems & MCP Engineer',
    shortTitle: 'Agentic & MCP Engineer',
    level: 'Professional',
    description:
      'Architecture avancée de systèmes multi-agents autonomes, serveurs Model Context Protocol (MCP) personnalisés, Computer Use API, boucles d\'orchestration et tolérance aux pannes d\'outils.',
    durationMinutes: 120,
    questionsCount: 65,
    passingScore: 780,
    readinessPercentage: 64,
    status: 'Recommandé',
    targetRole: 'Staff AI Engineer & Agent Architect',
    domainWeights: [
      { domainId: 1, weight: 15 },
      { domainId: 2, weight: 15 },
      { domainId: 3, weight: 40 },
      { domainId: 4, weight: 15 },
      { domainId: 5, weight: 15 },
    ],
  },
  {
    id: 'cca-s300',
    code: 'CCA-S300',
    title: 'Claude Certified Enterprise Security & AI Governance',
    shortTitle: 'Security & Governance',
    level: 'Specialty',
    description:
      'Défense contre le Prompt Injection indirect, alignement Constitutional AI, audits Red-Teaming, politiques Zero-Data-Retention (ZDR), conformité HIPAA/SOC2 et filtrage PII.',
    durationMinutes: 90,
    questionsCount: 50,
    passingScore: 800,
    readinessPercentage: 51,
    status: 'Disponible',
    targetRole: 'AI Security Architect & Compliance Lead',
    domainWeights: [
      { domainId: 1, weight: 10 },
      { domainId: 2, weight: 15 },
      { domainId: 3, weight: 15 },
      { domainId: 4, weight: 45 },
      { domainId: 5, weight: 15 },
    ],
  },
  {
    id: 'cca-e400',
    code: 'CCA-E400',
    title: 'Claude Certified Principal LLM Infrastructure & FinOps',
    shortTitle: 'Principal Infra & FinOps',
    level: 'Expert',
    description:
      'Déploiement multi-cloud haute disponibilité (Anthropic API, AWS Bedrock, GCP Vertex AI), ingénierie du KV-Cache distribué, Message Batch API à grande échelle et routage de latence SLA.',
    durationMinutes: 150,
    questionsCount: 75,
    passingScore: 820,
    readinessPercentage: 43,
    status: 'Disponible',
    targetRole: 'Principal Cloud & LLM Infrastructure Architect',
    domainWeights: [
      { domainId: 1, weight: 30 },
      { domainId: 2, weight: 10 },
      { domainId: 3, weight: 15 },
      { domainId: 4, weight: 10 },
      { domainId: 5, weight: 35 },
    ],
  },
];

export const OFFICIAL_DOMAINS: DomainInfo[] = [
  {
    id: 1,
    code: 'DOMAINE 01',
    title: 'Architecture LLM & Context Windows',
    shortTitle: 'Architecture & Context',
    description: 'Claude 3.5 Sonnet, 200k context window, Prompt Caching (read/write latencies), Tokenizer Byte-Pair, structure KV-cache.',
    percentage: 94,
    weight: '20%',
    flashcardsCount: 100,
    keyTopics: ['KV-Cache & Préfixes', 'Fenêtre 200k Tokens', 'Prompt Caching TTL', 'Extended Thinking'],
    status: 'Maîtrisé',
    questionsCount: 42,
    badgeClass: 'bg-primary/10 text-primary',
  },
  {
    id: 2,
    code: 'DOMAINE 02',
    title: 'Prompt Engineering Avancé & System Prompts',
    shortTitle: 'Prompt & XML',
    description: 'Balises XML canoniques, Chain of Thought structuré, Few-shot demonstration, Prefilling de réponse assistant pour validation JSON stricte.',
    percentage: 88,
    weight: '22%',
    flashcardsCount: 100,
    keyTopics: ['Balises XML Canoniques', 'Prefilling Assistant', 'Chain-of-Thought', 'Hiérarchie System'],
    status: 'Maîtrisé',
    questionsCount: 38,
    badgeClass: 'bg-primary/10 text-primary',
  },
  {
    id: 3,
    code: 'DOMAINE 03',
    title: 'Tool Use & Intégration Systèmes Multi-Agents',
    shortTitle: 'Tool Use & MCP',
    description: 'JSON Schema strict, gestion d\'erreurs de tool calling, exécution parallèle de fonctions, Model Context Protocol (MCP clients/servers).',
    percentage: 76,
    weight: '24%',
    flashcardsCount: 100,
    keyTopics: ['Model Context Protocol (MCP)', 'JSON Schema Strict', 'Parallel Tool Calls', 'Orchestration Agents'],
    status: 'En cours',
    questionsCount: 56,
    badgeClass: 'bg-secondary-container/20 text-on-secondary-container',
  },
  {
    id: 4,
    code: 'DOMAINE 04',
    title: 'Sécurité, Constitutional AI & Red-Teaming',
    shortTitle: 'Sécurité & Alignement',
    description: 'Mitigation du prompt injection indirect, refus bien calibrés, conformité enterprise data privacy, jailbreak defense patterns.',
    percentage: 85,
    weight: '16%',
    flashcardsCount: 100,
    keyTopics: ['Constitutional AI', 'Injection Indirecte', 'Zero-Data-Retention', 'Guardrails & PII'],
    status: 'Maîtrisé',
    questionsCount: 29,
    badgeClass: 'bg-primary/10 text-primary',
  },
  {
    id: 5,
    code: 'DOMAINE 05',
    title: 'Optimisation des Coûts, Latence & Production',
    shortTitle: 'FinOps, Latence & Prod',
    description: 'Batch API Anthropic (50% cost saving), streaming chunks (SSE), token efficiency, cascade fallback Haiku 3.5 vers Sonnet 3.5.',
    percentage: 68,
    weight: '18%',
    flashcardsCount: 100,
    keyTopics: ['Message Batch API (-50%)', 'Streaming SSE & TTFT', 'Cascade Haiku → Sonnet', 'Rate Limits & ITPM'],
    status: 'À renforcer',
    questionsCount: 47,
    badgeClass: 'bg-error-container text-on-error-container',
  },
];

export const TRICKY_QUESTIONS: TrickyQuestion[] = [
  {
    id: 'tricky-1',
    domainTag: 'Domaine 05 • Batch API',
    timeAgo: 'Manquée il y a 2j',
    title: 'Délai garanti de complétion de la Message Batch API',
    description: 'Dans quel intervalle maximal les requêtes soumises via la Message Batch API d\'Anthropic sont-elles garanties d\'être exécutées ?',
    userAnswer: '12 heures',
    correctAnswer: '24 heures (avec 50% de réduction de coût)',
  },
  {
    id: 'tricky-2',
    domainTag: 'Domaine 03 • Tool Use',
    timeAgo: 'Manquée hier',
    title: 'Gestion du stop_reason "tool_use" vs "end_turn"',
    description: 'Quel statut HTTP et quel paramètre de payload devez-vous renvoyer lorsque Claude s\'arrête avec le stop_reason "tool_use" ?',
    userAnswer: 'Nouveau prompt système',
    correctAnswer: 'Rôle \'user\' avec content block de type \'tool_result\'',
  },
  {
    id: 'tricky-3',
    domainTag: 'Domaine 01 • Caching',
    timeAgo: 'Manquée il y a 3j',
    title: 'Seuil minimal de tokens pour activer le Prompt Caching',
    description: 'Quel est le volume minimal de tokens de préfixe requis pour bénéficier de la mise en cache sur Claude 3.5 Sonnet ?',
    userAnswer: '512 tokens',
    correctAnswer: '1 024 tokens (2 048 sur Opus)',
  },
];

export const SCHEDULED_SESSIONS: ScheduledSession[] = [
  {
    dayOfWeek: 'MER',
    dayNumber: '06',
    month: 'NOV',
    time: '18:30 - 19:45',
    title: 'Simulation Blanche Finale #4',
    subtitle: 'Conditions réelles sans interruption',
  },
  {
    dayOfWeek: 'VEN',
    dayNumber: '08',
    month: 'NOV',
    time: '12:00 - 13:00',
    title: 'Office Hours : MCP & Agents',
    subtitle: 'Session Q&A avec un Staff Architect Anthropic',
    isOfficeHours: true,
  },
  {
    dayOfWeek: 'JEU',
    dayNumber: '14',
    month: 'NOV',
    time: '10:00 (Paris)',
    title: 'Examen Officiel Anthropic',
    subtitle: 'Session surveillée Pearson VUE / OnVUE',
    isOfficialExam: true,
  },
];

export const MOCK_EXAM_QUESTIONS: ExamQuestion[] = [
  // Question 24 (The featured question from the screen)
  {
    id: 24,
    domainId: 3,
    domainCode: 'Domaine 3 : Tool Use & Workflows Multi-Agents',
    domainTitle: 'Architecture Latence & Caching',
    category: 'Architecture Latence & Caching',
    weight: 2.5,
    scenario: "Vous concevez un système de recherche documentaire et d'analyse financière orchestré par Claude 3.5 Sonnet. Le système doit appeler simultanément deux outils externes (API Boursière et Extraction PDF structuré) puis synthétiser les résultats tout en respectant une latence maximale de 2,5 secondes.",
    question: "Quelle est la configuration recommandée du paramètre tools, de la parallélisation d'outils et de la stratégie de Prompt Caching pour minimiser le Time-to-First-Token (TTFT) et garantir un schéma typé sans régression ?",
    codeFilename: 'anthropic_orchestrator.py',
    codeLanguage: 'python',
    codeSnippet: `import anthropic

client = anthropic.Anthropic()

# Configuration des définitions d'outils et injection de métadonnées
tools_manifest = [
    {
        "name": "fetch_stock_feed",
        "description": "Récupère les cours temps réel et le volume carnet d'ordres.",
        "input_schema": {
            "type": "object",
            "properties": {"ticker": {"type": "string"}},
            "required": ["ticker"]
        },
        "cache_control": {"type": "ephemeral"} # Point d'arrêt Cache
    },
    {
        "name": "extract_pdf_statement",
        "description": "Extrait la table de flux de trésorerie du rapport trimestriel.",
        "input_schema": { ... }
    }
]

response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    system=[
        {
            "type": "text",
            "text": system_prompt_analyst,
            "cache_control": {"type": "ephemeral"}
        }
    ],
    tools=tools_manifest,
    tool_choice={"type": "auto", "disable_parallel_tool_use": False},
    messages=conversation_stream
)`,
    slaLatency: '< 2 500 ms',
    tokensContext: '~14 200 tks',
    cacheHitTarget: '≥ 92%',
    diagramNote: 'Claude émet `tool_use` multiple en un seul aller-retour inférence.',
    options: [
      {
        id: 'A',
        text: 'Définir tool_choice={"type": "any"}, désactiver le parallélisme (disable_parallel_tool_use: True) pour forcer une séquence déterministe et poser un point de cache sur le dernier message utilisateur uniquement.',
        subtext: 'Invalide la contrainte de latence 2,5s due à deux allers-retours séquentiels distincts.',
      },
      {
        id: 'B',
        text: 'Conserver tool_choice={"type": "auto"} avec parallélisme activé par défaut, positionner le point de prompt caching sur le dernier outil du bloc tools ainsi que sur le prompt système.',
        subtext: 'Permet l\'émission simultanée des 2 tool_uses en un seul step et réutilise le préfixe figé des définitions d\'outils et du prompt système (TTFT ~ 180ms).',
        isCorrect: true,
      },
      {
        id: 'C',
        text: 'Encapsuler les deux outils dans une fonction unique d\'orchestration côté client appelée via tool_choice={"type": "tool", "name": "composite_worker"} sans déclarer de bloc de cache.',
        subtext: 'Perd l\'adaptabilité sémantique de Claude et recalcule l\'intégralité du contexte système à chaque tour.',
      },
      {
        id: 'D',
        text: 'Utiliser Claude 3.5 Haiku pour router l\'appel, convertir les outputs d\'outils en images multi-modales haute résolution, puis désactiver le prompt caching pour purger les quotas d\'invalidation.',
        subtext: 'Incompatible avec le format de payload boursier structuré et viole l\'exigence d\'analyse de Sonnet.',
      },
    ],
    correctOptionId: 'B',
    rationale: 'Le placement d\'un point de cache sur le dernier élément du tableau `tools` met automatiquement en cache l\'intégralité des définitions d\'outils et le préfixe système. Avec `disable_parallel_tool_use: False`, Claude émet les deux requêtes d\'outils en parallèle dans un seul aller-retour d\'inférence.',
    sourceDoc: 'Anthropic Docs: Tool Use & Prompt Caching Parallel Execution (v2.1)',
  },

  // Question 42 (from the scorecard)
  {
    id: 42,
    domainId: 5,
    domainCode: 'Domaine 05 : Coûts, Latence & Batching API',
    domainTitle: 'Optimisation de Coût Documentaire',
    category: 'Coûts & Latence',
    weight: 2.5,
    scenario: "Vous concevez un pipeline d'assistance documentaire analysant un corpus juridique statique de 140 000 tokens utilisé par 50 juristes simultanément.",
    question: "Quelle configuration d'API Anthropic garantit la latence au premier token la plus basse tout en réduisant le coût de calcul de manière optimale ?",
    options: [
      {
        id: 'A',
        text: 'Envoyer le corpus dans les métadonnées de l\'en-tête HTTP et activer le mode batch différé 24h avec webhook de callback.',
        subtext: 'Incompatible avec une expérience de recherche interactive en temps réel.',
      },
      {
        id: 'B',
        text: 'Diviser le corpus en 14 chunks de 10 000 tokens dans un vector store pgvector et envoyer les 3 meilleurs passages via l\'API standard sans cache.',
        subtext: 'Entraîne une perte de contexte transversal des clauses juridiques et ne tire pas profit de la fenêtre de 200k.',
      },
      {
        id: 'C',
        text: 'Utiliser Claude 3.5 Haiku avec compression de tokens par suppression de ponctuation et requêtes concurrentes non cachées.',
        subtext: 'Dégrade fortement la fidélité de citation juridique et augmente les coûts bruts d\'input répétitifs.',
      },
      {
        id: 'D',
        text: 'Placer l\'intégralité du corpus dans le System Prompt précédé du marqueur cache_control: {"type": "ephemeral"}, permettant un abattement de 90% sur les tokens en lecture et une latence divisée par 4.',
        subtext: 'Solution Architecte Certifiée : amortit le surcoût initial d\'écriture dès la 2e requête dans la fenêtre TTL de 5 minutes.',
        isCorrect: true,
      },
    ],
    correctOptionId: 'D',
    rationale: 'Le modèle Claude 3.5 Sonnet prend en charge le Prompt Caching à partir de 1 024 tokens. Pour un corpus de 140 000 tokens interrogé en continu par 50 utilisateurs, la création du cache initial coûte 1.25x le prix standard d\'écriture, mais toutes les lectures suivantes durant la fenêtre TTL de 5 minutes bénéficient d\'une réduction de 90% du coût d\'input et d\'un gain de TTFT massif de l\'ordre de 80%.',
    sourceDoc: 'Anthropic Documentation - Prompt Caching Best Practices (v2.1)',
  },

  // Question 18 (from the scorecard)
  {
    id: 18,
    domainId: 3,
    domainCode: 'Domaine 03 : Tool Use & Function Calling',
    domainTitle: 'Tool Schema Validation',
    category: 'Tool Use & Function Calling',
    weight: 2.0,
    scenario: "Vous développez un agent de validation comptable connecté à une API SAP via function calling sur Claude 3.5 Sonnet.",
    question: "Comment garantir que le modèle fournisse obligatoirement tous les champs critiques sans omettre les paramètres facultatifs ?",
    options: [
      {
        id: 'A',
        text: 'Spécifier dans le prompt système "Merci de toujours inclure tous les champs" en majuscules.',
        subtext: 'Non contraignant au niveau du parser JSON.',
      },
      {
        id: 'B',
        text: 'Définir un schéma JSON Schema strict sous tools[].input_schema avec propriétés typées obligatoires déclarées explicitement dans le tableau "required".',
        subtext: 'Garantit la validation structurelle conforme à la spécification OpenAPI / JSON Schema v4.',
        isCorrect: true,
      },
      {
        id: 'C',
        text: 'Utiliser tool_choice={"type": "none"} et parser le flux Markdown avec regex.',
        subtext: 'Fragile et sujet aux hallucinations de mise en forme.',
      },
      {
        id: 'D',
        text: 'Forcer la conversion de l\'appel en base64 dans le user prompt.',
        subtext: 'Inutilement complexe et ralentit le décodage.',
      },
    ],
    correctOptionId: 'B',
    rationale: 'Claude 3.5 Sonnet respecte strictement les définitions JSON Schema. Pour imposer des champs indispensables, ils doivent être listés dans la propriété "required" du bloc input_schema.',
    sourceDoc: 'Anthropic Docs: Defining Tools & JSON Schema (v1.8)',
  },

  // Question 27 (from the scorecard)
  {
    id: 27,
    domainId: 2,
    domainCode: 'Domaine 02 : Prompt Engineering Avancé',
    domainTitle: 'Prompt Design & Canonical XML Patterning',
    category: 'Prompt Design',
    weight: 2.0,
    scenario: "Vous devez structurer un prompt système complexe contenant des exemples few-shot, des contraintes déontologiques et des données financières sensibles.",
    question: "Quelle méthode de balisage est formellement recommandée par Anthropic pour isoler les instructions des données non fiables ?",
    options: [
      {
        id: 'A',
        text: 'Utiliser des balises XML canoniques distinctes (<instructions>, <context>, <rules>, <examples>) pour segmenter chaque responsabilité.',
        subtext: 'Standard officiel Anthropic facilitant l\'attention du modèle et résistant aux injections indirectes.',
        isCorrect: true,
      },
      {
        id: 'B',
        text: 'Utiliser uniquement des astérisques markdown et du texte brut en majuscules.',
        subtext: 'Ambigü pour les séparateurs sémantiques profonds.',
      },
      {
        id: 'C',
        text: 'Encoder toutes les règles en JSON compact minifié sans retours chariot.',
        subtext: 'Consomme inutilement des tokens et réduit la lisibilité de raisonnement.',
      },
      {
        id: 'D',
        text: 'Répéter les instructions au début et à la fin de chaque message utilisateur.',
        subtext: 'Double les coûts de tokens sans apporter la clarté structurelle du balisage XML.',
      },
    ],
    correctOptionId: 'A',
    rationale: 'Claude a été spécifiquement entraîné pour interpréter les balises XML comme des délimiteurs sémantiques prioritaires, évitant ainsi la confusion entre consignes système et contenu utilisateur.',
    sourceDoc: 'Anthropic Prompt Engineering Interactive Tutorial: XML Tags Structuring',
  },

  // Question 37 (Featured in "Continue where you left off" — CCA-P200 Tool Use & MCP Question 37 / 50)
  {
    id: 37,
    domainId: 3,
    domainCode: 'Domaine 03 : Tool Use & Model Context Protocol (MCP)',
    domainTitle: 'Tool Use & MCP — Gestion d’erreur & Résultats Parallèles',
    category: 'Tool Use & MCP',
    weight: 3.0,
    scenario:
      "Session CCA-P200 (Question 37 / 50) : Votre agent MCP interroge simultanément 3 outils (`get_customer_profile`, `fetch_ledger_balance`, `check_fraud_signals`). Le serveur MCP hébergeant `check_fraud_signals` renvoie une erreur d'indisponibilité temporaire (HTTP 503).",
    question:
      "Quelle structure de message devez-vous renvoyer à l'API Messages d'Anthropic au tour suivant pour permettre à l'agent de poursuivre son raisonnement sans provoquer d'erreur HTTP 400 ?",
    codeFilename: 'mcp_parallel_tool_results.json',
    codeLanguage: 'json',
    codeSnippet: `{
  "role": "user",
  "content": [
    {
      "type": "tool_result",
      "tool_use_id": "toolu_01Profile",
      "content": "{\\"tier\\": \\"platinum\\", \\"kyc_verified\\": true}"
    },
    {
      "type": "tool_result",
      "tool_use_id": "toolu_02Balance",
      "content": "{\\"available_eur\\": 14500.00}"
    },
    {
      "type": "tool_result",
      "tool_use_id": "toolu_03Fraud",
      "is_error": true,
      "content": "Service check_fraud_signals indisponible (HTTP 503). Basculez en mode dégradé lecture seule."
    }
  ]
}`,
    slaLatency: '< 1 800 ms',
    tokensContext: '~8 400 tks',
    cacheHitTarget: '≥ 90%',
    diagramNote: 'Un seul message role="user" agrégeant tous les tool_result parallèles + is_error: true.',
    options: [
      {
        id: 'A',
        text: 'Envoyer trois messages successifs avec role="user", chacun contenant un seul bloc tool_result.',
        subtext: 'Provoque une erreur 400 : le premier message user ne contient pas tous les tool_use_id attendus.',
      },
      {
        id: 'B',
        text: 'Regrouper les 3 blocs tool_result dans un UNIQUE message role="user" placé immédiatement après le tour assistant, en marquant le bloc en échec avec is_error: true.',
        subtext: 'Respecte le contrat strict tool_use -> tool_result et informe proprement Claude de l’erreur partielle.',
        isCorrect: true,
      },
      {
        id: 'C',
        text: 'Supprimer le bloc tool_use en échec de l’historique assistant et ne renvoyer que les 2 résultats valides.',
        subtext: 'Corrompt l’intégrité de l’historique conversationnel et des signatures Extended Thinking.',
      },
      {
        id: 'D',
        text: 'Placer un bloc text explicatif avant les blocs tool_result dans le message user.',
        subtext: 'Les blocs tool_result doivent impérativement précéder tout bloc text dans le tableau content.',
      },
    ],
    correctOptionId: 'B',
    rationale:
      'Lorsque Claude émet plusieurs blocs tool_use dans un même tour, tous les blocs tool_result correspondants doivent être retournés dans un seul message user, en tête du tableau content, avec is_error: true pour tout outil ayant échoué.',
    sourceDoc: 'Anthropic MCP & Tool Use Specification: Parallel Tool Calls & Error Handling',
  },
];

// Helper to fill 60 questions with realistic Anthropic exam questions
for (let i = 1; i <= 60; i++) {
  if (i === 24 || i === 42 || i === 18 || i === 27 || i === 37) continue;

  const domainIdx = (i % 5) + 1;
  const domain = OFFICIAL_DOMAINS[domainIdx - 1];

  MOCK_EXAM_QUESTIONS.push({
    id: i,
    domainId: domain.id,
    domainCode: domain.code,
    domainTitle: domain.title,
    category: domain.title.split('&')[0].trim(),
    weight: 2.0,
    scenario: `Scénario technique #${i} : Conception d'une architecture d'IA d'entreprise conforme aux directives Anthropic sur ${domain.title}.`,
    question: `Sur Claude 3.5 Sonnet, quelle directive d'implémentation est recommandée pour optimiser ${domain.title.toLowerCase()} en environnement de production ?`,
    options: [
      { id: 'A', text: `Option technique A relative à l'implémentation standard de ${domain.title}.`, subtext: 'Approche conventionnelle mais sous-optimale.' },
      { id: 'B', text: `Option recommandée B avec application stricte des bonnes pratiques Anthropic (balisage XML, gestion de cache ou validation de schéma).`, subtext: 'Conforme aux recommandations de l\'architecte certifié.', isCorrect: true },
      { id: 'C', text: `Option alternative C basée sur un contournement applicatif non supporté.`, subtext: 'Risque de régression lors des mises à jour d\'API.' },
      { id: 'D', text: `Option D désactivant les garde-fous pour réduire la charge serveur.`, subtext: 'Viole les principes de sécurité constitutionnelle.' },
    ],
    correctOptionId: 'B',
    rationale: `L'architecture recommandée pour ${domain.title} repose sur les spécifications officielles de l'API Claude Messages et les motifs de conception éprouvés.`,
    sourceDoc: `Anthropic Developer Documentation: Guide d'Architecture ${domain.code}`,
  });
}

// Sort questions by ID
MOCK_EXAM_QUESTIONS.sort((a, b) => a.id - b.id);

export const LAB_WORKSHOPS: LabWorkshop[] = [
  {
    id: 'lab-01',
    code: 'LAB #01',
    category: 'Sécurité & Garde-fous',
    title: 'Mitigation du Prompt Injection via Constitutional Rules',
    description: 'Concevoir des directives de filtrage sémantique imperméables aux attaques indirectes par extraction RAG.',
    level: 'Avancé',
  },
  {
    id: 'lab-02',
    code: 'LAB #02',
    category: 'Orchestration',
    title: 'Orchestration Multi-Agents avec Claude Haiku en Routeur',
    description: 'Architecture hybride à haute vélocité routant vers Sonnet ou Opus selon la complexité d\'évaluation.',
    level: 'Intermédiaire',
  },
  {
    id: 'lab-03',
    code: 'LAB #03',
    category: 'Context Windows',
    title: 'Technique Needle In A Haystack sur 200k Tokens',
    description: 'Optimiser l\'attention et les ancres de rappel sur des documents juridiques volumineux sans dilution de signal.',
    level: 'Expert',
  },
  {
    id: 'lab-05',
    code: 'LAB #05',
    category: 'Structured Output',
    title: 'Extraction Déterministe & Forçage d\'Outils (Tool Choice)',
    description: 'Paramétrage de tool_choice: {"type": "tool", "name": "..."} pour éradiquer tout préambule conversationnel.',
    level: 'Intermédiaire',
  },
];
