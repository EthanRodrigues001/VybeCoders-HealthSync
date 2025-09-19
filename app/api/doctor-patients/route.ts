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
    const connectionsQuery = query(collection(db, "patientDoctors"), where("doctorId", "==", doctorId))

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

    const patientsWithData = await Promise.all(
      patients.map(async (patient) => {
        const prescriptionsQuery1 = query(collection(db, "prescriptions"), where("patientId", "==", patient.uid))
        const prescriptionsQuery2 = query(collection(db, "prescriptions"), where("userId", "==", patient.uid))

        const [prescriptionsSnapshot1, prescriptionsSnapshot2] = await Promise.all([
          getDocs(prescriptionsQuery1),
          getDocs(prescriptionsQuery2),
        ])

        const totalPrescriptions = prescriptionsSnapshot1.size + prescriptionsSnapshot2.size
        const allDocs = [...prescriptionsSnapshot1.docs, ...prescriptionsSnapshot2.docs]

        return {
          ...patient,
          prescriptionCount: totalPrescriptions,
          lastVisit: allDocs.length > 0 ? allDocs[0].data().createdAt : null,
        }
      }),
    )

    return NextResponse.json({ patients: patientsWithData })
  } catch (error) {
    console.error("Error fetching doctor patients:", error)
    return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 })
  }
}
