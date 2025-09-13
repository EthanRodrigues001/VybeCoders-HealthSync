"use client"

import { AuthGuard } from "@/components/auth-guard"
import { PatientDashboard } from "@/components/patient-dashboard"

export default function PatientDashboardPage() {
  return (
    <AuthGuard requiredRole="patient">
      <PatientDashboard />
    </AuthGuard>
  )
}
