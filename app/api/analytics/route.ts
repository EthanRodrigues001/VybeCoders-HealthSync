import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Starting analytics data fetch...");

    // Get all users (patients and doctors)
    const usersSnapshot = await getDocs(collection(db, "users"));
    const users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const patients = users.filter((user) => user.role === "patient");
    const doctors = users.filter((user) => user.role === "doctor");

    console.log("[v0] Found users:", {
      patients: patients.length,
      doctors: doctors.length,
    });

    // Get all prescriptions
    const prescriptionsSnapshot = await getDocs(
      collection(db, "prescriptions")
    );
    const prescriptions = prescriptionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("[v0] Found prescriptions:", prescriptions.length);

    // Process symptoms data for pie chart
    const symptomsMap = new Map<string, number>();
    prescriptions.forEach((prescription) => {
      const symptoms =
        prescription.extractedData?.symptoms || prescription.symptoms || [];
      symptoms.forEach((symptom: any) => {
        const symptomName =
          typeof symptom === "string"
            ? symptom
            : symptom.text || symptom.name || "Unknown";
        const normalizedSymptom = symptomName.toLowerCase().trim();
        symptomsMap.set(
          normalizedSymptom,
          (symptomsMap.get(normalizedSymptom) || 0) + 1
        );
      });
    });

    const totalSymptomOccurrences = Array.from(symptomsMap.values()).reduce(
      (sum, count) => sum + count,
      0
    );

    const symptomsData = Array.from(symptomsMap.entries())
      .map(([symptom, count]) => ({
        symptom: symptom.charAt(0).toUpperCase() + symptom.slice(1),
        count,
        percentage:
          totalSymptomOccurrences > 0
            ? Math.round((count / totalSymptomOccurrences) * 100)
            : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 symptoms

    console.log("[v0] Processed symptoms:", symptomsData);

    // Process medications data for bar chart
    const medicationsMap = new Map<string, number>();
    prescriptions.forEach((prescription) => {
      const medications =
        prescription.extractedData?.medications ||
        prescription.extractedData?.prescriptions ||
        prescription.medications ||
        [];
      medications.forEach((med: any) => {
        const medName = med.name || med.medication || "Unknown";
        const normalizedMed = medName.toLowerCase().trim();
        medicationsMap.set(
          normalizedMed,
          (medicationsMap.get(normalizedMed) || 0) + 1
        );
      });
    });

    const medicationsData = Array.from(medicationsMap.entries())
      .map(([medication, count]) => ({
        medication: medication.charAt(0).toUpperCase() + medication.slice(1),
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15); // Top 15 medications

    console.log("[v0] Processed medications:", medicationsData);

    // Process fever trends over 12 months
    const currentDate = new Date();
    const monthlyFeverData = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const monthName = date.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });

      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const feverCount = prescriptions.filter((prescription) => {
        const prescriptionDate = new Date(
          prescription.createdAt || prescription.prescriptionDate
        );
        const symptoms =
          prescription.extractedData?.symptoms || prescription.symptoms || [];
        const hasFever = symptoms.some((symptom: any) => {
          const symptomText =
            typeof symptom === "string"
              ? symptom
              : symptom.text || symptom.name || "";
          return (
            symptomText.toLowerCase().includes("fever") ||
            symptomText.toLowerCase().includes("temperature") ||
            symptomText.toLowerCase().includes("pyrexia")
          );
        });

        return (
          hasFever &&
          prescriptionDate >= monthStart &&
          prescriptionDate <= monthEnd
        );
      }).length;

      monthlyFeverData.push({
        month: monthName,
        patients: feverCount,
        fullMonth: date.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
      });
    }

    console.log("[v0] Processed fever trends:", monthlyFeverData);

    // Process clinics data from doctors
    const clinicsMap = new Map<string, number>();
    doctors.forEach((doctor) => {
      const clinic = doctor.clinic || doctor.hospital || "General Clinic";
      clinicsMap.set(clinic, (clinicsMap.get(clinic) || 0) + 1);
    });

    const clinicsData = Array.from(clinicsMap.entries())
      .map(([clinic, doctorCount]) => ({
        clinic,
        doctorCount,
      }))
      .sort((a, b) => b.doctorCount - a.doctorCount);

    console.log("[v0] Processed clinics:", clinicsData);

    // Calculate additional metrics
    const totalPrescriptions = prescriptions.length;
    const avgPrescriptionsPerPatient =
      patients.length > 0
        ? Math.round((totalPrescriptions / patients.length) * 10) / 10
        : 0;
    const activePatients = new Set(
      prescriptions.map((p) => p.patientId || p.userId)
    ).size;

    const analyticsData = {
      overview: {
        totalPatients: patients.length,
        totalDoctors: doctors.length,
        totalPrescriptions,
        activePatients,
        avgPrescriptionsPerPatient,
      },
      symptomsData,
      medicationsData,
      feverTrends: monthlyFeverData,
      clinicsData, // Added clinics data to response
    };

    console.log("[v0] Final analytics data:", analyticsData);

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error("[v0] Error fetching analytics data:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
