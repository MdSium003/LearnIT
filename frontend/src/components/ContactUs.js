import React from 'react';
import { Mail, Code, Server, Github, Facebook } from 'lucide-react';

const DeveloperCard = ({ name, role, email, avatar, description, githubUrl, facebookUrl }) => {
  // Construct the Gmail compose URL
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}`;

  return (
    <div 
      className="relative group rounded-2xl shadow-2xl overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 ease-in-out h-96 bg-cover bg-center"
      style={{ backgroundImage: `url(${avatar})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/90 transition-all duration-300"></div>
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white flex flex-col justify-end h-full">
        <div>
          <h3 className="text-3xl font-bold">{name}</h3>
          <p className="text-purple-300 font-semibold mb-2">{role}</p>
          <p className="text-gray-200 mb-4 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-0 group-hover:h-auto">
            {description}
          </p>
          <div className="flex items-center justify-between mt-4">
            <a
              href={gmailUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-black bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white transition duration-300"
            >
              <Mail className="h-4 w-4 mr-2" />
              Contact
            </a>
            <div className="flex space-x-3">
                <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors"><Github size={20} /></a>
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors"><Facebook size={20} /></a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContactUs = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-gray-900 sm:text-6xl tracking-tight">
            Contact The Team
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            The developers behind this platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <DeveloperCard
            name="Mohammad Sium"
            role="Frontend Developer"
            email="mdsium2004@gmail.com"
            avatar="/sium.jpg"
            githubUrl="https://github.com/MdSium003"
            facebookUrl="https://www.facebook.com/Md.Sium.0003"
            description="Mohammad is the creative mind behind the user interface, focusing on creating a seamless and engaging user experience."
          />
          <DeveloperCard
            name="Atik Khan"
            role="Backend Developer"
            email="atikkhan@gmail.com"
            avatar="/atik.jpg"
            githubUrl="https://github.com/atik0078"
            facebookUrl="https://www.facebook.com/atik.khan.247872"
            description="Atik is the architect of the server-side logic, ensuring the platform is robust, secure, and scalable."
          />
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
