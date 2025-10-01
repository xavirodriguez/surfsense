"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { Forecast } from "@/lib/types"

interface ForecastChartProps {
  forecasts: Forecast[]
}

export function ForecastChart({ forecasts }: ForecastChartProps) {
  const chartData = forecasts.map((f) => ({
    time: new Date(f.timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
    }),
    score: f.surfability_score || 0,
    waveHeight: ((f.wave_height_min || 0) + (f.wave_height_max || 0)) / 2,
    windSpeed: f.wind_speed || 0,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forecast Overview</CardTitle>
        <CardDescription>Next 72 hours of surf conditions</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            score: {
              label: "Surfability Score",
              color: "hsl(var(--chart-1))",
            },
            waveHeight: {
              label: "Wave Height (m)",
              color: "hsl(var(--chart-2))",
            },
            windSpeed: {
              label: "Wind Speed (kts)",
              color: "hsl(var(--chart-3))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" fontSize={12} />
              <YAxis fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="var(--color-score)" strokeWidth={2} name="Score" />
              <Line
                type="monotone"
                dataKey="waveHeight"
                stroke="var(--color-waveHeight)"
                strokeWidth={2}
                name="Wave Height"
              />
              <Line
                type="monotone"
                dataKey="windSpeed"
                stroke="var(--color-windSpeed)"
                strokeWidth={2}
                name="Wind Speed"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
