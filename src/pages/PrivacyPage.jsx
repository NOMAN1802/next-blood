import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Shield, Database, Eye, Share2, Cookie, UserCheck, CheckCircle, Lock, Droplets } from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } })
};

const Section = ({ number, icon: Icon, title, children, index }) => (
  <motion.div
    custom={index}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    variants={fadeIn}
    className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 md:p-8 hover:border-red-900/40 transition-colors"
  >
    <div className="flex items-start gap-4">
      <div className="shrink-0 w-11 h-11 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center">
        <Icon className="w-5 h-5 text-red-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-bold text-red-500 bg-red-600/10 px-2 py-0.5 rounded-full">{number}</span>
          <h2 className="text-lg font-bold text-white">{title}</h2>
        </div>
        <div className="text-neutral-400 leading-relaxed space-y-2 text-sm">
          {children}
        </div>
      </div>
    </div>
  </motion.div>
);

const BulletList = ({ items }) => (
  <ul className="mt-2 space-y-1.5">
    {items.map((item, i) => (
      <li key={i} className="flex items-start gap-2">
        <CheckCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const PrivacyPage = () => {
  const lastUpdated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-neutral-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/20 via-neutral-950 to-neutral-950 pb-20">
      <Helmet>
        <title>Privacy Policy - Next Blood BD</title>
        <meta name="description" content="At Next Blood BD, protecting your personal information is our top priority." />
      </Helmet>

      {/* Hero */}
      <div className="pt-16 pb-12 text-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-600/10 border border-red-600/20 mb-6">
            <Lock className="w-8 h-8 text-red-500" />
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Droplets className="w-6 h-6 text-red-500" />
            <span className="text-red-500 font-bold tracking-widest text-sm uppercase">Next Blood BD</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-neutral-500 text-sm font-mono">Last Updated: {lastUpdated}</p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-6 text-neutral-400 max-w-2xl mx-auto text-base leading-relaxed"
        >
          At <span className="text-white font-semibold">Next Blood BD</span>, protecting your personal information is our top priority.
          This Privacy Policy explains how we collect, use, and safeguard your data.
        </motion.p>
      </div>

      <div className="container max-w-5xl mx-auto px-4 space-y-4">

        <Section number="01" icon={Database} title="Information We Collect" index={0}>
          <p>We may collect:</p>
          <BulletList items={['Full Name', 'Phone Number', 'Email Address', 'Blood Group', 'Location (City/District)', 'Donation History']} />
        </Section>

        <Section number="02" icon={Eye} title="How We Use Your Information" index={1}>
          <p>Your information is used to:</p>
          <BulletList items={['Connect donors with patients', 'Send emergency blood requests', 'Improve platform performance', 'Ensure user safety and verification']} />
        </Section>

        <Section number="03" icon={Shield} title="Data Protection" index={2}>
          <p>We implement strict security measures to protect your data.</p>
          <p className="mt-2">We <span className="text-white font-semibold">do not sell or share your personal data</span> with third parties without consent.</p>
        </Section>

        <Section number="04" icon={Share2} title="Sharing Information" index={3}>
          <p>Your contact details may be shared <span className="text-white font-semibold">only when you accept a blood request</span>.</p>
        </Section>

        <Section number="05" icon={Cookie} title="Cookies & Tracking" index={4}>
          <p>We may use cookies to enhance user experience and improve our services.</p>
        </Section>

        <Section number="06" icon={UserCheck} title="User Rights" index={5}>
          <p>You can:</p>
          <BulletList items={['Update your information', 'Request account deletion', 'Opt-out of notifications']} />
        </Section>

        <Section number="07" icon={CheckCircle} title="Consent" index={6}>
          <p>By using our platform, you agree to this Privacy Policy.</p>
        </Section>

        {/* Contact */}
        <motion.div
          custom={7}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="mt-8 p-6 bg-red-600/5 border border-red-600/20 rounded-2xl text-center"
        >
          <p className="text-neutral-400 text-sm">
            Questions about this Privacy Policy? Contact us at{' '}
            <span className="text-white font-semibold">nextbloodbd@gmail.com</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPage;
