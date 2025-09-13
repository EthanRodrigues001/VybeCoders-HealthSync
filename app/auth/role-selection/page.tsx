"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Stethoscope, User } from "lucide-react"
import { useRouter } from "next/navigation"

export default function RoleSelectionPage() {
  const { userProfile, updateUserProfile } = useAuth()
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to HealthSync</h1>
          <p className="text-muted-foreground">Please select your role to continue</p>
        </div>

        {!selectedRole ? (
          <div className="grid md:grid-cols-2 gap-6">
            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
              onClick={() => setSelectedRole("doctor")}
            >
              <CardHeader className="text-center">
                <Stethoscope className="h-16 w-16 text-primary mx-auto mb-4" />
                <CardTitle className="text-2xl">I'm a Doctor</CardTitle>
                <CardDescription>
                  Access patient records, create prescriptions, and manage your practice with AI-powered tools.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
              onClick={() => setSelectedRole("patient")}
            >
              <CardHeader className="text-center">
                <User className="h-16 w-16 text-primary mx-auto mb-4" />
                <CardTitle className="text-2xl">I'm a Patient</CardTitle>
                <CardDescription>
                  View your unified health records, upload documents, and track your medical history.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        ) : (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {selectedRole === "doctor" ? <Stethoscope className="h-6 w-6" /> : <User className="h-6 w-6" />}
                Complete Your {selectedRole === "doctor" ? "Doctor" : "Patient"} Profile
              </CardTitle>
              <CardDescription>Please provide additional information to set up your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedRole === "doctor" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="clinicName">Clinic/Hospital Name *</Label>
                    <Input
                      id="clinicName"
                      placeholder="Enter your clinic or hospital name"
                      value={doctorData.clinicName}
                      onChange={(e) => setDoctorData({ ...doctorData, clinicName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clinicAddress">Clinic Address *</Label>
                    <Textarea
                      id="clinicAddress"
                      placeholder="Enter your clinic's full address"
                      value={doctorData.clinicAddress}
                      onChange={(e) => setDoctorData({ ...doctorData, clinicAddress: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      placeholder="Enter your contact number"
                      value={doctorData.phoneNumber}
                      onChange={(e) => setDoctorData({ ...doctorData, phoneNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <Textarea
                      id="specialization"
                      placeholder="Enter your medical specialization (e.g., Cardiology, General Medicine)"
                      value={doctorData.specialization}
                      onChange={(e) => setDoctorData({ ...doctorData, specialization: e.target.value })}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={patientData.dateOfBirth}
                      onChange={(e) => setPatientData({ ...patientData, dateOfBirth: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={patientData.gender}
                      onValueChange={(value) => setPatientData({ ...patientData, gender: value })}
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
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      placeholder="Emergency contact phone number"
                      value={patientData.emergencyContact}
                      onChange={(e) => setPatientData({ ...patientData, emergencyContact: e.target.value })}
                    />
                  </div>
                </>
              )}

              <div className="flex gap-4 pt-4">
                <Button variant="outline" onClick={() => setSelectedRole(null)} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleRoleSubmit}
                  disabled={
                    loading ||
                    (selectedRole === "doctor" &&
                      (!doctorData.clinicName || !doctorData.clinicAddress || !doctorData.phoneNumber))
                  }
                  className="flex-1"
                >
                  {loading ? "Setting up..." : "Complete Setup"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
