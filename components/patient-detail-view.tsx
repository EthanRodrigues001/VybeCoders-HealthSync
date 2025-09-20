"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, FileText, Calendar, Pill } from "lucide-react"
import { VoicePrescription } from "@/components/voice-prescription"

interface PatientDetailViewProps {
  patient: any
  doctorInfo: any
  onBack: () => void
}

export function PatientDetailView({ patient, doctorInfo, onBack }: PatientDetailViewProps) {
  const [patientRecords, setPatientRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchPatientRecords()
  }, [patient])

  const fetchPatientRecords = async () => {
    if (!patient?.uid || !doctorInfo?.uid) return

    setLoading(true)
    try {
      const response = await fetch(`/api/patient-records?patientId=${patient.uid}&doctorId=${doctorInfo.uid}`)
      const data = await response.json()
      setPatientRecords(data.prescriptions || [])
    } catch (error) {
      console.error("Error fetching patient records:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrescriptionAdded = () => {
    fetchPatientRecords() // Refresh records after adding new prescription
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patients
          </Button>
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              {patient.displayName?.charAt(0) || "P"}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{patient.displayName || "Unknown Patient"}</h2>
              <p className="text-muted-foreground">{patient.email}</p>
            </div>
          </div>
        </div>
        <Badge variant="secondary">Connected Patient</Badge>
      </div>

      {/* Patient Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patientRecords.length}</div>
            <p className="text-xs text-muted-foreground">Medical prescriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Visit</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patientRecords.length > 0 ? new Date(patientRecords[0].createdAt).toLocaleDateString() : "Never"}
            </div>
            <p className="text-xs text-muted-foreground">Most recent record</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Medications</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patientRecords.reduce((count, record) => {
                return (
                  count +
                  (record.extractedData?.medications?.length || record.extractedData?.prescriptions?.length || 0)
                )
              }, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total prescribed</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="records" className="space-y-4">
        <TabsList>
          <TabsTrigger value="records">Medical Records</TabsTrigger>
          <TabsTrigger value="voice-prescription">Voice Prescription</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medical Records</CardTitle>
              <CardDescription>All prescriptions and medical documents for this patient</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-center text-muted-foreground">Loading records...</p>
                ) : patientRecords.length > 0 ? (
                  patientRecords.map((record) => (
                    <div key={record.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span className="font-medium">
                            {record.type === "voice_prescription" ? "Voice Prescription" : "OCR Prescription"}
                          </span>
                        </div>
                        <Badge variant="outline">{new Date(record.createdAt).toLocaleDateString()}</Badge>
                      </div>

                      {record.extractedData && (
                        <div className="text-sm space-y-2">
                          {record.extractedData.doctorInfo?.name && (
                            <p>
                              <span className="font-medium">Doctor:</span> {record.extractedData.doctorInfo.name}
                            </p>
                          )}

                          {record.extractedData.symptoms?.length > 0 && (
                            <div>
                              <span className="font-medium">Symptoms:</span>
                              <ul className="ml-4 mt-1">
                                {record.extractedData.symptoms.map((symptom: any, idx: number) => (
                                  <li key={idx} className="text-xs">
                                    {symptom.text} ({symptom.severity})
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {record.extractedData.diagnoses?.length > 0 && (
                            <div>
                              <span className="font-medium">Diagnoses:</span>
                              <ul className="ml-4 mt-1">
                                {record.extractedData.diagnoses.map((diagnosis: any, idx: number) => (
                                  <li key={idx} className="text-xs">
                                    {diagnosis.text} ({Math.round(diagnosis.confidence * 100)}% confidence)
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {(record.extractedData.medications?.length > 0 ||
                            record.extractedData.prescriptions?.length > 0) && (
                            <div>
                              <span className="font-medium">Medications:</span>
                              <ul className="ml-4 mt-1">
                                {(record.extractedData.medications || record.extractedData.prescriptions || [])
                                  .slice(0, 3)
                                  .map((med: any, idx: number) => (
                                    <li key={idx} className="text-xs">
                                      {med.name || med.medication}{" "}
                                      {(med.dose || med.dosage) && `- ${med.dose || med.dosage}`}
                                    </li>
                                  ))}
                                {(record.extractedData.medications || record.extractedData.prescriptions || []).length >
                                  3 && (
                                  <li className="text-xs text-muted-foreground">
                                    +
                                    {(record.extractedData.medications || record.extractedData.prescriptions || [])
                                      .length - 3}{" "}
                                    more...
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
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice-prescription">
          <VoicePrescription
            selectedPatient={patient}
            doctorInfo={doctorInfo}
            onPrescriptionAdded={handlePrescriptionAdded}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default PatientDetailView
