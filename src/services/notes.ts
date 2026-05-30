import "server-only";

import { jsonToPayload } from "@arkiv-network/sdk/utils";

import {
  createArkivPublicClient,
  createArkivWalletClient,
  getArkivConfigStatus,
  getArkivCreatorAddress,
  getProjectAttribute,
} from "@/lib/arkiv";
import {
  ArchiveNoteInput,
  archiveNoteInputSchema,
  buildNoteAttributes,
  buildNotePayload,
  CreateNoteInput,
  mapEntityToNote,
  normalizeCollection,
  normalizeTags,
  NoteFilters,
  NOTE_EXPIRATION,
  NOTE_STATUS,
  NOTE_ARCHIVED_STATUS,
  NoteSummary,
  noteInputSchema,
  RestoreNoteInput,
  restoreNoteInputSchema,
  validateNoteFilters,
  UpdateNoteInput,
  updateNoteInputSchema,
} from "@/lib/notes/entities";
import { LEGAL_MOCK_DOCUMENTS } from "@/lib/legal/mock-documents";
import { applyDefaultNotesQueryShape } from "@/lib/notes/query";

export function validateNoteInput(input: CreateNoteInput) {
  return noteInputSchema.parse(input);
}

export function validateUpdateNoteInput(input: UpdateNoteInput) {
  return updateNoteInputSchema.parse(input);
}

export function validateArchiveNoteInput(input: ArchiveNoteInput) {
  return archiveNoteInputSchema.parse(input);
}

export function validateRestoreNoteInput(input: RestoreNoteInput) {
  return restoreNoteInputSchema.parse(input);
}

export async function listNotes(filters: Partial<NoteFilters> = {}) {
  const config = getArkivConfigStatus();
  const validatedFilters = validateNoteFilters(filters);

  if (!config.hasProjectAttribute) {
    return {
      notes: [] as NoteSummary[],
      config,
      filters: validatedFilters,
    };
  }

  const publicClient = createArkivPublicClient();
  const projectAttribute = getProjectAttribute();
  const creatorAddress = config.hasPrivateKey ? getArkivCreatorAddress() : undefined;

  let query = applyDefaultNotesQueryShape(
    publicClient.buildQuery(),
    projectAttribute,
    validatedFilters,
  );

  if (creatorAddress) {
    query = query.createdBy(creatorAddress);
  }

  try {
    const result = await query.fetch();
    const notes = result.entities.reduce<NoteSummary[]>((accumulator, entity) => {
      const note = mapEntityToNote(entity);

      if (note) {
        accumulator.push(note);
      }

      return accumulator;
    }, []).filter((note) => {
      if (!validatedFilters.q) {
        return true;
      }

      const search = validatedFilters.q.toLowerCase();

      return (
        note.title.toLowerCase().includes(search) ||
        note.content.toLowerCase().includes(search) ||
        note.collection.toLowerCase().includes(search) ||
        note.tags.some((tag) => tag.includes(search))
      );
    });

    return { notes, config, filters: validatedFilters };
  } catch {
    return {
      notes: [] as NoteSummary[],
      config,
      filters: validatedFilters,
      queryError: "No se pudo consultar Arkiv en este momento. La interfaz sigue disponible para nuevas escrituras.",
    };
  }
}

export async function createNote(input: CreateNoteInput) {
  const data = validateNoteInput(input);
  const walletClient = createArkivWalletClient();
  const projectAttribute = getProjectAttribute();
  const now = Date.now();
  const noteId = crypto.randomUUID();
  const collection = normalizeCollection(data.collection);
  const tags = normalizeTags(data.tags);

  return walletClient.createEntity({
    payload: jsonToPayload(
      buildNotePayload({
        noteId,
        title: data.title,
        content: data.content,
        collection,
        tags,
        status: NOTE_STATUS,
        createdAt: now,
        updatedAt: now,
        archivedAt: null,
      }),
    ),
    contentType: "application/json",
    attributes: buildNoteAttributes({
      projectAttribute,
      noteId,
      collection,
      tags,
      status: NOTE_STATUS,
      createdAt: now,
      updatedAt: now,
      archivedAt: null,
    }),
    expiresIn: NOTE_EXPIRATION,
  });
}

export async function updateNote(input: UpdateNoteInput) {
  const data = validateUpdateNoteInput(input);
  const walletClient = createArkivWalletClient();
  const projectAttribute = getProjectAttribute();
  const now = Date.now();
  const collection = normalizeCollection(data.collection);
  const tags = normalizeTags(data.tags);

  return walletClient.updateEntity({
    entityKey: data.entityKey as `0x${string}`,
    payload: jsonToPayload(
      buildNotePayload({
        noteId: data.noteId,
        title: data.title,
        content: data.content,
        collection,
        tags,
        status: NOTE_STATUS,
        createdAt: data.createdAt,
        updatedAt: now,
        archivedAt: null,
      }),
    ),
    contentType: "application/json",
    attributes: buildNoteAttributes({
      projectAttribute,
      noteId: data.noteId,
      collection,
      tags,
      status: NOTE_STATUS,
      createdAt: data.createdAt,
      updatedAt: now,
      archivedAt: null,
    }),
    expiresIn: NOTE_EXPIRATION,
  });
}

export async function archiveNote(input: ArchiveNoteInput) {
  const data = validateArchiveNoteInput(input);
  const walletClient = createArkivWalletClient();
  const projectAttribute = getProjectAttribute();
  const archivedAt = Date.now();
  const collection = normalizeCollection(data.collection);
  const tags = normalizeTags(data.tags);

  return walletClient.updateEntity({
    entityKey: data.entityKey as `0x${string}`,
    payload: jsonToPayload(
      buildNotePayload({
        noteId: data.noteId,
        title: data.title,
        content: data.content,
        collection,
        tags,
        status: NOTE_ARCHIVED_STATUS,
        createdAt: data.createdAt,
        updatedAt: archivedAt,
        archivedAt,
      }),
    ),
    contentType: "application/json",
    attributes: buildNoteAttributes({
      projectAttribute,
      noteId: data.noteId,
      collection,
      tags,
      status: NOTE_ARCHIVED_STATUS,
      createdAt: data.createdAt,
      updatedAt: archivedAt,
      archivedAt,
    }),
    expiresIn: NOTE_EXPIRATION,
  });
}

export async function restoreNote(input: RestoreNoteInput) {
  const data = validateRestoreNoteInput(input);
  const walletClient = createArkivWalletClient();
  const projectAttribute = getProjectAttribute();
  const restoredAt = Date.now();
  const collection = normalizeCollection(data.collection);
  const tags = normalizeTags(data.tags);

  return walletClient.updateEntity({
    entityKey: data.entityKey as `0x${string}`,
    payload: jsonToPayload(
      buildNotePayload({
        noteId: data.noteId,
        title: data.title,
        content: data.content,
        collection,
        tags,
        status: NOTE_STATUS,
        createdAt: data.createdAt,
        updatedAt: restoredAt,
        archivedAt: null,
      }),
    ),
    contentType: "application/json",
    attributes: buildNoteAttributes({
      projectAttribute,
      noteId: data.noteId,
      collection,
      tags,
      status: NOTE_STATUS,
      createdAt: data.createdAt,
      updatedAt: restoredAt,
      archivedAt: null,
    }),
    expiresIn: NOTE_EXPIRATION,
  });
}

export async function createLegalMockNotes() {
  const MAX_DOCUMENTS = 6;
  const PER_DOCUMENT_TIMEOUT_MS = 15000;
  let created = 0;
  let failed = 0;

  for (const document of LEGAL_MOCK_DOCUMENTS.slice(0, MAX_DOCUMENTS)) {
    try {
      await Promise.race([
        createNote({
          title: document.title,
          content: document.content,
          collection: document.collection,
          tags: document.tags,
        }),
        new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error("Tiempo de espera agotado al crear documento legal de ejemplo."));
          }, PER_DOCUMENT_TIMEOUT_MS);
        }),
      ]);

      created += 1;
    } catch {
      failed += 1;
    }
  }

  return {
    created,
    failed,
    attempted: Math.min(MAX_DOCUMENTS, LEGAL_MOCK_DOCUMENTS.length),
  };
}
