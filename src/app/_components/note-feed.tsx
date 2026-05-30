import type { ArkivConfigStatus } from "@/lib/arkiv";
import type { NoteFilters, NoteSummary } from "@/lib/notes/entities";
import { NoteCard } from "@/app/_components/note-card";

function groupNotesByCollection(notes: NoteSummary[]) {
  return notes.reduce<Record<string, NoteSummary[]>>((groups, note) => {
    const key = note.collection;

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(note);
    return groups;
  }, {});
}

export function NoteFeed({
  notes,
  config,
  filters,
}: {
  notes: NoteSummary[];
  config: ArkivConfigStatus;
  filters: NoteFilters;
}) {
  const groups = groupNotesByCollection(notes);
  const hasActiveFilters = Boolean(
    filters.q ||
      filters.collection ||
      filters.tag ||
      filters.noteId ||
      filters.status !== "active",
  );
  const statusOptions = [
    { label: "Activas", value: "active" },
    { label: "Archivadas", value: "archived" },
    { label: "Todas", value: "all" },
  ] as const;

  return (
    <div id="feed" className="panel-shell rise-in p-6" style={{ animationDelay: "90ms" }}>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="od-label">
            Entidades consultadas
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Notas disponibles</h2>
        </div>
        <span className="od-chip">
          {notes.length} resultado{notes.length === 1 ? "" : "s"}
        </span>
      </div>

      {config.hasProjectAttribute ? (
        <p className="mb-4 text-sm leading-6 text-[var(--muted)]">
          Estas notas se consultan con el atributo compartido del proyecto y el tipo de entidad para evitar cruces con otros datos.
        </p>
      ) : (
        <p className="mb-4 text-sm leading-6 text-[var(--muted)]">
          Define primero el atributo de proyecto. Arkiv es publico y este namespace evita mezclar datos de otras apps.
        </p>
      )}

      <form className="mb-5 space-y-3 rounded-[1.3rem] border border-[var(--line)] bg-[var(--surface-strong)] p-4 shadow-[0_12px_26px_rgba(56,35,20,0.08)]">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1.1fr_1fr_1fr]">
        <input
          name="q"
          type="search"
          placeholder="Buscar por titulo, contenido o etiqueta"
          defaultValue={filters.q ?? ""}
          className="field-input bg-[var(--surface)]"
        />
        <input
          name="collection"
          type="text"
          placeholder="Coleccion"
          defaultValue={filters.collection ?? ""}
          className="field-input bg-[var(--surface)]"
        />
        <input
          name="tag"
          type="text"
          placeholder="Etiqueta"
          defaultValue={filters.tag ?? ""}
          className="field-input bg-[var(--surface)]"
        />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] p-1">
            {statusOptions.map((option) => (
              <label key={option.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value={option.value}
                  defaultChecked={filters.status === option.value}
                  className="sr-only"
                />
                <span
                  className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                    filters.status === option.value
                      ? "bg-[var(--accent)] text-white"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {option.label}
                </span>
              </label>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters ? (
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--foreground)]"
              >
                Limpiar filtros
              </a>
            ) : null}
            <button
              type="submit"
              className="action-button px-5 py-3 text-sm"
            >
              Filtrar notas
            </button>
          </div>
        </div>
      </form>

      <div className="space-y-4 [content-visibility:auto]">
        {notes.length > 0 ? (
          Object.entries(groups).map(([collection, collectionNotes]) => (
            <section key={collection} className="space-y-3">
              <div className="flex items-center justify-between gap-3 rounded-[1rem] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 shadow-[0_8px_18px_rgba(56,35,20,0.08)]">
                <div>
                  <h3 className="text-lg font-semibold capitalize">{collection}</h3>
                  <p className="text-sm text-[var(--muted)]">
                    {collectionNotes.length} nota{collectionNotes.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              {collectionNotes.map((note) => (
                <NoteCard key={note.entityKey} note={note} canWrite={config.isFullyConfigured} />
              ))}
            </section>
          ))
        ) : (
          <div className="rounded-[1.4rem] border border-dashed border-[var(--line)] bg-[var(--surface-strong)] px-5 py-10 text-center text-sm leading-6 text-[var(--muted)]">
            Aun no hay resultados para esta vista. Crea tu primera nota o ajusta los filtros para encontrarla mas rapido.
          </div>
        )}
      </div>
    </div>
  );
}
