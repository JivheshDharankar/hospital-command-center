import { motion } from 'framer-motion';
import { Activity, Github, Mail, MapPin } from 'lucide-react';

const productLinks = [
  { href: '#dashboard', label: 'Command Dashboard' },
  { href: '#patient', label: 'Symptom Checker' },
  { href: '#locator', label: 'Nearby Hospitals' },
  { href: '#admin', label: 'Admin Panel' },
];

const projectLinks = [
  { href: '#architecture', label: 'System Design' },
  { href: '#contact', label: 'Contact' },
  { href: '#', label: 'GitHub Repo' },
];

export function Footer() {
  return (
    <footer className="relative bg-foreground text-background/80 mt-20 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative container mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-background">MediQueue AI</span>
            </div>
            <p className="text-sm text-background/60 mb-4 leading-relaxed">
              Next-generation hospital operations console for AI-assisted queue and bed management.
            </p>
            <div className="flex items-center gap-2 text-sm text-background/50">
              <MapPin className="w-4 h-4" />
              <span>Pune, India</span>
            </div>
          </motion.div>

          {/* Product */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="font-semibold text-background mb-4">Product</h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-background/60 hover:text-background transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Project */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="font-semibold text-background mb-4">Resources</h4>
            <ul className="space-y-3">
              {projectLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-background/60 hover:text-background transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="font-semibold text-background mb-4">Get in Touch</h4>
            <div className="space-y-3">
              <a href="mailto:contact@mediqueue.ai" className="flex items-center gap-2 text-sm text-background/60 hover:text-background transition-colors">
                <Mail className="w-4 h-4" />
                contact@mediqueue.ai
              </a>
              <a href="#" className="flex items-center gap-2 text-sm text-background/60 hover:text-background transition-colors">
                <Github className="w-4 h-4" />
                View on GitHub
              </a>
            </div>
            <p className="text-xs text-background/40 mt-4">
              Built for hackathon demo • Not for clinical use
            </p>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-background/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-xs text-background/40">© 2025 MediQueue AI. All rights reserved.</span>
          <div className="flex gap-6 text-xs text-background/40">
            <a href="#" className="hover:text-background/60 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-background/60 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
