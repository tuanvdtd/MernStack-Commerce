import { Mail, Phone, Bell } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Separator } from "~/components/ui/separator"
import { Switch } from "~/components/ui/switch"

const notificationSettings = [
  {
    icon: Mail,
    title: "Nhận email thông báo",
    desc: "Thông báo về đơn hàng và khuyến mãi",
    defaultOn: true,
  },
  {
    icon: Phone,
    title: "Nhận thông báo SMS",
    desc: "Tin nhắn về trạng thái đơn hàng",
    defaultOn: true,
  },
  {
    icon: Bell,
    title: "Thông báo đẩy",
    desc: "Nhận push notification trên trình duyệt",
    defaultOn: false,
  },
]

/** Tab cài đặt tài khoản. */
export function AccountSettings() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Cài đặt</CardTitle>
          <CardDescription>Quản lý thông báo và tùy chọn</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Thông báo</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4 space-y-1">
          {notificationSettings.map((setting) => (
            <div key={setting.title} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100">
                  <setting.icon className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{setting.title}</p>
                  <p className="text-xs text-slate-500">{setting.desc}</p>
                </div>
              </div>
              <Switch defaultChecked={setting.defaultOn} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-red-100">
        <CardHeader>
          <CardTitle className="text-base text-red-600">Vùng nguy hiểm</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Xóa tài khoản</p>
              <p className="text-xs text-slate-500">Hành động này không thể hoàn tác</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-red-500 border-red-200 hover:bg-red-50 cursor-pointer"
            >
              Xóa tài khoản
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
