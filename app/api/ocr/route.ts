import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, imageData, userId } = await request.json()

    if (!imageUrl && !imageData) {
      return NextResponse.json({ error: "Image URL or image data is required" }, { status: 400 })
    }

    const formData = new FormData()

    if (imageData) {
      // Convert base64 to blob for the new API
      const base64Data = imageData.split(",")[1]
      const byteCharacters = atob(base64Data)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: "image/jpeg" })
      formData.append("image", blob, "prescription.jpg")
    } else if (imageUrl) {
      // Fetch image from URL and convert to blob
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      formData.append("image", blob, "prescription.jpg")
    }

    const ocrResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/prescription-ocr`,
      {
        method: "POST",
        body: formData,
      },
    )

    const extractedData = await ocrResponse.json()

    if (userId) {
      await addDoc(collection(db, "prescriptions"), {
        userId,
        extractedData,
        imageUrl: imageUrl || null,
        uploadedAt: serverTimestamp(),
        createdAt: new Date().toISOString(),
      })
    }

    return NextResponse.json({ data: extractedData })
  } catch (error) {
    console.error("OCR processing error:", error)
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 })
  }
}
