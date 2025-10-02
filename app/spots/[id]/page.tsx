// app/spot/[id]/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NavBar } from "@/components/nav-bar";
import { RealtimeForecastList } from "@/components/realtime-forecast-list";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Bell, MapPin, Wind, WavesIcon } from "lucide-react";
import type { Forecast } from "@/lib/types";

export default async function SpotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: spotId } = await params; // Renombrado a spotId para mayor claridad
  const supabase = await createClient();

  console.log(`[SpotDetailPage] - Cargando página para spotId: ${spotId}`);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.log(
      `[SpotDetailPage] - Usuario no autenticado, redirigiendo a login.`
    );
    redirect("/auth/login");
  }
  console.log(`[SpotDetailPage] - Usuario autenticado: ${user.id}`);

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (profileError) {
    console.error(
      `[SpotDetailPage] - Error al obtener perfil del usuario ${user.id}:`,
      profileError
    );
  }
  console.log(`[SpotDetailPage] - Perfil del usuario obtenido.`);

  // Get spot details
  const { data: spot, error: spotError } = await supabase
    .from("surf_spots")
    .select("*")
    .eq("id", spotId)
    .single();

  if (spotError) {
    console.error(
      `[SpotDetailPage] - Error al obtener detalles del spot ${spotId}:`,
      spotError
    );
  }
  if (!spot) {
    console.log(
      `[SpotDetailPage] - Spot ${spotId} no encontrado, redirigiendo a dashboard.`
    );
    redirect("/dashboard");
  }
  console.log(`[SpotDetailPage] - Detalles del spot obtenidos: ${spot.name}`);

  // Get forecasts for next 72 hours
  const now = new Date();
  const futureDate = new Date(now.getTime() + 72 * 60 * 60 * 1000);

  console.log(
    `[SpotDetailPage] - Consultando pronósticos para spotId: ${spotId}`
  );
  console.log(`[SpotDetailPage] - Rango de tiempo:`);
  console.log(`  - Desde: ${now.toISOString()}`);
  console.log(`  - Hasta: ${futureDate.toISOString()}`);

  const { data: forecasts, error: forecastsError } = await supabase
    .from("forecasts")
    .select("*")
    .eq("spot_id", spotId)
    .gte("timestamp", now.toISOString())
    .lte("timestamp", futureDate.toISOString())
    .order("timestamp");

  if (forecastsError) {
    console.error(
      `[SpotDetailPage] - Error al obtener pronósticos para spotId ${spotId}:`,
      forecastsError
    );
    // Aquí también podrías ver un error de RLS para SELECT
    if (forecastsError.message.includes("row-level security")) {
      console.error(
        `[SpotDetailPage] - Posible error de RLS para SELECT en la tabla 'forecasts'.`
      );
    }
  }

  if (!forecasts || forecasts.length === 0) {
    console.log(
      `[SpotDetailPage] - No se encontraron pronósticos para spotId ${spotId} en el rango de tiempo especificado.`
    );
  } else {
    console.log(
      `[SpotDetailPage] - Se encontraron ${forecasts.length} pronósticos para spotId ${spotId}.`
    );
    // console.log(`[SpotDetailPage] - Primer pronóstico:`, forecasts[0]) // Descomenta para ver la estructura
  }

  // Check if spot is favorited
  const { data: favorite, error: favoriteError } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("spot_id", spotId)
    .single();

  if (favoriteError && favoriteError.code !== "PGRST116") {
    // PGRST116 es "no rows found", que es esperado si no es favorito
    console.error(
      `[SpotDetailPage] - Error al verificar favorito para spotId ${spotId}:`,
      favoriteError
    );
  }
  console.log(
    `[SpotDetailPage] - Spot ${spotId} ${favorite ? "es" : "no es"} favorito.`
  );

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
                  <Heart
                    className={`h-4 w-4 ${favorite ? "fill-current" : ""}`}
                  />
                </Button>
                <Button variant="outline" size="icon">
                  <Bell className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {spot.description && (
              <p className="text-muted-foreground mb-4">{spot.description}</p>
            )}
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

        {/* Aquí es donde se pasan los pronósticos */}
        <RealtimeForecastList
          spotId={spotId}
          initialForecasts={(forecasts as Forecast[]) || []}
        />
      </main>
    </div>
  );
}
