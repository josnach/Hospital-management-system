import db from "@/lib/db";
import { checkRole } from "@/utils/roles";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { NoDataFound } from "../no-data-found";
import { AddLabTest } from "../dialogs/add-lab-test";
import { ActionDialog } from "../action-dialog";
import { Table } from "../tables/table";
import { LabTest, Services } from "@/lib/generated/prisma/client";
import { UpdateLabResult } from "../dialogs/update-lab-result";


interface ExtendedLabTest extends LabTest {
  services: Services;
}

const columns = [
  { header: "No", key: "no" },
  { header: "Test", key: "test" },
  { header: "Date", key: "date", className: "hidden md:table-cell" },
  { header: "Result", key: "result", className: "hidden lg:table-cell" },
  { header: "Status", key: "status" },
  { header: "Action", key: "action" },
];
export const LabTestContainer = async ({
  patientId,
  doctorId,
  id,
}: { patientId: string; doctorId: string; id: string }) => {
  const [record, servicesData] = await Promise.all([
    db.medicalRecords.findFirst({
      where: { appointment_id: Number(id) },
      include: {
        lab_test: { include: { services: true }, orderBy: { created_at: "desc" } },
      },
      orderBy: { created_at: "desc" },
    }),
    db.services.findMany(),
  ]);

  const labTests = (record?.lab_test || []) as ExtendedLabTest[];
  const isPatient = await checkRole("PATIENT");   // ← this line was missing

  const renderRow = (item: ExtendedLabTest, index: number) => (
    
    <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-slate-50">
      <td className="py-2">{index + 1}</td>
      <td>{item.services?.service_name}</td>
      <td className="hidden md:table-cell">{format(item.test_date, "MMM d, yyyy")}</td>
      <td className="hidden lg:table-cell">{item.result || "Pending"}</td>
      <td>{item.status}</td>
      <td>
  {!isPatient && (
    <div className="flex items-center gap-1">
      <UpdateLabResult
        id={item.id.toString()}
        currentResult={item.result}
        currentStatus={item.status}
        currentNotes={item.notes}
      />
      <ActionDialog type="delete" id={item.id.toString()} deleteType="lab_test" />
    </div>
  )}
</td>
    </tr>
  );

  return (
    <Card className="shadow-none">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Lab Tests</CardTitle>
        {!isPatient && (
          <AddLabTest
            key={new Date().getTime()}
            patientId={patientId}
            doctorId={doctorId}
            appointmentId={id}
            medicalId={record?.id.toString()}
            servicesData={servicesData}
          />
        )}
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

