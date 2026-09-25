import db from "@/lib/db";
import { DATA_LIMIT } from "@/utils/seetings";

export async function getAuditLogs({
  page,
  search,
}: {
  page: string;
  search?: string;
}) {
  try {
    const PAGE_NUMBER = Number(page) || 1;
    const skip = (PAGE_NUMBER - 1) * DATA_LIMIT;

    const where = search
      ? {
          OR: [
            { action: { contains: search, mode: "insensitive" as const } },
            { model: { contains: search, mode: "insensitive" as const } },
            { user_id: { contains: search, mode: "insensitive" as const } },
            { record_id: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [data, totalRecords] = await Promise.all([
      db.auditLog.findMany({
        where,
        skip,
        take: DATA_LIMIT,
        orderBy: { created_at: "desc" },
      }),
      db.auditLog.count({ where }),
    ]);

    return {
      data,
      totalRecords,
      totalPages: Math.ceil(totalRecords / DATA_LIMIT),
      currentPage: PAGE_NUMBER,
    };
  } catch (error) {
    console.log(error);
    return { data: [], totalRecords: 0, totalPages: 0, currentPage: 1 };
  }
}