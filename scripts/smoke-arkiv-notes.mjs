import {
  createPublicClient,
  createWalletClient,
  http,
} from "@arkiv-network/sdk";
import { privateKeyToAccount } from "@arkiv-network/sdk/accounts";
import { braga } from "@arkiv-network/sdk/chains";
import { eq } from "@arkiv-network/sdk/query";
import { jsonToPayload } from "@arkiv-network/sdk/utils";

const project = process.env.ARKIV_PROJECT_ATTRIBUTE;
const privateKey = process.env.ARKIV_PRIVATE_KEY;
const rpcUrl = process.env.ARKIV_RPC_URL || braga.rpcUrls.default.http[0];

if (!project || project === "arkiv-notes-mvp-change-me") {
  console.error("Define un ARKIV_PROJECT_ATTRIBUTE real en .env.local antes de ejecutar la prueba smoke.");
  process.exit(1);
}

if (!privateKey || privateKey === "0xYOUR_PRIVATE_KEY") {
  console.error("Define una ARKIV_PRIVATE_KEY real en .env.local antes de ejecutar la prueba smoke.");
  process.exit(1);
}

const walletClient = createWalletClient({
  chain: braga,
  transport: http(rpcUrl),
  account: privateKeyToAccount(privateKey),
});

const publicClient = createPublicClient({
  chain: braga,
  transport: http(rpcUrl),
});

const noteId = crypto.randomUUID();
const now = Date.now();

const basePayload = {
  noteId,
  title: `Nota smoke ${noteId.slice(0, 8)}`,
  content: "Flujo smoke de Arkiv",
  collection: "smoke",
  tags: ["smoke", "arkiv"],
  status: "active",
  createdAt: now,
  updatedAt: now,
  archivedAt: null,
};

const baseAttributes = [
  { key: "project", value: project },
  { key: "entityType", value: "note" },
  { key: "noteId", value: noteId },
  { key: "status", value: "active" },
  { key: "collection", value: "smoke" },
  { key: "createdAt", value: now },
  { key: "updatedAt", value: now },
  { key: "tag_0", value: "smoke" },
  { key: "tag_1", value: "arkiv" },
];

console.log("Creando nota smoke...");
const created = await walletClient.createEntity({
  payload: jsonToPayload(basePayload),
  contentType: "application/json",
  attributes: baseAttributes,
  expiresIn: 60 * 60,
});

console.log("Creada", created.entityKey);

const activeQuery = await publicClient
  .buildQuery()
  .where([
    eq("project", project),
    eq("entityType", "note"),
    eq("noteId", noteId),
    eq("status", "active"),
  ])
  .withPayload(true)
  .withAttributes(true)
  .withMetadata(true)
  .limit(1)
  .fetch();

if (activeQuery.entities.length === 0) {
  throw new Error("Fallo en smoke create/read: no se encontro la nota despues de crearla.");
}

const updatedAt = Date.now();
console.log("Actualizando nota smoke...");
await walletClient.updateEntity({
  entityKey: created.entityKey,
  payload: jsonToPayload({
    ...basePayload,
    title: `${basePayload.title} updated`,
    updatedAt,
  }),
  contentType: "application/json",
  attributes: [
    { key: "project", value: project },
    { key: "entityType", value: "note" },
    { key: "noteId", value: noteId },
    { key: "status", value: "active" },
    { key: "collection", value: "smoke" },
    { key: "createdAt", value: now },
    { key: "updatedAt", value: updatedAt },
    { key: "tag_0", value: "smoke" },
    { key: "tag_1", value: "arkiv" },
  ],
  expiresIn: 60 * 60,
});

const archivedAt = Date.now();
console.log("Archivando nota smoke...");
await walletClient.updateEntity({
  entityKey: created.entityKey,
  payload: jsonToPayload({
    ...basePayload,
    title: `${basePayload.title} updated`,
    status: "archived",
    updatedAt: archivedAt,
    archivedAt,
  }),
  contentType: "application/json",
  attributes: [
    { key: "project", value: project },
    { key: "entityType", value: "note" },
    { key: "noteId", value: noteId },
    { key: "status", value: "archived" },
    { key: "collection", value: "smoke" },
    { key: "createdAt", value: now },
    { key: "updatedAt", value: archivedAt },
    { key: "archivedAt", value: archivedAt },
    { key: "tag_0", value: "smoke" },
    { key: "tag_1", value: "arkiv" },
  ],
  expiresIn: 60 * 60,
});

const archivedQuery = await publicClient
  .buildQuery()
  .where([
    eq("project", project),
    eq("entityType", "note"),
    eq("noteId", noteId),
    eq("status", "archived"),
  ])
  .withPayload(true)
  .withAttributes(true)
  .withMetadata(true)
  .limit(1)
  .fetch();

if (archivedQuery.entities.length === 0) {
  throw new Error("Fallo en smoke archive/read: no se encontro la nota archivada.");
}

console.log("Restaurando nota smoke...");
await walletClient.updateEntity({
  entityKey: created.entityKey,
  payload: jsonToPayload({
    ...basePayload,
    title: `${basePayload.title} updated`,
    status: "active",
    updatedAt: Date.now(),
    archivedAt: null,
  }),
  contentType: "application/json",
  attributes: [
    { key: "project", value: project },
    { key: "entityType", value: "note" },
    { key: "noteId", value: noteId },
    { key: "status", value: "active" },
    { key: "collection", value: "smoke" },
    { key: "createdAt", value: now },
    { key: "updatedAt", value: Date.now() },
    { key: "tag_0", value: "smoke" },
    { key: "tag_1", value: "arkiv" },
  ],
  expiresIn: 60 * 60,
});

console.log("Flujo smoke completado para noteId", noteId);