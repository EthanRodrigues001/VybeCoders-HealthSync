"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Heart, Users, FileText, Activity, Settings, LogOut, Bell, Search, TrendingUp, Stethoscope } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ProfileEdit } from "@/components/profile-edit"
import { PatientDetailView } from "@/components/patient-detail-view"

export function DoctorDashboard() {
  const { userProfile, logout, user } = useAuth()
  const [showProfileEdit, setShowProfileEdit] = useState(false)
  const [patients, setPatients] = useState<any[]>([])
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const todayStats = {
    totalPatients: patients.length,
    newPatients: patients.filter((p) => {
      const createdDate = new Date(p.createdAt || Date.now())
      const today = new Date()
      return createdDate.toDateString() === today.toDateString()
    }).length,
    prescriptions: patients.reduce((sum, p) => sum + (p.prescriptionCount || 0), 0),
    activeConnections: patients.filter((p) => p.status === "active").length,
  }

  useEffect(() => {
    if (user?.uid) {
      fetchPatients()
    }
  }, [user?.uid])

  const fetchPatients = async () => {
    if (!user?.uid) return

    setLoading(true)
    try {
      const response = await fetch(`/api/doctor-patients?doctorId=${user.uid}`)
      const data = await response.json()
      setPatients(data.patients || [])
    } catch (error) {
      console.error("Error fetching patients:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient)
  }

  const handleBackToPatients = () => {
    setSelectedPatient(null)
    fetchPatients() // Refresh patient list
  }

  const filteredPatients = patients.filter(
    (patient) =>
      patient.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (selectedPatient) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm">
          <div className="flex h-16 items-center px-6">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold">HealthSync</h1>
            </div>

            <div className="ml-auto flex items-center space-x-4">
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      {userProfile?.displayName?.charAt(0) || "D"}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userProfile?.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{userProfile?.email}</p>
                      <p className="text-xs leading-none text-muted-foreground">{userProfile?.clinicName}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowProfileEdit(true)}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Edit Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="p-6">
          <PatientDetailView patient={selectedPatient} doctorInfo={userProfile} onBack={handleBackToPatients} />
        </main>

        {showProfileEdit && <ProfileEdit onClose={() => setShowProfileEdit(false)} />}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold">HealthSync</h1>
          </div>

          <div className="ml-auto flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                className="pl-8 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    {userProfile?.displayName?.charAt(0) || "D"}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userProfile?.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{userProfile?.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">{userProfile?.clinicName}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowProfileEdit(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Edit Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content - No Sidebar */}
      <main className="p-6 space-y-6">
        {/* Welcome Section */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Good morning, Dr. {userProfile?.displayName}</h2>
          <p className="text-muted-foreground">Manage your connected patients and their medical records.</p>
        </div>

        {/* Analytics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayStats.totalPatients}</div>
              <p className="text-xs text-muted-foreground">Connected to your practice</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Connections</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayStats.newPatients}</div>
              <p className="text-xs text-muted-foreground">Patients added today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Prescriptions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayStats.prescriptions}</div>
              <p className="text-xs text-muted-foreground">Across all patients</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayStats.activeConnections}</div>
              <p className="text-xs text-muted-foreground">Currently connected</p>
            </CardContent>
          </Card>
        </div>

        {/* Patient List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              My Patients
            </CardTitle>
            <CardDescription>
              Patients who have connected with you and granted access to their medical records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <p className="text-center text-muted-foreground py-8">Loading patients...</p>
              ) : filteredPatients.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredPatients.map((patient) => (
                    <Card
                      key={patient.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handlePatientSelect(patient)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            {patient.displayName?.charAt(0) || "P"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{patient.displayName || "Unknown Patient"}</p>
                            <p className="text-sm text-muted-foreground truncate">{patient.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {patient.prescriptionCount || 0} records
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Connected
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm ? "No patients found matching your search." : "No patients connected yet."}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Patients can add you from their "My Doctors" section.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Profile Edit Modal */}
      {showProfileEdit && <ProfileEdit onClose={() => setShowProfileEdit(false)} />}
    </div>
  )
}
