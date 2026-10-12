import React, { useState, useEffect, useRef } from 'react';
import { UserNote } from '../types';
import {
  getNoteForTarget,
  upsertNote,
  removeNote,
  NOTES_UPDATED_EVENT,
  extractAutoTags,
} from '../utils/notesEngine';
import { useAuth } from '../context/AuthContext';
import {
  StickyNote,
  Save,
  Check,
  Trash2,
  Cloud,
  HardDrive,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Tag,
  ExternalLink,
} from 'lucide-react';

interface NotesSectionProps {
  targetType: 'flashcard' | 'article';
  targetId: string | number;
  targetTitle: string;
  targetDomainId: number;
  targetDomainCode: string;
  certId?: string;
  onOpenAllNotes?: () => void;
  defaultExpanded?: boolean;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  targetType,
  targetId,
  targetTitle,
  targetDomainId,
  targetDomainCode,
  certId,
  onOpenAllNotes,
  defaultExpanded,
}) => {
  const { currentUser } = useAuth();
  const [existingNote, setExistingNote] = useState<UserNote | null>(() =>
    getNoteForTarget(targetType, targetId)
  );
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    if (defaultExpanded !== undefined) return defaultExpanded;
    return !!existingNote;
  });
  const [content, setContent] = useState<string>(existingNote?.content || '');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(existingNote?.tags || []);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reload note when targetId changes
  useEffect(() => {
    const current = getNoteForTarget(targetType, targetId);
    setExistingNote(current);
    setContent(current?.content || '');
    setSelectedTags(current?.tags || []);
    if (current) {
      setIsExpanded(true);
    }
  }, [targetType, targetId]);

  // Listen to cross-component note updates
  useEffect(() => {
    const handleUpdate = () => {
      const current = getNoteForTarget(targetType, targetId);
      setExistingNote(current);
      if (current && !content) {
        setContent(current.content);
        setSelectedTags(current.tags);
      }
    };
    window.addEventListener(NOTES_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(NOTES_UPDATED_EVENT, handleUpdate);
  }, [targetType, targetId, content]);

  const handleSave = async () => {
    if (!content.trim()) {
      if (existingNote) {
        await removeNote(existingNote.id, currentUser?.uid);
        setExistingNote(null);
        setContent('');
        setSelectedTags([]);
      }
      return;
    }

    setIsSaving(true);
    try {
      const tags =
        selectedTags.length > 0 ? selectedTags : extractAutoTags(content);
      const saved = await upsertNote(
        {
          id: existingNote?.id,
          targetType,
          targetId,
          targetTitle,
          targetDomainId,
          targetDomainCode,
          certId,
          content,
          tags,
        },
        currentUser?.uid
      );
      setExistingNote(saved);
      setSelectedTags(saved.tags);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2200);
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!existingNote) return;
    if (window.confirm('Supprimer cette note personnelle ?')) {
      await removeNote(existingNote.id, currentUser?.uid);
      setExistingNote(null);
      setContent('');
      setSelectedTags([]);
    }
  };

  const handleInsertTemplate = (prefix: string) => {
    if (!isExpanded) setIsExpanded(true);
    setContent((prev) => {
      if (!prev.trim()) return prefix;
      return `${prev.trim()}\n\n${prefix}`;
    });
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = textareaRef.current.value.length;
        textareaRef.current.selectionEnd = textareaRef.current.value.length;
      }
    }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  const hasNote = Boolean(existingNote && existingNote.content.trim());

  return (
    <div className="w-full bg-[#fcf9f8] rounded-2xl border border-[#e8dcd5] shadow-xs overflow-hidden transition-all duration-200">
      {/* Header bar / Collapsible toggle */}
      <div
        onClick={() => setIsExpanded((prev) => !prev)}
        className="px-4 py-3 bg-[#f7f2ef] hover:bg-[#f1ebe7] flex items-center justify-between cursor-pointer transition-colors select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#99462a]/10 text-[#99462a] flex items-center justify-center">
            <StickyNote className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[12px] font-bold uppercase tracking-wider text-[#1c1b1b]">
              📝 My Notes
            </span>
            {hasNote ? (
              <span className="font-mono text-[10px] bg-[#99462a] text-white px-2 py-0.5 rounded-full font-bold">
                1 note active
              </span>
            ) : (
              <span className="font-mono text-[11px] text-[#88726c]">
                (Notes & mémos personnels)
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Sync status indicator */}
          <div className="flex items-center gap-1 font-mono text-[10px] text-[#55433d] bg-white px-2 py-0.5 rounded-md border border-[#e8dcd5]">
            {currentUser ? (
              <>
                <Cloud className="w-3 h-3 text-[#2e7d32]" />
                <span className="text-[#2e7d32] font-semibold hidden sm:inline">
                  Sync Firestore
                </span>
              </>
            ) : (
              <>
                <HardDrive className="w-3 h-3 text-[#88726c]" />
                <span className="hidden sm:inline">Local</span>
              </>
            )}
          </div>

          {onOpenAllNotes && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenAllNotes();
              }}
              className="text-[#99462a] hover:text-[#7a2f15] font-mono text-[11px] font-semibold flex items-center gap-1 hover:underline"
              title="Voir toutes mes annotations"
            >
              <span className="hidden sm:inline">Mes annotations</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}

          <div className="text-[#88726c]">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content Area */}
      {isExpanded && (
        <div className="p-4 sm:p-5 flex flex-col gap-3.5 bg-[#fcf9f8] animate-in fade-in duration-150">
          {/* Quick template helpers */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono text-[10px] text-[#88726c] uppercase font-bold flex items-center gap-1 mr-1">
              <Sparkles className="w-3 h-3 text-[#d97757]" /> Modèles :
            </span>
            <button
              type="button"
              onClick={() =>
                handleInsertTemplate('« À retenir : MCP Resources ≠ Tools »')
              }
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#ffdbd0]/50 border border-[#e8dcd5] text-[#7a2f15] font-mono text-[11px] font-semibold transition-colors"
            >
              + « À retenir : ... »
            </button>
            <button
              type="button"
              onClick={() =>
                handleInsertTemplate(
                  "« Piège examen : attention à l'obligation de tool_use_id »"
                )
              }
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#ffebeb] border border-[#ffdad6] text-[#ba1a1a] font-mono text-[11px] font-semibold transition-colors"
            >
              + « Piège examen : ... »
            </button>
            <button
              type="button"
              onClick={() =>
                handleInsertTemplate('« Règle Architecture : boucle d\'agents avec max_iterations »')
              }
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#e0e9f8] border border-[#d0def5] text-[#1e40af] font-mono text-[11px] font-semibold transition-colors"
            >
              + « Architecture »
            </button>
            <button
              type="button"
              onClick={() =>
                handleInsertTemplate('« Formule FinOps : cache_control sur tokens statiques > 1024 »')
              }
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#ebf8ee] border border-[#cbeed1] text-[#166534] font-mono text-[11px] font-semibold transition-colors"
            >
              + « FinOps »
            </button>
          </div>

          {/* Text Area */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={4}
              placeholder="Écrivez votre mémo personnel ici (ex: « À retenir : MCP Resources ≠ Tools »)...&#10;Ces notes sont synchronisées dans votre base Firestore et accessibles dans « Mes annotations »."
              className="w-full p-3.5 rounded-xl bg-white border border-[#e0d6d0] text-[13px] text-[#1c1b1b] placeholder-[#88726c] font-sans leading-relaxed focus:outline-none focus:border-[#99462a] focus:ring-1 focus:ring-[#99462a] transition-all resize-y shadow-2xs"
            />
          </div>

          {/* Tags list display */}
          {selectedTags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono text-[10px] text-[#88726c] flex items-center gap-1">
                <Tag className="w-3 h-3" /> Tags :
              </span>
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-[#f0eded] text-[#55433d] font-semibold"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-[#f0eded] flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-mono text-[12px] font-bold shadow-xs transition-all ${
                  saveSuccess
                    ? 'bg-[#2e7d32] text-white'
                    : 'bg-[#99462a] hover:bg-[#7a2f15] text-white'
                }`}
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Enregistré & Synchronisé !</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Enregistrement...' : 'Enregistrer'}</span>
                  </>
                )}
              </button>

              <span className="font-mono text-[10px] text-[#88726c] hidden sm:inline">
                Raccourci : [Ctrl + Entrée]
              </span>
            </div>

            <div className="flex items-center gap-2">
              {existingNote?.updatedAt && (
                <span className="font-mono text-[10px] text-[#88726c]">
                  Modifié le {new Date(existingNote.updatedAt).toLocaleDateString('fr-FR')} à{' '}
                  {new Date(existingNote.updatedAt).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}

              {hasNote && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-1.5 rounded-lg text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors"
                  title="Supprimer cette note"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
