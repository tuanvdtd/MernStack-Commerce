import { Navigate, Outlet } from "react-router"
import { LogOutConfirmDialog } from "~/components/LogOutConfirmDialog"
import { AccountSidebar } from "~/components/account/AccountSidebar"
import { useLogOutConfirm } from "~/hooks/useLogOutConfirm"
import { userStore } from "~/stores/userStore"

/** Account page layout with sidebar and outlet for child URL tabs. */
export function AccountV2() {
  const user = userStore((s) => s.user)
  const { open, setOpen, requestLogOut, confirmLogOut } = useLogOutConfirm()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          <AccountSidebar user={user} onLogOut={requestLogOut} />
          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      </div>

      <LogOutConfirmDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={confirmLogOut}
      />
    </div>
  )
}
