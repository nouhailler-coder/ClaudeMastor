import React, { useState } from 'react';
import { LAB_WORKSHOPS } from '../data/mockData';
import { LabWorkshop } from '../types';
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
  Code2
} from 'lucide-react';

export const LabPracticeView: React.FC = () => {
  const [activeCodeTab, setActiveCodeTab] = useState<'system' | 'tools' | 'payload'>('system');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationRunCount, setSimulationRunCount] = useState(1);
  const [showSavingsModal, setShowSavingsModal] = useState(false);

  // Interactive Checklist
  const [checklist, setChecklist] = useState([
    {
      id: 'c1',
      text: 'Placer le marqueur cache_control sur le dernier élément du tableau tools',
      completed: true,
    },
    {
      id: 'c2',
      text: 'Configurer disable_parallel_tool_use: false dans le bloc tool_choice',
      completed: true,
    },
    {
      id: 'c3',
      text: 'Garantir que les propriétés obligatoires soient déclarées dans le tableau required',
      completed: false,
    },
  ]);

  const toggleChecklist = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const completedCount = checklist.filter((i) => i.completed).length;
  const architectScore = 100 + completedCount * 20;

  // Code snippets for each tab
  const codeSystem = `import anthropic

client = anthropic.Anthropic()

system_prompt_analyst = """
Vous êtes un analyste financier senior spécialisé dans l'audit de bilans.
Respectez scrupuleusement la nomenclature IFRS et délimitez chaque section 
avec les balises XML canoniques <analysis> et <sources>.
Ne générez aucune supposition sans citation directe.
"""

# Définition du prompt système avec point d'ancrage cache éphémère
system_block = [
    {
        "type": "text",
        "text": system_prompt_analyst,
        "cache_control": {"type": "ephemeral"} # TTL: 5 min
    }
]`;

  const codeTools = `tools_manifest = [
    {
        "name": "fetch_stock_feed",
        "description": "Récupère les cours temps réel et le volume carnet d'ordres.",
        "input_schema": {
            "type": "object",
            "properties": {
                "ticker": {"type": "string", "description": "Symbole boursier (ex: AAPL)"}
            },
            "required": ["ticker"]
        }
    },
    {
        "name": "extract_pdf_statement",
        "description": "Extrait la table de flux de trésorerie du rapport trimestriel.",
        "input_schema": {
            "type": "object",
            "properties": {
                "quarter": {"type": "string", "enum": ["Q1", "Q2", "Q3", "Q4"]},
                "year": {"type": "integer"}
            },
            "required": ["quarter", "year"]
        },
        # Marqueur de cache posé sur le DERNIER outil pour englober la liste
        "cache_control": {"type": "ephemeral"}
    }
]`;

  const codePayload = `response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    system=system_block,
    tools=tools_manifest,
    tool_choice={"type": "auto", "disable_parallel_tool_use": False},
    messages=[
        {
            "role": "user",
            "content": "Analyse les performances financières de Tesla au Q3 2024 et croise avec le cours actuel."
        }
    ]
)`;

  const handleSimulateCall = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      setSimulationRunCount((prev) => prev + 1);
    }, 700);
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Top Breadcrumb & Runtime Specs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-[#eae7e7]">
        <div className="flex items-center gap-2 text-[12px] font-mono text-[#55433d] flex-wrap">
          <span>Domaine d'Examen III</span>
          <span className="text-[#dbc1b9]">/</span>
          <span>Ingénierie Contextuelle & Caching</span>
          <span className="text-[#dbc1b9]">/</span>
          <span className="text-[#99462a] font-bold">Lab #04</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f0eded] text-[11px] font-mono text-[#1c1b1b] border border-[#eae7e7]">
            <Cpu className="w-3.5 h-3.5 text-[#715a3e]" />
            <span>claude-3-5-sonnet-20241022</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdbd0] text-[11px] font-mono text-[#7a2f15] font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Score d'Architecte : {architectScore} / 150 pts</span>
          </div>
        </div>
      </div>

      {/* Workshop Hero Header */}
      <section className="bg-[#f6f3f2] rounded-3xl p-6 mb-6 border border-[#eae7e7] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col max-w-2xl">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[10px] bg-[#99462a] text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              Atelier Pratique #4
            </span>
            <span className="font-mono text-[11px] text-[#88726c]">
              Durée estimée : 20 min
            </span>
          </div>
          <h1 className="font-headline text-[24px] lg:text-[28px] text-[#1c1b1b] font-bold leading-snug">
            Débogage & Optimisation de Prompt Caching avec Tool Calling
          </h1>
          <p className="text-[14px] text-[#55433d] mt-1">
            Concevez une orchestration Claude Messages API à haute vélocité combinant un point de cache sur les définitions d'outils et l'émission parallèle de requêtes fonctionnelles.
          </p>
        </div>

        {/* Target Metrics Pill Badges */}
        <div className="flex flex-row md:flex-col gap-3 shrink-0">
          <div className="bg-white p-3 rounded-xl border border-[#eae7e7] shadow-xs flex items-center gap-3">
            <TrendingDown className="w-5 h-5 text-[#99462a]" />
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-[#88726c] uppercase">Gain Latence Visé</span>
              <span className="font-mono text-[14px] text-[#99462a] font-bold">-65% TTFT</span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-[#eae7e7] shadow-xs flex items-center gap-3">
            <Layers className="w-5 h-5 text-[#715a3e]" />
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-[#88726c] uppercase">Objectif Cache</span>
              <span className="font-mono text-[14px] text-[#1c1b1b] font-bold">&gt; 85% Hits</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Column IDE Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUMN 1: Specs & Interactive Checklist (3.5 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-[#f6f3f2] rounded-2xl p-5 border border-[#eae7e7] shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b pb-2 border-[#eae7e7]">
              <span className="font-mono text-[11px] text-[#1c1b1b] font-bold uppercase tracking-wider">
                Cahier des Charges (SPEC-302)
              </span>
              <span className="font-mono text-[10px] bg-[#f0eded] text-[#55433d] px-2 py-0.5 rounded">
                Critique
              </span>
            </div>

            <div className="flex flex-col gap-2 text-[13px] text-[#55433d] leading-relaxed">
              <span className="font-semibold text-[#1c1b1b]">Scénario d'Architecture :</span>
              <p>
                Le système d'assistance financière doit appeler simultanément les API boursières et l'extraction de tables financières.
              </p>
            </div>

            {/* Architecture target schema note */}
            <div className="bg-white p-3.5 rounded-xl border border-[#eae7e7] flex flex-col gap-1.5">
              <span className="font-mono text-[11px] text-[#99462a] font-bold">
                Flux Architectural Cible :
              </span>
              <ol className="list-decimal list-inside text-[12px] text-[#55433d] space-y-1">
                <li>Prompt système &amp; outils mis en cache</li>
                <li>Payload utilisateur injecté</li>
                <li>Émission <code className="bg-[#f0eded] px-1 rounded">tool_use</code> multiple en 1 RT</li>
              </ol>
            </div>

            {/* Interactive Checklist */}
            <div className="flex flex-col gap-2.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-[#1c1b1b] font-bold uppercase">
                  Checklist de validation
                </span>
                <span className="font-mono text-[11px] text-[#99462a] font-bold">
                  {completedCount} / 3
                </span>
              </div>

              {checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklist(item.id)}
                  className={`p-3 rounded-xl cursor-pointer transition-all flex items-start gap-2.5 border ${
                    item.completed
                      ? 'bg-white border-[#d97757]/40 shadow-xs'
                      : 'bg-white/60 border-[#eae7e7] hover:bg-white'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 ${
                      item.completed ? 'bg-[#99462a] text-white' : 'border border-[#dbc1b9]'
                    }`}
                  >
                    {item.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span className={`text-[12px] leading-snug ${item.completed ? 'text-[#1c1b1b] font-medium' : 'text-[#88726c]'}`}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Official Exam Rule Box */}
            <div className="bg-[#fdddb9]/40 p-3.5 rounded-xl border border-[#e0c29f] text-[12px] text-[#281803] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#715a3e] shrink-0 mt-0.5" />
              <p className="leading-snug">
                <strong>Règle d'Examen :</strong> Le premier token est calculé en ~180ms si le préfixe tools est en cache. Un cache hit garantit un abattement de 90% sur les tokens en lecture.
              </p>
            </div>
          </div>
        </div>

        {/* COLUMN 2: Code Studio (4.5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-[#f6f3f2] rounded-2xl p-5 border border-[#eae7e7] shadow-xs flex flex-col gap-3">
            {/* Tabs */}
            <div className="flex items-center justify-between border-b pb-2 border-[#eae7e7] flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveCodeTab('system')}
                  className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-semibold transition-colors ${
                    activeCodeTab === 'system'
                      ? 'bg-[#1c1b1b] text-white'
                      : 'bg-[#f0eded] text-[#55433d] hover:bg-[#eae7e7]'
                  }`}
                >
                  System Prompt
                </button>
                <button
                  onClick={() => setActiveCodeTab('tools')}
                  className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-semibold transition-colors ${
                    activeCodeTab === 'tools'
                      ? 'bg-[#1c1b1b] text-white'
                      : 'bg-[#f0eded] text-[#55433d] hover:bg-[#eae7e7]'
                  }`}
                >
                  Tools Schema (JSON)
                </button>
                <button
                  onClick={() => setActiveCodeTab('payload')}
                  className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-semibold transition-colors ${
                    activeCodeTab === 'payload'
                      ? 'bg-[#1c1b1b] text-white'
                      : 'bg-[#f0eded] text-[#55433d] hover:bg-[#eae7e7]'
                  }`}
                >
                  Messages Payload
                </button>
              </div>

              <span className="font-mono text-[10px] text-[#88726c]">Python SDK</span>
            </div>

            {/* Code Studio Editor Box */}
            <div className="rounded-xl overflow-hidden bg-[#21201D] text-[#FAF9F5] border border-[#313030] shadow-inner">
              <div className="flex items-center justify-between px-3 py-1.5 bg-[#1A1916] text-[#e5e2e1] text-[11px] font-mono border-b border-[#313030]">
                <span>
                  {activeCodeTab === 'system'
                    ? 'system_configuration.py'
                    : activeCodeTab === 'tools'
                    ? 'tools_manifest.py'
                    : 'execution_stream.py'}
                </span>
                <span className="text-[#d97757]">● Modifié (Prêt)</span>
              </div>
              <pre className="p-4 font-mono text-[11px] lg:text-[12px] leading-relaxed overflow-x-auto text-[#fcf9f8] min-h-[340px] max-h-[460px] overflow-y-auto selection:bg-[#99462a]">
                {activeCodeTab === 'system' && codeSystem}
                {activeCodeTab === 'tools' && codeTools}
                {activeCodeTab === 'payload' && codePayload}
              </pre>
            </div>

            {/* Code Studio Actions */}
            <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
              <button
                onClick={handleSimulateCall}
                disabled={isSimulating}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#99462a] hover:bg-[#7a2f15] text-white font-mono text-[12px] font-bold shadow-xs transition-all flex-1 sm:flex-initial"
              >
                {isSimulating ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Inférence en cours...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Simuler l'appel API Claude</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowSavingsModal(true)}
                className="px-3.5 py-2 rounded-xl bg-[#f0eded] hover:bg-[#eae7e7] text-[#1c1b1b] font-mono text-[11px] font-medium transition-colors border border-[#eae7e7]"
              >
                Calculer l'économie
              </button>

              <button
                onClick={() => alert('Code rétabli à la version initiale')}
                className="p-2 rounded-xl text-[#88726c] hover:bg-[#f0eded]"
                title="Réinitialiser"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* COLUMN 3: Telemetry, Logs & Live Inspector (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-[#f6f3f2] rounded-2xl p-5 border border-[#eae7e7] shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b pb-2 border-[#eae7e7]">
              <span className="font-mono text-[11px] text-[#1c1b1b] font-bold uppercase tracking-wider">
                Console & Télémétrie
              </span>
              <span className="w-2 h-2 rounded-full bg-[#99462a] animate-pulse" />
            </div>

            {/* Anthropic Compliance Badge */}
            <div className="bg-white p-3 rounded-xl border border-[#eae7e7] flex items-center gap-2.5">
              <CheckCircle className="w-5 h-5 text-[#99462a] shrink-0" />
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-[#88726c] uppercase">Validateur de Conformité</span>
                <span className="text-[12px] font-bold text-[#1c1b1b]">Conforme aux directives Anthropic</span>
              </div>
            </div>

            {/* Input tokens breakdown */}
            <div className="bg-white p-3 rounded-xl border border-[#eae7e7] flex flex-col gap-1.5">
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-[#88726c]">Tokens Input Total :</span>
                <span className="font-bold text-[#1c1b1b]">8 420 tokens</span>
              </div>
              <div className="w-full bg-[#e5e2e1] h-2 rounded-full overflow-hidden flex">
                <div className="bg-[#99462a] h-full" style={{ width: '85%' }} title="Cache Hit (7 200 tks)" />
                <div className="bg-[#fc8d66] h-full" style={{ width: '15%' }} title="Nouveaux tokens (1 220 tks)" />
              </div>
              <div className="flex justify-between font-mono text-[10px] text-[#55433d] mt-0.5">
                <span className="text-[#99462a] font-bold">Cache : 7 200 tks (85%)</span>
                <span>Nouveaux : 1 220 tks</span>
              </div>
              <span className="font-mono text-[10px] text-[#99462a] bg-[#ffdbd0] px-2 py-0.5 rounded text-center font-bold mt-1">
                Économie 90% sur cache
              </span>
            </div>

            {/* Output tokens & Latency */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white p-2.5 rounded-xl border border-[#eae7e7] flex flex-col">
                <span className="font-mono text-[9px] text-[#88726c] uppercase">Tokens Output</span>
                <span className="font-mono text-[13px] font-bold text-[#1c1b1b]">340 tokens</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-[#eae7e7] flex flex-col">
                <span className="font-mono text-[9px] text-[#88726c] uppercase">Latence TTFT</span>
                <span className="font-mono text-[13px] font-bold text-[#99462a]">1.12s</span>
                <span className="font-mono text-[9px] text-[#88726c]">-2.4s vs non-caché</span>
              </div>
            </div>

            {/* Payload Inspector (Parallel Tool Calling) */}
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[10px] text-[#88726c] uppercase font-bold">
                Payload Inspecteur tool_use
              </span>
              <div className="bg-[#21201D] text-[#FAF9F5] p-3 rounded-xl font-mono text-[10px] leading-relaxed overflow-x-auto max-h-[160px] overflow-y-auto border border-[#313030]">
                {`[
  {
    "type": "tool_use",
    "id": "toolu_01A9x...",
    "name": "fetch_stock_feed",
    "input": {"ticker": "TSLA"}
  },
  {
    "type": "tool_use",
    "id": "toolu_02B8z...",
    "name": "extract_pdf_statement",
    "input": {"quarter": "Q3", "year": 2024}
  }
]`}
              </div>
            </div>

            {/* Simulated Model Stream Output */}
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[10px] text-[#88726c] uppercase font-bold">
                Sortie Modèle (Streamed)
              </span>
              <div className="bg-white p-3 rounded-xl border border-[#eae7e7] text-[11px] text-[#55433d] italic leading-snug">
                "&lt;analysis&gt; Exécution conjointe des deux outils déclenchée. Données boursières et flux de trésorerie consolidés &lt;/analysis&gt;"
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Workshops Section */}
      <section className="mt-12 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#99462a] font-bold">
              Catalogue Pratique
            </span>
            <h2 className="font-headline text-[24px] text-[#1c1b1b]">
              Bibliothèque des Ateliers Pratiques Recommandés
            </h2>
          </div>
          <span className="font-mono text-[11px] text-[#88726c]">
            4 ateliers alignés sur le syllabus
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {LAB_WORKSHOPS.map((workshop) => (
            <div
              key={workshop.id}
              className="bg-[#f6f3f2] p-5 rounded-2xl border border-[#eae7e7] shadow-xs flex flex-col justify-between hover:border-[#dbc1b9] transition-all group cursor-pointer"
              onClick={() => alert(`Lancement de l'environnement : ${workshop.title}`)}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] bg-[#99462a] text-white px-2 py-0.5 rounded font-bold">
                    {workshop.code}
                  </span>
                  <span className="font-mono text-[10px] bg-[#f0eded] text-[#55433d] px-2 py-0.5 rounded">
                    {workshop.level}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#715a3e] uppercase font-semibold">
                  {workshop.category}
                </span>
                <h3 className="font-headline text-[16px] text-[#1c1b1b] font-semibold leading-snug group-hover:text-[#99462a] transition-colors">
                  {workshop.title}
                </h3>
                <p className="text-[12px] text-[#55433d] leading-relaxed">
                  {workshop.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#eae7e7]">
                <span className="font-mono text-[11px] text-[#99462a] font-bold group-hover:underline">
                  Ouvrir l'atelier
                </span>
                <ArrowRight className="w-4 h-4 text-[#99462a] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Savings calculation dialog */}
      {showSavingsModal && (
        <div className="fixed inset-0 bg-[#1c1b1b]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#f6f3f2] max-w-md w-full rounded-2xl p-6 border border-[#eae7e7] shadow-xl flex flex-col gap-4">
            <h3 className="font-headline text-[20px] text-[#1c1b1b] font-semibold">
              Calculateur d'Économie TCO (Prompt Caching)
            </h3>
            <p className="text-[13px] text-[#55433d]">
              Hypothèse : 50 000 requêtes / mois sur un corpus de 14 200 tokens avec 92% de hit rate.
            </p>
            <div className="bg-white p-4 rounded-xl border border-[#eae7e7] flex flex-col gap-2 font-mono text-[12px]">
              <div className="flex justify-between">
                <span>Sans Prompt Caching :</span>
                <span className="font-bold text-[#ba1a1a]">~2 130 $ / mois</span>
              </div>
              <div className="flex justify-between">
                <span>Avec Prompt Caching Anthropic :</span>
                <span className="font-bold text-[#99462a]">~385 $ / mois</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#eae7e7] text-[13px]">
                <span className="font-bold">Économie mensuelle nette :</span>
                <span className="font-bold text-[#99462a]">-81.9% (1 745 $)</span>
              </div>
            </div>
            <button
              onClick={() => setShowSavingsModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#99462a] text-white font-mono text-[12px] font-semibold"
            >
              Fermer l'estimation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
