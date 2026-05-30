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
  throw new Error("ARKIV_PROJECT_ATTRIBUTE no esta configurado para pruebas reales.");
}

if (!privateKey || privateKey === "0xYOUR_PRIVATE_KEY") {
  throw new Error("ARKIV_PRIVATE_KEY no esta configurada para pruebas reales.");
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

function timeout(ms, label) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Timeout en ${label} (${ms}ms)`)), ms);
  });
}

const noteId = crypto.randomUUID();
const now = Date.now();

const createPayload = {
  noteId,
  title: `Proof create ${noteId.slice(0, 8)}`,
  content: "Proof transaction on Braga",
  collection: "proof",
  tags: ["proof", "braga"],
  status: "active",
  createdAt: now,
  updatedAt: now,
  archivedAt: null,
};

const createAttributes = [
  { key: "project", value: project },
  { key: "entityType", value: "note" },
  { key: "noteId", value: noteId },
  { key: "status", value: "active" },
  { key: "collection", value: "proof" },
  { key: "createdAt", value: now },
  { key: "updatedAt", value: now },
  { key: "tag_0", value: "proof" },
  { key: "tag_1", value: "braga" },
];

const created = await Promise.race([
  walletClient.createEntity({
    payload: jsonToPayload(createPayload),
    contentType: "application/json",
    attributes: createAttributes,
    expiresIn: 60 * 60,
  }),
  timeout(120000, "createEntity"),
]);

const createQuery = await Promise.race([
  publicClient
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
    .fetch(),
  timeout(60000, "query after create"),
]);

if (!createQuery.entities.length) {
  throw new Error("No se encontro la entidad tras createEntity.");
}

const updatedAt = Date.now();

const updated = await Promise.race([
  walletClient.updateEntity({
    entityKey: created.entityKey,
    payload: jsonToPayload({
      ...createPayload,
      title: `${createPayload.title} updated`,
      updatedAt,
    }),
    contentType: "application/json",
    attributes: [
      { key: "project", value: project },
      { key: "entityType", value: "note" },
      { key: "noteId", value: noteId },
      { key: "status", value: "active" },
      { key: "collection", value: "proof" },
      { key: "createdAt", value: now },
      { key: "updatedAt", value: updatedAt },
      { key: "tag_0", value: "proof" },
      { key: "tag_1", value: "braga" },
    ],
    expiresIn: 60 * 60,
  }),
  timeout(120000, "updateEntity"),
]);

const verify = await Promise.race([
  publicClient
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
    .fetch(),
  timeout(60000, "query after update"),
]);

const payloadTitle = verify.entities[0]?.payload?.title;

console.log("PROOF_NOTE_ID", noteId);
console.log("PROOF_ENTITY_KEY", created.entityKey);
console.log("PROOF_CREATE_RESULT", JSON.stringify(created));
console.log("PROOF_UPDATE_RESULT", JSON.stringify(updated));
console.log("PROOF_UPDATED_TITLE", payloadTitle ?? "N/A");
console.log("PROOF_PROJECT", project);
