import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SectionCard } from './SectionCard';
import { Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [org, setOrg] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email) {
      toast({
        title: 'Error',
        description: 'Name and email are required.',
        variant: 'destructive',
      });
      return;
    }

    console.log('Contact request:', { name, email, organization: org });
    
    toast({
      title: 'Message Sent',
      description: 'Thanks, your message has been recorded for the demo.',
    });

    setName('');
    setEmail('');
    setOrg('');
  };

  return (
    <SectionCard
      id="contact"
      title="Contact"
      subtitle="Request a walkthrough or share feedback on the demo."
    >
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-1 block">Name</label>
          <Input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-full"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-1 block">Email</label>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-full"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-1 block">Hospital / Organisation (optional)</label>
          <Input
            placeholder="Hospital / Organisation"
            value={org}
            onChange={(e) => setOrg(e.target.value)}
            className="rounded-full"
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" className="px-8">
            <Send className="w-4 h-4 mr-2" />
            Send Message
          </Button>
        </div>
      </form>
    </SectionCard>
  );
}
