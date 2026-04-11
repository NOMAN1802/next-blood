import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import {
  Star, Target, Rocket, Handshake, CheckCircle,
  Quote, Droplets, User
} from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: 'easeOut' }
  })
};

const BulletList = ({ items }) => (
  <ul className="space-y-2 mt-3">
    {items.map((item, i) => (
      <li key={i} className="flex items-start gap-2 text-neutral-300 text-sm">
        <CheckCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
        <span dangerouslySetInnerHTML={{ __html: item }} />
      </li>
    ))}
  </ul>
);

const FounderPage = () => {
  return (
    <div className="min-h-screen bg-neutral-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/20 via-neutral-950 to-neutral-950 pb-24">
      <Helmet>
        <title>Founder Info - Next Blood BD</title>
        <meta name="description" content="Joy Dutta, Founder & Project Chief of Next Blood BD — building a community-driven lifesaving network." />
      </Helmet>

      {/* ── Hero ── */}
      <div className="pt-16 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Droplets className="w-6 h-6 text-red-500" />
              <span className="text-red-500 font-bold tracking-widest text-sm uppercase">Next Blood BD</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Founder Information</h1>
            <p className="text-neutral-500 text-sm">The vision & story behind Next Blood BD</p>
          </motion.div>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="relative bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden mb-10"
          >
            <div className="h-1.5 w-full bg-gradient-to-r from-red-700 via-red-500 to-red-700" />
            <div className="p-8 md:p-12 flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Avatar */}
              <div className="shrink-0">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-4 border-red-600/30 bg-neutral-800 flex items-center justify-center overflow-hidden shadow-2xl shadow-red-900/20">
                  <User className="w-16 h-16 text-neutral-600" />
                </div>
              </div>
              {/* Info */}
              <div className="text-center md:text-left flex-1">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-1">Joy Dutta</h2>
                <p className="text-red-400 font-semibold text-base mb-4">Founder & Project Chief, Next Blood BD</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  {['Blood Donation Advocate', 'Tech Entrepreneur', 'Youth Leader'].map(tag => (
                    <span key={tag} className="px-3 py-1 text-xs font-medium bg-red-600/10 border border-red-600/20 text-red-400 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-neutral-950/60 border border-neutral-800 rounded-xl flex gap-3">
                  <Quote className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-neutral-300 text-sm italic leading-relaxed">
                    "No patient should suffer or lose life due to the lack of blood."
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sections */}
          <div className="space-y-6">

            {/* Founder Story */}
            <motion.div custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
              className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 md:p-8 hover:border-red-900/40 transition-colors"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                  <Star className="w-5 h-5 text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Founder Story</h3>
              </div>
              <div className="space-y-4 text-neutral-400 text-sm leading-relaxed">
                <p>Next Blood BD was founded by <span className="text-white font-semibold">Joy Dutta</span>, inspired by real-life emergencies where patients and families struggled to find blood donors in critical moments.</p>
                <p>Witnessing the delay, stress, and sometimes tragic outcomes caused by the lack of immediate blood availability, he decided to take action.</p>
                <p>With a strong vision and determination, Joy Dutta launched Next Blood BD to:</p>
                <BulletList items={[
                  'Build a <strong class="text-white">digital blood donor network</strong>',
                  'Empower volunteers and youth',
                  'Ensure faster emergency response',
                  'Save lives through technology'
                ]} />
              </div>
            </motion.div>

            {/* Vision & Mission */}
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
                className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 hover:border-red-900/40 transition-colors"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Vision</h3>
                </div>
                <div className="p-4 bg-neutral-950/60 border border-neutral-800 rounded-xl">
                  <Quote className="w-4 h-4 text-red-500 mb-2" />
                  <p className="text-neutral-300 text-sm italic leading-relaxed">
                    "To create a Bangladesh where no life is lost due to blood shortage."
                  </p>
                </div>
              </motion.div>

              <motion.div custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
                className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 hover:border-red-900/40 transition-colors"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                    <Rocket className="w-5 h-5 text-orange-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Mission</h3>
                </div>
                <BulletList items={[
                  'Promote voluntary blood donation',
                  'Build a trusted nationwide donor database',
                  'Use technology to reduce emergency response time',
                  'Encourage social responsibility among youth'
                ]} />
              </motion.div>
            </div>

            {/* Our Commitment */}
            <motion.div custom={3} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
              className="bg-gradient-to-br from-red-950/30 to-neutral-900/60 border border-red-900/30 rounded-2xl p-6 md:p-8"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center">
                  <Handshake className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white">Our Commitment</h3>
              </div>
              <p className="text-neutral-400 text-sm mb-4">At Next Blood BD, we believe:</p>
              <BulletList items={[
                "Blood donation is humanity's greatest service",
                'Technology can save lives',
                'Community is the strongest solution'
              ]} />
              <p className="mt-5 text-neutral-300 text-sm leading-relaxed">
                We are committed to building a{' '}
                <span className="text-white font-semibold">safe, transparent, and life-saving platform</span>{' '}
                for everyone.
              </p>
            </motion.div>

            {/* About the Platform */}
            <motion.div custom={4} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
              className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 md:p-8"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white">About Next Blood BD</h3>
              </div>
              <div className="space-y-4 text-neutral-400 text-sm leading-relaxed">
                <p><span className="text-white font-semibold">Next Blood BD</span> is a Bangladesh-based digital blood donor platform built to bridge the gap between blood donors and patients in urgent need. In a country where thousands of patients struggle daily to find safe and timely blood, this initiative was created to provide a faster, smarter, and more reliable solution.</p>
                <p>Every year, Bangladesh requires hundreds of thousands of blood units, yet only a portion comes from voluntary donors. Recognizing this critical shortage, Next Blood BD was founded with a mission:</p>
                <div className="p-4 border-l-4 border-red-600 bg-red-600/5 rounded-r-xl">
                  <p className="text-white font-semibold italic">"No patient should suffer or lose life due to the lack of blood."</p>
                </div>
                <p>The platform uses technology, community engagement, and volunteer networks to:</p>
                <BulletList items={[
                  'Connect donors with recipients instantly',
                  'Promote voluntary blood donation',
                  'Reduce emergency delays',
                  'Build a nationwide donor database'
                ]} />
                <p>From a small idea inspired by real-life emergency struggles, Next Blood BD is growing into a <span className="text-white font-semibold">community-driven lifesaving network</span> powered by youth, volunteers, and social responsibility.</p>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default FounderPage;
