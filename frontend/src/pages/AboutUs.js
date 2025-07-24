import React from 'react';
import { Target, Eye, Zap } from 'lucide-react';

const AboutUs = () => {
  const teamMembers = [
    { name: 'Md. Sium', role: 'BUET, CSE', imageUrl: '/sium.jpg' },
    { name: 'Atik Khan', role: 'BUET, CSE', imageUrl: '/atik.jpg' },
  ];

  const values = [
    { icon: Target, title: 'Our Mission', description: 'To make high-quality education accessible to everyone, everywhere. We empower learners to achieve their career goals and pursue their passions.' },
    { icon: Eye, title: 'Our Vision', description: 'To become the world\'s leading destination for online learning, connecting students with the best instructors and cutting-edge content.' },
    { icon: Zap, title: 'Our Approach', description: 'We focus on practical, hands-on learning. Our courses are designed by industry experts to provide real-world skills that are immediately applicable.' },
  ];

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-purple-800 text-white py-20 md:py-32 text-center">
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="relative z-10 container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">About LearnIT</h1>
          <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto">
            We are dedicated to revolutionizing education by providing accessible, affordable, and effective learning experiences.
          </p>
        </div>
      </div>

      {/* Our Values Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Our Core Values</h2>
            <p className="mt-2 text-lg text-gray-600">The principles that drive us forward.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12 text-center">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="flex flex-col items-center">
                  <div className="bg-purple-100 p-4 rounded-full mb-4">
                    <Icon className="h-8 w-8 text-purple-700" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-gray-100 py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Meet Our Team</h2>
            <p className="mt-2 text-lg text-gray-600">The passionate individuals behind LearnIT.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center">
                <img
                  className="mx-auto h-40 w-40 rounded-full object-cover shadow-lg"
                  src={member.imageUrl}
                  alt={member.name}
                />
                <h4 className="mt-4 text-lg font-semibold text-gray-900">{member.name}</h4>
                <p className="text-purple-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;