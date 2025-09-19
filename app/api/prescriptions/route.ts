import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, deleteDoc, doc, orderBy, addDoc } from "firebase/firestore"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const q1 = query(collection(db, "prescriptions"), where("patientId", "==", userId), orderBy("createdAt", "desc"))
    const q2 = query(collection(db, "prescriptions"), where("userId", "==", userId), orderBy("createdAt", "desc"))

    const [querySnapshot1, querySnapshot2] = await Promise.all([getDocs(q1), getDocs(q2)])

    const prescriptions1 = querySnapshot1.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    const prescriptions2 = querySnapshot2.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    const allPrescriptions = [...prescriptions1, ...prescriptions2]
    const uniquePrescriptions = allPrescriptions.filter(
      (prescription, index, self) => index === self.findIndex((p) => p.id === prescription.id),
    )

    return NextResponse.json({ prescriptions: uniquePrescriptions })
  } catch (error) {
    console.error("Error fetching prescriptions:", error)
    return NextResponse.json({ error: "Failed to fetch prescriptions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const prescriptionData = await request.json()

    if (!prescriptionData.patientId || !prescriptionData.doctorId) {
      return NextResponse.json({ error: "Patient ID and Doctor ID are required" }, { status: 400 })
    }

    // Structure the prescription data for storage
    const prescriptionToSave = {
      patientId: prescriptionData.patientId,
      doctorId: prescriptionData.doctorId,
      type: prescriptionData.type || "voice_prescription",
      status: prescriptionData.status || "approved",
      extractedData: {
        symptoms: prescriptionData.symptoms || [],
        diagnoses: prescriptionData.diagnoses || [],
        medications: prescriptionData.medications || [],
        doctorInfo: prescriptionData.doctorInfo || {},
        patientInfo: prescriptionData.patientInfo || {},
        date: new Date().toISOString().split("T")[0], // Current date
        transcript: prescriptionData.transcript || "",
        processedAt: prescriptionData.processedAt || new Date().toISOString(),
      },
      createdAt: prescriptionData.createdAt || new Date().toISOString(),
      approvedAt: prescriptionData.approvedAt || new Date().toISOString(),
      uploadedAt: {
        seconds: Math.floor(Date.now() / 1000),
        nanoseconds: 0,
      },
    }

    const docRef = await addDoc(collection(db, "prescriptions"), prescriptionToSave)

    return NextResponse.json({
      success: true,
      id: docRef.id,
      prescription: prescriptionToSave,
    })
  } catch (error) {
    console.error("Error saving prescription:", error)
    return NextResponse.json({ error: "Failed to save prescription" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const prescriptionId = searchParams.get("id")

    if (!prescriptionId) {
      return NextResponse.json({ error: "Prescription ID is required" }, { status: 400 })
    }

    await deleteDoc(doc(db, "prescriptions", prescriptionId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting prescription:", error)
    return NextResponse.json({ error: "Failed to delete prescription" }, { status: 500 })
  }
}
