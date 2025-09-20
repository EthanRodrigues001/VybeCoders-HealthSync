"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Scan, Upload, FileText, Download, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface ExtractedData {
  doctorInfo: {
    name: string
    clinic: string
    phone: string
    license: string
    date: string
  }
  patientInfo: {
    name: string
    age: string
    gender: string
    phone: string
    address: string
  }
  symptoms: Array<{
    symptom: string
    severity: "mild" | "moderate" | "severe"
    duration: string
  }>
  diagnoses: Array<{
    diagnosis: string
    confidence: number
    icd10: string
  }>
  medications: Array<{
    name: string
    dosage: string
    frequency: string
    duration: string
    instructions: string
  }>
  transcript: string
}

interface ProcessedDocument {
  id: string
  fileName: string
  fileUrl: string
  extractedData: ExtractedData
  uploadedAt: Date
  status: "processing" | "completed" | "error"
  error?: string
}

interface OCRUploadProps {
  onUploadComplete?: () => void
}

export function OCRUpload({ onUploadComplete }: OCRUploadProps) {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<ProcessedDocument[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentFileName, setCurrentFileName] = useState<string>("")

  const processDocument = async (file: File) => {
    setError(null)
    setIsProcessing(true)
    setCurrentFileName(file.name)
    console.log("[v0] Starting direct document processing")

    const timeoutId = setTimeout(() => {
      setIsProcessing(false)
      setError("Processing timed out. Please try again.")
      setCurrentFileName("")
    }, 120000) // 2 minute timeout

    try {
      const formData = new FormData()
      formData.append("image", file)

      console.log("[v0] Calling OCR API directly")
      const ocrResponse = await fetch("/api/prescription-ocr", {
        method: "POST",
        body: formData,
      })

      if (!ocrResponse.ok) {
        const errorText = await ocrResponse.text()
        throw new Error(`OCR API failed: ${ocrResponse.statusText} - ${errorText}`)
      }

      const extractedData = await ocrResponse.json()
      console.log("[v0] OCR completed, extracted data:", extractedData)

      const fileUrl = URL.createObjectURL(file)

      const prescriptionData = {
        patientId: user?.uid,
        doctorId: extractedData.doctorInfo?.license || "patient_upload",
        type: "patient_upload",
        status: "pending_review",
        imageUrl: fileUrl, // Using blob URL temporarily
        prescriptionDate: extractedData.date || new Date().toISOString().split("T")[0],
        symptoms: extractedData.symptoms || [],
        diagnoses: extractedData.diagnoses || [],
        medications: extractedData.medications || [],
        doctorInfo: extractedData.doctorInfo || {},
        patientInfo: extractedData.patientInfo || {},
        transcript: extractedData.transcript || "",
        processedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }

      console.log("[v0] Saving prescription to database")
      const saveResponse = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prescriptionData),
      })

      if (!saveResponse.ok) {
        const errorText = await saveResponse.text()
        if (errorText.includes("Firebase") || errorText.includes("environment")) {
          throw new Error("Database configuration error. Please check Firebase environment variables.")
        }
        throw new Error(`Failed to save prescription: ${errorText}`)
      }

      const saveResult = await saveResponse.json()
      console.log("[v0] Prescription saved successfully:", saveResult)

      const newDoc: ProcessedDocument = {
        id: saveResult.id || Date.now().toString(),
        fileName: file.name,
        fileUrl,
        extractedData,
        uploadedAt: new Date(),
        status: "completed",
      }

      setDocuments((prev) => [newDoc, ...prev])

      if (onUploadComplete) {
        onUploadComplete()
      }

      clearTimeout(timeoutId)
    } catch (error) {
      console.error("[v0] Processing error:", error)
      clearTimeout(timeoutId)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setError(errorMessage)

      const fileUrl = URL.createObjectURL(file)
      const errorDoc: ProcessedDocument = {
        id: Date.now().toString(),
        fileName: file.name,
        fileUrl,
        extractedData: {} as ExtractedData,
        uploadedAt: new Date(),
        status: "error",
        error: errorMessage,
      }
      setDocuments((prev) => [errorDoc, ...prev])
    } finally {
      setIsProcessing(false)
      setCurrentFileName("")
      console.log("[v0] Processing completed")
    }
  }

  const retryProcessing = (doc: ProcessedDocument) => {
    if (doc.fileUrl && doc.fileName) {
      fetch(doc.fileUrl)
        .then((response) => response.blob())
        .then((blob) => {
          const file = new File([blob], doc.fileName, { type: blob.type })
          processDocument(file)
        })
        .catch((err) => {
          console.error("[v0] Retry error:", err)
          setError("Failed to retry processing. Please upload the file again.")
        })
    }
  }

  const clearError = () => {
    setError(null)
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      setError(null)
      const file = files[0]

      if (!file.type.startsWith("image/")) {
        setError("Please select an image file (JPG, PNG, etc.)")
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        setError("File size must be less than 10MB")
        return
      }

      await processDocument(file)
    }

    event.target.value = ""
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <div className="flex items-center space-x-2 ml-4">
              {error.includes("timed out") && (
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Retry
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={clearError}>
                Dismiss
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
        <div className="text-center">
          {isProcessing ? (
            <>
              <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
              <div>
                <p className="text-muted-foreground">Processing with AI...</p>
                {currentFileName && <p className="text-xs text-muted-foreground mt-1">Processing: {currentFileName}</p>}
                <p className="text-xs text-muted-foreground mt-2">Extracting prescription data...</p>
              </div>
            </>
          ) : (
            <>
              <Scan className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Upload prescription images for AI processing</p>
              <p className="text-xs text-muted-foreground mt-2">Supports JPG, PNG files up to 10MB</p>
              <div className="mt-4">
                <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" id="file-upload" />
                <Button asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    Choose File
                  </label>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

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
                      <Badge
                        variant={
                          doc.status === "completed" ? "secondary" : doc.status === "error" ? "destructive" : "default"
                        }
                      >
                        {doc.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          Download Original
                        </a>
                      </Button>
                      {doc.status === "error" && (
                        <Button variant="outline" size="sm" onClick={() => retryProcessing(doc)}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Retry
                        </Button>
                      )}
                    </div>
                  </div>

                  {doc.status === "error" && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {doc.error || "Failed to process this prescription. Please try uploading again."}
                      </AlertDescription>
                    </Alert>
                  )}

                  {doc.extractedData && doc.status === "completed" && (
                    <div className="grid gap-3 text-sm">
                      {doc.extractedData.doctorInfo?.name && (
                        <div>
                          <span className="font-medium">Doctor:</span> {doc.extractedData.doctorInfo.name}
                          {doc.extractedData.doctorInfo.clinic && ` - ${doc.extractedData.doctorInfo.clinic}`}
                          {doc.extractedData.doctorInfo.phone && ` (${doc.extractedData.doctorInfo.phone})`}
                        </div>
                      )}

                      {doc.extractedData.patientInfo?.name && (
                        <div>
                          <span className="font-medium">Patient:</span> {doc.extractedData.patientInfo.name}
                          {doc.extractedData.patientInfo.age && `, Age: ${doc.extractedData.patientInfo.age}`}
                          {doc.extractedData.patientInfo.gender && `, ${doc.extractedData.patientInfo.gender}`}
                        </div>
                      )}

                      {doc.extractedData.symptoms && doc.extractedData.symptoms.length > 0 && (
                        <div>
                          <span className="font-medium">Symptoms:</span>
                          <ul className="mt-1 space-y-1 ml-4">
                            {doc.extractedData.symptoms.map((symptom, index) => (
                              <li key={index} className="text-xs">
                                <span className="font-medium">{symptom.symptom}</span>
                                {symptom.severity && ` (${symptom.severity})`}
                                {symptom.duration && ` - ${symptom.duration}`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {doc.extractedData.diagnoses && doc.extractedData.diagnoses.length > 0 && (
                        <div>
                          <span className="font-medium">Diagnoses:</span>
                          <ul className="mt-1 space-y-1 ml-4">
                            {doc.extractedData.diagnoses.map((diagnosis, index) => (
                              <li key={index} className="text-xs">
                                <span className="font-medium">{diagnosis.diagnosis}</span>
                                {diagnosis.confidence && ` (${diagnosis.confidence}% confidence)`}
                                {diagnosis.icd10 && ` - ${diagnosis.icd10}`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {doc.extractedData.medications && doc.extractedData.medications.length > 0 && (
                        <div>
                          <span className="font-medium">Medications:</span>
                          <ul className="mt-1 space-y-1 ml-4">
                            {doc.extractedData.medications.map((medication, index) => (
                              <li key={index} className="text-xs">
                                <span className="font-medium">{medication.name}</span>
                                {medication.dosage && ` - ${medication.dosage}`}
                                {medication.frequency && ` (${medication.frequency})`}
                                {medication.duration && ` for ${medication.duration}`}
                                {medication.instructions && (
                                  <div className="text-muted-foreground ml-2">
                                    Instructions: {medication.instructions}
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {doc.extractedData.transcript && (
                        <div>
                          <span className="font-medium">Transcript:</span>
                          <div className="text-muted-foreground ml-2">{doc.extractedData.transcript}</div>
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
