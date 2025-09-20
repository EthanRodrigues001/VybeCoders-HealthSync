"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { X, Download, Calendar, User, MapPin, Phone, Stethoscope, AlertCircle } from "lucide-react"
import { downloadPrescriptionPDF } from "@/lib/generate-prescription-pdf"
import { useAuth } from "@/hooks/use-auth"

interface PrescriptionDetailProps {
  prescription: any
  onClose: () => void
}

export function PrescriptionDetail({ prescription, onClose }: PrescriptionDetailProps) {
  const { userProfile } = useAuth()

  console.log("[v0] Prescription data:", prescription)
  console.log("[v0] Extracted data:", prescription.extractedData)
  console.log("[v0] Symptoms:", prescription.extractedData?.symptoms)
  console.log("[v0] Diagnoses:", prescription.extractedData?.diagnoses)
  console.log("[v0] Medications:", prescription.extractedData?.medications)

  const handleDownload = () => {
    try {
      const prescriptionData = {
        symptoms: prescription.symptoms || prescription.extractedData?.symptoms || [],
        diagnoses: prescription.diagnoses || prescription.extractedData?.diagnoses || [],
        medications:
          prescription.medications ||
          prescription.extractedData?.medications ||
          prescription.extractedData?.prescriptions ||
          [],
      }

      console.log("[v0] PDF prescription data:", prescriptionData)

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
      // Fallback to original image if PDF generation fails
      if (prescription.imageUrl) {
        window.open(prescription.imageUrl, "_blank")
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Prescription Details</CardTitle>
            <CardDescription>
              {prescription.extractedData?.date
                ? `Prescribed on ${prescription.extractedData.date}`
                : "Prescription information"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-sm text-yellow-800">Debug Info (temporary)</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-yellow-700">
              <p>Has extractedData: {prescription.extractedData ? "Yes" : "No"}</p>
              <p>Symptoms count: {prescription.extractedData?.symptoms?.length || 0}</p>
              <p>Diagnoses count: {prescription.extractedData?.diagnoses?.length || 0}</p>
              <p>Medications count: {prescription.extractedData?.medications?.length || 0}</p>
              <p>Prescriptions count: {prescription.extractedData?.prescriptions?.length || 0}</p>
            </CardContent>
          </Card>

          {/* Doctor Information */}
          {prescription.extractedData?.doctorInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5" />
                  Doctor Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {prescription.extractedData.doctorInfo.name && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{prescription.extractedData.doctorInfo.name}</span>
                  </div>
                )}
                {prescription.extractedData.doctorInfo.clinic && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{prescription.extractedData.doctorInfo.clinic}</span>
                  </div>
                )}
                {prescription.extractedData.doctorInfo.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm text-muted-foreground">
                      {prescription.extractedData.doctorInfo.address}
                    </span>
                  </div>
                )}
                {prescription.extractedData.doctorInfo.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{prescription.extractedData.doctorInfo.phone}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Symptoms */}
          {((prescription.symptoms && prescription.symptoms.length > 0) ||
            (prescription.extractedData?.symptoms && prescription.extractedData.symptoms.length > 0)) && (
            <>
              <Separator />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertCircle className="h-5 w-5" />
                    Symptoms
                  </CardTitle>
                  <CardDescription>Patient reported symptoms</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(prescription.symptoms || prescription.extractedData?.symptoms || []).map(
                      (symptom: any, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="h-2 w-2 bg-orange-500 rounded-full" />
                          <span className="text-sm">
                            {typeof symptom === "string"
                              ? symptom
                              : symptom.text || symptom.name || JSON.stringify(symptom)}
                          </span>
                          {typeof symptom === "object" && symptom.severity && (
                            <Badge variant="outline" className="text-xs">
                              {symptom.severity}
                            </Badge>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Diagnoses */}
          {((prescription.diagnoses && prescription.diagnoses.length > 0) ||
            (prescription.extractedData?.diagnoses && prescription.extractedData.diagnoses.length > 0)) && (
            <>
              <Separator />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Stethoscope className="h-5 w-5" />
                    Diagnoses
                  </CardTitle>
                  <CardDescription>Medical diagnoses and conditions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(prescription.diagnoses || prescription.extractedData?.diagnoses || []).map(
                      (diagnosis: any, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="h-2 w-2 bg-blue-500 rounded-full" />
                          <span className="text-sm font-medium">
                            {typeof diagnosis === "string"
                              ? diagnosis
                              : diagnosis.text || diagnosis.name || JSON.stringify(diagnosis)}
                          </span>
                          {typeof diagnosis === "object" && diagnosis.notes && (
                            <span className="text-xs text-muted-foreground">- {diagnosis.notes}</span>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Prescription Date */}
          {prescription.extractedData?.date && (
            <>
              <Separator />
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Prescribed on {prescription.extractedData.date}</span>
              </div>
            </>
          )}

          {/* Medications */}
          {((prescription.medications && prescription.medications.length > 0) ||
            (prescription.extractedData?.medications && prescription.extractedData.medications.length > 0) ||
            (prescription.extractedData?.prescriptions && prescription.extractedData.prescriptions.length > 0)) && (
            <>
              <Separator />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Stethoscope className="h-5 w-5" />
                    Prescribed Medications
                  </CardTitle>
                  <CardDescription>
                    {prescription.medications?.length ||
                      prescription.extractedData?.medications?.length ||
                      prescription.extractedData?.prescriptions?.length ||
                      0}{" "}
                    medication(s) prescribed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Voice prescription medications */}
                    {prescription.medications &&
                      prescription.medications.map((med: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4 bg-muted/30">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold text-lg text-primary">{med.name}</h4>
                            {med.dose && <Badge variant="secondary">{med.dose}</Badge>}
                          </div>

                          {med.timing && (
                            <div className="mb-2">
                              <p className="text-sm font-medium mb-1">Timing:</p>
                              <Badge variant="outline" className="text-xs">
                                {med.timing}
                              </Badge>
                            </div>
                          )}

                          {med.duration_days && (
                            <div className="mb-2">
                              <p className="text-sm font-medium">
                                Duration: <span className="font-normal">{med.duration_days} days</span>
                              </p>
                            </div>
                          )}

                          {med.instructions && (
                            <div>
                              <p className="text-sm font-medium mb-1">Instructions:</p>
                              <p className="text-sm text-muted-foreground">{med.instructions}</p>
                            </div>
                          )}
                        </div>
                      ))}

                    {/* API medications from extractedData.medications */}
                    {prescription.extractedData?.medications &&
                      prescription.extractedData.medications.map((med: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4 bg-muted/30">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold text-lg text-primary">{med.name || med.medication}</h4>
                            {(med.dose || med.dosage) && <Badge variant="secondary">{med.dose || med.dosage}</Badge>}
                          </div>

                          {(med.timing || (med.timings && med.timings.length > 0)) && (
                            <div className="mb-2">
                              <p className="text-sm font-medium mb-1">Timing:</p>
                              {med.timing ? (
                                <Badge variant="outline" className="text-xs">
                                  {med.timing}
                                </Badge>
                              ) : (
                                <div className="flex flex-wrap gap-1">
                                  {med.timings.map((timing: string, timingIndex: number) => (
                                    <Badge key={timingIndex} variant="outline" className="text-xs">
                                      {timing}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {(med.duration_days || med.duration) && (
                            <div className="mb-2">
                              <p className="text-sm font-medium">
                                Duration: <span className="font-normal">{med.duration_days || med.duration}</span>
                              </p>
                            </div>
                          )}

                          {med.instructions && (
                            <div>
                              <p className="text-sm font-medium mb-1">Instructions:</p>
                              <p className="text-sm text-muted-foreground">{med.instructions}</p>
                            </div>
                          )}
                        </div>
                      ))}

                    {/* OCR prescription medications (fallback) */}
                    {prescription.extractedData?.prescriptions &&
                      !prescription.extractedData?.medications &&
                      prescription.extractedData.prescriptions.map((med: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4 bg-muted/30">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold text-lg text-primary">{med.medication}</h4>
                            {med.dosage && <Badge variant="secondary">{med.dosage}</Badge>}
                          </div>

                          {med.timings && med.timings.length > 0 && (
                            <div className="mb-2">
                              <p className="text-sm font-medium mb-1">Timing:</p>
                              <div className="flex flex-wrap gap-1">
                                {med.timings.map((timing: string, timingIndex: number) => (
                                  <Badge key={timingIndex} variant="outline" className="text-xs">
                                    {timing}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {med.duration && (
                            <div>
                              <p className="text-sm font-medium">
                                Duration: <span className="font-normal">{med.duration}</span>
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Additional Notes */}
          {prescription.extractedData?.notes && (
            <>
              <Separator />
              <Card>
                <CardHeader>
                  <CardTitle>Additional Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{prescription.extractedData.notes}</p>
                </CardContent>
              </Card>
            </>
          )}

          {/* Original Image */}
          {prescription.imageUrl && (
            <>
              <Separator />
              <Card>
                <CardHeader>
                  <CardTitle>Original Prescription</CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={prescription.imageUrl || "/placeholder.svg"}
                    alt="Original prescription"
                    className="w-full max-w-md mx-auto rounded-lg border"
                  />
                </CardContent>
              </Card>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
