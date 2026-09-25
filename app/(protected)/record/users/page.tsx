import { Table } from "@/components/tables/table";
import { clerkClient } from "@clerk/nextjs/server";
import { format } from "date-fns";
import { BriefcaseBusiness } from "lucide-react";

const columns = [
  {
    header: "user ID",
    key: "id",
    className: "hidden lg:table-cell",
  },
  {
    header: "Name",
    key: "name",
  },
  {
    header: "Email",
    key: "email",
    className: "hidden md:table-cell",
  },
  {
    header: "Role",
    key: "role",
  },
  {
    header: "Status",
    key: "status",
  },
  {
    header: "Last Login",
    key: "last_login",
    className: "hidden xl:table-cell",
  },
];

const UserPage = async () => {
  const client = await clerkClient();

  const { data, totalCount } = await client.users.getUserList({
    orderBy: "-created_at",
  });

  if (!data) return null;

  const renderRow = (item: (typeof data)[number]) => {
    const firstName = item.firstName ?? "";
    const lastName = item.lastName ?? "";

    const fullName =
      `${firstName} ${lastName}`.trim() || "Unnamed User";

    const email =
      item.emailAddresses?.[0]?.emailAddress ?? "No email";

    const role =
      typeof item.publicMetadata?.role === "string"
        ? item.publicMetadata.role
        : "user";

    const lastLogin = item.lastSignInAt
      ? format(
          new Date(item.lastSignInAt),
          "yyyy-MM-dd h:mm:ss"
        )
      : "Never";

    return (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-base hover:bg-slate-50"
      >
        <td className="hidden lg:table-cell items-center">
          {item.id}
        </td>

        <td className="table-cell py-2 xl:py-4">
          {fullName}
        </td>

        <td className="table-cell">
          {email}
        </td>

        <td className="table-cell capitalize">
          {role}
        </td>

        <td className="hidden md:table-cell capitalize">
          Active
        </td>

        <td className="hidden md:table-cell capitalize">
          {lastLogin}
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white rounded-xl p-2 md:p-4 2xl:p-6">
      <div className="flex items-center justify-between">
        <div className="hidden lg:flex items-center gap-1">
          <BriefcaseBusiness
            size={20}
            className="text-gray-500"
          />

          <p className="text-2xl font-semibold">
            {totalCount}
          </p>

          <span className="text-gray-600 text-sm xl:text-base">
            total users
          </span>
        </div>
      </div>

      <div>
        <Table
          columns={columns}
          data={data}
          renderRow={renderRow}
        />
      </div>
    </div>
  );
};

export default UserPage;