"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Volume2, Play, Sparkles, Mic, Zap, BarChart3, MessageSquare, X, Chrome, Settings, CheckCircle} from "lucide-react"
import { useState } from "react"

export default function HomePage() {
  const [showHelp, setShowHelp] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-slate-800 flex items-center gap-2 animate-slide-in-left">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center animate-pulse-custom">
              <Mic className="w-4 h-4 text-white" />
            </div>
            Skip-w-Ocha
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="font-medium bg-transparent hover-pulse animate-slide-in-right">
              Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 relative overflow-hidden">
        {/* Animated background waves */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-20 h-20 bg-red-500 rounded-full animate-float"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-orange-500 rounded-full animate-float stagger-1"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-yellow-500 rounded-full animate-float stagger-2"></div>
        </div>
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <Badge className="mb-6 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 animate-zoom-in">
            🎤 Voice-Powered Ad Skipper
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold text-slate-800 mb-6 leading-tight animate-slide-in-bottom">
            Skip-w-
            <span className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent animate-glow">
              Ocha
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 mb-4 font-medium animate-slide-in-bottom stagger-1">
            "When capitalism screams, you scream back!"
          </p>

          <p className="text-lg text-slate-500 mb-8 max-w-2xl mx-auto animate-slide-in-bottom stagger-2">
            The first Chrome extension that lets you skip YouTube ads with the power of your voice. Just scream and
            watch ads disappear! 🎭
          </p>

          <Button
            size="lg"
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 animate-zoom-in stagger-3 hover-pulse"
          >
            <Download className="mr-2 h-5 w-5 animate-bounce-custom" />
            Download Extension
          </Button>

          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-slate-500 animate-slide-in-bottom stagger-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-custom"></div>
              Free Forever
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse-custom stagger-1"></div>
              Instant Setup
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse-custom stagger-2"></div>
              Privacy First
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 animate-slide-in-bottom">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Features That Actually Work</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Don't skip ads. Destroy them with decibels.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 justify-center">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group animate-float stagger-1">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 animate-pulse-custom">
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

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group animate-float stagger-2">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 animate-pulse-custom">
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

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group animate-float stagger-3">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-lime-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 animate-pulse-custom">
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

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group animate-float stagger-4">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 animate-pulse-custom">
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
            <h2 className="text-3xl md:text-4xl animate-slide-in-bottom font-bold text-slate-800 mb-4">How to Unleash Your Inner Ocha</h2>
            <p className="text-lg text-slate-600">Four simple steps to ad-free YouTube bliss</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div 
              className="bg-white p-8 rounded-2xl shadow-lg hover-float cursor-pointer transition-all duration-300 hover:shadow-xl"
              onClick={() => setShowHelp(true)}
            >
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 animate-pulse-custom">
                  1
                </div>
                <Download className="h-6 w-6 text-slate-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Install & Setup</h3>
              <p className="text-slate-600">
                Download the extension and grant microphone access. Don't worry, we won't judge your voice cracks!
              </p>
              <div className="mt-4 text-sm text-blue-600 font-medium">💡 Click for detailed instructions</div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover-float">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 animate-pulse-custom">
                  2
                </div>
                <Play className="h-6 w-6 text-slate-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Watch YouTube</h3>
              <p className="text-slate-600">Play any YouTube video and wait for those annoying ads to appear</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover-float">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 animate-pulse-custom">
                  3
                </div>
                <Volume2 className="h-6 w-6 text-slate-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Channel Your Inner Nagavalli</h3>
              <p className="text-slate-600">Scream like your debt is due! Let out that legendary Malayalam energy!</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover-float">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 animate-pulse-custom">
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
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4 animate-slide-in-bottom">Ready to Defeat Capitalism?</h2>
          <p className="text-lg text-slate-600 mb-8 animate-slide-in-bottom stagger-1">
          Ad blocker? Outdated. Skip-w-Ocha? Revolutionary. Scream, shout, and let it all out — your noise is now a button that skips ads instantly. Because silence is overrated.
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 animate-zoom-in stagger-2 hover-pulse"
          >
            <Download className="mr-2 h-5 w-5 animate-bounce-custom" />
            Get Skip-w-Ocha Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-slate-800 text-white">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4 animate-slide-in-bottom">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center animate-pulse-custom">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold">Skip-w-Ocha</span>
          </div>
          <p className="text-slate-400 mb-2 animate-slide-in-bottom stagger-1">Cooked with maximum ocha by Team Masala Dosa ❤️</p>
          <p className="text-slate-500 text-sm animate-slide-in-bottom stagger-2">Warning: May cause temporary hearing loss in family members</p>
        </div>
      </footer>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-zoom-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-slide-in-bottom">
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-custom">
                <Chrome className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">💻 How to Add Skip-w-Ocha to Chrome</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-1">Download the Extension</h4>
                  <p className="text-sm text-slate-600">Click "Download ZIP" and extract the folder</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-1">Open Chrome Extensions</h4>
                  <p className="text-sm text-slate-600">Go to chrome://extensions or 3 dots → Extensions</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-1">Enable Developer Mode</h4>
                  <p className="text-sm text-slate-600">Toggle ON "Developer mode" in top-right</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-1">Load the Extension</h4>
                  <p className="text-sm text-slate-600">Click "Load unpacked" and select the folder</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-800">✅ You're Done!</h4>
                  <p className="text-sm text-slate-600">Happy screaming! 🔊😂</p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setShowHelp(false)}
              className="w-full mt-6 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
            >
              Got it! 🎉
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
