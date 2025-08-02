"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Volume2, Play, Sparkles, Mic, Zap, BarChart3, MessageSquare, X, Chrome, Settings, CheckCircle, VolumeX, Film, Headphones} from "lucide-react"
import { useState } from "react"

export default function HomePage() {
  const [showHelp, setShowHelp] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-white flex items-center gap-2 animate-slide-in-left">
            <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-purple-600 rounded-lg flex items-center justify-center animate-pulse-custom">
              <Film className="w-4 h-4 text-white" />
            </div>
            Mindathe Irikk
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-20 h-20 bg-red-600 rounded-full animate-float"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-purple-600 rounded-full animate-float stagger-1"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-blue-600 rounded-full animate-float stagger-2"></div>
        </div>
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <Badge className="mb-6 bg-gradient-to-r from-red-600 to-purple-600 text-white px-4 py-2 animate-zoom-in">
            🎬 AI-Powered Cinema Guardian
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight animate-slide-in-bottom">
            Keep calm and watch.
            <span className="block bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent animate-glow">
              Mindathe Irikk
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-4 font-medium animate-slide-in-bottom stagger-1">
            "Mindathe Irikk - Your Cinema companion"
          </p>

          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto animate-slide-in-bottom stagger-2">
            The Chrome extension that shushes talkers with hilarious scolding sounds. 
            Because silence is golden, but comedy is priceless! 🎭
          </p>

          <Button
            size="lg"
            className="bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-semibold text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 animate-zoom-in stagger-3 hover-pulse"
            onClick={() => window.open('https://limewire.com/d/FTAqq#iz6vEGjVJ8', '_blank')}
          >
            <Download className="mr-2 h-5 w-5 animate-bounce-custom" />
            Download Extension
          </Button>

          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-400 animate-slide-in-bottom stagger-4">
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
              Hilarious Roasts
            </div>
          </div>
        </div>
      </section>

      {/* Funny Visual Section */}
      <section className="py-16 px-6 bg-black/50">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700 animate-float">
            <div className="text-6xl mb-4">🎭</div>
            <h2 className="text-2xl font-bold text-white mb-4">The Scene</h2>
            <p className="text-gray-300 mb-6">
              Picture this: You're watching the climax of your favorite movie. 
              Your roommate starts explaining the plot to someone on the phone...
            </p>
            <div className="bg-red-900/30 p-4 rounded-lg border border-red-700">
              <div className="text-4xl mb-2">🤫</div>
              <p className="text-red-300 font-semibold">"SHHHHH! This is not a FISH MARKET!"</p>
              <p className="text-gray-400 text-sm mt-2">- Mindathe Irikk, probably</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 animate-slide-in-bottom">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Features That Actually Work</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Because sometimes you need a digital bouncer for your movie night.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 ml-66 gap-6 justify-center">
            <Card className="border-gray-700 bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 group animate-float stagger-1">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 animate-pulse-custom">
                  <Mic className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-white">Ambient Listening</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-400">
                  Discreetly monitors sound levels without invading privacy
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-gray-700 bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 group animate-float stagger-2">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 animate-pulse-custom">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-white">Instant Scolding</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-400">
                  Hilarious voice lines that roast talkers into silence
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-gray-700 bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 group animate-float stagger-3">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 animate-pulse-custom">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-white">Voice Personalities</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-400">
                  Get roasted by your favorite characters
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 bg-black/50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl animate-slide-in-bottom font-bold text-white mb-4">How Mindathe Irikk Works</h2>
            <p className="text-lg text-gray-400">Three simple steps to a peaceful movie night</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-lg hover-float border border-gray-700">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 animate-pulse-custom">
                  1
                </div>
                <Play className="h-6 w-6 text-gray-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Start your movie</h3>
              <p className="text-gray-400">
                Fire up Netflix, YouTube, or any streaming platform. Mindathe Irikk works everywhere!
              </p>
            </div>

            <div className="bg-gray-800 p-8 rounded-2xl shadow-lg hover-float border border-gray-700">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 animate-pulse-custom">
                  2
                </div>
                <Headphones className="h-6 w-6 text-gray-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Let Mindathe Irikk listen</h3>
              <p className="text-gray-400">
                The AI silently monitors ambient sound levels while you enjoy your content
              </p>
            </div>

            <div className="bg-gray-800 p-8 rounded-2xl shadow-lg hover-float border border-gray-700">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 animate-pulse-custom">
                  3
                </div>
                <VolumeX className="h-6 w-6 text-gray-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Speak too loud? Get roasted</h3>
              <p className="text-gray-400">
                When someone talks above the threshold, they get hilariously scolded into silence
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-black/50">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-slide-in-bottom">Ready to Silence the Talkers?</h2>
          <p className="text-lg text-gray-400 mb-8 animate-slide-in-bottom stagger-1">
          Join thousands of movie lovers who've reclaimed their peaceful viewing experience. 
          Because the best movie is a quiet movie (with occasional hilarious scolding).
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-semibold text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 animate-zoom-in stagger-2 hover-pulse"
            onClick={() => window.open('https://limewire.com/d/FTAqq#iz6vEGjVJ8', '_blank')}
          >
            <Download className="mr-2 h-5 w-5 animate-bounce-custom" />
            Get Mindathe Irikk Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-black text-white">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4 animate-slide-in-bottom">
            <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-purple-600 rounded-lg flex items-center justify-center animate-pulse-custom">
              <Film className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold">Mindathe Irikk</span>
          </div>
          <p className="text-gray-400 mb-2 animate-slide-in-bottom stagger-1">Made with ❤️ by Masala Dosa</p>
          <p className="text-gray-500 text-sm animate-slide-in-bottom stagger-2">Warning: May cause uncontrollable laughter during serious movie scenes</p>
        </div>
      </footer>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-zoom-in">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-slide-in-bottom border border-gray-700">
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-custom">
                <Chrome className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">💻 How to Add Mindathe Irikk to Chrome</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-gray-700 rounded-lg">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Download the Extension</h4>
                  <p className="text-sm text-gray-300">Click "Download ZIP" and extract the folder</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-700 rounded-lg">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Open Chrome Extensions</h4>
                  <p className="text-sm text-gray-300">Go to chrome://extensions or 3 dots → Extensions</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-700 rounded-lg">
                <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Enable Developer Mode</h4>
                  <p className="text-sm text-gray-300">Toggle ON "Developer mode" in top-right</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-700 rounded-lg">
                <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Load the Extension</h4>
                  <p className="text-sm text-gray-300">Click "Load unpacked" and select the folder</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-900 to-blue-900 rounded-lg border border-green-700">
                <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">✅ You're Done!</h4>
                  <p className="text-sm text-gray-300">Time to enjoy peaceful movie nights! 🎬</p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setShowHelp(false)}
              className="w-full mt-6 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white"
            >
              Got it! 🎉
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
