"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { addMedicationAdministration } from "@/app/actions/medical";
import { MedicationAdministrationSchema } from "@/lib/schema";

import { CustomInput } from "../custom-input";
import { Button } from "../ui/button";
import { CardHeader } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Form } from "../ui/form";

interface PatientOption {
  id: string;
  name: string;
}

type MedicationFormInput = z.input<
  typeof MedicationAdministrationSchema
>;

type MedicationFormOutput = z.output<
  typeof MedicationAdministrationSchema
>;

export const AddMedicationAdministration = ({
  patients,
}: {
  patients: PatientOption[];
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<
    MedicationFormInput,
    unknown,
    MedicationFormOutput
  >({
    resolver: zodResolver(MedicationAdministrationSchema),
    defaultValues: {
      patient_id: "",
      medication_name: "",
      dosage: "",
      route: "",
      administered_at: new Date(),
      status: "GIVEN",
      notes: "",
    },
  });

  const handleOnSubmit = async (values: MedicationFormOutput) => {
    try {
      setIsLoading(true);

      const resp = await addMedicationAdministration(values);

      if (resp.success) {
        toast.success("Medication administration logged!");

        router.refresh();

        form.reset({
          patient_id: "",
          medication_name: "",
          dosage: "",
          route: "",
          administered_at: new Date(),
          status: "GIVEN",
          notes: "",
        });
      } else {
        toast.error(resp.msg || "Something went wrong");
      }
    } catch (error) {
      console.error("Medication administration error:", error);

      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="text-sm font-normal"
          >
            <Plus size={22} className="text-gray-400" />
            Log Medication
          </Button>
        }
      />

      <DialogContent>
        <CardHeader className="px-0">
          <DialogTitle>Administer Medication</DialogTitle>
        </CardHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleOnSubmit)}
            className="space-y-6"
          >
            <CustomInput
              type="select"
              control={form.control}
              name="patient_id"
              label="Patient"
              placeholder="Select a patient"
              selectList={patients.map((patient) => ({
                label: patient.name,
                value: patient.id,
              }))}
            />

            <CustomInput
              type="input"
              control={form.control}
              name="medication_name"
              label="Medication"
              placeholder="e.g. Paracetamol"
            />

            <CustomInput
              type="input"
              control={form.control}
              name="dosage"
              label="Dosage"
              placeholder="e.g. 500mg"
            />

            <CustomInput
              type="input"
              control={form.control}
              name="route"
              label="Route"
              placeholder="e.g. Oral (optional)"
            />

            <CustomInput
              type="input"
              inputType="date"
              control={form.control}
              name="administered_at"
              label="Date/Time Administered"
            />

            <CustomInput
              type="select"
              control={form.control}
              name="status"
              label="Status"
              selectList={[
                {
                  label: "Given",
                  value: "GIVEN",
                },
                {
                  label: "Missed",
                  value: "MISSED",
                },
                {
                  label: "Refused",
                  value: "REFUSED",
                },
              ]}
            />

            <CustomInput
              type="textarea"
              control={form.control}
              name="notes"
              label="Notes"
              placeholder="Optional"
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 w-full"
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};