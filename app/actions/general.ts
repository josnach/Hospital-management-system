"use server";

import {
  ReviewFormValues,
  reviewSchema,
} from "@/components/dialogs/review-form";
import db from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

import { logAudit } from "./audit";

type DeleteType =
  | "doctor"
  | "staff"
  | "patient"
  | "payment"
  | "bill"
  | "lab_test";

interface ActionResult {
  success: boolean;
  message: string;
  status: number;
}

export async function deleteDataById(
  id: string,
  deleteType: DeleteType
): Promise<ActionResult> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        message: "Unauthorized",
        status: 401,
      };
    }

    switch (deleteType) {
      case "doctor": {
        const doctor = await db.doctor.findUnique({
          where: { id },
        });

        if (!doctor) {
          return {
            success: false,
            message: "Doctor not found",
            status: 404,
          };
        }

        await db.doctor.delete({
          where: { id },
        });

        break;
      }

      case "staff": {
        const staff = await db.staff.findUnique({
          where: { id },
        });

        if (!staff) {
          return {
            success: false,
            message: "Staff member not found",
            status: 404,
          };
        }

        await db.staff.delete({
          where: { id },
        });

        break;
      }

      case "patient": {
        const patient = await db.patient.findUnique({
          where: { id },
        });

        if (!patient) {
          return {
            success: false,
            message: "Patient not found",
            status: 404,
          };
        }

        await db.patient.delete({
          where: { id },
        });

        break;
      }

      case "payment": {
        const paymentId = Number(id);

        if (!Number.isInteger(paymentId)) {
          return {
            success: false,
            message: "Invalid payment ID",
            status: 400,
          };
        }

        const payment = await db.payment.findUnique({
          where: { id: paymentId },
        });

        if (!payment) {
          return {
            success: false,
            message: "Payment not found",
            status: 404,
          };
        }

        await db.payment.delete({
          where: { id: paymentId },
        });

        break;
      }

      case "bill": {
        const billId = Number(id);

        if (!Number.isInteger(billId)) {
          return {
            success: false,
            message: "Invalid bill ID",
            status: 400,
          };
        }

        /*
         * PatientBill records are the individual services/items
         * attached to a payment/bill.
         *
         * Delete the bill items first so foreign-key constraints
         * do not prevent deleting the payment record.
         */
        await db.patientBills.deleteMany({
          where: {
            bill_id: billId,
          },
        });

        const payment = await db.payment.findUnique({
          where: { id: billId },
        });

        if (!payment) {
          return {
            success: false,
            message: "Bill not found",
            status: 404,
          };
        }

        await db.payment.delete({
          where: { id: billId },
        });

        break;
      }

      case "lab_test": {
        const labTestId = Number(id);

        if (!Number.isInteger(labTestId)) {
          return {
            success: false,
            message: "Invalid lab test ID",
            status: 400,
          };
        }

        const labTest = await db.labTest.findUnique({
          where: { id: labTestId },
        });

        if (!labTest) {
          return {
            success: false,
            message: "Lab test not found",
            status: 404,
          };
        }

        await db.labTest.delete({
          where: { id: labTestId },
        });

        break;
      }

      default: {
        return {
          success: false,
          message: "Invalid delete type",
          status: 400,
        };
      }
    }

    await logAudit({
      userId,
      action: "DELETE",
      model: deleteType,
      recordId: id,
    });

    return {
      success: true,
      message: "Data deleted successfully",
      status: 200,
    };
  } catch (error) {
    console.error("Delete error:", error);

    return {
      success: false,
      message: "Internal Server Error",
      status: 500,
    };
  }
}

export async function createReview(
  values: ReviewFormValues
): Promise<ActionResult> {
  try {
    const validatedFields = reviewSchema.parse(values);

    await db.rating.create({
      data: {
        ...validatedFields,
      },
    });

    return {
      success: true,
      message: "Review created successfully",
      status: 200,
    };
  } catch (error) {
    console.error("Create review error:", error);

    return {
      success: false,
      message: "Internal Server Error",
      status: 500,
    };
  }
}
