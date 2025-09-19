import { google } from "@ai-sdk/google"
import { generateObject } from "ai"
import { z } from "zod"

// Define the prescription schema based on the user's requirements
const prescriptionSchema = z.object({
  symptoms: z.array(
    z.object({
      text: z.string(),
      severity: z.enum(["mild", "moderate", "severe"]),
      notes: z.string().optional(),
    }),
  ),
  diagnoses: z.array(
    z.object({
      text: z.string(),
      icd10: z.string().nullable(),
      confidence: z.number().min(0).max(1),
    }),
  ),
  medications: z.array(
    z.object({
      name: z.string(),
      dose: z.string(),
      timing: z.string(),
      duration_days: z.number(),
      instructions: z.string(),
    }),
  ),
})

export async function POST(req: Request) {
  try {
    const { transcript, doctorInfo, patientInfo, patientId, doctorId } = await req.json()

    if (!transcript) {
      return Response.json({ error: "Transcript is required" }, { status: 400 })
    }

    if (!patientId || !doctorId) {
      return Response.json({ error: "Patient ID and Doctor ID are required" }, { status: 400 })
    }

    const prompt = `
You are an expert medical AI assistant specializing in processing doctor's voice prescriptions into structured format. You have extensive knowledge of medical terminology, drug names, and multilingual medical communication.

Doctor Information:
- Name: ${doctorInfo.name || "Not provided"}
- Clinic: ${doctorInfo.clinicAddress || "Not provided"}
- Phone: ${doctorInfo.phone || "Not provided"}

Patient Information:
- Name: ${patientInfo.name || "Not provided"}
- Age: ${patientInfo.age || "Not provided"}
- Gender: ${patientInfo.gender || "Not provided"}

Voice Transcript from Doctor:
"${transcript}"

CRITICAL INSTRUCTIONS:

1. MULTILINGUAL PROCESSING: If the transcript contains Hindi, Hinglish, or other Indian languages, translate and convert to proper English medical terminology while preserving ALL medical information. Do not omit any symptoms, conditions, or medications mentioned.

2. MEDICAL TERMINOLOGY ACCURACY: 
   - Correct common medication name errors (e.g., "amox zelend" should be "Amoxicillin")
   - Use proper pharmaceutical names and spellings
   - Common corrections: "amoxilin/amox zelend" → "Amoxicillin", "paracetamol" → "Acetaminophen/Paracetamol", "crocin" → "Acetaminophen"
   - Recognize Indian brand names and convert to generic names when appropriate

3. SYMPTOM PRESERVATION: Extract and include ALL symptoms mentioned, regardless of language. Translate Hindi/regional language symptoms to English medical terms.

4. MEDICATION DETAILS: For each medication, provide:
   - Correct generic/brand name
   - Proper dosage with units (mg, ml, tablets)
   - Clear timing instructions
   - Duration in days
   - Route of administration if mentioned

5. DIAGNOSTIC ACCURACY: Provide confident diagnoses based on symptoms described, using proper medical terminology.

Examples of corrections:
- "amoxilin" or "amox zelend" → "Amoxicillin"
- "bukhar" (Hindi) → "fever"
- "pet mein dard" (Hindi) → "abdominal pain"
- "khasi" (Hindi) → "cough"
- "sir dard" (Hindi) → "headache"

Analyze the transcript carefully and extract structured medical information with high accuracy.
`

    const { object } = await generateObject({
      model: google("gemini-1.5-flash"),
      schema: prescriptionSchema,
      prompt,
      maxOutputTokens: 2000,
      temperature: 0.1, // Lower temperature for more consistent medical terminology
    })

    const prescriptionData = {
      patientId,
      doctorId,
      type: "voice_prescription",
      extractedData: {
        symptoms: object.symptoms,
        diagnoses: object.diagnoses,
        medications: object.medications,
        doctorInfo,
        patientInfo,
        transcript,
        processedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
    }

    // Store in database (assuming you have a prescriptions collection)
    const storeResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/prescriptions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(prescriptionData),
      },
    )

    if (!storeResponse.ok) {
      console.error("Failed to store prescription in database")
    }

    return Response.json({
      success: true,
      prescription: object,
      processedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error processing prescription:", error)

    return Response.json(
      {
        error: "Failed to process prescription",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
