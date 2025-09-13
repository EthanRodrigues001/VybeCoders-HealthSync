"use client"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Shield, Users, Zap } from "lucide-react"

export default function HomePage() {
  const { user, userProfile, signInWithGoogle, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (user && userProfile?.role) {
    // Redirect to appropriate dashboard
    window.location.href = userProfile.role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard"
    return null
  }

  if (user && !userProfile?.role) {
    // Redirect to role selection
    window.location.href = "/auth/role-selection"
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">HealthSync</h1>
          </div>
          <Button onClick={signInWithGoogle} size="lg">
            Sign In with Google
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-foreground mb-6 text-balance">
            Unified Healthcare Records for Everyone
          </h2>
          <p className="text-xl text-muted-foreground mb-8 text-pretty">
            AI-powered healthcare data management system that connects doctors, patients, and government health records
            in one secure platform.
          </p>
          <Button onClick={signInWithGoogle} size="lg" className="text-lg px-8 py-3">
            Get Started Today
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardHeader>
              <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Voice Prescriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Doctors dictate prescriptions, AI transcribes and generates digital records instantly.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>OCR Digitization</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Upload old prescriptions and medical records - our AI digitizes and stores them securely.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>ABDM Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Seamlessly connect with government health records through ABDM integration.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Unified Records</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                All your health data from hospitals, labs, and uploads in one secure location.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">© 2024 HealthSync. Secure, AI-powered healthcare data management.</p>
        </div>
      </footer>
    </div>
  )
}
