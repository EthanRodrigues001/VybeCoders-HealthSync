import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

const prescriptionSchema = z.object({
  date: z.string().nullable().describe("Date of prescription (YYYY-MM-DD format) or null if not found"),
  doctorInfo: z.object({
    name: z.string().nullable().describe("Doctor's name or null if not found"),
    clinic: z.string().nullable().describe("Clinic/hospital name or null if not found"),
    address: z.string().nullable().describe("Clinic address or null if not found"),
    phone: z.string().nullable().describe("Phone number or null if not found"),
  }),
  patientVitals: z
    .object({
      weight: z.string().nullable().describe("Patient weight (e.g., '70 kg') or null if not found"),
      bloodPressure: z
        .string()
        .nullable()
        .describe("Blood pressure reading (e.g., '120/80 mmHg') or null if not found"),
      temperature: z.string().nullable().describe("Body temperature (e.g., '98.6°F' or '37°C') or null if not found"),
      pulse: z.string().nullable().describe("Pulse rate (e.g., '72 bpm') or null if not found"),
      height: z.string().nullable().describe("Patient height (e.g., '5'8\"' or '173 cm') or null if not found"),
      bmi: z.string().nullable().describe("BMI value or null if not found"),
    })
    .nullable()
    .describe("Patient vital signs if mentioned"),
  prescriptions: z.array(
    z.object({
      medication: z.string().describe("Name of the medication"),
      dosage: z.string().nullable().describe("Dosage amount or null if not specified"),
      timings: z.array(z.string()).describe("When to take (e.g., 'before breakfast', 'after lunch', 'at bedtime')"),
      duration: z.string().nullable().describe("Duration of treatment or null if not specified"),
    }),
  ),
  notes: z.string().nullable().describe("Any additional notes or instructions from the doctor"),
})

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, imageData, userId } = await request.json()

    if (!imageUrl && !imageData) {
      return NextResponse.json({ error: "Image URL or image data is required" }, { status: 400 })
    }

    const imageContent = imageData || imageUrl

    const result = await generateObject({
      model: google("gemini-1.5-flash"),
      prompt: `Analyze this medical prescription image and extract the following information:
      1. Date of prescription (if visible)
      2. Doctor information (name, clinic, address, phone if mentioned)
      3. Patient vital signs if mentioned (weight, blood pressure, temperature, pulse, height, BMI)
      4. List of prescribed medications with dosage and timing instructions
      5. Any additional notes or special instructions
      
      Be thorough but only extract information that is clearly visible. Use null for missing information.
      Pay special attention to any vital signs, measurements, or patient health indicators that might be recorded.`,
      schema: prescriptionSchema,
      messages: [
        {
          role: "user" as const,
          content: [
            {
              type: "image",
              image: imageContent,
            },
          ],
        },
      ],
    })

    if (userId) {
      await addDoc(collection(db, "prescriptions"), {
        userId,
        extractedData: result.object,
        imageUrl: imageUrl || null,
        uploadedAt: serverTimestamp(),
        createdAt: new Date().toISOString(),
      })
    }

    return NextResponse.json({ data: result.object })
  } catch (error) {
    console.error("OCR processing error:", error)
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 })
  }
}
