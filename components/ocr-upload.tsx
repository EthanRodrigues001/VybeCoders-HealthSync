"use client"

import type React from "react"

import { useState } from "react"
import { useUploadThing } from "@/lib/uploadthing-hooks"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Scan, Upload, FileText, Download, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface ExtractedData {
  date: string | null
  doctorInfo: {
    name: string | null
    clinic: string | null
    address: string | null
    phone: string | null
  }
  patientVitals: {
    weight: string | null
    bloodPressure: string | null
    temperature: string | null
    pulse: string | null
    height: string | null
    bmi: string | null
  } | null
  prescriptions: Array<{
    medication: string
    dosage: string | null
    timings: string[]
    duration: string | null
  }>
  notes: string | null
}

interface ProcessedDocument {
  id: string
  fileName: string
  fileUrl: string
  extractedData: ExtractedData
  uploadedAt: Date
  status: "processing" | "completed" | "error"
}

interface OCRUploadProps {
  onUploadComplete?: () => void
}

export function OCRUpload({ onUploadComplete }: OCRUploadProps) {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<ProcessedDocument[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const { startUpload, isUploading } = useUploadThing("medicalDocuments", {
    onClientUploadComplete: async (res) => {
      if (res && res[0]) {
        await processDocument(res[0].url, res[0].name)
      }
    },
    onUploadError: (error) => {
      console.error("Upload error:", error)
    },
  })

  const processDocument = async (fileUrl: string, fileName: string) => {
    setIsProcessing(true)

    try {
      const response = await fetch(fileUrl)
      const blob = await response.blob()
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(blob)
      })

      const ocrResponse = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageData: base64,
          imageUrl: fileUrl,
          userId: user?.uid,
        }),
      })

      const { data } = await ocrResponse.json()

      const newDoc: ProcessedDocument = {
        id: Date.now().toString(), // Temporary ID for display
        fileName,
        fileUrl,
        extractedData: data,
        uploadedAt: new Date(),
        status: "completed",
      }

      setDocuments((prev) => [newDoc, ...prev])

      if (onUploadComplete) {
        onUploadComplete()
      }
    } catch (error) {
      console.error("Processing error:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      startUpload(Array.from(files))
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Medical Documents</CardTitle>
          <CardDescription>Upload prescription images to extract and digitize the information using AI</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <div className="text-center">
              {isUploading || isProcessing ? (
                <>
                  <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
                  <p className="text-muted-foreground">{isUploading ? "Uploading..." : "Processing with AI..."}</p>
                </>
              ) : (
                <>
                  <Scan className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Upload prescription images for AI processing</p>
                  <p className="text-xs text-muted-foreground mt-2">Supports JPG, PNG files up to 10MB</p>
                  <div className="mt-4">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button asChild>
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="mr-2 h-4 w-4" />
                        Choose Files
                      </label>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Processed Documents</CardTitle>
            <CardDescription>AI-extracted information from your uploaded prescriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium">{doc.fileName}</span>
                      <Badge variant="secondary">{doc.status}</Badge>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </a>
                    </Button>
                  </div>

                  {doc.extractedData && (
                    <div className="grid gap-3 text-sm">
                      {doc.extractedData.date && (
                        <div>
                          <span className="font-medium">Date:</span> {doc.extractedData.date}
                        </div>
                      )}

                      {(doc.extractedData.doctorInfo.name || doc.extractedData.doctorInfo.clinic) && (
                        <div>
                          <span className="font-medium">Doctor:</span>{" "}
                          {doc.extractedData.doctorInfo.name && doc.extractedData.doctorInfo.name}
                          {doc.extractedData.doctorInfo.clinic && ` - ${doc.extractedData.doctorInfo.clinic}`}
                          {doc.extractedData.doctorInfo.phone && ` (${doc.extractedData.doctorInfo.phone})`}
                        </div>
                      )}

                      {doc.extractedData.patientVitals && (
                        <div>
                          <span className="font-medium">Patient Vitals:</span>
                          <div className="ml-4 text-xs space-y-1">
                            {doc.extractedData.patientVitals.weight && (
                              <div>Weight: {doc.extractedData.patientVitals.weight}</div>
                            )}
                            {doc.extractedData.patientVitals.bloodPressure && (
                              <div>Blood Pressure: {doc.extractedData.patientVitals.bloodPressure}</div>
                            )}
                            {doc.extractedData.patientVitals.temperature && (
                              <div>Temperature: {doc.extractedData.patientVitals.temperature}</div>
                            )}
                            {doc.extractedData.patientVitals.pulse && (
                              <div>Pulse: {doc.extractedData.patientVitals.pulse}</div>
                            )}
                            {doc.extractedData.patientVitals.height && (
                              <div>Height: {doc.extractedData.patientVitals.height}</div>
                            )}
                            {doc.extractedData.patientVitals.bmi && (
                              <div>BMI: {doc.extractedData.patientVitals.bmi}</div>
                            )}
                          </div>
                        </div>
                      )}

                      {doc.extractedData.prescriptions.length > 0 && (
                        <div>
                          <span className="font-medium">Prescriptions:</span>
                          <ul className="mt-1 space-y-1 ml-4">
                            {doc.extractedData.prescriptions.map((prescription, index) => (
                              <li key={index} className="text-xs">
                                <span className="font-medium">{prescription.medication}</span>
                                {prescription.dosage && ` - ${prescription.dosage}`}
                                {prescription.timings.length > 0 && ` (${prescription.timings.join(", ")})`}
                                {prescription.duration && ` for ${prescription.duration}`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {doc.extractedData.notes && (
                        <div>
                          <span className="font-medium">Notes:</span> {doc.extractedData.notes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
