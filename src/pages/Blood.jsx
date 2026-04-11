
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplet, Search, Heart, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { db } from '@/lib/db';
import ReceiverModal from '@/components/ReceiverModal';

const BloodPage = () => {
  const bloodGroups = db.constants.bloodGroups;
  const [showBanner, setShowBanner] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const handleYes = () => {
    setShowBanner(false);
    setShowModal(true);
  };

  const handleNo = () => {
    setShowBanner(false);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white pb-16">
      <SEO title="Blood Services | Next Blood" description="Find blood donors and available inventory." />

      {/* Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full bg-red-600 flex items-center justify-between px-6 py-4 shadow-lg mb-8"
          >
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-white" />
              <span className="text-white font-semibold text-sm md:text-base">
                Did you find the blood you requested?
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleYes}
                className="flex items-center gap-1.5 bg-white text-red-600 font-bold text-sm px-4 py-1.5 rounded-full hover:bg-red-50 transition-colors"
              >
                <Check className="w-4 h-4" /> YES
              </button>
              <button
                onClick={handleNo}
                className="flex items-center gap-1.5 bg-white/20 text-white font-bold text-sm px-4 py-1.5 rounded-full hover:bg-white/30 transition-colors border border-white/40"
              >
                <X className="w-4 h-4" /> NO
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {showModal && <ReceiverModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>

      <div className="container px-4 mx-auto pt-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-black mb-6">
            <span className="text-red-600">Blood</span> Services
          </h1>
          <p className="text-xl text-neutral-400">
            Find compatible blood donors or browse our blood inventory status.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
          {bloodGroups.map((group, index) => (
            <motion.div
              key={group}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col items-center hover:border-red-600/50 transition-colors group"
            >
              <div className="w-16 h-16 rounded-full bg-red-600/10 flex items-center justify-center mb-4 group-hover:bg-red-600/20 transition-colors">
                <span className="text-2xl font-black text-red-500">{group}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{group} Donors</h3>
              <p className="text-sm text-neutral-500 text-center mb-4">
                Find donors with {group} blood group in your area.
              </p>
              <Link to={`/search?group=${encodeURIComponent(group)}`} className="mt-auto">
                <Button variant="outline" className="w-full border-neutral-700 hover:bg-red-600 hover:text-white hover:border-red-600">
                  Find Donors
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="bg-neutral-900 rounded-3xl p-8 md:p-12 border border-neutral-800 text-center max-w-4xl mx-auto">
          <Droplet className="w-16 h-16 text-red-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Need Blood Urgently?</h2>
          <p className="text-lg text-neutral-400 mb-8 max-w-2xl mx-auto">
            If you cannot find a donor, you can submit a blood request and we will notify all compatible donors in your area.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/request">
              <Button className="bg-red-600 hover:bg-red-700 text-lg px-8 py-6 h-auto w-full sm:w-auto">
                Request Blood Now
              </Button>
            </Link>
            <Link to="/search">
              <Button variant="outline" className="border-neutral-700 hover:bg-neutral-800 text-lg px-8 py-6 h-auto">
                <Search className="w-5 h-5 mr-2" /> Advanced Search
              </Button>
            </Link>
            <Button
              onClick={() => setShowModal(true)}
              className="bg-red-600 hover:bg-red-700 text-lg px-8 py-6 h-auto w-full sm:w-auto justify-center"
            >
              <Heart className="w-5 h-5 mr-2" /> Saved Life
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BloodPage;
