import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { NavBar } from "@/components/nav-bar"
import { RealtimeForecastList } from "@/components/realtime-forecast-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Bell, MapPin, Wind, WavesIcon } from "lucide-react"
import type { Forecast } from "@/lib/types"

export default async function SpotDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get spot details
  const { data: spot } = await supabase.from("surf_spots").select("*").eq("id", id).single()

  if (!spot) {
    redirect("/dashboard")
  }

  // Get forecasts for next 72 hours
  const now = new Date()
  const futureDate = new Date(now.getTime() + 72 * 60 * 60 * 1000)

  const { data: forecasts } = await supabase
    .from("forecasts")
    .select("*")
    .eq("spot_id", id)
    .gte("timestamp", now.toISOString())
    .lte("timestamp", futureDate.toISOString())
    .order("timestamp")

  // Check if spot is favorited
  const { data: favorite } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("spot_id", id)
    .single()

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50">
      <NavBar user={profile || undefined} />

      <main className="container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{spot.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4" />
                  {spot.region ? `${spot.region}, ` : ""}
                  {spot.country}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant={favorite ? "default" : "outline"} size="icon">
                  <Heart className={`h-4 w-4 ${favorite ? "fill-current" : ""}`} />
                </Button>
                <Button variant="outline" size="icon">
                  <Bell className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {spot.description && <p className="text-muted-foreground mb-4">{spot.description}</p>}
            <div className="flex flex-wrap gap-2">
              {spot.difficulty && (
                <Badge variant="secondary" className="capitalize">
                  {spot.difficulty}
                </Badge>
              )}
              {spot.break_type && (
                <Badge variant="outline" className="capitalize">
                  {spot.break_type} break
                </Badge>
              )}
              {spot.ideal_swell_direction && (
                <Badge variant="outline">
                  <WavesIcon className="h-3 w-3 mr-1" />
                  Ideal Swell: {spot.ideal_swell_direction}
                </Badge>
              )}
              {spot.ideal_wind_direction && (
                <Badge variant="outline">
                  <Wind className="h-3 w-3 mr-1" />
                  Ideal Wind: {spot.ideal_wind_direction}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <RealtimeForecastList spotId={id} initialForecasts={(forecasts as Forecast[]) || []} />
      </main>
    </div>
  )
}
