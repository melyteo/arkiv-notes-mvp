# Esquema Arkiv Notas MVP

Este documento es la fuente de verdad actual del modelo de entidades de Arkiv usado en este MVP.

## Convenciones globales

- Toda entidad incluye el atributo `project` proveniente de `ARKIV_PROJECT_ATTRIBUTE`.
- Los atributos numericos se almacenan como enteros para mantener soporte de consultas por rango.
- Las lecturas deben filtrar por `project` y `entityType`.
- Las escrituras se hacen con la wallet del proyecto y las lecturas confiables pueden filtrar adicionalmente por `$creator`.
- Las notas usan un `noteId` UUID estable para poder buscarlas y relacionarlas independientemente del `entityKey` de Arkiv.

## Entidad: note

Proposito: nota editable por usuario almacenada como payload JSON en Braga.

Payload

```json
{
  "noteId": "uuid",
  "title": "string",
  "content": "string",
  "collection": "string",
  "tags": ["string"],
  "status": "active | archived",
  "createdAt": 0,
  "updatedAt": 0,
  "archivedAt": null
}
```

Atributos

| Clave | Tipo | Ejemplo | Por que existe |
| --- | --- | --- | --- |
| `project` | string | `arkiv-notes-mvp-change-me` | aplica namespace de la app en Arkiv |
| `entityType` | string | `note` | separa notas de futuros tipos de entidad |
| `noteId` | string | `82c4fe6b-b8a2-4d56-8d8f-9f4207afeb1e` | identificador publico estable para busquedas y relaciones futuras |
| `status` | string | `active` / `archived` | habilita archivar/restaurar sin borrado duro |
| `collection` | string | `research` | vistas agrupadas y consultas acotadas |
| `tag_0`...`tag_7` | string | `arkiv` | claves indexadas para filtrar por etiqueta sin duplicar nombre de atributo |
| `createdAt` | number | `1748530000000` | ordenamiento y consultas por rango temporal |
| `updatedAt` | number | `1748533600000` | orden por recencia y futuros filtros de staleness |
| `archivedAt` | number | `1748537200000` | orden de archivado y futura logica de retencion |

Expiracion

- TTL por defecto: `ExpirationTime.fromDays(7)`
- Politica actual: crear, actualizar, archivar y restaurar renuevan TTL a 7 dias.
- Excepcion de pruebas: `scripts/smoke-arkiv-notes.mjs` usa TTL corto (`expiresIn: 60 * 60`) para validacion tecnica y no representa la politica de producto.

Forma actual de consulta

1. `eq(project, PROJECT_ATTRIBUTE.value)`
2. `eq(entityType, "note")`
3. Filtros opcionales: `eq(status, ...)`, `eq(collection, ...)`, `eq(noteId, ...)`, y filtro por etiqueta sobre `tag` (legacy) o `tag_0`...`tag_7`
4. `orderBy(createdAt, number, desc)` para notas activas
5. `orderBy(archivedAt, number, desc)` para notas archivadas

Politica de borrado logico

- El borrado duro ya no forma parte del flujo normal de UI.
- Archivar actualiza la entidad a `status = archived` y asigna `archivedAt`.
- Restaurar actualiza la entidad de vuelta a `status = active` y limpia `archivedAt`.

Posibles siguientes extensiones del esquema

- Atributo numerico `pinned` para notas destacadas
- `sortKey` por coleccion si se requiere orden manual
- `lastViewedAt` si la recencia del cliente debe sincronizarse de vuelta a Arkiv