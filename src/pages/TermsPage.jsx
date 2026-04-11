import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ScrollText, Target, Users, ShieldOff, Wifi, RefreshCw, CheckCircle, AlertTriangle, Droplets } from 'lucide-react';

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

const TermsPage = () => {
  const lastUpdated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-neutral-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/20 via-neutral-950 to-neutral-950 pb-20">
      <Helmet>
        <title>Terms of Service - Next Blood BD</title>
        <meta name="description" content="By accessing or using Next Blood BD, you agree to the following terms." />
      </Helmet>

      {/* Hero */}
      <div className="pt-16 pb-12 text-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-600/10 border border-red-600/20 mb-6">
            <ScrollText className="w-8 h-8 text-red-500" />
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Droplets className="w-6 h-6 text-red-500" />
            <span className="text-red-500 font-bold tracking-widest text-sm uppercase">Next Blood BD</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-neutral-500 text-sm font-mono">Last Updated: {lastUpdated}</p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-6 text-neutral-400 max-w-2xl mx-auto text-base leading-relaxed"
        >
          By accessing or using <span className="text-white font-semibold">Next Blood BD</span>, you agree to the following terms.
        </motion.p>
      </div>

      <div className="container max-w-5xl mx-auto px-4 space-y-4">

        <Section number="01" icon={Target} title="Platform Purpose" index={0}>
          <p>
            Next Blood BD is a <span className="text-white font-semibold">voluntary blood donor connection platform</span>.
            We do not store or supply blood directly.
          </p>
        </Section>

        <Section number="02" icon={Users} title="User Responsibilities" index={1}>
          <p>Users must:</p>
          <BulletList items={['Provide accurate information', 'Not misuse the platform', 'Not request or offer money for blood']} />
          <div className="mt-4 flex items-start gap-2 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
            <p className="text-yellow-200/70 text-xs">
              Blood donation is voluntary — requesting payment is strictly prohibited (a common safety guideline in Bangladesh platforms).
            </p>
          </div>
        </Section>

        <Section number="03" icon={ShieldOff} title="No Medical Liability" index={2}>
          <p>We are not responsible for:</p>
          <BulletList items={['Medical outcomes', 'Blood safety or transfusion procedures']} />
          <p className="mt-2">Users must follow hospital and medical guidelines.</p>
        </Section>

        <Section number="04" icon={AlertTriangle} title="Account Suspension" index={3}>
          <p>We reserve the right to suspend accounts for:</p>
          <BulletList items={['Fraud', 'Misuse', 'False information']} />
        </Section>

        <Section number="05" icon={Wifi} title="Service Availability" index={4}>
          <p>We aim for 24/7 service but do not guarantee uninterrupted access.</p>
        </Section>

        <Section number="06" icon={RefreshCw} title="Changes to Terms" index={5}>
          <p>We may update these terms at any time. Continued use means acceptance.</p>
        </Section>

        {/* Footer note */}
        <motion.div
          custom={6}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="mt-8 text-center text-neutral-500 text-sm py-4"
        >
          <p>Next Blood BD &copy; {new Date().getFullYear()} — All rights reserved.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsPage;
