import "server-only";

export type Severity = "alta" | "media" | "baja";

export type ClauseFinding = {
  severity: Severity;
  title: string;
  excerpt: string;
  basis: string;
  recommendation: string;
  source: "reglas-locales" | "juris";
};

export type LegalAnalysisResult = {
  fileName: string;
  textLength: number;
  findings: ClauseFinding[];
  notes: string[];
};

type Rule = {
  severity: Severity;
  title: string;
  pattern: RegExp;
  basis: string;
  recommendation: string;
};

const LOCAL_RULES: Rule[] = [
  {
    severity: "alta",
    title: "Renuncia amplia de derechos",
    pattern: /renuncia(?:r|ncia)?\s+(?:expresa\s+)?(?:irrevocable\s+)?(?:a\s+)?(?:todo|cualquier)\s+derecho/gi,
    basis: "Posible desbalance contractual y afectacion de derechos irrenunciables.",
    recommendation: "Revisar alcance de la renuncia y limitarla a supuestos permitidos por ley.",
  },
  {
    severity: "alta",
    title: "Multa desproporcionada",
    pattern: /(penalidad|multa|clausula\s+penal).{0,80}(?:equivalente|superior).{0,60}(100%|cien\s+por\s+ciento|doble)/gi,
    basis: "La sancion podria considerarse abusiva por desproporcion.",
    recommendation: "Ajustar penalidades a criterio de razonabilidad y proporcionalidad.",
  },
  {
    severity: "media",
    title: "Prorroga automatica sin aviso claro",
    pattern: /(renovaci[oó]n|pr[oó]rroga)\s+autom[aá]tica/gi,
    basis: "La renovacion automatica sin notificacion puede generar conflicto en consumo/adhesion.",
    recommendation: "Agregar aviso previo y mecanismo simple de cancelacion.",
  },
  {
    severity: "alta",
    title: "Exclusion total de responsabilidad",
    pattern: /(exime|exoner[aá]|no\s+ser[aá]\s+responsable).{0,80}(toda|cualquier).{0,80}(responsabilidad|da[nñ]os)/gi,
    basis: "Podria ser nula por exonerar responsabilidad de forma absoluta.",
    recommendation: "Limitar exclusiones a supuestos legalmente validos y mantener deberes esenciales.",
  },
  {
    severity: "media",
    title: "Jurisdiccion potencialmente gravosa",
    pattern: /(jurisdicci[oó]n|competencia).{0,60}(exclusiva|unica).{0,60}(extranjera|otra\s+provincia)/gi,
    basis: "Podria afectar acceso efectivo a justicia para parte debil.",
    recommendation: "Evaluar foro razonable y compatibilidad con normas de orden publico.",
  },
  {
    severity: "baja",
    title: "Lenguaje ambiguo en obligaciones",
    pattern: /(a\s+criterio\s+de\s+la\s+empresa|sin\s+l[ií]mite|libremente\s+modificable)/gi,
    basis: "La redaccion ambigua puede habilitar interpretaciones discrecionales.",
    recommendation: "Precisar condiciones, plazos y alcance operativo.",
  },
];

function sanitizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function getExcerpt(fullText: string, matchIndex: number, matchLength: number) {
  const start = Math.max(0, matchIndex - 120);
  const end = Math.min(fullText.length, matchIndex + matchLength + 120);
  return sanitizeText(fullText.slice(start, end));
}

function runLocalRules(text: string) {
  const findings: ClauseFinding[] = [];
  const normalized = sanitizeText(text);

  for (const rule of LOCAL_RULES) {
    const seen = new Set<string>();

    for (const match of normalized.matchAll(rule.pattern)) {
      const index = match.index ?? 0;
      const raw = match[0] ?? "";
      const excerpt = getExcerpt(normalized, index, raw.length);
      const key = `${rule.title}:${excerpt}`;

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      findings.push({
        severity: rule.severity,
        title: rule.title,
        excerpt,
        basis: rule.basis,
        recommendation: rule.recommendation,
        source: "reglas-locales",
      });

      if (findings.length >= 25) {
        return findings;
      }
    }
  }

  return findings;
}

async function extractPdfText(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const pdfModule = await import("pdf-parse");
  const pdfParse = (pdfModule as { default?: (input: Buffer) => Promise<{ text?: string }> }).default;

  if (!pdfParse) {
    throw new Error("No se pudo cargar el parser PDF.");
  }

  const parsed = await pdfParse(buffer);
  return sanitizeText(parsed.text ?? "");
}

async function maybeRunJurisIntegration(text: string) {
  const rawTargets = [
    process.env.JURIS_API_URL,
    process.env.JURIS_API_URL_PRIMARY,
    process.env.JURIS_API_URL_SECONDARY,
    ...(process.env.JURIS_REPOS ?? "").split(",").map((value) => value.trim()),
  ].filter((value): value is string => Boolean(value));

  const pathCandidates = ["", "/analyze", "/api/analyze", "/v1/analyze"];
  const jurisTargets = rawTargets.flatMap((base) => {
    try {
      const url = new URL(base);

      // If user already passed a concrete path, try it first and then common analyze routes.
      if (url.pathname !== "/" && url.pathname !== "") {
        return [url.toString(), ...pathCandidates.slice(1).map((path) => new URL(path, url.origin).toString())];
      }

      return pathCandidates.map((path) => new URL(path, url.origin).toString());
    } catch {
      return [base];
    }
  }).filter((value, index, all) => all.indexOf(value) === index);

  const jurisKey = process.env.JURIS_API_KEY;

  if (jurisTargets.length === 0 || !jurisKey) {
    return {
      findings: [] as ClauseFinding[],
      note: "Integracion Juris no configurada (JURIS_API_URL o PRIMARY/SECONDARY + JURIS_API_KEY).",
    };
  }

  for (const target of jurisTargets) {
    try {
      const response = await fetch(target, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jurisKey}`,
        },
        body: JSON.stringify({
          text,
          maxFindings: 10,
        }),
        signal: AbortSignal.timeout(20000),
      });

      if (!response.ok) {
        continue;
      }

      const payload = (await response.json()) as {
        findings?: Array<{
          severity?: Severity;
          title?: string;
          excerpt?: string;
          basis?: string;
          recommendation?: string;
        }>;
      };

      const findings = (payload.findings ?? []).map((item) => ({
        severity: item.severity ?? "media",
        title: item.title ?? "Alerta legal externa",
        excerpt: sanitizeText(item.excerpt ?? "Sin extracto provisto por Juris."),
        basis: item.basis ?? "Sin fundamento provisto por Juris.",
        recommendation: item.recommendation ?? "Revisar clausula con asesoria especializada.",
        source: "juris" as const,
      }));

      return {
        findings,
        note: `Integracion Juris aplicada desde ${target}.`,
      };
    } catch {
      continue;
    }
  }

  return {
    findings: [] as ClauseFinding[],
    note: "No se pudo consultar ninguno de los endpoints Juris configurados.",
  };
}

export async function analyzeLegalDocument(file: File): Promise<LegalAnalysisResult> {
  const fileName = file.name || "documento";
  const lowerName = fileName.toLowerCase();
  let text = "";

  if (lowerName.endsWith(".pdf")) {
    text = await extractPdfText(file);
  } else if (lowerName.endsWith(".txt")) {
    text = sanitizeText(await file.text());
  } else {
    throw new Error("Formato no soportado. Sube PDF o TXT.");
  }

  if (!text || text.length < 80) {
    throw new Error("No se pudo extraer contenido suficiente del documento.");
  }

  const localFindings = runLocalRules(text);
  const juris = await maybeRunJurisIntegration(text);

  const findings = [...localFindings, ...juris.findings].sort((a, b) => {
    const rank = { alta: 0, media: 1, baja: 2 };
    return rank[a.severity] - rank[b.severity];
  });

  const notes = [
    `Documento analizado: ${fileName}`,
    `Caracteres procesados: ${text.length}`,
    juris.note,
  ];

  return {
    fileName,
    textLength: text.length,
    findings,
    notes,
  };
}
