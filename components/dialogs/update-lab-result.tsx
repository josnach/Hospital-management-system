"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { updateLabTestResult } from "@/app/actions/medical";
import { CustomInput } from "../custom-input";
import { Button } from "../ui/button";
import { CardHeader } from "../ui/card";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Form } from "../ui/form";

const UpdateResultSchema = z.object({
  result: z.string().min(1, "Result is required"),
  status: z.enum(["PENDING", "READY"]),
  notes: z.string().optional(),
});

export const UpdateLabResult = ({
  id,
  currentResult,
  currentStatus,
  currentNotes,
}: {
  id: string;
  currentResult: string;
  currentStatus: "PENDING" | "READY";
  currentNotes?: string | null;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof UpdateResultSchema>>({
    resolver: zodResolver(UpdateResultSchema),
    defaultValues: {
      result: currentResult,
      status: currentStatus,
      notes: currentNotes || "",
    },
  });

  const handleOnSubmit = async (values: z.infer<typeof UpdateResultSchema>) => {
    try {
      setIsLoading(true);
      const resp = await updateLabTestResult(id, values);

      if (resp.success) {
        toast.success("Lab result updated!");
        router.refresh();
      } else {
        toast.error(resp.error || "Something went wrong");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="ghost" size="sm"><Pencil size={16} /></Button>} />
      <DialogContent>
        <CardHeader className="px-0">
          <DialogTitle>Update Lab Result</DialogTitle>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleOnSubmit)} className="space-y-6">
            <CustomInput type="input" control={form.control} name="result" label="Result" />
            <CustomInput
              type="select"
              control={form.control}
              name="status"
              label="Status"
              selectList={[
                { label: "Pending", value: "PENDING" },
                { label: "Ready", value: "READY" },
              ]}
            />
            <CustomInput type="textarea" control={form.control} name="notes" label="Notes" />

            <Button type="submit" disabled={isLoading} className="bg-blue-600 w-full">
              Save
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};