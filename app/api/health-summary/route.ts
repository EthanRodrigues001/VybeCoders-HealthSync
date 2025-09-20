import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import type { NextRequest } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    const q1 = query(
      collection(db, "prescriptions"),
      where("patientId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const q2 = query(
      collection(db, "prescriptions"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const [querySnapshot1, querySnapshot2] = await Promise.all([
      getDocs(q1),
      getDocs(q2),
    ]);

    const prescriptions1 = querySnapshot1.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const prescriptions2 = querySnapshot2.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const allPrescriptions = [...prescriptions1, ...prescriptions2];
    const prescriptions = allPrescriptions.filter(
      (prescription, index, self) =>
        index === self.findIndex((p) => p.id === prescription.id)
    );

    if (prescriptions.length === 0) {
      return Response.json({
        summary:
          "No medical records available yet. Upload your first prescription to generate a comprehensive health summary.",
      });
    }

    // Prepare medical data for AI analysis
    const medicalData = prescriptions.map((prescription: any) => ({
      date:
        prescription.extractedData?.date ||
        new Date(
          prescription.uploadedAt?.seconds * 1000 || prescription.createdAt
        ).toLocaleDateString(),
      doctor:
        prescription.doctorName ||
        prescription.extractedData?.doctorInfo?.name ||
        "Unknown Doctor",
      symptoms:
        prescription.symptoms || prescription.extractedData?.symptoms || [],
      diagnoses:
        prescription.diagnoses || prescription.extractedData?.diagnoses || [],
      medications:
        prescription.medications ||
        prescription.extractedData?.prescriptions ||
        [],
      notes: prescription.extractedData?.notes || "",
    }));

    // Generate health summary using AI
    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt: `As a medical AI assistant, analyze the following patient's medical records and generate a comprehensive health summary in 3-4 paragraphs. Focus on:

1. Overall health patterns and trends
2. Common symptoms and conditions
3. Medication history and current treatments
4. Recommendations for ongoing care

Medical Records Data:
${JSON.stringify(medicalData, null, 2)}

Please provide a professional, empathetic, and informative summary that helps the patient understand their health journey. Use clear, non-technical language while maintaining medical accuracy.`,
      maxOutputTokens: 2000,
      temperature: 0.7,
    });

    return Response.json({ summary: text });
  } catch (error) {
    console.error("Error generating health summary:", error);
    return Response.json(
      { error: "Failed to generate health summary" },
      { status: 500 }
    );
  }
}
