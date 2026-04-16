import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Info, MapPin, Phone, Mail, Clock } from 'lucide-react';

const SchoolInfoPage = () => {
  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Info size={32} className="text-[#0f1e42]" />
            <h1 className="text-4xl font-black text-[#0f1e42]">School Information</h1>
          </div>
          <p className="text-gray-600">Everything you need to know about Calusa Elementary</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border-2 border-[#0f1e42] p-8">
            <h2 className="text-2xl font-bold text-[#0f1e42] mb-6">Contact Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-[#FFD700] mt-1" />
                <div>
                  <h3 className="font-semibold text-[#0f1e42] mb-1">Address</h3>
                  <p className="text-gray-600">123 Elementary Drive<br />Education City, EC 12345</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={20} className="text-[#FFD700] mt-1" />
                <div>
                  <h3 className="font-semibold text-[#0f1e42] mb-1">Phone</h3>
                  <p className="text-gray-600">(555) 123-4567</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail size={20} className="text-[#FFD700] mt-1" />
                <div>
                  <h3 className="font-semibold text-[#0f1e42] mb-1">Email</h3>
                  <p className="text-gray-600">info@calusaelementary.edu</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock size={20} className="text-[#FFD700] mt-1" />
                <div>
                  <h3 className="font-semibold text-[#0f1e42] mb-1">School Hours</h3>
                  <p className="text-gray-600">Monday - Friday<br />8:00 AM - 3:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-[#0f1e42] p-8">
            <h2 className="text-2xl font-bold text-[#0f1e42] mb-6">About Our School</h2>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              Calusa Elementary School has been a cornerstone of educational excellence since 2019. 
              We are proud to be a Platinum STEM School for 7 consecutive years.
            </p>

            <p className="text-gray-700 leading-relaxed mb-4">
              Our mission is to provide a nurturing and challenging environment where every student 
              can reach their full potential through innovative learning experiences.
            </p>

            <div className="bg-[#FFF8E7] rounded-lg p-4 border-2 border-[#FFD700]">
              <h3 className="font-bold text-[#0f1e42] mb-2">Notable Achievements</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Platinum STEM School - 7 Years</li>
                <li>• Award-Winning Student Newspaper</li>
                <li>• Regional Art Competition Winners</li>
                <li>• Science Fair Champions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SchoolInfoPage;
