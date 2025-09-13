import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get("patientId")
    const doctorId = searchParams.get("doctorId")

    if (!patientId || !doctorId) {
      return NextResponse.json({ error: "Patient ID and Doctor ID are required" }, { status: 400 })
    }

    // Verify doctor has access to this patient
    const connectionQuery = query(
      collection(db, "doctorPatientConnections"),
      where("doctorId", "==", doctorId),
      where("patientId", "==", patientId),
      where("status", "==", "approved"),
    )

    const connectionSnapshot = await getDocs(connectionQuery)

    if (connectionSnapshot.empty) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Get patient's prescription records
    const prescriptionsQuery = query(
      collection(db, "prescriptions"),
      where("userId", "==", patientId),
      orderBy("createdAt", "desc"),
    )

    const prescriptionsSnapshot = await getDocs(prescriptionsQuery)
    const prescriptions = prescriptionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json({ prescriptions })
  } catch (error) {
    console.error("Error fetching patient records:", error)
    return NextResponse.json({ error: "Failed to fetch patient records" }, { status: 500 })
  }
}
