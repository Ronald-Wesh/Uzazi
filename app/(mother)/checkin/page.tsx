import { CheckInForm } from "@/components/mother/checkin-form";
import { AppShell } from "@/components/shared/app-shell";
import { PageHeader } from "@/components/shared/page-header";

export default function CheckInPage() {
  return (
    <AppShell role="mother">
      <PageHeader
        badge="Daily Check-In"
        title="Turn today&apos;s feelings into a signal your care team can act on."
        description="This flow balances emotional honesty with clinical usefulness, so mothers are heard without needing to narrate everything twice."
      />
      <CheckInForm />
    </AppShell>
  );
}
