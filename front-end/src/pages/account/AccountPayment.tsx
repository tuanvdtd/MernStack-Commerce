import { CreditCard, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Separator } from "~/components/ui/separator"

/** Tab phương thức thanh toán. */
export function AccountPayment() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Phương thức thanh toán</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="py-16 flex flex-col items-center text-center">
        <div className="p-4 rounded-2xl bg-slate-50 mb-4">
          <CreditCard className="w-12 h-12 text-slate-300" />
        </div>
        <p className="text-slate-500 mb-1">Bạn chưa có phương thức thanh toán nào</p>
        <p className="text-sm text-slate-400 mb-6">
          Thêm thẻ để thanh toán nhanh hơn
        </p>
        <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 cursor-pointer">
          <Plus className="w-4 h-4 mr-2" />
          Thêm thẻ mới
        </Button>
      </CardContent>
    </Card>
  )
}
