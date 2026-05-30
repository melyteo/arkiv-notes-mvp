import "server-only";

import {
  createPublicClient,
  createWalletClient,
  http,
} from "@arkiv-network/sdk";
import { privateKeyToAccount } from "@arkiv-network/sdk/accounts";
import { braga } from "@arkiv-network/sdk/chains";
import { z } from "zod";

const arkivEnvSchema = z.object({
  ARKIV_PROJECT_ATTRIBUTE: z.string().trim().min(8),
  ARKIV_PRIVATE_KEY: z
    .string()
    .trim()
    .regex(/^0x[a-fA-F0-9]{64}$/)
    .optional(),
  ARKIV_RPC_URL: z.url().optional(),
});

export const ARKIV_CHAIN = braga;
export const ARKIV_EXPLORER_URL = braga.blockExplorers.default.url;
export const DEFAULT_ARKIV_RPC_URL = braga.rpcUrls.default.http[0];

type ArkivEnv = z.infer<typeof arkivEnvSchema>;

export type ArkivConfigStatus = {
  chainName: string;
  rpcUrl: string;
  projectAttribute: string;
  hasProjectAttribute: boolean;
  hasPrivateKey: boolean;
  isFullyConfigured: boolean;
};

function parseArkivEnv() {
  return arkivEnvSchema.safeParse({
    ARKIV_PROJECT_ATTRIBUTE: process.env.ARKIV_PROJECT_ATTRIBUTE,
    ARKIV_PRIVATE_KEY: process.env.ARKIV_PRIVATE_KEY,
    ARKIV_RPC_URL: process.env.ARKIV_RPC_URL,
  });
}

function getArkivEnv(): ArkivEnv {
  const parsed = parseArkivEnv();

  if (!parsed.success) {
    throw new Error(
      "El entorno de Arkiv esta incompleto. Define ARKIV_PROJECT_ATTRIBUTE y, para escrituras, ARKIV_PRIVATE_KEY.",
    );
  }

  return parsed.data;
}

export function getArkivConfigStatus(): ArkivConfigStatus {
  const parsed = parseArkivEnv();

  return {
    chainName: ARKIV_CHAIN.name,
    rpcUrl:
      process.env.ARKIV_RPC_URL?.trim().length
        ? process.env.ARKIV_RPC_URL
        : DEFAULT_ARKIV_RPC_URL,
    projectAttribute: process.env.ARKIV_PROJECT_ATTRIBUTE?.trim() ?? "",
    hasProjectAttribute: Boolean(
      process.env.ARKIV_PROJECT_ATTRIBUTE?.trim().length,
    ),
    hasPrivateKey: Boolean(process.env.ARKIV_PRIVATE_KEY?.trim().length),
    isFullyConfigured: parsed.success && Boolean(parsed.data.ARKIV_PRIVATE_KEY),
  };
}

export function getProjectAttribute() {
  const env = getArkivEnv();

  return {
    key: "project",
    value: env.ARKIV_PROJECT_ATTRIBUTE,
  } as const;
}

export function getArkivCreatorAddress() {
  const env = getArkivEnv();

  if (!env.ARKIV_PRIVATE_KEY) {
    return undefined;
  }

  return privateKeyToAccount(env.ARKIV_PRIVATE_KEY as `0x${string}`).address;
}

export function createArkivPublicClient() {
  const rpcUrl = process.env.ARKIV_RPC_URL?.trim() || DEFAULT_ARKIV_RPC_URL;

  return createPublicClient({
    chain: ARKIV_CHAIN,
    transport: http(rpcUrl),
  });
}

export function createArkivWalletClient() {
  const env = getArkivEnv();

  if (!env.ARKIV_PRIVATE_KEY) {
    throw new Error(
      "ARKIV_PRIVATE_KEY es requerida antes de crear entidades en Arkiv.",
    );
  }

  return createWalletClient({
    chain: ARKIV_CHAIN,
    transport: http(env.ARKIV_RPC_URL || DEFAULT_ARKIV_RPC_URL),
    account: privateKeyToAccount(env.ARKIV_PRIVATE_KEY as `0x${string}`),
  });
}
