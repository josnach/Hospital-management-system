// components/patient/patient-lab-tests.tsx
import db from "@/lib/db";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { NoDataFound } from "../no-data-found";
import { Table } from "../tables/table";
import { LabTest, Services } from "@/lib/generated/prisma/client";

interface ExtendedLabTest extends LabTest {
  services: Services;
}

const columns = [
  { header: "No", key: "no" },
  { header: "Test", key: "test" },
  { header: "Date", key: "date", className: "hidden md:table-cell" },
  { header: "Result", key: "result" },
  { header: "Status", key: "status" },
];

export const PatientLabTests = async ({ patientId }: { patientId: string }) => {
  const labTests = (await db.labTest.findMany({
    where: { medical_record: { patient_id: patientId } },
    include: { services: true },
    orderBy: { test_date: "desc" },
  })) as ExtendedLabTest[];

  const renderRow = (item: ExtendedLabTest, index: number) => (
    <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-slate-50">
      <td className="py-2">{index + 1}</td>
      <td>{item.services?.service_name}</td>
      <td className="hidden md:table-cell">{format(item.test_date, "MMM d, yyyy")}</td>
      <td>{item.status === "READY" ? (item.result || "—") : <span className="text-gray-400 italic">Awaiting result</span>}</td>
      <td>{item.status}</td>
    </tr>
  );

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Lab Test & Result</CardTitle>
      </CardHeader>
      <CardContent>
        {labTests.length === 0 ? (
          <NoDataFound note="No lab tests found" />
        ) : (
          <Table columns={columns} renderRow={renderRow} data={labTests} />
        )}
      </CardContent>
    </Card>
  );
};