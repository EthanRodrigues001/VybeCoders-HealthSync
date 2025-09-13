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
import {
  Heart,
  Users,
  FileText,
  Mic,
  Scan,
  Calendar,
  Activity,
  Settings,
  LogOut,
  Bell,
  Search,
  Plus,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { ProfileEdit } from "@/components/profile-edit"
import { OCRUpload } from "@/components/ocr-upload"

export function DoctorDashboard() {
  const { userProfile, logout, user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [showProfileEdit, setShowProfileEdit] = useState(false)
  const [patients, setPatients] = useState<any[]>([])
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [patientRecords, setPatientRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const todayStats = {
    appointments: 12,
    newPatients: 3,
    prescriptions: 8,
    pendingReviews: 5,
  }

  const recentPatients = [
    { id: 1, name: "John Doe", age: 45, condition: "Hypertension", lastVisit: "2024-01-15", status: "stable" },
    { id: 2, name: "Sarah Smith", age: 32, condition: "Diabetes", lastVisit: "2024-01-14", status: "monitoring" },
    { id: 3, name: "Mike Johnson", age: 58, condition: "Cardiac", lastVisit: "2024-01-13", status: "critical" },
  ]

  const upcomingAppointments = [
    { id: 1, patient: "Emma Wilson", time: "10:00 AM", type: "Follow-up" },
    { id: 2, patient: "David Brown", time: "11:30 AM", type: "New Patient" },
    { id: 3, patient: "Lisa Davis", time: "2:00 PM", type: "Consultation" },
  ]

  useEffect(() => {
    if (user?.uid && activeTab === "patients") {
      fetchPatients()
    }
  }, [user?.uid, activeTab])

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

  const fetchPatientRecords = async (patientId: string) => {
    if (!user?.uid) return

    setLoading(true)
    try {
      const response = await fetch(`/api/patient-records?patientId=${patientId}&doctorId=${user.uid}`)
      const data = await response.json()
      setPatientRecords(data.prescriptions || [])
    } catch (error) {
      console.error("Error fetching patient records:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient)
    fetchPatientRecords(patient.uid)
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
              <Input placeholder="Search patients..." className="pl-8 w-64" />
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

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-card/50 backdrop-blur-sm min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-2">
            <Button
              variant={activeTab === "overview" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("overview")}
            >
              <Activity className="mr-2 h-4 w-4" />
              Overview
            </Button>
            <Button
              variant={activeTab === "patients" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("patients")}
            >
              <Users className="mr-2 h-4 w-4" />
              Patients
            </Button>
            <Button
              variant={activeTab === "appointments" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("appointments")}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Appointments
            </Button>
            <Button
              variant={activeTab === "prescriptions" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("prescriptions")}
            >
              <FileText className="mr-2 h-4 w-4" />
              Prescriptions
            </Button>
            <Button
              variant={activeTab === "voice" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("voice")}
            >
              <Mic className="mr-2 h-4 w-4" />
              Voice Notes
            </Button>
            <Button
              variant={activeTab === "ocr" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("ocr")}
            >
              <Scan className="mr-2 h-4 w-4" />
              OCR Scanner
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Good morning, Dr. {userProfile?.displayName}</h2>
                <p className="text-muted-foreground">Here's what's happening with your practice today.</p>
              </div>

              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{todayStats.appointments}</div>
                    <p className="text-xs text-muted-foreground">+2 from yesterday</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">New Patients</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{todayStats.newPatients}</div>
                    <p className="text-xs text-muted-foreground">+1 from yesterday</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Prescriptions</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{todayStats.prescriptions}</div>
                    <p className="text-xs text-muted-foreground">+3 from yesterday</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{todayStats.pendingReviews}</div>
                    <p className="text-xs text-muted-foreground">-1 from yesterday</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Recent Patients */}
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Recent Patients</CardTitle>
                    <CardDescription>Patients you've seen recently</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentPatients.map((patient) => (
                        <div key={patient.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                              {patient.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{patient.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {patient.condition} • Age {patient.age}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={
                                patient.status === "critical"
                                  ? "destructive"
                                  : patient.status === "monitoring"
                                    ? "secondary"
                                    : "default"
                              }
                            >
                              {patient.status}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Appointments */}
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Today's Schedule</CardTitle>
                    <CardDescription>Your upcoming appointments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {upcomingAppointments.map((appointment) => (
                        <div key={appointment.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{appointment.patient}</p>
                            <p className="text-xs text-muted-foreground">{appointment.type}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{appointment.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "voice" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Voice Prescriptions</h2>
                  <p className="text-muted-foreground">Dictate prescriptions and let AI transcribe them</p>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Voice Note
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Voice-to-Text Prescription</CardTitle>
                  <CardDescription>Click the microphone to start dictating your prescription</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                    <div className="text-center">
                      <Mic className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Click to start recording</p>
                      <Button className="mt-4">Start Recording</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "ocr" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">OCR Scanner</h2>
                  <p className="text-muted-foreground">Upload and digitize old prescriptions and medical records</p>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Upload Medical Documents</CardTitle>
                  <CardDescription>Drag and drop or click to upload images of medical documents</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                    <div className="text-center">
                      <Scan className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Drag files here or click to browse</p>
                      <Button className="mt-4">Choose Files</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <OCRUpload />
            </div>
          )}

          {activeTab === "patients" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">My Patients</h2>
                <p className="text-muted-foreground">Patients who have connected with you and their medical records</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Patient List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Connected Patients</CardTitle>
                    <CardDescription>Patients who have granted you access to their records</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {loading ? (
                        <p className="text-center text-muted-foreground">Loading patients...</p>
                      ) : patients.length > 0 ? (
                        patients.map((patient) => (
                          <div
                            key={patient.id}
                            className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 ${
                              selectedPatient?.id === patient.id ? "bg-muted" : ""
                            }`}
                            onClick={() => handlePatientSelect(patient)}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                                {patient.displayName?.charAt(0) || "P"}
                              </div>
                              <div>
                                <p className="font-medium">{patient.displayName || "Unknown Patient"}</p>
                                <p className="text-sm text-muted-foreground">{patient.email}</p>
                                <p className="text-xs text-muted-foreground">{patient.prescriptionCount} records</p>
                              </div>
                            </div>
                            <Badge variant="secondary">Connected</Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-muted-foreground">
                          No patients connected yet. Patients can add you from their dashboard.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Patient Records */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {selectedPatient ? `${selectedPatient.displayName}'s Records` : "Patient Records"}
                    </CardTitle>
                    <CardDescription>
                      {selectedPatient ? "Medical records and prescriptions" : "Select a patient to view their records"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedPatient ? (
                        loading ? (
                          <p className="text-center text-muted-foreground">Loading records...</p>
                        ) : patientRecords.length > 0 ? (
                          patientRecords.map((record) => (
                            <div key={record.id} className="border rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <FileText className="h-4 w-4" />
                                  <span className="font-medium">Prescription</span>
                                </div>
                                <Badge variant="outline">{new Date(record.createdAt).toLocaleDateString()}</Badge>
                              </div>

                              {record.extractedData && (
                                <div className="text-sm space-y-1">
                                  {record.extractedData.doctorInfo?.name && (
                                    <p>
                                      <span className="font-medium">Doctor:</span>{" "}
                                      {record.extractedData.doctorInfo.name}
                                    </p>
                                  )}
                                  {record.extractedData.prescriptions?.length > 0 && (
                                    <div>
                                      <span className="font-medium">Medications:</span>
                                      <ul className="ml-4 mt-1">
                                        {record.extractedData.prescriptions.slice(0, 2).map((med: any, idx: number) => (
                                          <li key={idx} className="text-xs">
                                            {med.medication} {med.dosage && `- ${med.dosage}`}
                                          </li>
                                        ))}
                                        {record.extractedData.prescriptions.length > 2 && (
                                          <li className="text-xs text-muted-foreground">
                                            +{record.extractedData.prescriptions.length - 2} more...
                                          </li>
                                        )}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-muted-foreground">No records found for this patient.</p>
                        )
                      ) : (
                        <p className="text-center text-muted-foreground">
                          Select a patient from the list to view their medical records.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab !== "overview" && activeTab !== "voice" && activeTab !== "ocr" && activeTab !== "patients" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold tracking-tight capitalize">{activeTab}</h2>
                <p className="text-muted-foreground">This section is under development</p>
              </div>
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">Coming soon...</p>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Profile Edit Modal */}
      {showProfileEdit && <ProfileEdit onClose={() => setShowProfileEdit(false)} />}
    </div>
  )
}
