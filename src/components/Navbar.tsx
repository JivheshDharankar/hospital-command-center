import { Button } from '@/components/ui/button';
import { Activity } from 'lucide-react';

const navLinks = [
  { href: '#top', label: 'Home' },
  { href: '#dashboard', label: 'Dashboard' },
  { href: '#patient', label: 'Symptom Checker' },
  { href: '#locator', label: 'Nearby Hospitals' },
  { href: '#admin', label: 'Admin Panel' },
  { href: '#architecture', label: 'System Design' },
  { href: '#contact', label: 'Contact' },
];

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2 text-xl font-semibold text-primary-dark">
          <Activity className="w-6 h-6" />
          <span>MediQueue AI</span>
        </a>
        
        <ul className="hidden lg:flex items-center gap-6">
          {navLinks.map(link => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a href="#dashboard" className="hidden md:block">
          <Button size="sm">Open Demo</Button>
        </a>
      </div>
    </nav>
  );
}
