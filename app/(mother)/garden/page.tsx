import { GardenOverview } from "@/components/mother/garden-overview";
import { AppShell } from "@/components/shared/app-shell";
import { PageHeader } from "@/components/shared/page-header";

export default function GardenPage() {
  return (
    <AppShell role="mother">
      <PageHeader
        badge="Healing Garden"
        title="Recovery becomes visible when care is celebrated, not hidden."
        description="Your garden is the emotional reward layer in UZAZI, turning repeated acts of self-checking and support-seeking into something warm and tangible."
      />
      <GardenOverview />
    </AppShell>
  );
}
