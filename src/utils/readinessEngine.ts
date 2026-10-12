import { IntelligentReadiness, ConfidenceLevel, ReadinessDimension } from '../types';

const STORAGE_KEY_READINESS = 'claudemastor_intelligent_readiness_v1';

export const DEFAULT_READINESS_BY_CERT: Record<string, IntelligentReadiness> = {
  'cca-p200': {
    certId: 'cca-p200',
    certCode: 'CCA-P200',
    globalScore: 78,
    maxScore: 100,
    confidence: 'moyenne',
    confidenceReason:
      "Quelqu'un qui connaît 90 % des flashcards mais échoue systématiquement aux cas d'architecture n'est pas forcément prêt.",
    confidenceDetail:
      "L'examen professionnel évalue la capacité à orchestrer des systèmes réels sous contrainte de temps et de coûts. Une excellente mémoire théorique ne garantit pas la réussite si la synthèse d'architecture ou la vitesse d'arbitrage restent sous le seuil.",
    dimensions: {
      knowledge: {
        id: 'knowledge',
        label: 'Connaissances',
        score: 84,
        targetScore: 80,
        weight: 25,
        description: 'Maîtrise conceptuelle du syllabus Claude 3.5, tags XML, tool definitions & System Prompts.',
        detail: '84 / 100 · 112 concepts validés · Erreurs résiduelles sur les subtilités du protocole MCP.',
        status: 'optimal',
      },
      retention: {
        id: 'retention',
        label: 'Rétention',
        score: 76,
        targetScore: 80,
        weight: 20,
        description: 'Stabilité mnésique à long terme selon la courbe de répétition espacée (SRS).',
        detail: '76 / 100 · 68% du deck en palier consolidé (> 14 jours) · 24 cartes à revoir cette semaine.',
        status: 'vigilance',
      },
      speed: {
        id: 'speed',
        label: 'Vitesse',
        score: 71,
        targetScore: 75,
        weight: 15,
        description: 'Vélocité de lecture et cadence de réponse (cible : ≤ 1m 20s par question de 4 propositions).',
        detail: '71 / 100 · 1m 16s en moyenne · Risque de tension sur les 10 dernières questions à énoncé long.',
        status: 'alerte',
      },
      practice: {
        id: 'practice',
        label: 'Cas pratiques',
        score: 73,
        targetScore: 80,
        weight: 20,
        description: 'Résolution d’ateliers d’architecture système, tool use payloads et design multi-agents.',
        detail: '73 / 100 · Cas #027 Bancaire résolu à 78% · Faiblesses sur les arbitrages de latence P95 vs coûts.',
        status: 'vigilance',
      },
      mockExams: {
        id: 'mockExams',
        label: 'Examens blancs',
        score: 81,
        targetScore: 80,
        weight: 20,
        description: 'Performance globale en simulation chronométrée stricte (60 questions / 90 minutes).',
        detail: '81 / 100 · Dernier examen blanc 780/1000 (Seuil : 720) · 3 simulations consécutives réussies.',
        status: 'optimal',
      },
    },
    asymmetryAlert: {
      highest: 'Connaissances (84)',
      lowest: 'Vitesse (71) & Cas pratiques (73)',
      gap: 13,
      warning:
        "Déséquilibre de préparation détecté : Connaissances solides (84%) mais fragilité relative sur la vitesse d'exécution (71%) et les cas d'architecture (73%).",
      remedyRecommendation:
        "Travailler l'Atelier Architecture #027 et 2 sessions chronométrées de 15 min pour transformer la confiance 'Moyenne' en 'Élevée'.",
    },
  },
  'cca-f100': {
    certId: 'cca-f100',
    certCode: 'CCA-F100',
    globalScore: 86,
    maxScore: 100,
    confidence: 'élevée',
    confidenceReason:
      'Profil équilibré sur les fondamentaux théoriques et la rapidité de réponse.',
    confidenceDetail:
      'Pas d’asymétrie majeure constatée. Les simulations fondamentales dépassent largement le seuil minimal de 700/1000.',
    dimensions: {
      knowledge: {
        id: 'knowledge',
        label: 'Connaissances',
        score: 90,
        targetScore: 80,
        weight: 30,
        description: 'Principes fondamentaux de l’IA générative et de l’écosystème Anthropic.',
        detail: '90 / 100 · Connaissances très solides.',
        status: 'optimal',
      },
      retention: {
        id: 'retention',
        label: 'Rétention',
        score: 85,
        targetScore: 80,
        weight: 25,
        description: 'Mémorisation des termes clés et des capacités des modèles Claude 3.',
        detail: '85 / 100 · Deck maîtrisé à 82%.',
        status: 'optimal',
      },
      speed: {
        id: 'speed',
        label: 'Vitesse',
        score: 84,
        targetScore: 75,
        weight: 15,
        description: 'Cadence de réponse confortable (55s / question).',
        detail: '84 / 100 · Aucun risque de dépassement de temps.',
        status: 'optimal',
      },
      practice: {
        id: 'practice',
        label: 'Cas pratiques',
        score: 82,
        targetScore: 75,
        weight: 15,
        description: 'Cas d’usage basiques et identification des prompts efficaces.',
        detail: '82 / 100 · Exercices réussis.',
        status: 'optimal',
      },
      mockExams: {
        id: 'mockExams',
        label: 'Examens blancs',
        score: 88,
        targetScore: 80,
        weight: 15,
        description: 'Excellents scores aux 2 examens d’entraînement.',
        detail: '88 / 100 · Score moyen 860/1000.',
        status: 'optimal',
      },
    },
  },
  'cca-s300': {
    certId: 'cca-s300',
    certCode: 'CCA-S300',
    globalScore: 68,
    maxScore: 100,
    confidence: 'faible',
    confidenceReason:
      'Nombre d’exercices pratiques sur les guardrails et jailbreaks insuffisant pour garantir la certification.',
    confidenceDetail:
      'Des faiblesses notables sur les vulnérabilités de prompt injection indirecte créent un risque élevé.',
    dimensions: {
      knowledge: {
        id: 'knowledge',
        label: 'Connaissances',
        score: 77,
        targetScore: 80,
        weight: 25,
        description: 'Normes de conformité et gouvernance des données d’entreprise.',
        detail: '77 / 100 · Reste des zones floues sur la rétention zéro.',
        status: 'vigilance',
      },
      retention: {
        id: 'retention',
        label: 'Rétention',
        score: 70,
        targetScore: 80,
        weight: 20,
        description: 'Rétention des vecteurs d’attaques et remédiations.',
        detail: '70 / 100 · Baisse de rétention observée après 7 jours.',
        status: 'vigilance',
      },
      speed: {
        id: 'speed',
        label: 'Vitesse',
        score: 65,
        targetScore: 75,
        weight: 15,
        description: 'Hésitations sur les questions d’audit réglementaire.',
        detail: '65 / 100 · 1m 40s par question.',
        status: 'alerte',
      },
      practice: {
        id: 'practice',
        label: 'Cas pratiques',
        score: 62,
        targetScore: 80,
        weight: 20,
        description: 'Hardening de prompts et isolation de flux de données.',
        detail: '62 / 100 · Exercices de jailbreak defense encore fragiles.',
        status: 'alerte',
      },
      mockExams: {
        id: 'mockExams',
        label: 'Examens blancs',
        score: 69,
        targetScore: 80,
        weight: 20,
        description: 'Score encore sous le seuil de sécurité visé.',
        detail: '69 / 100 · 680/1000 (Seuil : 750).',
        status: 'alerte',
      },
    },
    asymmetryAlert: {
      highest: 'Connaissances (77)',
      lowest: 'Cas pratiques (62)',
      gap: 15,
      warning:
        'Le savoir théorique ne suffit pas sur la spécialité Sécurité : l’analyse de logs et le blocage d’attaques réelles nécessitent plus de pratique.',
      remedyRecommendation:
        'Compléter les labs de Red Teaming et réviser les 18 erreurs du domaine Sécurité.',
    },
  },
};

export function computeIntelligentReadiness(
  certId: string,
  overrides?: {
    knowledge?: number;
    retention?: number;
    speed?: number;
    practice?: number;
    mockExams?: number;
  }
): IntelligentReadiness {
  const base = DEFAULT_READINESS_BY_CERT[certId] || DEFAULT_READINESS_BY_CERT['cca-p200'];

  if (!overrides) {
    return base;
  }

  const k = overrides.knowledge !== undefined ? overrides.knowledge : base.dimensions.knowledge.score;
  const r = overrides.retention !== undefined ? overrides.retention : base.dimensions.retention.score;
  const s = overrides.speed !== undefined ? overrides.speed : base.dimensions.speed.score;
  const p = overrides.practice !== undefined ? overrides.practice : base.dimensions.practice.score;
  const m = overrides.mockExams !== undefined ? overrides.mockExams : base.dimensions.mockExams.score;

  // Weighted calculation matching the prompt formula:
  // 0.25 * 84 + 0.20 * 76 + 0.15 * 71 + 0.20 * 73 + 0.20 * 81 = 77.65 -> 78
  const weighted = 0.25 * k + 0.20 * r + 0.15 * s + 0.20 * p + 0.20 * m;
  const globalScore = Math.round(weighted);

  // Determine Confidence based on dispersion and core thresholds:
  // "Car quelqu'un qui connaît 90 % des flashcards mais échoue systématiquement aux cas d'architecture n'est pas forcément prêt."
  const minScore = Math.min(k, r, s, p, m);
  const maxScore = Math.max(k, r, s, p, m);
  const dispersion = maxScore - minScore;

  let confidence: ConfidenceLevel = 'moyenne';
  let confidenceReason = base.confidenceReason;

  if (p < 75 || s < 72 || dispersion > 12) {
    confidence = 'moyenne';
    confidenceReason =
      "Quelqu'un qui connaît 90 % des flashcards mais échoue systématiquement aux cas d'architecture n'est pas forcément prêt.";
  }
  if (minScore < 65 || globalScore < 70) {
    confidence = 'faible';
    confidenceReason =
      'Plusieurs axes critiques sont encore nettement sous le seuil de sécurité exigé pour la certification.';
  } else if (minScore >= 75 && dispersion <= 10 && globalScore >= 80) {
    confidence = 'élevée';
    confidenceReason =
      'Préparation harmonieuse : tous les axes dépassent le seuil de sécurité avec une faible dispersion.';
  } else if (minScore >= 85 && dispersion <= 8 && globalScore >= 88) {
    confidence = 'très élevée';
    confidenceReason =
      'Excellence démontrée sur la théorie, la rétention, la vitesse et les cas d’architecture.';
  }

  const updated: IntelligentReadiness = {
    ...base,
    globalScore,
    confidence,
    confidenceReason,
    dimensions: {
      knowledge: {
        ...base.dimensions.knowledge,
        score: k,
        status: k >= 80 ? 'optimal' : k >= 72 ? 'vigilance' : 'alerte',
      },
      retention: {
        ...base.dimensions.retention,
        score: r,
        status: r >= 80 ? 'optimal' : r >= 72 ? 'vigilance' : 'alerte',
      },
      speed: {
        ...base.dimensions.speed,
        score: s,
        status: s >= 75 ? 'optimal' : s >= 68 ? 'vigilance' : 'alerte',
      },
      practice: {
        ...base.dimensions.practice,
        score: p,
        status: p >= 80 ? 'optimal' : p >= 70 ? 'vigilance' : 'alerte',
      },
      mockExams: {
        ...base.dimensions.mockExams,
        score: m,
        status: m >= 80 ? 'optimal' : m >= 70 ? 'vigilance' : 'alerte',
      },
    },
    asymmetryAlert:
      dispersion >= 11
        ? {
            highest: `${maxScore}%`,
            lowest: `${minScore}%`,
            gap: dispersion,
            warning: `Écart de ${dispersion} points entre votre point fort et vos points d'effort.`,
            remedyRecommendation:
              "Renforcer l'axe le plus faible (Cas pratiques ou Vitesse) pour stabiliser l'admissibilité.",
          }
        : undefined,
  };

  return updated;
}

export function loadStoredReadiness(certId: string): IntelligentReadiness {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_READINESS}_${certId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.dimensions) return parsed;
    }
  } catch {
    // fallback
  }
  return DEFAULT_READINESS_BY_CERT[certId] || DEFAULT_READINESS_BY_CERT['cca-p200'];
}

export function saveStoredReadiness(readiness: IntelligentReadiness): void {
  try {
    localStorage.setItem(
      `${STORAGE_KEY_READINESS}_${readiness.certId}`,
      JSON.stringify(readiness)
    );
  } catch {
    // ignore
  }
}
