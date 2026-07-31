import type { Metadata } from "next";
import AdminChat from "./AdminChat";
import AdminStats from "./AdminStats";

export const metadata: Metadata = {
  title: "System Admin",
  description: "Dashboard",
};

export default function SecretDashboardApp() {
  return (
    <div className="flex flex-col">
      <AdminChat />
      <AdminStats />
    </div>
  );
}
