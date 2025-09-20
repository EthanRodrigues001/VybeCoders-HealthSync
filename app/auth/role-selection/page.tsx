"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Stethoscope, User, Settings, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type LogoSize = "sm" | "md" | "lg"

function Logo({ size = "md" }: { size?: LogoSize }) {
  const sizeClass = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-10 w-10"
  return (
    <img
      src="/image.png"
      alt="HealthSync logo"
      className={`${sizeClass} object-contain`}
      width={size === "lg" ? 48 : size === "sm" ? 32 : 40}
      height={size === "lg" ? 48 : size === "sm" ? 32 : 40}
    />
  )
}

export default function RoleSelectionPage() {
  const { userProfile, updateUserProfile, logout } = useAuth()
  const [selectedRole, setSelectedRole] = useState<"doctor" | "patient" | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [doctorData, setDoctorData] = useState({
    clinicName: "",
    clinicAddress: "",
    phoneNumber: "",
    specialization: "",
  })

  const [patientData, setPatientData] = useState({
    dateOfBirth: "",
    gender: "",
    emergencyContact: "",
  })

  const handleRoleSubmit = async () => {
    if (!selectedRole) return
    setLoading(true)
    try {
      const profileUpdate = {
        role: selectedRole,
        ...(selectedRole === "doctor" ? doctorData : patientData),
      }
      await updateUserProfile(profileUpdate)
      router.push(selectedRole === "doctor" ? "/doctor/dashboard" : "/patient/dashboard")
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-3">
            <Logo size="sm" />
            <h1 className="text-xl font-bold text-black">HealthSync</h1>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:ring-2 hover:ring-gray-200">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center text-gray-800">
                    <div className="flex flex-col space-y-1">
                      <div className="w-4 h-0.5 bg-gray-800"></div>
                      <div className="w-4 h-0.5 bg-gray-800"></div>
                      <div className="w-4 h-0.5 bg-gray-800"></div>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userProfile?.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{userProfile?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
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
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mt-1">Welcome to HealthSync</h1>
            <p className="text-muted-foreground">Please select your role to continue</p>
          </div>

          {!selectedRole ? (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Doctor card */}
              <Card
                className="cursor-pointer transition-all duration-300 hover:shadow-xl border shadow-md bg-white hover:bg-blue-50"
                onClick={() => setSelectedRole("doctor")}
              >
                <CardHeader className="text-center">
                  <Stethoscope className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <CardTitle className="text-2xl font-semibold text-blue-600">I'm a Doctor</CardTitle>
                  <CardDescription className="text-gray-700">
                    Access patient records, create prescriptions, and manage your practice.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Patient card */}
              <Card
                className="cursor-pointer transition-all duration-300 hover:shadow-xl border shadow-md bg-white hover:bg-green-50"
                onClick={() => setSelectedRole("patient")}
              >
                <CardHeader className="text-center">
                  <User className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <CardTitle className="text-2xl font-semibold text-green-700">I'm a Patient</CardTitle>
                  <CardDescription className="text-gray-700">
                    View your unified health records, upload documents, and track your medical history.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          ) : (
            <Card className="max-w-2xl mx-auto shadow-xl border bg-white">
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${selectedRole === "doctor" ? "text-blue-700" : "text-green-700"}`}>
                  {selectedRole === "doctor" ? <Stethoscope className="h-6 w-6" /> : <User className="h-6 w-6" />}
                  Complete Your {selectedRole === "doctor" ? "Doctor" : "Patient"} Profile
                </CardTitle>
                <CardDescription>Please provide additional information to set up your account.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedRole === "doctor" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="clinicName" className="text-blue-700 font-medium">Clinic/Hospital Name *</Label>
                      <Input
                        id="clinicName"
                        placeholder="Enter your clinic or hospital name"
                        value={doctorData.clinicName}
                        onChange={e => setDoctorData({ ...doctorData, clinicName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clinicAddress" className="text-blue-700 font-medium">Clinic Address *</Label>
                      <Textarea
                        id="clinicAddress"
                        placeholder="Enter your clinic's full address"
                        value={doctorData.clinicAddress}
                        onChange={e => setDoctorData({ ...doctorData, clinicAddress: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="text-blue-700 font-medium">Phone Number *</Label>
                      <Input
                        id="phoneNumber"
                        placeholder="Enter your contact number"
                        value={doctorData.phoneNumber}
                        onChange={e => setDoctorData({ ...doctorData, phoneNumber: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specialization" className="text-blue-700 font-medium">Specialization</Label>
                      <Textarea
                        id="specialization"
                        placeholder="Enter your medical specialization (e.g., Cardiology)"
                        value={doctorData.specialization}
                        onChange={e => setDoctorData({ ...doctorData, specialization: e.target.value })}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth" className="text-green-700 font-medium">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={patientData.dateOfBirth}
                        onChange={e => setPatientData({ ...patientData, dateOfBirth: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-green-700 font-medium">Gender</Label>
                      <Select
                        value={patientData.gender}
                        onValueChange={value => setPatientData({ ...patientData, gender: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact" className="text-green-700 font-medium">Emergency Contact</Label>
                      <Input
                        id="emergencyContact"
                        placeholder="Emergency contact phone number"
                        value={patientData.emergencyContact}
                        onChange={e => setPatientData({ ...patientData, emergencyContact: e.target.value })}
                      />
                    </div>
                  </>
                )}
                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedRole(null)}
                    className="flex-1 hover:bg-gray-100 border-gray-300"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleRoleSubmit}
                    disabled={
                      loading ||
                      (selectedRole === "doctor" &&
                        (!doctorData.clinicName || !doctorData.clinicAddress || !doctorData.phoneNumber))
                    }
                    className={`flex-1 font-bold ${
                      selectedRole === "doctor"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-green-600 hover:bg-green-700"
                    } text-white shadow-md`}
                  >
                    {loading ? "Setting up..." : "Complete Setup"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
