import { AdminGate } from "@/components/AdminGate";
import { AdminPage } from "@/components/AdminPage";

export default function Page() {
  return (
    <AdminGate>
      <AdminPage />
    </AdminGate>
  );
}
