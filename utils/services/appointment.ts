import db from "@/lib/db";
import { AppointmentStatus, Prisma } from "@/lib/generated/prisma/client";


export async function getAppointmentById(id: number) {
  try {
    if (!id) {
      return {
        success: false,
        message: "Appointment id does not exist.",
        status: 404,
      };
    }

    const data = await db.appointment.findUnique({
      where: { id },
      include: {
        doctor: {
          select: { id: true, name: true, specialization: true, img: true },
        },
        patient: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            date_of_birth: true,
            gender: true,
            img: true,
            address: true,
            phone: true,
          },
        },
      },
    });

    if (!data) {
      return {
        success: false,
        message: "Appointment data not found",
        status: 200,
        data: null,
      };
    }

    return { success: true, data, status: 200 };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Internal Server Error", status: 500 };
  }
}

interface AllAppointmentsProps {
  page: number | string;
  limit?: number | string;
  search?: string;
  id?: string;
  status?: string;
}

const buildQuery = (id?: string, search?: string) => {
  // Base conditions for search if it exists
  const searchConditions: Prisma.AppointmentWhereInput = search
    ? {
        OR: [
          {
            patient: {
              first_name: { contains: search, mode: "insensitive" },
            },
          },
          {
            patient: {
              last_name: { contains: search, mode: "insensitive" },
            },
          },
          {
            doctor: {
              name: { contains: search, mode: "insensitive" },
            },
          },
        ],
      }
    : {};

  // ID filtering conditions if ID exists
  const idConditions: Prisma.AppointmentWhereInput = id
    ? {
        OR: [{ patient_id: id }, { doctor_id: id }],
      }
    : {};

  // Combine both conditions with AND if both exist
  const combinedQuery: Prisma.AppointmentWhereInput =
    id || search
      ? {
          AND: [
            ...(Object.keys(searchConditions).length > 0
              ? [searchConditions]
              : []),
            ...(Object.keys(idConditions).length > 0 ? [idConditions] : []),
          ],
        }
      : {};

  return combinedQuery;
};
export async function getAppointmentWithMedicalRecordsById(id: number) {
  try {
    if (!id || Number.isNaN(id)) {
      return {
        success: false,
        message: "Appointment id does not exist.",
        status: 400,
        data: null,
      };
    }

    const data = await db.appointment.findUnique({
      where: {
        id,
      },

      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            img: true,
          },
        },

        patient: true,

        medical: {
          include: {
            diagnosis: {
              include: {
                doctor: {
                  select: {
                    id: true,
                    name: true,
                    specialization: true,
                    img: true,
                  },
                },
              },
            },

            lab_test: {
              include: {
                services: true,
              },
            },

            vital_signs: true,
          },

          orderBy: {
            created_at: "desc",
          },
        },
      },
    });

    if (!data) {
      return {
        success: false,
        message: "Appointment data not found",
        status: 404,
        data: null,
      };
    }

    return {
      success: true,
      data,
      status: 200,
    };
  } catch (error) {
    console.error(
      "getAppointmentWithMedicalRecordsById error:",
      error
    );

    return {
      success: false,
      message: "Internal Server Error",
      status: 500,
      data: null,
    };
  }
}
export async function getPatientAppointments({
  page,
  limit,
  search,
  id,
  status,
}: AllAppointmentsProps) {
  try {
    const PAGE_NUMBER = Number(page) <= 0 ? 1 : Number(page);
    const LIMIT = Number(limit) || 10;
    const SKIP = (PAGE_NUMBER - 1) * LIMIT;

    const statusList = status ? status.split(",") : undefined;

    const where = {
      ...buildQuery(id, search),
      ...(statusList ? { status: { in: statusList as any } } : {}),
    };

    const [data, totalRecord] = await Promise.all([
      db.appointment.findMany({
        where,
        skip: SKIP,
        take: LIMIT,
        select: {
          id: true,
          patient_id: true,
          doctor_id: true,
          type: true,
          appointment_date: true,
          time: true,
          status: true,
          note: true,          // ← add
          reason: true,         // ← add
          created_at: true,     // ← add
          updated_at: true,     // ← add
          patient: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              phone: true,
              gender: true,
              img: true,
              date_of_birth: true,
              colorCode: true,
            },
          },
          doctor: {
            select: {
              id: true,
              name: true,
              specialization: true,
              colorCode: true,
              img: true,
            },
          },
        },
        orderBy: { appointment_date: "desc" },
      }),
      db.appointment.count({ where }),
    ]);

    if (!data) {
      return {
        success: false,
        message: "Appointment data not found",
        status: 200,
        data: null,
      };
    }

    const totalPages = Math.ceil(totalRecord / LIMIT);

    return {
      success: true,
      data,
      totalPages,
      currentPage: PAGE_NUMBER,
      totalRecord,
      status: 200,
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Internal Server Error", status: 500 };
  }
}

