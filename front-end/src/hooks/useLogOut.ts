import { useNavigate } from "react-router";
import { userStore } from "~/stores/userStore";

export function useLogOut() {
  const navigate = useNavigate();
  const logOut = userStore((s) => s.logOut);

  return () => {
    logOut();
    navigate("/", { replace: true });
  };
}
