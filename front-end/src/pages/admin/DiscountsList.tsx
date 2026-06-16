import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import { format } from "date-fns"
import { enUS } from "date-fns/locale"
import { useAdminStore } from "~/stores/adminStore"
import { mockDiscounts } from "~/mock/adminData"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { Plus, Search, Pencil, Trash2, Ticket, Copy, Check } from "lucide-react"
import { toast } from "sonner"
import {
  AdminWorkspace,
  AdminWorkspaceHeader,
  AdminMetricStrip,
  AdminFilterRow,
  AdminFilterSearch,
  AdminFilterField,
  AdminWorkspaceBody,
  AdminWorkspaceFooter,
} from "~/components/admin/AdminWorkspace"
import { AdminTableSkeleton } from "~/components/admin/AdminTableSkeleton"
import { AdminPagination } from "~/components/admin/AdminPagination"
import { AdminEmptyState } from "~/components/admin/AdminEmptyState"
import { DiscountStatusBadge } from "~/components/admin/DiscountStatusBadge"
import {
  adminBrandButtonClass,
  adminBrandTextClass,
  adminGhostButtonClass,
  adminMonoClass,
  adminThClass,
  adminTdClass,
  adminDividerClass,
  adminFilterInputClass,
  adminRowActionClass,
  formatVnd,
} from "~/lib/admin/ui"
import {
  DISCOUNT_APPLIES_TO_LABELS,
  DISCOUNT_TYPE_LABELS,
  formatDiscountValue,
  formatUsageRatio,
  getDiscountDisplayStatus,
  getUsagePercent,
} from "~/lib/admin/discountUtils"
import { ADMIN_PAGE_SIZE, paginate } from "~/lib/admin/pagination"
import { cn } from "~/lib/utils"

export function DiscountsList() {
  const { discounts, setDiscounts, deleteDiscount } = useAdminStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [appliesFilter, setAppliesFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedDiscountId, setSelectedDiscountId] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (discounts.length === 0) setDiscounts(mockDiscounts)
    const timer = window.setTimeout(() => setIsLoading(false), 280)
    return () => window.clearTimeout(timer)
  }, [discounts, setDiscounts])

  const filteredDiscounts = discounts.filter((discount) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      discount.name.toLowerCase().includes(q) ||
      discount.code.toLowerCase().includes(q) ||
      discount.description.toLowerCase().includes(q)
    const matchesType = typeFilter === "all" || discount.type === typeFilter
    const displayStatus = getDiscountDisplayStatus(discount)
    const matchesStatus =
      statusFilter === "all" || displayStatus === statusFilter
    const matchesApplies =
      appliesFilter === "all" || discount.appliesTo === appliesFilter
    return matchesSearch && matchesType && matchesStatus && matchesApplies
  })

  const { items: paginatedDiscounts, totalPages } = useMemo(
    () => paginate(filteredDiscounts, currentPage, ADMIN_PAGE_SIZE),
    [filteredDiscounts, currentPage]
  )

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  const hasActiveFilters =
    searchQuery !== "" ||
    typeFilter !== "all" ||
    statusFilter !== "all" ||
    appliesFilter !== "all"

  const activeCount = discounts.filter(
    (d) => getDiscountDisplayStatus(d) === "active"
  ).length

  const handleDeleteConfirm = () => {
    if (!selectedDiscountId) return
    deleteDiscount(selectedDiscountId)
    toast.success("Discount deleted")
    setDeleteDialogOpen(false)
    setSelectedDiscountId(null)
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setTypeFilter("all")
    setStatusFilter("all")
    setAppliesFilter("all")
    setCurrentPage(1)
  }

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      toast.success("Code copied")
      window.setTimeout(() => setCopiedCode(null), 2000)
    } catch {
      toast.error("Unable to copy code")
    }
  }

  if (isLoading) return <AdminTableSkeleton />

  return (
    <>
      <AdminWorkspace>
        <AdminWorkspaceHeader
          title="Discounts"
          description="Manage vouchers, usage limits, and application scope."
          actions={
            <Link to="/admin/discounts/create">
              <Button size="sm" className={cn("gap-1.5", adminBrandButtonClass)}>
                <Plus className="size-3.5" strokeWidth={2} />
                Create code
              </Button>
            </Link>
          }
        />

        <AdminMetricStrip
          metrics={[
            { label: "Total codes", value: discounts.length },
            {
              label: "Active",
              value: activeCount,
              tone: "success",
            },
            {
              label: "Scheduled",
              value: discounts.filter(
                (d) => getDiscountDisplayStatus(d) === "scheduled"
              ).length,
              tone: "brand",
            },
            {
              label: "Expired / fully used",
              value: discounts.filter((d) => {
                const s = getDiscountDisplayStatus(d)
                return s === "expired" || s === "exhausted"
              }).length,
              tone: "warning",
            },
          ]}
        />

        <AdminFilterRow>
          <AdminFilterSearch label="Keyword">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--admin-brand)]"
                strokeWidth={2}
              />
              <Input
                placeholder="Name, code, description..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className={cn("pl-9", adminFilterInputClass)}
              />
            </div>
          </AdminFilterSearch>
          <AdminFilterField label="Discount type">
            <Select
              value={typeFilter}
              onValueChange={(v) => {
                setTypeFilter(v)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className={cn("w-full", adminFilterInputClass)}>
                <SelectValue placeholder="Discount type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="FIXED_AMOUNT">Fixed amount</SelectItem>
                <SelectItem value="PERCENTAGE">Percentage</SelectItem>
              </SelectContent>
            </Select>
          </AdminFilterField>
          <AdminFilterField label="Status">
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className={cn("w-full", adminFilterInputClass)}>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="inactive">Disabled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="exhausted">Fully used</SelectItem>
              </SelectContent>
            </Select>
          </AdminFilterField>
          <AdminFilterField label="Scope">
            <Select
              value={appliesFilter}
              onValueChange={(v) => {
                setAppliesFilter(v)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className={cn("w-full", adminFilterInputClass)}>
                <SelectValue placeholder="Scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="ALL">Entire order</SelectItem>
                <SelectItem value="SPECIFIC">Selected products</SelectItem>
              </SelectContent>
            </Select>
          </AdminFilterField>
        </AdminFilterRow>

        <AdminWorkspaceBody>
          <Table>
            <TableHeader>
              <TableRow className={cn("hover:bg-transparent", adminDividerClass)}>
                <TableHead className={adminThClass}>Code / Name</TableHead>
                <TableHead className={adminThClass}>Value</TableHead>
                <TableHead className={adminThClass}>Scope</TableHead>
                <TableHead className={adminThClass}>Period</TableHead>
                <TableHead className={adminThClass}>Usage</TableHead>
                <TableHead className={adminThClass}>Minimum order</TableHead>
                <TableHead className={adminThClass}>Status</TableHead>
                <TableHead className={cn(adminThClass, "text-right")}>
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedDiscounts.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={8} className="p-0">
                    <AdminEmptyState
                      icon={Ticket}
                      title="No discounts found"
                      description={
                        hasActiveFilters
                          ? "Try changing filters or search keywords."
                          : "There are no discounts yet."
                      }
                      action={
                        hasActiveFilters ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-[13px]"
                            onClick={handleClearFilters}
                          >
                            Clear filters
                          </Button>
                        ) : (
                          <Link to="/admin/discounts/create">
                            <Button size="sm" className={adminBrandButtonClass}>
                              Create code
                            </Button>
                          </Link>
                        )
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                paginatedDiscounts.map((discount) => {
                  const usagePercent = getUsagePercent(
                    discount.usesCount,
                    discount.maxUses
                  )

                  return (
                    <TableRow
                      key={discount.id}
                      className={cn("group", adminDividerClass)}
                    >
                      <TableCell className={adminTdClass}>
                        <div className="min-w-0 max-w-[220px] space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={cn(
                                "font-mono text-[13px] font-semibold tracking-wide",
                                adminBrandTextClass
                              )}
                            >
                              {discount.code}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="size-6 text-muted-foreground"
                              aria-label={`Copy code ${discount.code}`}
                              onClick={() => handleCopyCode(discount.code)}
                            >
                              {copiedCode === discount.code ? (
                                <Check className="size-3" strokeWidth={2} />
                              ) : (
                                <Copy className="size-3" strokeWidth={2} />
                              )}
                            </Button>
                          </div>
                          <p className="truncate font-medium">{discount.name}</p>
                          <p className="truncate text-[12px] text-muted-foreground">
                            {DISCOUNT_TYPE_LABELS[discount.type]}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className={adminTdClass}>
                        <span className="font-mono font-medium">
                          {formatDiscountValue(discount)}
                        </span>
                      </TableCell>
                      <TableCell className={adminTdClass}>
                        <span className="text-[13px]">
                          {DISCOUNT_APPLIES_TO_LABELS[discount.appliesTo]}
                        </span>
                        {discount.appliesTo === "SPECIFIC" && (
                          <p className="text-[12px] text-muted-foreground">
                            {discount.productIds.length} products
                          </p>
                        )}
                      </TableCell>
                      <TableCell className={adminTdClass}>
                        <p className="text-[13px]">
                          {format(new Date(discount.startDate), "dd/MM/yy", {
                            locale: enUS,
                          })}
                          {" - "}
                          {format(new Date(discount.endDate), "dd/MM/yy", {
                            locale: enUS,
                          })}
                        </p>
                      </TableCell>
                      <TableCell className={adminTdClass}>
                        <span className={cn("font-mono font-medium", adminMonoClass)}>
                          {formatUsageRatio(discount.usesCount, discount.maxUses)}
                        </span>
                        <div className="mt-1.5 h-1 w-20 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn(
                              "h-full rounded-full transition-[width] duration-300",
                              usagePercent >= 90
                                ? "bg-amber-500"
                                : "bg-[var(--admin-brand)]"
                            )}
                            style={{ width: `${usagePercent}%` }}
                            role="progressbar"
                            aria-valuenow={usagePercent}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`${usagePercent}% used`}
                          />
                        </div>
                      </TableCell>
                      <TableCell className={cn(adminTdClass, adminMonoClass)}>
                        {discount.minOrderValue > 0
                          ? formatVnd(discount.minOrderValue)
                          : "None"}
                      </TableCell>
                      <TableCell className={adminTdClass}>
                        <DiscountStatusBadge discount={discount} />
                      </TableCell>
                      <TableCell className={cn(adminTdClass, "text-right")}>
                        <div className={adminRowActionClass}>
                          <Link to={`/admin/discounts/edit/${discount.id}`}>
                            <Button
                              variant="outline"
                              size="icon-sm"
                              className={cn(
                                "size-8 bg-background",
                                adminGhostButtonClass
                              )}
                              aria-label="Edit"
                            >
                              <Pencil className="size-3.5" strokeWidth={1.75} />
                            </Button>
                          </Link>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            className={cn(
                              "size-8 border-destructive/30 bg-background text-destructive hover:bg-destructive/5",
                              adminGhostButtonClass
                            )}
                            aria-label="Delete"
                            onClick={() => {
                              setSelectedDiscountId(discount.id)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="size-3.5" strokeWidth={1.75} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </AdminWorkspaceBody>

        <AdminWorkspaceFooter>
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredDiscounts.length}
            pageSize={ADMIN_PAGE_SIZE}
            onPageChange={setCurrentPage}
            itemLabel="codes"
          />
        </AdminWorkspaceFooter>
      </AdminWorkspace>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete discount?</AlertDialogTitle>
            <AlertDialogDescription>
              The code and all related usage history will be deleted. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
