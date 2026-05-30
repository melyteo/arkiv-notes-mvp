"use client";

import { useActionState } from "react";

import type { LegalAnalysisState } from "@/app/actions";
import { analyzeLegalDocumentAction } from "@/app/actions";

const INITIAL_STATE: LegalAnalysisState = {
  status: "idle",
  message: "Sube un PDF o TXT para analizar clausulas con alertas legales.",
  findings: [],
  notes: [],
};

function severityLabel(severity: "alta" | "media" | "baja") {
  if (severity === "alta") {
    return "Alta";
  }

  if (severity === "media") {
    return "Media";
  }

  return "Baja";
}

function severityClass(severity: "alta" | "media" | "baja") {
  if (severity === "alta") {
    return "border-rose-300 bg-rose-50 text-rose-900";
  }

  if (severity === "media") {
    return "border-amber-300 bg-amber-50 text-amber-900";
  }

  return "border-slate-300 bg-slate-50 text-slate-900";
}

export function LegalAnalyzer() {
  const [state, formAction, pending] = useActionState(analyzeLegalDocumentAction, INITIAL_STATE);

  return (
    <section className="panel-shell reveal-block p-6" style={{ animationDelay: "80ms" }}>
      <div className="mb-4">
        <p className="od-label">Analisis de documentos</p>
        <h2 className="mt-2 text-2xl font-semibold">Sube PDF y detecta clausulas de riesgo</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          El sistema extrae texto del documento y marca clausulas con advertencias legales. Si configuras Juris, suma validacion externa.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--foreground)]">Documento legal</span>
          <input
            name="document"
            type="file"
            accept=".pdf,.txt,application/pdf,text/plain"
            className="field-input"
            required
          />
        </label>

        <button
          type="submit"
          className="action-button px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          disabled={pending}
        >
          {pending ? "Analizando documento..." : "Analizar documento"}
        </button>
      </form>

      <div className="mt-4 rounded-[1rem] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm">
        <p className={state.status === "error" ? "text-rose-700" : "text-[var(--muted)]"}>{state.message}</p>
      </div>

      {state.notes.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[var(--muted)]">
          {state.notes.map((note) => (
            <li key={note}>- {note}</li>
          ))}
        </ul>
      ) : null}

      {state.findings.length > 0 ? (
        <div className="mt-4 space-y-3">
          {state.findings.map((finding, index) => (
            <article
              key={`${finding.title}-${index}`}
              className={`rounded-[1rem] border px-4 py-3 ${severityClass(finding.severity)}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">{finding.title}</h3>
                <span className="rounded-full border border-current px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]">
                  {severityLabel(finding.severity)}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5">{finding.excerpt}</p>
              <p className="mt-2 text-xs leading-5"><strong>Base:</strong> {finding.basis}</p>
              <p className="mt-1 text-xs leading-5"><strong>Sugerencia:</strong> {finding.recommendation}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.12em] opacity-80">Fuente: {finding.source}</p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
