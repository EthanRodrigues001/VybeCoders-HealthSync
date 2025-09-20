// app/gov/dashboard/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
} from "recharts";

const GOV_PASSWORD = process.env.NEXT_PUBLIC_GOV_PASSWORD || "govpass123";

export default function GovDashboardPage() {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();
    const [authed, setAuthed] = useState<boolean>(() => {
        try {
            return localStorage.getItem("gov_authed") === "1";
        } catch {
            return false;
        }
    });

    const [summary, setSummary] = useState<any | null>(null);
    const [meds, setMeds] = useState<any[]>([]);
    const [labs, setLabs] = useState<any | null>(null);
    const [passwordInput, setPasswordInput] = useState("");

    useEffect(() => {
        // If you want to restrict to an authenticated firebase user with role 'government',
        // you could check userProfile.role === 'government'. For now we allow password gate + optional role.
        if (!authed) return;
        fetchSummary();
        fetchMeds();
        fetchLabs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authed]);

    useEffect(() => {
        // optional: redirect non-logged in users to homepage or allow gov access without login
        // If you want to require Firebase login with government role, uncomment:
        // if (!loading && user && userProfile?.role !== "government") router.push("/");
    }, [user, userProfile, loading, router]);

    async function fetchSummary() {
        const res = await fetch("/api/stats/summary");
        const json = await res.json();
        setSummary(json);
    }

    async function fetchMeds() {
        const res = await fetch("/api/stats/medications");
        const json = await res.json();
        setMeds(json.medications || []);
    }

    async function fetchLabs() {
        const res = await fetch("/api/stats/labs");
        const json = await res.json();
        setLabs(json.labs || null);
    }

    function handlePasswordSubmit() {
        if (passwordInput === GOV_PASSWORD) {
            localStorage.setItem("gov_authed", "1");
            setAuthed(true);
        } else {
            alert("Incorrect password");
        }
    }

    // Prepare chart data
    const medsBar = useMemo(() => meds.slice(0, 10).map((m) => ({ name: m.name, count: m.count })), [meds]);
    const timeSeries = useMemo(() => summary?.prescriptionsTimeSeries || [], [summary]);

    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A78BFA", "#60A5FA", "#34D399"];

    if (!authed) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <Card className="max-w-lg w-full">
                    <CardHeader>
                        <CardTitle>Government Login</CardTitle>
                        <CardDescription>Enter the simple password to view anonymized analytics</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <input
                                type="password"
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                placeholder="Enter password"
                                className="w-full border p-2 rounded"
                            />
                            <div className="flex gap-2">
                                <Button onClick={handlePasswordSubmit}>Enter</Button>
                                <Button variant="ghost" onClick={() => router.push("/")}>Cancel</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Government Dashboard — Anonymized Health Stats</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Total records</CardTitle>
                        <CardDescription>Number of prescription documents</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{summary?.totalPrescriptions ?? "-"}</div>
                        <div className="text-sm text-muted-foreground">Unique patients: {summary?.uniquePatients ?? "-"}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top Clinics</CardTitle>
                        <CardDescription>Most active clinics (anonymized)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm">
                            {summary?.topClinics?.length ? (
                                summary.topClinics.slice(0, 5).map((c: any, i: number) => (
                                    <li key={i} className="flex justify-between">
                                        <span className="truncate max-w-[70%]">{c.clinic}</span>
                                        <span className="font-medium">{c.count}</span>
                                    </li>
                                ))
                            ) : (
                                <li>No clinic data</li>
                            )}
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Medications (top)</CardTitle>
                        <CardDescription>Top prescribed medications</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm">
                            {medsBar.length ? (
                                medsBar.map((m, i) => (
                                    <li key={m.name} className="flex justify-between">
                                        <span className="truncate max-w-[70%]">{m.name}</span>
                                        <span className="font-medium">{m.count}</span>
                                    </li>
                                ))
                            ) : (
                                <li>No medications data</li>
                            )}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="h-96">
                    <CardHeader>
                        <CardTitle>Prescriptions (30-day)</CardTitle>
                        <CardDescription>Number of prescriptions per day (last 30 days)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={timeSeries}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Area type="monotone" dataKey="count" stroke="#8884d8" fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="h-96">
                    <CardHeader>
                        <CardTitle>Top Medications</CardTitle>
                        <CardDescription>Bar chart of top meds</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={medsBar}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#60a5fa" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Lab Averages</CardTitle>
                        <CardDescription>Simple mean for selected labs (anonymized)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {labs ? (
                            <ul className="space-y-2">
                                {Object.entries(labs).map(([lab, info]: any, idx) => (
                                    <li key={lab} className="flex justify-between">
                                        <span>{lab}</span>
                                        <span className="font-medium">{info?.mean ? Number(info.mean).toFixed(2) : "—"} ({info.count})</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div>No lab data</div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Medication share (pie)</CardTitle>
                        <CardDescription>Top 6 medication share</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie
                                    data={medsBar.slice(0, 6)}
                                    dataKey="count"
                                    nameKey="name"
                                    outerRadius={90}
                                    fill="#8884d8"
                                    label={(entry) => entry.name}
                                >
                                    {medsBar.slice(0, 6).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}