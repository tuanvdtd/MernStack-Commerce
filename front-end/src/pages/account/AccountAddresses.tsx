import { useEffect, useState } from "react"
import { MapPin, Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { AddressFormDialog } from "~/components/account/AddressFormDialog"
import { deleteAddress, fetchAddresses, setDefaultAddress, type Address } from "~/apis/addressApi"

/** Shipping addresses tab. */
export function AccountAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Address | null>(null)

  const load = () => {
    fetchAddresses()
      .then(setAddresses)
      .finally(() => setIsLoading(false))
  }

  useEffect(load, [])

  const handleDelete = async (id: string) => {
    await deleteAddress(id)
    toast.success("Address removed")
    load()
  }

  const handleSetDefault = async (id: string) => {
    await setDefaultAddress(id)
    load()
  }

  if (isLoading) return null

  return (
    <div>
      <Card className="py-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold">My addresses</CardTitle>
              <CardDescription>{addresses.length} addresses</CardDescription>
            </div>
            <Button
              className="bg-gradient-to-r from-cyan-500 to-blue-600 cursor-pointer"
              onClick={() => {
                setEditing(null)
                setDialogOpen(true)
              }}
            >
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
                        <h3 className="font-semibold text-slate-900">
                          {addr.label || addr.recipientName}
                        </h3>
                        {addr.isDefault && (
                          <Badge className="bg-cyan-50 text-cyan-700 border-cyan-200 text-[10px]">
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">
                        {addr.recipientName} • {addr.phone}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        {addr.detail}, {addr.wardName}, {addr.provinceName}
                      </p>
                      {!addr.isDefault && (
                        <button
                          onClick={() => handleSetDefault(addr.id)}
                          className="mt-1 text-xs text-cyan-600 hover:underline"
                        >
                          Set as default
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-cyan-600 cursor-pointer"
                      aria-label="Edit address"
                      onClick={() => {
                        setEditing(addr)
                        setDialogOpen(true)
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    {!addr.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-red-500 cursor-pointer"
                        aria-label="Delete address"
                        onClick={() => handleDelete(addr.id)}
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

      <AddressFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        address={editing}
        onSaved={load}
      />
    </div>
  )
}
