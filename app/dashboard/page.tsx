import { redirect } from "next/navigation";

export default function DashboardPage() {
  // default arahkan ke admin
  redirect("/dashboard/admin");
}
