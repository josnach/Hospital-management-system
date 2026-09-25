import db from "@/lib/db";
import { checkRole } from "@/utils/roles";
import { format } from "date-fns";
import { Table } from "@/components/tables/table";
import { NoDataFound } from "@/components/no-data-found";
import { AddMedicationAdministration } from "@/components/dialogs/add-medication-administration";
import { MedicationAdministration, Patient } from "@/lib/generated/prisma/client";

interface ExtendedRecord extends MedicationAdministration {
  patient: Patient;
}

const columns = [
  { header: "No", key: "no" },
  { header: "Patient", key: "patient" },
  { header: "Medication", key: "medication" },
  { header: "Dosage", key: "dosage", className: "hidden md:table-cell" },
  { header: "Time", key: "time", className: "hidden md:table-cell" },
  { header: "Status", key: "status" },
  { header: "Notes", key: "notes", className: "hidden lg:table-cell" },
];

const AdministerMedicationsPage = async () => {
  const [records, patients] = await Promise.all([
    db.medicationAdministration.findMany({
      include: { patient: true },
      orderBy: { administered_at: "desc" },
    }),
    db.patient.findMany({
      select: { id: true, first_name: true, last_name: true },
    }),
  ]);

  const isAdmin = await checkRole("ADMIN");
  const isDoctor = await checkRole("DOCTOR");
  const isNurse = await checkRole("NURSE");
  const canLog = isAdmin || isDoctor || isNurse;

  const renderRow = (item: ExtendedRecord, index: number) => (
    <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-slate-50">
      <td className="py-2">{index + 1}</td>
      <td className="uppercase">{item.patient?.first_name} {item.patient?.last_name}</td>
      <td>{item.medication_name}</td>
      <td className="hidden md:table-cell">{item.dosage}</td>
      <td className="hidden md:table-cell">{format(item.administered_at, "MMM d, yyyy hh:mm a")}</td>
      <td>{item.status}</td>
      <td className="hidden lg:table-cell">{item.notes || "-"}</td>
    </tr>
  );

  return (
    <div className="bg-white rounded-xl p-4 2xl:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Administer Medications</h1>
        {canLog && (
          <AddMedicationAdministration
            key={new Date().getTime()}
            patients={patients.map((p) => ({
              id: p.id,
              name: `${p.first_name} ${p.last_name}`,
            }))}
          />
        )}
      </div>

      {records.length === 0 ? (
        <NoDataFound note="No medication administration records found" />
      ) : (
        <Table columns={columns} renderRow={renderRow} data={records} />
      )}
    </div>
  );
};

export default AdministerMedicationsPage;