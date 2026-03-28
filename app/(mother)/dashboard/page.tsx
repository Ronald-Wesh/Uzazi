import { MotherDashboardOverview } from "@/components/mother/dashboard-overview";
import { AppShell } from "@/components/shared/app-shell";
import { PageHeader } from "@/components/shared/page-header";

export default function DashboardPage() {
  return (
    <AppShell role="mother">
      <PageHeader
        badge="Mother Dashboard"
        title="A steadier postpartum rhythm, one caring action at a time."
        description="Track recovery, reflect honestly, and let UZAZI surface the moments when extra support should reach you faster."
      />
      <MotherDashboardOverview />
    </AppShell>
  );
}
