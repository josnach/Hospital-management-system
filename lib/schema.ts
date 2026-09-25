import { z } from "zod";

/* =========================================================
   PATIENT
========================================================= */

export const PatientFormSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(30, "First name can't be more than 30 characters"),

  last_name: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(30, "Last name can't be more than 30 characters"),

  date_of_birth: z.coerce.date(),

  gender: z.enum(["MALE", "FEMALE"], {
    message: "Gender is required",
  }),

  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10,11}$/, "Enter a valid phone number"),

  email: z
    .string()
    .trim()
    .email("Invalid email address."),

  address: z
    .string()
    .trim()
    .min(5, "Address must be at least 5 characters")
    .max(500, "Address must be at most 500 characters"),

  marital_status: z.enum(
    ["married", "single", "divorced", "widowed", "separated"],
    {
      message: "Marital status is required.",
    }
  ),

  emergency_contact_name: z
    .string()
    .trim()
    .min(2, "Emergency contact name is required.")
    .max(
      50,
      "Emergency contact must be at most 50 characters"
    ),

  emergency_contact_number: z
    .string()
    .trim()
    .regex(/^[0-9]{10,11}$/, "Enter a valid phone number"),

  relation: z.enum(
    ["mother", "father", "husband", "wife", "other"],
    {
      message: "Relation with contact person is required",
    }
  ),

  blood_group: z.string().optional(),

  allergies: z.string().optional(),

  medical_conditions: z.string().optional(),

  medical_history: z.string().optional(),

  insurance_provider: z.string().optional(),

  insurance_number: z.string().optional(),

  privacy_consent: z
    .boolean()
    .default(false)
    .refine((value) => value === true, {
      message: "You must agree to the privacy policy.",
    }),

  service_consent: z
    .boolean()
    .default(false)
    .refine((value) => value === true, {
      message: "You must agree to the terms of service.",
    }),

  medical_consent: z
    .boolean()
    .default(false)
    .refine((value) => value === true, {
      message: "You must agree to the medical treatment terms.",
    }),

  img: z.string().optional(),
});

export type PatientFormData = z.infer<typeof PatientFormSchema>;

/* =========================================================
   APPOINTMENT
========================================================= */

export const AppointmentSchema = z.object({
  doctor_id: z
    .string()
    .min(1, "Select physician"),

  type: z
    .string()
    .min(1, "Select type of appointment"),

  appointment_date: z
    .string()
    .min(1, "Select appointment date"),

  time: z
    .string()
    .min(1, "Select appointment time"),

  note: z
    .string()
    .optional(),
});

export type AppointmentFormData = z.infer<
  typeof AppointmentSchema
>;

/* =========================================================
   DOCTOR
========================================================= */

export const DoctorSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),

  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10,11}$/, "Enter a valid phone number"),

  email: z
    .string()
    .trim()
    .email("Invalid email address."),

  address: z
    .string()
    .trim()
    .min(5, "Address must be at least 5 characters")
    .max(500, "Address must be at most 500 characters"),

  specialization: z
    .string()
    .trim()
    .min(2, "Specialization is required."),

  license_number: z
    .string()
    .trim()
    .min(2, "License number is required"),

  type: z.enum(["FULL", "PART"], {
    message: "Type is required.",
  }),

  department: z
    .string()
    .trim()
    .min(2, "Department is required."),

  img: z.string().optional(),

  password: z
    .string()
    .min(8, {
      message: "Password must be at least 8 characters long!",
    })
    .optional()
    .or(z.literal("")),
});

export type DoctorFormData = z.infer<typeof DoctorSchema>;

/* =========================================================
   WORKING DAYS
========================================================= */

export const workingDaySchema = z.object({
  day: z.enum([
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ]),

  start_time: z.string(),

  close_time: z.string(),
});

export const WorkingDaysSchema = z
  .array(workingDaySchema)
  .optional();

export type WorkingDayFormData = z.infer<
  typeof workingDaySchema
>;

/* =========================================================
   STAFF
========================================================= */

export const StaffSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),

  role: z.enum(["NURSE", "LAB_TECHNICIAN"], {
    message: "Role is required.",
  }),

  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10,11}$/, "Enter a valid phone number"),

  email: z
    .string()
    .trim()
    .email("Invalid email address."),

  address: z
    .string()
    .trim()
    .min(5, "Address must be at least 5 characters")
    .max(500, "Address must be at most 500 characters"),

  license_number: z.string().optional(),

  department: z.string().optional(),

  img: z.string().optional(),

  password: z
    .string()
    .min(8, {
      message: "Password must be at least 8 characters long!",
    })
    .optional()
    .or(z.literal("")),
});

export type StaffFormData = z.infer<typeof StaffSchema>;

/* =========================================================
   VITAL SIGNS
========================================================= */

export const VitalSignsSchema = z.object({
  patient_id: z
    .string()
    .min(1, "Patient is required"),

  medical_id: z
    .string()
    .min(1, "Medical record is required"),

  body_temperature: z.coerce.number({
    message: "Enter recorded body temperature",
  }),

  heartRate: z
    .string()
    .min(1, "Enter recorded heartbeat rate"),

  systolic: z.coerce.number({
    message: "Enter recorded systolic blood pressure",
  }),

  diastolic: z.coerce.number({
    message: "Enter recorded diastolic blood pressure",
  }),

  respiratory_rate: z.coerce
    .number()
    .optional(),

  oxygen_saturation: z.coerce
    .number()
    .optional(),

  weight: z.coerce.number({
    message: "Enter recorded weight (Kg)",
  }),

  height: z.coerce.number({
    message: "Enter recorded height (Cm)",
  }),
});

export type VitalSignsFormData = z.infer<
  typeof VitalSignsSchema
>;

/* =========================================================
   DIAGNOSIS
========================================================= */

export const DiagnosisSchema = z.object({
  patient_id: z
    .string()
    .min(1, "Patient is required"),

  medical_id: z
    .string()
    .min(1, "Medical record is required"),

  doctor_id: z
    .string()
    .min(1, "Doctor is required"),

  symptoms: z
    .string()
    .min(1, "Symptoms required"),

  diagnosis: z
    .string()
    .min(1, "Diagnosis required"),

  notes: z
    .string()
    .optional(),

  prescribed_medications: z
    .string()
    .optional(),

  follow_up_plan: z
    .string()
    .optional(),
});

export type DiagnosisFormData = z.infer<
  typeof DiagnosisSchema
>;

/* =========================================================
   PAYMENT / FINAL BILL
========================================================= */

export const PaymentSchema = z.object({
  id: z
    .string()
    .min(1, "Payment ID is required"),

  bill_date: z.coerce.date(),

  discount: z
    .string()
    .trim()
    .refine(
      (value) => {
        const number = Number(value);
        return (
          Number.isFinite(number) &&
          number >= 0 &&
          number <= 100
        );
      },
      {
        message: "Discount must be between 0 and 100",
      }
    ),

  total_amount: z
    .string()
    .trim()
    .refine(
      (value) => {
        const number = Number(value);
        return Number.isFinite(number) && number >= 0;
      },
      {
        message: "Total amount must be a valid amount",
      }
    ),
});

export type PaymentFormData = z.infer<
  typeof PaymentSchema
>;

/* =========================================================
   PATIENT BILL
========================================================= */

export const PatientBillSchema = z.object({
  bill_id: z
    .string()
    .optional()
    .or(z.literal("")),

  service_id: z
    .string()
    .min(1, "Service is required"),

  service_date: z
    .string()
    .min(1, "Service date is required"),

  appointment_id: z
    .string()
    .min(1, "Appointment is required"),

  quantity: z
    .string()
    .min(1, "Quantity is required")
    .refine(
      (value) => {
        const number = Number(value);
        return Number.isFinite(number) && number > 0;
      },
      {
        message: "Quantity must be greater than 0",
      }
    ),

  unit_cost: z
    .string()
    .min(1, "Unit cost is required")
    .refine(
      (value) => {
        const number = Number(value);
        return Number.isFinite(number) && number >= 0;
      },
      {
        message: "Unit cost must be a valid amount",
      }
    ),

  total_cost: z
    .string()
    .min(1, "Total cost is required")
    .refine(
      (value) => {
        const number = Number(value);
        return Number.isFinite(number) && number >= 0;
      },
      {
        message: "Total cost must be a valid amount",
      }
    ),
});

export type PatientBillFormData = z.infer<
  typeof PatientBillSchema
>;

/* =========================================================
   SERVICES
========================================================= */

export const ServicesSchema = z.object({
  service_name: z
    .string()
    .trim()
    .min(1, "Service name is required"),

  price: z
    .string()
    .trim()
    .min(1, "Service price is required")
    .refine(
      (value) => {
        const number = Number(value);
        return Number.isFinite(number) && number >= 0;
      },
      {
        message: "Service price must be a valid amount",
      }
    ),

  description: z
    .string()
    .trim()
    .min(1, "Service description is required"),
});

export type ServicesFormData = z.infer<
  typeof ServicesSchema
>;

/* =========================================================
   LAB TEST
========================================================= */

export const LabTestSchema = z.object({
  record_id: z
    .string()
    .optional()
    .or(z.literal("")),

  service_id: z
    .string()
    .min(1, "Please select a test"),

  test_date: z.coerce.date(),

  result: z
    .string()
    .optional()
    .default(""),

  status: z
    .enum(["PENDING", "READY"])
    .default("PENDING"),

  notes: z
    .string()
    .optional()
    .default(""),
});

export type LabTestFormData = z.infer<
  typeof LabTestSchema
>;

/* =========================================================
   MEDICATION ADMINISTRATION
========================================================= */

export const MedicationAdministrationSchema = z.object({
  patient_id: z
    .string()
    .min(1, "Please select a patient"),

  medication_name: z
    .string()
    .trim()
    .min(1, "Medication name is required"),

  dosage: z
    .string()
    .trim()
    .min(1, "Dosage is required"),

  route: z
    .string()
    .trim()
    .optional(),

  administered_at: z.coerce.date(),

  status: z
    .enum(["GIVEN", "MISSED", "REFUSED"])
    .default("GIVEN"),

  notes: z
    .string()
    .optional()
    .default(""),
});

export type MedicationAdministrationFormData =
  z.infer<typeof MedicationAdministrationSchema>;
