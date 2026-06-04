import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-lg border p-4 bg-muted/20">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="text-sm text-muted-foreground">
          {total > 0 ? (
            <>
              Showing {Math.min(page * pageSize + 1, total)} to{" "}
              {Math.min((page + 1) * pageSize, total)} of{" "}
              <span className="font-medium text-foreground">{total}</span>{" "}
              entries
            </>
          ) : (
            <span className="font-medium text-foreground">0 entries</span>
          )}
        </div>
        <div className="flex items-center gap-x-2">
          <p className="text-sm text-muted-foreground">Rows per page</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-auto min-w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 25, 50, 100, total].map((ps) => (
                <SelectItem key={ps} value={`${ps}`}>
                  {ps === total ? "All" : ps}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center gap-x-6">
        <div className="flex items-center gap-x-1 text-sm text-muted-foreground">
          <span>Page</span>
          <span className="font-medium text-foreground">{page + 1}</span>
          <span>of</span>
          <span className="font-medium text-foreground">{totalPages}</span>
        </div>
        <div className="flex items-center gap-x-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(0)}
            disabled={page === 0}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(page + 1)}
            disabled={(page + 1) * pageSize >= total}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(totalPages - 1)}
            disabled={(page + 1) * pageSize >= total}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
