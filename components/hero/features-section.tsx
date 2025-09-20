import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowUp, BarChart3, FileText, Globe, Mic, Plus, Shield, Sparkles, Users } from 'lucide-react'

const DOCTOR_AVATAR = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face'
const PATIENT_AVATAR = 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face'
const ADMIN_AVATAR = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
const NURSE_AVATAR = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face'

export default function HealthSyncFeaturesSection() {
    return (
        <section>
            <div className="py-24">
                <div className="mx-auto w-full max-w-5xl px-6">
                    <div>
                        <h2 className="text-foreground max-w-2xl text-balance text-4xl font-semibold">
                            Revolutionizing Healthcare Data Management
                        </h2>
                        <p className="text-muted-foreground mt-4 max-w-2xl text-lg">
                            AI-powered solutions that connect doctors, patients, and healthcare systems while ensuring complete privacy and security.
                        </p>
                    </div>
                    <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

                        {/* AI Transcription for Doctors */}
                        <Card
                            variant="soft"
                            className="overflow-hidden p-6 gap-1">
                            <Mic className="text-primary size-5" />
                            <h3 className="text-foreground mt-5 text-lg font-semibold">AI Voice Transcription</h3>
                            <p className="text-muted-foreground mt-3 text-balance">
                                Doctors dictate prescriptions and medical notes - our AI instantly converts speech to structured digital records.
                            </p>

                            <VoiceTranscriptionIllustration />
                        </Card>

                        {/* OCR for Patients */}
                        <Card
                            variant="soft"
                            className="group overflow-hidden px-6 pt-6 gap-1">
                            <FileText className="text-primary size-5" />
                            <h3 className="text-foreground mt-5 text-lg font-semibold">Smart OCR Digitization</h3>
                            <p className="text-muted-foreground mt-3 text-balance">
                                Patients can upload old prescriptions and medical records - AI extracts and organizes all medical data.
                            </p>

                            <OCRDigitizationIllustration />
                        </Card>

                        {/* Analytics for Government */}
                        <Card
                            variant="soft"
                            className="group overflow-hidden px-6 pt-6 gap-1">
                            <BarChart3 className="text-primary size-5" />
                            <h3 className="text-foreground mt-5 text-lg font-semibold">Privacy-First Analytics</h3>
                            <p className="text-muted-foreground mt-3 text-balance">
                                Anonymized health insights for government monitoring while keeping individual data completely private and secure.
                            </p>

                            <div className="mask-b-from-50 -mx-2 -mt-2 px-2 pt-2">
                                <AnalyticsIllustration />
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    )
}

const VoiceTranscriptionIllustration = () => {
    return (
        <Card
            aria-hidden
            className="mt-9 aspect-video p-4">
            <div className="mb-3 flex items-center gap-2">
                <div className="bg-background size-6 rounded-full border p-0.5 shadow shadow-zinc-950/5">
                    <img
                        className="aspect-square rounded-full object-cover"
                        src={DOCTOR_AVATAR}
                        alt="Dr. Sarah"
                        height="400"
                        width="400"
                    />
                </div>
                <div className="flex-1">
                    <div className="text-sm font-semibold">Dr. Sarah Johnson</div>
                    <div className="text-xs text-muted-foreground">Cardiologist</div>
                </div>
                <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-red-500">Recording</span>
                </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 mb-3">
                <div className="flex items-center space-x-2 mb-2">
                    <Mic className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Voice Input</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                    "Prescribe Metformin 500mg twice daily..."
                </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                    <FileText className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">AI Transcribed</span>
                </div>
                <div className="space-y-1">
                    <div className="bg-green-200 dark:bg-green-700 h-2 rounded-full w-4/5"></div>
                    <div className="bg-green-200 dark:bg-green-700 h-2 rounded-full w-3/5"></div>
                    <div className="bg-green-200 dark:bg-green-700 h-2 rounded-full w-1/2"></div>
                </div>
            </div>
        </Card>
    )
}

const OCRDigitizationIllustration = () => {
    return (
        <div
            aria-hidden
            className="relative mt-6">
            <Card className="aspect-video w-4/5 translate-y-4 p-3 transition-transform duration-200 ease-in-out group-hover:-rotate-3">
                <div className="mb-3 flex items-center gap-2">
                    <div className="bg-background size-6 rounded-full border p-0.5 shadow shadow-zinc-950/5">
                        <img
                            className="aspect-square rounded-full object-cover"
                            src={PATIENT_AVATAR}
                            alt="Patient"
                            height="400"
                            width="400"
                        />
                    </div>
                    <span className="text-muted-foreground text-sm font-medium">Maria Rodriguez</span>
                    <span className="text-muted-foreground/75 text-xs">Patient</span>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-2 mb-2">
                    <div className="text-xs text-orange-600 dark:text-orange-400 font-medium mb-1">Old Prescription</div>
                    <div className="bg-orange-200 dark:bg-orange-700 h-1.5 rounded-full mb-1"></div>
                    <div className="bg-orange-200 dark:bg-orange-700 h-1.5 rounded-full w-3/4 mb-1"></div>
                    <div className="bg-orange-200 dark:bg-orange-700 h-1.5 rounded-full w-1/2"></div>
                </div>

                <div className="flex items-center space-x-2 text-xs text-green-600 dark:text-green-400">
                    <Sparkles className="h-3 w-3" />
                    <span>AI Processing...</span>
                </div>
            </Card>

            <Card className="aspect-3/5 absolute -top-4 right-0 flex w-2/5 translate-y-4 p-2 transition-transform duration-200 ease-in-out group-hover:rotate-3">
                <div className="m-auto text-center">
                    <FileText className="h-6 w-6 text-green-500 mx-auto mb-2" />
                    <div className="text-xs text-green-600 dark:text-green-400 font-medium">Digitized</div>
                    <div className="space-y-1 mt-2">
                        <div className="bg-green-200 dark:bg-green-700 h-1 rounded-full"></div>
                        <div className="bg-green-200 dark:bg-green-700 h-1 rounded-full w-3/4"></div>
                        <div className="bg-green-200 dark:bg-green-700 h-1 rounded-full w-1/2"></div>
                    </div>
                </div>
            </Card>
        </div>
    )
}

const AnalyticsIllustration = () => {
    return (
        <Card
            aria-hidden
            className="mt-6 aspect-video translate-y-4 p-4 pb-6 transition-transform duration-200 group-hover:translate-y-0">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">Health Analytics Dashboard</span>
                </div>
                <div className="text-xs text-green-600 dark:text-green-400 flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Privacy Protected</span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded text-center">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">89%</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Vaccination</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/30 p-2 rounded text-center">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">12K</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Records</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/30 p-2 rounded text-center">
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">24/7</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Monitoring</div>
                </div>
            </div>

            <div className="bg-foreground/5 -mx-3 -mb-3 space-y-3 rounded-lg p-3">
                <div className="text-muted-foreground text-sm flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Anonymized Population Health Insights</span>
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex space-x-1">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="w-6 h-3 bg-gradient-to-r from-blue-400 to-green-400 rounded-full opacity-80"></div>
                        ))}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Zero Personal Data</div>
                </div>
            </div>
        </Card>
    )
}