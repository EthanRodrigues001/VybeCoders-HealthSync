import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get("doctorId")

    if (!doctorId) {
      return NextResponse.json({ error: "Doctor ID is required" }, { status: 400 })
    }

    // Get all doctor-patient connections for this doctor
    const connectionsQuery = query(
      collection(db, "doctorPatientConnections"),
      where("doctorId", "==", doctorId),
      where("status", "==", "approved"),
    )

    const connectionsSnapshot = await getDocs(connectionsQuery)
    const patientIds = connectionsSnapshot.docs.map((doc) => doc.data().patientId)

    if (patientIds.length === 0) {
      return NextResponse.json({ patients: [] })
    }

    // Get patient profiles for connected patients
    const patientsQuery = query(collection(db, "users"), where("uid", "in", patientIds), where("role", "==", "patient"))

    const patientsSnapshot = await getDocs(patientsQuery)
    const patients = patientsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Get prescription counts for each patient
    const patientsWithData = await Promise.all(
      patients.map(async (patient) => {
        const prescriptionsQuery = query(collection(db, "prescriptions"), where("userId", "==", patient.uid))
        const prescriptionsSnapshot = await getDocs(prescriptionsQuery)

        return {
          ...patient,
          prescriptionCount: prescriptionsSnapshot.size,
          lastVisit: prescriptionsSnapshot.docs.length > 0 ? prescriptionsSnapshot.docs[0].data().createdAt : null,
        }
      }),
    )

    return NextResponse.json({ patients: patientsWithData })
  } catch (error) {
    console.error("Error fetching doctor patients:", error)
    return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 })
  }
}
