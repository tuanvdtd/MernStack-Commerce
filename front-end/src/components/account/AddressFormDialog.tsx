import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Checkbox } from "~/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { toast } from "sonner"
import {
  createAddress,
  updateAddress,
  type Address,
  type UpsertAddressPayload,
} from "~/apis/addressApi"
import { fetchProvinces, fetchWards, type Province, type Ward } from "~/apis/locationApi"

type AddressFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  address: Address | null // null = create mode
  onSaved: () => void
}

const EMPTY_FORM: UpsertAddressPayload = {
  label: "",
  recipientName: "",
  phone: "",
  provinceCode: "",
  wardCode: "",
  detail: "",
  isDefault: false,
}

export function AddressFormDialog({
  open,
  onOpenChange,
  address,
  onSaved,
}: AddressFormDialogProps) {
  const [form, setForm] = useState<UpsertAddressPayload>(EMPTY_FORM)
  const [provinces, setProvinces] = useState<Province[]>([])
  const [wards, setWards] = useState<Ward[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    fetchProvinces().then(setProvinces)
    setForm(
      address
        ? {
            label: address.label ?? "",
            recipientName: address.recipientName,
            phone: address.phone,
            provinceCode: address.provinceCode,
            wardCode: address.wardCode,
            detail: address.detail,
            isDefault: address.isDefault,
          }
        : EMPTY_FORM
    )
  }, [open, address])

  useEffect(() => {
    if (!form.provinceCode) {
      setWards([])
      return
    }
    fetchWards(form.provinceCode).then(setWards)
  }, [form.provinceCode])

  const handleSubmit = async () => {
    setIsSaving(true)
    try {
      if (address) {
        await updateAddress(address.id, form)
      } else {
        await createAddress(form)
      }
      toast.success("Address saved")
      onSaved()
      onOpenChange(false)
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message ?? "Failed to save address")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{address ? "Edit address" : "Add address"}</DialogTitle>
          <DialogDescription>Used for shipping your orders.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label htmlFor="addr-label">Label (optional)</Label>
            <Input
              id="addr-label"
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              placeholder="Home, Office..."
            />
          </div>
          <div>
            <Label htmlFor="addr-name">Recipient name</Label>
            <Input
              id="addr-name"
              value={form.recipientName}
              onChange={(e) => setForm((f) => ({ ...f, recipientName: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="addr-phone">Phone</Label>
            <Input
              id="addr-phone"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="0901234567"
            />
          </div>
          <div>
            <Label>Province / City</Label>
            <Select
              value={form.provinceCode}
              onValueChange={(value) =>
                setForm((f) => ({ ...f, provinceCode: value, wardCode: "" }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select province" />
              </SelectTrigger>
              <SelectContent>
                {provinces.map((p) => (
                  <SelectItem key={p.code} value={p.code}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Ward</Label>
            <Select
              value={form.wardCode}
              onValueChange={(value) => setForm((f) => ({ ...f, wardCode: value }))}
              disabled={!form.provinceCode}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select ward" />
              </SelectTrigger>
              <SelectContent>
                {wards.map((w) => (
                  <SelectItem key={w.code} value={w.code}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="addr-detail">Address detail</Label>
            <Input
              id="addr-detail"
              value={form.detail}
              onChange={(e) => setForm((f) => ({ ...f, detail: e.target.value }))}
              placeholder="House number, street"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={form.isDefault}
              onCheckedChange={(checked) => setForm((f) => ({ ...f, isDefault: checked === true }))}
            />
            Set as default address
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
