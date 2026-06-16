import { MapPin, Plus, Pencil, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"

const addresses = [
  {
    id: 1,
    label: "Home",
    name: "Alex Nguyen",
    phone: "0901234567",
    address: "123 Nguyen Van Linh, District 7, Ho Chi Minh City",
    isDefault: true,
  },
  {
    id: 2,
    label: "Office",
    name: "Alex Nguyen",
    phone: "0901234567",
    address: "456 Le Van Viet, District 9, Ho Chi Minh City",
    isDefault: false,
  },
]

/** Shipping addresses tab. */
export function AccountAddresses() {
  return (
    <div>
      <Card className="py-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold">My addresses</CardTitle>
              <CardDescription>{addresses.length} addresses</CardDescription>
            </div>
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 cursor-pointer">
              <Plus className="w-4 h-4 mr-2" />
              Add address
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {addresses.map((addr) => (
            <Card
              key={addr.id}
              className={`transition-all ${
                addr.isDefault
                  ? "ring-2 ring-cyan-500/30 shadow-md"
                  : "hover:shadow-md"
              }`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div
                      className={`p-3 rounded-xl ${
                        addr.isDefault
                          ? "bg-gradient-to-br from-cyan-50 to-blue-50"
                          : "bg-slate-50"
                      }`}
                    >
                      <MapPin
                        className={`w-5 h-5 ${
                          addr.isDefault ? "text-cyan-600" : "text-slate-400"
                        }`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900">{addr.label}</h3>
                        {addr.isDefault && (
                          <Badge className="bg-cyan-50 text-cyan-700 border-cyan-200 text-[10px]">
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">
                        {addr.name} • {addr.phone}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">{addr.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-cyan-600 cursor-pointer"
                      aria-label="Edit address"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    {!addr.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-red-500 cursor-pointer"
                        aria-label="Delete address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
