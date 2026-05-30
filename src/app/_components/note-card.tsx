"use client";

import { useFormStatus } from "react-dom";

import { archiveNoteAction, restoreNoteAction, updateNoteAction } from "@/app/actions";
import type { NoteSummary } from "@/lib/notes/entities";

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(timestamp);
}

function UpdateButton({ canWrite }: { canWrite: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
      disabled={!canWrite || pending}
    >
      {pending ? "Guardando..." : canWrite ? "Guardar cambios" : "Se requiere wallet"}
    </button>
  );
}

function StatusButton({
  canWrite,
  archived,
}: {
  canWrite: boolean;
  archived: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
        archived
          ? "border border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          : "border border-amber-300 text-amber-700 hover:bg-amber-50"
      }`}
      disabled={!canWrite || pending}
    >
      {pending ? (archived ? "Restaurando..." : "Archivando...") : archived ? "Restaurar" : "Archivar"}
    </button>
  );
}

function getStatusLabel(status: "active" | "archived") {
  return status === "active" ? "activa" : "archivada";
}

export function NoteCard({
  note,
  canWrite,
}: {
  note: NoteSummary;
  canWrite: boolean;
}) {
  return (
    <article className="rounded-[1.4rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(17,17,17,0.12)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{note.title}</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Actualizada {formatDate(note.updatedAt)}
          </p>
        </div>
        <span className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1 font-mono text-xs font-semibold text-[var(--ink-soft)]">
          {note.noteId.slice(0, 8)}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
        <span className="od-chip normal-case tracking-[0.04em]">
          coleccion: {note.collection}
        </span>
        <span className="od-chip normal-case tracking-[0.04em]">
          estado: {getStatusLabel(note.status)}
        </span>
        {note.tags.map((tag) => (
          <span key={tag} className="od-chip normal-case tracking-[0.04em]">
            #{tag}
          </span>
        ))}
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[var(--muted)]">
        {note.content}
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-4">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          {canWrite ? "Edicion y archivo habilitados" : "Configura la wallet para habilitar cambios"}
        </p>
        <details className="group w-full rounded-[1.2rem] border border-[var(--line)] bg-[var(--surface)] p-4 sm:w-auto sm:min-w-[24rem]">
          <summary className="cursor-pointer list-none text-sm font-medium text-[var(--accent)] marker:hidden">
            {canWrite ? "Editar nota" : "Editar requiere acceso de wallet"}
          </summary>

          <div className="mt-4 space-y-4">
            <form action={updateNoteAction} className="space-y-3">
              <input type="hidden" name="entityKey" value={note.entityKey} />
              <input type="hidden" name="noteId" value={note.noteId} />
              <input type="hidden" name="createdAt" value={String(note.createdAt)} />

              <label className="block space-y-2">
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
                  Titulo
                </span>
                <input
                  name="title"
                  type="text"
                  defaultValue={note.title}
                  className="w-full rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                  required
                  minLength={3}
                  maxLength={80}
                  disabled={!canWrite}
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
                    Coleccion
                  </span>
                  <input
                    name="collection"
                    type="text"
                    defaultValue={note.collection}
                    className="w-full rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                    maxLength={40}
                    disabled={!canWrite}
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
                    Etiquetas
                  </span>
                  <input
                    name="tags"
                    type="text"
                    defaultValue={note.tags.join(", ")}
                    className="w-full rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                    maxLength={120}
                    disabled={!canWrite}
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
                  Contenido
                </span>
                <textarea
                  name="content"
                  rows={5}
                  defaultValue={note.content}
                  className="w-full rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                  required
                  minLength={10}
                  maxLength={1200}
                  disabled={!canWrite}
                />
              </label>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs leading-5 text-[var(--muted)]">
                  Se conserva la fecha de creacion original y la expiracion se renueva en cada actualizacion.
                </p>
                <UpdateButton canWrite={canWrite} />
              </div>
            </form>

            <form action={note.status === "archived" ? restoreNoteAction : archiveNoteAction}>
              <input type="hidden" name="entityKey" value={note.entityKey} />
              <input type="hidden" name="noteId" value={note.noteId} />
              <input type="hidden" name="title" value={note.title} />
              <input type="hidden" name="content" value={note.content} />
              <input type="hidden" name="collection" value={note.collection} />
              <input type="hidden" name="tags" value={note.tags.join(",")} />
              <input type="hidden" name="createdAt" value={String(note.createdAt)} />
              <input type="hidden" name="updatedAt" value={String(note.updatedAt)} />
              <input type="hidden" name="archivedAt" value={String(note.archivedAt ?? "")} />
              <StatusButton canWrite={canWrite} archived={note.status === "archived"} />
            </form>
          </div>
        </details>
      </div>
    </article>
  );
}
