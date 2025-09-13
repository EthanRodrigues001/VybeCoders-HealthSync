import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from "firebase/firestore"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const q = query(collection(db, "prescriptions"), where("userId", "==", userId), orderBy("uploadedAt", "desc"))

    const querySnapshot = await getDocs(q)
    const prescriptions = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json({ prescriptions })
  } catch (error) {
    console.error("Error fetching prescriptions:", error)
    return NextResponse.json({ error: "Failed to fetch prescriptions" }, { status: 500 })
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
