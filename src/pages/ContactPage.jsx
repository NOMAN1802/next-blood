import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
const ContactPage = () => {
  return <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header / Hero */}
      <div className="pt-32 pb-10 px-4 text-center bg-neutral-950 border-b border-neutral-900">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Get in <span className="text-red-600">Touch</span>
          </h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            We are here to help. Reach out to us for any queries, support, or partnership opportunities.
          </p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Contact Information */}
          <motion.div initial={{
          opacity: 0,
          x: -20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          delay: 0.2
        }} className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Contact Information</h2>
              <p className="text-neutral-400">
                Fill out the form and our team will get back to you within 24 hours.
              </p>
              
              <div className="space-y-6 pt-4">
                <Card className="bg-neutral-900 border-neutral-800">
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="p-3 bg-red-900/20 rounded-lg text-red-500">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Phone</h3>
                      <p className="text-neutral-400">000</p>
                      <p className="text-sm text-neutral-500 mt-1">Mon-Fri from 9am to 6pm</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-neutral-900 border-neutral-800">
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="p-3 bg-blue-900/20 rounded-lg text-blue-500">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Email</h3>
                      <p className="text-neutral-400">moderninnovix.com</p>
                      <p className="text-sm text-neutral-500 mt-1">For general inquiries</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-neutral-900 border-neutral-800">
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="p-3 bg-green-900/20 rounded-lg text-green-500">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Office</h3>
                      <p className="text-neutral-400">Jashore 7400, Bangladesh.</p>
                      <p className="text-sm text-neutral-500 mt-1">Yav Foundation HQ</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
               <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
               <div className="flex gap-4">
                 {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => <a key={i} href="#" className="p-3 bg-neutral-900 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800 transition-colors">
                     <Icon className="w-5 h-5" />
                   </a>)}
               </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          delay: 0.3
        }} className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800">
            <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium text-neutral-300">First Name</label>
                  <Input id="firstName" placeholder="John" className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium text-neutral-300">Last Name</label>
                  <Input id="lastName" placeholder="Doe" className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-neutral-300">Email Address</label>
                <Input id="email" type="email" placeholder="john@example.com" className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600" />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-neutral-300">Phone Number (Optional)</label>
                <Input id="phone" type="tel" placeholder="+880..." className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600" />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-neutral-300">Message</label>
                <Textarea id="message" placeholder="How can we help you?" className="min-h-[150px] bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600 resize-none" />
              </div>

              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-6 rounded-xl text-lg">
                <Send className="w-5 h-5 mr-2" /> Send Message
              </Button>
            </form>
          </motion.div>

        </div>
      </div>
    </div>;
};
export default ContactPage;