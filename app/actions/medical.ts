"use server";

import { DiagnosisFormData } from "@/components/dialogs/add-diagnosis";
import db from "@/lib/db";

import {
  DiagnosisSchema,
  LabTestSchema,
  MedicationAdministrationSchema,
  MedicationAdministrationFormData,
  PatientBillSchema,
  PaymentSchema,
} from "@/lib/schema";

import { checkRole } from "@/utils/roles";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { logAudit } from "./audit";
import { createNotification } from "./notifications";

/* =========================================================
   ADD DIAGNOSIS
========================================================= */

export const addDiagnosis = async (
  data: DiagnosisFormData,
  appointmentId: string
) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const validatedData = DiagnosisSchema.parse(data);

    let medicalRecord = null;

    if (!validatedData.medical_id) {
      medicalRecord = await db.medicalRecords.create({
        data: {
          patient_id: validatedData.patient_id,
          doctor_id: validatedData.doctor_id,
          appointment_id: Number(appointmentId),
        },
      });
    }

    const medicalId =
      validatedData.medical_id ?? medicalRecord?.id;

    if (!medicalId) {
      return {
        success: false,
        error: "Medical record could not be determined",
      };
    }

    const diagnosis = await db.diagnosis.create({
      data: {
        ...validatedData,
        medical_id: Number(medicalId),
      },
    });

    await logAudit({
      userId,
      action: "CREATE",
      model: "diagnosis",
      recordId: diagnosis.id.toString(),
    });

    return {
      success: true,
      message: "Diagnosis added successfully",
      status: 201,
    };
  } catch (error) {
    console.error("Add diagnosis error:", error);

    return {
      success: false,
      error: "Failed to add diagnosis",
    };
  }
};

/* =========================================================
   ADD PATIENT BILL ITEM
========================================================= */

export async function addNewBill(data: unknown) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        msg: "Unauthorized",
      };
    }

    const isAdmin = await checkRole("ADMIN");
    const isDoctor = await checkRole("DOCTOR");

    if (!isAdmin && !isDoctor) {
      return {
        success: false,
        msg: "You are not authorized to add a bill",
      };
    }

    const validation = PatientBillSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        msg: "Invalid bill data",
      };
    }

    const validatedData = validation.data;

    let billInfo: { id: number } | null = null;

    /*
     * If no existing bill/payment ID was supplied,
     * find the appointment and create its payment/bill record.
     */
    if (
      !validatedData.bill_id ||
      validatedData.bill_id === "undefined"
    ) {
      const appointment = await db.appointment.findUnique({
        where: {
          id: Number(validatedData.appointment_id),
        },
        select: {
          id: true,
          patient_id: true,
          bills: true,
        },
      });

      if (!appointment) {
        return {
          success: false,
          msg: "Appointment not found",
        };
      }

      /*
       * According to the current schema/query structure,
       * appointment.bills is treated as a single Payment object.
       */
      if (!appointment.bills) {
        billInfo = await db.payment.create({
          data: {
            appointment_id: appointment.id,
            patient_id: appointment.patient_id,
            bill_date: new Date(),
            payment_date: new Date(),
            discount: 0,
            amount_paid: 0,
            total_amount: 0,
          },
          select: {
            id: true,
          },
        });
      } else {
        billInfo = {
          id: appointment.bills.id,
        };
      }
    } else {
      billInfo = {
        id: Number(validatedData.bill_id),
      };
    }

    if (!billInfo?.id) {
      return {
        success: false,
        msg: "Unable to determine bill",
      };
    }

    const patientBill = await db.patientBills.create({
      data: {
        bill_id: billInfo.id,
        service_id: Number(validatedData.service_id),
        service_date: new Date(validatedData.service_date),
        quantity: Number(validatedData.quantity),
        unit_cost: Number(validatedData.unit_cost),
        total_cost: Number(validatedData.total_cost),
      },
    });

    await logAudit({
      userId,
      action: "CREATE",
      model: "patient_bill",
      recordId: patientBill.id.toString(),
    });

    return {
      success: true,
      error: false,
      msg: "Bill added successfully",
    };
  } catch (error) {
    console.error("Add new bill error:", error);

    return {
      success: false,
      msg: "Internal Server Error",
    };
  }
}

/* =========================================================
   GENERATE BILL
========================================================= */

export async function generateBill(data: unknown) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        msg: "Unauthorized",
      };
    }

    const validation = PaymentSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        msg: "Invalid payment data",
      };
    }

    const validatedData = validation.data;

    const discountAmount =
      (Number(validatedData.discount) / 100) *
      Number(validatedData.total_amount);

    const payment = await db.payment.update({
      data: {
        bill_date: validatedData.bill_date,
        discount: discountAmount,
        total_amount: Number(validatedData.total_amount),
      },
      where: {
        id: Number(validatedData.id),
      },
    });

    await db.appointment.update({
      data: {
        status: "COMPLETED",
      },
      where: {
        id: payment.appointment_id,
      },
    });

    await logAudit({
      userId,
      action: "GENERATE_BILL",
      model: "payment",
      recordId: payment.id.toString(),
    });

    return {
      success: true,
      error: false,
      msg: "Bill generated successfully",
    };
  } catch (error) {
    console.error("Generate bill error:", error);

    return {
      success: false,
      msg: "Internal Server Error",
    };
  }
}

/* =========================================================
   ADD LAB TEST
========================================================= */

export const addLabTest = async (
  data: z.input<typeof LabTestSchema>,
  meta: {
    appointmentId: string;
    patientId: string;
    doctorId: string;
  }
) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const validatedData = LabTestSchema.parse(data);

    let medicalRecord = null;

    /*
     * Reuse the existing medical record when record_id exists.
     * Otherwise create a new medical record for this appointment.
     */
    if (!validatedData.record_id) {
      medicalRecord = await db.medicalRecords.create({
        data: {
          patient_id: meta.patientId,
          doctor_id: meta.doctorId,
          appointment_id: Number(meta.appointmentId),
        },
      });
    }

    const recordId = validatedData.record_id
      ? Number(validatedData.record_id)
      : medicalRecord?.id;

    if (!recordId) {
      return {
        success: false,
        error: "Medical record could not be determined",
      };
    }

    const labTest = await db.labTest.create({
      data: {
        record_id: recordId,
        service_id: Number(validatedData.service_id),
        test_date: validatedData.test_date,
        result: validatedData.result ?? "",
        status: validatedData.status,
        notes: validatedData.notes ?? null,
      },
    });

    await logAudit({
      userId,
      action: "CREATE",
      model: "lab_test",
      recordId: labTest.id.toString(),
    });

    return {
      success: true,
      message: "Lab test added successfully",
      status: 201,
    };
  } catch (error) {
    console.error("Add lab test error:", error);

    return {
      success: false,
      error: "Failed to add lab test",
    };
  }
};

/* =========================================================
   UPDATE LAB TEST RESULT
========================================================= */

export const updateLabTestResult = async (
  id: string,
  data: {
    result: string;
    status: "PENDING" | "READY";
    notes?: string;
  }
) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const labTestId = Number(id);

    if (!Number.isInteger(labTestId) || labTestId <= 0) {
      return {
        success: false,
        error: "Invalid lab test ID",
      };
    }

    const updated = await db.labTest.update({
      where: {
        id: labTestId,
      },
      data: {
        result: data.result,
        status: data.status,
        notes: data.notes ?? null,
      },
      include: {
        medical_record: true,
        services: true,
      },
    });

    if (data.status === "READY") {
      await createNotification({
        userId: updated.medical_record.patient_id,
        title: "Lab Result Ready",
        message: `Your ${updated.services.service_name} result is now ready.`,
        type: "LAB_RESULT_READY",
        link: "/patient/self?cat=lab-test",
      });
    }

    await logAudit({
      userId,
      action: "UPDATE",
      model: "lab_test",
      recordId: id,
    });

    return {
      success: true,
      message: "Lab test updated successfully",
    };
  } catch (error) {
    console.error("Update lab test error:", error);

    return {
      success: false,
      error: "Failed to update lab test",
    };
  }
};

/* =========================================================
   ADD MEDICATION ADMINISTRATION
========================================================= */

export async function addMedicationAdministration(
  data: MedicationAdministrationFormData
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        msg: "Unauthorized",
      };
    }

    const validatedData =
      MedicationAdministrationSchema.parse(data);

    const record =
      await db.medicationAdministration.create({
        data: {
          patient_id: validatedData.patient_id,
          administered_by: userId,
          medication_name: validatedData.medication_name,
          dosage: validatedData.dosage,
          route: validatedData.route,
          administered_at: validatedData.administered_at,
          status: validatedData.status,
          notes: validatedData.notes,
        },
      });

    await logAudit({
      userId,
      action: "CREATE",
      model: "medication_administration",
      recordId: record.id.toString(),
    });

    return {
      success: true,
      msg: "Medication administration logged",
    };
  } catch (error) {
    console.error(
      "Add medication administration error:",
      error
    );

    return {
      success: false,
      msg: "Internal Server Error",
    };
  }
}