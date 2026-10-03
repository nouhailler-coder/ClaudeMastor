export interface AITutorDiagnostic {
  whyExplanation: string;
  socraticHint: string;
  keyConfusionTopic: string;
  followUpPrompt?: string;
  codeIllustration?: string;
}

// Dedicated database of pedagogical diagnostics for Claude certifications
export const AI_TUTOR_KNOWLEDGE_BASE: Record<string, Record<string, AITutorDiagnostic>> = {
  // Question 2 (MCP Resources vs Tools - The exact user example!)
  'p200-q2': {
    B: {
      keyConfusionTopic: 'MCP Resources vs MCP Tools',
      whyExplanation:
        'Tu as confondu MCP Resources et MCP Tools. Les requêtes d’écriture avec effets de bord relèvent des Tools, pas des Resources.',
      socraticHint:
        'Quel élément est utilisé pour exposer des données accessibles au modèle sans nécessairement déclencher une action ?',
      followUpPrompt:
        'Dans MCP, une Resource expose des données passives en lecture seule adressées par URI (`file://`, `postgres://`), tandis qu’un Tool permet au modèle d’exécuter des actions avec effets de bord.',
    },
    C: {
      keyConfusionTopic: 'Transports MCP vs Primitives',
      whyExplanation:
        'Tu as confondu les protocoles de transport (stdio vs HTTP/SSE) avec les primitives sémantiques de MCP.',
      socraticHint:
        'Le choix entre stdio et HTTP/SSE dépend de l’architecture réseau, pas de la nature Resource vs Tool. Quel élément est en lecture seule passive ?',
    },
    D: {
      keyConfusionTopic: 'Contrôle du Client MCP',
      whyExplanation:
        'Tu as supposé que les Resources étaient injectées automatiquement sans contrôle de l’application hôte.',
      socraticHint:
        'Dans MCP, le client hôte garde toujours le contrôle strict du contexte. Quelle primitive expose du contexte adressable par URI ?',
    },
  },

  // Question 1 (Parallel tool calls & is_error)
  'p200-q1': {
    A: {
      keyConfusionTopic: 'Structure des messages tool_result',
      whyExplanation:
        'Tu as supposé qu’il fallait découper les résultats en plusieurs messages user distincts.',
      socraticHint:
        'Lorsque Claude émet 3 `tool_use` dans un seul tour, dans combien de messages `user` l’API Anthropic impose-t-elle de renvoyer l’ensemble des `tool_result` correspondants ?',
      followUpPrompt:
        'Règle d’or Anthropic : 1 seul message user regroupant TOUS les tool_result immédiatement après le tour assistant.',
    },
    C: {
      keyConfusionTopic: 'Gestion des erreurs d’outils',
      whyExplanation:
        'Tu as pensé qu’il fallait masquer l’échec en supprimant le bloc tool_use de l’historique.',
      socraticHint:
        'Supprimer un tool_use brise la cohérence de l’arbre de conversation. Quel drapeau booléen permet d’indiquer proprement à Claude qu’un outil a échoué ?',
      followUpPrompt:
        'L’attribut `is_error: true` dans le bloc `tool_result` permet à Claude de comprendre l’erreur et d’adopter une stratégie de contournement.',
    },
    D: {
      keyConfusionTopic: 'tool_choice forcé vs gestion d’erreur',
      whyExplanation:
        'Tu as proposé de relancer l’inférence en modifiant tool_choice au lieu de répondre aux tool_use déjà émis.',
      socraticHint:
        'L’API exige impérativement que chaque `tool_use_id` reçoive son `tool_result` avant tout nouvel appel. Comment formater ce message ?',
    },
  },

  // Question 4 (Extended Thinking vs tool_choice)
  'p200-q4': {
    A: {
      keyConfusionTopic: 'Compatibilité Extended Thinking & tool_choice',
      whyExplanation:
        'Tu as supposé qu’Extended Thinking pouvait s’exécuter normalement avec un tool_choice forcé.',
      socraticHint:
        'L’API Anthropic impose une restriction stricte : quelle est la seule valeur de tool_choice compatible lorsque `thinking.budget_tokens` est activé ?',
      followUpPrompt:
        'Extended Thinking est incompatible avec `tool_choice: {"type": "any"}` ou `{"type": "tool"}`. Seul `auto` ou `none` est autorisé sous peine d’erreur HTTP 400.',
    },
    C: {
      keyConfusionTopic: 'Gestion du budget de tokens',
      whyExplanation:
        'Tu as imaginé que l’API réduisait dynamiquement le budget de réflexion.',
      socraticHint:
        'L’API valide la compatibilité des paramètres AVANT toute inférence. Que renvoie le serveur si les deux options sont contradictoires ?',
    },
    D: {
      keyConfusionTopic: 'Blocs thinking vs arguments d’outil',
      whyExplanation:
        'Tu as confondu le flux de sortie de la réflexion avec les arguments JSON de l’outil.',
      socraticHint:
        'Le bloc `thinking` précède obligatoirement le bloc `tool_use`. Quelle erreur de requête se produit si tool_choice est forcé ?',
    },
  },

  // Question 3 (Prompt Caching breakpoints limit)
  'p200-q3': {
    A: {
      keyConfusionTopic: 'Limites de breakpoints KV-Cache',
      whyExplanation:
        'Tu as restreint le cache au seul System Prompt, alors que les outils et messages peuvent aussi être cachés.',
      socraticHint:
        'Anthropic autorise plusieurs points d’arrêt `cache_control: {"type": "ephemeral"}` par requête. Quel est le chiffre exact ?',
    },
    C: {
      keyConfusionTopic: 'Nombre maximal de points d’arrêt',
      whyExplanation:
        'Tu as surestimé le quota de breakpoints autorisés par requête.',
      socraticHint:
        'Pense aux 4 niveaux typiques : System Prompt, Tools, Documents statiques, Contexte conversationnel. Combien au maximum ?',
    },
    D: {
      keyConfusionTopic: 'Contraintes formelles de l’API',
      whyExplanation:
        'Tu as supposé que le nombre de breakpoints était illimité dès lors que chaque bloc dépasse 1 024 tokens.',
      socraticHint:
        'Même si le seuil de 1 024 tokens est respecté, l’API limite strictement le nombre total de points d’arrêt par requête. Quel est ce plafond ?',
    },
  },

  // Question 5 (Message Batches API)
  'p200-q5': {
    B: {
      keyConfusionTopic: 'Tarification Message Batches',
      whyExplanation:
        'Tu as sous-estimé la remise de la Message Batches API et exclu les tokens de sortie.',
      socraticHint:
        'La Message Batches API applique une réduction symétrique sur les tokens d’entrée ET de sortie. Quel est ce pourcentage ?',
    },
    C: {
      keyConfusionTopic: 'Facturation des tokens Extended Thinking',
      whyExplanation:
        'Tu as pensé que les tokens de réflexion étaient gratuits en mode Batch.',
      socraticHint:
        'Les tokens de réflexion sont facturés comme des tokens de sortie. Quelle est la remise globale appliquée en contrepartie du délai asynchrone ?',
    },
    D: {
      keyConfusionTopic: 'Remise Batch vs Cache Hit',
      whyExplanation:
        'Tu as confondu le taux de remise du Cache Read (-90%) avec celui de la Message Batches API.',
      socraticHint:
        'Le Prompt Caching économise 90% sur la lecture du cache, mais quel rabais forfaitaire offre la Message Batches API sur l’ensemble du volume ?',
    },
  },

  // Question 37 (Parallel error handling)
  '37': {
    A: {
      keyConfusionTopic: 'Agrégation de tool_result parallèles',
      whyExplanation:
        'Tu as découpé les réponses en trois messages user successifs, ce qui provoque une erreur 400 immédiate.',
      socraticHint:
        'Pour des appels parallèles émis par Claude au tour N, comment tous les tool_result doivent-ils être regroupés au tour N+1 ?',
    },
    C: {
      keyConfusionTopic: 'Intégrité de l’historique conversationnel',
      whyExplanation:
        'Tu as suggéré de modifier l’historique en supprimant l’appel en échec, ce qui corrompt le dialogue.',
      socraticHint:
        'Quel paramètre spécifique du bloc `tool_result` permet de signaler à Claude que le serveur MCP n’a pas pu répondre sans altérer l’historique ?',
    },
    D: {
      keyConfusionTopic: 'Ordre des blocs dans le message user',
      whyExplanation:
        'Tu as placé un bloc text explicatif avant les blocs tool_result dans le tableau content.',
      socraticHint:
        'Dans le protocole Anthropic, où les blocs `tool_result` doivent-ils obligatoirement figurer par rapport aux blocs `text` ?',
    },
  },
};

// Heuristic fallback generator when a custom diagnostic isn't manually scripted
export function generateAITutorDiagnostic(
  questionText: string,
  chosenOptionText: string,
  correctOptionId: string,
  domainName: string
): AITutorDiagnostic {
  const lowerQ = questionText.toLowerCase();
  const lowerChoice = chosenOptionText.toLowerCase();

  if (lowerQ.includes('mcp') || lowerQ.includes('resource') || lowerQ.includes('tool')) {
    return {
      keyConfusionTopic: 'Architecture MCP & Tool Use',
      whyExplanation:
        'Tu as confondu la responsabilité entre l’exposition de données passives et l’exécution d’actions par le modèle.',
      socraticHint:
        'Pose-toi la question : l’opération entraîne-t-elle un effet de bord ou s’agit-il d’une lecture de contexte adressable par URI ?',
      followUpPrompt:
        'Dans le protocole MCP, les Resources sont passives (read-only), tandis que les Tools effectuent des opérations déterministes déclenchées par le LLM.',
    };
  }

  if (lowerQ.includes('cache') || lowerQ.includes('breakpoint') || lowerQ.includes('ephemeral')) {
    return {
      keyConfusionTopic: 'Prompt Caching & KV-Cache',
      whyExplanation:
        'Tu as sous-estimé les règles de placement ou les quotas de breakpoints imposés par le KV-cache Anthropic.',
      socraticHint:
        'Rappelle-toi l’ordre canonique : quel élément statique doit être placé au plus tôt pour maximiser le taux de cache hit ?',
      followUpPrompt:
        'Un breakpoint posé après une variable dynamique invalide l’ensemble du préfixe mis en cache.',
    };
  }

  if (lowerQ.includes('thinking') || lowerQ.includes('budget') || lowerQ.includes('extended')) {
    return {
      keyConfusionTopic: 'Extended Thinking & Paramètres API',
      whyExplanation:
        'Tu as associé Extended Thinking avec un mode incompatible ou un mauvais contrôle des tokens.',
      socraticHint:
        'Quand Claude réfléchit de manière autonome, quel type de sélection d’outils autorise-t-il sans contrainte contradictoire ?',
    };
  }

  if (lowerQ.includes('xml') || lowerQ.includes('prompt') || lowerQ.includes('injection')) {
    return {
      keyConfusionTopic: 'Structuration & Sécurité des Prompts',
      whyExplanation:
        'Tu as privilégié une formulation implicite plutôt qu’une séparation déterministe des flux de données.',
      socraticHint:
        'Quel mécanisme formel empêche les données utilisateur externes d’écraser les consignes système ?',
    };
  }

  return {
    keyConfusionTopic: domainName || 'Certification Claude Architect',
    whyExplanation: `Tu as sélectionné une hypothèse qui ne satisfait pas l'ensemble des contraintes de l'architecture (${chosenOptionText.slice(0, 60)}...).`,
    socraticHint:
      'Relis attentivement l’objectif principal : quelle solution garantit la conformité avec les spécifications officielles Anthropic sans compromis ?',
    followUpPrompt:
      'Élimine d’abord les distracteurs qui créent des effets de bord ou violent les SLA de latence.',
  };
}
