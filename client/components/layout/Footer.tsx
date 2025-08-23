import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import Image from "next/image";

const navigationLinks = [
  { name: "Features", href: "#features" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Pricing", href: "#pricing" },
  { name: "FAQ", href: "#faq" },
  { name: "Contact", href: "#contact" },
];

const legalLinks = [
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Terms of Use", href: "/terms" },
];

const socialLinks = [
  {
    name: "Facebook",
    href: "https://facebook.com/inboxlyone",
    icon: Facebook,
    ariaLabel: "Follow Inboxlyone on Facebook",
  },
  {
    name: "Instagram",
    href: "https://instagram.com/inboxlyone",
    icon: Instagram,
    ariaLabel: "Follow Inboxlyone on Instagram",
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/company/inboxlyone",
    icon: Linkedin,
    ariaLabel: "Follow Inboxlyone on LinkedIn",
  },
  {
    name: "Twitter",
    href: "https://twitter.com/inboxlyone",
    icon: Twitter,
    ariaLabel: "Follow Inboxlyone on Twitter",
  },
];

export default function Footer() {
  return (
    <footer className="w-full bg-gray-50 border-t border-gray-300">
      {/* Full-width container with responsive side padding */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Desktop / Tablet (md+) */}
        <div className="hidden md:grid grid-cols-12 gap-8">
          {/* Brand */}
          <div className="col-span-4">
            <h3 className="flex items-center text-2xl text-purple-900 font-medium mb-4">
              <Image
                src="/assets/inboxlyone.png"
                alt="Inboxlyone logo"
                width={40}
                height={40}
                className="object-contain mr-2"
              />
              Inboxlyone
            </h3>
            <p className="text-gray-600 leading-relaxed">
              One inbox. Every message. Zero chaos.
            </p>
          </div>

          {/* Navigation */}
          <nav className="col-span-3" aria-label="Footer navigation">
            <h4 className="font-semibold text-gray-900 mb-4">Navigation</h4>
            <ul className="space-y-3">
              {navigationLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-600 hover:text-purple-900 focus:text-purple-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal */}
          <nav className="col-span-3" aria-label="Legal links">
            <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-600 hover:text-purple-900 focus:text-purple-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Social */}
          <div className="col-span-2">
            <h4 className="font-semibold text-gray-900 mb-4">Follow Us</h4>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  aria-label={social.ariaLabel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-gray-600 hover:text-purple-900 hover:shadow-md focus:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 transition-all"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile (sm and down) */}
        <div className="md:hidden space-y-8">
          {/* Brand */}
          <div className="text-center">
            <h3 className="flex items-center justify-center text-2xl font-medium text-purple-900 mb-3">
              <Image
                src="/assets/inboxlyone.png"
                alt="Inboxlyone logo"
                width={36}
                height={36}
                className="object-contain mr-2"
              />
              Inboxlyone
            </h3>
            <p className="text-gray-600">
              One inbox. Every message. Zero chaos.
            </p>
          </div>

          {/* Collapsible groups for smaller screens */}
          <div className="space-y-4">
            <details className="group rounded-xl bg-white shadow-sm p-4">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="font-semibold text-gray-900">Navigation</span>
                <span className="text-gray-500 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-left">
                {navigationLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="block py-1 text-gray-600 hover:text-blue-700 focus:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </details>

            <details className="group rounded-xl bg-white shadow-sm p-4">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="font-semibold text-gray-900">Legal</span>
                <span className="text-gray-500 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <ul className="mt-3 space-y-2 text-left">
                {legalLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="block py-1 text-gray-600 hover:text-blue-700 focus:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          </div>

          {/* Social */}
          <div className="text-center">
            <h4 className="font-semibold text-gray-900 mb-3">Follow Us</h4>
            <div className="flex justify-center flex-wrap gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  aria-label={social.ariaLabel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-gray-600 hover:text-purple-900 hover:shadow-md focus:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 transition-all"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-600">
            © 2025 Inboxlyone. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
