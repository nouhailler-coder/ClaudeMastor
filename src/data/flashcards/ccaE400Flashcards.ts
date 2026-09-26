import { Flashcard } from '../../types';

interface InfraFinOpsSeedConcept {
  topic: string;
  aspect: string;
  answerTitle: string;
  goldenRule: string;
  examTrap: string;
  prodValidation: string;
  keyTakeaway: string;
  docRef: string;
  articleId: string;
}

const DOMAIN_1_E400_SEEDS: InfraFinOpsSeedConcept[] = [
  {
    topic: 'Équation de Rentabilité (Break-Even) du Prompt Caching',
    aspect: "le calcul du seuil de rentabilité financière entre le surcoût d'écriture (+25%) et la remise de lecture (-90%)",
    answerTitle: 'Rentabilité atteinte dès la 2e requête (1 écriture à 1.25x + 1 lecture à 0.10x = 1.35x contre 2.00x sans cache)',
    goldenRule:
      "Sur un TTL de 5 minutes, l'écriture initiale du préfixe KV-Cache est facturée 1.25× le tarif input de base et chaque lecture suivante 0.10× : dès N = 2 requêtes partageant le même préfixe dans la fenêtre de 5 min, l'économie nette est de 32.5%, et elle atteint 86.5% pour N = 10.",
    examTrap:
      "Activer `cache_control: { type: 'ephemeral' }` sur des prompts uniques à usage unique (N = 1 jamais réutilisés dans les 5 minutes), ce qui augmente la facture d'input de +25% à perte.",
    prodValidation:
      'Alerte FinOps si le ratio `cache_read_input_tokens / cache_creation_input_tokens` descend sous le seuil critique de 1.5 sur un endpoint donné.',
    keyTakeaway:
      'Le Prompt Caching est rentable dès 1 seule réutilisation dans les 5 minutes, mais pénalisant (+25%) si le taux de réutilisation est nul.',
    docRef: 'Anthropic FinOps Guide: Prompt Caching Break-Even Economics (CCA-E400 §1.1)',
    articleId: 'prompt-caching',
  },
  {
    topic: 'Routage d’Affinité & Maintien du TTL KV-Cache à Grande Échelle',
    aspect: "l'ordonnancement du trafic multi-workers pour éviter l'expiration du TTL de 5 minutes sur les préfixes lourds",
    answerTitle: 'Regroupement temporel des requêtes par préfixe métier et maintien de chaleur (Cache Warmth) sous trafic actif',
    goldenRule:
      "Comme chaque cache hit réinitialise le TTL de 5 minutes du préfixe KV-Cache, regrouper les traitements partageant la même base documentaire ou le même jeu d'outils par lots temporels au sein du même Workspace plutôt que de les disperser aléatoirement sur 24 heures.",
    examTrap:
      'Envoyer un ping artificiel toutes les 4 minutes pendant toute la nuit alors qu’aucun utilisateur n’est connecté : payer des lectures inutiles en heures creuses coûte plus cher qu’une réécriture unique au matin.',
    prodValidation:
      'Mesure du Cache Hit Ratio horaire corrélé au volume de trafic réel par Workspace.',
    keyTakeaway:
      'Optimiser l’affinité temporelle des jobs partageant un même préfixe maximise le rafraîchissement naturel du TTL de 5 minutes.',
    docRef: 'Anthropic Principal Infrastructure: KV-Cache Warmth & Scheduling (CCA-E400 §1.2)',
    articleId: 'prompt-caching',
  },
  {
    topic: 'Stratification des 4 Breakpoints cache_control par Fréquence de Mutation',
    aspect: "l'allocation optimale des 4 marqueurs de cache autorisés par requête Messages",
    answerTitle: 'Ordonnancement strict du plus statique au plus dynamique : Tools -> System -> Corpus RAG -> Historique',
    goldenRule:
      "Placer les 4 breakpoints selon leur fréquence de changement : (1) dernier outil de `tools` (immuable), (2) fin du `system` prompt (stable), (3) fin du dossier documentaire de référence (semi-statique), (4) avant-dernier tour de l'historique conversationnel (incrémental).",
    examTrap:
      'Insérer un horodatage `new Date().toISOString()` ou un UUID de requête tout au début du System Prompt, ce qui invalide 100% des 4 paliers de cache situés en aval.',
    prodValidation:
      'Test d’invariance binaire en CI/CD vérifiant que les préfixes situés avant les breakpoints 1 et 2 sont strictement déterministes.',
    keyTakeaway:
      'Toute variable volatile (timestamp, request_id) doit être reléguée tout à la fin du dernier message utilisateur, après les breakpoints de cache.',
    docRef: 'Anthropic Docs: 4-Tier Cache Breakpoint Hierarchy (CCA-E400 §1.3)',
    articleId: 'prompt-caching',
  },
  {
    topic: 'Architecture Multi-Cloud : Anthropic API vs AWS Bedrock vs Google Vertex AI',
    aspect: "la normalisation des identifiants de modèles et des payloads dans une passerelle LLM unifiée",
    answerTitle: 'Couche d’abstraction traduisant les identifiants de modèles et les mécanismes IAM propres à chaque cloud',
    goldenRule:
      "Maintenir une table de correspondance canonique dans la LLM Gateway : `claude-3-5-sonnet-20241022` (Anthropic Direct, header `x-api-key`), `anthropic.claude-3-5-sonnet-20241022-v2:0` (AWS Bedrock, signature SigV4) et `claude-3-5-sonnet-v2@20241022` (GCP Vertex AI, OAuth2 Bearer).",
    examTrap:
      'Coder en dur l’identifiant `claude-3-5-sonnet-20241022` sans adaptateur et tenter de l’envoyer tel quel à l’endpoint AWS Bedrock `InvokeModel`, ce qui échoue avec `ValidationException`.',
    prodValidation:
      'Test de bascule (Failover Drill) vérifiant la compatibilité fonctionnelle de bout en bout (Streaming, Tool Use, Prompt Caching) sur les 3 fournisseurs.',
    keyTakeaway:
      'Une passerelle LLM multi-cloud abstrait l’authentification (API Key vs SigV4 vs OAuth) et le nommage des modèles tout en conservant le schéma Messages.',
    docRef: 'Anthropic Multi-Cloud Architecture: Bedrock & Vertex AI Parity (CCA-E400 §1.4)',
    articleId: 'model-routing',
  },
  {
    topic: 'Provisioned Throughput vs Pay-As-You-Go (On-Demand)',
    aspect: "l'arbitrage financier et capacitaire entre facturation au token et capacité réservée dédiée",
    answerTitle: 'On-Demand pour les charges variables ; Provisioned Throughput (Model Units) pour les charges continues à SLA garanti',
    goldenRule:
      "Opter pour du Provisioned Throughput (ou réservations d'engagement ITPM/OTPM) uniquement lorsque le débit soutenu 24/7 présente un facteur d'utilisation élevé (> 65-70%) ou exige une garantie contractuelle stricte de latence sans contention.",
    examTrap:
      'Dimensionner un Provisioned Throughput annuel sur le pic maximal de trafic de 15 minutes du lundi matin, laissant 85% de la capacité réservée inutilisée le reste de la semaine.',
    prodValidation:
      'Architecture hybride (Base-Load + Burst) : absorber le socle constant sur la capacité réservée et déborder (spillover) les pics de charge vers le pool On-Demand.',
    keyTakeaway:
      'L’architecture hybride « Socle Réservé + Débordement On-Demand » optimise à la fois le coût unitaire et la résilience aux pics.',
    docRef: 'Anthropic Enterprise FinOps: Capacity Planning & Provisioned Throughput (CCA-E400 §1.5)',
    articleId: 'rate-limiting',
  },
  {
    topic: 'Profils d’Inférence Cross-Region (CRIS) & Équilibrage de Charge',
    aspect: "l'exploitation des profils d'inférence multi-régions sur AWS Bedrock et Vertex AI pour absorber les pics de demande",
    answerTitle: 'Routage dynamique inter-régions au sein d’une même zone géopolitique (ex: `eu.` ou `us.`) pour doubler la résilience de quota',
    goldenRule:
      "Utiliser un Inference Profile préfixé par zone (`eu.anthropic.claude-3-5-sonnet...` ou `us.anthropic...`) afin que le cloud provider répartisse automatiquement les requêtes entre plusieurs datacenters d'une même juridiction sans frais supplémentaires.",
    examTrap:
      'Épingler tout le trafic européen sur une seule disponibilité régionale (`eu-central-1` uniquement) lorsqu’une répartition multi-régions UE (`eu-central-1` + `eu-west-1` + `eu-west-3`) est autorisée par le DPO.',
    prodValidation:
      'Vérification que le profil Cross-Region choisi respecte strictement les frontières géographiques contractuelles (UE uniquement pour les données RGPD).',
    keyTakeaway:
      'Les profils Cross-Region intra-zone (ex: EU CRIS) augmentent les plafonds de débit et la disponibilité tout en respectant la souveraineté continentale.',
    docRef: 'Cloud Infrastructure Guide: Cross-Region Inference Profiles for Claude (CCA-E400 §1.6)',
    articleId: 'rate-limiting',
  },
  {
    topic: 'Pré-Calcul Déterministe via l’Endpoint Token Counting (/v1/messages/count_tokens)',
    aspect: "l'estimation exacte du coût et du remplissage de la fenêtre de 200k avant exécution de l'inférence",
    answerTitle: 'Appel préalable à count_tokens ou tokenisation locale pour l’admission control et le routage de contexte',
    goldenRule:
      "Utiliser `client.messages.count_tokens()` (qui prend en compte le System Prompt, les définitions JSON Schema de `tools`, les images et les PDF) pour rejeter ou compacter les requêtes dépassant le budget alloué avant de déclencher une inférence coûteuse.",
    examTrap:
      'Estimer la taille d’un prompt multimodal contenant 15 pages PDF et 30 outils avec une simple division `text.length / 4`, ce qui sous-estime massivement les tokens visuels et de schéma.',
    prodValidation:
      'Intégration de `count_tokens` dans le contrôleur d’admission pour les requêtes lourdes (> 50k tokens estimés).',
    keyTakeaway:
      'L’endpoint `count_tokens` calcule au token près le coût total incluant le System Prompt, les schémas d’outils et les blocs multimodaux.',
    docRef: 'Anthropic API Reference: Token Counting Endpoint (CCA-E400 §1.7)',
    articleId: 'context-window-niah',
  },
  {
    topic: 'Dimensionnement FinOps de l’Extended Thinking (budget_tokens)',
    aspect: "la maîtrise des coûts et de la latence liés aux tokens de raisonnement interne facturés comme tokens de sortie",
    answerTitle: 'Allocation adaptative de budget_tokens selon la complexité de la requête (1 024 min à 32k+ sur tâches critiques)',
    goldenRule:
      "Comme les tokens générés dans le bloc `thinking` sont facturés au tarif des `output_tokens` (5× plus chers que les tokens d'input), réserver l'Extended Thinking aux problèmes d'architecture, de mathématiques ou de synthèse complexe et calibrer `budget_tokens` par palier (ex: 2 048 ou 4 096).",
    examTrap:
      'Activer `thinking: { type: "enabled", budget_tokens: 16000 }` par défaut sur toutes les requêtes simples de classification ou d’extraction.',
    prodValidation:
      'Suivi analytique séparé du volume de tokens de réflexion par rapport aux tokens de réponse visible pour mesurer le ROI qualité/coût.',
    keyTakeaway:
      'Les tokens d’Extended Thinking sont facturés au prix de l’Output : activez-les sélectivement via un routeur de complexité.',
    docRef: 'Anthropic Docs: Extended Thinking Performance & Cost Management (CCA-E400 §1.8)',
    articleId: 'extended-thinking',
  },
  {
    topic: 'Économie de Tokens Multimodale : Résolution d’Images & Densité PDF',
    aspect: "la formule de calcul des tokens d'images `(width_px * height_px) / 750` et le pré-traitement haute performance",
    answerTitle: 'Redimensionnement côté client/proxy sous 1568px de côté long (~1 600 tokens max par image)',
    goldenRule:
      "Chaque image est facturée selon `(largeur × hauteur) / 750` tokens : redimensionner en amont toute image dépassant 1568×1568 px économise de la bande passante réseau et de la latence CPU sans aucune perte de précision visuelle (car l'API la redimensionnerait de toute façon).",
    examTrap:
      'Transmettre 20 photos haute résolution de 12 mégapixels brutes en Base64 dans une seule requête, générant un payload HTTP de 80 Mo et saturant la mémoire des proxies.',
    prodValidation:
      'Pipeline d’ingestion d’images appliquant un redimensionnement bicubique max-dimension 1568px et une compression WebP/JPEG qualité 85.',
    keyTakeaway:
      'Formule à connaître pour l’examen : `Tokens Image ≈ (Largeur × Hauteur) / 750`, avec un plafond optimal à 1568 px sur le grand côté.',
    docRef: 'Anthropic Vision Guide: Calculating Image Token Costs (CCA-E400 §1.9)',
    articleId: 'context-window-niah',
  },
  {
    topic: 'Arbitrage Architecture : Context Stuffing (200k + Cache) vs RAG Vectoriel Hybride',
    aspect: "le point de bascule économique et de latence entre charger tout un corpus en cache et indexer en base vectorielle",
    answerTitle: 'Prompt Caching direct pour les corpus < 150k tokens fortement réutilisés ; RAG Hybride au-delà de 200k tokens',
    goldenRule:
      "Lorsque la base de connaissances d'un domaine tient dans 50k à 150k tokens et fait l'objet de requêtes fréquentes (> 2 req / 5 min), le chargement intégral avec Prompt Caching élimine la complexité d'une base vectorielle tout en offrant un rappel (recall) de 99%+ à 0.10× du prix input.",
    examTrap:
      'Construire une usine à gaz de chunking et de re-ranking vectoriel pour une documentation de 40 pages (30k tokens) interrogée 100 fois par heure.',
    prodValidation:
      'Modèle TCO comparant le coût d’infrastructure Vector DB + Embeddings au coût du KV-Cache Anthropic selon la taille du corpus et la fréquence de requêtes.',
    keyTakeaway:
      'Sous 150k tokens avec un trafic régulier, le Context Stuffing couplé au Prompt Caching surpasse souvent le RAG en précision et en TCO.',
    docRef: 'Anthropic Architecture Whitepaper: Long Context Caching vs RAG (CCA-E400 §1.10)',
    articleId: 'context-window-niah',
  },
];

const DOMAIN_2_E400_SEEDS: InfraFinOpsSeedConcept[] = [
  {
    topic: 'Asymétrie Tarifaire Input / Output & Ingénierie de Concision',
    aspect: "l'impact disproportionné des tokens de sortie sur la facture globale et la latence totale de génération",
    answerTitle: 'Un token d’output coûte 5× plus cher qu’un token d’input (et 50× plus cher qu’un token d’input en cache)',
    goldenRule:
      "Sur Claude 3.5 Sonnet ($3/MTok input, $0.30/MTok cache read, $15/MTok output), réduire la verbosité de la sortie de 500 tokens économise autant d'argent que de réduire l'entrée standard de 2 500 tokens ou l'entrée cachée de 25 000 tokens.",
    examTrap:
      'Concentrer 100% des efforts FinOps sur le raccourcissement du System Prompt (déjà mis en cache à -90%) en laissant le modèle générer des réponses verbeuses de 1 500 tokens.',
    prodValidation:
      'Benchmark de concision par endpoint mesurant le nombre moyen d’output_tokens par transaction métier.',
    keyTakeaway:
      'Ratio FinOps fondamental : 1 token Output = 5 tokens Input Standard = 50 tokens Input Cache Read.',
    docRef: 'Anthropic Pricing & Tokenomics Analysis (CCA-E400 §2.1)',
    articleId: 'model-routing',
  },
  {
    topic: 'Optimisation de Schéma de Sortie : JSON Compact vs Verbeux',
    aspect: "la réduction du nombre de tokens générés et de la latence lors d'extractions structurées à haut débit",
    answerTitle: 'Clés JSON courtes, codes énumérés concis et suppression des champs null ou redondants',
    goldenRule:
      "Dans les pipelines traitant des millions d'extractions JSON par jour, utiliser des clés concises (`cat` au lieu de `classification_category_label`) et ne pas demander au modèle de recopier le texte source dans la sortie JSON.",
    examTrap:
      'Exiger dans le JSON de sortie un champ `original_input_text_copy` qui force le modèle à régénérer au tarif Output ($15/MTok) le texte qu’il vient de lire en Input ($3/MTok).',
    prodValidation:
      'Audit des schémas de sortie vérifiant zéro duplication de données d’entrée dans le payload de sortie.',
    keyTakeaway:
      'Ne jamais faire recopier le texte d’entrée dans le JSON de sortie : référencez les éléments par leur `id` ou leur index.',
    docRef: 'Anthropic High-Throughput Engineering: Output Token Minimization (CCA-E400 §2.2)',
    articleId: 'canonical-xml',
  },
  {
    topic: 'Prefilling Assistant (`{`) pour Zéro Overhead de Préambule',
    aspect: "l'élimination des formules de politesse (« Voici le JSON demandé : ») qui consomment des tokens et cassent les parseurs",
    answerTitle: 'Ajout d’un message final `{ role: "assistant", content: "{" }` pour démarrer immédiatement au premier token utile',
    goldenRule:
      "En pré-remplissant le tour `assistant` avec `{` (ou `<result>`), on économise 15 à 40 tokens d'output superflus à chaque appel (soit ~200 à 400 ms de latence gagnée) et on garantit un parsing `JSON.parse('{' + text)` sans regex.",
    examTrap:
      'Rappel technique : le Prefilling assistant n’est pas compatible lorsque `thinking` (Extended Thinking) est activé ; dans ce cas, utiliser `tool_choice` forcé ou une consigne XML stricte.',
    prodValidation:
      'Vérification que le taux d’erreur de parsing JSON en production est de 0.00% et que le premier token généré est directement une clé du schéma.',
    keyTakeaway:
      'Le Prefilling assistant supprime simultanément les tokens de bavardage introductif et le risque d’erreur de parsing.',
    docRef: 'Anthropic Docs: Prefilling Claude Responses for Speed & JSON (CCA-E400 §2.3)',
    articleId: 'assistant-prefilling',
  },
  {
    topic: 'Utilisation Chirurgicale de stop_sequences pour Coupe-Circuit de Génération',
    aspect: "l'arrêt immédiat du décodage GPU dès que la balise fermante cible est atteinte",
    answerTitle: 'Déclaration de stop_sequences: ["</response>", "</json>"] pour éviter tout commentaire post-réponse',
    goldenRule:
      "Associer le Prefilling d'une balise ouvrante (`<answer>`) au paramètre `stop_sequences: ['</answer>']` : dès que Claude émet la balise fermante, la génération s'arrête instantanément au token près.",
    examTrap:
      'Oublier que la séquence déclarée dans `stop_sequences` n’est PAS incluse dans le texte retourné par l’API (lorsque `stop_reason === "stop_sequence"`, le champ `stop_sequence` indique quelle chaîne a déclenché l’arrêt).',
    prodValidation:
      'Vérifier dans le code client la ré-annexion éventuelle de la balise fermante lorsque `response.stop_reason === "stop_sequence"`.',
    keyTakeaway:
      'Lorsque `stop_reason` vaut `"stop_sequence"`, la chaîne d’arrêt est exclue de `content` et exposée dans `response.stop_sequence`.',
    docRef: 'Anthropic API Reference: Stop Sequences Behavior (CCA-E400 §2.4)',
    articleId: 'assistant-prefilling',
  },
  {
    topic: 'Normalisation Canonique des Prompts pour Maximiser le Cache Hit Ratio',
    aspect: "l'élimination des variations invisibles (espaces, ordre des clés JSON, retours chariot CRLF/LF) qui brisent le KV-Cache",
    answerTitle: 'Sérialisation déterministe (tri des clés JSON, normalisation LF `\\n` et templates figés)',
    goldenRule:
      "Comme le KV-Cache d'Anthropic repose sur une correspondance exacte token par token du préfixe, normaliser les fins de lignes (`\\r\\n` -> `\\n`) et trier alphabétiquement les clés de tout objet JSON inséré dans le préfixe mis en cache.",
    examTrap:
      'Construire le System Prompt à partir d’un dictionnaire dont l’ordre d’itération des clés varie selon le serveur ou la version du runtime, faisant chuter le Cache Hit Ratio à 0%.',
    prodValidation:
      'Calcul d’une empreinte SHA-256 du préfixe système en télémétrie pour détecter toute dérive accidentelle entre les pods.',
    keyTakeaway:
      'Une seule différence d’espace ou d’ordre de clé JSON au milieu du préfixe invalide tout le KV-Cache à partir de ce point.',
    docRef: 'Anthropic Engineering: Deterministic Prompt Serialization for Caching (CCA-E400 §2.5)',
    articleId: 'prompt-caching',
  },
  {
    topic: 'Compression du Chain-of-Thought (CoT Concis vs CoT Verbeux)',
    aspect: "l'équilibre entre la profondeur de raisonnement nécessaire à la précision et le budget de latence temps réel",
    answerTitle: 'Raisonnement télégraphique structuré dans `<scratchpad>` limité aux étapes décisives',
    goldenRule:
      "Pour les flux synchrones soumis à un SLA de latence < 2.5s, instruire le modèle d'utiliser un style télégraphique concis (puces courtes, équations directes) dans sa balise `<thinking_steps>` plutôt que des paragraphes littéraires complets.",
    examTrap:
      'Supprimer complètement toute étape de raisonnement sur une tâche logique complexe pour gagner 300 ms, ce qui fait chuter l’exactitude de 92% à 64%.',
    prodValidation:
      'Courbe de Pareto (Exactitude vs Latence P95) évaluant 3 niveaux de concision du scratchpad sur le jeu d’évaluation.',
    keyTakeaway:
      'Le CoT télégraphique par puces conserve 98% du gain de précision du CoT long tout en réduisant de 60% les tokens générés.',
    docRef: 'Anthropic Latency Optimization Guide: Concise Chain-of-Thought (CCA-E400 §2.6)',
    articleId: 'canonical-xml',
  },
  {
    topic: 'Sélection & Ordonnancement d’Exemples Few-Shot Haute Densité',
    aspect: "l'optimisation du nombre d'exemples `<example>` dans le préfixe pour maximiser le signal par token",
    answerTitle: '3 à 5 exemples canoniques couvrant les cas limites (edge cases), placés dans le bloc mis en cache',
    goldenRule:
      "Placer les exemples Few-Shot à l'intérieur du préfixe couvert par `cache_control: { type: 'ephemeral' }` afin que leur coût en tokens soit réduit de 90% et leur latence de pré-remplissage (prefill) amortie sur toutes les requêtes.",
    examTrap:
      'Injecter dynamiquement 20 exemples Few-Shot différents à chaque requête *avant* le corpus statique, ce qui empêche la mise en cache du corpus.',
    prodValidation:
      'Mesure de l’apport marginal de chaque exemple Few-Shot sur le score F1 par rapport à son coût token.',
    keyTakeaway:
      'Si vos exemples Few-Shot sont dynamiques (RAG Few-Shot), placez-les APRÈS le breakpoint de cache du System Prompt et des outils.',
    docRef: 'Anthropic Prompt Engineering: Few-Shot Placement & Caching (CCA-E400 §2.7)',
    articleId: 'prompt-caching',
  },
  {
    topic: 'Traitement par Lot Intra-Requête (Multi-Item Prompt Batching)',
    aspect: "le regroupement de N petits éléments indépendants (ex: 20 avis clients à classifier) dans un seul appel API",
    answerTitle: 'Encapsulation XML `<items><item id="1">...</item>...</items>` pour amortir une seule fois le System Prompt',
    goldenRule:
      "Lorsqu'on doit classifier de courts textes (50 tokens chacun) avec un System Prompt de 2 000 tokens, regrouper 10 à 25 items dans une seule requête amortit le coût de lecture du préfixe par 20 et réduit par 20 le quota RPM consommé.",
    examTrap:
      'Regrouper 500 items dans une seule requête au point de dépasser le plafond `max_tokens` de sortie (8 192 tokens), tronquant la réponse JSON.',
    prodValidation:
      'Calculateur dynamique de taille de lot (Batch Size) vérifiant que `N * expected_output_tokens_per_item < 0.8 * max_tokens`.',
    keyTakeaway:
      'Le regroupement multi-items amortit les frais fixes de prompt et économise les quotas RPM, tant que la sortie totale reste sous `max_tokens`.',
    docRef: 'Anthropic FinOps Patterns: Intra-Request Multi-Item Batching (CCA-E400 §2.8)',
    articleId: 'batch-api',
  },
  {
    topic: 'Calibrage de max_tokens pour l’Admission Control ITPM/OTPM',
    aspect: "l'impact de la valeur déclarée de `max_tokens` sur la réservation immédiate de quota Output Tokens Per Minute",
    answerTitle: 'Estimer max_tokens au plus proche du P99 réel de la tâche au lieu de fixer 8192 par défaut',
    goldenRule:
      "L'algorithme de Rate Limiting d'Anthropic réserve le quota OTPM en fonction de `max_tokens` au moment où la requête démarre (et ajuste à la fin) : fixer `max_tokens: 8192` pour une réponse de 100 tokens divise artificiellement par 80 votre concurrence instantanée autorisée.",
    examTrap:
      'Mettre `max_tokens: 8192` en constante globale dans tout le code applicatif, provoquant des erreurs 429 `rate_limit_error` alors que la consommation réelle de tokens est très faible.',
    prodValidation:
      'Profilage de la distribution P99 des `output_tokens` par route API et ajustement de `max_tokens` à `P99 * 1.25`.',
    keyTakeaway:
      'Surdimensionner `max_tokens` bloque inutilement votre quota OTPM en vol et déclenche des erreurs 429 évitables.',
    docRef: 'Anthropic Rate Limits Deep Dive: OTPM Reservation & max_tokens (CCA-E400 §2.9)',
    articleId: 'rate-limiting',
  },
  {
    topic: 'Élimination du Markdown Redondant dans les Pipelines Machine-to-Machine',
    aspect: "la suppression des blocs ```json et du formatage décoratif lorsque la sortie est consommée exclusivement par du code",
    answerTitle: 'Interdiction explicite des clôtures Markdown (code fences) et utilisation du Prefilling `{`',
    goldenRule:
      "Dans un microservice backend, chaque bloc ```json ... ``` généré inutilement consomme des tokens de sortie et oblige à nettoyer la chaîne avant le parsing.",
    examTrap:
      'Demander « Réponds en Markdown avec un bloc de code JSON » pour une API interne qui n’affiche jamais la réponse à un humain.',
    prodValidation:
      'Test de contrat d’interface vérifiant que la réponse brute commence par `{` et se termine par `}`.',
    keyTakeaway:
      'Dans les flux Machine-to-Machine, produisez du JSON brut sans enveloppe Markdown.',
    docRef: 'Anthropic API Best Practices: Raw JSON Generation (CCA-E400 §2.10)',
    articleId: 'assistant-prefilling',
  },
];

const DOMAIN_3_E400_SEEDS: InfraFinOpsSeedConcept[] = [
  {
    topic: 'Coût de Tokenisation des Définitions d’Outils & Overhead Système',
    aspect: "l'impact d'un catalogue de dizaines d'outils JSON Schema sur la consommation d'input_tokens",
    answerTitle: 'Chaque définition d’outil + le prompt système interne de Tool Use (~340 tokens) sont facturés en input',
    goldenRule:
      "Activer le paramètre `tools` ajoute un préambule système interne d'environ 313 à 346 tokens plus les tokens de chaque schéma JSON : pour un catalogue de 50 outils (~12 000 tokens), il est impératif de placer `cache_control: { type: 'ephemeral' }` sur le dernier outil.",
    examTrap:
      'Envoyer 80 définitions d’outils à chaque requête sans Prompt Caching, ce qui facture 15 000 tokens d’input supplémentaires à plein tarif sur chaque message.',
    prodValidation:
      'Vérification via `count_tokens` du poids exact du tableau `tools` et confirmation du Cache Hit sur ce bloc en production.',
    keyTakeaway:
      'Les définitions `tools` consomment des milliers de tokens d’input : mettez-les systématiquement en cache via le dernier outil du tableau.',
    docRef: 'Anthropic Tool Use Guide: Token Pricing & Caching for Tools (CCA-E400 §3.1)',
    articleId: 'tool-use',
  },
  {
    topic: 'Sélection Dynamique d’Outils (Tool Retrieval) vs Catalogue Statique Caché',
    aspect: "l'arbitrage architectural lorsqu'une plateforme d'entreprise possède plus de 200 outils MCP disponibles",
    answerTitle: 'Catalogue statique caché jusqu’à ~30-40 outils ; routage par sous-ensemble domaine (Domain Toolset) au-delà',
    goldenRule:
      "Attention au piège FinOps : filtrer dynamiquement un sous-ensemble d'outils différent à chaque requête casse le KV-Cache de toute la requête ! Il est beaucoup plus performant de définir 3 à 4 « profils métiers » fixes d'outils (chacun mis en cache) que de composer une liste d'outils unique par requête.",
    examTrap:
      'Utiliser un RAG vectoriel qui injecte à chaque tour une combinaison différente de 5 outils, invalidant ainsi le cache du System Prompt et de tout l’historique de conversation.',
    prodValidation:
      'Comparaison du coût et de la précision entre profils d’outils fixes cachés et sélection dynamique par requête.',
    keyTakeaway:
      'Préférez des profils d’outils fixes par domaine métier (compatibles KV-Cache) plutôt qu’une liste d’outils mutante à chaque tour.',
    docRef: 'Anthropic Principal Architecture: Tool Catalog Caching vs Dynamic Retrieval (CCA-E400 §3.2)',
    articleId: 'prompt-caching',
  },
  {
    topic: 'Infrastructure MCP Distribuée : Scalabilité Horizontale & Transport Streamable HTTP',
    aspect: "le déploiement en production de serveurs MCP haute disponibilité derrière un équilibreur de charge",
    answerTitle: 'Transport Streamable HTTP / SSE stateless ou à affinité de session Redis pour les clusters Kubernetes',
    goldenRule:
      "Pour déployer des serveurs MCP partagés à l'échelle de l'entreprise sur Kubernetes, utiliser le transport HTTP/SSE (ou Streamable HTTP) avec externalisation de l'état de session dans Redis afin que n'importe quel pod puisse traiter les appels `tools/call`.",
    examTrap:
      'Tenter d’utiliser le transport local `stdio` pour exposer un serveur MCP distant multi-utilisateurs à travers le réseau.',
    prodValidation:
      'Tests de charge à 500 req/s sur le cluster MCP avec arrêt aléatoire de pods (Chaos testing) sans perte de requête `tools/call`.',
    keyTakeaway:
      '`stdio` est réservé aux processus locaux 1:1 ; la production distribuée multi-tenants repose sur Streamable HTTP / SSE derrière Load Balancer.',
    docRef: 'Model Context Protocol Infrastructure: Production Deployment & Scaling (CCA-E400 §3.3)',
    articleId: 'mcp-protocol',
  },
  {
    topic: 'Réduction du RTT Global par Appels d’Outils Parallèles (Parallel Tool Calling)',
    aspect: "l'équation de latence d'une étape agentique invoquant N services externes indépendants",
    answerTitle: 'Latence Séquentielle = N × (TTFT + Gen + Tool_RTT) vs Latence Parallèle = 1 × (TTFT + Gen) + max(Tool_RTT)',
    goldenRule:
      "Lorsqu'un agent doit consulter 4 microservices indépendants (ex: profil client, commandes, factures, tickets), l'émission des 4 blocs `tool_use` en un seul tour suivie d'un `Promise.all()` côté orchestrateur réduit la latence totale de 4 cycles LLM complets à 1 seul cycle.",
    examTrap:
      'Exécuter les 4 blocs `tool_use` retournés par Claude dans une boucle `for...of` séquentielle bloquante (`await runTool()`) au lieu de les paralléliser avec `Promise.allSettled()`.',
    prodValidation:
      'Analyse des flamegraphs OpenTelemetry vérifiant l’alignement horizontal simultané des spans d’exécution d’outils.',
    keyTakeaway:
      'Combiner les appels `tool_use` parallèles de Claude avec `Promise.allSettled()` côté serveur élimine N-1 cycles d’inférence LLM.',
    docRef: 'Anthropic Latency Engineering: Parallel Tool Execution Math (CCA-E400 §3.4)',
    articleId: 'tool-use',
  },
  {
    topic: 'Cache L2 (Redis) des Résultats d’Outils MCP Déterministes',
    aspect: "l'évitement des appels répétés à des APIs tierces coûteuses ou lentes au cours de sessions d'agents",
    answerTitle: 'Mise en cache par clé `sha256(tool_name + canonical_args)` avec TTL adapté à la fraîcheur métier',
    goldenRule:
      "Interposer dans la passerelle MCP un cache L2 Redis pour les outils de lecture fréquents (référentiels produits, taux de change, documentation, schémas) afin de retourner le `tool_result` en < 2 ms sans solliciter l'API externe.",
    examTrap:
      'Ne pas inclure l’identifiant du locataire (`tenant_id`) ou le périmètre de droits dans la clé de cache Redis d’un outil retournant des données privées.',
    prodValidation:
      'Clé de cache composite obligatoire : `mcp:cache:${tenantId}:${toolName}:${sha256(canonicalJson(args))}`.',
    keyTakeaway:
      'Un cache L2 Redis sur la passerelle MCP accélère les boucles d’agents tout en isolant strictement les clés par `tenantId`.',
    docRef: 'Anthropic Infrastructure Patterns: Tool Layer Caching & Multi-Tenancy (CCA-E400 §3.5)',
    articleId: 'mcp-protocol',
  },
  {
    topic: 'Compression & Projection des Payloads tool_result',
    aspect: "la maîtrise de l'inflation quadratique des tokens d'entrée au fil des tours d'une boucle agentique",
    answerTitle: 'Coût cumulé d’un tool_result = Taille(tool_result) × Nombre de tours restants dans la boucle',
    goldenRule:
      "Un `tool_result` de 10 000 tokens injecté au tour 1 sera relu aux tours 2, 3, 4... jusqu'à la fin de la boucle (soit 100 000 tokens facturés sur 10 tours) : filtrer et projeter uniquement les attributs utiles avant d'insérer le `tool_result` est le levier FinOps n°1 sur les agents.",
    examTrap:
      'Renvoyer à Claude les 150 colonnes d’une table SQL ou l’arbre DOM complet alors que seuls 3 champs (`id`, `status`, `error_message`) sont nécessaires.',
    prodValidation:
      'Budget maximal de tokens par `tool_result` (ex: max 1 500 tokens) imposé par le middleware d’orchestration.',
    keyTakeaway:
      'Chaque token superflu injecté dans un `tool_result` au tour K est payé à nouveau sur tous les tours K+1 à N.',
    docRef: 'Anthropic Agentic FinOps: Quadratic Context Growth Mitigation (CCA-E400 §3.6)',
    articleId: 'tool-use',
  },
  {
    topic: 'Pool de Connexions & Keep-Alive HTTP/2 vers les Serveurs MCP et l’API Anthropic',
    aspect: "l'élimination de la latence de handshake TCP + TLS à chaque tour de boucle agentique",
    answerTitle: 'Réutilisation de sockets persistants (HTTP/2 Keep-Alive) avec pré-chauffage du pool de connexions',
    goldenRule:
      "Instancier le client SDK Anthropic et les clients MCP HTTP en singletons réutilisant un pool de connexions `keep-alive` : cela économise 80 à 180 ms de négociation TCP + TLS 1.3 sur chaque tour de la boucle.",
    examTrap:
      'Créer une nouvelle instance `new Anthropic()` et fermer le socket TCP à chaque requête dans une fonction serverless ou un worker mal configuré.',
    prodValidation:
      'Inspection des métriques réseau confirmant que `tcp_handshake_ms === 0` sur > 99% des appels consécutifs.',
    keyTakeaway:
      'Maintenir des connexions HTTP/2 persistantes (`keep-alive`) économise ~100 ms par étape sur une boucle agentique multi-tours.',
    docRef: 'Anthropic Production Tuning: Connection Pooling & HTTP/2 (CCA-E400 §3.7)',
    articleId: 'streaming-ttft',
  },
  {
    topic: 'Exécution Asynchrone d’Outils dans les Pipelines Message Batches',
    aspect: "la combinaison de la remise de 50% de la Batch API avec des workflows utilisant des appels d'outils",
    answerTitle: 'Architecture en vagues (Wave-Based Batch Execution) : Lot N (émission tool_use) -> Exécution locale -> Lot N+1 (tool_result)',
    goldenRule:
      "Lorsqu'un traitement massif hors-ligne nécessite du Tool Use, soumettre le Lot 1 à la Message Batches API, collecter toutes les réponses `stop_reason: 'tool_use'`, exécuter les outils en masse contre la base interne, puis soumettre le Lot 2 contenant les `tool_result`.",
    examTrap:
      'Croire que la Message Batches API ne supporte pas le paramètre `tools` ou qu’il est obligatoire de payer le tarif synchrone pour utiliser des outils.',
    prodValidation:
      'Orchestrateur de lots utilisant `custom_id: "job_4829_step_1"` pour réconcilier l’état de chaque conversation entre les vagues.',
    keyTakeaway:
      'La Message Batches API supporte intégralement `tools` grâce au pattern d’orchestration par vagues indexées sur `custom_id`.',
    docRef: 'Anthropic Docs: Tool Use with Message Batches API (CCA-E400 §3.8)',
    articleId: 'batch-api',
  },
  {
    topic: 'Politique de Retry Différenciée : Erreurs d’Infrastructure (5xx/429) vs Erreurs Sémantiques d’Outils',
    aspect: "la distinction entre une panne réseau transitoire et une erreur d'arguments générée par le modèle",
    answerTitle: 'Backoff exponentiel côté code pour 429/503 ; renvoi immédiat à Claude avec `is_error: true` pour 400/422',
    goldenRule:
      "Si un outil échoue à cause d'un timeout réseau ou d'un HTTP 503 externe, réessayer automatiquement côté code (sans consommer un tour LLM) ; si l'outil échoue à cause d'un paramètre invalide généré par Claude (400), ne PAS réessayer le même appel et renvoyer immédiatement l'erreur à Claude avec `is_error: true`.",
    examTrap:
      'Faire réessayer 3 fois avec backoff exponentiel une requête SQL contenant une faute de syntaxe générée par le modèle, gaspillant 15 secondes de latence avant de prévenir l’agent.',
    prodValidation:
      'Classification stricte des exceptions d’outils en `TransientInfraError` (retry local) vs `ModelInputValidationError` (retour `is_error: true` au LLM).',
    keyTakeaway:
      'Les erreurs transitoires (5xx/timeout) se gèrent par retry réseau ; les erreurs de paramètres (4xx) se corrigent en les renvoyant à Claude.',
    docRef: 'Anthropic Agentic Infrastructure: Dual-Layer Retry Architecture (CCA-E400 §3.9)',
    articleId: 'tool-use',
  },
  {
    topic: 'Déchargement des Calculs Déterministes hors du LLM (Compute Offloading)',
    aspect: "l'optimisation FinOps et précision en déléguant le tri, l'agrégation mathématique et le filtrage à des outils dédiés",
    answerTitle: 'Utiliser le LLM pour la traduction d’intention (NL -> Requête) et le moteur natif (SQL/Python) pour le calcul',
    goldenRule:
      "Ne jamais passer 5 000 lignes de transactions financières dans le prompt de Claude pour lui demander de calculer la moyenne et l'écart-type : exposer un outil SQL/Polars qui exécute l'agrégation en 2 ms sur CPU et ne retourne que le résumé statistique.",
    examTrap:
      'Utiliser des milliers de tokens GPU à $15/MTok pour trier un tableau ou additionner des colonnes numériques.',
    prodValidation:
      'Revue d’architecture garantissant que toute opération d’agrégation sur > 50 lignes est exécutée par un outil déterministe.',
    keyTakeaway:
      'Principe FinOps : le GPU LLM traduit l’intention et interprète le résultat ; le CPU exécute les calculs et agrégations.',
    docRef: 'Anthropic FinOps Best Practices: Compute Offloading via Tools (CCA-E400 §3.10)',
    articleId: 'tool-use',
  },
];

const DOMAIN_4_E400_SEEDS: InfraFinOpsSeedConcept[] = [
  {
    topic: 'Gouvernance Multi-Workspaces Anthropic & Plafonds de Dépenses (Spend Limits)',
    aspect: "le cloisonnement budgétaire et de quotas entre les départements et environnements (Dev, Staging, Prod)",
    answerTitle: 'Un Workspace isolé par environnement/BU avec Spend Limit mensuel et Rate Limits dédiés',
    goldenRule:
      "Dans la Console Anthropic Admin, créer des Workspaces distincts par ligne de produit et par environnement afin qu'un test de charge ou un bug en Staging ne puisse jamais épuiser le budget mensuel ni les quotas ITPM/OTPM de la Production.",
    examTrap:
      'Partager un seul Workspace et une seule clé API pour toute l’entreprise en essayant de reconstituer la facture en fin de mois à partir des logs applicatifs.',
    prodValidation:
      'Configuration d’alertes de seuils budgétaires à 50%, 80% et 95% sur chaque Workspace avec webhook vers Slack/PagerDuty.',
    keyTakeaway:
      'Les Workspaces Anthropic constituent l’unité native d’isolation des quotas, des clés API, du KV-Cache et des budgets FinOps.',
    docRef: 'Anthropic Admin Guide: Workspace Governance & Spend Controls (CCA-E400 §4.1)',
    articleId: 'enterprise-security',
  },
  {
    topic: 'Protection contre le Denial-of-Wallet (DoW) par Token Bucket Multi-Niveaux',
    aspect: "l'architecture de contrôle d'admission protégeant le budget cloud contre les abus utilisateurs ou boucles infinies",
    answerTitle: 'Limitation en 3 couches : par Utilisateur (quotidien), par Session (cumulé) et par Route API (concurrence)',
    goldenRule:
      "Implémenter dans la LLM Gateway un compteur Redis atomique (script Lua) décomptant les tokens pondérés par coût (`cost_units = input_tokens + 5 * output_tokens`) avec blocage automatique dès qu'un utilisateur dépasse son plafond journalier.",
    examTrap:
      'Limiter uniquement le nombre de requêtes HTTP par minute (ex: 10 req/min) sans limiter le volume de tokens, permettant à un attaquant d’envoyer 10 requêtes de 200k tokens par minute.',
    prodValidation:
      'Test de charge simulant un compte compromis envoyant des requêtes de 150k tokens et vérifiant le déclenchement du coupe-circuit sous 2 secondes.',
    keyTakeaway:
      'Un Rate Limiter LLM doit compter des « unités de coût en tokens » (pondérant l’Output à 5×), jamais de simples requêtes HTTP.',
    docRef: 'Anthropic Infrastructure Security: Cost-Weighted Token Bucket Rate Limiting (CCA-E400 §4.2)',
    articleId: 'rate-limiting',
  },
  {
    topic: 'Connectivité Réseau Privée : AWS PrivateLink & GCP Private Service Connect',
    aspect: "l'acheminement du trafic d'inférence haute sécurité sans traverser l'Internet public ni les NAT Gateways coûteuses",
    answerTitle: 'VPC Interface Endpoints (PrivateLink / PSC) réduisant à la fois la surface d’attaque et les coûts de transfert NAT',
    goldenRule:
      "Configurer des VPC Endpoints privés vers AWS Bedrock ou Vertex AI : outre le gain de sécurité (trafic 100% sur le backbone privé cloud), cela évite les frais de traitement par Go des AWS NAT Gateways sur les payloads multimodaux volumineux.",
    examTrap:
      'Faire transiter des centaines de Go de documents PDF et d’images Base64 chaque jour par une NAT Gateway publique facturée au Go traité.',
    prodValidation:
      'Vérification de la table de routage VPC et des politiques d’endpoint (`aws:SourceVpc`) garantissant un chemin réseau privé direct.',
    keyTakeaway:
      'AWS PrivateLink et GCP PSC combinent isolation réseau souveraine et suppression des frais de bande passante NAT Gateway.',
    docRef: 'Cloud Network FinOps & Security: Private Endpoints for Claude (CCA-E400 §4.3)',
    articleId: 'enterprise-security',
  },
  {
    topic: 'Continuité d’Activité (DRP) & Failover Multi-Cloud Conforme (Compliance-Aware Routing)',
    aspect: "le maintien des garanties ZDR, HIPAA et RGPD lors d'une bascule automatique sur incident fournisseur",
    answerTitle: 'Matrice de Failover qualifiée par niveau de conformité (Failover ZDR-vers-ZDR et UE-vers-UE uniquement)',
    goldenRule:
      "La passerelle de haute disponibilité doit taguer chaque requête avec ses exigences de conformité (`requires_zdr: true`, `region_lock: 'EU'`) et n'autoriser le failover que vers un endpoint secondaire offrant des garanties contractuelles et géographiques au moins équivalentes.",
    examTrap:
      'Configurer un failover aveugle qui bascule des données médicales européennes vers un endpoint US non couvert par le BAA/RGPD lors d’une dégradation de latence.',
    prodValidation:
      'Exercice GameDay trimestriel simulant la perte de la région primaire et auditant la conformité des endpoints de secours activés.',
    keyTakeaway:
      'La haute disponibilité ne doit jamais dégrader la conformité : un failover invalide juridiquement doit échouer en mode fermé (fail-closed).',
    docRef: 'Anthropic Enterprise Resilience: Compliance-Preserving Multi-Cloud Failover (CCA-E400 §4.4)',
    articleId: 'enterprise-security',
  },
  {
    topic: 'Facturation Analytique Interne (Chargeback / Showback FinOps)',
    aspect: "l'attribution précise au centime près des coûts d'inférence Claude aux équipes, clients et fonctionnalités",
    answerTitle: 'Enrichissement télémétrique de chaque appel par `tenant_id`, `feature_id`, `cost_center` et calcul du coût réel',
    goldenRule:
      "Calculer et enregistrer à la fin de chaque requête le coût exact selon la formule : `(input_tokens * P_in) + (cache_creation_input_tokens * P_cache_write) + (cache_read_input_tokens * P_cache_read) + (output_tokens * P_out)` ventilé par centre de coût.",
    examTrap:
      'Facturer tous les tokens d’input au tarif plein dans le tableau de bord interne sans tenir compte de la remise de 90% sur `cache_read_input_tokens`, faussant le ROI des équipes qui optimisent leur cache.',
    prodValidation:
      'Réconciliation mensuelle automatisée entre la somme des événements télémétriques internes et l’API Usage & Cost d’Anthropic (écart cible < 0.5%).',
    keyTakeaway:
      'Une comptabilité FinOps exacte distingue impérativement les 4 compteurs : `input`, `cache_creation`, `cache_read` et `output`.',
    docRef: 'Anthropic FinOps Framework: Granular Cost Attribution & Chargeback (CCA-E400 §4.5)',
    articleId: 'batch-api',
  },
  {
    topic: 'Gouvernance des Clés API & Rotation Zéro-Downtime',
    aspect: "l'automatisation du cycle de vie des secrets d'accès à l'API Anthropic et aux fournisseurs Cloud",
    answerTitle: 'Fédération d’identité sans clé statique (Workload Identity / IAM Roles) ou rotation double-clé automatisée',
    goldenRule:
      "Sur AWS Bedrock et GCP Vertex AI, privilégier l'authentification par rôles IAM éphémères (IRSA / Workload Identity) sans aucune clé statique ; pour l'API directe Anthropic, orchestrer une rotation automatisée à double clé (création clé N+1 -> déploiement -> révocation clé N).",
    examTrap:
      'Révoquer la clé API active avant que l’ensemble des pods de production n’aient rechargé le nouveau secret depuis le gestionnaire de secrets.',
    prodValidation:
      'Pipeline de rotation mensuelle automatisée validé sans aucune erreur HTTP 401 pendant la fenêtre de transition.',
    keyTakeaway:
      'Éliminer les clés statiques via IAM Workload Identity quand c’est possible, ou appliquer le pattern de chevauchement (dual-key overlap) lors des rotations.',
    docRef: 'Anthropic Security Operations: Zero-Downtime Credential Rotation (CCA-E400 §4.6)',
    articleId: 'enterprise-security',
  },
  {
    topic: 'Audit des Dérives de Coût (Cost Anomaly Detection)',
    aspect: "la détection temps réel d'une régression de code provoquant une explosion soudaine de la consommation de tokens",
    answerTitle: 'Détection d’anomalies statistiques (Z-Score / EWMA) sur le coût moyen par requête et le Cache Hit Ratio',
    goldenRule:
      "Surveiller en continu deux indicateurs avancés : (1) le nombre moyen de tokens par transaction métier et (2) le taux de Cache Hit par déploiement Git (`git_commit_sha`) afin de détecter en moins de 5 minutes un commit ayant accidentellement cassé le Prompt Caching.",
    examTrap:
      'Découvrir sur la facture de fin de mois qu’une mise en production 3 semaines plus tôt avait inséré un ID aléatoire en tête du System Prompt, multipliant les coûts par 8.',
    prodValidation:
      'Alerte temps réel déclenchée si le Cache Hit Ratio chute de plus de 15 points après un nouveau déploiement.',
    keyTakeaway:
      'Corréler le Cache Hit Ratio et le coût par requête au `commit_sha` permet un rollback immédiat en cas de régression FinOps.',
    docRef: 'Anthropic FinOps Operations: Real-Time Cost Anomaly Detection (CCA-E400 §4.7)',
    articleId: 'prompt-caching',
  },
  {
    topic: 'Gestion de la File d’Attente Prioritaire (QoS & Priority Shedding)',
    aspect: "la protection des flux critiques face aux traitements de fond lors d'une saturation des quotas ITPM/OTPM",
    answerTitle: 'Classification du trafic en paliers de QoS (P0 Temps Réel Client, P1 Interne, P2 Background) avec délestage adaptatif',
    goldenRule:
      "Lorsque l'en-tête `anthropic-ratelimit-tokens-remaining` passe sous 15% de la capacité minute, la LLM Gateway doit mettre en pause ou router vers la Batch API les requêtes P2/P1 afin de réserver 100% du quota temps réel aux utilisateurs finaux P0.",
    examTrap:
      'Traiter en FIFO sans priorité des jobs d’indexation massive au même niveau que le checkout client interactif.',
    prodValidation:
      'Test de saturation vérifiant que les requêtes P0 maintiennent un taux de succès de 99.9% même sous déluge de requêtes P2.',
    keyTakeaway:
      'Le délestage de charge par priorité (Load Shedding QoS) garantit le SLA des flux critiques lorsque le quota ITPM approche de la saturation.',
    docRef: 'Anthropic Principal Infrastructure: QoS Traffic Shaping & Load Shedding (CCA-E400 §4.8)',
    articleId: 'rate-limiting',
  },
  {
    topic: 'Politiques de Rétention des Logs de Télémétrie & Minimisation RGPD',
    aspect: "l'équilibre entre l'observabilité FinOps/Performance à long terme et l'interdiction de stocker des PII inutilement",
    answerTitle: 'Séparation entre métriques numériques d’usage (conservation longue 13 mois) et payloads textuels (ZDR ou TTL court anonymisé)',
    goldenRule:
      "Stocker les métadonnées FinOps et techniques (`request_id`, `model`, `input_tokens`, `output_tokens`, `cache_read_tokens`, `ttft_ms`, `cost_usd`) dans l'entrepôt analytique long terme sans y copier le contenu textuel des prompts clients.",
    examTrap:
      'Enregistrer l’intégralité des prompts et réponses en clair dans Elasticsearch/Datadog pendant 1 an simplement pour calculer des tableaux de bord de coûts.',
    prodValidation:
      'Schéma de table FinOps ne contenant strictement aucune colonne de texte libre ou de données personnelles.',
    keyTakeaway:
      'Pour le pilotage FinOps et SLA, seules les métadonnées numériques d’usage et les identifiants de corrélation sont nécessaires.',
    docRef: 'Anthropic Privacy-Preserving Observability Architecture (CCA-E400 §4.9)',
    articleId: 'enterprise-security',
  },
  {
    topic: 'Contrats de Niveau de Service (SLA) & Architecture Dégradée Gracieuse',
    aspect: "la continuité fonctionnelle de l'application métier même en cas d'indisponibilité totale des LLMs",
    answerTitle: 'Circuit Breaker avec bascule vers modèle léger, cache de réponses fréquentes ou workflow déterministe de secours',
    goldenRule:
      "Concevoir chaque parcours critique avec un mode dégradé explicite : si l'ensemble des endpoints LLM dépasse le budget d'erreur SLA, basculer sur des réponses pré-calculées en cache sémantique ou sur une interface de saisie structurée classique.",
    examTrap:
      'Bloquer l’intégralité du tunnel d’achat ou du dossier patient d’un hôpital parce qu’un module non essentiel de synthèse IA est temporairement injoignable.',
    prodValidation:
      'Test de résilience coupant l’accès à tous les endpoints LLM et vérifiant que les fonctions vitales de l’application restent opérationnelles.',
    keyTakeaway:
      'Une architecture Principal LLM prévoit toujours un mode de repli déterministe pour ne jamais transformer une panne IA en arrêt métier total.',
    docRef: 'Anthropic Production Architecture: Graceful Degradation & Circuit Breaking (CCA-E400 §4.10)',
    articleId: 'model-routing',
  },
];

const DOMAIN_5_E400_SEEDS: InfraFinOpsSeedConcept[] = [
  {
    topic: 'Message Batches API : Architecture Haute Capacité & Réduction de 50%',
    aspect: "le dimensionnement et l'orchestration des lots asynchrones jusqu'à 100 000 requêtes ou 256 Mo par lot",
    answerTitle: 'Traitement asynchrone sous 24h (souvent < 1h) avec 50% de remise sur l’Input ET sur l’Output sans impacter les quotas temps réel',
    goldenRule:
      "Utiliser l'API Message Batches (`/v1/messages/batches`) pour toute charge tolérant une latence asynchrone : chaque lot accepte jusqu'à 100 000 requêtes (ou 256 Mo), applique 50% de réduction sur tous les tokens et utilise un pool de capacité séparé qui ne consomme pas vos quotas ITPM/OTPM de production.",
    examTrap:
      'Identifier les résultats d’un lot par l’ordre du tableau retourné : l’ordre des résultats dans le fichier `.jsonl` de sortie n’est PAS garanti, il est obligatoire d’utiliser le champ `custom_id` pour la réconciliation.',
    prodValidation:
      'Vérification de l’unicité stricte de `custom_id` au sein de chaque lot avant soumission et consommation en streaming des résultats JSONL.',
    keyTakeaway:
      'Limites Message Batches à retenir : -50% coût (Input + Output), max 100 000 requêtes ou 256 Mo par lot, SLA < 24h, réconciliation par `custom_id`.',
    docRef: 'Anthropic Docs: Message Batches API Limits & Specification (CCA-E400 §5.1)',
    articleId: 'batch-api',
  },
  {
    topic: 'Cumul FinOps : Message Batches API (-50%) + Prompt Caching (-90%)',
    aspect: "l'optimisation maximale des coûts sur les grands jobs de traitement documentaire ou d'évaluation",
    answerTitle: 'Ordonnancement par préfixe identique dans les lots et cumul des remises Cache + Batch',
    goldenRule:
      "Bien que l'exécution Batch soit asynchrone et distribuée, inclure des marqueurs `cache_control: { type: 'ephemeral' }` sur les préfixes communs au sein d'un lot permet de bénéficier de hits de cache opportunistes cumulés avec la remise Batch de 50%.",
    examTrap:
      'Mélanger aléatoirement des requêtes issues de 500 préfixes différents dans plusieurs petits lots au lieu de regrouper les requêtes partageant le même System Prompt/document dans un même lot.',
    prodValidation:
      'Tri des requêtes du fichier batch par `prefix_hash` avant l’appel `client.messages.batches.create()`.',
    keyTakeaway:
      'Trier les entrées d’un Message Batch par préfixe partagé maximise le taux de hit KV-Cache pendant le traitement asynchrone.',
    docRef: 'Anthropic FinOps Guide: Combining Prompt Caching with Message Batches (CCA-E400 §5.2)',
    articleId: 'batch-api',
  },
  {
    topic: 'Architecture de Routage en Cascade (Haiku 3.5 -> Sonnet 3.5 -> Opus)',
    aspect: "la réduction drastique du TCO et de la latence médiane sans perte de qualité sur les cas complexes",
    answerTitle: 'Aiguillage par classifieur d’intention ou par score de confiance vers le modèle minimal compétent',
    goldenRule:
      "Comme Claude 3.5 Haiku est ~3.75× moins cher et nettement plus rapide en génération que Sonnet 3.5, router les 65-75% de requêtes structurées, FAQ, triage et extraction simple vers Haiku, et réserver Sonnet 3.5 à l'ingénierie logicielle, l'orchestration d'agents et l'analyse nuancée.",
    examTrap:
      'Utiliser un appel LLM lourd et lent de 2 secondes uniquement pour décider quel modèle appeler ensuite, annulant tout le bénéfice de latence du routeur.',
    prodValidation:
      'Matrice d’évaluation hors-ligne comparant le score de qualité de Haiku 3.5 vs Sonnet 3.5 par catégorie de tâche pour calibrer les règles de routage.',
    keyTakeaway:
      'Déléguer 70% du volume courant à Haiku 3.5 et 30% des cas complexes à Sonnet 3.5 réduit la facture LLM globale de plus de 50%.',
    docRef: 'Anthropic Reference Architecture: Model Cascade & Tiered Routing (CCA-E400 §5.3)',
    articleId: 'model-routing',
  },
  {
    topic: 'Anatomie de la Latence LLM : Prefill (TTFT) vs Decode (ITL / TPOT)',
    aspect: "la distinction physique entre le temps de traitement du prompt d'entrée et la vitesse de génération token par token",
    answerTitle: 'TTFT (Compute-bound, proportionnel à l’Input non caché) vs ITL (Memory-bandwidth-bound, proportionnel à l’Output)',
    goldenRule:
      "La latence totale vaut `Total_Latency = TTFT + (Output_Tokens × ITL)` : (1) pour réduire le **TTFT** (Time To First Token), utiliser le **Prompt Caching** et réduire l'input ; (2) pour réduire la durée de génération (**Decode**), réduire le nombre d'**Output Tokens** ou passer sur un modèle plus léger (Haiku).",
    examTrap:
      'Espérer que le Prompt Caching accélère la vitesse d’émission des 2 000 tokens de sortie (ITL) après le premier token : le Prompt Caching n’accélère que la phase de Prefill (TTFT).',
    prodValidation:
      'Instrumentation séparée de `ttft_ms` (réception de `message_start`/`content_block_delta` #1) et de `tokens_per_second` (débit de décodage).',
    keyTakeaway:
      'Le Prompt Caching réduit le TTFT jusqu’à 80%, tandis que la concision de la réponse et le choix du modèle gouvernent la durée de décodage.',
    docRef: 'Anthropic Latency Optimization Whitepaper: Prefill vs Decode Physics (CCA-E400 §5.4)',
    articleId: 'streaming-ttft',
  },
  {
    topic: 'Protocole de Streaming SSE d’Anthropic : Cycle de Vie Complet des Événements',
    aspect: "l'ordre exact et le rôle des événements Server-Sent Events émis lors d'un appel `stream: true`",
    answerTitle: 'message_start -> content_block_start -> content_block_delta (text/input_json/thinking) -> content_block_stop -> message_delta -> message_stop',
    goldenRule:
      "Dans un flux SSE Anthropic : `message_start` fournit les compteurs d'input (`input_tokens`, `cache_read_input_tokens`) ; les `content_block_delta` diffusent les fragments ; et `message_delta` final fournit le `stop_reason` ainsi que le décompte final des `output_tokens`.",
    examTrap:
      'Fermer prématurément le parseur SSE avant l’événement `message_delta`, ce qui fait perdre à l’application le `stop_reason` final et le compteur exact `usage.output_tokens` pour la facturation.',
    prodValidation:
      'Test unitaire du parseur SSE vérifiant la capture des événements `ping` (keep-alive), `error` en cours de flux et `message_delta`.',
    keyTakeaway:
      'Les tokens d’input sont annoncés dans `message_start` et les tokens d’output finaux + `stop_reason` dans `message_delta`.',
    docRef: 'Anthropic API Reference: Streaming Messages SSE Event Specification (CCA-E400 §5.5)',
    articleId: 'streaming-ttft',
  },
  {
    topic: 'Architecture des Quotas Anthropic : RPM vs ITPM vs OTPM',
    aspect: "l'interaction des trois dimensions de limitation de débit et l'exclusion des tokens lus en cache sur certains paliers",
    answerTitle: 'Trois compteurs indépendants évalués simultanément : Requêtes/min (RPM), Input Tokens/min (ITPM) et Output Tokens/min (OTPM)',
    goldenRule:
      "Surveiller les trois ratios en temps réel : une architecture peut être bloquée en 429 par le plafond OTPM même si elle n'utilise que 10% de son quota RPM et ITPM. De plus, l'utilisation du Prompt Caching augmente considérablement le débit effectif de contexte traitable par minute.",
    examTrap:
      'Ne surveiller que le nombre de requêtes par minute (RPM) dans l’API Gateway alors que les requêtes de 100k tokens saturent l’ITPM dès la 4e requête.',
    prodValidation:
      'Export Prometheus des jauges `ratelimit_requests_remaining`, `ratelimit_input_tokens_remaining` et `ratelimit_output_tokens_remaining`.',
    keyTakeaway:
      'L’épuisement d’un seul des 3 quotas (RPM, ITPM ou OTPM) suffit à déclencher une erreur HTTP 429.',
    docRef: 'Anthropic API Rate Limits & Usage Tiers Specification (CCA-E400 §5.6)',
    articleId: 'rate-limiting',
  },
  {
    topic: 'Algorithme de Backoff Exponentiel avec Full Jitter & Lecture de retry-after',
    aspect: "la gestion optimale des erreurs HTTP 429 (rate_limit_error) et 529 (overloaded_error) en haute concurrence",
    answerTitle: 'Priorité absolue à l’en-tête HTTP `retry-after`, sinon Backoff Exponentiel avec Full Jitter aléatoire',
    goldenRule:
      "Lorsqu'une erreur 429 ou 529 survient : (1) si l'en-tête `retry-after` est présent, attendre exactement ce nombre de secondes (+ un léger jitter de 50-200ms) ; (2) sinon, calculer `sleep = random(0, min(max_delay, base * 2^attempt))` pour désynchroniser les workers.",
    examTrap:
      'Utiliser un délai fixe synchrone (ex: `sleep(5000)` exact sur les 100 workers), ce qui crée un effet de troupeau (Thundering Herd) qui refrappe l’API simultanément toutes les 5 secondes.',
    prodValidation:
      'Simulation d’une réponse 429 avec `retry-after: 12` vérifiant que le client suspend ses tentatives pendant 12 secondes avant reprise.',
    keyTakeaway:
      'Respecter `retry-after` en priorité et appliquer un Full Jitter aléatoire élimine les tempêtes de retries (Thundering Herd).',
    docRef: 'Anthropic SDK & Reliability Engineering: Retry-After & Jitter (CCA-E400 §5.7)',
    articleId: 'rate-limiting',
  },
  {
    topic: 'Configuration des Proxies Inverses (NGINX / Envoy / CloudFront) pour le Streaming SSE',
    aspect: "l'élimination de la mise en mémoire tampon (proxy buffering) qui détruit le gain de TTFT côté navigateur",
    answerTitle: 'Désactivation du buffering (`X-Accel-Buffering: no`, `proxy_buffering off`) et adaptation des timeouts de lecture',
    goldenRule:
      "Pour que les événements SSE parviennent instantanément au client dès le premier token, configurer `Cache-Control: no-cache, no-transform`, `X-Accel-Buffering: no` et désactiver la compression/buffering par bloc sur les reverse proxies intermédiaires.",
    examTrap:
      'Déployer le streaming SSE côté code Node.js/Python derrière un ingress NGINX par défaut qui accumule les chunks en mémoire tampon jusqu’à la fin de la réponse (transformant le SSE en appel bloquant).',
    prodValidation:
      'Mesure du TTFT côté client navigateur (`performance.now()`) comparée au TTFT côté serveur backend (écart réseau attendu < 50 ms).',
    keyTakeaway:
      'Un reverse proxy avec `proxy_buffering on` annule totalement l’effet du streaming SSE pour l’utilisateur final.',
    docRef: 'Anthropic Production Deployment: SSE Proxy & Ingress Configuration (CCA-E400 §5.8)',
    articleId: 'streaming-ttft',
  },
  {
    topic: 'Cache Sémantique & Cache Exact de Réponses Completes (L1 Response Cache)',
    aspect: "le court-circuitage complet de l'appel API LLM pour les requêtes récurrentes identiques ou quasi-identiques",
    answerTitle: 'Cache exact (SHA-256 de la requête normalisée) en amont du Prompt Caching KV',
    goldenRule:
      "Distinguons deux niveaux complémentaires : (1) le **Response Cache L1** (dans votre Redis) retourne instantanément (0 token facturé, 5 ms) la réponse finale si la question et le contexte sont 100% identiques ; (2) le **Prompt Caching Anthropic** accélère et réduit de 90% l'input lorsque la question varie sur un même contexte.",
    examTrap:
      'Utiliser un cache sémantique vectoriel trop permissif (seuil de similarité cosinus < 0.90) sur des questions financières ou médicales où un seul chiffre ou une négation change complètement la réponse.',
    prodValidation:
      'Activation du Response Cache exact (à température 0) pour les requêtes déterministes de classification et d’autocomplete.',
    keyTakeaway:
      'Response Cache L1 (Redis) = 100% d’économie sur requêtes identiques ; Prompt Caching KV = 90% d’économie d’input sur questions variées partageant le même contexte.',
    docRef: 'Anthropic FinOps Architecture: Multi-Layer Caching Strategy (CCA-E400 §5.9)',
    articleId: 'prompt-caching',
  },
  {
    topic: 'Gouvernance FinOps Continue : Métrique d’Unit Economics (Coût par Résolution Métier)',
    aspect: "le pilotage exécutif de la rentabilité d'une plateforme IA au-delà du simple prix par million de tokens",
    answerTitle: 'Optimiser le Cost-per-Successful-Outcome (Coût total incluant retries et tours d’outils par tâche réussie)',
    goldenRule:
      "Évaluer chaque architecture selon la métrique `Coût Total par Tâche Résolue avec Succès` : un modèle 2× moins cher au token qui nécessite 4× plus de tours d'erreur/retry et échoue 20% du temps possède en réalité un TCO métier supérieur.",
    examTrap:
      'Dégrader un agent complexe vers un modèle sous-dimensionné sur la seule base du prix par token, provoquant des boucles d’erreurs d’outils qui doublent la consommation totale de tokens.',
    prodValidation:
      'Tableau de bord FinOps corrélant le coût complet de la session (`total_session_cost_usd`) au statut de résolution validé (`task_resolved: true`).',
    keyTakeaway:
      'La vraie métrique FinOps Principal n’est pas le coût par token, mais le coût total par tâche métier résolue du premier coup.',
    docRef: 'Anthropic Executive FinOps Guide: Unit Economics & Outcome Efficiency (CCA-E400 §5.10)',
    articleId: 'model-routing',
  },
];

const INFRA_SCENARIO_VARIATIONS = [
  {
    angle: 'Architecture & Dimensionnement Capacitaire',
    questionPrefix: 'En tant que Principal LLM Architect (CCA-E400), quelle règle de dimensionnement et d’architecture s’applique à',
    focusLabel: 'Standard d’architecture Principal & FinOps',
  },
  {
    angle: 'Équation FinOps & Optimisation TCO',
    questionPrefix: 'Lors d’un audit FinOps visant à réduire le coût total de possession (TCO) à grande échelle, comment optimiser',
    focusLabel: 'Levier d’optimisation économique directe',
  },
  {
    angle: 'Ingénierie de Latence P95 / P99',
    questionPrefix: 'Pour garantir un SLA de latence P99 strict sous forte charge en production, quelle pratique régit',
    focusLabel: 'Ingénierie de performance et réduction de latence',
  },
  {
    angle: 'Haute Disponibilité & Résilience Multi-Cloud',
    questionPrefix: 'Dans une topologie multi-cloud (Anthropic API, AWS Bedrock, GCP Vertex AI), comment sécuriser la résilience de',
    focusLabel: 'Architecture de haute disponibilité et failover',
  },
  {
    angle: 'Diagnostic d’Anti-Pattern & Dérive de Coûts',
    questionPrefix: 'Quel anti-pattern d’infrastructure critique provoque une explosion de facture ou d’erreurs 429 concernant',
    focusLabel: 'Prévention des dérives budgétaires et goulets d’étranglement',
  },
  {
    angle: 'Implémentation LLM Gateway & Middleware',
    questionPrefix: 'Au niveau de la passerelle LLM d’entreprise (API Gateway / Envoy / Proxy), comment implémenter le contrôle de',
    focusLabel: 'Spécification technique de la LLM Gateway',
  },
  {
    angle: 'Observabilité OpenTelemetry & Métriques',
    questionPrefix: 'Quels indicateurs télémétriques et compteurs d’usage faut-il instrumenter en continu pour piloter',
    focusLabel: 'Télémétrie FinOps et observabilité de production',
  },
  {
    angle: 'Passage à l’Échelle & Haute Concurrence',
    questionPrefix: 'Lors d’un pic de trafic massif (milliers de requêtes simultanées), quel mécanisme garantit la stabilité de',
    focusLabel: 'Contrôle de concurrence et gestion des quotas',
  },
  {
    angle: 'Arbitrage Technique & Compromis Coût/Qualité',
    questionPrefix: 'Comment un architecte certifié CCA-E400 arbitre-t-il le compromis entre coût, débit et fidélité concernant',
    focusLabel: 'Matrice de décision architecturale',
  },
  {
    angle: 'Validation CI/CD & Gouvernance de Production',
    questionPrefix: 'Quel contrôle automatisé de pré-production et de gouvernance permet de certifier l’efficience de',
    focusLabel: 'Garde-fou d’industrialisation et conformité SLA',
  },
];

function buildDomainFlashcardsE400(
  domainId: number,
  domainCode: string,
  domainTitle: string,
  startCardId: number,
  seeds: InfraFinOpsSeedConcept[]
): Flashcard[] {
  const cards: Flashcard[] = [];
  const difficulties: Array<'Fondamental' | 'Intermédiaire' | 'Avancé'> = [
    'Fondamental',
    'Intermédiaire',
    'Avancé',
  ];

  for (let i = 0; i < 100; i++) {
    const seed = seeds[i % seeds.length];
    const variation =
      INFRA_SCENARIO_VARIATIONS[Math.floor(i / seeds.length) % INFRA_SCENARIO_VARIATIONS.length];
    const cardNumberInDomain = i + 1;
    const cardId = startCardId + i;
    const difficulty = difficulties[(i + domainId) % difficulties.length];

    cards.push({
      id: cardId,
      certificationId: 'cca-e400',
      domainId,
      domainCode,
      domainTitle,
      topic: `${seed.topic} — ${variation.angle} (#${cardNumberInDomain})`,
      question: `[CCA-E400 • ${domainCode}] ${variation.questionPrefix} ${seed.aspect} (Scénario Infra/FinOps #${cardNumberInDomain}) ?`,
      answerTitle: `${seed.answerTitle}`,
      answerBullets: [
        `${variation.focusLabel} : ${seed.goldenRule}`,
        `Piège d'examen CCA-E400 à éviter : ${seed.examTrap}`,
        `Validation & Télémétrie en production : ${seed.prodValidation}`,
      ],
      keyTakeaway: seed.keyTakeaway,
      docRef: `${seed.docRef} — Cas #${cardNumberInDomain}`,
      difficulty,
      relatedArticleId: seed.articleId,
    });
  }

  return cards;
}

export const CCA_E400_DOMAIN_1_FLASHCARDS: Flashcard[] = buildDomainFlashcardsE400(
  1,
  'DOMAINE 01',
  'Ingénierie KV-Cache Distribuée & Topologie Multi-Cloud',
  3001,
  DOMAIN_1_E400_SEEDS
);

export const CCA_E400_DOMAIN_2_FLASHCARDS: Flashcard[] = buildDomainFlashcardsE400(
  2,
  'DOMAINE 02',
  'Tokenomics des Prompts, Compression & Débit d’Émission',
  3101,
  DOMAIN_2_E400_SEEDS
);

export const CCA_E400_DOMAIN_3_FLASHCARDS: Flashcard[] = buildDomainFlashcardsE400(
  3,
  'DOMAINE 03',
  'Infrastructure MCP Haute Disponibilité & Cache d’Outils',
  3201,
  DOMAIN_3_E400_SEEDS
);

export const CCA_E400_DOMAIN_4_FLASHCARDS: Flashcard[] = buildDomainFlashcardsE400(
  4,
  'DOMAINE 04',
  'Gouvernance FinOps, Quotas Multi-Tenants & Résilience DRP',
  3301,
  DOMAIN_4_E400_SEEDS
);

export const CCA_E400_DOMAIN_5_FLASHCARDS: Flashcard[] = buildDomainFlashcardsE400(
  5,
  'DOMAINE 05',
  'Message Batches (-50%), Cascade Routing & Ingénierie SLA',
  3401,
  DOMAIN_5_E400_SEEDS
);

export const CCA_E400_FLASHCARDS: Flashcard[] = [
  ...CCA_E400_DOMAIN_1_FLASHCARDS, // 3001 - 3100 (100 cartes)
  ...CCA_E400_DOMAIN_2_FLASHCARDS, // 3101 - 3200 (100 cartes)
  ...CCA_E400_DOMAIN_3_FLASHCARDS, // 3201 - 3300 (100 cartes)
  ...CCA_E400_DOMAIN_4_FLASHCARDS, // 3301 - 3400 (100 cartes)
  ...CCA_E400_DOMAIN_5_FLASHCARDS, // 3401 - 3500 (100 cartes)
];
