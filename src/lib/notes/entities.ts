import { ExpirationTime } from "@arkiv-network/sdk/utils";
import { z } from "zod";

export const NOTE_ENTITY_TYPE = "note";
export const NOTE_STATUS = "active";
export const NOTE_ARCHIVED_STATUS = "archived";
export const NOTE_EXPIRATION = ExpirationTime.fromDays(7);
export const DEFAULT_NOTE_COLLECTION = "general";

const noteTagSchema = z
  .string()
  .trim()
  .min(1)
  .max(24)
  .regex(/^[a-z0-9-]+$/);

export const noteInputSchema = z.object({
  title: z.string().trim().min(3).max(80),
  content: z.string().trim().min(10).max(1200),
  collection: z.string().trim().min(1).max(40).default(DEFAULT_NOTE_COLLECTION),
  tags: z.array(noteTagSchema).max(8).default([]),
});

export const noteEntityKeySchema = z.string().trim().regex(/^0x[a-fA-F0-9]+$/);
export const noteIdSchema = z.string().trim().uuid();

export const updateNoteInputSchema = noteInputSchema.extend({
  entityKey: noteEntityKeySchema,
  noteId: noteIdSchema,
  createdAt: z.number().int().nonnegative(),
});

export const archiveNoteInputSchema = z.object({
  entityKey: noteEntityKeySchema,
  noteId: noteIdSchema,
  title: z.string().trim().min(3).max(80),
  content: z.string().trim().min(10).max(1200),
  collection: z.string().trim().min(1).max(40),
  tags: z.array(noteTagSchema).max(8).default([]),
  createdAt: z.number().int().nonnegative(),
  updatedAt: z.number().int().nonnegative(),
});

export const restoreNoteInputSchema = archiveNoteInputSchema.extend({
  archivedAt: z.number().int().nonnegative().optional(),
});

export const noteFiltersSchema = z.object({
  status: z.enum([NOTE_STATUS, NOTE_ARCHIVED_STATUS, "all"]).default(NOTE_STATUS),
  collection: z.string().trim().max(40).optional(),
  tag: z.string().trim().max(24).optional(),
  noteId: z.string().trim().optional(),
  q: z.string().trim().max(120).optional(),
});

export const notePayloadSchema = z.object({
  noteId: noteIdSchema,
  title: z.string(),
  content: z.string(),
  collection: z.string(),
  tags: z.array(noteTagSchema),
  status: z.enum([NOTE_STATUS, NOTE_ARCHIVED_STATUS]),
  createdAt: z.number(),
  updatedAt: z.number(),
  archivedAt: z.number().nullable(),
});

export type CreateNoteInput = z.infer<typeof noteInputSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteInputSchema>;
export type ArchiveNoteInput = z.infer<typeof archiveNoteInputSchema>;
export type RestoreNoteInput = z.infer<typeof restoreNoteInputSchema>;
export type NoteFilters = z.infer<typeof noteFiltersSchema>;
export type NotePayload = z.infer<typeof notePayloadSchema>;

export type NoteSummary = {
  entityKey: string;
  noteId: string;
  title: string;
  content: string;
  collection: string;
  tags: string[];
  status: "active" | "archived";
  createdAt: number;
  updatedAt: number;
  archivedAt: number | null;
  owner?: string;
  creator?: string;
};

export type ProjectAttribute = {
  key: string;
  value: string;
};

export function buildNotePayload(input: {
  noteId: string;
  title: string;
  content: string;
  collection: string;
  tags: string[];
  status: "active" | "archived";
  createdAt: number;
  updatedAt: number;
  archivedAt: number | null;
}): NotePayload {
  return {
    noteId: input.noteId,
    title: input.title,
    content: input.content,
    collection: input.collection,
    tags: input.tags,
    status: input.status,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
    archivedAt: input.archivedAt,
  };
}

export function buildNoteAttributes(input: {
  projectAttribute: ProjectAttribute;
  noteId: string;
  collection: string;
  tags: string[];
  status: "active" | "archived";
  createdAt: number;
  updatedAt: number;
  archivedAt: number | null;
}) {
  const indexedTagAttributes = input.tags.map((tag, index) => ({
    key: `tag_${index}`,
    value: tag,
  }));

  return [
    input.projectAttribute,
    { key: "entityType", value: NOTE_ENTITY_TYPE },
    { key: "noteId", value: input.noteId },
    { key: "status", value: input.status },
    { key: "collection", value: input.collection },
    { key: "createdAt", value: input.createdAt },
    { key: "updatedAt", value: input.updatedAt },
    ...(input.archivedAt !== null ? [{ key: "archivedAt", value: input.archivedAt }] : []),
    ...indexedTagAttributes,
  ];
}

export function normalizeCollection(collection: string | undefined) {
  const normalized = collection?.trim().toLowerCase().replace(/\s+/g, "-");

  return normalized && normalized.length > 0
    ? normalized.slice(0, 40)
    : DEFAULT_NOTE_COLLECTION;
}

export function normalizeTags(input: string[] | string | undefined) {
  const values = Array.isArray(input)
    ? input
    : (input ?? "")
        .split(",")
        .map((tag) => tag.trim());

  return Array.from(
    new Set(
      values
        .map((tag) => tag.toLowerCase().replace(/\s+/g, "-"))
        .filter(Boolean),
    ),
  ).slice(0, 8);
}

export function validateNoteFilters(input: Partial<NoteFilters>) {
  return noteFiltersSchema.parse({
    status: input.status,
    collection: input.collection?.trim() || undefined,
    tag: input.tag?.trim() || undefined,
    noteId: input.noteId?.trim() || undefined,
    q: input.q?.trim() || undefined,
  });
}

export function mapEntityToNote(entity: {
  key: string;
  owner?: string;
  creator?: string;
  toJson: () => unknown;
}) {
  try {
    const payload = notePayloadSchema.parse(entity.toJson());

    return {
      entityKey: entity.key,
      noteId: payload.noteId,
      title: payload.title,
      content: payload.content,
      collection: payload.collection,
      tags: payload.tags,
      status: payload.status,
      createdAt: payload.createdAt,
      updatedAt: payload.updatedAt,
      archivedAt: payload.archivedAt,
      owner: entity.owner,
      creator: entity.creator,
    } satisfies NoteSummary;
  } catch {
    return null;
  }
}
