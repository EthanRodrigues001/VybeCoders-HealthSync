// app/api/stats/medications/route.ts
import { NextResponse } from "next/server";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

function extractMedNamesFromDoc(doc: any): string[] {
  const meds: string[] = [];

  const ed = doc.extractedData || {};
  // Common shapes:
  // ed.prescriptions = [{ medication, dosage, timings, duration }]
  if (Array.isArray(ed.prescriptions)) {
    ed.prescriptions.forEach((m: any) => {
      if (m.medication) meds.push(String(m.medication).trim());
      else if (m.name) meds.push(String(m.name).trim());
    });
  }

  // ed.medications (voice-prescription route may use this)
  if (Array.isArray(ed.medications)) {
    ed.medications.forEach((m: any) => {
      if (m.name) meds.push(String(m.name).trim());
      else if (m.medication) meds.push(String(m.medication).trim());
    });
  }

  // Also top-level "medications" field (sometimes used)
  if (Array.isArray(doc.medications)) {
    doc.medications.forEach((m: any) => {
      if (typeof m === "string") meds.push(m.trim());
      else if (m.name) meds.push(String(m.name).trim());
    });
  }

  return meds.filter(Boolean);
}

export async function GET() {
  try {
    const q = query(
      collection(db, "prescriptions"),
      orderBy("uploadedAt", "desc")
    );
    const snap = await getDocs(q);
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const counts: Record<string, number> = {};

    docs.forEach((doc) => {
      const medNames = extractMedNamesFromDoc(doc);
      medNames.forEach((m) => {
        // basic normalization: lowercase, remove extra spaces
        const key = m.toLowerCase();
        counts[key] = (counts[key] || 0) + 1;
      });
    });

    const meds = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)
      .map(([name, count]) => ({ name, count }));

    return NextResponse.json({ medications: meds });
  } catch (err) {
    console.error("Error in /api/stats/medications:", err);
    return NextResponse.json(
      { error: "Failed to compute medications" },
      { status: 500 }
    );
  }
}
