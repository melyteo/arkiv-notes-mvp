import { eq, or } from "@arkiv-network/sdk/query";

import type { ProjectAttribute } from "@/lib/notes/entities";

import {
  NOTE_ARCHIVED_STATUS,
  NOTE_ENTITY_TYPE,
  NOTE_STATUS,
  type NoteFilters,
} from "@/lib/notes/entities";

export function buildNotesPredicates(
  projectAttribute: ProjectAttribute,
  filters: Pick<NoteFilters, "status" | "collection" | "tag" | "noteId">,
) {
  const tagPredicate = filters.tag
    ? or([
        eq("tag", filters.tag),
        ...Array.from({ length: 8 }, (_, index) => eq(`tag_${index}`, filters.tag as string)),
      ])
    : null;

  return [
    eq(projectAttribute.key, projectAttribute.value),
    eq("entityType", NOTE_ENTITY_TYPE),
    ...(filters.status !== "all"
      ? [eq("status", filters.status ?? NOTE_STATUS)]
      : []),
    ...(filters.collection ? [eq("collection", filters.collection)] : []),
    ...(tagPredicate ? [tagPredicate] : []),
    ...(filters.noteId ? [eq("noteId", filters.noteId)] : []),
  ];
}

export function applyDefaultNotesQueryShape<T extends {
  where(predicates: ReturnType<typeof buildNotesPredicates>): T;
  orderBy(attributeName: string, attributeType: "string" | "number", order?: "asc" | "desc"): T;
  withAttributes(withAttributes?: boolean): T;
  withMetadata(withMetadata?: boolean): T;
  withPayload(withPayload?: boolean): T;
  limit(limit: number): T;
}>(
  query: T,
  projectAttribute: ProjectAttribute,
  filters: Pick<NoteFilters, "status" | "collection" | "tag" | "noteId">,
) {
  return query
    .where(buildNotesPredicates(projectAttribute, filters))
    .orderBy(
      filters.status === NOTE_ARCHIVED_STATUS ? "archivedAt" : "createdAt",
      "number",
      "desc",
    )
    .withAttributes(true)
    .withMetadata(true)
    .withPayload(true)
    .limit(10);
}
