"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Phone, Plus } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface Doctor {
  id: string
  displayName: string
  email: string
  clinicName?: string
  clinicAddress?: string
  phone?: string
  specialization?: string
}

export function DoctorSearch() {
  const { user } = useAuth()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [connectedDoctors, setConnectedDoctors] = useState<Doctor[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchDoctors()
    fetchConnectedDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      const response = await fetch("/api/doctors")
      const data = await response.json()
      setDoctors(data.doctors || [])
    } catch (error) {
      console.error("Error fetching doctors:", error)
    }
  }

  const fetchConnectedDoctors = async () => {
    if (!user?.uid) return

    try {
      const response = await fetch(`/api/doctors?patientId=${user.uid}`)
      const data = await response.json()
      setConnectedDoctors(data.doctors || [])
    } catch (error) {
      console.error("Error fetching connected doctors:", error)
    }
  }

  const connectDoctor = async (doctorId: string) => {
    if (!user?.uid) return

    setLoading(true)
    try {
      const response = await fetch("/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: user.uid, doctorId }),
      })

      if (response.ok) {
        fetchConnectedDoctors()
      }
    } catch (error) {
      console.error("Error connecting doctor:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.clinicName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const isConnected = (doctorId: string) => connectedDoctors.some((doc) => doc.id === doctorId)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">My Doctors</h3>
        {connectedDoctors.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {connectedDoctors.map((doctor) => (
              <Card key={doctor.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{doctor.displayName}</CardTitle>
                  <CardDescription>{doctor.specialization || "General Practitioner"}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {doctor.clinicName && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="font-medium">{doctor.clinicName}</span>
                    </div>
                  )}
                  {doctor.clinicAddress && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-2 h-4 w-4" />
                      <span>{doctor.clinicAddress}</span>
                    </div>
                  )}
                  {doctor.phone && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="mr-2 h-4 w-4" />
                      <span>{doctor.phone}</span>
                    </div>
                  )}
                  <Badge variant="secondary" className="mt-2">
                    Connected
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No connected doctors yet.</p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Find Doctors</h3>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search doctors by name, clinic, or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {filteredDoctors.map((doctor) => (
            <Card key={doctor.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{doctor.displayName}</CardTitle>
                <CardDescription>{doctor.specialization || "General Practitioner"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {doctor.clinicName && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span className="font-medium">{doctor.clinicName}</span>
                  </div>
                )}
                {doctor.clinicAddress && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" />
                    <span>{doctor.clinicAddress}</span>
                  </div>
                )}
                {doctor.phone && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="mr-2 h-4 w-4" />
                    <span>{doctor.phone}</span>
                  </div>
                )}
                <div className="pt-2">
                  {isConnected(doctor.id) ? (
                    <Badge variant="secondary">Connected</Badge>
                  ) : (
                    <Button size="sm" onClick={() => connectDoctor(doctor.id)} disabled={loading} className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Connect Doctor
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
