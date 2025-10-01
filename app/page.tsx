import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Waves } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100 p-6">
      <div className="flex flex-col items-center gap-8 text-center max-w-2xl">
        <div className="flex items-center gap-3">
          <Waves className="h-12 w-12 text-cyan-600" />
          <h1 className="text-5xl font-bold text-cyan-900">SurfSense AI</h1>
        </div>

        <p className="text-xl text-cyan-800 leading-relaxed">
          AI-powered surf forecasting that helps you catch the perfect wave. Get personalized recommendations, real-time
          conditions, and smart alerts for your favorite spots.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Button asChild size="lg" className="text-lg">
            <Link href="/auth/sign-up">Get Started</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-lg bg-transparent">
            <Link href="/auth/login">Login</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 w-full">
          <div className="flex flex-col items-center gap-2 p-4 bg-white/50 rounded-lg">
            <div className="text-3xl">🌊</div>
            <h3 className="font-semibold text-cyan-900">Real-time Forecasts</h3>
            <p className="text-sm text-cyan-700">Live wave data and conditions</p>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 bg-white/50 rounded-lg">
            <div className="text-3xl">🤖</div>
            <h3 className="font-semibold text-cyan-900">AI Recommendations</h3>
            <p className="text-sm text-cyan-700">Personalized spot suggestions</p>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 bg-white/50 rounded-lg">
            <div className="text-3xl">🔔</div>
            <h3 className="font-semibold text-cyan-900">Smart Alerts</h3>
            <p className="text-sm text-cyan-700">Get notified of perfect conditions</p>
          </div>
        </div>
      </div>
    </div>
  )
}
