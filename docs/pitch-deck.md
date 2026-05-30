# Pitch Deck - Arkiv Notas MVP

## Slide 1 - Titulo
Arkiv Notas MVP

Subtitulo:
Memoria legal verificable para equipos que necesitan contexto, trazabilidad y velocidad.

Datos de portada:
- Equipo: Melyteo
- Track: IA sobre Arkiv
- Demo: https://arkiv-notes-mvp.vercel.app

Nota de orador:
Hoy les mostramos una aplicacion legal que combina experiencia de producto con datos verificables en Arkiv.

---

## Slide 2 - Problema
Los equipos legales y de compliance trabajan con informacion fragmentada:

- Notas sueltas en docs y chats
- Dificultad para auditar cambios y decisiones
- Poca reutilizacion del conocimiento
- Riesgo de perder contexto entre personas y herramientas

Impacto:
menos velocidad, mas errores y baja trazabilidad.

Nota de orador:
El problema no es solo guardar notas, es preservar el contexto correcto y demostrar como evoluciono.

---

## Slide 3 - Solucion
Arkiv Notas MVP centraliza y estructura memoria legal operativa:

- Notas con metadata consultable (coleccion, tags, estado)
- Flujo CRUD con versionado operativo
- Analizador legal de PDF/TXT para detectar clausulas de riesgo
- Persistencia en Arkiv Braga para trazabilidad verificable

Resultado:
contexto portable, auditable y listo para accion.

---

## Slide 4 - Producto en 30 segundos
Flujo de usuario:

1. Inicia sesion con Privy
2. Crea nota o carga demo mock
3. Consulta y filtra por estado, coleccion y texto
4. Analiza documento legal y obtiene alertas
5. Actualiza o archiva, manteniendo trazabilidad

Nota de orador:
La UX esta pensada para que en minutos un equipo tenga su base de decisiones legales activa.

---

## Slide 5 - Diferencial tecnico
Por que no es solo otra app de notas:

- Capa de datos: Arkiv (Braga)
- Atributos indexables para queries precisas
- Escritura firmada con wallet
- Namespace de proyecto para evitar cruces de datos
- TTL y renovacion de entidades en actualizaciones

Mensaje clave:
la memoria no solo se guarda, se puede consultar y verificar.

---

## Slide 6 - Evidencia de ejecucion real (Proof)
Transacciones efectivas en Braga:

- Create tx
https://explorer.braga.hoodi.arkiv.network/tx/0x483e2056572993e273183a3e882fdefa33926f673b0bf88eede2281a2ec77cd7

- Update tx
https://explorer.braga.hoodi.arkiv.network/tx/0xe59e57f49874746bd6af6ccdf720a5e007d543fa438b338c504d897a9207f111

Proyecto activo:
arkiv-notes-mvp-prod-20260530

Nota de orador:
No es mock de blockchain. Son escrituras reales verificables en explorer.

---

## Slide 7 - Demo en vivo
URL:
https://arkiv-notes-mvp.vercel.app

Checklist visible en app:

- Estado Arkiv al 100%
- Atributo de proyecto listo
- Wallet de escritura lista
- Boton Cargar demo mock

Guion de demo (45 segundos):

1. Mostrar panel de estado
2. Pulsar Cargar demo mock
3. Mostrar feed y filtros
4. Subir PDF/TXT al analizador
5. Mostrar alertas y recomendaciones

---

## Slide 8 - Arquitectura
Componentes principales:

- Frontend: Next.js App Router
- Auth: Privy
- Backend actions: server actions en Next.js
- Data layer: Arkiv SDK (@arkiv-network/sdk)
- Motor legal: reglas locales + fallback Juris opcional

Repositorio:
https://github.com/melyteo/arkiv-notes-mvp

---

## Slide 9 - Valor para mercado
Usuarios objetivo:

- Estudios juridicos
- Equipos de compliance
- Operaciones legales internas

Beneficios:

- Menos tiempo buscando contexto
- Mejor handoff entre integrantes
- Registro verificable de decisiones
- Base de conocimiento reutilizable para IA

---

## Slide 10 - Roadmap
Proximos hitos:

- Multiusuario con permisos por rol
- Timeline de cambios por entidad
- Mejora de ranking en busqueda semantica
- Plantillas de analisis por tipo de contrato
- Dashboard de riesgo agregado

Objetivo:
pasar de MVP funcional a producto adoptable por equipos legales reales.

---

## Slide 11 - Modelo de negocio
Estrategia inicial:

- B2B SaaS por asiento + volumen de entidades
- Plan equipo pequeno para adopcion rapida
- Plan enterprise con auditoria, SSO y gobernanza

Entrada al mercado:

- Equipos legales tech-first
- Comunidades web3 y compliance early adopters

---

## Slide 12 - Cierre
Arkiv Notas MVP convierte notas legales en memoria verificable y accionable.

Lo que ya logramos:

- Producto desplegado
- Flujo end-to-end funcional
- Pruebas de transaccion reales en Braga

Pedido al jurado:
apoyo para escalar este MVP a la herramienta de referencia para memoria legal con trazabilidad on-chain.

Contacto:
- Demo: https://arkiv-notes-mvp.vercel.app
- Repo: https://github.com/melyteo/arkiv-notes-mvp
