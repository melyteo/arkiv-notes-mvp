"use client";

import { useFormStatus } from "react-dom";

import type { ArkivConfigStatus } from "@/lib/arkiv";

import { createNoteAction } from "@/app/actions";

function SubmitButton({ isReady }: { isReady: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="action-button px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
      disabled={!isReady || pending}
    >
      {pending
        ? "Guardando en Arkiv..."
        : isReady
          ? "Crear mi nota"
          : "Completa el entorno para habilitar escrituras"}
    </button>
  );
}

export function NoteComposer({ config }: { config: ArkivConfigStatus }) {
  return (
    <div id="composer" className="panel-shell rise-in reveal-block p-6" style={{ animationDelay: "120ms" }}>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="od-label">
            Crear entidad
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Nueva nota</h2>
        </div>
        <div className="od-chip">
          {config.isFullyConfigured ? "Wallet lista" : "Entorno pendiente"}
        </div>
      </div>

      <form action={createNoteAction} className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--foreground)]">Titulo</span>
          <input
            name="title"
            type="text"
            placeholder="Ej: Definir estrategia de indexacion"
            className="field-input"
            required
            minLength={3}
            maxLength={80}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[var(--foreground)]">Coleccion</span>
            <input
              name="collection"
              type="text"
              placeholder="general"
              defaultValue="general"
              className="field-input"
              maxLength={40}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-[var(--foreground)]">Etiquetas</span>
            <input
              name="tags"
              type="text"
              placeholder="arkiv, backlog, arquitectura"
              className="field-input"
              maxLength={120}
            />
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--foreground)]">Contenido</span>
          <textarea
            name="content"
            rows={7}
            placeholder="Escribe contexto, decision tomada, pasos siguientes y referencias clave."
            className="field-input"
            required
            minLength={10}
            maxLength={1200}
          />
        </label>

        <div className="od-shell flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <p className="max-w-sm text-sm leading-6 text-[var(--muted)]">
            Cada nota se guarda con id estable, coleccion, etiquetas y timestamps numericos para poder filtrar y ordenar sin ambiguedades.
          </p>
          <SubmitButton isReady={config.isFullyConfigured} />
        </div>

        <p className="text-xs leading-5 text-[var(--muted)]">
          Usa este formulario para guardar conclusiones y seguimiento luego del analisis documental.
        </p>
      </form>
    </div>
  );
}
