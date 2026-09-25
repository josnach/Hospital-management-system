"use server";

import { VitalSignsFormData } from "@/components/dialogs/add-vital-signs";
import db from "@/lib/db";
import { AppointmentStatus } from "@/lib/generated/prisma/enums";
import { AppointmentSchema, VitalSignsSchema } from "@/lib/schema";
import { auth, currentUser } from "@clerk/nextjs/server";

import { notifyNewAppointment } from "./notifications";
import { logAudit } from "./audit";

export async function createNewAppointment(data: any) {
  try {
    const validatedData = AppointmentSchema.safeParse(data);

    if (!validatedData.success) {
      return { success: false, msg: "Invalid data" };
    }
    const validated = validatedData.data;

    const appointment = await db.appointment.create({
      data: {
        patient_id: data.patient_id,
        doctor_id: validated.doctor_id,
        time: validated.time,
        type: validated.type,
        appointment_date: new Date(validated.appointment_date),
        note: validated.note,
      },
    });

    await notifyNewAppointment({
      appointmentId: appointment.id,
      patientId: data.patient_id,
      doctorId: validated.doctor_id,
      appointmentDate: appointment.appointment_date,
    });

    await logAudit({
      userId: data.patient_id,
      action: "CREATE",
      model: "appointment",
      recordId: appointment.id.toString(),
    });

    return {
      success: true,
      message: "Appointment booked successfully",
    };
  } catch (error) {
    console.log(error);
    return { success: false, msg: "Internal Server Error" };
  }
}

export async function appointmentAction(
  id: string | number,
  status: AppointmentStatus,
  reason: string
) {
  try {
    const { userId } = await auth();

    await db.appointment.update({
      where: { id: Number(id) },
      data: {
        status,
        reason,
      },
    });

    if (userId) {
      await logAudit({
        userId,
        action: status,
        model: "appointment",
        recordId: id.toString(),
        details: reason,
      });
    }

    return {
      success: true,
      error: false,
      msg: `Appointment ${status.toLowerCase()} successfully`,
    };
  } catch (error) {
    console.log(error);
    return { success: false, msg: "Internal Server Error" };
  }
}

export async function addVitalSigns(
  data: VitalSignsFormData,
  appointmentId: string,
  doctorId: string
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, msg: "Unauthorized" };
    }

    const validatedData = VitalSignsSchema.parse(data);

    let medicalRecord = null;

    if (!validatedData.medical_id) {
      medicalRecord = await db.medicalRecords.create({
        data: {
          patient_id: validatedData.patient_id,
          appointment_id: Number(appointmentId),
          doctor_id: doctorId,
        },
      });
    }

    const med_id = validatedData.medical_id || medicalRecord?.id;

    const vitalSigns = await db.vitalSigns.create({
      data: {
        ...validatedData,
        medical_id: Number(med_id!),
      },
    });

    await logAudit({
      userId,
      action: "CREATE",
      model: "vital_signs",
      recordId: vitalSigns.id.toString(),
    });

    return {
      success: true,
      msg: "Vital signs added successfully",
    };
  } catch (error) {
    console.log(error);
    return { success: false, msg: "Internal Server Error" };
  }
}