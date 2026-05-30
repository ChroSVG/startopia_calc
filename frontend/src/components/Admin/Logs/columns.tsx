import type { ColumnDef } from "@tanstack/react-table"

import type { ActivityLogDetailModel as ActivityLog } from "@/client"

export type LogTableData = ActivityLog & {}

export const columns: ColumnDef<LogTableData>[] = [
  {
    accessorKey: "created_at",
    header: "Time",
    cell: ({ row }) => {
      const date = new Date(row.original.created_at)
      return date.toLocaleString()
    },
  },
  {
    accessorKey: "user_uid",
    header: "User",
    cell: ({ row }) => (
      <code className="text-xs">{row.original.user_uid.slice(0, 8)}…</code>
    ),
  },
  {
    accessorKey: "action",
    header: "Action",
  },
  {
    accessorKey: "message",
    header: "Message",
    cell: ({ row }) => (
      <span className="max-w-md truncate block">{row.original.message}</span>
    ),
  },
  {
    accessorKey: "reference_type",
    header: "Reference",
    cell: ({ row }) => {
      const refType = row.original.reference_type
      const refUid = row.original.reference_uid
      if (!refType) return "—"
      return (
        <span className="text-xs">
          {refType}: {refUid?.slice(0, 8)}…
        </span>
      )
    },
  },
]
