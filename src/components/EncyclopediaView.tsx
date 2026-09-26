import React, { useState, useMemo, useEffect } from 'react';
import { ENCYCLOPEDIA_ARTICLES } from '../data/encyclopediaData';
import { EncyclopediaArticle } from '../types';
import {
  BookOpen,
  Search,
  ExternalLink,
  Flame,
  CheckCircle,
  AlertTriangle,
  Code,
  Layers,
  ArrowRight,
  BookMarked,
  Sparkles,
  Filter,
  Check
} from 'lucide-react';

interface EncyclopediaViewProps {
  initialArticleId?: string | null;
  onOpenFlashcard: (cardId: number) => void;
}

export const EncyclopediaView: React.FC<EncyclopediaViewProps> = ({
  initialArticleId,
  onOpenFlashcard,
}) => {
  const [selectedArticleId, setSelectedArticleId] = useState<string>(
    initialArticleId || ENCYCLOPEDIA_ARTICLES[0].id
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<number | 'all'>('all');
  const [copiedCode, setCopiedCode] = useState(false);

  // Update selection if prop changes
  useEffect(() => {
    if (initialArticleId) {
      setSelectedArticleId(initialArticleId);
    }
  }, [initialArticleId]);

  // Filter articles
  const filteredArticles = useMemo(() => {
    let list = [...ENCYCLOPEDIA_ARTICLES];

    if (selectedDomain !== 'all') {
      list = list.filter((a) => a.domainId === selectedDomain);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.term.toLowerCase().includes(q) ||
          (a.acronym && a.acronym.toLowerCase().includes(q)) ||
          a.shortDefinition.toLowerCase().includes(q) ||
          a.detailedExplanation.toLowerCase().includes(q) ||
          a.domainTitle.toLowerCase().includes(q)
      );
    }

    return list;
  }, [selectedDomain, searchQuery]);

  const currentArticle =
    ENCYCLOPEDIA_ARTICLES.find((a) => a.id === selectedArticleId) ||
    filteredArticles[0] ||
    ENCYCLOPEDIA_ARTICLES[0];

  const handleCopyCode = (snippet?: string) => {
    if (!snippet) return;
    navigator.clipboard.writeText(snippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const domainTabs = [
    { id: 'all' as const, label: 'Tous' },
    { id: 1, label: '01. Architecture' },
    { id: 2, label: '02. Prompt & XML' },
    { id: 3, label: '03. Tool Use & MCP' },
    { id: 4, label: '04. Sécurité' },
    { id: 5, label: '05. FinOps & Latence' },
  ];

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Header Section */}
      <section className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="font-mono text-[10px] bg-[#99462a] text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Référentiel Technique & Traités d'Architecture
            </span>
            <span className="font-mono text-[11px] text-[#88726c]">
              • Connecté aux 100 Flashcards du Syllabus
            </span>
          </div>
          <h1 className="font-headline text-[30px] lg:text-[36px] text-[#1c1b1b] font-bold tracking-tight">
            Glossaire & Encyclopédie d'Architecture IA
          </h1>
          <p className="text-[14px] sm:text-[15px] text-[#55433d] mt-0.5 max-w-3xl">
            Concepts fondamentaux, traités détaillés, schémas de flux et règles de conception certifiées par Anthropic.
          </p>
        </div>
      </section>

      {/* Domain Quick Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {domainTabs.map((tab) => {
          const isSelected = selectedDomain === tab.id;
          return (
            <button
              key={String(tab.id)}
              onClick={() => setSelectedDomain(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-mono text-[12px] whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-[#99462a] text-white border-[#99462a] font-bold shadow-xs'
                  : 'bg-white hover:bg-[#f0eded] text-[#55433d] border-[#eae7e7]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Master List / Lexicon */}
        <div className="lg:col-span-4 bg-[#f6f3f2] rounded-3xl p-4 border border-[#eae7e7] flex flex-col gap-3 shadow-xs">
          {/* Search Bar */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-[#88726c] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Chercher un concept, acronyme..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#eae7e7] text-[13px] text-[#1c1b1b] placeholder-[#88726c] focus:outline-none focus:border-[#99462a]"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-[#88726c] px-1">
            <span>{filteredArticles.length} traités d'architecture</span>
            <span>Index alphabétique</span>
          </div>

          {/* Articles Scrollable List */}
          <div className="flex flex-col gap-2 max-h-[680px] overflow-y-auto pr-1">
            {filteredArticles.map((article) => {
              const isSelected = article.id === currentArticle.id;
              return (
                <div
                  key={article.id}
                  onClick={() => setSelectedArticleId(article.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-white border-[#99462a] shadow-sm'
                      : 'bg-white/70 hover:bg-white border-[#eae7e7]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-[#ffdbd0] text-[#7a2f15] font-bold uppercase tracking-wider">
                      {article.domainCode}
                    </span>
                    {article.acronym && (
                      <span className="font-mono text-[10px] text-[#88726c] bg-[#f0eded] px-1.5 py-0.5 rounded">
                        {article.acronym}
                      </span>
                    )}
                  </div>

                  <h3
                    className={`font-headline text-[15px] font-semibold leading-snug ${
                      isSelected ? 'text-[#99462a]' : 'text-[#1c1b1b]'
                    }`}
                  >
                    {article.term}
                  </h3>

                  <p className="text-[12px] text-[#55433d] line-clamp-2 leading-relaxed">
                    {article.shortDefinition}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-[#f0eded] font-mono text-[10px] text-[#88726c]">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3 text-[#99462a]" />
                      <span>{article.relatedFlashcardIds.length} flashcards</span>
                    </span>
                    {isSelected && (
                      <span className="text-[#99462a] font-bold flex items-center gap-0.5">
                        Actif <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredArticles.length === 0 && (
              <div className="p-8 text-center text-[13px] text-[#88726c]">
                Aucun traité ne correspond à votre recherche.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Deep-Dive Article Reader */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <article className="bg-[#f6f3f2] rounded-3xl p-6 sm:p-8 border border-[#eae7e7] shadow-sm flex flex-col gap-6">
            {/* Top Article Metadata */}
            <div className="flex flex-col gap-2 border-b border-[#eae7e7] pb-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[#ffdbd0] text-[#7a2f15] font-bold uppercase tracking-wider">
                    {currentArticle.domainCode}
                  </span>
                  <span className="font-mono text-[12px] text-[#55433d]">
                    {currentArticle.domainTitle}
                  </span>
                </div>
                {currentArticle.acronym && (
                  <span className="font-mono text-[12px] bg-white border border-[#eae7e7] px-2.5 py-0.5 rounded-lg text-[#1c1b1b] font-bold">
                    Acronyme : {currentArticle.acronym}
                  </span>
                )}
              </div>

              <h2 className="font-headline text-[26px] sm:text-[32px] text-[#1c1b1b] font-bold leading-tight mt-1">
                {currentArticle.term}
              </h2>
            </div>

            {/* Short Definition Block */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#eae7e7] flex items-start gap-3.5 shadow-xs">
              <BookOpen className="w-5 h-5 text-[#99462a] shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] text-[#88726c] uppercase font-bold tracking-wider">
                  Définition Canonique
                </span>
                <p className="text-[14px] sm:text-[15px] text-[#1c1b1b] leading-relaxed font-medium">
                  {currentArticle.shortDefinition}
                </p>
              </div>
            </div>

            {/* Detailed Architecture Explanation */}
            <div className="flex flex-col gap-2">
              <h4 className="font-mono text-[11px] uppercase tracking-wider text-[#88726c] font-bold">
                Explication Approfondie & Fonctionnement Interne
              </h4>
              <p className="text-[14px] sm:text-[15px] text-[#55433d] leading-relaxed">
                {currentArticle.detailedExplanation}
              </p>
            </div>

            {/* Golden Rule Callout */}
            <div className="bg-[#f0eded] rounded-2xl p-4 sm:p-5 border border-[#eae7e7] flex items-start gap-3">
              <Flame className="w-5 h-5 text-[#d97757] fill-[#d97757] shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[11px] text-[#7a2f15] uppercase font-bold tracking-wider">
                  Règle d'or de l'Architecte Anthropic
                </span>
                <p className="text-[13px] sm:text-[14px] text-[#1c1b1b] font-semibold leading-snug">
                  {currentArticle.architecturePrinciple}
                </p>
              </div>
            </div>

            {/* Code Snippet Studio */}
            {currentArticle.codeSnippet && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-[#99462a]" />
                    <span className="font-mono text-[11px] text-[#1c1b1b] font-bold">
                      {currentArticle.codeTitle || 'Implémentation de Référence'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyCode(currentArticle.codeSnippet)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#eae7e7] font-mono text-[10px] text-[#55433d] hover:bg-[#f0eded] transition-colors"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3 h-3 text-[#99462a]" />
                        <span>Copié !</span>
                      </>
                    ) : (
                      <span>Copier le code</span>
                    )}
                  </button>
                </div>

                <div className="bg-[#1c1b1b] rounded-2xl p-4 font-mono text-[12px] text-[#f6f3f2] overflow-x-auto shadow-inner border border-[#333]">
                  <pre className="leading-relaxed whitespace-pre font-mono">
                    {currentArticle.codeSnippet}
                  </pre>
                </div>
              </div>
            )}

            {/* Two Column Grid: Pitfalls vs Best Practices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Pitfalls */}
              <div className="bg-white rounded-2xl p-4 border border-[#ffdad6] flex flex-col gap-2.5">
                <div className="flex items-center gap-2 text-[#ba1a1a]">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider">
                    Pièges d'Examen Fréquents
                  </span>
                </div>
                <ul className="space-y-2 text-[12px] text-[#55433d] leading-relaxed">
                  {currentArticle.commonPitfalls.map((pitfall, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] shrink-0 mt-1.5" />
                      <span>{pitfall}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Best Practices */}
              <div className="bg-white rounded-2xl p-4 border border-[#dbc1b9] flex flex-col gap-2.5">
                <div className="flex items-center gap-2 text-[#99462a]">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider">
                    Bonnes Pratiques de Production
                  </span>
                </div>
                <ul className="space-y-2 text-[12px] text-[#55433d] leading-relaxed">
                  {currentArticle.bestPractices.map((bp, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#99462a] shrink-0 mt-1.5" />
                      <span>{bp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Linked Flashcards Section */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#eae7e7] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#99462a]" />
                  <span className="font-mono text-[12px] text-[#1c1b1b] font-bold uppercase tracking-wider">
                    Flashcards Associées pour S'Entraîner ({currentArticle.relatedFlashcardIds.length})
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#88726c]">
                  Cliquez sur une carte pour lancer le mémo
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {currentArticle.relatedFlashcardIds.map((cardId) => (
                  <button
                    key={cardId}
                    onClick={() => onOpenFlashcard(cardId)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f6f3f2] hover:bg-[#ffdbd0] text-[#1c1b1b] hover:text-[#7a2f15] font-mono text-[11px] font-semibold border border-[#eae7e7] hover:border-[#ffb59e] transition-colors"
                  >
                    <span>Flashcard #{cardId}</span>
                    <ArrowRight className="w-3 h-3 text-[#99462a]" />
                  </button>
                ))}
              </div>
            </div>

            {/* Official External Link Footer */}
            {currentArticle.officialDocUrl && (
              <div className="flex items-center justify-between pt-2 border-t border-[#eae7e7] text-[12px] font-mono text-[#88726c]">
                <span>Documentation de Référence Anthropic :</span>
                <a
                  href={currentArticle.officialDocUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[#99462a] hover:underline font-semibold"
                >
                  <span>Consulter sur anthropic.com</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </article>
        </div>
      </div>
    </div>
  );
};
