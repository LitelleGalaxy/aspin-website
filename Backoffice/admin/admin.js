async function requireAdmin() {
  const { data, error } = await supabaseClient.auth.getSession();

  if (error || !data.session) {
    window.location.href = "login.html";
    return null;
  }

  return data.session;
}

async function loadDashboard() {
  const session = await requireAdmin();
  if (!session) return;

  document.getElementById("adminEmail").textContent =
    session.user.email || "";

  const [
    promotions,
    subscribers,
    registerClicks,
    events
  ] = await Promise.all([
    supabaseClient
      .from("promotions")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true),

    supabaseClient
      .from("subscribers")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),

    supabaseClient
      .from("analytics_events")
      .select("id", { count: "exact", head: true })
      .eq("event_name", "register_click"),

    supabaseClient
      .from("analytics_events")
      .select("id", { count: "exact", head: true })
  ]);

  const firstError = [promotions, subscribers, registerClicks, events]
    .find(result => result.error);

  if (firstError) {
    document.getElementById("dbStatus").textContent = "CHECK RLS";
    document.getElementById("dbStatus").className = "status-warning";
    return;
  }

  document.getElementById("dbStatus").textContent = "CONNECTED";
  document.getElementById("dbStatus").className = "status-ok";

  document.getElementById("promotionCount").textContent =
    promotions.count ?? 0;
  document.getElementById("subscriberCount").textContent =
    subscribers.count ?? 0;
  document.getElementById("registerClicks").textContent =
    registerClicks.count ?? 0;
  document.getElementById("eventCount").textContent =
    events.count ?? 0;
}

document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
});

loadDashboard();
