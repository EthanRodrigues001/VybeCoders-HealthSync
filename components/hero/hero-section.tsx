import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Heart, Menu, X, ChevronRight, CirclePlay, Mic, FileText, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

// Logo Component
const Logo = () => (
    <div className="flex items-center space-x-2">
        <img 
    src="/image.png" 
    alt="HealthSync Logo" 
    className="h-8 w-8 object-contain" 
/>
        <span className="text-2xl font-bold text-foreground">HealthSync</span>
    </div>
);

const menuItems = [
    { name: 'Analytics', href: '/analytics' },

];

// Header Component
interface HeroHeaderProps {
    signInWithGoogle: () => void;
}

const HeroHeader = ({ signInWithGoogle }: HeroHeaderProps) => {
    const [menuState, setMenuState] = React.useState(false);
    const [isScrolled, setIsScrolled] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className={cn(
                    'fixed z-20 w-full transition-all duration-300',
                    isScrolled && 'bg-background/75 border-b border-black/5 backdrop-blur-lg'
                )}
            >
                <div className="mx-auto max-w-7xl px-6">
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0">
                        <div className="flex w-full justify-between gap-6 lg:w-auto">
                            <Link href="/" aria-label="home" className="flex items-center space-x-2">
                                <Logo />
                            </Link>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
                            >
                                <Menu className="data-[state=active]:rotate-180 data-[state=active]:scale-0 data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                                <X className="data-[state=active]:rotate-0 data-[state=active]:scale-100 data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                            </button>

                            <div className="m-auto hidden size-fit lg:block">
                                <ul className="flex gap-1">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <Button asChild variant="ghost" size="sm">
                                                <Link href={item.href} className="text-base">
                                                    <span>{item.name}</span>
                                                </Link>
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="data-[state=active]:block lg:data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border bg-background p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                            <div className="lg:hidden">
                                <ul className="space-y-6 text-base">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                href={item.href}
                                                className="text-muted-foreground hover:text-accent-foreground block duration-150"
                                            >
                                                <span>{item.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                                {/* <Button
                                    onClick={signInWithGoogle}
                                    variant="ghost"
                                    size="sm"
                                    className={cn(isScrolled && 'lg:hidden')}
                                >
                                    <span>Login</span>
                                </Button> */}
                                <Button
                                    onClick={signInWithGoogle}
                                    size="sm"
                                    className={cn(isScrolled && 'lg:hidden')}
                                >
                                    <span>Sign Up</span>
                                </Button>
                                {/* <Button
                                    onClick={signInWithGoogle}
                                    size="sm"
                                    className={cn(isScrolled ? 'lg:inline-flex' : 'hidden')}
                                >
                                    <span>Get Started</span>
                                </Button> */}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
};

// Main Hero Section
interface HealthSyncHeroProps {
    signInWithGoogle: () => void;
}

const HealthSyncHero = ({ signInWithGoogle }: HealthSyncHeroProps) => {
    return (
        <>
            <HeroHeader signInWithGoogle={signInWithGoogle} />
            <main className="overflow-hidden">
                <section className="bg-gradient-to-b from-background to-muted">
                    <div className="relative py-36">
                        <div className="relative z-10 mx-auto w-full max-w-7xl px-6">
                            <div className="md:w-1/2">
                                <div>
                                    <h1 className="max-w-md text-balance text-5xl font-medium md:text-6xl text-foreground">
                                        Unified Healthcare Records for Everyone
                                    </h1>
                                    <p className="text-muted-foreground my-8 max-w-2xl text-balance text-xl">
                                        AI-powered healthcare data management system that connects doctors, patients, and government health records in one secure platform.
                                    </p>

                                    <div className="flex items-center gap-3">
                                        <Button
                                            onClick={signInWithGoogle}
                                            size="lg"
                                            className="pr-4.5"
                                        >
                                            <span className="text-nowrap">Get Started</span>
                                            <ChevronRight className="opacity-50" />
                                        </Button>
                                        {/* <Button
                                            asChild
                                            size="lg"
                                            variant="outline"
                                            className="pl-5"
                                        >
                                            <Link href="#demo">
                                                <CirclePlay className="fill-primary/25 stroke-primary" />
                                                <span className="text-nowrap">Watch Demo</span>
                                            </Link>
                                        </Button> */}
                                    </div>
                                </div>

                                <div className="mt-10">
                                    <p className="text-muted-foreground">Key Features:</p>
                                    <div className="mt-6 grid max-w-lg grid-cols-1 gap-4 sm:grid-cols-3">
                                        <div className="flex items-center space-x-2 text-sm">
                                            <Mic className="h-4 w-4 text-blue-500" />
                                            <span className="text-muted-foreground">Voice Prescriptions</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm">
                                            <FileText className="h-4 w-4 text-green-500" />
                                            <span className="text-muted-foreground">OCR Digitization</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm">
                                            <Shield className="h-4 w-4 text-purple-500" />
                                            <span className="text-muted-foreground">ABDM Integration</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dashboard Mockup */}
                        <div className="perspective-near mt-24 translate-x-12 md:absolute md:-right-6 md:bottom-16 md:left-1/2 md:top-40 md:mt-0 md:translate-x-0">
                            <div className="before:border-foreground/5 before:bg-foreground/5 relative h-full before:absolute before:-inset-x-4 before:bottom-7 before:top-0 before:skew-x-6 before:rounded-[calc(var(--radius)+1rem)] before:border">
                                <div className="bg-background rounded-[var(--radius)] shadow-foreground/10 ring-foreground/5 relative h-full -translate-y-12 skew-x-6 overflow-hidden border border-transparent shadow-md ring-1">
                                    {/* Dashboard Content */}
                                    <div className="p-8 bg-white dark:bg-gray-900 min-h-[400px] w-[600px]">
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center space-x-2">
                                                <img 
    src="/image.png" 
    alt="HealthSync Logo" 
    className="h-8 w-8 object-contain" 
/>
                                                <span className="font-semibold text-gray-900 dark:text-white">HealthSync Dashboard</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                                <span className="text-xs text-gray-500">Online</span>
                                            </div>
                                        </div>

                                        {/* Voice Prescription Card */}
                                        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/30 dark:to-green-900/30 rounded-lg border">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-blue-500 rounded-full">
                                                    <Mic className="h-4 w-4 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">Active Voice Prescription</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">Dr. Sarah Johnson - Cardiology</div>
                                                </div>
                                                <div className="flex space-x-1">
                                                    <div className="w-1 h-4 bg-blue-400 rounded-full animate-pulse"></div>
                                                    <div className="w-1 h-4 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                                    <div className="w-1 h-4 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Patient Records */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <FileText className="h-4 w-4 text-green-500" />
                                                    <span className="text-sm font-medium">Recent Prescription</span>
                                                </div>
                                                <span className="text-xs text-gray-500">2 min ago</span>
                                            </div>

                                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <Shield className="h-4 w-4 text-purple-500" />
                                                    <span className="text-sm font-medium">ABDM Sync Complete</span>
                                                </div>
                                                <span className="text-xs text-gray-500">5 min ago</span>
                                            </div>

                                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <Heart className="h-4 w-4 text-red-500" />
                                                    <span className="text-sm font-medium">Health Records Updated</span>
                                                </div>
                                                <span className="text-xs text-gray-500">10 min ago</span>
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="mt-6 grid grid-cols-3 gap-4">
                                            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">24</div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400">Prescriptions</div>
                                            </div>
                                            <div className="text-center p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                                                <div className="text-lg font-bold text-green-600 dark:text-green-400">12</div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400">Records</div>
                                            </div>
                                            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                                                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">3</div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400">Doctors</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <style jsx>{`
        .perspective-near {
          perspective: 600px;
        }
      `}</style>
        </>
    );
};

export default HealthSyncHero;