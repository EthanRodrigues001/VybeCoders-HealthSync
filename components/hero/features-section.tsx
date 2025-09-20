import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowUp, BarChart3, FileText, Globe, Mic, Plus, Shield, Sparkles, Users } from 'lucide-react'

const DOCTOR_AVATAR = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face'
const PATIENT_AVATAR = 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
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

                        {/* AI Transcription for Doctors - Added group class for hover effects */}
                        <Card
                            className="group overflow-hidden p-6 gap-1">
                            <Mic className="text-primary size-5" />
                            <h3 className="text-foreground mt-5 text-lg font-semibold">AI Voice Transcription</h3>
                            <p className="text-muted-foreground mt-3 text-balance">
                                Doctors dictate prescriptions and medical notes - our AI instantly converts speech to structured digital records.
                            </p>

                            <VoiceTranscriptionIllustration />
                        </Card>

                        {/* OCR for Patients - Fixed positioning and sizing */}
                        <Card
                            className="group overflow-hidden px-6 pt-6 gap-1 min-h-[400px]">
                            <FileText className="text-primary size-5" />
                            <h3 className="text-foreground mt-5 text-lg font-semibold">Smart OCR Digitization</h3>
                            <p className="text-muted-foreground mt-3 text-balance">
                                Patients can upload old prescriptions and medical records - AI extracts and organizes all medical data.
                            </p>

                            <OCRDigitizationIllustration />
                        </Card>

                        {/* Analytics for Government */}
                        <Card
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
            className="mt-9 aspect-video p-4 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-lg">
            <div className="mb-3 flex items-center gap-2">
                <div className="bg-background size-6 rounded-full border p-0.5 shadow shadow-zinc-950/5 transition-transform duration-300 group-hover:scale-110">
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

            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 mb-3 transition-all duration-300 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50">
                <div className="flex items-center space-x-2 mb-2">
                    <Mic className="h-4 w-4 text-blue-500 transition-transform duration-300 group-hover:scale-110" />
                    <span className="text-sm font-medium">Voice Input</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                    "Prescribe Metformin 500mg twice daily..."
                </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3 transition-all duration-300 group-hover:bg-green-100 dark:group-hover:bg-green-900/50">
                <div className="flex items-center space-x-2 mb-2">
                    <FileText className="h-4 w-4 text-green-500 transition-transform duration-300 group-hover:scale-110" />
                    <span className="text-sm font-medium">AI Transcribed</span>
                </div>
                <div className="space-y-1">
                    <div className="bg-green-200 dark:bg-green-700 h-2 rounded-full w-4/5 transition-all duration-500 group-hover:w-full"></div>
                    <div className="bg-green-200 dark:bg-green-700 h-2 rounded-full w-3/5 transition-all duration-700 group-hover:w-4/5"></div>
                    <div className="bg-green-200 dark:bg-green-700 h-2 rounded-full w-1/2 transition-all duration-900 group-hover:w-3/5"></div>
                </div>
            </div>
        </Card>
    )
}



const OCRDigitizationIllustration = () => {
    return (
        <div
            aria-hidden
            className="relative mt-6 h-56 overflow-hidden">
            {/* Main prescription card - positioned absolutely for better control */}
            <Card className="absolute left-0 top-4 w-3/5 h-40 p-3 transition-all duration-300 ease-in-out group-hover:-rotate-3 group-hover:scale-105 group-hover:shadow-lg z-10">
                <div className="mb-2 flex items-center gap-2">
                    <div className="bg-background size-5 rounded-full border p-0.5 shadow shadow-zinc-950/5">
                        <img
                            className="aspect-square rounded-full object-cover"
                            src={PATIENT_AVATAR}
                            alt="Patient"
                            height="20"
                            width="20"
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium truncate">Maria Rodriguez</div>
                        <div className="text-xs text-muted-foreground/75">Patient</div>
                    </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-2 mb-2">
                    <div className="text-xs text-orange-600 dark:text-orange-400 font-medium mb-1">Old Prescription</div>
                    <div className="space-y-1">
                        <div className="bg-orange-200 dark:bg-orange-700 h-1.5 rounded-full transition-all duration-500 group-hover:w-full"></div>
                        <div className="bg-orange-200 dark:bg-orange-700 h-1.5 rounded-full w-3/4 transition-all duration-700 group-hover:w-5/6"></div>
                        <div className="bg-orange-200 dark:bg-orange-700 h-1.5 rounded-full w-1/2 transition-all duration-900 group-hover:w-2/3"></div>
                    </div>
                </div>

                <div className="flex items-center space-x-2 text-xs text-green-600 dark:text-green-400">
                    <Sparkles className="h-3 w-3 animate-pulse" />
                    <span>AI Processing...</span>
                </div>
            </Card>

            {/* Digitized result card - positioned absolutely */}
            <Card className="absolute right-0 top-8 w-2/5 h-40 p-3 transition-all duration-300 ease-in-out group-hover:rotate-3 group-hover:scale-105 group-hover:shadow-lg z-20 bg-white dark:bg-gray-800 border-green-200 dark:border-green-700">
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <FileText className="h-8 w-8 text-green-500 mx-auto mb-2 transition-transform duration-300 group-hover:scale-110" />
                    <div className="text-sm text-green-600 dark:text-green-400 font-medium mb-2">Digitized</div>
                    <div className="space-y-1 w-full">
                        <div className="bg-green-200 dark:bg-green-700 h-1.5 rounded-full transition-all duration-500 group-hover:w-full"></div>
                        <div className="bg-green-200 dark:bg-green-700 h-1.5 rounded-full w-3/4 transition-all duration-700 group-hover:w-5/6"></div>
                        <div className="bg-green-200 dark:bg-green-700 h-1.5 rounded-full w-1/2 transition-all duration-900 group-hover:w-2/3"></div>
                    </div>
                    <div className="text-xs text-green-500 mt-2 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                        ✓ Complete
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
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Privacy Protected</span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded text-center transition-all duration-300 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">89%</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Vaccination</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/30 p-2 rounded text-center transition-all duration-300 group-hover:bg-green-100 dark:group-hover:bg-green-900/50">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">12K</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Records</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/30 p-2 rounded text-center transition-all duration-300 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50">
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
                            <div 
                                key={i} 
                                className="w-6 h-3 bg-gradient-to-r from-blue-400 to-green-400 rounded-full opacity-80 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110"
                                style={{ animationDelay: `${i * 100}ms` }}
                            ></div>
                        ))}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Zero Personal Data</div>
                </div>
            </div>
        </Card>
    )
}