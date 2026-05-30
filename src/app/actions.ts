"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ZodError } from "zod";

import {
  archiveNote,
  createNote,
  restoreNote,
  updateNote,
} from "@/services/notes";
import { normalizeCollection, normalizeTags } from "@/lib/notes/entities";
import { analyzeLegalDocument, ClauseFinding } from "@/lib/legal/analyzer";

async function redirectWithState(status: "success" | "error", message: string) {
  const headerStore = await headers();
  const referer = headerStore.get("referer");
  const fallbackOrigin = headerStore.get("origin") ?? "http://localhost:3000";
  const destination = new URL(referer ?? "/", fallbackOrigin);

  destination.searchParams.set("status", status);
  destination.searchParams.set("message", message);

  redirect(`${destination.pathname}?${destination.searchParams.toString()}`);
}

function getNoteMutationErrorMessage(error: unknown) {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? "Entrada de nota invalida.";
  }

  if (!(error instanceof Error)) {
    return "No se pudo crear la nota en Arkiv.";
  }

  if (error.message.includes("ARKIV_PRIVATE_KEY")) {
    return "Define ARKIV_PRIVATE_KEY antes de crear notas.";
  }

  if (
    error.message.includes("Arkiv environment is incomplete") ||
    error.message.includes("El entorno de Arkiv esta incompleto")
  ) {
    return "Completa la configuracion del entorno de Arkiv antes de crear notas.";
  }

  return "Arkiv rechazo la solicitud de escritura. Revisa la wallet, el atributo de proyecto y la configuracion RPC de Braga.";
}

export async function createNoteAction(formData: FormData) {
  try {
    await createNote({
      title: String(formData.get("title") ?? ""),
      content: String(formData.get("content") ?? ""),
      collection: normalizeCollection(String(formData.get("collection") ?? "")),
      tags: normalizeTags(String(formData.get("tags") ?? "")),
    });
  } catch (error) {
    await redirectWithState("error", getNoteMutationErrorMessage(error));
  }

  revalidatePath("/");
  await redirectWithState("success", "Nota guardada en Arkiv.");
}

export type LegalAnalysisState = {
  status: "idle" | "success" | "error";
  message: string;
  findings: ClauseFinding[];
  notes: string[];
};

export async function analyzeLegalDocumentAction(
  _previousState: LegalAnalysisState,
  formData: FormData,
): Promise<LegalAnalysisState> {
  const fileValue = formData.get("document");

  if (!(fileValue instanceof File)) {
    return {
      status: "error",
      message: "No se recibio ningun archivo.",
      findings: [],
      notes: [],
    };
  }

  if (fileValue.size === 0) {
    return {
      status: "error",
      message: "El archivo esta vacio.",
      findings: [],
      notes: [],
    };
  }

  if (fileValue.size > 12 * 1024 * 1024) {
    return {
      status: "error",
      message: "El archivo supera 12MB. Sube una version mas liviana.",
      findings: [],
      notes: [],
    };
  }

  try {
    const result = await analyzeLegalDocument(fileValue);

    return {
      status: "success",
      message:
        result.findings.length > 0
          ? `Analisis finalizado: ${result.findings.length} alerta(s) detectada(s).`
          : "Analisis finalizado: no se detectaron alertas con las reglas actuales.",
      findings: result.findings,
      notes: result.notes,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "No se pudo analizar el documento.",
      findings: [],
      notes: [],
    };
  }
}

export async function updateNoteAction(formData: FormData) {
  try {
    await updateNote({
      entityKey: String(formData.get("entityKey") ?? ""),
      noteId: String(formData.get("noteId") ?? ""),
      title: String(formData.get("title") ?? ""),
      content: String(formData.get("content") ?? ""),
      collection: normalizeCollection(String(formData.get("collection") ?? "")),
      tags: normalizeTags(String(formData.get("tags") ?? "")),
      createdAt: Number(formData.get("createdAt") ?? 0),
    });
  } catch (error) {
    await redirectWithState("error", getNoteMutationErrorMessage(error));
  }

  revalidatePath("/");
  await redirectWithState("success", "Nota actualizada en Arkiv.");
}

export async function archiveNoteAction(formData: FormData) {
  try {
    await archiveNote({
      entityKey: String(formData.get("entityKey") ?? ""),
      noteId: String(formData.get("noteId") ?? ""),
      title: String(formData.get("title") ?? ""),
      content: String(formData.get("content") ?? ""),
      collection: normalizeCollection(String(formData.get("collection") ?? "")),
      tags: normalizeTags(String(formData.get("tags") ?? "")),
      createdAt: Number(formData.get("createdAt") ?? 0),
      updatedAt: Number(formData.get("updatedAt") ?? 0),
    });
  } catch (error) {
    await redirectWithState("error", getNoteMutationErrorMessage(error));
  }

  revalidatePath("/");
  await redirectWithState("success", "Nota archivada en Arkiv.");
}

export async function restoreNoteAction(formData: FormData) {
  try {
    await restoreNote({
      entityKey: String(formData.get("entityKey") ?? ""),
      noteId: String(formData.get("noteId") ?? ""),
      title: String(formData.get("title") ?? ""),
      content: String(formData.get("content") ?? ""),
      collection: normalizeCollection(String(formData.get("collection") ?? "")),
      tags: normalizeTags(String(formData.get("tags") ?? "")),
      createdAt: Number(formData.get("createdAt") ?? 0),
      updatedAt: Number(formData.get("updatedAt") ?? 0),
      archivedAt: Number(formData.get("archivedAt") ?? 0) || undefined,
    });
  } catch (error) {
    await redirectWithState("error", getNoteMutationErrorMessage(error));
  }

  revalidatePath("/");
  await redirectWithState("success", "Nota restaurada en Arkiv.");
}
