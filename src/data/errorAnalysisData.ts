export interface ErrorSubtopicBreakdown {
  id: string;
  label: string;
  errorCount: number;
  drillQuestionCount: number;
  rootCauseSummary: string;
  goldenFix: string;
}

export interface DomainErrorAnalysis {
  domainId: number;
  shortName: string;
  fullName: string;
  scorePct: number;
  correctCount: number;
  totalCount: number;
  errorCount: number;
  isPrimaryWeakness?: boolean;
  drillTitle: string;
  drillTotalQuestions: number;
  subtopics: ErrorSubtopicBreakdown[];
}

export interface TargetedDrillQuestion {
  id: number;
  subtopicId: string;
  subtopicLabel: string;
  question: string;
  options: {
    id: string;
    text: string;
  }[];
  correctOptionId: string;
  explanation: string;
}

export const EXAM_42_60_ERROR_ANALYSIS: DomainErrorAnalysis[] = [
  {
    domainId: 1,
    shortName: 'Architecture',
    fullName: 'Architecture LLM, Tokenizer & KV-Cache',
    scorePct: 82,
    correctCount: 14,
    totalCount: 17,
    errorCount: 3,
    drillTitle: 'Drill Architecture & KV-Cache — 8 questions',
    drillTotalQuestions: 8,
    subtopics: [
      {
        id: 'kv-breakpoints',
        label: 'Breakpoints cache_control (limite de 4)',
        errorCount: 2,
        drillQuestionCount: 5,
        rootCauseSummary:
          'Placement du marqueur ephemeral après une variable dynamique invalidant le préfixe KV.',
        goldenFix:
          'Toujours ordonner System → Tools → Documents statiques → Historique avant de poser les 4 breakpoints.',
      },
      {
        id: 'ttl-sliding',
        label: 'TTL glissant (5 min) vs 1 heure',
        errorCount: 1,
        drillQuestionCount: 3,
        rootCauseSummary:
          'Confusion sur le rafraîchissement gratuit du TTL de 5 minutes lors d’un cache hit.',
        goldenFix:
          'Chaque cache_read_input_tokens réinitialise le TTL de 5 minutes sans surcoût d’écriture.',
      },
    ],
  },
  {
    domainId: 2,
    shortName: 'Prompt Engineering',
    fullName: 'Prompt Engineering Avancé & Balisage XML',
    scorePct: 76,
    correctCount: 13,
    totalCount: 17,
    errorCount: 4,
    drillTitle: 'Drill Prompt Engineering & XML — 8 questions',
    drillTotalQuestions: 8,
    subtopics: [
      {
        id: 'xml-isolation',
        label: 'Isolation XML & Long Context (Recall)',
        errorCount: 2,
        drillQuestionCount: 4,
        rootCauseSummary:
          'Instructions placées avant un corpus de 150k tokens au lieu d’être placées en fin de prompt.',
        goldenFix:
          'Placer les documents <documents> en haut et la requête + contraintes tout en bas (+30% de précision).',
      },
      {
        id: 'extended-thinking',
        label: 'Budget Extended Thinking & Temperature',
        errorCount: 2,
        drillQuestionCount: 4,
        rootCauseSummary:
          'Tentative de fixer temperature: 0.2 tout en activant thinking: { type: "enabled" }.',
        goldenFix:
          'Extended Thinking impose obligatoirement temperature: 1.0 et budget_tokens >= 1024.',
      },
    ],
  },
  {
    domainId: 3,
    shortName: 'Tool Use',
    fullName: 'Tool Use, JSON Schema & Model Context Protocol (MCP)',
    scorePct: 58,
    correctCount: 5,
    totalCount: 12,
    errorCount: 7,
    isPrimaryWeakness: true,
    drillTitle: 'Drill MCP — 12 questions',
    drillTotalQuestions: 12,
    subtopics: [
      {
        id: 'mcp-resources',
        label: 'MCP Resources',
        errorCount: 3,
        drillQuestionCount: 5,
        rootCauseSummary:
          'Confusion entre les Resources MCP (lecture seule par URI, pilotées par l’application) et les Tools MCP (pilotés par le modèle avec effets de bord).',
        goldenFix:
          'Utiliser resources/read + resources/subscribe pour le contexte passif adressé par URI, et tools/call pour les actions décidées par Claude.',
      },
      {
        id: 'tool-choice',
        label: 'Tool choice',
        errorCount: 2,
        drillQuestionCount: 3,
        rootCauseSummary:
          'Utilisation de tool_choice: {"type": "tool"} ou "any" simultanément avec Extended Thinking, ou oubli de disable_parallel_tool_use.',
        goldenFix:
          'Avec Extended Thinking, seul tool_choice: {"type": "auto"} (ou "none") est autorisé par l’API Messages.',
      },
      {
        id: 'parallel-errors',
        label: 'erreurs parallèles',
        errorCount: 1,
        drillQuestionCount: 2,
        rootCauseSummary:
          'Envoi de plusieurs messages user séparés pour répondre à 3 blocs tool_use parallèles émis dans un même tour assistant.',
        goldenFix:
          'Regrouper impérativement tous les blocs tool_result dans un UNIQUE message role: "user".',
      },
      {
        id: 'is-error',
        label: 'is_error',
        errorCount: 1,
        drillQuestionCount: 2,
        rootCauseSummary:
          'Omission de is_error: true lors d’une exception d’outil ou insertion d’un bloc text avant les blocs tool_result.',
        goldenFix:
          'Toujours placer les blocs tool_result en premier dans le tableau content et renseigner is_error: true avec le détail de l’erreur.',
      },
    ],
  },
  {
    domainId: 4,
    shortName: 'Security',
    fullName: 'Sécurité, Constitutional AI & Garde-fous',
    scorePct: 81,
    correctCount: 5,
    totalCount: 6,
    errorCount: 1,
    drillTitle: 'Drill Security & Guardrails — 6 questions',
    drillTotalQuestions: 6,
    subtopics: [
      {
        id: 'indirect-injection',
        label: 'Prompt Injection Indirecte via MCP',
        errorCount: 1,
        drillQuestionCount: 6,
        rootCauseSummary:
          'Validation insuffisante des sorties d’outils contenant des instructions malveillantes issues de données externes.',
        goldenFix:
          'Encapsuler les sorties d’outils non fiables et imposer une confirmation HITL sur tout outil à effet de bord critique.',
      },
    ],
  },
  {
    domainId: 5,
    shortName: 'Production',
    fullName: 'Production, FinOps, Latence & Batch API',
    scorePct: 69,
    correctCount: 5,
    totalCount: 8,
    errorCount: 3,
    drillTitle: 'Drill Production & FinOps — 8 questions',
    drillTotalQuestions: 8,
    subtopics: [
      {
        id: 'batch-api-cumul',
        label: 'Cumul Message Batches API (-50%) + Prompt Caching',
        errorCount: 2,
        drillQuestionCount: 5,
        rootCauseSummary:
          'Mauvaise estimation du coût unitaire lors de la combinaison Batch API et préfixe caché.',
        goldenFix:
          'Regrouper les requêtes partageant le même System Prompt dans un même lot Batch pour cumuler -50% et -90% sur les lectures cache.',
      },
      {
        id: 'sse-retry',
        label: 'Gestion SSE & Backoff 429/529',
        errorCount: 1,
        drillQuestionCount: 3,
        rootCauseSummary:
          'Absence de lecture de l’en-tête retry-after sur erreur 429.',
        goldenFix:
          'Prioriser la valeur exacte de retry-after avant d’appliquer un Exponential Backoff avec Full Jitter.',
      },
    ],
  },
];

export const TARGETED_MCP_DRILL_12_QUESTIONS: TargetedDrillQuestion[] = [
  // 1-5: MCP Resources (3 erreurs -> 5 questions)
  {
    id: 1,
    subtopicId: 'mcp-resources',
    subtopicLabel: 'MCP Resources (1/5)',
    question:
      'Dans le protocole MCP, qui décide du moment où une « Resource » (`resources/read`) est chargée et injectée dans le contexte ?',
    options: [
      {
        id: 'A',
        text: 'Le modèle Claude de manière autonome via un bloc tool_use.',
      },
      {
        id: 'B',
        text: 'L’application hôte / client MCP (Application-driven) ou l’utilisateur, contrairement aux Tools qui sont Model-controlled.',
      },
      {
        id: 'C',
        text: 'Le serveur MCP qui pousse automatiquement toutes ses ressources dans le System Prompt au démarrage.',
      },
      {
        id: 'D',
        text: 'L’API Anthropic directement via un appel HTTP sortant vers le serveur MCP.',
      },
    ],
    correctOptionId: 'B',
    explanation:
      'Les Resources MCP sont « Application-driven » : c’est le client hôte (ou l’utilisateur) qui sélectionne et lit l’URI (`resources/read`) pour l’injecter dans le contexte, tandis que les Tools (`tools/call`) sont invoqués à l’initiative du modèle.',
  },
  {
    id: 2,
    subtopicId: 'mcp-resources',
    subtopicLabel: 'MCP Resources (2/5)',
    question:
      'Quel mécanisme JSON-RPC 2.0 permet à un client MCP d’être averti en temps réel lorsqu’une Resource (ex: `postgres://db/schema`) a été modifiée côté serveur ?',
    options: [
      {
        id: 'A',
        text: 'Le client envoie `resources/subscribe` avec l’URI, puis reçoit une notification `notifications/resources/updated` du serveur avant de relire via `resources/read`.',
      },
      {
        id: 'B',
        text: 'Le serveur modifie directement la mémoire KV-Cache d’Anthropic sans passer par le client.',
      },
      {
        id: 'C',
        text: 'Le client doit obligatoirement appeler `tools/list` toutes les secondes en polling.',
      },
      {
        id: 'D',
        text: 'Les Resources MCP sont immuables et ne peuvent jamais changer après `initialize`.',
      },
    ],
    correctOptionId: 'A',
    explanation:
      'MCP supporte nativement l’abonnement aux ressources : le client appelle `resources/subscribe` sur une URI, reçoit `notifications/resources/updated` lors d’un changement, et rafraîchit la donnée avec `resources/read`.',
  },
  {
    id: 3,
    subtopicId: 'mcp-resources',
    subtopicLabel: 'MCP Resources (3/5)',
    question:
      'Comment un serveur MCP expose-t-il des ressources dynamiques paramétrées (par exemple les logs d’un pod Kubernetes par `namespace` et `podName`) ?',
    options: [
      {
        id: 'A',
        text: 'Via des Resource Templates (`resources/templates/list`) utilisant la syntaxe RFC 6570 URI Template comme `k8s://{namespace}/pods/{podName}/logs`.',
      },
      {
        id: 'B',
        text: 'En créant un fichier statique par pod avant le handshake `initialize`.',
      },
      {
        id: 'C',
        text: 'En passant des requêtes SQL brutes dans le champ `mimeType`.',
      },
      {
        id: 'D',
        text: 'MCP interdit les paramètres dans les URI de ressources.',
      },
    ],
    correctOptionId: 'A',
    explanation:
      'La méthode `resources/templates/list` permet aux serveurs MCP d’exposer des modèles d’URI paramétrés conformes à la RFC 6570 (`{param}`).',
  },
  {
    id: 4,
    subtopicId: 'mcp-resources',
    subtopicLabel: 'MCP Resources (4/5)',
    question:
      'Quels sont les deux formats de contenu supportés dans la réponse d’un appel `resources/read` en MCP ?',
    options: [
      {
        id: 'A',
        text: '`text` (chaîne UTF-8) ou `blob` (donnée binaire encodée en Base64), accompagnés de `uri` et `mimeType`.',
      },
      {
        id: 'B',
        text: 'Uniquement du JSON minifié sans métadonnées MIME.',
      },
      {
        id: 'C',
        text: 'Uniquement des fichiers Markdown de moins de 4 Ko.',
      },
      {
        id: 'D',
        text: 'Des flux binaires bruts non encodés sur stdio.',
      },
    ],
    correctOptionId: 'A',
    explanation:
      'Chaque élément de `contents[]` renvoyé par `resources/read` contient l’`uri`, le `mimeType` optionnel, et soit un champ `text` (UTF-8), soit un champ `blob` (Base64).',
  },
  {
    id: 5,
    subtopicId: 'mcp-resources',
    subtopicLabel: 'MCP Resources (5/5)',
    question:
      'Quand devez-vous privilégier un « Tool » MCP plutôt qu’une « Resource » MCP dans votre architecture agentique ?',
    options: [
      {
        id: 'A',
        text: 'Lorsque l’opération implique une action décidée dynamiquement par le modèle, un calcul à la demande ou un effet de bord (écriture, mutation API, requête filtrée par le raisonnement de Claude).',
      },
      {
        id: 'B',
        text: 'Lorsqu’il s’agit d’attacher un fichier de configuration statique connu d’avance par l’interface utilisateur.',
      },
      {
        id: 'C',
        text: 'Lorsque vous voulez éviter que Claude ne voie la description dans le prompt.',
      },
      {
        id: 'D',
        text: 'Jamais, les Tools MCP sont dépréciés au profit des Resources.',
      },
    ],
    correctOptionId: 'A',
    explanation:
      'Les Tools sont faits pour l’action et l’interrogation pilotée par le modèle (`Model-controlled`), tandis que les Resources servent à fournir du contexte de référence adressable par URI (`Application-driven`).',
  },

  // 6-8: Tool choice (2 erreurs -> 3 questions)
  {
    id: 6,
    subtopicId: 'tool-choice',
    subtopicLabel: 'Tool choice (1/3)',
    question:
      'Quelle configuration de `tool_choice` est compatible avec l’activation simultanée de `thinking: { type: "enabled", budget_tokens: 4000 }` (Extended Thinking) ?',
    options: [
      {
        id: 'A',
        text: 'Uniquement `tool_choice: { "type": "auto" }` (par défaut) ou `{ "type": "none" }`.',
      },
      {
        id: 'B',
        text: '`tool_choice: { "type": "any" }` pour forcer l’usage d’au moins un outil après réflexion.',
      },
      {
        id: 'C',
        text: '`tool_choice: { "type": "tool", "name": "sql_query" }` pour garantir le schéma de sortie.',
      },
      {
        id: 'D',
        text: 'Toutes les valeurs de `tool_choice` sont acceptées avec Extended Thinking.',
      },
    ],
    correctOptionId: 'A',
    explanation:
      'Forcer l’appel d’outil (`any` ou `tool`) est incompatible avec Extended Thinking et déclenche une erreur HTTP 400. Seuls `auto` et `none` sont autorisés.',
  },
  {
    id: 7,
    subtopicId: 'tool-choice',
    subtopicLabel: 'Tool choice (2/3)',
    question:
      'Quelle est la différence exacte entre `tool_choice: { "type": "any" }` et `tool_choice: { "type": "tool", "name": "get_customer" }` ?',
    options: [
      {
        id: 'A',
        text: '`any` oblige Claude à appeler au moins l’un des outils fournis dans `tools[]` (de son choix), tandis que `tool` l’oblige à appeler spécifiquement l’outil nommé `get_customer`.',
      },
      {
        id: 'B',
        text: '`any` permet à Claude de répondre en texte libre s’il juge qu’aucun outil n’est pertinent.',
      },
      {
        id: 'C',
        text: '`tool` permet d’appeler plusieurs outils différents en parallèle.',
      },
      {
        id: 'D',
        text: '`any` désactive la validation JSON Schema des arguments.',
      },
    ],
    correctOptionId: 'A',
    explanation:
      '`auto` laisse Claude choisir entre texte et outil ; `any` impose l’appel d’au moins un outil parmi la liste ; `tool` impose l’appel de l’outil précis désigné par `name`.',
  },
  {
    id: 8,
    subtopicId: 'tool-choice',
    subtopicLabel: 'Tool choice (3/3)',
    question:
      'Comment empêcher Claude d’émettre plusieurs blocs `tool_use` en parallèle dans un même tour tout en conservant `tool_choice: { "type": "auto" }` ?',
    options: [
      {
        id: 'A',
        text: 'En ajoutant `"disable_parallel_tool_use": true` à l’intérieur de l’objet `tool_choice: { "type": "auto", "disable_parallel_tool_use": true }`.',
      },
      {
        id: 'B',
        text: 'En fixant `max_tokens: 100`.',
      },
      {
        id: 'C',
        text: 'En supprimant les descriptions des outils dans `tools[]`.',
      },
      {
        id: 'D',
        text: 'En passant `temperature: 0` qui désactive nativement le parallélisme.',
      },
    ],
    correctOptionId: 'A',
    explanation:
      'Le booléen `disable_parallel_tool_use: true` dans `tool_choice` garantit que Claude appellera au maximum un seul outil par tour de réponse.',
  },

  // 9-10: Erreurs parallèles (1 erreur -> 2 questions)
  {
    id: 9,
    subtopicId: 'parallel-errors',
    subtopicLabel: 'Erreurs parallèles (1/2)',
    question:
      'Claude génère 3 blocs `tool_use` (`id_1`, `id_2`, `id_3`) dans un seul message `assistant`. Vous exécutez les 3 appels en parallèle mais envoyez ensuite 3 messages `role: "user"` consécutifs contenant chacun un `tool_result`. Quel est le comportement de l’API ?',
    options: [
      {
        id: 'A',
        text: 'L’API rejette la requête avec une erreur 400 car le premier message `user` ne contient pas les `tool_result` pour `id_2` et `id_3` attendus immédiatement après le message `assistant`.',
      },
      {
        id: 'B',
        text: 'L’API fusionne automatiquement les 3 messages `user` côté serveur.',
      },
      {
        id: 'C',
        text: 'Claude traite uniquement `id_1` et ignore silencieusement `id_2` et `id_3`.',
      },
      {
        id: 'D',
        text: 'L’API accepte la requête mais facture 3 fois le System Prompt.',
      },
    ],
    correctOptionId: 'A',
    explanation:
      'Tous les `tool_use` d’un message `assistant` doivent recevoir leur `tool_result` correspondant dans UN SEUL message `role: "user"` immédiatement suivant (sous forme d’un tableau `content` contenant les 3 blocs `tool_result`).',
  },
  {
    id: 10,
    subtopicId: 'parallel-errors',
    subtopicLabel: 'Erreurs parallèles (2/2)',
    question:
      'Sur 3 appels MCP lancés en parallèle avec `Promise.allSettled()`, 2 réussissent en 180 ms et le 3e échoue après un timeout de 5 s. Quelle est la meilleure pratique d’architecture ?',
    options: [
      {
        id: 'A',
        text: 'Conserver les 2 résultats réussis et renvoyer pour le 3e un bloc `tool_result` avec `is_error: true` décrivant le timeout dans le même message `user` afin que Claude puisse décider d’une alternative.',
      },
      {
        id: 'B',
        text: 'Annuler toute la conversation et jeter les 2 résultats déjà obtenus.',
      },
      {
        id: 'C',
        text: 'Renvoyer une chaîne vide `""` sans `is_error` pour tromper le modèle.',
      },
      {
        id: 'D',
        text: 'Modifier l’historique `assistant` passé pour effacer le 3e bloc `tool_use`.',
      },
    ],
    correctOptionId: 'A',
    explanation:
      'L’isolation des fautes avec `Promise.allSettled()` combinée à `is_error: true` sur la branche en échec préserve le travail accompli par les 2 autres outils et permet à Claude de s’adapter.',
  },

  // 11-12: is_error (1 erreur -> 2 questions)
  {
    id: 11,
    subtopicId: 'is-error',
    subtopicLabel: 'is_error (1/2)',
    question:
      'Dans un message `role: "user"` contenant à la fois des blocs `tool_result` (dont un avec `is_error: true`) et un bloc `text` additionnel, quel ordre est exigé par l’API Anthropic ?',
    options: [
      {
        id: 'A',
        text: 'Tous les blocs `tool_result` doivent impérativement figurer au début du tableau `content`, AVANT tout bloc `text`.',
      },
      {
        id: 'B',
        text: 'Le bloc `text` doit toujours être placé en premier avant les `tool_result`.',
      },
      {
        id: 'C',
        text: 'L’ordre n’a aucune importance tant que `tool_use_id` est présent.',
      },
      {
        id: 'D',
        text: 'Il est interdit de mettre un bloc `text` dans le même message qu’un `tool_result`.',
      },
    ],
    correctOptionId: 'A',
    explanation:
      'Règle stricte de l’API Messages : dans le message `user` qui suit un `tool_use`, les blocs `tool_result` doivent précéder tout bloc `text` éventuel sous peine d’erreur 400.',
  },
  {
    id: 12,
    subtopicId: 'is-error',
    subtopicLabel: 'is_error (2/2)',
    question:
      'Quel doit être le contenu d’un bloc `tool_result` lorsque l’exécution d’un outil échoue à cause d’un paramètre SQL invalide généré par Claude ?',
    options: [
      {
        id: 'A',
        text: '`{ "type": "tool_result", "tool_use_id": "...", "is_error": true, "content": "Erreur SQL : colonne \'user_id\' inconnue. Colonnes disponibles : id, email, created_at." }`',
      },
      {
        id: 'B',
        text: '`{ "type": "tool_result", "tool_use_id": "...", "is_error": false, "content": "null" }`',
      },
      {
        id: 'C',
        text: 'Ne renvoyer aucun `tool_result` et laisser Claude deviner l’erreur.',
      },
      {
        id: 'D',
        text: 'Envoyer la stacktrace mémoire complète du serveur Node.js avec les variables d’environnement.',
      },
    ],
    correctOptionId: 'A',
    explanation:
      'Fournir `is_error: true` accompagné d’un message d’erreur métier structuré et actionnable (sans fuite de secrets) permet à Claude d’auto-corriger ses arguments au tour suivant.',
  },
];
