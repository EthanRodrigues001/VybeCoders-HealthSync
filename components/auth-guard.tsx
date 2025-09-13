"use client"

import type React from "react"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: "doctor" | "patient"
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/")
        return
      }

      if (!userProfile?.role) {
        router.push("/auth/role-selection")
        return
      }

      if (requiredRole && userProfile.role !== requiredRole) {
        router.push(userProfile.role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard")
        return
      }
    }
  }, [user, userProfile, loading, router, requiredRole])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || !userProfile?.role || (requiredRole && userProfile.role !== requiredRole)) {
    return null
  }

  return <>{children}</>
}
