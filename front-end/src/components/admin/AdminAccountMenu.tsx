import { Link } from "react-router"
import { ChevronDown, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { LogOutConfirmDialog } from "~/components/LogOutConfirmDialog"
import { useLogOutConfirm } from "~/hooks/useLogOutConfirm"
import { getUserInitials } from "~/lib/admin/ui"
import { userStore } from "~/stores/userStore"

export function AdminAccountMenu() {
  const user = userStore((s) => s.user)
  const { open, setOpen, requestLogOut, confirmLogOut } = useLogOutConfirm()

  if (!user) {
    return (
      <Button variant="ghost" size="sm" className="h-8 text-[13px]" asChild>
        <Link to="/login">Đăng nhập</Link>
      </Button>
    )
  }

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-2 px-2 text-[13px] font-normal"
        >
          <Avatar className="size-6">
            <AvatarImage src={user.profilePic} alt={user.name} />
            <AvatarFallback className="text-[10px]">
              {getUserInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[8rem] truncate sm:inline">
            {user.name}
          </span>
          <ChevronDown className="size-3.5 opacity-60" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* <DropdownMenuItem asChild>
          <Link to="/" className="cursor-pointer">
            <Store />
            Về cửa hàng
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator /> */}
        <DropdownMenuItem
          variant="destructive"
          onClick={requestLogOut}
          className="cursor-pointer"
        >
          <LogOut />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <LogOutConfirmDialog
      open={open}
      onOpenChange={setOpen}
      onConfirm={confirmLogOut}
    />
    </>
  )
}
