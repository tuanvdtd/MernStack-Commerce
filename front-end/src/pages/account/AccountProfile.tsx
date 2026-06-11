import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Shield, Calendar, Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  fetchMyProfile,
  getUserApiError,
  mapProfileToUser,
  patchMyProfile,
  type PatchProfilePayload,
} from "~/apis/userApi"
import { getDirtyValues } from "~/lib/admin/getDirtyValues"
import {
  profileFormSchema,
  type ProfileFormValues,
} from "~/lib/account/profileFormSchema"
import { formatJoinDate } from "~/lib/account/formatters"
import { userStore } from "~/stores/userStore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Separator } from "~/components/ui/separator"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"

/** Dựng payload PATCH chỉ gồm field dirty (name, phone). */
const buildProfilePatchPayload = (
  values: ProfileFormValues,
  dirtyFields: Record<string, unknown>
): PatchProfilePayload => {
  const dirty = getDirtyValues(dirtyFields, {
    name: values.name.trim(),
    phone: values.phone.trim() === "" ? null : values.phone.trim(),
  })

  const payload: PatchProfilePayload = {}
  if (dirty.name !== undefined) payload.name = dirty.name as string
  if (dirty.phone !== undefined) payload.phone = dirty.phone as string | null
  return payload
}

/** Tab thông tin cá nhân — load GET /user/me, lưu PATCH partial qua react-hook-form. */
export function AccountProfile() {
  const setUser = userStore((s) => s.setUser)
  const storedUser = userStore((s) => s.user)
  const [joinAt, setJoinAt] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: storedUser?.name ?? "",
      email: storedUser?.email ?? "",
      phone: storedUser?.phone ?? "",
    },
  })

  useEffect(() => {
    let cancelled = false

    const loadProfile = async () => {
      setIsLoading(true)
      try {
        const profile = await fetchMyProfile()
        if (cancelled) return

        setJoinAt(profile.joinAt)
        form.reset({
          name: profile.name,
          email: profile.email,
          phone: profile.phone ?? "",
        })
        setUser(mapProfileToUser(profile, storedUser))
      } catch (error) {
        if (!cancelled) toast.error(getUserApiError(error))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadProfile()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSaveProfile = form.handleSubmit(async (values) => {
    const payload = buildProfilePatchPayload(values, form.formState.dirtyFields)

    if (Object.keys(payload).length === 0) {
      toast.message("Không có thay đổi để lưu")
      return
    }

    setIsSaving(true)
    try {
      const profile = await patchMyProfile(payload)
      setJoinAt(profile.joinAt)
      form.reset({
        name: profile.name,
        email: profile.email,
        phone: profile.phone ?? "",
      })
      setUser(mapProfileToUser(profile, storedUser))
      toast.success("Đã cập nhật thông tin cá nhân")
    } catch (error) {
      toast.error(getUserApiError(error))
    } finally {
      setIsSaving(false)
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Đang tải thông tin...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold">Thông tin cá nhân</CardTitle>
              <CardDescription>Cập nhật thông tin cá nhân của bạn</CardDescription>
            </div>
            <Shield className="w-5 h-5 text-emerald-500" />
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Họ và tên</FormLabel>
                      <FormControl>
                        <Input {...field} autoComplete="name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            {...field}
                            readOnly
                            disabled
                            className="pr-20 bg-muted/50"
                          />
                        </FormControl>
                        <Badge
                          variant="outline"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-600 border-emerald-200 bg-emerald-50 text-[10px]"
                        >
                          Đã xác thực
                        </Badge>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số điện thoại</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          inputMode="tel"
                          autoComplete="tel"
                          placeholder="0901234567"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-2">
                  <FormLabel>Ngày tham gia</FormLabel>
                  <div className="flex items-center gap-2 h-9 px-3 rounded-md border bg-muted/50 text-sm text-slate-500">
                    <Calendar className="w-4 h-4" />
                    {joinAt ? formatJoinDate(joinAt) : "Chưa có"}
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isSaving || !form.formState.isDirty}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-md shadow-cyan-500/25 cursor-pointer"
                >
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Lưu thay đổi
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Bảo mật</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100">
                <Shield className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Mật khẩu</p>
                <p className="text-xs text-slate-500">Cập nhật lần cuối: 2 tháng trước</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="cursor-pointer">
              Đổi mật khẩu
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
