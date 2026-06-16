import { Mail, Phone, Bell } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Separator } from "~/components/ui/separator"
import { Switch } from "~/components/ui/switch"

const notificationSettings = [
  {
    icon: Mail,
    title: "Email notifications",
    desc: "Updates about orders and promotions",
    defaultOn: true,
  },
  {
    icon: Phone,
    title: "SMS notifications",
    desc: "Messages about order status",
    defaultOn: true,
  },
  {
    icon: Bell,
    title: "Push notifications",
    desc: "Receive browser push notifications",
    defaultOn: false,
  },
]

/** Account settings tab. */
export function AccountSettings() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Settings</CardTitle>
          <CardDescription>Manage notifications and preferences</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
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
          <CardTitle className="text-base text-red-600">Danger zone</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Delete account</p>
              <p className="text-xs text-slate-500">This action cannot be undone</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-red-500 border-red-200 hover:bg-red-50 cursor-pointer"
            >
              Delete account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
