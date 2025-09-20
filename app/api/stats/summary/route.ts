// app/api/stats/summary/route.ts
import { NextResponse } from "next/server";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const from = url.searchParams.get("from"); // optional ISO date
    const to = url.searchParams.get("to"); // optional ISO date

    // Basic query: get all prescriptions (we'll filter client-side if date range provided)
    const q = query(
      collection(db, "prescriptions"),
      orderBy("uploadedAt", "desc")
    );
    const snap = await getDocs(q);

    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Filter by date if requested (uploadedAt may be timestamp object or createdAt string)
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;

    const filtered = docs.filter((doc: any) => {
      let uploaded: Date | null = null;
      if (doc.uploadedAt?.seconds) {
        uploaded = new Date(doc.uploadedAt.seconds * 1000);
      } else if (doc.createdAt) {
        uploaded = new Date(doc.createdAt);
      }
      if (!uploaded) return false;
      if (fromDate && uploaded < fromDate) return false;
      if (toDate && uploaded > toDate) return false;
      return true;
    });

    const totalPrescriptions = filtered.length;

    // Unique patient count (userId or patientId)
    const patientIdSet = new Set<string>();
    filtered.forEach((p: any) => {
      if (p.userId) patientIdSet.add(p.userId);
      if (p.patientId) patientIdSet.add(p.patientId);
    });

    const uniquePatients = patientIdSet.size;

    // Top clinics by extractedData.doctorInfo.clinic
    const clinicCounts: Record<string, number> = {};
    filtered.forEach((p: any) => {
      const clinic = p.extractedData?.doctorInfo?.clinic || null;
      if (clinic) {
        clinicCounts[clinic] = (clinicCounts[clinic] || 0) + 1;
      }
    });

    const topClinics = Object.entries(clinicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([clinic, count]) => ({ clinic, count }));

    // Prescriptions per day (last 30 days)
    const dayCounts: Record<string, number> = {};
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 29); // 30-day window

    filtered.forEach((p: any) => {
      let uploaded: Date | null = null;
      if (p.uploadedAt?.seconds)
        uploaded = new Date(p.uploadedAt.seconds * 1000);
      else if (p.createdAt) uploaded = new Date(p.createdAt);
      if (!uploaded) return;
      const day = uploaded.toISOString().split("T")[0];
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });

    // Build time series for last 30 days with zeros for missing days
    const series: { date: string; count: number }[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(now.getDate() - (29 - i));
      const key = d.toISOString().split("T")[0];
      series.push({ date: key, count: dayCounts[key] || 0 });
    }

    return NextResponse.json({
      totalPrescriptions,
      uniquePatients,
      topClinics,
      prescriptionsTimeSeries: series,
    });
  } catch (err) {
    console.error("Error in /api/stats/summary:", err);
    return NextResponse.json(
      { error: "Failed to compute summary" },
      { status: 500 }
    );
  }
}
