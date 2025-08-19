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
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-4 gap-8">
          {/* Product Info */}
          <div className="col-span-1">
            <h3 className="flex items-baseline text-2xl  text-purple-900 font-medium mb-4">
              <Image
                src="/assets/inboxlyone.png"
                alt="Inboxlyone"
                width={40} // adjust size
                height={40} // adjust size
                className="object-contain mb-4 mx-2"
              />
              Inboxlyone
            </h3>
            <p className="text-gray-600 leading-relaxed">
              One inbox. Every message. Zero chaos.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="col-span-1">
            <h4 className="font-semibold text-gray-900 mb-4">Navigation</h4>
            <ul className="space-y-3">
              {navigationLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="col-span-1">
            <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div className="col-span-1">
            <h4 className="font-semibold text-gray-900 mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  aria-label={social.ariaLabel}
                  className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-600 hover:text-purple-900 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden space-y-8 text-center">
          {/* Product Info */}
          <div>
            <h3 className="flex items-basline text-2xl  font-medium text-purple-900 mb-4">
              <Image
                src="/assets/inboxlyone.png"
                alt="Inboxlyone"
                width={40} // adjust size
                height={40} // adjust size
                className="object-contain mb-4 mx-2"
              />
              Inboxlyone
            </h3>
            <p className="text-gray-600 leading-relaxed">
              One inbox. Every message. Zero chaos.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Navigation</h4>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {navigationLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Legal Links */}
          <div>
            <div className="flex justify-center space-x-6">
              {legalLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Follow Us</h4>
            <div className="flex justify-center space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  aria-label={social.ariaLabel}
                  className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-600 hover:text-purple-900 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
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
            © 2025 InboxlyOne. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
