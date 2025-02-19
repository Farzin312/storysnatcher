import React from 'react';
import Logo from './Logo';
import Link from 'next/link';
import { FaGithub, FaLinkedin, FaPaperPlane, FaMapMarkerAlt, FaArrowRight } from 'react-icons/fa';

const teamMembers = [
  {
    name: 'Farzin Shifat',
    role: 'Lead Developer',
    github: 'https://github.com/farzin312',
    linkedin: 'https://www.linkedin.com/in/farzin-shifat-5b7b43207/'
  },
  {
    name: 'Eric Fang',
    role: 'UI UX',
    github: 'https://github.com/farzin312',
    linkedin: 'https://www.linkedin.com/in/eric-fang-b83890195/'
  }
];

const Footer = () => {
  return (
      <footer className="w-full bg-white text-gray-900 border-t-2 border-gray-300 relative z-10">
       <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid md:grid-cols-4 gap-10 px-6 pb-12 border-b  border-gray-300">    
         <div className="flex flex-col mt-2 md:mt-0">
          <Logo /> 
            <p className="mt-6 text-base leading-relaxed">
              <span className="font-bold text-lg">Story Snatcher</span> empowers content creators and researchers with 
              powerful AI tools for video transcription, summarization, and voiceover generation. Turn hours 
              of content into seconds of insight with ease.
            </p>
          </div>

          <div className="mt-24 md:mt-0">
            <h3 className="text-xl font-bold mb-5">Quick Links</h3>
            <ul className="space-y-4">
              {[
                { name: 'Transcribe', href: '/services/transcribe' },
                { name: 'Summarize', href: '/services/summarize' },
                { name: 'Audio Generation', href: '/services/audio' },
                { name: 'Video Creation', href: '/services/video' },
                { name: 'Pricing', href: '/pricing' }
              ].map((link, index) => (
                <li key={index} className="group">
                  <Link href={link.href} className="flex items-center hover:text-blue-600 transition-colors">
                    <FaArrowRight className="mr-2 text-sky-400 group-hover:text-blue-600 transition-colors" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-5">Meet the Team</h3>
            <ul className="space-y-5">
              {teamMembers.map((member, index) => (
                <li key={index} className="flex flex-col text-sm md:text-base">
                  <span className="font-medium">{member.name}</span>
                  <span className="text-gray-600">{member.role}</span>
                  <div className="flex space-x-4 mt-2">
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-black transition-colors flex items-center"
                    >
                      <FaGithub className="mr-1" />
                      <span>GitHub</span>
                    </a>
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:text-blue-900 transition-colors flex items-center"
                    >
                      <FaLinkedin className="mr-1" />
                      <span>LinkedIn</span>
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-5">Get in Touch</h3>
            <ul className="space-y-4 text-sm md:text-base">
              <li className="flex items-center">           
                <FaPaperPlane className="mr-3 text-purple-500" />
                <a
                  href="https://mail.google.com/mail/u/0/?view=cm&to=farzinshifat@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 transition-colors"
                >
                  farzinshifat@gmail.com
                </a>
              </li>
              <li className="flex items-center">
                <FaMapMarkerAlt className="mr-3 text-pink-500" />
                <span>New York, USA</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="text-center py-6 text-sm border-t border-gray-300">
          © {new Date().getFullYear()} Story Snatcher. All rights reserved.
        </div>
      </footer>
  );
};

export default Footer;
