"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Loader2, User, Stethoscope, Edit, Check, X } from "lucide-react"
import { useVoiceRecording } from "@/hooks/use-voice-recording"
import { PrescriptionDisplay } from "@/components/prescription-display"

interface VoicePrescriptionProps {
  selectedPatient: any
  doctorInfo: any
  onPrescriptionAdded?: () => void
}

export function VoicePrescription({ selectedPatient, doctorInfo, onPrescriptionAdded }: VoicePrescriptionProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [generatedPrescription, setGeneratedPrescription] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedPrescription, setEditedPrescription] = useState<any>({
    symptoms: [],
    diagnoses: [],
    medications: [],
    instructions: "",
    notes: "",
  })
  const [isApproving, setIsApproving] = useState(false)
  const [patientInfo, setPatientInfo] = useState({
    name: selectedPatient?.displayName || "",
    age: "",
    gender: "",
  })

  const { isRecording, transcript, startRecording, stopRecording, clearTranscript, error, isListening } =
    useVoiceRecording()

  const handleProcessPrescription = async () => {
    if (!transcript.trim()) {
      alert("Please record a prescription first")
      return
    }

    if (!selectedPatient) {
      alert("Please select a patient first")
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch("/api/voice-prescription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript: transcript.trim(),
          doctorInfo: {
            name: doctorInfo?.displayName || "Dr. Unknown",
            clinicAddress: doctorInfo?.clinicName || "Unknown Clinic",
            phone: doctorInfo?.phone || "Not provided",
          },
          patientInfo,
          patientId: selectedPatient.uid,
          doctorId: doctorInfo?.uid,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setGeneratedPrescription(data.prescription)
        setEditedPrescription(data.prescription)
        onPrescriptionAdded?.()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error("Error processing prescription:", error)
      alert("Failed to process prescription. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedPrescription(generatedPrescription)
  }

  const handleSaveEdit = () => {
    setGeneratedPrescription(editedPrescription)
    setIsEditing(false)
  }

  const handleApprovePrescription = async () => {
    setIsApproving(true)
    try {
      const prescriptionData = {
        patientId: selectedPatient.uid,
        doctorId: doctorInfo?.uid,
        type: "voice_prescription",
        status: "approved",
        symptoms: editedPrescription.symptoms || [],
        diagnoses: editedPrescription.diagnoses || [],
        medications: editedPrescription.medications || [],
        doctorInfo: {
          name: doctorInfo?.displayName || "Dr. Unknown",
          clinic: doctorInfo?.clinicName || "Unknown Clinic",
          address: doctorInfo?.address || "Not provided",
          phone: doctorInfo?.phone || "Not provided",
        },
        patientInfo,
        transcript,
        approvedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }

      const response = await fetch("/api/prescriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(prescriptionData),
      })

      const data = await response.json()

      if (data.success) {
        alert("Prescription approved and saved successfully!")
        handleNewPrescription()
        onPrescriptionAdded?.() // Trigger refresh of patient list
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error("Error approving prescription:", error)
      alert("Failed to approve prescription. Please try again.")
    } finally {
      setIsApproving(false)
    }
  }

  const handleNewPrescription = () => {
    setGeneratedPrescription(null)
    setEditedPrescription({
      symptoms: [],
      diagnoses: [],
      medications: [],
      instructions: "",
      notes: "",
    })
    setIsEditing(false)
    clearTranscript()
  }

  if (!selectedPatient) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Please select a patient to create a voice prescription</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (generatedPrescription) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Generated Prescription</h3>
          <div className="flex gap-2">
            {!isEditing && (
              <>
                <Button onClick={handleEdit} variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  onClick={handleApprovePrescription}
                  disabled={isApproving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isApproving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </>
                  )}
                </Button>
              </>
            )}
            {isEditing && (
              <>
                <Button onClick={handleSaveEdit} size="sm" className="bg-green-600 hover:bg-green-700">
                  <Check className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button onClick={handleCancelEdit} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}
            <Button onClick={handleNewPrescription} variant="outline" size="sm">
              Create New
            </Button>
          </div>
        </div>

        {isEditing ? (
          <Card>
            <CardHeader>
              <CardTitle>Edit Prescription</CardTitle>
              <CardDescription>Make any necessary changes to the prescription details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editDate">Date</Label>
                  <Input
                    id="editDate"
                    value={editedPrescription?.date || ""}
                    onChange={(e) => setEditedPrescription({ ...editedPrescription, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="editDiagnosis">Diagnosis</Label>
                  <Input
                    id="editDiagnosis"
                    value={editedPrescription?.diagnosis || ""}
                    onChange={(e) => setEditedPrescription({ ...editedPrescription, diagnosis: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="editSymptoms">Symptoms</Label>
                <Textarea
                  id="editSymptoms"
                  value={editedPrescription?.symptoms.join("\n") || ""}
                  onChange={(e) =>
                    setEditedPrescription({ ...editedPrescription, symptoms: e.target.value.split("\n") })
                  }
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <Label htmlFor="editMedications">Medications</Label>
                <Textarea
                  id="editMedications"
                  value={
                    editedPrescription?.medications
                      ?.map((med: any) => `${med.name} - ${med.dosage} - ${med.frequency} - ${med.duration}`)
                      .join("\n") || ""
                  }
                  onChange={(e) => {
                    const lines = e.target.value.split("\n")
                    const medications = lines.map((line) => {
                      const parts = line.split(" - ")
                      return {
                        name: parts[0] || "",
                        dosage: parts[1] || "",
                        frequency: parts[2] || "",
                        duration: parts[3] || "",
                      }
                    })
                    setEditedPrescription({ ...editedPrescription, medications })
                  }}
                  className="min-h-[120px]"
                  placeholder="Enter each medication on a new line in format: Name - Dosage - Frequency - Duration"
                />
              </div>

              <div>
                <Label htmlFor="editInstructions">Instructions</Label>
                <Textarea
                  id="editInstructions"
                  value={editedPrescription?.instructions || ""}
                  onChange={(e) => setEditedPrescription({ ...editedPrescription, instructions: e.target.value })}
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <Label htmlFor="editNotes">Additional Notes</Label>
                <Textarea
                  id="editNotes"
                  value={editedPrescription?.notes || ""}
                  onChange={(e) => setEditedPrescription({ ...editedPrescription, notes: e.target.value })}
                  className="min-h-[60px]"
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <PrescriptionDisplay
            prescription={generatedPrescription}
            doctorInfo={{
              name: doctorInfo?.displayName || "Dr. Unknown",
              clinicAddress: doctorInfo?.clinicName || "Unknown Clinic",
              phone: doctorInfo?.phone || "Not provided",
            }}
            patientInfo={patientInfo}
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Patient Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Patient Information
          </CardTitle>
          <CardDescription>Update patient details for the prescription</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="patientName">Patient Name</Label>
              <Input
                id="patientName"
                value={patientInfo.name}
                onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
                placeholder="Enter patient name"
              />
            </div>
            <div>
              <Label htmlFor="patientAge">Age</Label>
              <Input
                id="patientAge"
                value={patientInfo.age}
                onChange={(e) => setPatientInfo({ ...patientInfo, age: e.target.value })}
                placeholder="Enter age"
              />
            </div>
            <div>
              <Label htmlFor="patientGender">Gender</Label>
              <Input
                id="patientGender"
                value={patientInfo.gender}
                onChange={(e) => setPatientInfo({ ...patientInfo, gender: e.target.value })}
                placeholder="Enter gender"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voice Recording */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Voice Prescription
          </CardTitle>
          <CardDescription>
            Click the microphone to start dictating the prescription. Speak clearly and include all symptoms, diagnoses,
            and medications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recording Controls */}
          <div className="flex items-center justify-center space-x-4">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              size="lg"
              className={`${isRecording ? "bg-red-500 hover:bg-red-600 text-white" : "bg-primary hover:bg-primary/90"}`}
            >
              {isRecording ? (
                <>
                  <MicOff className="mr-2 h-5 w-5" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-5 w-5" />
                  Start Recording
                </>
              )}
            </Button>

            {transcript && (
              <Button onClick={clearTranscript} variant="outline">
                Clear
              </Button>
            )}
          </div>

          {/* Recording Status */}
          <div className="text-center">
            {isRecording && (
              <div className="flex items-center justify-center space-x-2">
                <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm text-muted-foreground">{isListening ? "Listening..." : "Recording..."}</span>
              </div>
            )}
            {error && (
              <Badge variant="destructive" className="mt-2">
                {error}
              </Badge>
            )}
          </div>

          {/* Transcript */}
          {transcript && (
            <div className="space-y-2">
              <Label htmlFor="transcript">Recorded Transcript</Label>
              <Textarea
                id="transcript"
                value={transcript}
                readOnly
                className="min-h-[120px] bg-muted/50"
                placeholder="Your voice transcript will appear here..."
              />
            </div>
          )}

          {/* Process Button */}
          {transcript && (
            <div className="flex justify-center">
              <Button onClick={handleProcessPrescription} disabled={isProcessing || !transcript.trim()} size="lg">
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Prescription...
                  </>
                ) : (
                  "Generate Prescription"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
