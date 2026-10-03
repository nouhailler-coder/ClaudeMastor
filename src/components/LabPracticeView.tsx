import React, { useState, useMemo } from 'react';
import { LAB_WORKSHOPS } from '../data/mockData';
import { updateResumeCheckpoint } from '../utils/resumeEngine';
import {
  Terminal,
  CheckCircle,
  Play,
  RotateCcw,
  Zap,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Check,
  AlertCircle,
  Code2,
  ShieldAlert,
  FileCode,
  Award,
  Wrench,
  HelpCircle,
} from 'lucide-react';

interface LabExerciseSpec {
  id: string;
  number: string;
  badge: string;
  title: string;
  scenario: string;
  contextFunctions: {
    name: string;
    role: string;
    isTarget?: boolean;
  }[];
  taskInstruction: string;
  presets: {
    standard82: {
      label: string;
      code: string;
      scores: {
        schema: number;
        description: number;
        security: number;
        errorHandling: number;
        total: number;
      };
    };
    minimal48: {
      label: string;
      code: string;
      scores: {
        schema: number;
        description: number;
        security: number;
        errorHandling: number;
        total: number;
      };
    };
    expert100: {
      label: string;
      code: string;
      scores: {
        schema: number;
        description: number;
        security: number;
        errorHandling: number;
        total: number;
      };
    };
  };
}

const LAB_EXERCISES: LabExerciseSpec[] = [
  {
    id: 'ex-hotel-tool-use',
    number: 'Exercice 01',
    badge: 'Exercice : Tool Use',
    title: 'Agent de Réservation d’Hôtel — Définition JSON Schema & Garde-fous',
    scenario:
      'Un agent doit réserver un hôtel pour un collaborateur en déplacement. Il dispose de 3 fonctions dans son environnement d’outils et vous devez construire la définition complète de l’outil critique `book_hotel`.',
    contextFunctions: [
      {
        name: 'search_hotels(city, check_in, check_out)',
        role: 'Recherche les hôtels correspondant à la ville et aux dates (Lecture seule)',
      },
      {
        name: 'get_availability(hotel_id, room_type)',
        role: 'Vérifie la disponibilité temps réel et renvoie un quote_id tarifaire (Lecture seule)',
      },
      {
        name: 'book_hotel(...)',
        role: 'Exécute la réservation ferme avec débit — À CONSTRUIRE CI-DESSOUS',
        isTarget: true,
      },
    ],
    taskInstruction:
      'Construisez le schéma JSON de l’outil "book_hotel" en maximisant la précision du Schema, la Description orientée agent, la Sécurité (HITL / idempotence / plafond prix) et la Gestion d’erreur.',
    presets: {
      standard82: {
        label: 'Votre soumission (Score : 82/100)',
        scores: {
          schema: 100,
          description: 80,
          security: 60,
          errorHandling: 90,
          total: 82,
        },
        code: `{
  "name": "book_hotel",
  "description": "Réserve fermement une chambre d'hôtel après avoir vérifié la disponibilité via get_availability(). Renvoie une erreur is_error: true si la chambre n'est plus disponible ou si les dates sont invalides.",
  "input_schema": {
    "type": "object",
    "properties": {
      "hotel_id": {
        "type": "string",
        "description": "Identifiant unique de l'hôtel obtenu via search_hotels() (ex: HTL-892)"
      },
      "room_type": {
        "type": "string",
        "enum": ["standard", "deluxe", "suite"],
        "description": "Catégorie de chambre choisie par le voyageur"
      },
      "check_in": {
        "type": "string",
        "description": "Date d'arrivée au format ISO 8601 (YYYY-MM-DD)"
      },
      "check_out": {
        "type": "string",
        "description": "Date de départ au format ISO 8601 (YYYY-MM-DD)"
      },
      "guests": {
        "type": "integer",
        "description": "Nombre de voyageurs adultes (1 à 4)"
      }
    },
    "required": ["hotel_id", "room_type", "check_in", "check_out", "guests"]
  }
}`,
      },
      minimal48: {
        label: 'Brouillon incomplet (Score : 48/100)',
        scores: {
          schema: 60,
          description: 40,
          security: 35,
          errorHandling: 55,
          total: 48,
        },
        code: `{
  "name": "book_hotel",
  "description": "Permet de réserver un hôtel.",
  "input_schema": {
    "type": "object",
    "properties": {
      "hotel": { "type": "string" },
      "dates": { "type": "string" }
    }
  }
}`,
      },
      expert100: {
        label: 'Solution Gold Architecte (Score : 100/100)',
        scores: {
          schema: 100,
          description: 100,
          security: 100,
          errorHandling: 100,
          total: 100,
        },
        code: `{
  "name": "book_hotel",
  "description": "Exécute une réservation d'hôtel ferme (ACTION AVEC EFFET DE BORD FINANCIER). PRÉREQUIS : Appeler obligatoirement search_hotels() puis get_availability() avant cet outil. SÉCURITÉ : Ne jamais appeler sans confirmation explicite de l'utilisateur sur le tarif total. GESTION D'ERREUR : En cas de retour is_error: true (ROOM_UNAVAILABLE ou PRICE_EXCEEDED), ne pas boucler et proposer une alternative via get_availability().",
  "input_schema": {
    "type": "object",
    "properties": {
      "hotel_id": {
        "type": "string",
        "description": "Identifiant unique de l'hôtel renvoyé par search_hotels() (ex: HTL-892)"
      },
      "availability_quote_id": {
        "type": "string",
        "description": "Jeton de disponibilité valide issu de get_availability() garantissant le tarif"
      },
      "room_type": {
        "type": "string",
        "enum": ["standard", "deluxe", "suite"],
        "description": "Catégorie exacte de chambre validée"
      },
      "check_in": {
        "type": "string",
        "description": "Date d'arrivée ISO 8601 (YYYY-MM-DD)"
      },
      "check_out": {
        "type": "string",
        "description": "Date de départ ISO 8601 (YYYY-MM-DD)"
      },
      "guests": {
        "type": "integer",
        "description": "Nombre exact de voyageurs (1 à 4)"
      },
      "max_approved_total_eur": {
        "type": "number",
        "description": "Plafond budgétaire en EUR explicitement confirmé par l'utilisateur (garde-fou anti-dépassement)"
      },
      "idempotency_key": {
        "type": "string",
        "description": "Clé d'idempotence unique (UUID v4) évitant toute double réservation en cas de retry réseau"
      }
    },
    "required": [
      "hotel_id",
      "availability_quote_id",
      "room_type",
      "check_in",
      "check_out",
      "guests",
      "max_approved_total_eur",
      "idempotency_key"
    ],
    "additionalProperties": false
  }
}`,
      },
    },
  },
  {
    id: 'ex-mcp-parallel-error',
    number: 'Exercice 02',
    badge: 'Exercice : MCP & is_error',
    title: 'Gestion d’Erreur Parallèle Multi-Outils (tool_result & is_error: true)',
    scenario:
      'Claude a émis 2 appels parallèles (`search_hotels` id: `toolu_01` et `get_availability` id: `toolu_02`). `search_hotels` a réussi mais `get_availability` a expiré (timeout 5s). Construisez le message `role: "user"` de retour.',
    contextFunctions: [
      {
        name: 'toolu_01 → search_hotels("Paris")',
        role: 'Succès (200 OK) : 3 hôtels trouvés',
      },
      {
        name: 'toolu_02 → get_availability("HTL-892")',
        role: 'Échec (Timeout 5000ms sur le serveur MCP)',
        isTarget: true,
      },
    ],
    taskInstruction:
      'Construisez le message unique `role: "user"` regroupant les 2 blocs `tool_result` dans le bon ordre et avec `is_error: true` sur l’appel en échec.',
    presets: {
      standard82: {
        label: 'Votre soumission (Score : 82/100)',
        scores: {
          schema: 100,
          description: 80,
          security: 60,
          errorHandling: 90,
          total: 82,
        },
        code: `{
  "role": "user",
  "content": [
    {
      "type": "tool_result",
      "tool_use_id": "toolu_01",
      "content": "[{\\"hotel_id\\": \\"HTL-892\\", \\"name\\": \\"Hôtel Saint-Germain\\"}]"
    },
    {
      "type": "tool_result",
      "tool_use_id": "toolu_02",
      "is_error": true,
      "content": "Timeout après 5000ms lors de l'interrogation de get_availability pour HTL-892."
    }
  ]
}`,
      },
      minimal48: {
        label: 'Brouillon erroné (Score : 45/100)',
        scores: {
          schema: 50,
          description: 45,
          security: 40,
          errorHandling: 45,
          total: 45,
        },
        code: `{
  "role": "user",
  "content": [
    {
      "type": "text",
      "text": "Voici le résultat partiel :"
    },
    {
      "type": "tool_result",
      "tool_use_id": "toolu_01",
      "content": "OK"
    }
  ]
}`,
      },
      expert100: {
        label: 'Solution Gold Architecte (Score : 100/100)',
        scores: {
          schema: 100,
          description: 100,
          security: 100,
          errorHandling: 100,
          total: 100,
        },
        code: `{
  "role": "user",
  "content": [
    {
      "type": "tool_result",
      "tool_use_id": "toolu_01",
      "content": "[{\\"hotel_id\\": \\"HTL-892\\", \\"name\\": \\"Hôtel Saint-Germain\\", \\"city\\": \\"Paris\\"}]"
    },
    {
      "type": "tool_result",
      "tool_use_id": "toolu_02",
      "is_error": true,
      "content": "MCP_TIMEOUT_ERROR (5000ms): Le service get_availability(HTL-892) est temporairement indisponible. Action suggérée : réessayer une fois ou proposer un autre hôtel de la liste."
    }
  ]
}`,
      },
    },
  },
];

interface AnalysisCriterionDetail {
  id: 'schema' | 'description' | 'security' | 'errorHandling';
  label: string;
  score: number;
  statusText: string;
  feedback: string;
  fixSuggestion?: string;
}

export const LabPracticeView: React.FC = () => {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('ex-hotel-tool-use');
  const activeExercise =
    LAB_EXERCISES.find((e) => e.id === selectedExerciseId) || LAB_EXERCISES[0];

  const [editorCode, setEditorCode] = useState<string>(
    activeExercise.presets.standard82.code
  );
  const [activePresetKey, setActivePresetKey] = useState<
    'standard82' | 'minimal48' | 'expert100' | 'custom'
  >('standard82');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisRunCount, setAnalysisRunCount] = useState<number>(1);

  // Switch exercise handler
  const handleSelectExercise = (exId: string) => {
    const found = LAB_EXERCISES.find((e) => e.id === exId) || LAB_EXERCISES[0];
    setSelectedExerciseId(exId);
    setEditorCode(found.presets.standard82.code);
    setActivePresetKey('standard82');
  };

  // Switch preset handler
  const handleSelectPreset = (key: 'standard82' | 'minimal48' | 'expert100') => {
    setActivePresetKey(key);
    setEditorCode(activeExercise.presets[key].code);
    const sc = activeExercise.presets[key].scores;
    updateResumeCheckpoint(
      'lab',
      {
        progressPercent: sc.total,
        lastSessionTitle: `${activeExercise.badge} — ${activeExercise.title.split('—')[0].trim()}`,
        stepProgressLabel: `Score actuel : ${sc.total} / 100`,
        subDetailLabel: `Schema ${sc.schema}% · Description ${sc.description}% · Sécurité ${sc.security}% · Erreur ${sc.errorHandling}%`,
        payload: {
          labExerciseId: activeExercise.id,
        },
      },
      true
    );
  };

  // Live intelligent analyzer for the user's JSON code
  const evaluation = useMemo(() => {
    // If using one of the 3 presets unmodified, start from its exact calibrated scores
    let schemaScore = 100;
    let descriptionScore = 80;
    let securityScore = 60;
    let errorHandlingScore = 90;
    let totalScore = 82;
    let isValidJson = true;
    let jsonErrorMsg: string | null = null;

    try {
      JSON.parse(editorCode);
    } catch (err) {
      isValidJson = false;
      jsonErrorMsg = err instanceof Error ? err.message : 'Erreur de syntaxe JSON';
    }

    if (!isValidJson) {
      return {
        isValidJson: false,
        jsonErrorMsg,
        totalScore: 20,
        criteria: [
          {
            id: 'schema' as const,
            label: 'Schema',
            score: 20,
            statusText: 'JSON Invalide',
            feedback: `Erreur de syntaxe JSON détectée : ${jsonErrorMsg}`,
          },
          {
            id: 'description' as const,
            label: 'Description',
            score: 20,
            statusText: 'Non analysable',
            feedback: 'Corrigez la syntaxe JSON pour évaluer la description sémantique.',
          },
          {
            id: 'security' as const,
            label: 'Sécurité',
            score: 20,
            statusText: 'Non analysable',
            feedback: 'Corrigez la syntaxe JSON pour vérifier les garde-fous de sécurité.',
          },
          {
            id: 'errorHandling' as const,
            label: 'Gestion d’erreur',
            score: 20,
            statusText: 'Non analysable',
            feedback: 'Corrigez la syntaxe JSON pour vérifier les clauses d’erreur.',
          },
        ],
      };
    }

    if (activePresetKey !== 'custom') {
      const p = activeExercise.presets[activePresetKey].scores;
      schemaScore = p.schema;
      descriptionScore = p.description;
      securityScore = p.security;
      errorHandlingScore = p.errorHandling;
      totalScore = p.total;
    } else {
      // Dynamic heuristic evaluation when the user edits the code manually!
      const lower = editorCode.toLowerCase();
      schemaScore =
        (lower.includes('"input_schema"') || lower.includes('"tool_result"') ? 40 : 15) +
        (lower.includes('"required"') || lower.includes('"tool_use_id"') ? 35 : 0) +
        (lower.includes('"enum"') || lower.includes('"properties"') ? 25 : 10);
      schemaScore = Math.min(100, schemaScore);

      descriptionScore =
        (lower.includes('get_availability') ? 45 : 20) +
        (lower.includes('search_hotels') || lower.includes('prérequis') ? 35 : 20) +
        (editorCode.length > 450 ? 20 : 10);
      descriptionScore = Math.min(100, descriptionScore);

      securityScore =
        (lower.includes('idempotency_key') ? 40 : 20) +
        (lower.includes('max_approved_total') || lower.includes('confirmation') ? 40 : 20) +
        (lower.includes('additionalproperties') ? 20 : 10);
      securityScore = Math.min(100, securityScore);

      errorHandlingScore =
        (lower.includes('is_error') ? 55 : 25) +
        (lower.includes('unavailable') || lower.includes('timeout') || lower.includes('erreur')
          ? 45
          : 20);
      errorHandlingScore = Math.min(100, errorHandlingScore);

      totalScore = Math.round(
        (schemaScore + descriptionScore + securityScore + errorHandlingScore) / 4
      );
    }

    const criteria: AnalysisCriterionDetail[] = [
      {
        id: 'schema',
        label: 'Schema',
        score: schemaScore,
        statusText:
          schemaScore >= 95 ? 'Excellent' : schemaScore >= 75 ? 'Solide' : 'Incomplet',
        feedback:
          schemaScore >= 95
            ? 'Typage JSON Schema strict (`type: "object"`, `enum`, `required` complet sur les paramètres critiques).'
            : 'Il manque le tableau `required` ou le typage strict (`enum`) des chambres et dates ISO 8601.',
      },
      {
        id: 'description',
        label: 'Description',
        score: descriptionScore,
        statusText:
          descriptionScore >= 95
            ? 'Optimale'
            : descriptionScore >= 75
            ? 'Bonne (perfectible)'
            : 'Trop vague',
        feedback:
          descriptionScore >= 95
            ? 'Chaînage explicite `search_hotels() → get_availability() → book_hotel()` parfaitement documenté.'
            : 'Mentionne `get_availability()`, mais devrait préciser explicitement que `search_hotels()` doit être appelé en amont et qu’il s’agit d’une action avec débit.',
        fixSuggestion:
          'Ajouter la chaîne complète de prérequis search_hotels() → get_availability() dans la description.',
      },
      {
        id: 'security',
        label: 'Sécurité',
        score: securityScore,
        statusText:
          securityScore >= 90
            ? 'Verrouillée'
            : securityScore >= 60
            ? 'Attention (60 %)'
            : 'Vulnérable',
        feedback:
          securityScore >= 90
            ? 'Présence de `idempotency_key` (anti-double débit), `max_approved_total_eur` (plafond HITL) et `additionalProperties: false`.'
            : 'Absence de `idempotency_key` (risque de double réservation en cas de retry HTTP) et de plafond `max_approved_total_eur` validé par l’utilisateur.',
        fixSuggestion:
          'Injecter idempotency_key + max_approved_total_eur + additionalProperties: false (+40% en Sécurité).',
      },
      {
        id: 'errorHandling',
        label: 'Gestion d’erreur',
        score: errorHandlingScore,
        statusText:
          errorHandlingScore >= 90 ? 'Robuste' : errorHandlingScore >= 70 ? 'Correcte' : 'Faible',
        feedback:
          errorHandlingScore >= 95
            ? 'Instructions claires de reprise sur `is_error: true` (`ROOM_UNAVAILABLE`, `PRICE_EXCEEDED`) sans boucle infinie.'
            : 'Le contrat `is_error: true` est bien mentionné (90%), ajoutez la consigne anti-boucle en cas de `PRICE_EXCEEDED`.',
      },
    ];

    return {
      isValidJson: true,
      jsonErrorMsg: null,
      totalScore,
      criteria,
    };
  }, [editorCode, activePresetKey, activeExercise]);

  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisRunCount((prev) => prev + 1);
    }, 350);
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Top Header & Exercise Selector */}
      <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-4 mb-6 pb-4 border-b border-[#eae7e7]">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#99462a] uppercase tracking-widest font-bold">
            <Terminal className="w-4 h-4" />
            <span>Environnement d’Exercices Pratiques & Évaluateur IA</span>
          </div>
          <h1 className="font-headline text-[30px] lg:text-[36px] text-[#1c1b1b] font-bold tracking-tight leading-tight">
            Laboratoire Pratique : Tool Use & MCP
          </h1>
          <p className="text-[14.5px] text-[#55433d] max-w-3xl">
            Construisez vos schémas d’outils JSON et payloads MCP en conditions réelles. L’analyseur évalue instantanément votre réponse sur 4 piliers : <strong>Schema</strong>, <strong>Description</strong>, <strong>Sécurité</strong> et <strong>Gestion d’erreur</strong>.
          </p>
        </div>

        {/* Exercise Switcher Pills */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {LAB_EXERCISES.map((ex) => {
            const isSelected = ex.id === selectedExerciseId;
            return (
              <button
                key={ex.id}
                type="button"
                onClick={() => handleSelectExercise(ex.id)}
                className={`px-4 py-2.5 rounded-xl font-mono text-[12px] transition-all border flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-[#1c1b1b] text-white border-[#1c1b1b] font-bold shadow-xs'
                    : 'bg-white text-[#55433d] border-[#eae7e7] hover:bg-[#f6f3f2]'
                }`}
              >
                <Code2 className="w-4 h-4 text-[#d97757]" />
                <span>
                  {ex.number} · {ex.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Exercise Scenario & Available Functions Banner */}
      <section className="bg-white rounded-3xl p-6 mb-6 border border-[#eae7e7] shadow-xs flex flex-col gap-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#f0eded]">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#99462a] text-white font-mono text-[10px] uppercase font-bold tracking-wider">
                {activeExercise.badge}
              </span>
              <span className="font-mono text-[11px] text-[#88726c]">
                Évaluation multi-critères sur 100 points
              </span>
            </div>
            <h2 className="font-headline text-[24px] lg:text-[26px] text-[#1c1b1b] font-bold mt-0.5">
              {activeExercise.title}
            </h2>
            <p className="text-[14px] text-[#55433d] leading-relaxed">
              {activeExercise.scenario}
            </p>
          </div>

          {/* Preset Quick-Loaders */}
          <div className="flex flex-col gap-1.5 shrink-0">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#88726c] font-bold">
              Tester un niveau de réponse dans l’analyseur :
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleSelectPreset('minimal48')}
                className={`px-3 py-1.5 rounded-xl font-mono text-[11px] border transition-all cursor-pointer ${
                  activePresetKey === 'minimal48'
                    ? 'bg-[#ba1a1a] text-white border-[#ba1a1a] font-bold'
                    : 'bg-[#fcf9f8] text-[#55433d] border-[#eae7e7] hover:bg-[#f0eded]'
                }`}
              >
                Brouillon (48/100)
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset('standard82')}
                className={`px-3 py-1.5 rounded-xl font-mono text-[11px] border transition-all cursor-pointer ${
                  activePresetKey === 'standard82'
                    ? 'bg-[#99462a] text-white border-[#99462a] font-bold'
                    : 'bg-[#fcf9f8] text-[#55433d] border-[#eae7e7] hover:bg-[#f0eded]'
                }`}
              >
                Réponse Standard (82/100)
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset('expert100')}
                className={`px-3 py-1.5 rounded-xl font-mono text-[11px] border transition-all cursor-pointer ${
                  activePresetKey === 'expert100'
                    ? 'bg-[#2e7d32] text-white border-[#2e7d32] font-bold'
                    : 'bg-[#fcf9f8] text-[#55433d] border-[#eae7e7] hover:bg-[#f0eded]'
                }`}
              >
                Solution Gold (100/100)
              </button>
            </div>
          </div>
        </div>

        {/* Agent's Available Functions Strip: search_hotels(), get_availability(), book_hotel() */}
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#88726c] font-bold">
            Fonctions à disposition de l’agent dans l’environnement :
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {activeExercise.contextFunctions.map((fn, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border flex flex-col gap-1 ${
                  fn.isTarget
                    ? 'bg-[#fff8f5] border-[#99462a] ring-1 ring-[#99462a]/20'
                    : 'bg-[#f6f3f2] border-[#eae7e7]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <code className="font-mono text-[12.5px] font-bold text-[#1c1b1b]">
                    {fn.name}
                  </code>
                  {fn.isTarget && (
                    <span className="px-2 py-0.5 rounded bg-[#99462a] text-white font-mono text-[9.5px] uppercase font-bold">
                      Cible
                    </span>
                  )}
                </div>
                <span className="text-[12px] text-[#55433d] leading-snug">{fn.role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main 2-Column Interactive Workspace: Left = JSON Schema Editor | Right = Live Multi-Criteria Analyzer (82/100) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT 7 COLS: Interactive JSON Schema / Tool Builder */}
        <div className="lg:col-span-7 bg-[#1c1b1b] rounded-3xl border border-[#363433] shadow-lg overflow-hidden flex flex-col justify-between">
          <div>
            {/* Dark IDE Top Bar */}
            <div className="bg-[#262424] px-5 py-3.5 border-b border-[#363433] flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <span className="font-mono text-[12px] text-[#f5dad0] font-bold ml-2">
                  tool_definition.json
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/10 text-[#d5c2bc]">
                  Éditable en direct
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectPreset('standard82')}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-[#d5c2bc] font-mono text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Réinitialiser (82/100)</span>
                </button>
                <button
                  type="button"
                  onClick={handleRunAnalysis}
                  className="px-4 py-1.5 rounded-lg bg-[#d97757] hover:bg-[#c06142] text-white font-mono text-[11px] font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isAnalyzing ? 'Analyse en cours...' : 'Analyser ma réponse'}</span>
                </button>
              </div>
            </div>

            {/* Instruction Sub-header */}
            <div className="px-5 py-2.5 bg-[#221f1e] border-b border-[#363433] text-[12px] text-[#d5c2bc] font-mono flex items-center justify-between">
              <span>{activeExercise.taskInstruction}</span>
            </div>

            {/* Editable Code Textarea */}
            <div className="p-4">
              <textarea
                value={editorCode}
                onChange={(e) => {
                  setEditorCode(e.target.value);
                  setActivePresetKey('custom');
                }}
                spellCheck={false}
                rows={22}
                aria-label="Éditeur JSON de définition d'outil"
                className="w-full bg-[#161515] text-[#f5dad0] font-mono text-[12.5px] leading-relaxed p-4 rounded-2xl border border-[#363433] focus:outline-none focus:border-[#d97757] resize-y"
              />
            </div>
          </div>

          {/* IDE Bottom Status Bar */}
          <div className="bg-[#262424] px-5 py-3 border-t border-[#363433] flex items-center justify-between text-[11px] font-mono text-[#a08c86]">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  evaluation.isValidJson ? 'bg-[#66bb6a]' : 'bg-[#ef5350]'
                }`}
              />
              <span>
                {evaluation.isValidJson
                  ? 'Syntaxe JSON Schema valide'
                  : 'Erreur de syntaxe JSON détectée'}
              </span>
            </div>
            <span>Exécution #{analysisRunCount} · Analyseur Claude Architect</span>
          </div>
        </div>

        {/* RIGHT 5 COLS: Multi-Criteria Evaluation Scorecard (Schema 100%, Description 80%, Sécurité 60%, Gestion d'erreur 90% -> Score : 82/100) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border-2 border-[#99462a]/25 shadow-sm flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-5">
            {/* Score Hero Box */}
            <div className="flex items-center justify-between gap-4 pb-5 border-b border-[#f0eded]">
              <div className="flex flex-col">
                <span className="font-mono text-[11px] uppercase tracking-widest text-[#99462a] font-bold">
                  Diagnostic de l’Analyseur
                </span>
                <h3 className="font-headline text-[38px] sm:text-[42px] text-[#1c1b1b] font-bold leading-none mt-1">
                  Score : {evaluation.totalScore}/100
                </h3>
              </div>

              <div
                className={`px-3.5 py-2 rounded-2xl font-mono text-[12px] font-bold border ${
                  evaluation.totalScore >= 90
                    ? 'bg-[#e8f5e9] text-[#1b5e20] border-[#2e7d32]/30'
                    : evaluation.totalScore >= 75
                    ? 'bg-[#fff8f5] text-[#99462a] border-[#f5dad0]'
                    : 'bg-[#ffdad6] text-[#ba1a1a] border-[#ba1a1a]/30'
                }`}
              >
                {evaluation.totalScore >= 90
                  ? 'Prêt pour Production'
                  : evaluation.totalScore >= 75
                  ? 'Solide · Sécurité à renforcer'
                  : 'Révision requise'}
              </div>
            </div>

            {/* 4 Criteria Breakdown Bars (Schema, Description, Sécurité, Gestion d'erreur) */}
            <div className="flex flex-col gap-4">
              {evaluation.criteria.map((crit) => {
                const isHigh = crit.score >= 85;
                const isMed = crit.score >= 70 && crit.score < 85;
                const barColor = isHigh
                  ? 'bg-[#2e7d32]'
                  : isMed
                  ? 'bg-[#d97757]'
                  : 'bg-[#ba1a1a]';
                const textColor = isHigh
                  ? 'text-[#2e7d32]'
                  : isMed
                  ? 'text-[#99462a]'
                  : 'text-[#ba1a1a]';

                return (
                  <div
                    key={crit.id}
                    className="p-4 rounded-2xl bg-[#fcf9f8] border border-[#eae7e7] flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-[14px] font-bold text-[#1c1b1b]">
                        {crit.label} : <span className={textColor}>{crit.score} %</span>
                      </span>
                      <span className={`text-[11px] font-bold ${textColor}`}>
                        {crit.statusText}
                      </span>
                    </div>

                    <div className="w-full bg-[#eae7e7] h-2 rounded-full overflow-hidden">
                      <div
                        className={`${barColor} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${crit.score}%` }}
                      />
                    </div>

                    <p className="text-[12.5px] text-[#55433d] leading-relaxed mt-0.5">
                      {crit.feedback}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* One-Click Upgrade to 100/100 Box */}
          <div className="pt-4 border-t border-[#f0eded] flex flex-col gap-3">
            {evaluation.totalScore < 100 ? (
              <div className="p-4 rounded-2xl bg-[#fff8f5] border border-[#f5dad0] flex flex-col gap-2.5">
                <div className="flex items-center gap-2 font-mono text-[11px] text-[#99462a] font-bold uppercase">
                  <Sparkles className="w-4 h-4 text-[#d97757]" />
                  <span>Comment passer de {evaluation.totalScore}/100 à 100/100 ?</span>
                </div>
                <p className="text-[12.5px] text-[#55433d] leading-relaxed">
                  Ajoutez <code>idempotency_key</code>, <code>max_approved_total_eur</code> et{' '}
                  <code>additionalProperties: false</code> pour verrouiller la Sécurité (60 % → 100 %) et la Description (80 % → 100 %).
                </p>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('expert100')}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#99462a] hover:bg-[#7a2f15] text-white font-mono text-[12px] font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Appliquer les correctifs de Sécurité & Description (100/100)</span>
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#e8f5e9] border border-[#2e7d32]/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-5 h-5 text-[#2e7d32] shrink-0" />
                  <span className="text-[13px] font-semibold text-[#1b5e20]">
                    Architecture Gold Standard validée (100/100 sur les 4 axes) !
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Catalog of Additional Lab Workshops */}
      <section className="mt-12 pt-8 border-t border-[#eae7e7]">
        <div className="flex flex-col mb-5">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#99462a] font-bold">
            Bibliothèque d'Ateliers
          </span>
          <h2 className="font-headline text-[24px] text-[#1c1b1b]">
            Autres Exercices d'Architecture & Scénarios MCP
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {LAB_WORKSHOPS.map((ws) => (
            <div
              key={ws.id}
              onClick={() =>
                handleSelectExercise(
                  ws.id === 'lab-1' ? 'ex-hotel-tool-use' : 'ex-mcp-parallel-error'
                )
              }
              className="bg-[#f6f3f2] hover:bg-[#f0eded] rounded-2xl p-5 border border-[#eae7e7] hover:border-[#dbc1b9] transition-all flex flex-col justify-between gap-4 cursor-pointer group"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#99462a] font-bold uppercase tracking-wider">
                    {ws.code} • {ws.category}
                  </span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white text-[#55433d] border border-[#eae7e7]">
                    {ws.level}
                  </span>
                </div>

                <h3 className="font-headline text-[18px] text-[#1c1b1b] font-semibold group-hover:text-[#99462a] transition-colors">
                  {ws.title}
                </h3>

                <p className="text-[13px] text-[#55433d] leading-relaxed">{ws.description}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#eae7e7] font-mono text-[12px] text-[#99462a] font-bold">
                <span>Ouvrir dans l’analyseur</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
