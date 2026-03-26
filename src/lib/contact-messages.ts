import { randomUUID } from "crypto";
import { createAuditLog, getAuditLogs } from "@/lib/admin-data";

export type ContactMessageRecord = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
};

function normalizeContactMessage(value: unknown, createdAt: string): ContactMessageRecord | null {
  if (!value || typeof value !== "object") return null;
  const payload = value as Record<string, unknown>;

  if (
    typeof payload.id !== "string" ||
    typeof payload.name !== "string" ||
    typeof payload.email !== "string" ||
    typeof payload.subject !== "string" ||
    typeof payload.message !== "string"
  ) {
    return null;
  }

  return {
    id: payload.id,
    name: payload.name,
    email: payload.email,
    subject: payload.subject,
    message: payload.message,
    createdAt,
  };
}

export async function getContactMessages(): Promise<ContactMessageRecord[]> {
  const logs = await getAuditLogs("contact_message");
  return logs
    .filter((log) => log.action === "submitted")
    .map((log) => normalizeContactMessage(log.payload, log.createdAt))
    .filter((entry): entry is ContactMessageRecord => Boolean(entry));
}

export async function createContactMessage(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const id = randomUUID();
  await createAuditLog({
    entityType: "contact_message",
    entityId: id,
    action: "submitted",
    payload: {
      id,
      name: input.name,
      email: input.email,
      subject: input.subject,
      message: input.message,
    },
  });

  return id;
}
