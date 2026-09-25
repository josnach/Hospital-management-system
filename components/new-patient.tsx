"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Form } from "./ui/form";
import { Button } from "./ui/button";

import { PatientFormSchema } from "@/lib/schema";
import { CustomInput } from "./custom-input";
import { GENDER, MARITAL_STATUS, RELATION } from "@/lib";

import {
  createNewPatient,
  updatePatient,
} from "@/app/actions/patient";

import { toast } from "sonner";
import { Patient } from "@/lib/generated/prisma/client";

interface DataProps {
  data?: Patient;
  type: "create" | "update";
}

type PatientFormInput = z.input<typeof PatientFormSchema>;
type PatientFormData = z.output<typeof PatientFormSchema>;

export const NewPatient = ({ data, type }: DataProps) => {
  const { user } = useUser();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const form = useForm<PatientFormInput, any, PatientFormData>({
    resolver: zodResolver(PatientFormSchema),

    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      address: "",
      date_of_birth: new Date(),
      gender: "MALE",
      marital_status: "single",
      emergency_contact_name: "",
      emergency_contact_number: "",
      relation: "mother",
      blood_group: "",
      allergies: "",
      medical_conditions: "",
      insurance_number: "",
      insurance_provider: "",
      medical_history: "",
      medical_consent: false,
      privacy_consent: false,
      service_consent: false,
    },
  });

  const onSubmit: SubmitHandler<PatientFormData> = async (values) => {
    if (!user?.id) {
      toast.error("User authentication is required.");
      return;
    }

    setLoading(true);

    try {
      const res =
        type === "create"
          ? await createNewPatient(values, user.id)
          : await updatePatient(values, user.id);

      if (res?.success) {
        toast.success(res.msg);

        form.reset();

        router.push("/patient");
      } else {
        console.error(res);
        toast.error(res?.msg || "Failed to save patient");
      }
    } catch (error) {
      console.error("Patient submission error:", error);
      toast.error("Something went wrong while saving the patient.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (type === "create") {
      form.reset({
        first_name: user?.firstName || "",
        last_name: user?.lastName || "",
        email: user?.emailAddresses?.[0]?.emailAddress || "",
        phone: user?.phoneNumbers?.[0]?.phoneNumber || "",

        address: "",
        date_of_birth: new Date(),
        gender: "MALE",
        marital_status: "single",

        emergency_contact_name: "",
        emergency_contact_number: "",
        relation: "mother",

        blood_group: "",
        allergies: "",
        medical_conditions: "",
        insurance_number: "",
        insurance_provider: "",
        medical_history: "",

        medical_consent: false,
        privacy_consent: false,
        service_consent: false,
      });

      return;
    }

    if (type === "update" && data) {
      form.reset({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,

        date_of_birth: new Date(data.date_of_birth),

        gender: data.gender,

        marital_status:
          data.marital_status as PatientFormData["marital_status"],

        address: data.address,

        emergency_contact_name: data.emergency_contact_name,
        emergency_contact_number: data.emergency_contact_number,

        relation: data.relation as PatientFormData["relation"],

        blood_group: data.blood_group || "",
        allergies: data.allergies || "",
        medical_conditions: data.medical_conditions || "",
        medical_history: data.medical_history || "",

        insurance_number: data.insurance_number || "",
        insurance_provider: data.insurance_provider || "",

        medical_consent: data.medical_consent,
        privacy_consent: data.privacy_consent,
        service_consent: data.service_consent,
      });
    }
  }, [user, type, data, form]);

  return (
    <Card className="max-w-6xl w-full p-4">
      <CardHeader>
        <CardTitle>Patient Registration</CardTitle>

        <CardDescription>
          Please provide all the information below to help us understand
          better and provide good and quality service to you.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 mt-5"
          >
            {/* =========================
                PERSONAL INFORMATION
            ========================== */}

            <h3 className="text-lg font-semibold">
              Personal Information
            </h3>

            <div className="flex flex-col lg:flex-row gap-y-6 items-center gap-2 md:gap-x-4">
              <CustomInput
                type="input"
                control={form.control}
                name="first_name"
                placeholder="John"
                label="First Name"
              />

              <CustomInput
                type="input"
                control={form.control}
                name="last_name"
                placeholder="Doe"
                label="Last Name"
              />
            </div>

            <CustomInput
              type="input"
              control={form.control}
              name="email"
              placeholder="john@example.com"
              label="Email Address"
              inputType="email"
            />

            <div className="flex flex-col lg:flex-row gap-y-6 items-center gap-2 md:gap-x-4">
              <CustomInput
                type="select"
                control={form.control}
                name="gender"
                placeholder="Select gender"
                label="Gender"
                selectList={GENDER}
              />

              <CustomInput
                type="input"
                control={form.control}
                name="date_of_birth"
                placeholder="01-05-2000"
                label="Date of Birth"
                inputType="date"
              />
            </div>

            <div className="flex flex-col lg:flex-row gap-y-6 items-center gap-2 md:gap-x-4">
              <CustomInput
                type="input"
                control={form.control}
                name="phone"
                placeholder="9225600735"
                label="Contact Number"
              />

              <CustomInput
                type="select"
                control={form.control}
                name="marital_status"
                placeholder="Select marital status"
                label="Marital Status"
                selectList={MARITAL_STATUS}
              />
            </div>

            <CustomInput
              type="input"
              control={form.control}
              name="address"
              placeholder="1479 Street, Apt 1839-G, NY"
              label="Address"
            />

            {/* =========================
                FAMILY INFORMATION
            ========================== */}

            <div className="space-y-8">
              <h3 className="text-lg font-semibold">
                Family Information
              </h3>

              <CustomInput
                type="input"
                control={form.control}
                name="emergency_contact_name"
                placeholder="Anne Smith"
                label="Emergency Contact Name"
              />

              <CustomInput
                type="input"
                control={form.control}
                name="emergency_contact_number"
                placeholder="675444467"
                label="Emergency Contact"
              />

              <CustomInput
                type="select"
                control={form.control}
                name="relation"
                placeholder="Select relation with contact person"
                label="Relation"
                selectList={RELATION}
              />
            </div>

            {/* =========================
                MEDICAL INFORMATION
            ========================== */}

            <div className="space-y-8">
              <h3 className="text-lg font-semibold">
                Medical Information
              </h3>

              <CustomInput
                type="input"
                control={form.control}
                name="blood_group"
                placeholder="A+"
                label="Blood Group"
              />

              <CustomInput
                type="input"
                control={form.control}
                name="allergies"
                placeholder="Milk"
                label="Allergies"
              />

              <CustomInput
                type="input"
                control={form.control}
                name="medical_conditions"
                placeholder="Medical conditions"
                label="Medical Conditions"
              />

              <CustomInput
                type="textarea"
                control={form.control}
                name="medical_history"
                placeholder="Medical history"
                label="Medical History"
              />

              <div className="flex flex-col lg:flex-row gap-y-6 items-center gap-2 md:gap-4">
                <CustomInput
                  type="input"
                  control={form.control}
                  name="insurance_provider"
                  placeholder="Insurance provider"
                  label="Insurance Provider"
                />

                <CustomInput
                  type="input"
                  control={form.control}
                  name="insurance_number"
                  placeholder="Insurance number"
                  label="Insurance Number"
                />
              </div>
            </div>

            {/* =========================
                CONSENT
            ========================== */}

            {type !== "update" && (
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Consent
                </h3>

                <div className="space-y-6">
                  <CustomInput
                    name="privacy_consent"
                    label="Privacy Policy Agreement"
                    placeholder="I consent to the collection, storage, and use of my personal and health information as outlined in the Privacy Policy. I understand how my data will be used, who it may be shared with, and my rights regarding access, correction, and deletion of my data."
                    type="checkbox"
                    control={form.control}
                  />

                  <CustomInput
                    control={form.control}
                    type="checkbox"
                    name="service_consent"
                    label="Terms of Service Agreement"
                    placeholder="I agree to the Terms of Service, including my responsibilities as a user of this healthcare management system, the limitations of liability, and the dispute resolution process. I understand that continued use of this service is contingent upon my adherence to these terms."
                  />

                  <CustomInput
                    control={form.control}
                    type="checkbox"
                    name="medical_consent"
                    label="Informed Consent for Medical Treatment"
                    placeholder="I provide informed consent to receive medical treatment and services through this healthcare management system. I acknowledge that I have been informed of the nature, risks, benefits, and alternatives to the proposed treatments and that I have the right to ask questions and receive further information before proceeding."
                  />
                </div>
              </div>
            )}

            {/* =========================
                SUBMIT
            ========================== */}

            <Button
              disabled={loading}
              type="submit"
              className="w-full md:w-fit px-6"
            >
              {loading
                ? type === "create"
                  ? "Submitting..."
                  : "Updating..."
                : type === "create"
                ? "Submit"
                : "Update"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};