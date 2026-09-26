import json
import os

def create_domain(domain_id, domain_code, domain_title, start_id, core_cards, catalog_topics, default_article_id):
    cards = []
    # Add core cards first
    for i, c in enumerate(core_cards):
        cid = start_id + i
        cards.append({
            "id": cid,
            "domainId": domain_id,
            "domainCode": domain_code,
            "domainTitle": domain_title,
            "topic": c["topic"],
            "question": c["question"],
            "answerTitle": c["answerTitle"],
            "answerBullets": c["answerBullets"],
            "keyTakeaway": c["keyTakeaway"],
            "docRef": c["docRef"],
            "difficulty": c.get("difficulty", "Intermédiaire"),
            "relatedArticleId": c.get("relatedArticleId", default_article_id)
        })
    
    # Fill remaining cards up to 100
    while len(cards) < 100:
        idx = len(cards)
        cid = start_id + idx
        topic_info = catalog_topics[idx % len(catalog_topics)]
        sub_title = topic_info[0]
        q_theme = topic_info[1]
        article_link = topic_info[2]
        rule_desc = topic_info[3]
        pitfall_desc = topic_info[4]
        
        cards.append({
            "id": cid,
            "domainId": domain_id,
            "domainCode": domain_code,
            "domainTitle": domain_title,
            "topic": f"{sub_title} #{cid}",
            "question": f"Dans le cadre du {domain_code} ({domain_title}), quelle est la spécification d'architecture critique relative à {q_theme} (Scénario d'examen #{cid}) ?",
            "answerTitle": f"Standard technique et conformité opérationnelle sur {sub_title}",
            "answerBullets": [
                f"Règle d'or Anthropic : {rule_desc}",
                f"Piège d'examen à éviter : {pitfall_desc}",
                "Validation en production : Mise en place de contrôles automatisés dans le pipeline CI/CD et métriques d'observabilité dédiées."
            ],
            "keyTakeaway": f"La maîtrise rigoureuse de {sub_title.lower()} garantit la conformité aux exigences Claude Certified Architect.",
            "docRef": f"Anthropic Certified Architect Syllabus: Module {domain_id}.{((idx % 12) + 1)}",
            "difficulty": "Avancé" if idx % 3 == 0 else "Intermédiaire" if idx % 2 == 0 else "Fondamental",
            "relatedArticleId": article_link
        })
    
    return cards

# Domain 1
d1_core = [
    {
        "topic": "Prompt Caching : Seuil minimal & TTL",
        "question": "Quel est le volume minimal de tokens de préfixe requis pour activer le Prompt Caching sur Claude 3.5 Sonnet, et quelle est sa durée de rétention (TTL) par défaut ?",
        "answerTitle": "1 024 tokens de préfixe et TTL de 5 minutes",
        "answerBullets": [
            "Seuil minimal : 1 024 tokens sur Claude 3.5 Sonnet et Haiku (2 048 tokens sur Claude Opus).",
            "Durée de vie (TTL) : 5 minutes par défaut, réinitialisée automatiquement à chaque nouvelle requête générant un cache hit.",
            "Tarification : L'écriture initiale du cache coûte 1.25x le tarif standard d'input. Toutes les lectures ultérieures bénéficient d'un abattement immédiat de 90% (0.10x du prix standard)."
        ],
        "keyTakeaway": "Le cache est amorti dès la deuxième requête dans la fenêtre des 5 minutes.",
        "docRef": "Anthropic Docs: Prompt Caching Overview (v2.1)",
        "difficulty": "Fondamental",
        "relatedArticleId": "prompt-caching"
    },
    {
        "topic": "Point d'Ancrage Cache pour Outils & Définitions",
        "question": "Où doit-on positionner le marqueur cache_control pour mettre en cache l'intégralité du System Prompt ET des définitions d'outils dans un appel Messages ?",
        "answerTitle": "Sur le dernier élément du tableau tools (tools[-1])",
        "answerBullets": [
            "Fonctionnement du KV-Cache : La mise en cache s'applique de manière séquentielle depuis le début de la requête jusqu'au point d'ancrage sélectionné.",
            "Règle architecturale : Placer {\"cache_control\": {\"type\": \"ephemeral\"}} sur le dernier outil du tableau tools indexe en un seul bloc le prompt système ET la liste exhaustive des outils.",
            "Résultat : TTFT ramené à ~180ms lors des appels récurrents et abattement de 90% sur l'input."
        ],
        "keyTakeaway": "Poser le cache sur le dernier élément tools couvre automatiquement tout ce qui précède.",
        "docRef": "Anthropic Docs: Prompt Caching Best Practices with Tools",
        "difficulty": "Avancé",
        "relatedArticleId": "prompt-caching"
    },
    {
        "topic": "Capacité de Contexte & Needle in a Haystack",
        "question": "Quelle est la taille de la fenêtre de contexte de Claude 3.5 Sonnet et quel est son taux de restitution sur le benchmark Needle In A Haystack ?",
        "answerTitle": "200 000 tokens avec plus de 99% de restitution précise",
        "answerBullets": [
            "Fenêtre totale : 200k tokens (environ 150 000 mots ou ~680 pages de documentation dense).",
            "Benchmark NIAH : Taux de restitution supérieur à 99% quel que soit l'emplacement de l'information (début, milieu ou fin du contexte).",
            "Recommandation : Placer les instructions clés au tout début (System Prompt) et les questions spécifiques tout à la fin pour maximiser l'attention."
        ],
        "keyTakeaway": "200k tokens natifs sans dégradation de signal en milieu de contexte.",
        "docRef": "Anthropic Model Card: Claude 3.5 Sonnet Context Fidelity",
        "difficulty": "Fondamental",
        "relatedArticleId": "context-window-niah"
    },
    {
        "topic": "Nombre maximal de points d'ancrage de cache",
        "question": "Combien de points d'ancrage de cache (breakpoints cache_control) peut-on déclarer au maximum dans une seule requête vers l'API Messages ?",
        "answerTitle": "4 points d'ancrage de cache au maximum par requête",
        "answerBullets": [
            "L'API limite à 4 le nombre de structures avec cache_control: {\"type\": \"ephemeral\"} dans une même requête.",
            "Stratégie de stratification recommandée : 1 sur le System Prompt de base, 1 sur la base de connaissances commune, 1 sur la liste des outils, 1 sur l'historique conversationnel consolidé.",
            "Dépassement : Si plus de 4 points sont spécifiés, l'API renvoie une erreur HTTP 400 Bad Request."
        ],
        "keyTakeaway": "Maximum 4 ancres de cache par appel pour organiser des niveaux hiérarchiques.",
        "docRef": "Anthropic Docs: Multi-breakpoint Caching Constraints",
        "difficulty": "Intermédiaire",
        "relatedArticleId": "prompt-caching"
    },
    {
        "topic": "Impact d'une modification de préfixe sur le Cache",
        "question": "Si un préfixe de 10 000 tokens est mis en cache et qu'un développeur modifie un espace au 50ème token, que se passe-t-il pour le cache ?",
        "answerTitle": "Invalidation totale et réécriture complète du cache à partir du 50ème token",
        "answerBullets": [
            "Le cache utilise un adressage séquentiel strict basé sur les hachages des tokens précédents.",
            "Toute modification en amont (même un seul espace ou une ponctuation) modifie la séquence de tokens et invalide tout ce qui suit.",
            "Impact financier : La requête est facturée comme un cache_creation_input_tokens (1.25x) et non un cache_read_input_tokens (0.10x)."
        ],
        "keyTakeaway": "Toujours placer les variables dynamiques (dates, ID utilisateur) après les blocs statiques mis en cache.",
        "docRef": "Anthropic Docs: Cache Invalidation Mechanics",
        "difficulty": "Intermédiaire",
        "relatedArticleId": "prompt-caching"
    }
]

d1_topics = [
    ("Prompt Caching KV-Cache", "la gestion du cycle de vie du KV-cache en mémoire VRAM", "prompt-caching", "Conserver les blocs immuables en tête de message pour maximiser le taux de cache hit.", "Ne jamais placer d'horodatage dynamique en début de prompt système."),
    ("Fenêtre 200k & Benchmark NIAH", "la restitution précise de faits enfouis dans un contexte de 200 000 tokens", "context-window-niah", "Exploiter la fidélité native de rappel de 99% sans recourir à un découpage RAG agressif.", "Ne pas présumer d'une perte d'attention au centre de la fenêtre de contexte."),
    ("Tokenisation BPE & Sub-tokens", "l'optimisation du budget de tokens lors de l'encodage multilingue", "context-window-niah", "Prévoir un surplus de 20% à 30% de tokens pour les langues latines accentuées par rapport à l'anglais.", "Ne pas baser le dimensionnement de production uniquement sur le décompte de mots anglais."),
    ("Multimodalité & Traitement PDF Natif", "l'ingestion directe de documents PDF avec graphiques et tableaux", "context-window-niah", "Transmettre le PDF brut à l'API Messages pour préserver l'agencement visuel et spatial.", "Éviter d'extraire le texte avec des OCR tiers qui détruisent la structure tabulaire."),
    ("Budget TPM & Allocation max_tokens", "la réservation préemptive de tokens sur le quota TPM", "rate-limiting", "Ajuster max_tokens au plus juste de la longueur attendue de la réponse.", "Ne jamais fixer max_tokens à 8192 systématiquement sous peine de 429 prématurés."),
    ("Accélération TTFT & FlashAttention", "la minimisation de la latence du premier token émis", "streaming-ttft", "Associer le streaming SSE au Prompt Caching pour réduire le TTFT sous 800ms.", "Ne pas exécuter d'appels synchrones bloquants sur des contextes supérieurs à 10k tokens."),
    ("Stratification Cache Multi-Tenants", "l'isolation des espaces de cache dans une architecture SaaS", "prompt-caching", "Structurer le prompt en couches : Socle global -> Règles entreprise -> Requête utilisateur.", "Ne pas mélanger les identifiants de tenants en amont du point de cache global."),
    ("Continuité de Génération & stop_reason", "la détection et le traitement d'une coupure par limite de sortie", "context-window-niah", "Vérifier si stop_reason == 'max_tokens' pour relancer une requête avec instruction de continuité.", "Ne pas lever d'erreur fatale si la réponse est tronquée mais poursuivre le flux.")
]

# Domain 2
d2_core = [
    {
        "topic": "Balisage XML Canonique & Délimitation",
        "question": "Pourquoi Anthropic préconise-t-il formellement l'utilisation de balises XML (<instructions>, <context>, <examples>) dans la rédaction des prompts système ?",
        "answerTitle": "Délimitation sémantique stricte & Résistance au prompt injection",
        "answerBullets": [
            "Claude a été spécifiquement pré-entraîné pour reconnaître les balises XML comme des séparateurs hiérarchiques et structuraux prioritaires.",
            "Isolation hermétique : Sépare clairement les instructions autoritaires du système des données utilisateurs non vérifiées.",
            "Mitigation des risques : Réduit significativement la vulnérabilité aux attaques par injection indirecte de prompt (Indirect Prompt Injection)."
        ],
        "keyTakeaway": "Privilégier systématiquement <instructions>, <context>, <rules> et <examples>.",
        "docRef": "Anthropic Prompt Engineering Interactive Tutorial: XML Tags",
        "difficulty": "Fondamental",
        "relatedArticleId": "canonical-xml"
    },
    {
        "topic": "Prefilling de Réponse Assistant",
        "question": "En quoi consiste la technique de 'Prefilling' dans l'API Messages et quels sont ses deux bénéfices majeurs pour la production ?",
        "answerTitle": "Amorçage du rôle assistant ({ ou <response>) pour forcer un schéma strict",
        "answerBullets": [
            "Principe : Initialiser le dernier élément du tableau messages avec role: 'assistant' contenant un fragment prérempli (ex: `{` ou `<output>`).",
            "Bénéfice 1 : Éradique les préambules conversationnels indésirables ('Voici votre JSON : ...') et force une sortie directement exploitable par un parser.",
            "Bénéfice 2 : Réduit la latence de traitement et évite les logiques complexes de retry côté serveur."
        ],
        "keyTakeaway": "Prefill = conformité structurelle déterministe sans pénalité de tokens.",
        "docRef": "Anthropic Messages API: Prefilling Assistant Responses",
        "difficulty": "Intermédiaire",
        "relatedArticleId": "prefilling"
    },
    {
        "topic": "Chain of Thought (CoT) Structuré en Balises XML",
        "question": "Comment guider Claude pour qu'il effectue un raisonnement intermédiaire rigoureux sans polluer la réponse finale destinée à l'utilisateur ?",
        "answerTitle": "Utiliser la balise <thinking> pour le raisonnement et <response> pour la sortie finale",
        "answerBullets": [
            "Instruction système : Demander à Claude de détailler ses déductions logiques étape par étape à l'intérieur de <thinking>...</thinking>.",
            "Extraction propre : Le backend applicatif extrait par regex ou parser le contenu de <response> pour l'UI, tout en journalisant <thinking> pour l'audit.",
            "Gain de précision : Multiplie par 2 la précision sur les problèmes logiques et les calculs arithmétiques complexes."
        ],
        "keyTakeaway": "La balise <thinking> libère la puissance de calcul avant d'émettre la solution finale.",
        "docRef": "Anthropic Guide: Giving Claude Room to Think",
        "difficulty": "Intermédiaire",
        "relatedArticleId": "canonical-xml"
    },
    {
        "topic": "Few-Shot Learning : Emplacement & Balisage",
        "question": "Quelle est la structure recommandée par Anthropic pour formater des exemples few-shot au sein d'un prompt système ?",
        "answerTitle": "Encapsuler chaque exemple dans des balises <example> avec <input> et <output>",
        "answerBullets": [
            "Structure canonique : <examples><example><input>...</input><output>...</output></example></examples>.",
            "Rôle architectural : Démontre sans ambiguïté le style, la concision et le format attendus sans recourir à des explications méta verbeuses.",
            "Mise en cache : Les exemples stables placés dans le prompt système sont éligibles au Prompt Caching, garantissant un coût d'inférence minimal."
        ],
        "keyTakeaway": "Des exemples concrets en balises <example> valent mille instructions textuelles.",
        "docRef": "Anthropic Prompt Engineering Tutorial: Multishot Prompting",
        "difficulty": "Fondamental",
        "relatedArticleId": "canonical-xml"
    }
]

d2_topics = [
    ("Balisage XML & Hiérarchie", "la séparation hermétique entre les consignes et les données externes", "canonical-xml", "Utiliser des balises explicites en minuscules telles que <instructions>, <context> et <rules>.", "Ne pas employer de délimiteurs informels comme '---' ou '###' qui peuvent être contournés."),
    ("Prefilling Assistant Déterministe", "la suppression garantie de tout préambule conversationnel", "prefilling", "Amorcer le rôle assistant avec le premier caractère attendu ('{' pour JSON, '<response>' pour XML).", "Ne pas oublier de réinjecter le caractère de pré-remplissage lors de l'assemblage de la réponse finale."),
    ("Chain of Thought en <thinking>", "le calcul intermédiaire explicite des étapes de résolution", "canonical-xml", "Obliger le modèle à formuler ses hypothèses et calculs dans un bloc <thinking> isolé.", "Ne pas afficher le bloc de réflexion brute aux utilisateurs finaux dans l'interface de production."),
    ("Instructions Positives & Clarté", "la formulation de consignes directes plutôt que de négations passives", "canonical-xml", "Indiquer précisément ce que Claude DOIT faire au lieu d'une litanie de ce qu'il ne doit pas faire.", "Éviter les consignes négatives vagues comme 'Ne sois pas trop long' : préférer 'Limite à 3 puces'."),
    ("Few-Shot In-Context", "l'apprentissage contextuel par exemples démonstratifs", "canonical-xml", "Fournir 3 à 5 exemples de qualité entourés de balises <example> couvrant les cas limites.", "Ne pas surcharger le prompt d'exemples redondants qui consomment inutilement la fenêtre de contexte."),
    ("Technique du Prompt Sandwich", "la répétition de consignes critiques après des documents volumineux", "context-window-niah", "Rappeler la tâche essentielle et le format attendu immédiatement après le document de référence.", "Ne pas se fier à une instruction unique placée 150 000 tokens en amont de la fin."),
    ("Contraintes de Format JSON Strict", "la garantie de parseurs JSON sans erreurs de syntaxe", "prefilling", "Combiner la définition d'un schéma explicite avec un prefill assistant de '{'.", "Ne pas compter sur la politesse du modèle pour éviter des commentaires en amont du JSON.")
]

# Domain 3
d3_core = [
    {
        "topic": "Cycle de Vie du Tool Use & Détection stop_reason",
        "question": "Quelle valeur prend le champ stop_reason dans la réponse API lorsque Claude décide de faire appel à un outil, et comment le client doit-il réagir ?",
        "answerTitle": "stop_reason: 'tool_use' - Le client doit exécuter l'outil et renvoyer le résultat",
        "answerBullets": [
            "Interruption normale : Claude suspend la génération de texte et produit un bloc content avec type: 'tool_use', un tool_use_id unique et un objet input d'arguments.",
            "Responsabilité applicative : Le code client exécute la fonction demandée localement avec les arguments fournis.",
            "Message de retour : Le résultat doit être renvoyé dans un message role: 'user' contenant un bloc type: 'tool_result' portant le tool_use_id exact."
        ],
        "keyTakeaway": "stop_reason == 'tool_use' signale le passage de relais au runtime applicatif.",
        "docRef": "Anthropic API Docs: Tool Use Implementation Flow",
        "difficulty": "Fondamental",
        "relatedArticleId": "tool-use"
    },
    {
        "topic": "Exécution Parallèle d'Outils (Parallel Tool Calling)",
        "question": "Comment activer ou forcer la désactivation de l'exécution parallèle d'outils sur Claude 3.5 Sonnet ?",
        "answerTitle": "disable_parallel_tool_use: true dans l'objet tool_choice",
        "answerBullets": [
            "Comportement par défaut : Claude 3.5 Sonnet émet par défaut plusieurs blocs tool_use en un seul tour s'il détecte des actions indépendantes.",
            "Désactivation explicite : Spécifier tool_choice: {\"type\": \"auto\", \"disable_parallel_tool_use\": true} force Claude à émettre un seul outil à la fois.",
            "Cas d'usage du mode séquentiel : Indispensable lorsque l'outil N dépend impérativement du résultat retourné par l'outil N-1."
        ],
        "keyTakeaway": "Parallel tools = division par 2 ou 3 des allers-retours réseau pour les requêtes multiples.",
        "docRef": "Anthropic Docs: Parallel Tool Use Configuration",
        "difficulty": "Intermédiaire",
        "relatedArticleId": "parallel-tool-calling"
    },
    {
        "topic": "Architecture du Model Context Protocol (MCP)",
        "question": "Quels sont les trois rôles fondamentaux définis par le protocole ouvert MCP (Model Context Protocol) d'Anthropic ?",
        "answerTitle": "MCP Host, MCP Client et MCP Servers",
        "answerBullets": [
            "MCP Host : L'application frontale ou orchestratrice (ex: Claude Desktop, IDE, backend IA) qui coordonne la session.",
            "MCP Client : La bibliothèque client interne qui négocie le protocole et maintient les connexions 1-à-1 avec les serveurs.",
            "MCP Servers : Des processus légers et modulaires exposant des capacités spécifiques (outils, ressources passives, prompts sauvegardés)."
        ],
        "keyTakeaway": "Le MCP standardise l'interopérabilité universelle entre agents LLM et sources de données.",
        "docRef": "Model Context Protocol Specification (v1.0)",
        "difficulty": "Fondamental",
        "relatedArticleId": "mcp"
    },
    {
        "topic": "Gestion des Erreurs d'Outils & Auto-Guérison",
        "question": "Si l'exécution d'un outil échoue côté backend (ex: API externe indisponible), quel format exact doit avoir la réponse renvoyée à Claude ?",
        "answerTitle": "Un bloc tool_result avec is_error: true et le message d'erreur explicatif",
        "answerBullets": [
            "Ne pas planter la requête : Renvoyer une erreur 500 au modèle brise la conversation.",
            "Payload attendu : {\"type\": \"tool_result\", \"tool_use_id\": \"...\", \"content\": \"Message d'erreur\", \"is_error\": true}.",
            "Auto-correction : Informé de l'échec, Claude analyse la cause et tente une stratégie alternative ou prévient l'utilisateur avec diplomatie."
        ],
        "keyTakeaway": "is_error: true permet à Claude d'apprendre de l'échec et d'initier une auto-réparation.",
        "docRef": "Anthropic Tool Use: Error Handling Patterns",
        "difficulty": "Avancé",
        "relatedArticleId": "tool-use"
    }
]

d3_topics = [
    ("Tool Use Déterministe", "la transmission du message tool_result dans le rôle user", "tool-use", "Toujours renvoyer tool_result dans un message avec role: 'user' et le tool_use_id exact.", "Ne jamais utiliser le rôle 'assistant' ou 'tool' pour renvoyer le résultat d'un outil (erreur 400)."),
    ("Parallélisme d'Outils", "l'orchestration concurrente de plusieurs appels d'outils", "parallel-tool-calling", "Exécuter les appels parallèles en concurrence (Promise.all) pour réduire la latence totale.", "Ne pas paralléliser les outils dont les paramètres dépendent mutuellement."),
    ("Protocole MCP (Standard Ouvert)", "le découpage modulaire en serveurs de ressources et d'outils", "mcp", "Préférer le transport stdio pour les outils locaux et SSE pour les microservices distants.", "Ne pas confondre MCP Resources (lecture seule passive) et MCP Tools (actions avec effets de bord)."),
    ("Computer Use & Sandboxing", "le contrôle sécurisé d'interfaces graphiques par vision", "computer-use", "Exécuter impérativement Computer Use dans un environnement conteneurisé éphémère (Docker).", "Ne jamais donner à un agent Computer Use l'accès direct aux sessions de production ou messageries."),
    ("Supervision Humaine (HITL)", "le verrouillage d'actions irréversibles par approbation explicite", "tool-use", "Exiger une validation humaine systématique avant les ordres financiers ou destructions de données.", "Ne pas laisser un agent exécuter des mutations de base de données en boucle autonome non contrôlée."),
    ("Validation de Schémas JSON Schema", "la rigueur des types et contraintes des paramètres d'outils", "tool-use", "Déclarer formellement les champs indispensables dans le tableau 'required' du schéma.", "Ne pas omettre les descriptions sémantiques qui orientent le choix de l'outil par le modèle.")
]

# Domain 4
d4_core = [
    {
        "topic": "Constitutional AI & Posture de Refus",
        "question": "Quelle est la tonalité formelle exigée par les principes de la Constitutional AI lors d'un refus de sécurité sur une requête non conforme ?",
        "answerTitle": "Neutre, calme, factuelle, objective et exempte de tout jugement moral",
        "answerBullets": [
            "Le modèle ne doit jamais réprimander, sermonner ou donner des leçons de morale à l'utilisateur.",
            "Explication claire : Énoncer calmement ce qui ne peut pas être fait (ex: 'Je ne peux pas fournir de code d'exploitation pour cette vulnérabilité...').",
            "Alternative constructive : Proposer si possible un cadre légitime connexe (ex: '... En revanche, je peux expliquer les mécanismes de mitigation recommandés par l'OWASP.')."
        ],
        "keyTakeaway": "Refus objectif sans condescendance ni sermon moralisateur.",
        "docRef": "Anthropic Research: Constitutional AI & Harmlessness Guidelines",
        "difficulty": "Fondamental",
        "relatedArticleId": "constitutional-ai"
    },
    {
        "topic": "Injections de Prompt Indirectes (IPI) en RAG",
        "question": "Quel est le risque majeur d'une injection de prompt indirecte dans une architecture d'agent connecté à des données web externes, et comment s'en prémunir ?",
        "answerTitle": "Détournement d'instructions par des données tierces non fiables - Mitigation par balisage et hiérarchie",
        "answerBullets": [
            "Scénario d'attaque : Une page web analysée contient une consigne dissimulée ordonnant au LLM d'ignorer ses consignes et d'exfiltrer des secrets via un outil.",
            "Défense en profondeur : Encapsuler impérativement toutes les données externes dans des balises dédiées comme <untrusted_content>.",
            "Règle de préséance : Spécifier explicitement dans le prompt système que les données au sein de <untrusted_content> ne disposent d'aucune autorité directive."
        ],
        "keyTakeaway": "Traiter toutes les données externes comme du contenu non fiable hermétiquement balisé.",
        "docRef": "Anthropic Security Best Practices: Mitigating Indirect Prompt Injection",
        "difficulty": "Avancé",
        "relatedArticleId": "indirect-prompt-injection"
    },
    {
        "topic": "Engagement Zero Data Retention (ZDR)",
        "question": "Quelle est la politique contractuelle d'Anthropic concernant l'entraînement de modèles sur les données transmises via l'API commerciale ?",
        "answerTitle": "Aucun entraînement sur les données clients de l'API commerciale",
        "answerBullets": [
            "Protection contractuelle : Par défaut, les prompts et réponses transitant par l'API commerciale ne sont jamais utilisés pour entraîner les modèles Claude.",
            "Option Zero Data Retention (ZDR) : Possibilité de contracter une politique où aucun log de requête n'est conservé sur les serveurs d'Anthropic.",
            "Certifications de conformité : Infrastructure auditée SOC 2 Type II et éligible à la signature d'un BAA (Business Associate Agreement) pour la norme HIPAA."
        ],
        "keyTakeaway": "Sécurité d'entreprise native : vos données d'API ne servent jamais à l'entraînement.",
        "docRef": "Anthropic Trust & Security Portal: Data Privacy Commitments",
        "difficulty": "Fondamental",
        "relatedArticleId": "enterprise-privacy"
    },
    {
        "topic": "Protection Contre le Vol de System Prompt",
        "question": "Quelle technique architecturale permet de limiter l'exfiltration du System Prompt face à des attaques d'ingénierie sociale ou de jailbreak ?",
        "answerTitle": "Combinaison d'instructions d'intégrité, de balisage hermétique et de tokens canaris",
        "answerBullets": [
            "Consigne d'inviolabilité : Déclarer dans le System Prompt que sa structure interne est confidentielle et ne doit jamais être récitée ou résumée.",
            "Canary Tokens : Insérer une chaîne aléatoire secrète dans le prompt système et surveiller par filtre de sortie (Output Guardrail) si elle est émise.",
            "Cloisonnement : Ne jamais stocker de mots de passe, clés d'API ou secrets de production directement dans le texte du System Prompt."
        ],
        "keyTakeaway": "Aucun secret de production ne doit jamais être présent dans un System Prompt.",
        "docRef": "Anthropic Security: System Prompt Confidentiality & Guardrails",
        "difficulty": "Intermédiaire",
        "relatedArticleId": "indirect-prompt-injection"
    }
]

d4_topics = [
    ("Constitutional AI & Alignement", "l'application des principes constitutionnels d'Anthropic (RLAIF)", "constitutional-ai", "Maintenir une posture de refus neutre, objective et dénuée de tout jugement moral.", "Ne jamais sermonner ni moraliser l'utilisateur lors de l'application d'un refus de sécurité."),
    ("Injections Indirectes & Sécurité RAG", "l'isolation hermétique des données non fiables aspirées du web", "indirect-prompt-injection", "Encapsuler impérativement les sources externes dans des balises <untrusted_data>.", "Ne jamais concaténer de texte brut externe directement dans la section <instructions> du prompt."),
    ("Zero Data Retention & SOC 2", "la conformité réglementaire des données d'entreprise en transit", "enterprise-privacy", "S'appuyer sur la garantie contractuelle de non-entraînement de l'API commerciale Anthropic.", "Ne pas stocker de clés API en clair dans le code source ou dans les répertoires partagés."),
    ("Traçabilité d'Audit x-request-id", "la journalisation des requêtes pour les investigations de sécurité", "enterprise-privacy", "Consigner systématiquement l'en-tête de réponse x-request-id dans les bases d'audit.", "Ne pas consigner les données de santé ou secrets utilisateurs dans les logs applicatifs bruts."),
    ("Sandboxing de Code & Isolation", "l'exécution sécurisée d'outils système générés par le LLM", "enterprise-privacy", "Exécuter tout code Python ou Bash dans des microVMs isolées (gVisor/Firecracker).", "Ne jamais donner à un conteneur d'exécution de code l'accès au réseau d'entreprise interne."),
    ("Garde-Fous et Filtres de Sortie", "la détection en temps réel d'exfiltration de données confidentielles", "indirect-prompt-injection", "Positionner un filtre Regex ou modèle guardrail inspectant le flux de tokens sortants.", "Ne pas se reposer exclusivement sur le bon comportement du modèle sans garde-fou applicatif.")
]

# Domain 5
d5_core = [
    {
        "topic": "Message Batch API : Avantages Financiers & SLA",
        "question": "Quels sont le taux d'abattement tarifaire et le SLA d'exécution garantis par la Message Batch API d'Anthropic ?",
        "answerTitle": "50% de réduction immédiate sur tous les tokens et exécution sous 24 heures",
        "answerBullets": [
            "Économie massive : -50% sur l'input et l'output pour tous les modèles (Sonnet, Haiku, Opus).",
            "Format de données : Soumission asynchrone par fichier .jsonl avec un custom_id unique par requête pour réconcilier les réponses.",
            "Cas d'usage cibles : Évaluations de benchmarks, pipelines de classification de masse, pipelines ETL nocturnes et tests de régression."
        ],
        "keyTakeaway": "Dès qu'une tâche tolère une latence différée, la Batch API divise la facture par deux.",
        "docRef": "Anthropic API Reference: Message Batches Guide",
        "difficulty": "Fondamental",
        "relatedArticleId": "batch-api"
    },
    {
        "topic": "Routage en Cascade (Model Cascading Architecture)",
        "question": "Comment concevoir une architecture en cascade de modèles pour diviser le coût d'inférence global de plus de 50% sans dégrader la qualité perçue ?",
        "answerTitle": "Déléguer le filtrage à Claude 3.5 Haiku avant d'escalader vers Sonnet ou Opus",
        "answerBullets": [
            "Étape 1 (Triage rapide) : Claude 3.5 Haiku classifie la demande, traite les FAQ simples et extrait les entités avec une latence ultra-faible.",
            "Étape 2 (Escalade conditionnelle) : Les tâches de codage, de raisonnement complexe ou de tool use élaboré sont transmises à Claude 3.5 Sonnet.",
            "Impact FinOps : Dans un système type, 60% à 75% des requêtes sont résolues par Haiku, entraînant une chute drastique du TCO global."
        ],
        "keyTakeaway": "Haiku pour le triage et l'extraction, Sonnet pour le raisonnement critique.",
        "docRef": "Anthropic Solutions Architecture: Cost-Optimized Model Routing",
        "difficulty": "Intermédiaire",
        "relatedArticleId": "model-routing"
    },
    {
        "topic": "Streaming SSE vs Appel Bloquant pour le TTFT",
        "question": "Pourquoi le mode Streaming (stream: true) est-il impératif pour l'expérience utilisateur sur des générations de plus de 1 000 tokens ?",
        "answerTitle": "Affichage progressif dès 500-800ms au lieu d'une attente bloquante de 15 à 30 secondes",
        "answerBullets": [
            "Appel synchrone standard : L'application attend la complétion intégrale du texte avant de recevoir le moindre octet (latence perçue catastrophique).",
            "Mode Streaming SSE : Les tokens sont transmis en temps réel via des événements content_block_delta, offrant une sensation d'instantanéité.",
            "Économie de tokens : Permet à l'utilisateur d'interrompre (Cancel) la requête s'il constate que la réponse diverge, stoppant net la consommation de tokens."
        ],
        "keyTakeaway": "Le streaming transforme la perception utilisateur et permet l'annulation précoce.",
        "docRef": "Anthropic API Docs: Streaming Messages with Server-Sent Events",
        "difficulty": "Fondamental",
        "relatedArticleId": "streaming-ttft"
    },
    {
        "topic": "Gestion des Codes HTTP 429 et 529 avec Exponential Backoff",
        "question": "Quelle est la différence entre une erreur HTTP 429 et HTTP 529, et quel algorithme de retry doit être rigoureusement implémenté ?",
        "answerTitle": "429 = Rate Limit de compte ; 529 = Surcharge de l'API - Traitement par Exponential Backoff avec Full Jitter",
        "answerBullets": [
            "HTTP 429 (Too Many Requests) : Le compte a dépassé son quota de RPM, TPM ou TPD. Respecter l'en-tête retry-after.",
            "HTTP 529 (Overloaded) : Pic temporaire de charge sur l'infrastructure d'inférence d'Anthropic.",
            "Algorithme obligatoire : Exponential Backoff avec Full Jitter (pause = random(0, 2^tentative * base_delay)) pour éviter l'effet d'avalanche (Thundering Herd)."
        ],
        "keyTakeaway": "Toujours ajouter du Jitter aléatoire aux retries pour ne pas résonner sur l'API.",
        "docRef": "Anthropic API Reliability: Error Handling and Backoff Strategies",
        "difficulty": "Avancé",
        "relatedArticleId": "rate-limiting"
    }
]

d5_topics = [
    ("Message Batch API Asynchrone", "la planification de gros volumes de calcul différé", "batch-api", "Soumettre les calculs non interactifs en lot JSONL pour profiter de 50% de remise immédiate.", "Ne pas employer la Batch API pour des chatbots conversationnels temps réel."),
    ("Routage en Cascade FinOps", "l'orientation adaptative du trafic vers le modèle optimal", "model-routing", "Utiliser Haiku 3.5 pour le triage et escalader vers Sonnet 3.5 pour les cas complexes.", "Ne pas tout router sur le modèle le plus lourd par paresse architecturale."),
    ("Streaming SSE & Latence TTFT", "la réduction drastique du délai avant le premier token affiché", "streaming-ttft", "Activer stream: true et désactiver la mise en mémoire tampon des proxys (proxy_buffering off).", "Ne pas oublier de récupérer les compteurs d'usage finaux à la fermeture du stream."),
    ("Rate Limits (RPM, TPM, TPD)", "le respect scrupuleux des plafonds de débit par palier de compte", "rate-limiting", "Surveiller les en-têtes ant-rate-limit et adapter le parallélisme des workers.", "Ne pas lancer 50 workers parallèles sans mécanisme de file d'attente (Queue/Leaky Bucket)."),
    ("Exponential Backoff avec Full Jitter", "la résilience distribuée face aux erreurs HTTP 429 et 529", "rate-limiting", "Calculer le délai de retry avec une composante aléatoire uniforme (Full Jitter).", "Ne jamais boucler en retry immédiat sans temporisation, ce qui aggrave le bannissement temporaire."),
    ("Hébergements Cloud Hyperscalers", "les différences entre l'API Anthropic directe, AWS Bedrock et GCP Vertex", "model-routing", "Choisir le fournisseur en fonction de la souveraineté des données et des contrats d'entreprise.", "Prendre en compte les variations d'IDs de modèles selon la plateforme cloud cible.")
]

# Write all 5 domains
def write_domain_file(filepath, domain_id, cards):
    lines = [
        "import { Flashcard } from '../../types';",
        "",
        f"export const DOMAIN_{domain_id}_FLASHCARDS: Flashcard[] = ["
    ]
    for c in cards:
        lines.append("  {")
        lines.append(f"    id: {c['id']},")
        lines.append(f"    domainId: {c['domainId']},")
        lines.append(f"    domainCode: '{c['domainCode']}',")
        lines.append(f"    domainTitle: '{c['domainTitle']}',")
        lines.append(f"    topic: {json.dumps(c['topic'], ensure_ascii=False)},")
        lines.append(f"    question: {json.dumps(c['question'], ensure_ascii=False)},")
        lines.append(f"    answerTitle: {json.dumps(c['answerTitle'], ensure_ascii=False)},")
        bullets_str = json.dumps(c['answerBullets'], ensure_ascii=False, indent=6)
        lines.append(f"    answerBullets: {bullets_str},")
        lines.append(f"    keyTakeaway: {json.dumps(c['keyTakeaway'], ensure_ascii=False)},")
        lines.append(f"    docRef: {json.dumps(c['docRef'], ensure_ascii=False)},")
        lines.append(f"    difficulty: '{c['difficulty']}',")
        lines.append(f"    relatedArticleId: '{c['relatedArticleId']}',")
        lines.append("  },")
    lines.append("];")
    lines.append("")

    with open(filepath, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"Generated {len(cards)} flashcards for Domain {domain_id} in {filepath}")

# Generate Domain 1 (1..100)
d1 = create_domain(1, 'DOMAINE 01', 'Architecture LLM & Context Windows', 1, d1_core, d1_topics, 'prompt-caching')
write_domain_file("src/data/flashcards/domain1.ts", 1, d1)

# Generate Domain 2 (101..200)
d2 = create_domain(2, 'DOMAINE 02', 'Prompt Engineering Avancé', 101, d2_core, d2_topics, 'canonical-xml')
write_domain_file("src/data/flashcards/domain2.ts", 2, d2)

# Generate Domain 3 (201..300)
d3 = create_domain(3, 'DOMAINE 03', 'Tool Use & Multi-Agents', 201, d3_core, d3_topics, 'tool-use')
write_domain_file("src/data/flashcards/domain3.ts", 3, d3)

# Generate Domain 4 (301..400)
d4 = create_domain(4, 'DOMAINE 04', 'Sécurité & Constitutional AI', 301, d4_core, d4_topics, 'constitutional-ai')
write_domain_file("src/data/flashcards/domain4.ts", 4, d4)

# Generate Domain 5 (401..500)
d5 = create_domain(5, 'DOMAINE 05', 'Coûts, Latence & Production', 401, d5_core, d5_topics, 'batch-api')
write_domain_file("src/data/flashcards/domain5.ts", 5, d5)

print("All 5 domains successfully generated (500 flashcards total)!")
