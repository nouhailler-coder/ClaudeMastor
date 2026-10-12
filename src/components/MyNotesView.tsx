import React, { useState, useMemo, useEffect } from 'react';
import { UserNote } from '../types';
import {
  loadStoredNotes,
  upsertNote,
  removeNote,
  exportNotesAsMarkdown,
  exportNotesAsJSON,
  syncNotesWithFirestore,
  NOTES_UPDATED_EVENT,
  extractAutoTags,
} from '../utils/notesEngine';
import { useAuth } from '../context/AuthContext';
import {
  StickyNote,
  Search,
  Plus,
  Download,
  Copy,
  Check,
  Trash2,
  Edit3,
  ExternalLink,
  Layers,
  BookMarked,
  Tag,
  Filter,
  RefreshCw,
  Cloud,
  HardDrive,
  Sparkles,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

interface MyNotesViewProps {
  onOpenFlashcard: (cardId: number) => void;
  onOpenEncyclopedia: (articleId: string) => void;
}

export const MyNotesView: React.FC<MyNotesViewProps> = ({
  onOpenFlashcard,
  onOpenEncyclopedia,
}) => {
  const { currentUser } = useAuth();
  const [notes, setNotes] = useState<UserNote[]>(() => loadStoredNotes());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'all' | 'flashcard' | 'article'>('all');
  const [selectedDomain, setSelectedDomain] = useState<number | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'domain'>('recent');

  // Edit modal / inline editing state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [editTitle, setEditTitle] = useState<string>('');
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [newNoteData, setNewNoteData] = useState({
    targetType: 'flashcard' as 'flashcard' | 'article',
    targetId: '1',
    targetTitle: '',
    targetDomainId: 1,
    targetDomainCode: '01. Architecture',
    certId: 'cca-p200',
    content: '',
  });

  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Listen for storage events / external updates
  useEffect(() => {
    const handleUpdate = () => {
      setNotes(loadStoredNotes());
    };
    window.addEventListener(NOTES_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(NOTES_UPDATED_EVENT, handleUpdate);
  }, []);

  const handleManualSync = async () => {
    if (!currentUser) {
      setSyncFeedback('Connectez-vous pour synchroniser vos notes avec Firestore.');
      setTimeout(() => setSyncFeedback(null), 3500);
      return;
    }
    setIsSyncing(true);
    try {
      const merged = await syncNotesWithFirestore(currentUser.uid);
      setNotes(merged);
      setSyncFeedback('Notes synchronisées avec succès sur Firestore.');
    } catch (e) {
      console.error(e);
      setSyncFeedback('Erreur lors de la synchronisation.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncFeedback(null), 3000);
    }
  };

  // Collect all unique tags
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    notes.forEach((n) => {
      if (Array.isArray(n.tags)) {
        n.tags.forEach((t) => tagsSet.add(t));
      }
    });
    return Array.from(tagsSet);
  }, [notes]);

  // Filtered and sorted notes
  const filteredNotes = useMemo(() => {
    let result = [...notes];

    // Filter by type
    if (selectedType !== 'all') {
      result = result.filter((n) => n.targetType === selectedType);
    }

    // Filter by domain
    if (selectedDomain !== 'all') {
      result = result.filter((n) => n.targetDomainId === selectedDomain);
    }

    // Filter by tag
    if (selectedTag !== 'all') {
      result = result.filter((n) => n.tags && n.tags.includes(selectedTag));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          n.content.toLowerCase().includes(q) ||
          n.targetTitle.toLowerCase().includes(q) ||
          n.targetDomainCode.toLowerCase().includes(q) ||
          String(n.targetId).includes(q) ||
          (n.tags && n.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      if (sortBy === 'domain') {
        return a.targetDomainId - b.targetDomainId;
      }
      return 0;
    });

    return result;
  }, [notes, selectedType, selectedDomain, selectedTag, searchQuery, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    const total = notes.length;
    const flashcardsCount = notes.filter((n) => n.targetType === 'flashcard').length;
    const articlesCount = notes.filter((n) => n.targetType === 'article').length;
    const uniqueDomains = new Set(notes.map((n) => n.targetDomainId)).size;
    return { total, flashcardsCount, articlesCount, uniqueDomains };
  }, [notes]);

  const handleStartEdit = (note: UserNote) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
    setEditTitle(note.targetTitle);
  };

  const handleSaveEdit = async (noteId: string) => {
    const targetNote = notes.find((n) => n.id === noteId);
    if (!targetNote) return;

    if (!editContent.trim()) {
      await removeNote(noteId, currentUser?.uid);
    } else {
      await upsertNote(
        {
          id: noteId,
          targetType: targetNote.targetType,
          targetId: targetNote.targetId,
          targetTitle: editTitle.trim() || targetNote.targetTitle,
          targetDomainId: targetNote.targetDomainId,
          targetDomainCode: targetNote.targetDomainCode,
          certId: targetNote.certId,
          content: editContent.trim(),
          tags: extractAutoTags(editContent),
        },
        currentUser?.uid
      );
    }
    setEditingNoteId(null);
    setNotes(loadStoredNotes());
  };

  const handleDelete = async (noteId: string) => {
    if (window.confirm('Supprimer définitivement cette note ?')) {
      await removeNote(noteId, currentUser?.uid);
      setNotes(loadStoredNotes());
    }
  };

  const handleCreateNewNote = async () => {
    if (!newNoteData.content.trim()) return;

    await upsertNote(
      {
        targetType: newNoteData.targetType,
        targetId: newNoteData.targetId,
        targetTitle:
          newNoteData.targetTitle.trim() ||
          (newNoteData.targetType === 'flashcard'
            ? `Flashcard #${newNoteData.targetId}`
            : `Traité ${newNoteData.targetId}`),
        targetDomainId: newNoteData.targetDomainId,
        targetDomainCode: newNoteData.targetDomainCode,
        certId: newNoteData.certId,
        content: newNoteData.content.trim(),
        tags: extractAutoTags(newNoteData.content),
      },
      currentUser?.uid
    );

    setIsCreatingNew(false);
    setNewNoteData({
      targetType: 'flashcard',
      targetId: '1',
      targetTitle: '',
      targetDomainId: 1,
      targetDomainCode: '01. Architecture',
      certId: 'cca-p200',
      content: '',
    });
    setNotes(loadStoredNotes());
  };

  const handleExportMarkdown = () => {
    const md = exportNotesAsMarkdown(notes);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mes-annotations-claude-architect-${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyAll = () => {
    const md = exportNotesAsMarkdown(notes);
    navigator.clipboard.writeText(md);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleNavigateToTarget = (note: UserNote) => {
    if (note.targetType === 'flashcard') {
      const numericId = parseInt(String(note.targetId), 10);
      onOpenFlashcard(isNaN(numericId) ? 1 : numericId);
    } else {
      onOpenEncyclopedia(String(note.targetId));
    }
  };

  const domainOptions = [
    { id: 'all' as const, label: 'Tous les domaines' },
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
              📝 Espace Personnel
            </span>
            <div className="flex items-center gap-1 font-mono text-[11px] text-[#55433d] bg-white px-2.5 py-0.5 rounded-full border border-[#eae7e7]">
              {currentUser ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-[#2e7d32]" />
                  <span className="text-[#2e7d32] font-semibold">
                    Synchronisé avec Firestore
                  </span>
                </>
              ) : (
                <>
                  <HardDrive className="w-3.5 h-3.5 text-[#88726c]" />
                  <span>Sauvegarde Locale</span>
                </>
              )}
            </div>
          </div>
          <h1 className="font-headline text-[30px] lg:text-[36px] text-[#1c1b1b] font-bold tracking-tight">
            Mes annotations
          </h1>
          <p className="text-[14px] sm:text-[15px] text-[#55433d] mt-0.5 max-w-3xl">
            Retrouvez et révisez l'intégralité de vos notes personnelles (« À retenir », pièges d'examen, formules FinOps) prises sur chaque flashcard et traité d'architecture.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#f0eded] text-[#55433d] font-mono text-[11px] font-bold border border-[#eae7e7] shadow-2xs transition-colors"
            title="Synchroniser avec la base Firestore"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#99462a]' : ''}`} />
            <span>Sync Firestore</span>
          </button>

          <button
            type="button"
            onClick={handleCopyAll}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#f0eded] text-[#55433d] font-mono text-[11px] font-bold border border-[#eae7e7] shadow-2xs transition-colors"
            title="Copier toutes les notes au format Markdown"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-[#2e7d32]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedAll ? 'Copié !' : 'Copier tout'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportMarkdown}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#f0eded] text-[#55433d] font-mono text-[11px] font-bold border border-[#eae7e7] shadow-2xs transition-colors"
            title="Télécharger le fichier .md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter .md</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreatingNew((prev) => !prev)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#99462a] hover:bg-[#7a2f15] text-white font-mono text-[12px] font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle note</span>
          </button>
        </div>
      </section>

      {/* Sync Feedback Toast */}
      {syncFeedback && (
        <div className="mb-4 p-3 bg-[#e8f5e9] border border-[#a5d6a7] text-[#2e7d32] rounded-xl font-mono text-[12px] flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* Quick Stats Grid */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-[#f6f3f2] p-4 rounded-2xl border border-[#eae7e7] flex flex-col gap-1 shadow-2xs">
          <span className="font-mono text-[10px] uppercase text-[#88726c] font-bold">
            Total Notes
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-headline text-[26px] font-bold text-[#1c1b1b]">
              {stats.total}
            </span>
            <span className="font-mono text-[11px] text-[#88726c]">annotations</span>
          </div>
        </div>

        <div className="bg-[#f6f3f2] p-4 rounded-2xl border border-[#eae7e7] flex flex-col gap-1 shadow-2xs">
          <span className="font-mono text-[10px] uppercase text-[#88726c] font-bold flex items-center gap-1">
            <Layers className="w-3 h-3 text-[#99462a]" /> Flashcards
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-headline text-[26px] font-bold text-[#99462a]">
              {stats.flashcardsCount}
            </span>
            <span className="font-mono text-[11px] text-[#88726c]">cartes</span>
          </div>
        </div>

        <div className="bg-[#f6f3f2] p-4 rounded-2xl border border-[#eae7e7] flex flex-col gap-1 shadow-2xs">
          <span className="font-mono text-[10px] uppercase text-[#88726c] font-bold flex items-center gap-1">
            <BookMarked className="w-3 h-3 text-[#d97757]" /> Traités & Articles
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-headline text-[26px] font-bold text-[#d97757]">
              {stats.articlesCount}
            </span>
            <span className="font-mono text-[11px] text-[#88726c]">traités</span>
          </div>
        </div>

        <div className="bg-[#f6f3f2] p-4 rounded-2xl border border-[#eae7e7] flex flex-col gap-1 shadow-2xs">
          <span className="font-mono text-[10px] uppercase text-[#88726c] font-bold">
            Couverture Domaines
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-headline text-[26px] font-bold text-[#1c1b1b]">
              {stats.uniqueDomains} / 5
            </span>
            <span className="font-mono text-[11px] text-[#88726c]">domaines</span>
          </div>
        </div>
      </section>

      {/* New Note Creator Form */}
      {isCreatingNew && (
        <section className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-[#99462a]/30 shadow-md mb-6 flex flex-col gap-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#99462a]" />
              <h3 className="font-headline text-[18px] font-bold text-[#1c1b1b]">
                Créer une nouvelle note personnelle
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsCreatingNew(false)}
              className="text-[#88726c] hover:text-[#1c1b1b] font-mono text-[12px]"
            >
              Annuler
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-mono text-[11px] text-[#88726c] mb-1 font-semibold">
                Type de cible
              </label>
              <select
                value={newNoteData.targetType}
                onChange={(e) =>
                  setNewNoteData((prev) => ({
                    ...prev,
                    targetType: e.target.value as 'flashcard' | 'article',
                  }))
                }
                className="w-full p-2.5 rounded-xl bg-[#f6f3f2] border border-[#eae7e7] text-[13px] text-[#1c1b1b] font-mono"
              >
                <option value="flashcard">Flashcard d'examen</option>
                <option value="article">Traité de l'Encyclopédie</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-[11px] text-[#88726c] mb-1 font-semibold">
                Identifiant ou Numéro cible
              </label>
              <input
                type="text"
                value={newNoteData.targetId}
                onChange={(e) =>
                  setNewNoteData((prev) => ({ ...prev, targetId: e.target.value }))
                }
                placeholder={newNoteData.targetType === 'flashcard' ? 'Ex: 12' : 'Ex: mcp-protocol'}
                className="w-full p-2.5 rounded-xl bg-[#f6f3f2] border border-[#eae7e7] text-[13px] text-[#1c1b1b] font-mono"
              />
            </div>

            <div>
              <label className="block font-mono text-[11px] text-[#88726c] mb-1 font-semibold">
                Domaine
              </label>
              <select
                value={newNoteData.targetDomainId}
                onChange={(e) => {
                  const dId = parseInt(e.target.value, 10);
                  const matched = domainOptions.find((o) => o.id === dId);
                  setNewNoteData((prev) => ({
                    ...prev,
                    targetDomainId: dId,
                    targetDomainCode: matched?.label || '01. Architecture',
                  }));
                }}
                className="w-full p-2.5 rounded-xl bg-[#f6f3f2] border border-[#eae7e7] text-[13px] text-[#1c1b1b] font-mono"
              >
                <option value={1}>01. Architecture</option>
                <option value={2}>02. Prompt & XML</option>
                <option value={3}>03. Tool Use & MCP</option>
                <option value={4}>04. Sécurité</option>
                <option value={5}>05. FinOps & Latence</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-mono text-[11px] text-[#88726c] mb-1 font-semibold">
              Titre / Sujet du concept
            </label>
            <input
              type="text"
              value={newNoteData.targetTitle}
              onChange={(e) =>
                setNewNoteData((prev) => ({ ...prev, targetTitle: e.target.value }))
              }
              placeholder="Ex: Différence MCP Resources vs Tools"
              className="w-full p-2.5 rounded-xl bg-[#f6f3f2] border border-[#eae7e7] text-[13px] text-[#1c1b1b]"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] text-[#88726c] mb-1 font-semibold">
              Contenu de la note
            </label>
            <textarea
              rows={4}
              value={newNoteData.content}
              onChange={(e) =>
                setNewNoteData((prev) => ({ ...prev, content: e.target.value }))
              }
              placeholder="« À retenir : MCP Resources ≠ Tools »..."
              className="w-full p-3 rounded-xl bg-[#f6f3f2] border border-[#eae7e7] text-[13px] text-[#1c1b1b] leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#eae7e7]">
            <button
              type="button"
              onClick={() => setIsCreatingNew(false)}
              className="px-4 py-2 rounded-xl bg-[#f0eded] text-[#55433d] font-mono text-[12px] font-semibold"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleCreateNewNote}
              className="px-5 py-2 rounded-xl bg-[#99462a] text-white font-mono text-[12px] font-bold shadow-xs hover:bg-[#7a2f15]"
            >
              Enregistrer la note
            </button>
          </div>
        </section>
      )}

      {/* Filter and Search Bar Section */}
      <section className="bg-white rounded-3xl p-4 sm:p-5 border border-[#eae7e7] shadow-xs mb-6 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#88726c] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher dans mes notes (« À retenir », MCP, prompt, tags)..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#f6f3f2] border border-[#eae7e7] text-[13px] text-[#1c1b1b] placeholder-[#88726c] focus:outline-none focus:border-[#99462a]"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 rounded-xl font-mono text-[12px] whitespace-nowrap transition-all border ${
                selectedType === 'all'
                  ? 'bg-[#99462a] text-white border-[#99462a] font-bold'
                  : 'bg-[#f6f3f2] text-[#55433d] border-[#eae7e7]'
              }`}
            >
              Toutes ({notes.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('flashcard')}
              className={`px-3 py-1.5 rounded-xl font-mono text-[12px] whitespace-nowrap transition-all border ${
                selectedType === 'flashcard'
                  ? 'bg-[#99462a] text-white border-[#99462a] font-bold'
                  : 'bg-[#f6f3f2] text-[#55433d] border-[#eae7e7]'
              }`}
            >
              Flashcards ({stats.flashcardsCount})
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('article')}
              className={`px-3 py-1.5 rounded-xl font-mono text-[12px] whitespace-nowrap transition-all border ${
                selectedType === 'article'
                  ? 'bg-[#99462a] text-white border-[#99462a] font-bold'
                  : 'bg-[#f6f3f2] text-[#55433d] border-[#eae7e7]'
              }`}
            >
              Traités ({stats.articlesCount})
            </button>
          </div>
        </div>

        {/* Secondary filters: Domain, Tags and Sorting */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-[#f0eded] text-[12px]">
          {/* Domain Dropdown */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[11px] text-[#88726c] font-semibold">
              Domaine :
            </span>
            <select
              value={selectedDomain}
              onChange={(e) =>
                setSelectedDomain(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))
              }
              className="p-1.5 rounded-lg bg-[#f6f3f2] border border-[#eae7e7] text-[12px] text-[#1c1b1b] font-mono"
            >
              {domainOptions.map((opt) => (
                <option key={String(opt.id)} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Tag pills */}
            {allTags.length > 0 && (
              <div className="flex items-center gap-1 ml-1 flex-wrap">
                <span className="font-mono text-[11px] text-[#88726c] font-semibold">Tag :</span>
                <button
                  type="button"
                  onClick={() => setSelectedTag('all')}
                  className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-semibold ${
                    selectedTag === 'all'
                      ? 'bg-[#1c1b1b] text-white'
                      : 'bg-[#f0eded] text-[#55433d] hover:bg-[#eae7e7]'
                  }`}
                >
                  Tous
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag === selectedTag ? 'all' : tag)}
                    className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-semibold transition-colors ${
                      selectedTag === tag
                        ? 'bg-[#99462a] text-white'
                        : 'bg-[#f0eded] text-[#55433d] hover:bg-[#eae7e7]'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="font-mono text-[11px] text-[#88726c] font-semibold">Trier par :</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="p-1.5 rounded-lg bg-[#f6f3f2] border border-[#eae7e7] text-[12px] text-[#1c1b1b] font-mono"
            >
              <option value="recent">Plus récentes</option>
              <option value="oldest">Plus anciennes</option>
              <option value="domain">Par Domaine</option>
            </select>
          </div>
        </div>
      </section>

      {/* List of Notes */}
      <section className="flex flex-col gap-4">
        {filteredNotes.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#eae7e7] flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#f6f3f2] flex items-center justify-center text-[#88726c]">
              <StickyNote className="w-6 h-6" />
            </div>
            <h3 className="font-headline text-[18px] font-bold text-[#1c1b1b]">
              Aucune note ne correspond à vos filtres
            </h3>
            <p className="text-[13px] text-[#55433d] max-w-md">
              Modifiez votre recherche ou rédigez une nouvelle note directement sur une flashcard ou un traité d'architecture.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
                setSelectedDomain('all');
                setSelectedTag('all');
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-[#99462a] text-white font-mono text-[12px] font-bold"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          filteredNotes.map((note) => {
            const isEditing = editingNoteId === note.id;
            const isFlashcard = note.targetType === 'flashcard';

            return (
              <div
                key={note.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-[#eae7e7] shadow-xs hover:shadow-sm transition-all flex flex-col gap-3.5 relative group"
              >
                {/* Note Top Bar: Type, Domain, Title & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#f0eded] pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`font-mono text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 ${
                        isFlashcard
                          ? 'bg-[#ffdbd0] text-[#7a2f15]'
                          : 'bg-[#e0e9f8] text-[#1e40af]'
                      }`}
                    >
                      {isFlashcard ? (
                        <>
                          <Layers className="w-3 h-3" />
                          <span>Flashcard #{note.targetId}</span>
                        </>
                      ) : (
                        <>
                          <BookMarked className="w-3 h-3" />
                          <span>Traité d'Architecture</span>
                        </>
                      )}
                    </span>

                    <span className="font-mono text-[11px] text-[#88726c] font-semibold">
                      {note.targetDomainCode}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-mono text-[#88726c]">
                    <span>
                      Modifié le {new Date(note.updatedAt).toLocaleDateString('fr-FR')} à{' '}
                      {new Date(note.updatedAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Target Title & Quick Jump Link */}
                <div className="flex items-start justify-between gap-3">
                  <h3
                    onClick={() => handleNavigateToTarget(note)}
                    className="font-headline text-[17px] sm:text-[19px] font-bold text-[#1c1b1b] hover:text-[#99462a] transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{note.targetTitle}</span>
                    <ArrowRight className="w-4 h-4 text-[#99462a] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>

                  <button
                    type="button"
                    onClick={() => handleNavigateToTarget(note)}
                    className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#f6f3f2] hover:bg-[#ffdbd0] text-[#1c1b1b] hover:text-[#7a2f15] font-mono text-[11px] font-bold transition-colors border border-[#eae7e7]"
                    title={isFlashcard ? 'Ouvrir cette carte' : 'Ouvrir ce traité'}
                  >
                    <span>{isFlashcard ? 'Voir la carte' : 'Lire le traité'}</span>
                    <ExternalLink className="w-3 h-3 text-[#99462a]" />
                  </button>
                </div>

                {/* Note Content / Inline Edit Form */}
                {isEditing ? (
                  <div className="flex flex-col gap-3 mt-1 p-3 bg-[#fcf9f8] rounded-2xl border border-[#e8dcd5]">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Titre du sujet..."
                      className="p-2.5 rounded-xl bg-white border border-[#eae7e7] text-[13px] text-[#1c1b1b] font-semibold"
                    />
                    <textarea
                      rows={5}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="p-3 rounded-xl bg-white border border-[#eae7e7] text-[13px] text-[#1c1b1b] leading-relaxed font-sans"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingNoteId(null)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#f0eded] text-[#55433d] font-mono text-[11px] font-semibold"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(note.id)}
                        className="px-4 py-1.5 rounded-xl bg-[#99462a] text-white font-mono text-[11px] font-bold shadow-xs hover:bg-[#7a2f15]"
                      >
                        Sauvegarder
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#fcf9f8] border border-[#f0e8e4] text-[13.5px] text-[#1c1b1b] leading-relaxed whitespace-pre-line font-sans font-normal shadow-2xs">
                    {note.content}
                  </div>
                )}

                {/* Tags & Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-[#f0eded] flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {note.tags &&
                      note.tags.map((tag) => (
                        <span
                          key={tag}
                          onClick={() => setSelectedTag(tag)}
                          className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-[#f0eded] hover:bg-[#ffdbd0] text-[#55433d] hover:text-[#7a2f15] font-semibold cursor-pointer transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>

                  <div className="flex items-center gap-1">
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => handleStartEdit(note)}
                        className="p-2 rounded-xl text-[#55433d] hover:bg-[#f0eded] transition-colors"
                        title="Modifier cette note"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(note.id)}
                      className="p-2 rounded-xl text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors"
                      title="Supprimer cette note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
};
