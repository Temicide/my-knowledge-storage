import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogLifeClient } from "@/components/loglife/LogLifeClient";

export default async function LogLifePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

  if (!user) {
    redirect("/login?redirect=/loglife");
  }

  const year = new Date().getFullYear();

  const { data: logs } = await supabase
    .from("daily_logs")
    .select("log_date, what_done, happiest_thing")
    .eq("user_id", user.id)
    .gte("log_date", `${year}-01-01`)
    .lte("log_date", `${year}-12-31`);

  return (
    <LogLifeClient
      userId={user.id}
      initialLogs={(logs as any[]) ?? []}
      year={year}
    />
  );
}
