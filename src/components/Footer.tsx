import { Activity } from 'lucide-react';

const productLinks = [
  { href: '#dashboard', label: 'Command Dashboard' },
  { href: '#patient', label: 'Symptom Checker' },
  { href: '#locator', label: 'Nearby Hospitals' },
  { href: '#admin', label: 'Admin Panel' },
];

const projectLinks = [
  { href: '#architecture', label: 'System Design' },
  { href: '#contact', label: 'Contact' },
  { href: '#', label: 'GitHub Repo (Demo)' },
];

export function Footer() {
  return (
    <footer className="bg-foreground text-background/80 mt-16">
      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 text-lg font-semibold text-background mb-4">
              <Activity className="w-5 h-5" />
              MediQueue AI
            </div>
            <p className="text-sm text-background/60 mb-2">
              Prototype hospital operations console for AI-assisted queue and bed management.
            </p>
            <p className="text-sm text-background/60">
              Pune, India • contact@mediqueue.ai
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-background mb-4">Product</h4>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-background/60 hover:text-background transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-background mb-4">Project</h4>
            <ul className="space-y-2">
              {projectLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-background/60 hover:text-background transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-background mb-4">Contact</h4>
            <p className="text-sm text-background/60 mb-2">
              Email: contact@mediqueue.ai<br />
              Phone: +91-XXXXXXXXXX
            </p>
            <p className="text-xs text-background/40">
              Built for hackathon demo • Not for clinical decision making.
            </p>
          </div>
        </div>

        <div className="border-t border-background/10 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-background/40">
          <span>© 2025 MediQueue AI</span>
          <span>Privacy • Terms (demo)</span>
        </div>
      </div>
    </footer>
  );
}
