import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, MapPin, Mail, Phone, Calendar, Award, 
  Facebook, Twitter, Linkedin, Instagram, Youtube, Github, Globe 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import SEO from '@/components/SEO';
import { db } from '@/lib/db';

const SocialIcon = ({ platform, className }) => {
  const icons = {
    facebook: Facebook,
    twitter: Twitter,
    linkedin: Linkedin,
    instagram: Instagram,
    youtube: Youtube,
    github: Github,
    email: Mail
  };
  const Icon = icons[platform?.toLowerCase()] || Globe;
  return <Icon className={className} />;
};

const VolunteerProfilePage = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVolunteer = async () => {
      try {
        setLoading(true);
        const data = await db.volunteers.getById(id);
        setVolunteer(data);
      } catch (error) {
        console.error("Failed to load volunteer", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVolunteer();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">Loading...</div>;
  if (!volunteer) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">Volunteer not found</div>;

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-20 pb-20">
      <SEO title={`${volunteer.full_name} | Next Blood Volunteer`} description={volunteer.bio?.substring(0, 150)} />
      
      <div className="container px-4 mx-auto max-w-5xl">
        <Link to="/volunteers" className="inline-flex items-center text-neutral-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Volunteers
        </Link>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Sidebar Info */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-1"
          >
            <div className="bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 sticky top-24">
              <div className="aspect-square bg-neutral-800 relative">
                {volunteer.avatar_url ? (
                  <img src={volunteer.avatar_url} alt={volunteer.full_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-600">No Image</div>
                )}
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">{volunteer.full_name}</h1>
                  <p className="text-red-500 font-medium">{volunteer.role}</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-neutral-800">
                  {volunteer.location && (
                    <div className="flex items-center gap-3 text-sm text-neutral-300">
                      <MapPin className="w-4 h-4 text-neutral-500" /> {volunteer.location}
                    </div>
                  )}
                  {volunteer.email && (
                    <div className="flex items-center gap-3 text-sm text-neutral-300">
                      <Mail className="w-4 h-4 text-neutral-500" /> {volunteer.email}
                    </div>
                  )}
                  {volunteer.phone && (
                    <div className="flex items-center gap-3 text-sm text-neutral-300">
                      <Phone className="w-4 h-4 text-neutral-500" /> {volunteer.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm text-neutral-300">
                    <Calendar className="w-4 h-4 text-neutral-500" /> Joined {new Date(volunteer.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-800">
                  <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">Social Connect</h4>
                  <div className="flex gap-3 flex-wrap">
                    {volunteer.volunteer_social_links?.map(link => (
                      <a 
                        key={link.id} 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 hover:bg-red-600 hover:text-white transition-all"
                      >
                        <SocialIcon platform={link.platform} className="w-5 h-5" />
                      </a>
                    ))}
                    {(!volunteer.volunteer_social_links || volunteer.volunteer_social_links.length === 0) && (
                      <span className="text-xs text-neutral-600 italic">No links provided</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-2 space-y-8"
          >
            {/* Bio */}
            <div className="bg-neutral-900/50 rounded-2xl p-8 border border-neutral-800">
              <h2 className="text-2xl font-bold text-white mb-6">About</h2>
              <p className="text-neutral-300 leading-relaxed whitespace-pre-line text-lg font-light">
                {volunteer.bio || "No biography available."}
              </p>
            </div>

            {/* Achievements */}
            {volunteer.volunteer_achievements && volunteer.volunteer_achievements.length > 0 && (
              <div className="bg-neutral-900/50 rounded-2xl p-8 border border-neutral-800">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Award className="w-6 h-6 text-yellow-500" /> Key Contributions
                </h2>
                <div className="grid gap-4">
                  {volunteer.volunteer_achievements.map((achievement) => (
                    <div key={achievement.id} className="flex gap-4 p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-red-900/50 transition-colors">
                      <div className="mt-1">
                        <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                      </div>
                      <p className="text-neutral-300 leading-relaxed">{achievement.achievement_text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Contact CTA */}
            <div className="bg-gradient-to-r from-red-900/20 to-neutral-900/50 rounded-2xl p-8 border border-red-900/20 flex flex-col sm:flex-row items-center justify-between gap-6">
               <div>
                 <h3 className="text-xl font-bold text-white mb-2">Want to connect?</h3>
                 <p className="text-neutral-400">Reach out to {volunteer.full_name.split(' ')[0]} for collaboration.</p>
               </div>
               {volunteer.email && (
                 <Button className="bg-red-600 hover:bg-red-500 text-white whitespace-nowrap" onClick={() => window.location.href=`mailto:${volunteer.email}`}>
                    <Mail className="w-4 h-4 mr-2" /> Send Email
                 </Button>
               )}
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerProfilePage;