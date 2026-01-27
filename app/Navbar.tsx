'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/commodity', label: 'Commodity' },
    { href: '/certificates', label: 'Certificates' },
    { href: '/about-us', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
    { href: '/blogs', label: 'Blogs' },
  ]

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      {/* Top Bar with Contact Info */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-2">
          <div className="flex flex-wrap items-center justify-between text-sm">
            <div className="flex items-center gap-4 md:gap-6">
              <a
                href="tel:+918290445443"
                className="flex items-center gap-1.5 hover:text-primary-foreground/80 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="text-xs md:text-sm">+91 82904 45443</span>
              </a>
              <a
                href="mailto:info@desimanwar.com"
                className="hidden sm:flex items-center gap-1.5 hover:text-primary-foreground/80 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span className="text-xs md:text-sm">info@desimanwar.com</span>
              </a>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link href="/get-a-quote">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 text-xs font-medium"
                >
                  Get a Quote
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
              <Image
                src="/images/logo-image-light.jpg"
                alt="Desi Manwar Logo"
                fill
                className="object-cover dark:hidden"
                priority
              />
              <Image
                src="/images/logo-image-dark.jpg"
                alt="Desi Manwar Logo"
                fill
                className="object-cover hidden dark:block"
                priority
              />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-primary">
              DESI MANWAR
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex justify-center">
              <ThemeToggle />
            </div>
            <div className="flex flex-col space-y-1 mt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium py-2 px-2 rounded-md transition-colors ${
                    pathname === link.href
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
