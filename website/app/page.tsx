import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Volume2, Play, Sparkles, Mic, Zap, BarChart3, MessageSquare} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Mic className="w-4 h-4 text-white" />
            </div>
            Skip-w-Ocha
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="font-medium bg-transparent">
              Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge className="mb-6 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2">
            🎤 Voice-Powered Ad Skipper
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold text-slate-800 mb-6 leading-tight">
            Skip-w-
            <span className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Ocha
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 mb-4 font-medium">
            "When capitalism screams, you scream back!"
          </p>

          <p className="text-lg text-slate-500 mb-8 max-w-2xl mx-auto">
            The first Chrome extension that lets you skip YouTube ads with the power of your voice. Just scream and
            watch ads disappear! 🎭
          </p>

          <Button
            size="lg"
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Download className="mr-2 h-5 w-5" />
            Download Extension
          </Button>

          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Free Forever
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Instant Setup
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Privacy First
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Features That Actually Work</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Don’t skip ads. Destroy them with decibels.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 justify-center">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Mic className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-slate-800">Voice Detection</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-slate-600">
                  Advanced voice recognition that responds to your battle cries instantly
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-slate-800">Instant Ad Skip</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-slate-600">
                  Detects YouTube ads faster than your mom detects lies
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-lime-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-slate-800">Victory Pop-ups</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-slate-600">
                  Feel the thrill. Get instant on-screen pop-ups when you scream and skip.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-slate-800">Performance Stats</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-slate-600">
                  Track your screaming prowess and ad-blocking achievements
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">How to Unleash Your Inner Ocha</h2>
            <p className="text-lg text-slate-600">Four simple steps to ad-free YouTube bliss</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  1
                </div>
                <Download className="h-6 w-6 text-slate-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Install & Setup</h3>
              <p className="text-slate-600">
                Download the extension and grant microphone access. Don't worry, we won't judge your voice cracks!
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  2
                </div>
                <Play className="h-6 w-6 text-slate-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Watch YouTube</h3>
              <p className="text-slate-600">Play any YouTube video and wait for those annoying ads to appear</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  3
                </div>
                <Volume2 className="h-6 w-6 text-slate-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Channel Your Inner Nagavalli</h3>
              <p className="text-slate-600">Scream like your debt is due! Let out that legendary Malayalam energy!</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  4
                </div>
                <Sparkles className="h-6 w-6 text-slate-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Watch the Magic</h3>
              <p className="text-slate-600">
                Ads disappear instantly! Your neighbors might call the police, but it's worth it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-white">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Ready to Defeat Capitalism?</h2>
          <p className="text-lg text-slate-600 mb-8">
          Ad blocker? Outdated. Skip-w-Ocha? Revolutionary. Scream, shout, and let it all out — your noise is now a button that skips ads instantly. Because silence is overrated.
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Download className="mr-2 h-5 w-5" />
            Get Skip-w-Ocha Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-slate-800 text-white">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold">Skip-w-Ocha</span>
          </div>
          <p className="text-slate-400 mb-2">Cooked with maximum ocha by Team Masala Dosa ❤️</p>
          <p className="text-slate-500 text-sm">Warning: May cause temporary hearing loss in family members</p>
        </div>
      </footer>
    </div>
  )
}
