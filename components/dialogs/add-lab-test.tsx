"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { addLabTest } from "@/app/actions/medical";
import { LabTestSchema } from "@/lib/schema";

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

interface ServiceProps {
  id: number;
  service_name: string;
}

interface DataProps {
  patientId: string;
  doctorId: string;
  appointmentId: string;
  medicalId?: string;
  servicesData: ServiceProps[];
}

type LabTestFormInput = z.input<typeof LabTestSchema>;
type LabTestFormOutput = z.output<typeof LabTestSchema>;

export const AddLabTest = ({
  patientId,
  doctorId,
  appointmentId,
  medicalId,
  servicesData,
}: DataProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<LabTestFormInput, unknown, LabTestFormOutput>({
    resolver: zodResolver(LabTestSchema),
    defaultValues: {
      record_id: medicalId,
      service_id: "",
      test_date: new Date(),
      result: "",
      status: "PENDING",
      notes: "",
    },
  });

  const handleOnSubmit = async (values: LabTestFormOutput) => {
    try {
      setIsLoading(true);

      const response = await addLabTest(values, {
        appointmentId,
        patientId,
        doctorId,
      });

      if (!response.success) {
        toast.error(response.error || "Failed to add lab test");
        return;
      }

      toast.success("Lab test added successfully!");

      form.reset({
        record_id: medicalId,
        service_id: "",
        test_date: new Date(),
        result: "",
        status: "PENDING",
        notes: "",
      });

      router.refresh();
    } catch (error) {
      console.error("Add lab test error:", error);
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
            Add Lab Test
          </Button>
        }
      />

      <DialogContent>
        <CardHeader className="px-0">
          <DialogTitle>Add Lab Test</DialogTitle>
        </CardHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleOnSubmit)}
            className="space-y-6"
          >
            <CustomInput
              type="select"
              control={form.control}
              name="service_id"
              label="Test / Service"
              selectList={servicesData.map((service) => ({
                label: service.service_name,
                value: service.id.toString(),
              }))}
            />

            <CustomInput
              type="input"
              inputType="date"
              control={form.control}
              name="test_date"
              label="Test Date"
            />

            <CustomInput
              type="select"
              control={form.control}
              name="status"
              label="Status"
              selectList={[
                {
                  label: "Pending",
                  value: "PENDING",
                },
                {
                  label: "Ready",
                  value: "READY",
                },
              ]}
            />

            <CustomInput
              type="input"
              control={form.control}
              name="result"
              label="Result"
              placeholder="Fill in when ready"
            />

            <CustomInput
              type="input"
              control={form.control}
              name="notes"
              label="Notes"
              placeholder="Optional"
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600"
            >
              {isLoading ? "Saving..." : "Save Lab Test"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};