import { CheckInForm } from "@/components/mother/checkin-form";
import { AppShell } from "@/components/shared/app-shell";
import { PageHeader } from "@/components/shared/page-header";

export default function CheckInPage() {
  return (
    <AppShell role="mother">
      <PageHeader
        badge="Daily Check-In Streak"
        title="Complete today&apos;s check-in, earn a petal, and keep your garden blooming."
        description="This daily ritual turns honest reflection into a care signal for your support team and visible progress in your healing garden."
      />
      <CheckInForm />
    </AppShell>
  );
}
