import { UserNote } from '../types';
import {
  saveUserNoteToFirestore,
  loadUserNotesFromFirestore,
  deleteUserNoteFromFirestore,
} from '../firebase';

const STORAGE_KEY_NOTES = 'claudemastor_user_notes_v1';
export const NOTES_UPDATED_EVENT = 'claudemastor_notes_updated';

// Realistic seeded notes aligned with user specifications
export const INITIAL_SEEDED_NOTES: UserNote[] = [
  {
    id: 'note_fc_12',
    targetType: 'flashcard',
    targetId: '12',
    targetTitle: 'Primitives MCP : Resources vs Tools vs Prompts',
    targetDomainId: 3,
    targetDomainCode: '03. Tool Use & MCP',
    certId: 'cca-p200',
    content:
      '« À retenir : MCP Resources ≠ Tools »\n\n• Resources : Données passives en lecture seule (URIs type file://, postgres://, git://). Zéro effet de bord.\n• Tools : Fonctions exécutables par le modèle avec arguments validés par JSON Schema. Peuvent modifier l\'état système (POST, write).\n• Prompts : Gabarits conversationnels paramétrables exposés au client.',
    tags: ['#À-retenir', '#MCP', '#Architecture'],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'note_fc_18',
    targetType: 'flashcard',
    targetId: '18',
    targetTitle: "Structure du message tool_result dans l'API Messages",
    targetDomainId: 3,
    targetDomainCode: '03. Tool Use & MCP',
    certId: 'cca-p200',
    content:
      "« Piège examen : tool_result doit TOUJOURS inclure le tool_use_id correspondant »\n\nSi le client omet le champ `tool_use_id` ou renvoie un ID différent de celui émis par Claude dans le bloc `tool_use`, l'API Messages renvoie immédiatement une erreur 400 (invalid_request_error).\n\nStructure attendue :\n{\n  role: 'user',\n  content: [{\n    type: 'tool_result',\n    tool_use_id: 'toolu_01...',\n    content: JSON.stringify(result)\n  }]\n}",
    tags: ['#Piège-examen', '#ToolUse', '#API-Format'],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'note_art_mcp-protocol',
    targetType: 'article',
    targetId: 'mcp-protocol',
    targetTitle: 'Model Context Protocol (MCP) — Standard Ouvert',
    targetDomainId: 3,
    targetDomainCode: '03. Tool Use & MCP',
    certId: 'cca-p200',
    content:
      '« Architecture MCP : Transport stdio vs SSE »\n\n- Transport stdio : Claude Desktop spawn le process serveur MCP localement (in-process stdin/stdout). Idéal pour SQLite, fichiers locaux, GitHub CLI.\n- Transport SSE (Server-Sent Events) : Pour les serveurs distants dans un VPC Kubernetes/Cloud. Nécessite HTTPS + Bearer token pour sécuriser les endpoints.',
    tags: ['#Architecture', '#MCP', '#SSE'],
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'note_fc_24',
    targetType: 'flashcard',
    targetId: '24',
    targetTitle: 'Prompt Caching & Points de Rupture Éphémères',
    targetDomainId: 5,
    targetDomainCode: '05. FinOps & Latence',
    certId: 'cca-f100',
    content:
      '« Règle FinOps Prompt Caching »\n\n• TTL de 5 minutes renouvelé à chaque requête correspondante.\n• Économie jusqu\'à 90% sur le coût des tokens d\'entrée en cache hit.\n• Poser impérativement le breakpoint `cache_control: {"type": "ephemeral"}` sur les blocs statiques volumineux (system prompt lourd, schéma JSON de 30 outils, exemples Few-Shot XML).',
    tags: ['#FinOps', '#PromptCaching', '#Latence'],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'note_art_xml-prompt-engineering',
    targetType: 'article',
    targetId: 'xml-prompt-engineering',
    targetTitle: 'Prompt Engineering Structuré en Balises XML',
    targetDomainId: 2,
    targetDomainCode: '02. Prompt & XML',
    certId: 'cca-f100',
    content:
      '« Syntaxe XML Anthropic : Meilleures pratiques »\n\nClaude a été spécifiquement entraîné sur les balises XML pour délimiter les composantes du prompt :\n- <instructions> : Objectif principal et persona\n- <context> : Documents ou données d\'arrière-plan\n- <rules> : Contraintes négatives strictes\n- <examples><example> : Few-shot learning canonique\n\nÉviter d\'inventer des balises réservées comme <thinking> (qui est le conteneur du CoT natif).',
    tags: ['#À-retenir', '#PromptEngineering', '#XML'],
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

/**
 * Loads all notes from localStorage, seeding default high-value notes on first launch.
 */
export function loadStoredNotes(): UserNote[] {
  if (typeof window === 'undefined') return INITIAL_SEEDED_NOTES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(INITIAL_SEEDED_NOTES));
      return INITIAL_SEEDED_NOTES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(INITIAL_SEEDED_NOTES));
      return INITIAL_SEEDED_NOTES;
    }
    return parsed;
  } catch (e) {
    console.warn('Failed to parse stored notes from localStorage:', e);
    return INITIAL_SEEDED_NOTES;
  }
}

/**
 * Saves notes to localStorage and dispatches change notification event.
 */
export function saveStoredNotes(notes: UserNote[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
    window.dispatchEvent(new CustomEvent(NOTES_UPDATED_EVENT, { detail: { count: notes.length } }));
  } catch (e) {
    console.error('Failed to save notes to localStorage:', e);
  }
}

/**
 * Finds a note for a specific flashcard or article target.
 */
export function getNoteForTarget(
  targetType: 'flashcard' | 'article',
  targetId: string | number
): UserNote | null {
  const notes = loadStoredNotes();
  const idStr = String(targetId);
  return notes.find((n) => n.targetType === targetType && String(n.targetId) === idStr) || null;
}

/**
 * Upserts a note (creates or updates), saves to localStorage and syncs with Firestore if user is authenticated.
 */
export async function upsertNote(
  noteInput: {
    id?: string;
    targetType: 'flashcard' | 'article';
    targetId: string | number;
    targetTitle: string;
    targetDomainId?: number;
    targetDomainCode?: string;
    certId?: string;
    content: string;
    tags?: string[];
  },
  userId?: string | null
): Promise<UserNote> {
  const currentNotes = loadStoredNotes();
  const targetIdStr = String(noteInput.targetId);
  const existingIndex = currentNotes.findIndex(
    (n) =>
      (noteInput.id && n.id === noteInput.id) ||
      (n.targetType === noteInput.targetType && String(n.targetId) === targetIdStr)
  );

  const now = new Date().toISOString();

  let finalNote: UserNote;

  if (existingIndex >= 0) {
    const existing = currentNotes[existingIndex];
    finalNote = {
      ...existing,
      targetTitle: noteInput.targetTitle || existing.targetTitle,
      targetDomainId: noteInput.targetDomainId ?? existing.targetDomainId ?? 1,
      targetDomainCode: noteInput.targetDomainCode || existing.targetDomainCode || '01. Architecture',
      certId: noteInput.certId || existing.certId || 'cca-f100',
      content: noteInput.content.trim(),
      tags: noteInput.tags || existing.tags || [],
      updatedAt: now,
    };
    currentNotes[existingIndex] = finalNote;
  } else {
    const generatedId =
      noteInput.id ||
      `note_${noteInput.targetType === 'flashcard' ? 'fc' : 'art'}_${targetIdStr}_${Date.now()}`;
    finalNote = {
      id: generatedId,
      uid: userId || undefined,
      targetType: noteInput.targetType,
      targetId: targetIdStr,
      targetTitle: noteInput.targetTitle,
      targetDomainId: noteInput.targetDomainId ?? 1,
      targetDomainCode: noteInput.targetDomainCode || '01. Architecture',
      certId: noteInput.certId || 'cca-f100',
      content: noteInput.content.trim(),
      tags: noteInput.tags || extractAutoTags(noteInput.content),
      createdAt: now,
      updatedAt: now,
    };
    currentNotes.unshift(finalNote);
  }

  saveStoredNotes(currentNotes);

  // Sync to Firestore if authenticated
  if (userId) {
    saveUserNoteToFirestore(userId, finalNote).catch((err) => {
      console.warn('Background sync to Firestore failed:', err);
    });
  }

  return finalNote;
}

/**
 * Deletes a note by id from localStorage and Firestore if user is authenticated.
 */
export async function removeNote(noteId: string, userId?: string | null): Promise<void> {
  const currentNotes = loadStoredNotes();
  const updated = currentNotes.filter((n) => n.id !== noteId);
  saveStoredNotes(updated);

  if (userId) {
    deleteUserNoteFromFirestore(userId, noteId).catch((err) => {
      console.warn('Background delete from Firestore failed:', err);
    });
  }
}

/**
 * Bidirectional merge between local notes and Firestore notes upon authentication.
 */
export async function syncNotesWithFirestore(userId: string): Promise<UserNote[]> {
  try {
    const remoteNotes = await loadUserNotesFromFirestore(userId);
    const localNotes = loadStoredNotes();

    const noteMap = new Map<string, UserNote>();

    // Put remote notes in map
    remoteNotes.forEach((n) => {
      const key = `${n.targetType}_${n.targetId}`;
      noteMap.set(key, n);
    });

    // Merge local notes (if local is newer, upload to Firestore; otherwise keep remote)
    for (const local of localNotes) {
      const key = `${local.targetType}_${local.targetId}`;
      const remote = noteMap.get(key);
      if (!remote) {
        // Upload local to remote
        noteMap.set(key, local);
        await saveUserNoteToFirestore(userId, local);
      } else {
        const localTime = new Date(local.updatedAt).getTime();
        const remoteTime = new Date(remote.updatedAt).getTime();
        if (localTime > remoteTime) {
          noteMap.set(key, local);
          await saveUserNoteToFirestore(userId, local);
        }
      }
    }

    const merged = Array.from(noteMap.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    saveStoredNotes(merged);
    return merged;
  } catch (err) {
    console.warn('Failed to sync notes with Firestore:', err);
    return loadStoredNotes();
  }
}

/**
 * Auto-extract tags based on common prefixes like « À retenir », « Piège », etc.
 */
export function extractAutoTags(content: string): string[] {
  const tags: Set<string> = new Set();
  const lower = content.toLowerCase();

  if (lower.includes('à retenir') || lower.includes('a retenir')) tags.add('#À-retenir');
  if (lower.includes('piège') || lower.includes('piege') || lower.includes('attention')) tags.add('#Piège-examen');
  if (lower.includes('mcp')) tags.add('#MCP');
  if (lower.includes('tool') || lower.includes('tool use')) tags.add('#ToolUse');
  if (lower.includes('xml') || lower.includes('balise')) tags.add('#XML');
  if (lower.includes('finops') || lower.includes('coût') || lower.includes('cache')) tags.add('#FinOps');
  if (lower.includes('sécurité') || lower.includes('injection') || lower.includes('human-in-the-loop')) tags.add('#Sécurité');
  if (lower.includes('architecture') || lower.includes('agent')) tags.add('#Architecture');

  return Array.from(tags);
}

/**
 * Exports all notes as a readable Markdown document.
 */
export function exportNotesAsMarkdown(notes: UserNote[]): string {
  let md = `# Carnet d'Annotations & Notes Personnelles — Claude Certified Architect\n`;
  md += `*Exporté le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}*\n`;
  md += `*Total : ${notes.length} notes rédigées*\n\n`;
  md += `---\n\n`;

  notes.forEach((note, idx) => {
    const isFlashcard = note.targetType === 'flashcard';
    md += `### ${idx + 1}. [${isFlashcard ? 'Flashcard #' + note.targetId : 'Traité ' + note.targetId}] ${note.targetTitle}\n`;
    md += `**Domaine :** ${note.targetDomainCode} | **Dernière mise à jour :** ${new Date(note.updatedAt).toLocaleDateString('fr-FR')}\n`;
    if (note.tags && note.tags.length > 0) {
      md += `**Tags :** ${note.tags.join(' ')}\n\n`;
    } else {
      md += `\n`;
    }
    md += `${note.content}\n\n`;
    md += `---\n\n`;
  });

  return md;
}

/**
 * Exports all notes as JSON.
 */
export function exportNotesAsJSON(notes: UserNote[]): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      count: notes.length,
      notes,
    },
    null,
    2
  );
}
