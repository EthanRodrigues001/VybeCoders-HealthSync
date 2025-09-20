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
import { Heart, FileText, Upload, Calendar, Activity, Settings, LogOut, Bell, Download } from "lucide-react"
import { OCRUpload } from "@/components/ocr-upload"
import { ProfileEdit } from "@/components/profile-edit"
import { PrescriptionDetail } from "@/components/prescription-detail"
import { DoctorSearch } from "@/components/doctor-search"
import { Trash2 } from "lucide-react"
import { downloadPrescriptionPDF } from "@/lib/generate-prescription-pdf"

export function PatientDashboard() {
  const { userProfile, user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [showProfileEdit, setShowProfileEdit] = useState(false)
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null)
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user?.uid) {
      fetchPrescriptions()
    }
  }, [user?.uid])

  const fetchPrescriptions = async () => {
    if (!user?.uid) return

    setLoading(true)
    try {
      const response = await fetch(`/api/prescriptions?userId=${user.uid}`)
      const data = await response.json()
      setPrescriptions(data.prescriptions || [])
    } catch (error) {
      console.error("Error fetching prescriptions:", error)
    } finally {
      setLoading(false)
    }
  }

  const deletePrescription = async (prescriptionId: string) => {
    try {
      const response = await fetch(`/api/prescriptions?id=${prescriptionId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setPrescriptions((prev) => prev.filter((p) => p.id !== prescriptionId))
      }
    } catch (error) {
      console.error("Error deleting prescription:", error)
    }
  }

  const getMedicationCount = (prescription: any) => {
    if (prescription.extractedData?.prescriptions?.length) {
      return prescription.extractedData.prescriptions.length
    }
    if (prescription.extractedData?.medications?.length) {
      return prescription.extractedData.medications.length
    }
    if (prescription.medications?.length) {
      return prescription.medications.length
    }
    return 0
  }

  const handleDownloadPDF = (prescription: any) => {
    try {
      const prescriptionData = {
        symptoms: prescription.symptoms || [],
        diagnoses: prescription.diagnoses || [],
        medications: prescription.medications || prescription.extractedData?.prescriptions || [],
      }

      const doctorInfo = {
        name: prescription.doctorName || prescription.extractedData?.doctorInfo?.name || "Unknown Doctor",
        clinicAddress:
          prescription.extractedData?.doctorInfo?.clinic || prescription.extractedData?.doctorInfo?.address || "",
        phone: prescription.extractedData?.doctorInfo?.phone || "",
        license: prescription.extractedData?.doctorInfo?.license || "",
      }

      const patientInfo = {
        name: userProfile?.displayName || "Patient",
        age: userProfile?.age || "",
        gender: userProfile?.gender || "",
        phone: userProfile?.phone || "",
        address: userProfile?.address || "",
      }

      downloadPrescriptionPDF(prescriptionData, doctorInfo, patientInfo)
    } catch (error) {
      console.error("Error generating PDF:", error)
    }
  }

  const healthStats = {
    totalRecords: prescriptions.length,
    recentUploads: prescriptions.filter((p) => {
      const uploadDate = new Date(p.uploadedAt?.seconds * 1000 || p.createdAt)
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      return uploadDate > monthAgo
    }).length,
    upcomingAppointments: 2,
    prescriptions: prescriptions.filter((p) => getMedicationCount(p) > 0).length,
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold">HealthSync</h1>
          </div>

          <div className="ml-auto flex items-center space-x-4">


            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    {userProfile?.displayName?.charAt(0) || "P"}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userProfile?.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{userProfile?.email}</p>
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
              variant={activeTab === "records" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("records")}
            >
              <FileText className="mr-2 h-4 w-4" />
              Medical Records
            </Button>
            <Button
              variant={activeTab === "doctors" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("doctors")}
            >
              <Heart className="mr-2 h-4 w-4" />
              My Doctors
            </Button>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Welcome back, {userProfile?.displayName}</h2>
                <p className="text-muted-foreground">Here's an overview of your health records and upcoming care.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{healthStats.totalRecords}</div>
                    <p className="text-xs text-muted-foreground">Across all providers</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Recent Uploads</CardTitle>
                    <Upload className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{healthStats.recentUploads}</div>
                    <p className="text-xs text-muted-foreground">This month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{healthStats.upcomingAppointments}</div>
                    <p className="text-xs text-muted-foreground">Next 30 days</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Prescriptions</CardTitle>
                    <Heart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{healthStats.prescriptions}</div>
                    <p className="text-xs text-muted-foreground">Current medications</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Recent Medical Records</CardTitle>
                    <CardDescription>Your latest medical documents and reports</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {loading ? (
                        <p className="text-center text-muted-foreground">Loading...</p>
                      ) : prescriptions.length > 0 ? (
                        prescriptions.slice(0, 5).map((prescription) => (
                          <div key={prescription.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                <FileText className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">Prescription</p>
                                <p className="text-xs text-muted-foreground">
                                  {prescription.extractedData?.doctorInfo?.name || "Unknown Doctor"} •{" "}
                                  {prescription.extractedData?.date ||
                                    new Date(
                                      prescription.uploadedAt?.seconds * 1000 || prescription.createdAt,
                                    ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="default">Active</Badge>
                              {/* Updated download button to use PDF generation */}
                              <Button variant="ghost" size="sm" onClick={() => handleDownloadPDF(prescription)}>
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => deletePrescription(prescription.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-muted-foreground">No prescriptions uploaded yet.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Upcoming Appointments</CardTitle>
                    <CardDescription>Your scheduled medical appointments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { id: 1, doctor: "Dr. Smith", date: "2024-01-20", time: "10:00 AM", type: "Follow-up" },
                        { id: 2, doctor: "Dr. Wilson", date: "2024-01-25", time: "2:30 PM", type: "Consultation" },
                      ].map((appointment) => (
                        <div key={appointment.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{appointment.doctor}</p>
                            <p className="text-xs text-muted-foreground">{appointment.type}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{appointment.date}</p>
                            <p className="text-xs text-muted-foreground">{appointment.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Current Medications</CardTitle>
                  <CardDescription>Your active prescriptions and medications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {prescriptions.filter((p) => getMedicationCount(p) > 0).length > 0 ? (
                      prescriptions
                        .filter((p) => getMedicationCount(p) > 0)
                        .slice(0, 4)
                        .flatMap((prescription) => {
                          const medications =
                            prescription.medications || prescription.extractedData?.prescriptions || []
                          return medications.slice(0, 2).map((medication: any, index: number) => (
                            <div
                              key={`${prescription.id}-${index}`}
                              className="flex items-center justify-between p-4 border rounded-lg"
                            >
                              <div>
                                <p className="text-sm font-medium">{medication.name || medication.medication}</p>
                                <p className="text-xs text-muted-foreground">
                                  {medication.dose || medication.dosage} •{" "}
                                  {medication.timing || medication.timings?.join(", ") || "As prescribed"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Prescribed by{" "}
                                  {prescription.doctorName ||
                                    prescription.extractedData?.doctorInfo?.name ||
                                    "Unknown Doctor"}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">Active</Badge>
                              </div>
                            </div>
                          ))
                        })
                    ) : (
                      <p className="text-center text-muted-foreground col-span-2">No active medications found.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "records" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Medical Records</h2>
                <p className="text-muted-foreground">All your uploaded prescription records</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Upload New Prescription</CardTitle>
                  <CardDescription>
                    Upload prescription images to extract and digitize the information using AI
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <OCRUpload onUploadComplete={fetchPrescriptions} />
                </CardContent>
              </Card>

              <div className="grid gap-4">
                {loading ? (
                  <p className="text-center text-muted-foreground">Loading...</p>
                ) : prescriptions.length > 0 ? (
                  prescriptions.map((prescription) => (
                    <Card key={prescription.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium">Prescription Record</p>
                              <p className="text-sm text-muted-foreground">
                                Doctor:{" "}
                                {prescription.doctorName || prescription.extractedData?.doctorInfo?.name || "Unknown"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Date:{" "}
                                {prescription.extractedData?.date ||
                                  new Date(
                                    prescription.uploadedAt?.seconds * 1000 || prescription.createdAt,
                                  ).toLocaleDateString()}
                              </p>
                              {getMedicationCount(prescription) > 0 && (
                                <p className="text-sm text-muted-foreground">
                                  {getMedicationCount(prescription)} medication(s) prescribed
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" onClick={() => setSelectedPrescription(prescription)}>
                              View Details
                            </Button>
                            {prescription.imageUrl && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={prescription.imageUrl} download target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4 mr-1" />
                                  Image
                                </a>
                              </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(prescription)}>
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => deletePrescription(prescription.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-center text-muted-foreground">
                        No prescription records found. Upload your first prescription to get started.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {activeTab === "doctors" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">My Doctors</h2>
                <p className="text-muted-foreground">Connect with your healthcare providers</p>
              </div>

              <DoctorSearch />
            </div>
          )}

          {activeTab !== "overview" && activeTab !== "records" && activeTab !== "doctors" && (
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

      {showProfileEdit && <ProfileEdit onClose={() => setShowProfileEdit(false)} />}

      {selectedPrescription && (
        <PrescriptionDetail prescription={selectedPrescription} onClose={() => setSelectedPrescription(null)} />
      )}
    </div>
  )
}
