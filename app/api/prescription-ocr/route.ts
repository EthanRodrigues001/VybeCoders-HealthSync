import { type NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

const prescriptionSchema = z.object({
  doctorInfo: z.object({
    name: z.string().describe("Doctor name extracted from prescription"),
    clinic: z.string().describe("Clinic or hospital name"),
    phone: z.string().describe("Doctor or clinic phone number"),
    license: z.string().describe("Medical license number if visible"),
  }),
  patientInfo: z.object({
    name: z.string().describe("Patient name"),
    age: z.string().describe("Patient age"),
    gender: z.string().describe("Patient gender"),
    phone: z.string().describe("Patient phone number if available"),
    address: z.string().describe("Patient address if available"),
  }),
  symptoms: z
    .array(
      z.object({
        symptom: z.string().describe("Symptom description"),
        severity: z
          .enum(["mild", "moderate", "severe"])
          .describe("Symptom severity level"),
        duration: z.string().describe("How long the symptom has been present"),
      })
    )
    .describe("List of symptoms mentioned in prescription"),
  diagnoses: z
    .array(
      z.object({
        diagnosis: z.string().describe("Medical diagnosis"),
        confidence: z
          .number()
          .min(0)
          .max(100)
          .describe("Confidence level in diagnosis (0-100)"),
        icd10: z.string().describe("ICD-10 code if applicable"),
      })
    )
    .describe("Medical diagnoses from prescription"),
  medications: z
    .array(
      z.object({
        name: z.string().describe("Medication name (corrected if misspelled)"),
        dosage: z.string().describe("Dosage amount and strength"),
        frequency: z
          .string()
          .describe("How often to take (e.g., twice daily, every 8 hours)"),
        duration: z.string().describe("How long to take the medication"),
        instructions: z
          .string()
          .describe("Special instructions for taking the medication"),
      })
    )
    .describe("Prescribed medications with details"),
});

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Starting image prescription processing");

    const formData = await request.formData();
    const image = formData.get("image") as File;

    if (!image) {
      console.log("[v0] No image provided in request");
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    console.log("[v0] Image received:", image.name, image.size, "bytes");

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error(
        "[v0] Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable"
      );
      return NextResponse.json(
        {
          error:
            "Google AI integration not configured. Please add GOOGLE_GENERATIVE_AI_API_KEY to your environment variables.",
        },
        { status: 500 }
      );
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = image.type;

    console.log(
      "[v0] Processing prescription image with Gemini Flash, image type:",
      mimeType
    );

    const { object } = await generateObject({
      model: google("gemini-1.5-flash"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are a medical AI assistant specialized in analyzing prescription images. Please extract all information from this prescription image with high accuracy.

CRITICAL INSTRUCTIONS:
1. **Medicine Names**: Pay special attention to medication names. Common corrections:
   - "amox zelend" → "Amoxicillin"
   - "paracetmol" → "Paracetamol"
   - "azithromycn" → "Azithromycin"
   - "ciprofloxacn" → "Ciprofloxacin"
   - "metformn" → "Metformin"
   - Always use the correct generic or brand name
   - also symbols like 1-1-1 is for 3 time a day, 1-1 is for twice a day, 0-1-0 is for once a day

2. **Doctor Information**: Extract doctor name, clinic/hospital name, phone number, and medical license number if visible

3. **Patient Information**: Extract patient name, age, gender, phone number, and address if available

4. **Medical Content**: 
   - Identify all symptoms mentioned
   - Determine diagnoses with confidence levels
   - List all medications with complete dosage information
   - Include special instructions for each medication

5. **Language Handling**: 
   - If text is in Hindi/Hinglish, translate to English
   - Preserve all medical information during translation
   - Use standard medical terminology

6. **Accuracy**: 
   - If information is unclear or not visible, use empty string ""
   - Don't make assumptions about missing information
   - Focus on what's clearly readable in the image

Please analyze this prescription image thoroughly and extract all available information.`,
            },
            {
              type: "image",
              image: `data:${mimeType};base64,${base64}`,
            },
          ],
        },
      ],
      schema: prescriptionSchema,
      temperature: 0.1, // Low temperature for consistent medical terminology
    });

    console.log("[v0] Successfully processed prescription image");

    return NextResponse.json(object);
  } catch (error) {
    console.error("[v0] Error processing prescription image:", error);

    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return NextResponse.json(
          {
            error:
              "Google AI API key is invalid or missing. Please check your GOOGLE_GENERATIVE_AI_API_KEY environment variable.",
          },
          { status: 500 }
        );
      }
      if (
        error.message.includes("quota") ||
        error.message.includes("exceeded")
      ) {
        return NextResponse.json(
          {
            error:
              "Google AI API quota exceeded. Please wait a few minutes and try again, or upgrade your Google AI API plan for higher limits.",
            details:
              "Free tier limits: 15 requests per minute, 1,500 requests per day. Consider upgrading for production use.",
          },
          { status: 429 }
        );
      }
      if (error.message.includes("RESOURCE_EXHAUSTED")) {
        return NextResponse.json(
          {
            error:
              "API resources temporarily exhausted. Please try again in a few minutes.",
          },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      {
        error:
          "Failed to process prescription image. Please try again or check if the image is clear and readable.",
      },
      { status: 500 }
    );
  }
}
