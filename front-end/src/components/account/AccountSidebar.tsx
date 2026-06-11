import { NavLink } from "react-router"
import { LogOut, Camera, Star } from "lucide-react"
import { Card, CardContent } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Separator } from "~/components/ui/separator"
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar"
import { accountNavItems } from "~/lib/account/accountNav"
import { cn } from "~/lib/utils"
import type { User } from "~/types/user"

type AccountSidebarProps = {
  user: User
  onLogOut: () => void
}

/** Sidebar điều hướng tab tài khoản — dùng NavLink tới URL con /account/*. */
export function AccountSidebar({ user, onLogOut }: AccountSidebarProps) {
  const avatarSrc =
    user.profilePic ??
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400"

  return (
    <div className="space-y-4">
      <Card className="overflow-visible">
        <CardContent className="pt-6 pb-4 flex flex-col items-center text-center">
          <div className="relative mb-4 group">
            <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg">
              <AvatarImage src={avatarSrc} alt={user.name} />
              <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              aria-label="Đổi ảnh đại diện"
              className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-md border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-slate-600" />
            </button>
          </div>
          <h2 className="font-semibold text-slate-900 text-base">{user.name}</h2>
          <p className="text-slate-500 text-sm mb-3">{user.email}</p>
          <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white border-0 px-3 py-0.5 text-xs font-semibold shadow-sm">
            <Star className="w-3 h-3 mr-1 fill-current" />
            Thành viên Gold
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-2">
          <nav className="space-y-0.5" aria-label="Menu tài khoản">
            {accountNavItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.id}
                  to={`/account/${item.path}`}
                  end
                  className={({ isActive }) =>
                    cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                      {item.count}
                    </span>
                  )}
                </NavLink>
              )
            })}
            <Separator className="my-1" />
            <button
              type="button"
              onClick={onLogOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </button>
          </nav>
        </CardContent>
      </Card>
    </div>
  )
}
