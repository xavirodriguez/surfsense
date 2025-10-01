import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { NavBar } from "@/components/nav-bar"
import { RealtimeAlertList } from "@/components/realtime-alert-list"

export default async function AlertsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get alerts with spot details
  const { data: alerts } = await supabase
    .from("alerts")
    .select(
      `
      *,
      surf_spots (name, region, country)
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50">
      <NavBar user={profile || undefined} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-cyan-900 mb-2">Surf Alerts</h1>
          <p className="text-cyan-700">Get notified when conditions match your preferences</p>
        </div>

        <RealtimeAlertList userId={user.id} initialAlerts={alerts || []} />
      </main>
    </div>
  )
}
