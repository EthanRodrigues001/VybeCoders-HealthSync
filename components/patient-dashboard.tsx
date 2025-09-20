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
import { Heart, FileText, Upload, Calendar, Activity, Settings, LogOut, Bell, Download, Clock, Star, TrendingUp } from "lucide-react"
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
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

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
    activeConsultations: 3,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-green-50/10">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 opacity-3 pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-200/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-green-200/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-200/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <header className="border-b bg-white/90 backdrop-blur-md shadow-sm">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-2 group">
            <Heart className="h-8 w-8 text-primary transition-all duration-300 group-hover:text-blue-600 group-hover:scale-110" />
            <h1 className="text-xl font-bold text-black">HealthSync</h1>
          </div>

          <div className="ml-auto flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:ring-2 hover:ring-gray-200 transition-all duration-200">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center text-gray-800">
                    <div className="flex flex-col space-y-1">
                      <div className="w-4 h-0.5 bg-gray-800"></div>
                      <div className="w-4 h-0.5 bg-gray-800"></div>
                      <div className="w-4 h-0.5 bg-gray-800"></div>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white/95 backdrop-blur-md" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userProfile?.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{userProfile?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="hover:bg-blue-50 transition-colors" onClick={() => setShowProfileEdit(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Edit Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-red-50 transition-colors" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 border-r bg-white/80 backdrop-blur-md shadow-sm min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-2">
            <Button
              variant={activeTab === "overview" ? "default" : "ghost"}
              className={`w-full justify-start transition-all duration-300 hover:scale-102 ${
                activeTab === "overview" 
                  ? "bg-blue-600 text-white shadow-md" 
                  : "hover:bg-blue-50 hover:text-blue-700"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              <Activity className="mr-2 h-4 w-4" />
              Overview
            </Button>
            <Button
              variant={activeTab === "records" ? "default" : "ghost"}
              className={`w-full justify-start transition-all duration-300 hover:scale-102 ${
                activeTab === "records" 
                  ? "bg-blue-600 text-white shadow-md" 
                  : "hover:bg-blue-50 hover:text-blue-700"
              }`}
              onClick={() => setActiveTab("records")}
            >
              <FileText className="mr-2 h-4 w-4" />
              Medical Records
            </Button>
            <Button
              variant={activeTab === "doctors" ? "default" : "ghost"}
              className={`w-full justify-start transition-all duration-300 hover:scale-102 ${
                activeTab === "doctors" 
                  ? "bg-blue-600 text-white shadow-md" 
                  : "hover:bg-blue-50 hover:text-blue-700"
              }`}
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
              <div className="animate-fade-in">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back, {userProfile?.displayName}</h2>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Here's an overview of your health records and upcoming care.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                  { 
                    title: "Total Records", 
                    value: healthStats.totalRecords, 
                    description: "Across all providers", 
                    icon: FileText, 
                    color: "bg-blue-600",
                    bgColor: "hover:bg-blue-50"
                  },
                  { 
                    title: "Recent Uploads", 
                    value: healthStats.recentUploads, 
                    description: "This month", 
                    icon: Upload, 
                    color: "bg-green-600",
                    bgColor: "hover:bg-green-50"
                  },
                  { 
                    title: "Upcoming Appointments", 
                    value: healthStats.upcomingAppointments, 
                    description: "Next 30 days", 
                    icon: Calendar, 
                    color: "bg-purple-600",
                    bgColor: "hover:bg-purple-50"
                  },
                  { 
                    title: "Active Consultations", 
                    value: healthStats.activeConsultations, 
                    description: "Current providers", 
                    icon: Heart, 
                    color: "bg-orange-600",
                    bgColor: "hover:bg-orange-50"
                  }
                ].map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <Card 
                      key={stat.title}
                      className={`relative overflow-hidden transition-all duration-500 hover:shadow-lg hover:scale-105 ${stat.bgColor} border-0 shadow-md bg-white`}
                      style={{ animationDelay: `${index * 100}ms` }}
                      onMouseEnter={() => setHoveredCard(index)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                        <div className={`w-full h-full ${stat.color} rounded-full transform translate-x-6 -translate-y-6`}></div>
                      </div>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <div className={`p-2 rounded-lg ${stat.color} text-white transition-transform duration-300 ${hoveredCard === index ? 'scale-110' : ''}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        <div className="text-2xl font-bold mb-1">{stat.value}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {stat.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-slate-50/80 border-b border-gray-200/50">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-600 text-white">
                        <FileText className="h-5 w-5" />
                      </div>
                      Recent Medical Records
                    </CardTitle>
                    <CardDescription>Your latest medical documents and reports</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {loading ? (
                        <div className="flex flex-col items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                          <p className="text-center text-muted-foreground">Loading...</p>
                        </div>
                      ) : prescriptions.length > 0 ? (
                        prescriptions.slice(0, 5).map((prescription, index) => (
                          <div key={prescription.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50/30 transition-colors duration-300 group" style={{ animationDelay: `${index * 50}ms` }}>
                            <div className="flex items-center space-x-4">
                              <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
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
                              <Badge className="bg-green-100 text-green-700 border border-green-200">Active</Badge>
                              <Button variant="ghost" size="sm" className="hover:bg-blue-100 transition-colors" onClick={() => handleDownloadPDF(prescription)}>
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="hover:bg-red-100 transition-colors" onClick={() => deletePrescription(prescription.id)}>
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-center text-muted-foreground">No prescriptions uploaded yet.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="col-span-3 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-slate-50/80 border-b border-gray-200/50">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-600 text-white">
                        <Calendar className="h-5 w-5" />
                      </div>
                      Upcoming Appointments
                    </CardTitle>
                    <CardDescription>Your scheduled medical appointments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { id: 1, doctor: "Dr. Smith", date: "2024-01-20", time: "10:00 AM", type: "Follow-up" },
                        { id: 2, doctor: "Dr. Wilson", date: "2024-01-25", time: "2:30 PM", type: "Consultation" },
                      ].map((appointment, index) => (
                        <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-purple-50/30 transition-colors duration-300 group" style={{ animationDelay: `${index * 100}ms` }}>
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs group-hover:scale-110 transition-transform duration-300">
                              {appointment.doctor.charAt(3)}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{appointment.doctor}</p>
                              <p className="text-xs text-muted-foreground">{appointment.type}</p>
                            </div>
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

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
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
                              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-green-300 transition-all duration-300 hover:scale-102 bg-white group"
                            >
                              <div>
                                <p className="text-sm font-medium group-hover:text-green-700 transition-colors">{medication.name || medication.medication}</p>
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
                                <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">Active</Badge>
                              </div>
                            </div>
                          ))
                        })
                    ) : (
                      <div className="col-span-2 text-center py-8">
                        <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-center text-muted-foreground">No active medications found.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "records" && (
            <div className="space-y-6">
              <div className="animate-fade-in">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Medical Records</h2>
                <p className="text-muted-foreground">All your uploaded prescription records</p>
              </div>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-slate-50/80 border-b border-gray-200/50">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-600 text-white">
                      <Upload className="h-5 w-5" />
                    </div>
                    Upload New Prescription
                  </CardTitle>
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
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-center text-muted-foreground">Loading...</p>
                  </div>
                ) : prescriptions.length > 0 ? (
                  prescriptions.map((prescription, index) => (
                    <Card key={prescription.id} className="border-0 shadow-md bg-white hover:shadow-lg transition-all duration-300 hover:scale-102" style={{ animationDelay: `${index * 50}ms` }}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
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
                            <Button variant="outline" size="sm" className="hover:bg-blue-50 transition-colors border-blue-200" onClick={() => setSelectedPrescription(prescription)}>
                              View Details
                            </Button>
                            {prescription.imageUrl && (
                              <Button variant="outline" size="sm" className="hover:bg-green-50 transition-colors border-green-200" asChild>
                                <a href={prescription.imageUrl} download target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4 mr-1" />
                                  Image
                                </a>
                              </Button>
                            )}
                            <Button variant="outline" size="sm" className="hover:bg-purple-50 transition-colors border-purple-200" onClick={() => handleDownloadPDF(prescription)}>
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="hover:bg-red-50 transition-colors border-red-200" onClick={() => deletePrescription(prescription.id)}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-center text-muted-foreground">
                          No prescription records found. Upload your first prescription to get started.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {activeTab === "doctors" && (
            <div className="space-y-6">
              <div className="animate-fade-in">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">My Doctors</h2>
                <p className="text-muted-foreground">Connect with your healthcare providers</p>
              </div>

              <DoctorSearch />
            </div>
          )}

          {activeTab !== "overview" && activeTab !== "records" && activeTab !== "doctors" && (
            <div className="space-y-6">
              <div className="animate-fade-in">
                <h2 className="text-3xl font-bold tracking-tight capitalize text-gray-900">{activeTab}</h2>
                <p className="text-muted-foreground">This section is under development</p>
              </div>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-center text-muted-foreground">Coming soon...</p>
                  </div>
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

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  )
}