import { createClient as createBrowserClient } from "@/lib/supabase/browser";

const READ_KEY = "knowledge-read-status";

// ── localStorage (anonymous) ────────────────────────

export function getLocalReadStatus(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(READ_KEY) || "{}");
  } catch {
    return {};
  }
}

export function markAsReadLocal(slug: string) {
  if (typeof window === "undefined") return;
  try {
    const status = getLocalReadStatus();
    status[slug] = true;
    localStorage.setItem(READ_KEY, JSON.stringify(status));
  } catch {
    // ignore
  }
}

// ── Supabase (authenticated) ────────────────────────

export async function fetchReadStatus(): Promise<Record<string, boolean>> {
  const supabase = createBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  const { data } = await supabase
    .from("read_status")
    .select("slug")
    .eq("user_id", user.id);

  const status: Record<string, boolean> = {};
  for (const row of data ?? []) {
    status[row.slug] = true;
  }
  return status;
}

export async function markAsReadSupabase(slug: string) {
  const supabase = createBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("read_status").upsert(
    {
      user_id: user.id,
      slug,
      read_at: new Date().toISOString(),
    },
    { onConflict: "user_id,slug" },
  );
}

export async function migrateLocalToSupabase() {
  const supabase = createBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const local = getLocalReadStatus();
  const slugs = Object.keys(local);
  if (slugs.length === 0) return;

  const rows = slugs.map((slug) => ({
    user_id: user.id,
    slug,
    read_at: new Date().toISOString(),
  }));

  await supabase.from("read_status").upsert(rows, {
    onConflict: "user_id,slug",
  });

  // Clear localStorage after migration
  localStorage.removeItem(READ_KEY);
}

// ── Hybrid: auto-detect auth state ──────────────────

export async function getReadStatus(): Promise<Record<string, boolean>> {
  if (typeof window === "undefined") return {};

  const supabase = createBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Migrate any existing localStorage first
    const local = getLocalReadStatus();
    if (Object.keys(local).length > 0) {
      await migrateLocalToSupabase();
    }
    return fetchReadStatus();
  }

  return getLocalReadStatus();
}

export async function markAsRead(slug: string) {
  if (typeof window === "undefined") return;

  const supabase = createBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await markAsReadSupabase(slug);
  } else {
    markAsReadLocal(slug);
  }
}
