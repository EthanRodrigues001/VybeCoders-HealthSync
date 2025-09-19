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
      collection(db, "patientDoctors"),
      where("doctorId", "==", doctorId),
      where("patientId", "==", patientId),
    )

    const connectionSnapshot = await getDocs(connectionQuery)

    if (connectionSnapshot.empty) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const prescriptionsQuery1 = query(
      collection(db, "prescriptions"),
      where("patientId", "==", patientId),
      orderBy("createdAt", "desc"),
    )

    const prescriptionsQuery2 = query(
      collection(db, "prescriptions"),
      where("userId", "==", patientId),
      orderBy("createdAt", "desc"),
    )

    const [prescriptionsSnapshot1, prescriptionsSnapshot2] = await Promise.all([
      getDocs(prescriptionsQuery1),
      getDocs(prescriptionsQuery2),
    ])

    const prescriptions1 = prescriptionsSnapshot1.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    const prescriptions2 = prescriptionsSnapshot2.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    const allPrescriptions = [...prescriptions1, ...prescriptions2]
    const uniquePrescriptions = allPrescriptions.filter(
      (prescription, index, self) => index === self.findIndex((p) => p.id === prescription.id),
    )

    return NextResponse.json({ prescriptions: uniquePrescriptions })
  } catch (error) {
    console.error("Error fetching patient records:", error)
    return NextResponse.json({ error: "Failed to fetch patient records" }, { status: 500 })
  }
}
