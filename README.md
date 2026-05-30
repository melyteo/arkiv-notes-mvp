# Arkiv Notas MVP

Aplicacion Next.js para gestionar notas en Arkiv (testnet de Braga), con lecturas publicas, escrituras mediante wallet y analisis legal de documentos (PDF/TXT).

## Requisitos

- Node.js 20+
- Variables de entorno en `.env.local`:
	- `ARKIV_PROJECT_ATTRIBUTE`
	- `ARKIV_PRIVATE_KEY`
	- `ARKIV_RPC_URL` (opcional)
	- `NEXT_PUBLIC_PRIVY_APP_ID` (opcional, login)
	- `PRIVY_APP_SECRET` (opcional, uso servidor)
	- `JURIS_API_KEY` (opcional, integracion legal externa)
	- `JURIS_API_URL_PRIMARY` / `JURIS_API_URL_SECONDARY` / `JURIS_REPOS` (opcional)

## Desarrollo local

```bash
npm run dev
```

Abre `http://localhost:3000` para ver la aplicacion.

## Build de produccion

```bash
npm run build
```

## Prueba de integracion Arkiv (smoke)

```bash
npm run smoke:arkiv
```

La prueba valida el flujo completo `create -> update -> archive -> restore` contra Braga.

Nota: el script smoke usa TTL corto (`expiresIn: 60 * 60`) para pruebas. El flujo normal de la app mantiene TTL de 7 dias para notas.

## Analizador legal de documentos

Desde la UI puedes subir archivos `.pdf` o `.txt` para detectar clausulas de riesgo con reglas locales y, opcionalmente, enriquecer resultados via endpoints Juris.

El analizador:

- extrae texto del documento
- detecta hallazgos por severidad (`alta`, `media`, `baja`)
- devuelve extracto, base y sugerencia
- prueba multiples endpoints legales de forma automatica cuando estan configurados

## Login con Privy

Si `NEXT_PUBLIC_PRIVY_APP_ID` esta presente, la app habilita autenticacion con Privy en el header e intenta iniciar login automaticamente al cargar la sesion.

## Estructura funcional

- `src/app`: pagina, estilos y componentes de UI
- `src/app/actions.ts`: server actions para notas y analisis legal
- `src/services/notes.ts`: logica de negocio de notas
- `src/lib/notes`: esquema, normalizacion, mapeo y construccion de queries
- `src/lib/legal/analyzer.ts`: extraccion y analisis legal de PDF/TXT con fallback de endpoints
- `src/lib/arkiv.ts`: clientes Arkiv y validacion de entorno
- `scripts/smoke-arkiv-notes.mjs`: prueba end-to-end contra la red
