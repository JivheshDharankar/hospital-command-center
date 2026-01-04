import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SectionCard } from './SectionCard';
import { Mail, Send, CheckCircle2, User, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [org, setOrg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email) {
      toast({
        title: 'Error',
        description: 'Name and email are required.',
        variant: 'destructive',
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    const { error } = await supabase
      .from('contact_submissions')
      .insert({
        name,
        email,
        organization: org || null,
        user_id: user?.id || null,
      });

    setIsSubmitting(false);

    if (error) {
      console.error('Error submitting contact form:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitted(true);
    
    toast({
      title: 'Message Sent',
      description: 'Thanks! We\'ll get back to you soon.',
    });

    // Reset after showing success
    setTimeout(() => {
      setName('');
      setEmail('');
      setOrg('');
      setIsSubmitted(false);
    }, 3000);
  };

  return (
    <SectionCard
      id="contact"
      title="Get In Touch"
      subtitle="Request a walkthrough or share feedback on the demo."
      icon={<Mail className="w-6 h-6 text-primary-foreground" />}
    >
      {isSubmitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4"
          >
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </motion.div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Message Sent!</h3>
          <p className="text-sm text-muted-foreground">
            Thanks for reaching out. We'll get back to you soon.
          </p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <User className="w-3 h-3" />
                Name
              </label>
              <Input
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl border-border/50 focus:border-primary/50 h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Mail className="w-3 h-3" />
                Email
              </label>
              <Input
                type="email"
                placeholder="you@hospital.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border-border/50 focus:border-primary/50 h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-3 h-3" />
                Organization (optional)
              </label>
              <Input
                placeholder="Hospital / Organisation"
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                className="rounded-xl border-border/50 focus:border-primary/50 h-12"
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            size="lg"
            disabled={isSubmitting}
            className="px-8"
          >
            {isSubmitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 mr-2 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </form>
      )}
    </SectionCard>
  );
}
