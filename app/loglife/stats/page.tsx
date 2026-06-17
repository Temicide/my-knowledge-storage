import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatsMockup } from "@/components/loglife/StatsMockup";

export default async function StatsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

  if (!user) {
    redirect("/login?redirect=/loglife/stats");
  }

  return <StatsMockup />;
}
