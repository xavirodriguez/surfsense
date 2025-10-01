import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { NavBar } from "@/components/nav-bar"
import { SpotCard } from "@/components/spot-card"

export default async function FavoritesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get favorites with spot details
  const { data: favorites } = await supabase
    .from("favorites")
    .select(
      `
      *,
      surf_spots (*)
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Get current conditions for favorited spots
  const now = new Date().toISOString()
  const spotIds = favorites?.map((f: any) => f.spot_id) || []

  const { data: currentForecasts } = await supabase
    .from("forecasts")
    .select("spot_id, surfability_score")
    .in("spot_id", spotIds)
    .gte("timestamp", now)
    .order("timestamp")

  // Create a map of spot_id to current score
  const scoreMap = new Map()
  currentForecasts?.forEach((f) => {
    if (!scoreMap.has(f.spot_id)) {
      scoreMap.set(f.spot_id, f.surfability_score)
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50">
      <NavBar user={profile || undefined} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-cyan-900 mb-2">Your Favorite Spots</h1>
          <p className="text-cyan-700">Quick access to your saved surf locations</p>
        </div>

        {favorites && favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite: any) => (
              <SpotCard key={favorite.id} spot={favorite.surf_spots} currentScore={scoreMap.get(favorite.spot_id)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">You haven&apos;t added any favorite spots yet.</p>
            <Button asChild>
              <a href="/dashboard">Discover Spots</a>
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
