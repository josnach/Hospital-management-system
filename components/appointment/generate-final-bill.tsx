"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { generateBill } from "@/app/actions/medical";
import { PaymentSchema } from "@/lib/schema";

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

interface DataProps {
  id?: string | number;
  total_bill: number;
}

type PaymentFormInput = z.input<typeof PaymentSchema>;
type PaymentFormOutput = z.output<typeof PaymentSchema>;

export const GenerateFinalBills = ({ id, total_bill }: DataProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<PaymentFormInput, unknown, PaymentFormOutput>({
    resolver: zodResolver(PaymentSchema),
    defaultValues: {
      id: id?.toString() ?? "",
      bill_date: new Date(),
      discount: "0",
      total_amount: total_bill.toString(),
    },
  });

  const handleOnSubmit = async (values: PaymentFormOutput) => {
    try {
      setIsLoading(true);

      const resp = await generateBill(values);

      if (resp.success) {
        toast.success("Patient bill generated successfully!");

        router.refresh();

        form.reset({
          id: id?.toString() ?? "",
          bill_date: new Date(),
          discount: "0",
          total_amount: total_bill.toString(),
        });
      } else {
        toast.error(resp.msg || "Something went wrong");
      }
    } catch (error) {
      console.error("Generate bill error:", error);
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
            Generate Final Bill
          </Button>
        }
      />

      <DialogContent>
        <CardHeader className="px-0">
          <DialogTitle>Patient Medical Bill</DialogTitle>
        </CardHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleOnSubmit)}
            className="space-y-8"
          >
            <div className="flex items-center gap-2">
              <div>
                <span>Total Bill</span>

                <p className="text-3xl font-semibold">
                  {total_bill.toFixed(2)}
                </p>
              </div>
            </div>

            <CustomInput
              type="input"
              control={form.control}
              name="discount"
              placeholder="eg.: 5"
              label="Discount (%)"
            />

            <CustomInput
              type="input"
              control={form.control}
              name="bill_date"
              label="Bill Date"
              placeholder=""
              inputType="date"
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 w-full"
            >
              {isLoading ? "Generating..." : "Generate Bill"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};