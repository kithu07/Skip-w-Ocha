"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Volume2, Flame, Zap, Clock, Settings, Home, TrendingUp, Mic } from "lucide-react"

// Mock data for the chart
const screamData = [
  { time: "9:00", decibels: 45 },
  { time: "9:30", decibels: 78 },
  { time: "10:00", decibels: 92 },
  { time: "10:30", decibels: 67 },
  { time: "11:00", decibels: 105 },
  { time: "11:30", decibels: 89 },
  { time: "12:00", decibels: 112 },
  { time: "12:30", decibels: 95 },
  { time: "13:00", decibels: 87 },
  { time: "13:30", decibels: 98 },
]

export default function Dashboard() {
  const [micSensitivity, setMicSensitivity] = useState([75])
  const [isEnabled, setIsEnabled] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Ocha Control Room</h1>
          </div>
          <Link href="/">
            <Button variant="outline" className="font-medium bg-transparent">
              <Home className="mr-2 h-4 w-4" />
              Back Home
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome back, Voice Maker! 🎤</h2>
          <p className="text-slate-600">Monitor your ocha kond skipping performance and fine-tune your settings</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Max Volume Today</CardTitle>
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Flame className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">112 dB</div>
              <p className="text-xs text-slate-500 mt-1">Louder than a jet engine! 🔥</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Screams</CardTitle>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Volume2 className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">1,337</div>
              <p className="text-xs text-slate-500 mt-1">Your throat is legendary!</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Ads Defeated</CardTitle>
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">2,420</div>
              <p className="text-xs text-slate-500 mt-1">Capitalism = defeated! ⚡</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Peak Performance</CardTitle>
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-slate-800">12:00 PM</div>
              <p className="text-xs text-slate-500 mt-1">Today's loudest moment</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart Section */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Voice Activity Over Time
            </CardTitle>
            <CardDescription className="text-slate-600">
              Your screaming performance throughout the day (measured in decibels)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                decibels: {
                  label: "Decibels",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={screamData}>
                  <defs>
                    <linearGradient id="colorDecibels" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="decibels"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorDecibels)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Controls Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                <Settings className="h-5 w-5 text-slate-600" />
                Microphone Sensitivity
              </CardTitle>
              <CardDescription className="text-slate-600">
                Adjust how sensitive the extension is to your voice
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Whisper 🤫</span>
                  <span>Roar 🦁</span>
                </div>
                <Slider
                  value={micSensitivity}
                  onValueChange={setMicSensitivity}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="text-center">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    {micSensitivity[0]}% Sensitivity
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-slate-600" />
                Extension Status
              </CardTitle>
              <CardDescription className="text-slate-600">
                Enable or disable voice-activated ad skipping
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="font-medium text-slate-800">Voice Detection</div>
                  <div className={`text-sm ${isEnabled ? "text-green-600" : "text-slate-500"}`}>
                    {isEnabled ? "🟢 Active and listening" : "⚪ Disabled"}
                  </div>
                </div>
                <Switch checked={isEnabled} onCheckedChange={setIsEnabled} className="scale-125" />
              </div>

              {isEnabled && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                  <div className="text-center text-green-700 font-medium">🎤 Ready for your next battle cry!</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
