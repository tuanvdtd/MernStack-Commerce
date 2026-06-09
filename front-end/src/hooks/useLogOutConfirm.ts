import { useCallback, useState } from "react"
import { useLogOut } from "~/hooks/useLogOut"

export function useLogOutConfirm() {
  const [open, setOpen] = useState(false)
  const logOut = useLogOut()

  const requestLogOut = useCallback(() => setOpen(true), [])

  const confirmLogOut = useCallback(() => {
    setOpen(false)
    logOut()
  }, [logOut])

  return { open, setOpen, requestLogOut, confirmLogOut }
}
