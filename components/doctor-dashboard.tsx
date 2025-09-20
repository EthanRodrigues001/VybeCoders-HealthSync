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
import { Heart, Users, FileText, Activity, Settings, LogOut, Bell, Search, TrendingUp, Stethoscope, Clock, Star, Menu } from "lucide-react"
import PatientDetailView from "@/components/patient-detail-view"
import { ProfileEdit } from "@/components/profile-edit"

export function DoctorDashboard() {
  const { userProfile, logout, user } = useAuth()
  const [showProfileEdit, setShowProfileEdit] = useState(false)
  const [patients, setPatients] = useState<any[]>([])
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [imageError, setImageError] = useState(false)
  const [clickedCard, setClickedCard] = useState<number | null>(null)

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

  const handleCardClick = (index: number) => {
    setClickedCard(index)
    setTimeout(() => setClickedCard(null), 200)
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

  const handleImageError = () => {
    setImageError(true)
  }

  if (selectedPatient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-green-50/10">
        {/* Animated Background Pattern */}
        <div className="fixed inset-0 opacity-3 pointer-events-none">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-200/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-green-200/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-200/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        {/* Header */}
        <header className="border-b bg-white/90 backdrop-blur-md shadow-sm">
          <div className="flex h-16 items-center px-6">
            <div className="flex items-center space-x-2 group">
              <div className="relative">
                {!imageError ? (
                  <img 
                    src="image.png" 
                    alt="HealthSync Logo" 
                    className="h-8 w-8 object-contain transition-transform duration-300 group-hover:scale-110" 
                    onError={handleImageError}
                  />
                ) : (
                  <Heart className="h-8 w-8 text-primary transition-all duration-300 group-hover:text-blue-600" />
                )}
              </div>
              <h1 className="text-xl font-bold text-black">HealthSync</h1>
            </div>

            <div className="ml-auto flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:ring-2 hover:ring-gray-200 transition-all duration-200">
                    <div className="h-8 w-8 rounded-full bg-slate-800 text-white flex items-center justify-center shadow-md">
                      <Menu className="h-4 w-4" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white/95 backdrop-blur-md" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userProfile?.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{userProfile?.email}</p>
                      <p className="text-xs leading-none text-muted-foreground">{userProfile?.clinicName}</p>
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

        <main className="p-6">
          <PatientDetailView patient={selectedPatient} doctorInfo={userProfile} onBack={handleBackToPatients} />
        </main>

        {showProfileEdit && <ProfileEdit onClose={() => setShowProfileEdit(false)} />}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-green-50/10">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 opacity-3 pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-200/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-green-200/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-200/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur-md shadow-sm">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-2 group">
            <div className="relative">
              <Heart className="h-8 w-8 text-primary transition-all duration-300 group-hover:text-blue-600 group-hover:scale-110" />
            </div>
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
                    <p className="text-xs leading-none text-muted-foreground">{userProfile?.clinicName}</p>
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

      {/* Main Content - No Sidebar */}
      <main className="p-6 space-y-6">
        {/* Welcome Section */}
        <div className="animate-fade-in">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 animate-slide-up">Good morning, Dr. {userProfile?.displayName}</h2>
          <p className="text-muted-foreground flex items-center gap-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Clock className="h-4 w-4 animate-pulse" />
            Manage your connected patients and their medical records.
          </p>
        </div>

        {/* Analytics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { 
              title: "Total Patients", 
              value: todayStats.totalPatients, 
              description: "Connected to your practice", 
              icon: Users, 
              color: "bg-blue-600",
              bgColor: "hover:bg-blue-50",
              textColor: "group-hover:text-blue-700"
            },
            { 
              title: "New Connections", 
              value: todayStats.newPatients, 
              description: "Patients added today", 
              icon: TrendingUp, 
              color: "bg-green-600",
              bgColor: "hover:bg-green-50",
              textColor: "group-hover:text-green-700"
            },
            { 
              title: "Total Prescriptions", 
              value: todayStats.prescriptions, 
              description: "Across all patients", 
              icon: FileText, 
              color: "bg-purple-600",
              bgColor: "hover:bg-purple-50",
              textColor: "group-hover:text-purple-700"
            },
            { 
              title: "Active Connections", 
              value: todayStats.activeConnections, 
              description: "Currently connected", 
              icon: Activity, 
              color: "bg-orange-600",
              bgColor: "hover:bg-orange-50",
              textColor: "group-hover:text-orange-700"
            }
          ].map((stat, index) => {
            const IconComponent = stat.icon;
            const isHovered = hoveredCard === index;
            const isClicked = clickedCard === index;
            return (
              <Card 
                key={stat.title}
                className={`group relative overflow-hidden transition-all duration-500 hover:shadow-xl border-0 shadow-md bg-white cursor-pointer ${stat.bgColor} ${
                  isClicked ? 'animate-press' : 'hover:scale-105 hover:-translate-y-2'
                }`}
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  transformStyle: 'preserve-3d'
                }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleCardClick(index)}
              >
                {/* Animated background elements */}
                <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                  <div className={`w-full h-full ${stat.color} rounded-full transform translate-x-6 -translate-y-6 transition-transform duration-500 ${isHovered ? 'scale-125 rotate-45' : ''}`}></div>
                </div>
                <div className="absolute bottom-0 left-0 w-16 h-16 opacity-5">
                  <div className={`w-full h-full ${stat.color} rounded-full transform -translate-x-4 translate-y-4 transition-transform duration-700 ${isHovered ? 'scale-150 -rotate-45' : ''}`}></div>
                </div>
                
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className={`text-sm font-medium transition-colors duration-300 ${stat.textColor}`}>{stat.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${stat.color} text-white transition-all duration-300 ${
                    isHovered ? 'scale-110 rotate-12' : ''
                  } ${isClicked ? 'scale-95' : ''}`}>
                    <IconComponent className={`h-4 w-4 transition-transform duration-300 ${isHovered ? 'animate-bounce' : ''}`} />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className={`text-2xl font-bold mb-1 transition-all duration-300 ${stat.textColor} ${isHovered ? 'animate-count-up' : ''}`}>{stat.value}</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Star className={`h-3 w-3 transition-transform duration-300 ${isHovered ? 'animate-spin text-yellow-500' : ''}`} />
                    {stat.description}
                  </p>
                </CardContent>
                
                {/* Hover shimmer effect */}
                <div className={`absolute inset-0 bg-white/20 transform -translate-x-full transition-transform duration-700 ${
                  isHovered ? 'translate-x-full' : ''
                }`}></div>
              </Card>
            );
          })}
        </div>

        {/* Patient List */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-slate-50/80 border-b border-gray-200/50">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-600 text-white">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div>
                <span className="text-lg">My Patients</span>
                <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
                  {filteredPatients.length} Total
                </Badge>
              </div>
            </CardTitle>
            <CardDescription>
              Patients who have connected with you and granted access to their medical records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-center text-muted-foreground">Loading patients...</p>
                </div>
              ) : filteredPatients.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredPatients.map((patient, index) => (
                    <Card
                      key={patient.id}
                      className="group cursor-pointer transition-all duration-500 hover:shadow-xl border border-gray-200 shadow-md bg-white overflow-hidden relative hover:scale-105 hover:-translate-y-2 hover:rotate-1"
                      onClick={() => {
                        handlePatientSelect(patient)
                        handleCardClick(index)
                      }}
                      style={{ 
                        animationDelay: `${index * 100}ms`,
                        transformStyle: 'preserve-3d'
                      }}
                    >
                      {/* Magical hover background */}
                      <div className="absolute inset-0 bg-blue-50/0 group-hover:bg-blue-50/40 transition-all duration-500"></div>
                      <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100/20 rounded-full transform translate-x-10 -translate-y-10 group-hover:translate-x-6 group-hover:-translate-y-6 group-hover:scale-150 transition-all duration-700"></div>
                      
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-white/30 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12"></div>
                      
                      <CardContent className="p-4 relative z-10">
                        <div className="flex items-center space-x-3">
                          <div className="relative group/avatar">
                            <div className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:bg-blue-700 group-hover:rotate-12 group-hover:shadow-xl">
                              {patient.displayName?.charAt(0) || "P"}
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white group-hover:animate-ping"></div>
                            {/* Floating particles effect */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                              <div className="absolute -top-2 -left-2 w-2 h-2 bg-blue-400 rounded-full animate-float"></div>
                              <div className="absolute -bottom-1 -right-2 w-1.5 h-1.5 bg-green-400 rounded-full animate-float-delayed"></div>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate text-gray-900 group-hover:text-blue-700 transition-colors duration-300 group-hover:translate-x-1">{patient.displayName || "Unknown Patient"}</p>
                            <p className="text-sm text-muted-foreground truncate group-hover:text-blue-600 transition-colors duration-300">{patient.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border border-blue-200 group-hover:bg-blue-100 group-hover:scale-105 transition-all duration-300">
                                {patient.prescriptionCount || 0} records
                              </Badge>
                              <Badge variant="outline" className="text-xs border-green-200 text-green-700 bg-green-50 group-hover:bg-green-100 group-hover:scale-105 transition-all duration-300">
                                Connected
                              </Badge>
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300 group-hover:animate-pulse">
                              <TrendingUp className="h-4 w-4 text-blue-600 group-hover:rotate-12 transition-transform duration-300" />
                            </div>
                          </div>
                        </div>
                        
                        {/* Progress bar animation */}
                        <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="relative inline-block mb-6 group">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto animate-bounce" />
                    <div className="absolute inset-0 bg-blue-100/50 rounded-full blur-xl animate-pulse"></div>
                    {/* Floating elements */}
                    <div className="absolute -top-2 -right-2 w-3 h-3 bg-blue-400/30 rounded-full animate-float"></div>
                    <div className="absolute -bottom-1 -left-2 w-2 h-2 bg-green-400/30 rounded-full animate-float-delayed"></div>
                  </div>
                  <p className="text-muted-foreground animate-fade-in">
                    {searchTerm ? "No patients found matching your search." : "No patients connected yet."}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 animate-fade-in" style={{ animationDelay: '0.3s' }}>
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
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes press {
          0% { transform: scale(1); }
          50% { transform: scale(0.95); }
          100% { transform: scale(1.02); }
        }
        
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg);
            opacity: 0.7;
          }
          50% { 
            transform: translateY(-10px) rotate(180deg);
            opacity: 1;
          }
        }
        
        @keyframes float-delayed {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg);
            opacity: 0.5;
          }
          50% { 
            transform: translateY(-8px) rotate(-180deg);
            opacity: 0.9;
          }
        }
        
        @keyframes count-up {
          from {
            transform: scale(1);
          }
          to {
            transform: scale(1.1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }
        
        .animate-press {
          animation: press 0.2s ease-out;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 3s ease-in-out infinite;
          animation-delay: 1.5s;
        }
        
        .animate-count-up {
          animation: count-up 0.3s ease-out;
        }
        
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  )
}