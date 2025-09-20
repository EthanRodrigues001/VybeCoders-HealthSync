import React from 'react';
import Link from 'next/link';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';

const HealthSyncFooter = () => {
    return (
        <footer className="bg-background border-t border-border">
            <div className="mx-auto max-w-7xl px-6 py-12">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">

                    {/* Logo & Description */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <img 
    src="/image.png" 
    alt="HealthSync Logo" 
    className="h-8 w-8 object-contain" 
/>
                            <span className="text-2xl font-bold text-foreground">HealthSync</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span>HIPAA Compliant & Secure</span>
                        </div>
                    </div>


                </div>

                {/* Bottom Section */}
                <div className="mt-12 pt-1 border-t border-border">
                    <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
                        <div className="text-sm text-muted-foreground">
                            © 2024 HealthSync. All rights reserved. Secure, AI-powered healthcare data management.
                        </div>
                        <div className="flex items-center space-x-6">
                            <div className="text-xs text-muted-foreground">
                                Made with ❤️ for better healthcare
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default HealthSyncFooter;