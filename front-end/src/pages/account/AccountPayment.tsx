import { CreditCard, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Separator } from "~/components/ui/separator"

/** Payment methods tab. */
export function AccountPayment() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Payment methods</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="py-16 flex flex-col items-center text-center">
        <div className="p-4 rounded-2xl bg-slate-50 mb-4">
          <CreditCard className="w-12 h-12 text-slate-300" />
        </div>
        <p className="text-slate-500 mb-1">You do not have any payment methods yet</p>
        <p className="text-sm text-slate-400 mb-6">
          Add a card for faster checkout
        </p>
        <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 cursor-pointer">
          <Plus className="w-4 h-4 mr-2" />
          Add new card
        </Button>
      </CardContent>
    </Card>
  )
}
