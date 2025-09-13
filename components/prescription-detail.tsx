"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { X, Download, Calendar, User, MapPin, Phone, Activity, Weight, Heart } from "lucide-react"

interface PrescriptionDetailProps {
  prescription: any
  onClose: () => void
}

export function PrescriptionDetail({ prescription, onClose }: PrescriptionDetailProps) {
  const handleDownload = () => {
    if (prescription.imageUrl) {
      window.open(prescription.imageUrl, "_blank")
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

          {prescription.extractedData?.doctorInfo && prescription.extractedData?.patientVitals && <Separator />}

          {/* Patient Vitals */}
          {prescription.extractedData?.patientVitals && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="h-5 w-5" />
                  Patient Vitals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {prescription.extractedData.patientVitals.weight && (
                    <div className="flex items-center gap-2">
                      <Weight className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Weight</p>
                        <p className="text-sm text-muted-foreground">
                          {prescription.extractedData.patientVitals.weight}
                        </p>
                      </div>
                    </div>
                  )}
                  {prescription.extractedData.patientVitals.bloodPressure && (
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Blood Pressure</p>
                        <p className="text-sm text-muted-foreground">
                          {prescription.extractedData.patientVitals.bloodPressure}
                        </p>
                      </div>
                    </div>
                  )}
                  {prescription.extractedData.patientVitals.temperature && (
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Temperature</p>
                        <p className="text-sm text-muted-foreground">
                          {prescription.extractedData.patientVitals.temperature}
                        </p>
                      </div>
                    </div>
                  )}
                  {prescription.extractedData.patientVitals.pulse && (
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Pulse</p>
                        <p className="text-sm text-muted-foreground">
                          {prescription.extractedData.patientVitals.pulse}
                        </p>
                      </div>
                    </div>
                  )}
                  {prescription.extractedData.patientVitals.height && (
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Height</p>
                        <p className="text-sm text-muted-foreground">
                          {prescription.extractedData.patientVitals.height}
                        </p>
                      </div>
                    </div>
                  )}
                  {prescription.extractedData.patientVitals.bmi && (
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">BMI</p>
                        <p className="text-sm text-muted-foreground">{prescription.extractedData.patientVitals.bmi}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
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
          {prescription.extractedData?.prescriptions && prescription.extractedData.prescriptions.length > 0 && (
            <>
              <Separator />
              <Card>
                <CardHeader>
                  <CardTitle>Prescribed Medications</CardTitle>
                  <CardDescription>
                    {prescription.extractedData.prescriptions.length} medication(s) prescribed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {prescription.extractedData.prescriptions.map((med: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-lg">{med.medication}</h4>
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
