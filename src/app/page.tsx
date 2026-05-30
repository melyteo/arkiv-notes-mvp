import { NoteComposer } from "@/app/_components/note-composer";
import { NoteFeed } from "@/app/_components/note-feed";
import { ReadinessPanel } from "@/app/_components/readiness-panel";
import { LegalAnalyzer } from "@/app/_components/legal-analyzer";
import { PrivyLogin } from "@/app/_components/privy-login";
import { listNotes } from "@/services/notes";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  status?: string | string[];
  message?: string | string[];
  q?: string | string[];
  collection?: string | string[];
  tag?: string | string[];
  noteId?: string | string[];
  view?: string | string[];
}>;

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function parseStatus(value?: string) {
  if (value === "active" || value === "archived" || value === "all") {
    return value;
  }

  return undefined;
}

export default async function Home(props: { searchParams?: SearchParams }) {
  const params = (await props.searchParams) ?? {};
  const status = firstValue(params.status);
  const message = firstValue(params.message);
  const { notes, config, filters, queryError } = await listNotes({
    q: firstValue(params.q),
    collection: firstValue(params.collection),
    tag: firstValue(params.tag),
    noteId: firstValue(params.noteId),
    status:
      firstValue(params.view) === "archived"
        ? "archived"
        : parseStatus(firstValue(params.status)),
  });

  return (
    <main className="min-h-screen px-5 py-8 sm:px-10 lg:px-14 lg:py-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="apple-nav rise-in px-5 py-3 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold tracking-[0.02em]">Arkiv Notas</p>
            <div className="flex items-center gap-3">
              <nav className="apple-nav-links" aria-label="Navegacion principal">
                <a href="#composer">Crear</a>
                <a href="#feed">Notas</a>
                <a href="https://explorer.braga.hoodi.arkiv.network" target="_blank" rel="noreferrer">Explorer</a>
              </nav>
              <PrivyLogin />
            </div>
          </div>
        </header>

        <section className="full-bleed apple-hero rise-in overflow-hidden">
          <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-12">
            <div className="space-y-7">
              <div className="apple-eyebrow">
                Plataforma legal · Braga testnet
              </div>
              <div className="space-y-4">
                <h1 className="hero-title max-w-4xl text-5xl sm:text-7xl">
                  El front legal
                  <br className="hidden sm:block" />
                  que se siente producto.
                </h1>
                <p className="hero-sub">
                  Experiencia minimalista de alto contraste, tipografía dominante y
                  bloques limpios para operar notas jurídicas con trazabilidad on-chain.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="#composer"
                  className="action-button px-5 py-3 text-sm"
                >
                  Crear nota ahora
                </a>
                <a
                  href="#feed"
                  className="inline-flex items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)]"
                >
                  Ver notas y filtros
                </a>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <span className="od-chip">
                  Namespace por proyecto
                </span>
                <span className="od-chip">
                  TTL de 7 dias renovable
                </span>
                <span className="od-chip">
                  Lectura publica, escritura firmada
                </span>
              </div>
              <div className="grid gap-4 pt-2 sm:grid-cols-3">
                <div className="metric-tile px-4 py-4">
                  <p className="od-label">Modelo de datos</p>
                  <p className="mt-2 text-lg font-semibold">Payload JSON con atributos consultables</p>
                </div>
                <div className="metric-tile px-4 py-4">
                  <p className="od-label">Regla de consulta</p>
                  <p className="mt-2 text-lg font-semibold">Primero project, luego entityType</p>
                </div>
                <div className="metric-tile px-4 py-4">
                  <p className="od-label">Retencion</p>
                  <p className="mt-2 text-lg font-semibold">Expira en 7 dias y se renueva en cada actualizacion</p>
                </div>
              </div>
            </div>

            <div className="lg:sticky lg:top-6">
              <ReadinessPanel config={config} />
            </div>
          </div>
          <div className="spotlight-line px-6 py-4 sm:px-8 lg:px-10">
            <p className="text-sm text-[var(--muted)]">
              Interfaz original inspirada en patrones premium de producto, adaptada al flujo de Arkiv.
            </p>
          </div>
        </section>

        <section className="narrative-grid">
          <article className="narrative-card reveal-block" style={{ animationDelay: "120ms" }}>
            <p className="od-label">Seccion 01</p>
            <h2>Descubrir contexto</h2>
            <p>
              Explora notas por coleccion, etiqueta y estado para encontrar antecedentes, dictamenes y criterios aplicables.
            </p>
          </article>
          <article className="narrative-card reveal-block" style={{ animationDelay: "180ms" }}>
            <p className="od-label">Seccion 02</p>
            <h2>Construir argumento</h2>
            <p>
              Crea entradas estructuradas con metadatos consistentes para sostener trazabilidad juridica y continuidad de trabajo.
            </p>
          </article>
          <article className="narrative-card reveal-block" style={{ animationDelay: "240ms" }}>
            <p className="od-label">Seccion 03</p>
            <h2>Validar en cadena</h2>
            <p>
              Guarda cambios en Arkiv y conserva historial de actualizacion para revisar evidencia, versiones y decisiones clave.
            </p>
          </article>
        </section>

        {message ? (
          <section
            className={`rounded-[1.5rem] border px-5 py-4 text-sm shadow-sm ${
              status === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                : "border-rose-200 bg-rose-50 text-rose-950"
            }`}
          >
            {message}
          </section>
        ) : null}

        {!message && queryError ? (
          <section className="rounded-[1.5rem] border border-amber-300 bg-amber-100 px-5 py-4 text-sm font-medium text-amber-950 shadow-sm">
            No se pudo consultar Arkiv en este momento. La interfaz sigue disponible para nuevas escrituras.
          </section>
        ) : null}

        <LegalAnalyzer />

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <NoteComposer config={config} />
          <NoteFeed notes={notes} config={config} filters={filters} />
        </section>
      </div>
    </main>
  );
}
