"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DoctorDashboard } from "@/components/doctor-dashboard"

export default function DoctorDashboardPage() {
  return (
    <AuthGuard requiredRole="doctor">
      <DoctorDashboard />
    </AuthGuard>
  )
}
