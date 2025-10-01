import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { NavBar } from "@/components/nav-bar"
import { RealtimeSpotList } from "@/components/realtime-spot-list"
import { RecommendationsSection } from "@/components/recommendations-section"
import { AIChat } from "@/components/ai-chat"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MessageSquare } from "lucide-react"
import type { SurfSpot } from "@/lib/types"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get all surf spots
  const { data: spots } = await supabase.from("surf_spots").select("*").order("name").limit(50)

  // Get current conditions for each spot (latest forecast)
  const now = new Date().toISOString()
  const { data: currentForecasts } = await supabase
    .from("forecasts")
    .select("spot_id, surfability_score")
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
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-cyan-900 mb-2">Discover Surf Spots</h1>
            <p className="text-cyan-700">Find the perfect waves with AI-powered forecasts</p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Ask AI
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] p-0">
              <AIChat />
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search spots by name, region, or country..." className="pl-10" />
          </div>
          <Button>Search</Button>
        </div>

        <RecommendationsSection />

        <div className="mb-4">
          <h2 className="text-2xl font-bold text-cyan-900">All Surf Spots</h2>
          <p className="text-cyan-700">Browse all available locations</p>
        </div>

        <RealtimeSpotList initialSpots={(spots as SurfSpot[]) || []} scoreMap={scoreMap} />
      </main>
    </div>
  )
}
