"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Users, UserCheck, FileText, Activity, TrendingUp, Building2, Pill, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface AnalyticsData {
    overview: {
        totalPatients: number
        totalDoctors: number
        totalPrescriptions: number
        activePatients: number
        avgPrescriptionsPerPatient: number
    }
    symptomsData: Array<{
        symptom: string
        count: number
        percentage: number
    }>
    medicationsData: Array<{
        medication: string
        count: number
    }>
    feverTrends: Array<{
        month: string
        patients: number
        fullMonth: string
    }>
    clinicsData: Array<{
        clinic: string
        doctorCount: number
    }>
}

const COLORS = [
    "hsl(220, 70%, 50%)", // Blue
    "hsl(142, 76%, 36%)", // Green
    "hsl(262, 83%, 58%)", // Purple
    "hsl(346, 87%, 43%)", // Red
    "hsl(35, 91%, 62%)", // Orange
    "hsl(199, 89%, 48%)", // Cyan
    "hsl(48, 96%, 53%)", // Yellow
    "hsl(328, 85%, 70%)", // Pink
    "hsl(24, 70%, 50%)", // Brown
    "hsl(120, 60%, 50%)", // Lime
]

const exportToPDF = (data: AnalyticsData) => {
    import("jspdf")
        .then(({ default: jsPDF }) => {
            const doc = new jsPDF()
            const pageWidth = doc.internal.pageSize.width
            const pageHeight = doc.internal.pageSize.height
            let yPosition = 20

            doc.setFontSize(20)
            doc.setFont("helvetica", "bold")
            doc.text("Healthcare Analytics Report", pageWidth / 2, yPosition, { align: "center" })

            yPosition += 10
            doc.setFontSize(12)
            doc.setFont("helvetica", "normal")
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: "center" })

            yPosition += 20

            doc.setFontSize(16)
            doc.setFont("helvetica", "bold")
            doc.text("System Overview", 20, yPosition)
            yPosition += 15

            doc.setFontSize(12)
            doc.setFont("helvetica", "normal")
            const overviewData = [
                `Total Patients: ${data.overview.totalPatients}`,
                `Total Doctors: ${data.overview.totalDoctors}`,
                `Total Prescriptions: ${data.overview.totalPrescriptions}`,
                `Active Patients: ${data.overview.activePatients}`,
                `Average Prescriptions per Patient: ${data.overview.avgPrescriptionsPerPatient}`,
            ]

            overviewData.forEach((item) => {
                doc.text(item, 30, yPosition)
                yPosition += 8
            })

            yPosition += 10

            doc.setFontSize(16)
            doc.setFont("helvetica", "bold")
            doc.text("Most Common Symptoms", 20, yPosition)
            yPosition += 15

            doc.setFontSize(12)
            doc.setFont("helvetica", "normal")
            data.symptomsData.slice(0, 10).forEach((symptom, index) => {
                doc.text(`${index + 1}. ${symptom.symptom}: ${symptom.count} cases (${symptom.percentage}%)`, 30, yPosition)
                yPosition += 8

                if (yPosition > pageHeight - 60) {
                    doc.addPage()
                    yPosition = 20
                }
            })

            yPosition += 10

            doc.setFontSize(16)
            doc.setFont("helvetica", "bold")
            doc.text("Most Prescribed Medications", 20, yPosition)
            yPosition += 15

            doc.setFontSize(12)
            doc.setFont("helvetica", "normal")
            data.medicationsData.slice(0, 15).forEach((medication, index) => {
                doc.text(`${index + 1}. ${medication.medication}: ${medication.count} prescriptions`, 30, yPosition)
                yPosition += 8

                if (yPosition > pageHeight - 20) {
                    doc.addPage()
                    yPosition = 20
                }
            })

            yPosition += 10

            if (yPosition > pageHeight - 60) {
                doc.addPage()
                yPosition = 20
            }

            doc.setFontSize(16)
            doc.setFont("helvetica", "bold")
            doc.text("Healthcare Clinics", 20, yPosition)
            yPosition += 15

            doc.setFontSize(12)
            doc.setFont("helvetica", "normal")
            data.clinicsData.forEach((clinic, index) => {
                doc.text(`${index + 1}. ${clinic.clinic}: ${clinic.doctorCount} doctors`, 30, yPosition)
                yPosition += 8

                if (yPosition > pageHeight - 20) {
                    doc.addPage()
                    yPosition = 20
                }
            })

            yPosition += 10

            if (yPosition > pageHeight - 60) {
                doc.addPage()
                yPosition = 20
            }

            doc.setFontSize(16)
            doc.setFont("helvetica", "bold")
            doc.text("Fever Cases - 12 Month Summary", 20, yPosition)
            yPosition += 15

            doc.setFontSize(12)
            doc.setFont("helvetica", "normal")
            data.feverTrends.forEach((trend) => {
                doc.text(`${trend.fullMonth}: ${trend.patients} patients`, 30, yPosition)
                yPosition += 8

                if (yPosition > pageHeight - 20) {
                    doc.addPage()
                    yPosition = 20
                }
            })

            const totalPages = doc.internal.pages.length - 1
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i)
                doc.setFontSize(10)
                doc.setFont("helvetica", "normal")
                doc.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 10, { align: "right" })
                doc.text("Healthcare Analytics System - Government Report", 20, pageHeight - 10)
            }

            doc.save(`healthcare-analytics-report-${new Date().toISOString().split("T")[0]}.pdf`)
        })
        .catch((error) => {
            console.error("Error loading jsPDF:", error)
            alert("Error generating PDF. Please try again.")
        })
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchAnalyticsData()
    }, [])

    const fetchAnalyticsData = async () => {
        try {
            setLoading(true)
            console.log("[v0] Fetching analytics data...")

            const response = await fetch("/api/analytics")
            if (!response.ok) {
                throw new Error("Failed to fetch analytics data")
            }

            const analyticsData = await response.json()
            console.log("[v0] Received analytics data:", analyticsData)

            setData(analyticsData)
        } catch (err) {
            console.error("[v0] Error fetching analytics:", err)
            setError(err instanceof Error ? err.message : "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading analytics data...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <p className="text-red-600">Error: {error}</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-muted-foreground">No analytics data available</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Healthcare Analytics</h1>
                    <p className="text-muted-foreground">Comprehensive insights into patient care and medical trends</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-sm">
                        <Activity className="h-4 w-4 mr-1" />
                        Live Data
                    </Badge>
                    {data && (
                        <Button onClick={() => exportToPDF(data)} className="flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Export PDF Report
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.overview.totalPatients}</div>
                        <p className="text-xs text-muted-foreground">Registered patients</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.overview.totalDoctors}</div>
                        <p className="text-xs text-muted-foreground">Healthcare providers</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Prescriptions</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.overview.totalPrescriptions}</div>
                        <p className="text-xs text-muted-foreground">Total issued</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.overview.activePatients}</div>
                        <p className="text-xs text-muted-foreground">With prescriptions</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg per Patient</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.overview.avgPrescriptionsPerPatient}</div>
                        <p className="text-xs text-muted-foreground">Prescriptions</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Most Common Symptoms</CardTitle>
                        <CardDescription>Distribution of symptoms across all prescriptions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer
                            config={{
                                symptoms: {
                                    label: "Symptoms",
                                },
                            }}
                            className="h-[400px]"
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.symptomsData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={120}
                                        paddingAngle={2}
                                        dataKey="count"
                                    >
                                        {data.symptomsData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <ChartTooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload
                                                return (
                                                    <div className="bg-background border rounded-lg p-3 shadow-lg">
                                                        <p className="font-medium">{data.symptom}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {data.count} cases ({data.percentage}%)
                                                        </p>
                                                    </div>
                                                )
                                            }
                                            return null
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                            {data.symptomsData.slice(0, 6).map((item, index) => (
                                <div key={item.symptom} className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span className="truncate">{item.symptom}</span>
                                    <span className="text-muted-foreground">({item.count})</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Fever Cases - 12 Month Trend</CardTitle>
                        <CardDescription>Number of patients with fever symptoms by month</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer
                            config={{
                                patients: {
                                    label: "Patients with Fever",
                                    color: COLORS[0],
                                },
                            }}
                            className="h-[400px]"
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.feverTrends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                    <XAxis dataKey="month" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
                                    <YAxis />
                                    <ChartTooltip
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload
                                                return (
                                                    <div className="bg-background border rounded-lg p-3 shadow-lg">
                                                        <p className="font-medium">{data.fullMonth}</p>
                                                        <p className="text-sm text-muted-foreground">{payload[0].value} patients with fever</p>
                                                    </div>
                                                )
                                            }
                                            return null
                                        }}
                                    />
                                    <Bar dataKey="patients" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Pill className="h-5 w-5" />
                            Most Prescribed Medications
                        </CardTitle>
                        <CardDescription>Top medications prescribed across all patients</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.medicationsData.slice(0, 10).map((medication, index) => (
                                <div
                                    key={medication.medication}
                                    className="flex items-center justify-between p-3 rounded-lg border bg-card/50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium text-white"
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        >
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium">{medication.medication}</p>
                                            <p className="text-sm text-muted-foreground">Prescribed medication</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold">{medication.count}</p>
                                        <p className="text-xs text-muted-foreground">prescriptions</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Healthcare Clinics
                        </CardTitle>
                        <CardDescription>Registered clinics and their doctor count</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.clinicsData.map((clinic, index) => (
                                <div key={clinic.clinic} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium text-white"
                                            style={{ backgroundColor: COLORS[(index + 5) % COLORS.length] }}
                                        >
                                            <Building2 className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{clinic.clinic}</p>
                                            <p className="text-sm text-muted-foreground">Healthcare facility</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold">{clinic.doctorCount}</p>
                                        <p className="text-xs text-muted-foreground">doctors</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
