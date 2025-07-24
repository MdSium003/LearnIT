import React from 'react';
import { Facebook, Twitter, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

const FooterLink = ({ to, children }) => (
    <li>
        <Link
            to={to}
            className="text-gray-400 hover:text-white transition-colors duration-300"
        >
            {children}
        </Link>
    </li>
);

const SocialIcon = ({ href, icon: Icon }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-500 hover:text-purple-400 transition-all duration-300 transform hover:-translate-y-1"
    >
        <Icon className="h-6 w-6" />
    </a>
);

const Footer = () => {
  const companyLinks = [
    { name: 'About Us', path: '/about' },
    { name: 'Contact Us', path: '/contact' },
  ];

  const exploreLinks = [
    { name: 'All Courses', path: '/all-courses' },
    { name: 'My Courses', path: '/my-courses' },
  ];
  
  const socialMediaLinks = [
    { name: 'Facebook', icon: Facebook, url: 'https://www.facebook.com/yourplatform' },
    { name: 'Twitter', icon: Twitter, url: 'https://twitter.com/yourplatform' },
    { name: 'Instagram', icon: Instagram, url: 'https://instagram.com/yourplatform' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-purple-500/20 mt-20">
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="lg:col-span-1 space-y-4">
            <Link to="/" className="flex items-center space-x-2.5 group w-fit">
                <div className="w-10 h-10 flex items-end justify-center gap-1 p-2 bg-gray-900/80 rounded-lg border border-purple-500/30 group-hover:border-purple-400 transition-all duration-300">
                    <span className="w-1.5 h-3 bg-purple-400 rounded-full transition-all duration-300 group-hover:h-6"></span>
                    <span className="w-1.5 h-6 bg-purple-300 rounded-full transition-all duration-300 group-hover:h-3 delay-75"></span>
                    <span className="w-1.5 h-4 bg-purple-400 rounded-full transition-all duration-300 group-hover:h-5 delay-150"></span>
                </div>
                <span className="text-2xl font-bold text-white tracking-wider group-hover:text-purple-300 transition-colors duration-300">
                  LearnIT
                </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Empowering minds through accessible, engaging, and high-quality online education for everyone.
            </p>
          </div>

          {/* Link Columns */}
          <div className="md:col-span-1 lg:col-start-3 lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                  <h5 className="font-semibold text-white tracking-wider">Company</h5>
                  <ul className="space-y-3 text-sm">
                      {companyLinks.map((link) => <FooterLink key={link.name} to={link.path}>{link.name}</FooterLink>)}
                  </ul>
              </div>
              <div className="space-y-4">
                  <h5 className="font-semibold text-white tracking-wider">Explore</h5>
                  <ul className="space-y-3 text-sm">
                      {exploreLinks.map((link) => <FooterLink key={link.name} to={link.path}>{link.name}</FooterLink>)}
                  </ul>
              </div>
              <div className="space-y-4">
                  <h5 className="font-semibold text-white tracking-wider">Connect</h5>
                  <div className="flex space-x-4">
                      {socialMediaLinks.map((social) => <SocialIcon key={social.name} href={social.url} icon={social.icon} />)}
                  </div>
              </div>
          </div>
        </div>
        
        <div className="flex justify-center items-center border-t border-purple-500/20 pt-8">
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} LearnIT, Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
