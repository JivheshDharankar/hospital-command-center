import { Button } from '@/components/ui/button';
import { ArrowRight, Stethoscope } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden rounded-b-3xl">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-primary/90" />
      
      {/* Animated pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="animate-slide-up max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary-foreground/30 bg-primary-foreground/10 backdrop-blur-sm mb-6">
            <Stethoscope className="w-4 h-4 text-primary-foreground" />
            <span className="text-xs uppercase tracking-widest text-primary-foreground/90 font-medium">
              AI-assisted hospital operations
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
            Operational Command Center for
            <span className="block">Multi-Speciality Hospitals</span>
          </h1>
          
          <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-10 leading-relaxed">
            Live queues, bed status, and risk-based triage in one calm, hospital-ready dashboard for operations and emergency teams.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#dashboard">
              <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-xl">
                View Live Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </a>
            <a href="#patient">
              <Button variant="heroOutline" size="lg">
                Try Symptom Checker
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom curve */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-12 md:h-20 fill-background">
          <path d="M0,96L48,85.3C96,75,192,53,288,48C384,43,480,53,576,64C672,75,768,85,864,80C960,75,1056,53,1152,42.7C1248,32,1344,32,1392,32L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" />
        </svg>
      </div>
    </section>
  );
}
