import { CompanionChat } from "@/components/mother/companion-chat";
import { AppShell } from "@/components/shared/app-shell";
import { PageHeader } from "@/components/shared/page-header";

export default function CompanionPage() {
  return (
    <AppShell role="mother">
      <PageHeader
        badge="3AM Companion"
        title="A low-pressure support space for the hardest quiet hours."
        description="UZAZI responds with grounding prompts, compassionate reflection, and escalation-aware language when the night feels too heavy."
      />
      <CompanionChat />
    </AppShell>
  );
}
