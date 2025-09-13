import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get("patientId")

    if (patientId) {
      // Get patient's connected doctors
      const q = query(collection(db, "patientDoctors"), where("patientId", "==", patientId))
      const querySnapshot = await getDocs(q)
      const doctorIds = querySnapshot.docs.map((doc) => doc.data().doctorId)

      if (doctorIds.length === 0) {
        return NextResponse.json({ doctors: [] })
      }

      // Get doctor details
      const doctorsQuery = query(collection(db, "users"), where("role", "==", "doctor"))
      const doctorsSnapshot = await getDocs(doctorsQuery)
      const connectedDoctors = doctorsSnapshot.docs
        .filter((doc) => doctorIds.includes(doc.id))
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

      return NextResponse.json({ doctors: connectedDoctors })
    } else {
      // Get all doctors for search
      const q = query(collection(db, "users"), where("role", "==", "doctor"))
      const querySnapshot = await getDocs(q)
      const doctors = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      return NextResponse.json({ doctors })
    }
  } catch (error) {
    console.error("Error fetching doctors:", error)
    return NextResponse.json({ error: "Failed to fetch doctors" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { patientId, doctorId } = await request.json()

    if (!patientId || !doctorId) {
      return NextResponse.json({ error: "Patient ID and Doctor ID are required" }, { status: 400 })
    }

    await addDoc(collection(db, "patientDoctors"), {
      patientId,
      doctorId,
      connectedAt: serverTimestamp(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error connecting doctor:", error)
    return NextResponse.json({ error: "Failed to connect doctor" }, { status: 500 })
  }
}
