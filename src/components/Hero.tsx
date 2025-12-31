import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Shield, Zap, Activity, Users, Clock, ChevronDown } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';

// Particle system configuration
const PARTICLE_COUNT = 50;
const generateParticles = () =>
  Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

const features = [
  { icon: Zap, label: 'Real-time Triage' },
  { icon: Shield, label: 'Secure & HIPAA Ready' },
  { icon: Sparkles, label: 'AI-Powered Insights' },
];

// Typewriter text sequences
const typewriterTexts = [
  'Center for Hospitals',
  'Intelligence Platform',
  'Decision Engine',
];

// 3D Floating Card Component
function FloatingCard({ 
  children, 
  className = '', 
  delay = 0,
  rotateIntensity = 15,
}: { 
  children: React.ReactNode; 
  className?: string; 
  delay?: number;
  rotateIntensity?: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [rotateIntensity, -rotateIntensity]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-rotateIntensity, rotateIntensity]), { stiffness: 150, damping: 20 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40, rotateX: 10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className={`relative ${className}`}
    >
      {children}
    </motion.div>
  );
}

// Typewriter Hook
function useTypewriter(texts: string[], typingSpeed = 80, deletingSpeed = 50, pauseDuration = 2000) {
  const [displayText, setDisplayText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = texts[textIndex];
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < currentText.length) {
          setDisplayText(currentText.slice(0, displayText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), pauseDuration);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setTextIndex((prev) => (prev + 1) % texts.length);
        }
      }
    }, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayText, textIndex, isDeleting, texts, typingSpeed, deletingSpeed, pauseDuration]);

  return displayText;
}

// Particle Component
function Particle({ particle }: { particle: { id: number; x: number; y: number; size: number; duration: number; delay: number } }) {
  return (
    <motion.div
      className="absolute rounded-full bg-primary-foreground/30"
      style={{
        left: `${particle.x}%`,
        top: `${particle.y}%`,
        width: particle.size,
        height: particle.size,
      }}
      animate={{
        y: [0, -30, 0],
        x: [0, Math.random() * 20 - 10, 0],
        opacity: [0.2, 0.6, 0.2],
        scale: [1, 1.5, 1],
      }}
      transition={{
        duration: particle.duration,
        delay: particle.delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

// Floating Orb Component
function FloatingOrb({ size, x, y, delay, color = 'primary' }: { size: number; x: string; y: string; delay: number; color?: string }) {
  const colors = {
    primary: 'from-primary/20 to-primary/5',
    accent: 'from-accent/20 to-accent/5',
    secondary: 'from-secondary/20 to-secondary/5',
  };

  return (
    <motion.div
      className={`absolute rounded-full bg-gradient-radial ${colors[color as keyof typeof colors]} blur-3xl`}
      style={{ width: size, height: size, left: x, top: y }}
      animate={{
        y: [0, -40, 0],
        x: [0, 20, 0],
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration: 12,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

export function Hero() {
  const [particles] = useState(generateParticles);
  const typewriterText = useTypewriter(typewriterTexts);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Premium Gradient Background */}
      <div className="absolute inset-0 bg-gradient-hero" />
      
      {/* Mesh gradient overlay */}
      <div className="absolute inset-0 bg-mesh opacity-50" />
      
      {/* Animated floating orbs */}
      <FloatingOrb size={400} x="5%" y="10%" delay={0} color="primary" />
      <FloatingOrb size={300} x="75%" y="50%" delay={2} color="accent" />
      <FloatingOrb size={200} x="60%" y="10%" delay={1} color="secondary" />
      <FloatingOrb size={350} x="15%" y="60%" delay={3} color="primary" />

      {/* Particle system */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <Particle key={particle.id} particle={particle} />
        ))}
      </div>

      {/* Animated grid pattern */}
      <motion.div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
        animate={{ opacity: [0.02, 0.04, 0.02] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-24 pb-32">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="lg:col-span-3 text-center lg:text-left">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/5 backdrop-blur-md mb-8"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                </span>
                <span className="text-xs font-medium uppercase tracking-widest text-primary-foreground/90">
                  AI-Assisted Hospital Operations
                </span>
              </motion.div>

              {/* Heading with Typewriter */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-display-lg md:text-display-xl lg:text-display-2xl text-primary-foreground mb-6"
              >
                <span className="block">Operational Command</span>
                <span className="relative inline-block min-h-[1.2em]">
                  <span className="text-gradient-animated bg-gradient-to-r from-white via-primary-foreground/80 to-white bg-clip-text">
                    {typewriterText}
                  </span>
                  <motion.span
                    className="inline-block w-[3px] h-[0.9em] bg-primary-foreground ml-1 align-middle"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-lg md:text-xl text-primary-foreground/80 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed"
              >
                Live queues, bed status, and risk-based triage in one intuitive dashboard. 
                Built for operations and emergency teams who need clarity in chaos.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12"
              >
                <a href="#dashboard">
                  <Button size="xl" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-2xl group relative overflow-hidden">
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    />
                    <span className="relative flex items-center gap-2">
                      View Live Dashboard
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Button>
                </a>
                <a href="#patient">
                  <Button variant="heroOutline" size="xl" className="group">
                    <span className="relative">Try Symptom Checker</span>
                  </Button>
                </a>
              </motion.div>

              {/* Feature pills */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-wrap gap-3 justify-center lg:justify-start"
              >
                {features.map((feature, i) => (
                  <motion.div
                    key={feature.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/10 cursor-default"
                  >
                    <feature.icon className="w-4 h-4 text-primary-foreground/80" />
                    <span className="text-sm font-medium text-primary-foreground/90">{feature.label}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Right: 3D Floating Cards */}
            <div className="lg:col-span-2 relative hidden lg:block" style={{ perspective: '1000px' }}>
              {/* Main Dashboard Card */}
              <FloatingCard delay={0.5} className="relative z-20">
                <div className="glass-premium rounded-2xl p-6 shadow-glass border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <span className="text-xs text-white/60 font-mono">live_dashboard.tsx</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-green-400" />
                      <div className="flex-1">
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: '78%' }}
                            transition={{ duration: 1.5, delay: 1 }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-white/80">78%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-blue-400" />
                      <div className="flex-1">
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: '92%' }}
                            transition={{ duration: 1.5, delay: 1.2 }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-white/80">92%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-orange-400" />
                      <div className="flex-1">
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: '45%' }}
                            transition={{ duration: 1.5, delay: 1.4 }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-white/80">45%</span>
                    </div>
                  </div>
                </div>
              </FloatingCard>

              {/* Floating Stats Card */}
              <FloatingCard delay={0.7} className="absolute -top-4 -right-8 z-30" rotateIntensity={20}>
                <div className="glass-subtle rounded-xl p-4 shadow-lg border border-white/10">
                  <div className="flex items-center gap-2">
                    <motion.div
                      className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Activity className="w-4 h-4 text-green-400" />
                    </motion.div>
                    <div>
                      <p className="text-xs text-white/60">Active Patients</p>
                      <motion.p
                        className="text-lg font-bold text-white"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                      >
                        2,847
                      </motion.p>
                    </div>
                  </div>
                </div>
              </FloatingCard>

              {/* Floating Alert Card */}
              <FloatingCard delay={0.9} className="absolute -bottom-8 -left-8 z-10" rotateIntensity={25}>
                <div className="glass-subtle rounded-xl p-4 shadow-lg border border-white/10">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <Sparkles className="w-5 h-5 text-white" />
                    </motion.div>
                    <div>
                      <p className="text-xs text-white/60">AI Prediction</p>
                      <p className="text-sm font-semibold text-white">Surge in 2h</p>
                    </div>
                  </div>
                </div>
              </FloatingCard>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <motion.a
          href="#stats"
          className="flex flex-col items-center gap-2 text-primary-foreground/60 hover:text-primary-foreground/80 transition-colors"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
          <ChevronDown className="w-5 h-5" />
        </motion.a>
      </motion.div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-16 md:h-24 fill-background" preserveAspectRatio="none">
          <path d="M0,64L48,69.3C96,75,192,85,288,90.7C384,96,480,96,576,85.3C672,75,768,53,864,48C960,43,1056,53,1152,58.7C1248,64,1344,64,1392,64L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" />
        </svg>
      </div>
    </section>
  );
}
