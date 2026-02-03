import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Activity, Menu, X, Shield, Ambulance, ArrowLeftRight, BarChart3, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserMenu } from '@/components/UserMenu';
import NotificationCenter from '@/components/NotificationCenter';
import { useAuthContext } from '@/contexts/AuthContext';

// Anchor links for landing page sections
const anchorLinks = [
  { href: '#top', label: 'Home' },
  { href: '#dashboard', label: 'Dashboard' },
  { href: '#patient', label: 'Symptom Checker' },
  { href: '#locator', label: 'Nearby Hospitals' },
  { href: '#contact', label: 'Contact' },
];

// Route links for app pages (admin-only)
const adminRouteLinks = [
  { to: '/admin', label: 'Command Center', icon: Shield },
  { to: '/ambulance', label: 'Dispatch', icon: Ambulance },
  { to: '/transfers', label: 'Transfers', icon: ArrowLeftRight },
];

// Route links for authenticated users
const userRouteLinks = [
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/patients', label: 'Patients', icon: Users },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAdmin } = useAuthContext();
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled 
            ? 'glass shadow-lg py-3' 
            : 'bg-transparent py-5'
        )}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <motion.a
            href="#top"
            className="flex items-center gap-2.5 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
              scrolled 
                ? 'bg-gradient-primary shadow-primary' 
                : 'bg-primary-foreground/10 backdrop-blur-sm'
            )}>
              <Activity className={cn(
                'w-5 h-5',
                scrolled ? 'text-primary-foreground' : 'text-primary-foreground'
              )} />
            </div>
            <span className={cn(
              'text-lg font-bold tracking-tight transition-colors duration-300',
              scrolled ? 'text-foreground' : 'text-primary-foreground'
            )}>
              MediQueue AI
            </span>
          </motion.a>

          {/* Desktop Nav */}
          <ul className="hidden lg:flex items-center gap-1">
            {/* Landing page anchor links - only show on landing page */}
            {isLandingPage && anchorLinks.map((link, i) => (
              <motion.li
                key={link.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                <a
                  href={link.href}
                  className={cn(
                    'relative px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                    scrolled 
                      ? 'text-muted-foreground hover:text-foreground hover:bg-accent' 
                      : 'text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10'
                  )}
                >
                  {link.label}
                </a>
              </motion.li>
            ))}

            {/* User route links - authenticated users */}
            {user && userRouteLinks.map((link, i) => (
              <motion.li
                key={link.to}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
              >
                <Link
                  to={link.to}
                  className={cn(
                    'relative px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5',
                    location.pathname === link.to
                      ? 'bg-primary/10 text-primary'
                      : scrolled 
                        ? 'text-muted-foreground hover:text-foreground hover:bg-accent' 
                        : 'text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10'
                  )}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              </motion.li>
            ))}

            {/* Admin route links - admin only */}
            {isAdmin && adminRouteLinks.map((link, i) => (
              <motion.li
                key={link.to}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
              >
                <Link
                  to={link.to}
                  className={cn(
                    'relative px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5',
                    location.pathname === link.to
                      ? 'bg-primary/10 text-primary'
                      : scrolled 
                        ? 'text-muted-foreground hover:text-foreground hover:bg-accent' 
                        : 'text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10'
                  )}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              </motion.li>
            ))}
          </ul>

          {/* Desktop CTA + User Menu */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="hidden lg:flex items-center gap-3"
          >
            <a href="#dashboard">
              <Button 
                variant={scrolled ? 'default' : 'hero'}
                size="sm"
                className="rounded-full"
              >
                Open Demo
              </Button>
            </a>
            <NotificationCenter />
            <UserMenu />
          </motion.div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <NotificationCenter />
            <UserMenu />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn(
                'p-2 rounded-lg transition-colors',
                scrolled 
                  ? 'text-foreground hover:bg-accent' 
                  : 'text-primary-foreground hover:bg-primary-foreground/10'
              )}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-40 glass shadow-2xl mx-4 rounded-2xl p-4 lg:hidden"
          >
            <ul className="space-y-1">
              {/* Anchor links on landing page */}
              {isLandingPage && anchorLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-accent rounded-xl transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}

              {/* User route links */}
              {user && userRouteLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-xl transition-colors",
                      location.pathname === link.to
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-accent"
                    )}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                </li>
              ))}

              {/* Admin route links */}
              {isAdmin && adminRouteLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-xl transition-colors",
                      location.pathname === link.to
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-accent"
                    )}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-border">
              {isLandingPage ? (
                <a href="#dashboard" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full">Open Demo</Button>
                </a>
              ) : (
                <Link to="/" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full">Back to Home</Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}