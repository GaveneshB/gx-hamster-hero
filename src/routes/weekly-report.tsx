import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { WeeklyReportContent } from "@/components/WeeklyReportContent";

export const Route = createFileRoute("/weekly-report")({
  head: () => ({
    meta: [
      { title: "Weekly Report — GX Buddy" },
      { name: "description", content: "Sunday-night recap of where your money flowed." },
    ],
  }),
  component: Weekly,
});

function Weekly() {
  return (
    <AppShell>
      <PageHeader title="Weekly Report" subtitle="Sunday recap from Buddy" />
      <div className="px-5">
        <WeeklyReportContent />
      </div>
    </AppShell>
  );
}
