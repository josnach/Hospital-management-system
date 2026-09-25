// app/actions/audit.ts
"use server";

import db from "@/lib/db";

export async function logAudit({
  userId,
  action,
  model,
  recordId,
  details,
}: {
  userId: string;
  action: string;
  model: string;
  recordId: string;
  details?: string;
}) {
  try {
    await db.auditLog.create({
      data: { user_id: userId, action, model, record_id: recordId, details },
    });
  } catch (error) {
    console.log(error);
  }
}