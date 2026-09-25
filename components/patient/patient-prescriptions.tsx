import db from "@/lib/db";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { NoDataFound } from "../no-data-found";
import { Separator } from "../ui/separator";

export const PatientPrescriptions = async ({ patientId }: { patientId: string }) => {
  const diagnoses = await db.diagnosis.findMany({
    where: { medical: { patient_id: patientId } },
    include: { doctor: true },
    orderBy: { created_at: "desc" },
  });

  const withPrescriptions = diagnoses.filter((d) => d.prescribed_medications);

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Prescriptions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {withPrescriptions.length === 0 ? (
          <NoDataFound note="No prescriptions found" />
        ) : (
          withPrescriptions.map((item, index) => (
            <div key={item.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {format(item.created_at, "MMM d, yyyy")}
                </span>
                <span className="text-sm text-gray-500">Dr {item.doctor?.name}</span>
              </div>
              <p className="text-base font-medium">{item.prescribed_medications}</p>
              {item.follow_up_plan && (
                <p className="text-sm text-muted-foreground">
                  Follow-up: {item.follow_up_plan}
                </p>
              )}
              {index < withPrescriptions.length - 1 && <Separator className="mt-4" />}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};