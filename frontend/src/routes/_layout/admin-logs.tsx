import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { Suspense } from "react"

import { ActivityLogsService, UsersService } from "@/client"
import { columns } from "@/components/Admin/Logs/columns"
import { DataTable } from "@/components/Common/DataTable"
import PendingItems from "@/components/Pending/PendingItems"

function getLogsQueryOptions() {
  return {
    queryFn: () => ActivityLogsService.readActivityLogs({ skip: 0, limit: 100 }),
    queryKey: ["admin-logs"],
  }
}

export const Route = createFileRoute("/_layout/admin-logs")({
  component: AdminLogs,
  beforeLoad: async () => {
    const user = await UsersService.readUserMe()
    if (!user.is_superuser) {
      throw redirect({ to: "/" })
    }
  },
  head: () => ({
    meta: [
      {
        title: "Activity Logs - Startopia Calc",
      },
    ],
  }),
})

function LogsTableContent() {
  const { data: logs } = useSuspenseQuery(getLogsQueryOptions())

  if (logs.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No activity logs yet</h3>
        <p className="text-muted-foreground">
          Activity will be logged as actions are performed
        </p>
      </div>
    )
  }

  return <DataTable columns={columns} data={logs.data} />
}

function LogsTable() {
  return (
    <Suspense fallback={<PendingItems />}>
      <LogsTableContent />
    </Suspense>
  )
}

function AdminLogs() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Activity Logs</h1>
        <p className="text-muted-foreground">
          Track all actions performed in the system
        </p>
      </div>
      <LogsTable />
    </div>
  )
}
