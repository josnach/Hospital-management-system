"use server";

import db from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NotificationType } from "@/lib/generated/prisma/enums";

export async function createNotification({
  userId,
  type = "GENERAL",
  title,
  message,
  link,
}: {
  userId: string;
  type?: NotificationType;
  title: string;
  message: string;
  link?: string;
}) {
  try {
    await db.notification.create({
      data: { user_id: userId, type, title, message, link },
    });
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false };
  }
}

export async function notifyNewAppointment({
  appointmentId,
  patientId,
  doctorId,
  appointmentDate,
}: {
  appointmentId: number;
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
}) {
  try {
    const admins = await db.staff.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    const dateStr = appointmentDate.toLocaleDateString();

    await db.notification.createMany({
      data: [
        {
          user_id: doctorId,
          type: "APPOINTMENT_BOOKED",
          title: "New Appointment",
          message: `A patient booked an appointment with you for ${dateStr}.`,
          link: `/record/appointments/${appointmentId}`,
        },
        {
          user_id: patientId,
          type: "APPOINTMENT_CONFIRMED",
          title: "Appointment Confirmed",
          message: `Your appointment is scheduled for ${dateStr}.`,
          link: `/patient/self?cat=appointments`,
        },
        ...admins.map((a) => ({
          user_id: a.id,
          type: "APPOINTMENT_BOOKED" as const,
          title: "New Appointment Booked",
          message: `A new appointment was booked for ${dateStr}.`,
          link: `/record/appointments/${appointmentId}`,
        })),
      ],
    });
  } catch (error) {
    console.log(error);
  }
}

export async function getMyNotifications() {
  const { userId } = await auth();
  if (!userId) return [];

  return db.notification.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
  });
}

export async function markNotificationRead(id: number) {
  try {
    await db.notification.update({
      where: { id },
      data: { is_read: true },
    });
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false };
  }
}

export async function getUnreadNotificationCount() {
  try {
    const { userId } = await auth();
    if (!userId) return 0;

    return await db.notification.count({
      where: { user_id: userId, is_read: false },
    });
  } catch (error) {
    console.log(error);
    return 0;
  }
}