// app/api/stats/labs/route.ts
import { NextResponse } from "next/server";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Interface for Firestore prescription document
interface PrescriptionDoc {
  id: string;
  extractedData?: {
    values?: Record<string, string>;
  };
  uploadedAt?: any; // Firestore timestamp
}

function parseFirstNumber(value: string): number | null {
  if (!value) return null;
  const cleaned = String(value)
    .replace(/,/g, ".")
    .replace(/[^\d.\-]/g, " ");
  const m = cleaned.match(/-?\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
}

export async function GET() {
  try {
    const interestingLabs = ["HbA1c", "Hemoglobin", "Cholesterol"];

    const q = query(
      collection(db, "prescriptions"),
      orderBy("uploadedAt", "desc")
    );
    const snap = await getDocs(q);

    // Map Firestore docs to typed objects
    const docs: PrescriptionDoc[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<PrescriptionDoc, "id">),
    }));

    // Prepare stats container
    const stats: Record<string, { values: number[] }> = {};
    interestingLabs.forEach((k) => (stats[k] = { values: [] }));

    // Extract numeric values
    docs.forEach((doc) => {
      const values = doc.extractedData?.values || {};
      for (const key of Object.keys(values)) {
        for (const lab of interestingLabs) {
          if (key.toLowerCase().includes(lab.toLowerCase())) {
            const parsed = parseFirstNumber(values[key]);
            if (parsed !== null && !Number.isNaN(parsed))
              stats[lab].values.push(parsed);
          }
        }
      }
    });

    // Compute summary stats
    const result: Record<string, any> = {};
    for (const lab of Object.keys(stats)) {
      const arr = stats[lab].values;
      const count = arr.length;
      const mean = count ? arr.reduce((s, v) => s + v, 0) / count : null;
      result[lab] = { count, mean, samples: arr.slice(0, 100) }; // sample up to 100 values
    }

    return NextResponse.json({ labs: result });
  } catch (err) {
    console.error("Error in /api/stats/labs:", err);
    return NextResponse.json(
      { error: "Failed to compute lab stats" },
      { status: 500 }
    );
  }
}
