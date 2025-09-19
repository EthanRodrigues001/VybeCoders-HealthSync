"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { FileText, Download, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { downloadPrescriptionPDF } from "@/lib/pdf-generator"

interface Symptom {
  text: string
  severity: "mild" | "moderate" | "severe"
  notes?: string
}

interface Diagnosis {
  text: string
  icd10: string | null
  confidence: number
}

interface Medication {
  name: string
  dose: string
  timing: string
  duration_days: number
  instructions: string
}

interface PrescriptionData {
  symptoms: Symptom[]
  diagnoses: Diagnosis[]
  medications: Medication[]
}

interface PrescriptionDisplayProps {
  prescription: PrescriptionData
  doctorInfo: any
  patientInfo: any
}

export function PrescriptionDisplay({ prescription, doctorInfo, patientInfo }: PrescriptionDisplayProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "mild":
        return "bg-green-100 text-green-800 border-green-200"
      case "moderate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "severe":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600"
    if (confidence >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true)

    try {
      // Use client-side PDF generation for better performance
      downloadPrescriptionPDF(prescription, doctorInfo, patientInfo)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF. Please try again.")
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-accent" />
            <CardTitle className="text-card-foreground">Generated Prescription</CardTitle>
          </div>
          <Button onClick={handleDownloadPDF} className="flex items-center gap-2" disabled={isGeneratingPDF}>
            <Download className="h-4 w-4" />
            {isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
          </Button>
        </div>
        <CardDescription>AI-processed prescription based on voice input</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Patient & Doctor Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <h4 className="font-semibold text-card-foreground mb-2">Patient</h4>
            <p className="text-sm text-muted-foreground">
              {patientInfo.name || "Not provided"} • Age: {patientInfo.age || "N/A"} • {patientInfo.gender || "N/A"}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-card-foreground mb-2">Doctor</h4>
            <p className="text-sm text-muted-foreground">
              {doctorInfo.name || "Not provided"} • License: {doctorInfo.license || "N/A"}
            </p>
          </div>
        </div>

        {/* Symptoms */}
        {prescription.symptoms.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-card-foreground mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-accent" />
              Symptoms
            </h3>
            <div className="space-y-2">
              {prescription.symptoms.map((symptom, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                  <Badge className={getSeverityColor(symptom.severity)}>{symptom.severity}</Badge>
                  <span className="text-card-foreground">{symptom.text}</span>
                  {symptom.notes && <span className="text-sm text-muted-foreground">({symptom.notes})</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Diagnoses */}
        {prescription.diagnoses.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-card-foreground mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-accent" />
              Diagnoses
            </h3>
            <div className="space-y-2">
              {prescription.diagnoses.map((diagnosis, index) => (
                <div key={index} className="p-3 bg-background rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-card-foreground">{diagnosis.text}</span>
                    <span className={`text-sm font-medium ${getConfidenceColor(diagnosis.confidence)}`}>
                      {Math.round(diagnosis.confidence * 100)}% confidence
                    </span>
                  </div>
                  {diagnosis.icd10 && <span className="text-sm text-muted-foreground">ICD-10: {diagnosis.icd10}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Medications */}
        {prescription.medications.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-card-foreground mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent" />
              Prescribed Medications
            </h3>
            <div className="space-y-4">
              {prescription.medications.map((medication, index) => (
                <div key={index} className="p-4 bg-background rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-card-foreground text-lg">{medication.name}</h4>
                    <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                      {medication.duration_days} days
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Dosage:</span>
                      <p className="text-card-foreground">{medication.dose}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Timing:</span>
                      <p className="text-card-foreground">{medication.timing}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Instructions:</span>
                    <p className="text-card-foreground text-sm mt-1 leading-relaxed">{medication.instructions}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            This prescription was generated using AI assistance. Please review all details carefully before use.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
