export type LegalMockDocument = {
  title: string;
  content: string;
  collection: string;
  tags: string[];
};

export const LEGAL_MOCK_DOCUMENTS: LegalMockDocument[] = [
  {
    title: "Analisis preliminar de ley de modernizacion laboral",
    content:
      "Resumen ejecutivo para estudio interno: identificar impactos operativos sobre contratacion, extincion y cargas administrativas. Incluir alertas por vigencia, articulos transitorios y necesidad de adaptar modelos de telegrama laboral.",
    collection: "legal-laboral",
    tags: ["ley", "laboral", "infoleg", "vigencia"],
  },
  {
    title: "Matriz de cumplimiento para decreto reglamentario",
    content:
      "Documento de trabajo para mapear obligaciones por area: juridico, compliance y operaciones. Se listan hitos de implementacion, fechas de control y evidencia documental exigible para auditoria interna.",
    collection: "legal-regulatorio",
    tags: ["decreto", "cumplimiento", "regulatorio", "auditoria"],
  },
  {
    title: "Guia de lectura de resolucion administrativa",
    content:
      "Plantilla para extraer alcance subjetivo, alcance objetivo, autoridad de aplicacion y vias recursivas. Incluye checklist de validez formal y puntos para preparar pronto despacho o recurso jerarquico.",
    collection: "legal-administrativo",
    tags: ["resolucion", "administrativo", "recursos", "procedimiento"],
  },
  {
    title: "Ficha de jurisprudencia sobre dano punitivo",
    content:
      "Registro sintetico de precedente con hechos, ratio decidendi y criterio de cuantificacion. Se agrega semaforo de riesgo para litigio de consumo y recomendaciones de redaccion contractual preventiva.",
    collection: "legal-jurisprudencia",
    tags: ["jurisprudencia", "consumo", "danos", "litigio"],
  },
  {
    title: "Borrador de dictamen sobre proteccion de datos",
    content:
      "Nota interna orientada a evaluar base legal del tratamiento, minimizacion de datos y medidas de seguridad. Se incorporan observaciones sobre transferencias internacionales y plan de remediacion.",
    collection: "legal-privacidad",
    tags: ["dictamen", "datos-personales", "compliance", "riesgo"],
  },
  {
    title: "Resumen de contrato de servicios profesionales",
    content:
      "Version de referencia para revision de clausulas economicas, propiedad intelectual, confidencialidad y terminacion anticipada. Contiene red flags frecuentes para negociacion con proveedores tecnologicos.",
    collection: "legal-contratos",
    tags: ["contrato", "servicios", "red-flags", "negociacion"],
  },
  {
    title: "Control de expediente contencioso administrativo",
    content:
      "Bitacora para seguimiento de actos impugnables, plazos de caducidad y estrategia probatoria. Se estructura por etapa: sede administrativa, agotamiento de via y demanda judicial.",
    collection: "legal-expedientes",
    tags: ["expediente", "contencioso", "plazos", "estrategia"],
  },
  {
    title: "Nota tecnica de antecedentes normativos",
    content:
      "Documento base para compilar antecedentes legislativos y reglamentarios relevantes al caso. Se prioriza trazabilidad de fuente oficial y estado de vigencia para evitar citas desactualizadas.",
    collection: "legal-fuentes",
    tags: ["antecedentes", "normativa", "fuentes", "infoleg"],
  },
];