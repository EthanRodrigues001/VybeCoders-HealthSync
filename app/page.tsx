"use client"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Shield, Users, Zap } from "lucide-react"
import HealthSyncHero from "@/components/hero/hero-section"
import HealthSyncFeaturesSection from "@/components/hero/features-section"
import HealthSyncFooter from "@/components/hero/footer-section"

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

  return (<>
    <HealthSyncHero signInWithGoogle={signInWithGoogle} />
    <HealthSyncFeaturesSection />
    <HealthSyncFooter />
  </>

  )
}
