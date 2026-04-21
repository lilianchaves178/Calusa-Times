import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Users, Quote } from 'lucide-react';
import api, { assetUrl } from '../lib/api';

const SpotlightPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/spotlight')
      .then((res) => setStudents(res.data))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Users size={32} className="text-[#FFD700]" />
            <h1 className="text-4xl font-black text-[#0f1e42]">Student Spotlight</h1>
          </div>
          <p className="text-gray-600">
            Celebrating the amazing students who make Calusa Elementary shine!
          </p>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading…</p>
        ) : students.length === 0 ? (
          <p className="text-gray-500" data-testid="no-spotlight-msg">
            No spotlight students yet. Check back soon!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <div
                key={student.id}
                className="bg-[#0f1e42] rounded-2xl p-8 text-white relative overflow-hidden"
                data-testid={`spotlight-${student.id}`}
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#1a2d5a] rounded-full opacity-30 -translate-y-10 translate-x-10"></div>
                <div className="relative z-10">
                  <div className="flex justify-center mb-6">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] p-1">
                      <div className="w-full h-full rounded-full bg-[#0f1e42] flex items-center justify-center overflow-hidden">
                        {student.image_url ? (
                          <img
                            src={assetUrl(student.image_url)}
                            alt={student.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-4xl font-black text-[#FFD700]">
                            {student.name.charAt(0)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-black mb-1">{student.name}</h3>
                    {student.grade && (
                      <p className="text-gray-300 text-sm mb-4">{student.grade}</p>
                    )}
                    <Quote className="text-[#FFD700] mx-auto mb-2" size={20} />
                    <blockquote className="italic text-gray-200 text-sm leading-relaxed">
                      "{student.quote}"
                    </blockquote>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SpotlightPage;
