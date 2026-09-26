import React, { useState } from 'react';
import { TabType } from '../types';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Award,
  Download,
  Share2,
  Clock,
  Zap,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  PlusCircle,
  Check
} from 'lucide-react';

interface ScorecardViewProps {
  onStartRetest: () => void;
  onNavigateTab: (tab: TabType) => void;
}

export const ScorecardView: React.FC<ScorecardViewProps> = ({
  onStartRetest,
  onNavigateTab,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'incorrect' | 'flagged'>('incorrect');
  const [expandedQuestionIds, setExpandedQuestionIds] = useState<Record<number, boolean>>({
    42: true,
    18: false,
    27: false,
  });
  const [savedToNotebook, setSavedToNotebook] = useState<Record<number, boolean>>({});

  const toggleExpand = (id: number) => {
    setExpandedQuestionIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSaveNotebook = (id: number) => {
    setSavedToNotebook((prev) => ({ ...prev, [id]: true }));
  };

  const domainScores = [
    {
      code: 'DOMAINE 01',
      title: 'Architecture LLM, Tokenizer & Context Windows',
      score: '94%',
      ratio: '17 / 18 questions',
      status: 'Maîtrisé',
      statusColor: 'text-[#99462a]',
      barColor: 'bg-[#99462a]',
      width: '94%',
    },
    {
      code: 'DOMAINE 02',
      title: 'Prompt Engineering Avancé & Balisage XML',
      score: '88%',
      ratio: '14 / 16 questions',
      status: 'Maîtrisé',
      statusColor: 'text-[#99462a]',
      barColor: 'bg-[#99462a]',
      width: '88%',
    },
    {
      code: 'DOMAINE 03',
      title: 'Tool Use, JSON Schema & Workflows Multi-Agents',
      score: '80%',
      ratio: '8 / 10 questions',
      status: 'Maîtrisé',
      statusColor: 'text-[#99462a]',
      barColor: 'bg-[#99462a]',
      width: '80%',
    },
    {
      code: 'DOMAINE 04',
      title: 'Sécurité, Constitutional AI & Garde-fous',
      score: '85%',
      ratio: '6 / 7 questions',
      status: 'Maîtrisé',
      statusColor: 'text-[#99462a]',
      barColor: 'bg-[#99462a]',
      width: '85%',
    },
    {
      code: 'DOMAINE 05',
      title: 'Optimisation Coûts, Latence & Batching API',
      score: '66%',
      ratio: '6 / 9 questions',
      status: 'Attention requise',
      statusColor: 'text-[#ba1a1a]',
      barColor: 'bg-[#ba1a1a]',
      width: '66%',
    },
  ];

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Top Banner: Exam Results & Candidate Attestation */}
      <section className="bg-[#f6f3f2] rounded-3xl p-6 lg:p-8 mb-8 border border-[#eae7e7] shadow-xs flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-mono text-[11px] bg-[#99462a] text-white px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                Résultat : Admissibilité Confirmée (PASS)
              </span>
              <span className="font-mono text-[12px] text-[#55433d]">
                Simulation Blanche #04 • 14 Octobre 2024
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <h1 className="font-headline text-[48px] lg:text-[56px] text-[#1c1b1b] font-bold tracking-tight leading-none">
                842
              </h1>
              <span className="font-headline text-[26px] text-[#88726c] font-normal">
                / 1000 pts
              </span>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <Award className="w-5 h-5 text-[#99462a]" />
              <span className="text-[14px] text-[#55433d] font-medium">
                <strong className="text-[#99462a] font-semibold">+122 points</strong> au-dessus du seuil de qualification officiel (720 pts requis).
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={onStartRetest}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#99462a] hover:bg-[#7a2f15] text-white font-mono text-[12px] font-bold shadow-xs transition-all flex-1 sm:flex-initial"
              type="button"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Lancer un quiz ciblé sur mes 9 erreurs</span>
            </button>

            <button
              onClick={() => alert('Téléchargement de votre rapport complet PDF (Certificat CCA-F-842)...')}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#f0eded] hover:bg-[#eae7e7] text-[#1c1b1b] font-mono text-[12px] font-medium transition-colors border border-[#eae7e7]"
              type="button"
            >
              <Download className="w-4 h-4 text-[#88726c]" />
              <span>Rapport PDF</span>
            </button>

            <button
              onClick={() => alert('Lien de certification prêt à être partagé sur LinkedIn !')}
              className="p-3 rounded-xl bg-[#f0eded] hover:bg-[#eae7e7] text-[#55433d] transition-colors border border-[#eae7e7]"
              title="Partager mon attestation"
              type="button"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Performance Telemetry Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#eae7e7]">
          <div className="bg-[#f0eded] p-4 rounded-2xl flex flex-col border border-[#eae7e7]">
            <span className="font-mono text-[11px] text-[#88726c] uppercase">
              Précision globale
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-headline text-[24px] text-[#1c1b1b] font-bold">
                85.0%
              </span>
              <span className="font-mono text-[12px] text-[#88726c]">
                (51/60 questions)
              </span>
            </div>
          </div>

          <div className="bg-[#f0eded] p-4 rounded-2xl flex flex-col border border-[#eae7e7]">
            <span className="font-mono text-[11px] text-[#88726c] uppercase">
              Temps utilisé
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-headline text-[24px] text-[#1c1b1b] font-bold">
                68m 14s
              </span>
              <span className="font-mono text-[12px] text-[#88726c]">
                (sur 90m allouées)
              </span>
            </div>
          </div>

          <div className="bg-[#f0eded] p-4 rounded-2xl flex flex-col border border-[#eae7e7]">
            <span className="font-mono text-[11px] text-[#88726c] uppercase">
              Cadence moyenne
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-headline text-[24px] text-[#1c1b1b] font-bold">
                1m 08s
              </span>
              <span className="font-mono text-[12px] text-[#88726c]">
                / question (très fluide)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2-Column Diagnostic Framework */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-10">
        {/* LEFT 7 COLS: Domain Comparative Analysis */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex flex-col">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#99462a] font-bold">
              Ventilation par compétence
            </span>
            <h2 className="font-headline text-[24px] text-[#1c1b1b]">
              Analyse comparée des 5 Domaines du Syllabus
            </h2>
          </div>

          <div className="bg-[#f6f3f2] rounded-2xl p-6 border border-[#eae7e7] shadow-xs flex flex-col gap-5">
            {domainScores.map((item, idx) => (
              <div key={idx} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#f0eded] text-[#55433d] font-bold">
                      {item.code}
                    </span>
                    <span className="font-headline text-[16px] text-[#1c1b1b] font-semibold">
                      {item.title}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`font-mono text-[13px] font-bold ${item.statusColor}`}>
                      {item.score}
                    </span>
                    <span className="font-mono text-[11px] text-[#88726c]">
                      ({item.ratio})
                    </span>
                  </div>
                </div>

                <div className="w-full bg-[#eae7e7] h-2 rounded-full overflow-hidden">
                  <div
                    className={`${item.barColor} h-full rounded-full transition-all duration-700`}
                    style={{ width: item.width }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT 5 COLS: AI Prescription & Actionable Revision Plan */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex flex-col">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#715a3e] font-bold">
              Recommandations personnalisées
            </span>
            <h2 className="font-headline text-[24px] text-[#1c1b1b]">
              Prescription IA / Plan de Révision Immédiat
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {/* Action 1 */}
            <div className="bg-[#f6f3f2] rounded-2xl p-5 border border-[#eae7e7] shadow-xs flex flex-col gap-2.5 hover:border-[#dbc1b9] transition-all">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] bg-[#ffdad6] text-[#93000a] px-2 py-0.5 rounded font-bold">
                  Domaine 05 • Priorité Haute
                </span>
                <span className="font-mono text-[11px] text-[#88726c]">~5 min</span>
              </div>
              <h3 className="font-headline text-[17px] text-[#1c1b1b] font-semibold leading-snug">
                Revoir le Prompt Caching sur Corpus & Documentation Statique
              </h3>
              <p className="text-[13px] text-[#55433d] leading-relaxed">
                Relire les règles d'abattement de 90% sur tokens de lecture et la politique TTL de 5 minutes.
              </p>
              <button
                onClick={() => onNavigateTab('lab')}
                className="mt-1 font-mono text-[12px] text-[#99462a] hover:underline flex items-center gap-1.5 font-bold"
              >
                <span>Lire la fiche mémo (5 min)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Action 2 */}
            <div className="bg-[#f6f3f2] rounded-2xl p-5 border border-[#eae7e7] shadow-xs flex flex-col gap-2.5 hover:border-[#dbc1b9] transition-all">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] bg-[#f0eded] text-[#55433d] px-2 py-0.5 rounded font-bold">
                  Domaine 03 • Pratique
                </span>
                <span className="font-mono text-[11px] text-[#88726c]">~15 min</span>
              </div>
              <h3 className="font-headline text-[17px] text-[#1c1b1b] font-semibold leading-snug">
                Sécuriser la parallélisation d'appels d'outils simultanés
              </h3>
              <p className="text-[13px] text-[#55433d] leading-relaxed">
                Pratiquer le retour d'arguments sous format JSON Schema strict avec required fields.
              </p>
              <button
                onClick={() => onNavigateTab('lab')}
                className="mt-1 font-mono text-[12px] text-[#99462a] hover:underline flex items-center gap-1.5 font-bold"
              >
                <span>Lancer le Lab #04 (15 min)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Action 3 */}
            <div className="bg-[#f6f3f2] rounded-2xl p-5 border border-[#eae7e7] shadow-xs flex flex-col gap-2.5 hover:border-[#dbc1b9] transition-all">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] bg-[#f0eded] text-[#55433d] px-2 py-0.5 rounded font-bold">
                  Domaine 05 • Quiz
                </span>
                <span className="font-mono text-[11px] text-[#88726c]">~7 min</span>
              </div>
              <h3 className="font-headline text-[17px] text-[#1c1b1b] font-semibold leading-snug">
                Batch API : Délais et garanties de livraison
              </h3>
              <p className="text-[13px] text-[#55433d] leading-relaxed">
                Approfondir le cycle asynchrone 24h et les codes HTTP de complétion.
              </p>
              <button
                onClick={onStartRetest}
                className="mt-1 font-mono text-[12px] text-[#99462a] hover:underline flex items-center gap-1.5 font-bold"
              >
                <span>Quiz flash 5 Qs (7 min)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Question-by-Question Granular Review */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#eae7e7]">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#99462a] font-bold">
              Audit granularisé
            </span>
            <h2 className="font-headline text-[24px] text-[#1c1b1b]">
              Revue détaillée des questions
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-medium transition-colors ${
                activeFilter === 'all'
                  ? 'bg-[#1c1b1b] text-white'
                  : 'bg-[#f0eded] text-[#55433d] hover:bg-[#eae7e7]'
              }`}
            >
              Toutes (60)
            </button>
            <button
              onClick={() => setActiveFilter('incorrect')}
              className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-medium transition-colors ${
                activeFilter === 'incorrect'
                  ? 'bg-[#ba1a1a] text-white font-bold'
                  : 'bg-[#ffdad6] text-[#93000a] hover:bg-[#ffcdd2]'
              }`}
            >
              Incorrectes (9)
            </button>
            <button
              onClick={() => setActiveFilter('flagged')}
              className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-medium transition-colors ${
                activeFilter === 'flagged'
                  ? 'bg-[#715a3e] text-white font-bold'
                  : 'bg-[#fdddb9] text-[#281803] hover:bg-[#e0c29f]'
              }`}
            >
              Marquées (6)
            </button>
          </div>
        </div>

        {/* Featured Detailed Question: Question 42 */}
        <div className="bg-[#f6f3f2] rounded-2xl p-6 border border-[#eae7e7] shadow-xs flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#ffdad6] text-[#93000a] flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[11px] font-bold text-[#ba1a1a]">
                    Incorrecte
                  </span>
                  <span className="text-[#88726c]">•</span>
                  <span className="font-mono text-[11px] text-[#55433d]">
                    Domaine 05 : Coûts, Latence & Batching API
                  </span>
                </div>
                <h3 className="font-headline text-[19px] text-[#1c1b1b] font-semibold mt-1">
                  Question 42 : Prompt Caching sur Corpus Volumineux
                </h3>
              </div>
            </div>

            <button
              onClick={() => toggleExpand(42)}
              className="p-1.5 rounded-lg text-[#88726c] hover:bg-[#f0eded]"
            >
              {expandedQuestionIds[42] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          {expandedQuestionIds[42] && (
            <div className="flex flex-col gap-4 pt-2">
              <p className="text-[14px] text-[#1c1b1b] leading-relaxed">
                Vous concevez un pipeline d'assistance documentaire analysant un corpus juridique statique de 140 000 tokens utilisé par 50 juristes simultanément. Quelle configuration d'API Anthropic garantit la latence au premier token la plus basse tout en réduisant le coût de calcul de manière optimale ?
              </p>

              {/* Your answer vs Correct Answer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Your wrong answer */}
                <div className="bg-white p-4 rounded-xl border border-[#ffdad6] flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[#ba1a1a]">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span className="font-mono text-[11px] font-bold uppercase">
                      Votre réponse : Choix B
                    </span>
                  </div>
                  <p className="text-[13px] text-[#1c1b1b] leading-snug">
                    Diviser le corpus en 14 chunks de 10 000 tokens dans un vector store pgvector et envoyer les 3 meilleurs passages via l'API standard sans cache.
                  </p>
                  <span className="font-mono text-[11px] text-[#ba1a1a]">
                    Entraîne une perte de contexte transversal des clauses juridiques et ne tire pas profit de la fenêtre de 200k.
                  </span>
                </div>

                {/* Correct answer */}
                <div className="bg-white p-4 rounded-xl border border-[#dbc1b9] flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[#99462a]">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span className="font-mono text-[11px] font-bold uppercase">
                      Bonne réponse : Choix D
                    </span>
                  </div>
                  <p className="text-[13px] text-[#1c1b1b] leading-snug">
                    Placer l'intégralité du corpus dans le System Prompt précédé du marqueur cache_control: {"{\"type\": \"ephemeral\"}"}, permettant un abattement de 90% sur les tokens en lecture et une latence divisée par 4.
                  </p>
                  <span className="font-mono text-[11px] text-[#99462a]">
                    Amortit le surcoût d'écriture dès la 2e requête dans la fenêtre TTL de 5 minutes.
                  </span>
                </div>
              </div>

              {/* Underlying Architecture Principle */}
              <div className="bg-[#f0eded] p-4 rounded-xl border border-[#eae7e7] flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[#715a3e]">
                  <BookOpen className="w-4 h-4" />
                  <span className="font-mono text-[11px] uppercase tracking-wider font-bold">
                    Règle d'Architecture Sous-Jacente
                  </span>
                </div>
                <p className="text-[13px] text-[#55433d] leading-relaxed">
                  Le modèle Claude 3.5 Sonnet prend en charge le Prompt Caching à partir de 1 024 tokens. Pour un corpus de 140 000 tokens interrogé en continu par 50 utilisateurs, la création du cache initial coûte 1.25x le prix standard d'écriture, mais toutes les lectures suivantes durant la fenêtre TTL de 5 minutes bénéficient d'une réduction de 90% du coût d'input et d'un gain de TTFT massif de l'ordre de 80%.
                </p>
              </div>

              {/* Source link & Action */}
              <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
                <a
                  href="https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching"
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[11px] text-[#99462a] hover:underline flex items-center gap-1.5"
                >
                  <span>Anthropic Documentation - Prompt Caching Best Practices (v2.1)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => handleSaveNotebook(42)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#eae7e7] font-mono text-[11px] text-[#1c1b1b] border border-[#eae7e7] transition-colors"
                >
                  {savedToNotebook[42] ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#99462a]" />
                      <span>Ajouté au carnet</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-3.5 h-3.5 text-[#88726c]" />
                      <span>Dans mon carnet d'erreurs</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Additional Accordion Question: Question 18 */}
        <div className="bg-[#f6f3f2] rounded-2xl p-5 border border-[#eae7e7] shadow-xs flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#ffdad6] text-[#93000a] flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[11px] font-bold text-[#ba1a1a]">
                    Incorrecte
                  </span>
                  <span className="text-[#88726c]">•</span>
                  <span className="font-mono text-[11px] text-[#55433d]">
                    Domaine 03 : Tool Use & Function Calling
                  </span>
                </div>
                <h3 className="font-headline text-[18px] text-[#1c1b1b] font-semibold mt-0.5">
                  Question 18 : Validation Schéma Strict & Paramètres Requis
                </h3>
              </div>
            </div>

            <button
              onClick={() => toggleExpand(18)}
              className="p-1.5 rounded-lg text-[#88726c] hover:bg-[#f0eded]"
            >
              {expandedQuestionIds[18] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          {expandedQuestionIds[18] && (
            <div className="flex flex-col gap-3 pt-2 text-[13px] text-[#55433d]">
              <p>
                Vous développez un agent de validation comptable connecté à une API SAP via function calling sur Claude 3.5 Sonnet. Comment garantir que le modèle fournisse obligatoirement tous les champs critiques sans omettre les paramètres facultatifs ?
              </p>
              <div className="p-3 bg-white rounded-xl border border-[#eae7e7]">
                <strong className="text-[#99462a]">Solution attendue :</strong> Déclarer les propriétés indispensables dans le tableau <code className="bg-[#f0eded] px-1 py-0.5 rounded text-[#1c1b1b]">required</code> du bloc <code className="bg-[#f0eded] px-1 py-0.5 rounded text-[#1c1b1b]">input_schema</code> sous JSON Schema v4 strict.
              </div>
            </div>
          )}
        </div>

        {/* Additional Accordion Question: Question 27 */}
        <div className="bg-[#f6f3f2] rounded-2xl p-5 border border-[#eae7e7] shadow-xs flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#fdddb9] text-[#281803] flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 text-[#715a3e]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[11px] font-bold text-[#715a3e]">
                    Marquée & Validée
                  </span>
                  <span className="text-[#88726c]">•</span>
                  <span className="font-mono text-[11px] text-[#55433d]">
                    Domaine 02 : Prompt Engineering Avancé
                  </span>
                </div>
                <h3 className="font-headline text-[18px] text-[#1c1b1b] font-semibold mt-0.5">
                  Question 27 : Balisage XML Canonique & Délimiteurs Sémantiques
                </h3>
              </div>
            </div>

            <button
              onClick={() => toggleExpand(27)}
              className="p-1.5 rounded-lg text-[#88726c] hover:bg-[#f0eded]"
            >
              {expandedQuestionIds[27] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          {expandedQuestionIds[27] && (
            <div className="flex flex-col gap-3 pt-2 text-[13px] text-[#55433d]">
              <p>
                L'utilisation de balises XML canoniques distinctes (<code className="bg-[#f0eded] px-1 py-0.5 rounded">&lt;instructions&gt;</code>, <code className="bg-[#f0eded] px-1 py-0.5 rounded">&lt;context&gt;</code>) permet d'isoler hermétiquement les instructions des données potentiellement non fiables.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
