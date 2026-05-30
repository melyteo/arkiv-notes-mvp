import { ARKIV_EXPLORER_URL } from "@/lib/arkiv";
import type { ArkivConfigStatus } from "@/lib/arkiv";

export function ReadinessPanel({ config }: { config: ArkivConfigStatus }) {
  const readyCount = Number(config.hasProjectAttribute) + Number(config.hasPrivateKey);
  const readiness = `${Math.round((readyCount / 2) * 100)}%`;

  return (
    <aside className="od-shell p-5">
      <div className="space-y-4">
        <div>
          <p className="od-label">
            Configuracion
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Estado de Arkiv</h2>
        </div>
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
          <div className="mb-2 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
            <span>Preparacion del entorno</span>
            <span className="font-semibold text-[var(--foreground)]">{readiness}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[color:color-mix(in_srgb,var(--line)_60%,white)]">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
              style={{ width: readiness }}
            />
          </div>
        </div>
        <dl className="space-y-3 text-sm text-[var(--muted)]">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
            <dt>Atributo de proyecto</dt>
            <dd className={`font-medium ${config.hasProjectAttribute ? "text-emerald-700" : "text-rose-700"}`}>
              {config.hasProjectAttribute ? "Listo" : "Falta"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
            <dt>Wallet de escritura</dt>
            <dd className={`font-medium ${config.hasPrivateKey ? "text-emerald-700" : "text-rose-700"}`}>
              {config.hasPrivateKey ? "Lista" : "Falta"}
            </dd>
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
            <dt className="mb-1">Endpoint RPC</dt>
            <dd className="break-all font-mono text-xs text-[var(--foreground)]">
              {config.rpcUrl}
            </dd>
          </div>
        </dl>
        <p className="text-sm leading-6 text-[var(--muted)]">
          Define <span className="font-mono text-[var(--foreground)]">ARKIV_PROJECT_ATTRIBUTE</span> y <span className="font-mono text-[var(--foreground)]">ARKIV_PRIVATE_KEY</span> en tu entorno local para habilitar escrituras y pruebas end-to-end.
        </p>
        <a
          className="inline-flex items-center text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-strong)]"
          href={ARKIV_EXPLORER_URL}
          target="_blank"
          rel="noreferrer"
        >
          Abrir explorador de Braga
        </a>
      </div>
    </aside>
  );
}
