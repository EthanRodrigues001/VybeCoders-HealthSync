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

export function downloadPrescriptionPDF(prescription: PrescriptionData, doctorInfo: any, patientInfo: any) {
  // For now, create a simple text-based download
  // In a real implementation, you would use jsPDF or similar library

  const content = generatePrescriptionText(prescription, doctorInfo, patientInfo)

  // Create a blob and download it
  const blob = new Blob([content], { type: "text/plain" })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `prescription-${patientInfo.name || "patient"}-${new Date().toISOString().split("T")[0]}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

function generatePrescriptionText(prescription: PrescriptionData, doctorInfo: any, patientInfo: any): string {
  const date = new Date().toLocaleDateString()

  let content = `MEDICAL PRESCRIPTION\n`
  content += `Date: ${date}\n\n`

  content += `DOCTOR INFORMATION:\n`
  content += `Name: ${doctorInfo.name || "Not provided"}\n`
  content += `Clinic: ${doctorInfo.clinicAddress || "Not provided"}\n`
  content += `Phone: ${doctorInfo.phone || "Not provided"}\n\n`

  content += `PATIENT INFORMATION:\n`
  content += `Name: ${patientInfo.name || "Not provided"}\n`
  content += `Age: ${patientInfo.age || "Not provided"}\n`
  content += `Gender: ${patientInfo.gender || "Not provided"}\n\n`

  if (prescription.symptoms.length > 0) {
    content += `SYMPTOMS:\n`
    prescription.symptoms.forEach((symptom, index) => {
      content += `${index + 1}. ${symptom.text} (${symptom.severity})\n`
      if (symptom.notes) {
        content += `   Notes: ${symptom.notes}\n`
      }
    })
    content += `\n`
  }

  if (prescription.diagnoses.length > 0) {
    content += `DIAGNOSES:\n`
    prescription.diagnoses.forEach((diagnosis, index) => {
      content += `${index + 1}. ${diagnosis.text} (${Math.round(diagnosis.confidence * 100)}% confidence)\n`
      if (diagnosis.icd10) {
        content += `   ICD-10: ${diagnosis.icd10}\n`
      }
    })
    content += `\n`
  }

  if (prescription.medications.length > 0) {
    content += `PRESCRIBED MEDICATIONS:\n`
    prescription.medications.forEach((medication, index) => {
      content += `${index + 1}. ${medication.name}\n`
      content += `   Dosage: ${medication.dose}\n`
      content += `   Timing: ${medication.timing}\n`
      content += `   Duration: ${medication.duration_days} days\n`
      content += `   Instructions: ${medication.instructions}\n\n`
    })
  }

  content += `\nThis prescription was generated using AI assistance.\n`
  content += `Please review all details carefully before use.\n`

  return content
}
