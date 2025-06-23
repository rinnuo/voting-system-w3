import React from "react";
import Button from "./Button";

interface ListColumn<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface ListProps<T> {
  data: T[];
  columns: ListColumn<T>[];
  loading?: boolean;
  error?: string | null;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  editLabel?: string;
  deleteLabel?: string;
  emptyMessage?: string;
}

function List<T extends { id: number | string }>({
  data,
  columns,
  loading,
  error,
  onEdit,
  onDelete,
  editLabel = "Editar",
  deleteLabel = "Eliminar",
  emptyMessage = "No hay datos.",
}: ListProps<T>) {
  return (
    <div className="w-full">
      {loading && <div className="text-gray-200">Cargando...</div>}
      {error && <div className="text-red-400">{error}</div>}
      {!loading && !error && (
        <table className="w-full text-left bg-gray-800 text-gray-100 rounded shadow">
          <thead>
            <tr className="bg-gray-700">
              {columns.map((col, idx) => (
                <th key={idx} className={`py-2 px-4 ${col.className || ""}`}>
                  {col.header}
                </th>
              ))}
              {onEdit && <th className="py-2 px-4"></th>}
              {onDelete && <th className="py-2 px-4"></th>}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (onEdit ? 1 : 0) + (onDelete ? 1 : 0)}
                  className="py-4 text-center text-gray-400 bg-gray-800"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
            {data.map((row, idx) => (
              <tr
                key={row.id}
                className={
                  idx % 2 === 0
                    ? "bg-gray-800"
                    : "bg-gray-900"
                }
              >
                {columns.map((col, cidx) => (
                  <td key={cidx} className={`py-2 px-4 ${col.className || ""}`}>
                    {typeof col.accessor === "function"
                      ? col.accessor(row)
                      : (row as any)[col.accessor]}
                  </td>
                ))}
                {onEdit && (
                  <td className="py-2 px-4">
                    <Button variant="info" onClick={() => onEdit(row)}>
                      {editLabel}
                    </Button>
                  </td>
                )}
                {onDelete && (
                  <td className="py-2 px-4">
                    <Button variant="danger" onClick={() => onDelete(row)}>
                      {deleteLabel}
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default List;