import { Pagination } from "@/components/pagination";
import SearchInput from "@/components/search-input";
import { Table } from "@/components/tables/table";
import { AuditLog } from "@/lib/generated/prisma/client";
import { SearchParamsProps } from "@/types";
import { checkRole } from "@/utils/roles";
import { DATA_LIMIT } from "@/utils/seetings";
import { getAuditLogs } from "@/utils/services/audit-log";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Logs } from "lucide-react";

const columns = [
  { header: "No", key: "no" },
  { header: "Action", key: "action" },
  { header: "Model", key: "model", className: "hidden md:table-cell" },
  { header: "Record ID", key: "record_id", className: "hidden lg:table-cell" },
  { header: "Performed By", key: "user_id", className: "hidden xl:table-cell" },
  { header: "Details", key: "details", className: "hidden 2xl:table-cell" },
  { header: "Date", key: "date" },
];

const AuditLogsPage = async (props: SearchParamsProps) => {
  const isAdmin = await checkRole("ADMIN");
  if (!isAdmin) redirect("/");

  const searchParams = await props.searchParams;
  const page = (searchParams?.p || "1") as string;
  const searchQuery = (searchParams?.q || "") as string;

  const { data, totalPages, totalRecords, currentPage } = await getAuditLogs({
    page,
    search: searchQuery,
  });

  const renderRow = (item: AuditLog, index: number) => (
    <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-slate-50">
      <td className="py-2">{index + 1}</td>
      <td className="capitalize">{item.action}</td>
      <td className="hidden md:table-cell">{item.model}</td>
      <td className="hidden lg:table-cell">#{item.record_id}</td>
      <td className="hidden xl:table-cell">{item.user_id}</td>
      <td className="hidden 2xl:table-cell">
        {item.details || <span className="text-gray-400 italic">No details</span>}
      </td>
      <td>{format(item.created_at, "MMM d, yyyy hh:mm a")}</td>
    </tr>
  );

  return (
    <div className="bg-white rounded-xl py-6 px-3 2xl:px-6">
      <div className="flex items-center justify-between">
        <div className="hidden lg:flex items-center gap-1">
          <Logs size={20} className="text-gray-500" />
          <p className="text-2xl font-semibold">{totalRecords}</p>
          <span className="text-gray-600 text-sm xl:text-base">total logs</span>
        </div>
        <div className="w-full lg:w-fit flex items-center justify-between lg:justify-start gap-2">
          <SearchInput />
        </div>
      </div>

      <div className="mt-4">
        <Table columns={columns} data={data} renderRow={renderRow} />
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          totalRecords={totalRecords}
          limit={DATA_LIMIT}
        />
      </div>
    </div>
  );
};

export default AuditLogsPage;