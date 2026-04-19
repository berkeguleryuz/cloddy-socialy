import { redirect } from "next/navigation";

// The real auth UI (Connect Wallet + SIWE + Demo) lives on the landing page
// at "/", rendered by ClientLayout for unauthenticated users.
export default function LoginRedirect() {
  redirect("/");
}
