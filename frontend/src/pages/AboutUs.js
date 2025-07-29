import React, { useEffect } from 'react';
import { Target, Users, Award, Briefcase } from 'lucide-react';

const AboutUs = () => {
  // Effect for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    const elements = document.querySelectorAll('.fade-in');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const teamMembers = [
    {
      name: 'Mohammad Sium',
      role: 'Co-Founder & Frontend Lead',
      imageUrl: '/sium_a.jpg',
      bio: "Mohammad is the creative force behind LearnIT's user experience. With a keen eye for design and a passion for crafting intuitive, beautiful interfaces, he translates complex ideas into seamless digital experiences that make learning a joy. His work is driven by the belief that a great interface can inspire and motivate learners.",
    },
    {
      name: 'Atik Khan',
      role: 'Co-Founder & Backend Lead',
      imageUrl: '/atik2.jpg',
      bio: 'Atik is the architectural mastermind of our platform. He specializes in building robust, scalable, and secure server-side systems. His dedication to engineering excellence ensures that LearnIT runs smoothly and reliably for our global community of learners, no matter the demand.',
    },
    {
      name: 'Rabib Jahin Ibn Momin',
      role: 'Supervisor of the Project',
      imageUrl: '/rabib.jpg',
      bio: 'Provided valuable guidance and insightful instructions throughout the project, helping us stay on the right track and improve the overall quality of our work.',
    },
  ];

  return (
    <>
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
        }
        .fade-in {
          opacity: 0;
        }
      `}</style>
      <div className="bg-white text-gray-800">
        {/* Hero Section */}
        <section className="relative text-center py-28 md:py-40 bg-gray-900 text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-gray-900 to-black opacity-80"></div>
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url(https://www.transparenttextures.com/patterns/cubes.png)'}}></div>

          <div className="relative z-10 container mx-auto px-4 fade-in animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
              Pioneering the Future of Education.
            </h1>
            <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-gray-300">
              We are a team of innovators, creators, and educators dedicated to building a world where anyone can learn anything, anytime.
            </p>
          </div>
        </section>
        
        {/* Our Story Section */}
        <section className="py-20 md:py-28">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="fade-in">
                        <img src="https://placehold.co/600x450/e9d5ff/3730a3?text=Our+Story" alt="Our Story" className="rounded-xl shadow-2xl"/>
                    </div>
                    <div className="fade-in" style={{ animationDelay: '200ms' }}>
                        <h2 className="text-4xl font-bold tracking-tight mb-4">Our Story</h2>
                        <p className="text-lg text-gray-600">
                            LearnIT was born from a simple yet powerful idea: that education should be a right, not a privilege. In a rapidly evolving world, we saw a critical need for accessible, high-quality learning that could keep pace with technological change. What started as a late-night project between two passionate developers has grown into a vibrant global community. We are driven by the stories of our learners—the career changers, the skill builders, the dreamers—who use our platform to transform their lives.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        {/* Our Mission Section */}
        <section className="py-20 md:py-28 bg-gray-50">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-4xl font-bold tracking-tight mb-4 fade-in">Our Mission</h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12 fade-in" style={{ animationDelay: '150ms' }}>
                    To empower individuals worldwide by providing accessible, high-quality education that bridges the gap between ambition and achievement. We believe learning is a lifelong journey, and we're here to guide every step of the way.
                </p>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-xl shadow-lg fade-in" style={{ animationDelay: '300ms' }}>
                        <Award className="h-10 w-10 text-purple-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Quality Content</h3>
                        <p className="text-gray-600">Curated courses from industry experts to ensure you learn the most relevant skills.</p>
                    </div>
                     <div className="bg-white p-8 rounded-xl shadow-lg fade-in" style={{ animationDelay: '450ms' }}>
                        <Users className="h-10 w-10 text-purple-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Expert Instructors</h3>
                        <p className="text-gray-600">Learn from the best. Our instructors are passionate professionals with real-world experience.</p>
                    </div>
                     <div className="bg-white p-8 rounded-xl shadow-lg fade-in" style={{ animationDelay: '600ms' }}>
                        <Briefcase className="h-10 w-10 text-purple-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Career Focused</h3>
                        <p className="text-gray-600">Gain practical, applicable skills that will help you achieve your professional goals.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Team Section */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 tracking-tight fade-in">Meet The Team</h2>
              <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto fade-in" style={{ animationDelay: '100ms' }}>
                The passionate individuals who started it all.
              </p>
            </div>
            {/* Changed grid classes here for the fix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {teamMembers.map((member, index) => (
                <div key={index} className="bg-gray-50 rounded-xl shadow-2xl overflow-hidden fade-in transform hover:scale-105 transition-transform duration-300" style={{ animationDelay: `${index * 150 + 200}ms` }}>
                  <div className="relative">
                    <img
                        className="h-80 w-full object-cover"
                        src={member.imageUrl}
                        alt={member.name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900">{member.name}</h3>
                    <p className="text-purple-600 font-semibold text-md mb-4">{member.role}</p>
                    <p className="text-gray-600 text-sm">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutUs;