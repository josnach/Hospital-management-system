import React from "react";

export interface Column {
  header: string;
  key: string;
  className?: string;
}

interface TableProps<T> {
  columns: Column[];
  renderRow: (item: T, index: number) => React.ReactNode;
  data: T[];
}

export const Table = <T,>({ columns, renderRow, data }: TableProps<T>) => {
  return (
    <table className="w-full mt-4">
      <thead>
        <tr className="text-left text-gray-500 text-sm lg:uppercase">
          {columns.map(({ header, key, className }) => (
            <th key={key} className={className}>
              {header}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {(!data || data.length < 1) && (
          <tr className="text-gray-400 text-base py-10">
            <td colSpan={columns.length}>No Data Found</td>
          </tr>
        )}

        {data?.length > 0 &&
          data.map((item, id) => renderRow(item, id))}
      </tbody>
    </table>
  );
};