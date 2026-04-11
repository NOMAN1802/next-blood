import React, { useContext, useState, useEffect } from 'react'
import { LanguageContext } from './LanguageContextBase'

export const languages = [
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩', dir: 'ltr' },
  { code: 'en', name: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'es', name: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'zh', name: '中文', flag: '🇨🇳', dir: 'ltr' }
]

export const translations = {
  en: {
    nav_home: "Home",
    nav_about: "About",
    nav_blog: "Blog",
    nav_contact: "Contact",
    nav_share_registration: "Registration Now",
    nav_dashboard: "Dashboard",
    dash_logout: "Logout",
    
    view_profile: "View Profile",
    contact_donor: "Contact",
    call_now: "Call Now",
    send_email: "Send Email",
    send_message: "Message",
    donor_details: "Donor Details",
    medical_history: "Medical History",
    verified_donor: "Verified Donor",
    status: "Status",
    availability: "Availability",
    available: "Available",
    unavailable: "Unavailable",
    joined_on: "Joined On",
    last_donation: "Last Donation",
    back_to_search: "Back to Search",
    profile_not_found: "Profile not found",
    
    donor_login: "Donor Login",
    donor_login_subtitle: "Access your dashboard to manage profile and donations",
    email_label: "Email Address",
    password_label: "Password",
    sign_in: "Sign In",
    no_account: "Don't have an account?",
    register_as_donor: "Register as Donor",
    welcome_back: "Welcome back!",
    login_success_desc: "You have successfully logged in.",
    login_failed: "Login Failed",
    
    join_as_donor: "Join as a Donor",
    join_subtitle: "Your donation can save up to 3 lives",
    full_name: "Full Name",
    age: "Age",
    phone: "Phone Number",
    blood_group: "Blood Group",
    city: "District / City",
    health_conditions: "Health Conditions",
    confirm_password: "Confirm Password",
    register_now: "Register Now",
    already_registered: "Already registered?",
    login_here: "Login here",
    success_registration: "Registration Successful!",
    welcome_message: "Welcome to the donor community!",
    
    hero_title_1: "A Smarter Way To",
    hero_title_2: "Save Lives",
    hero_desc: "Connect directly with blood donors in your area. No middlemen, just rapid life-saving connections powered by technology.",
    hero_badge: "Saving lives just got simpler",
    
    search_placeholder: "Search donors (e.g. Rahim)...",
    search_blood_group: "Blood Group",
    search_location: "Location",
    search_btn: "Find Donors",
    search_advanced: "Advanced Search",
    
    stat_donors: "Donors",
    stat_lives: "Lives Saved",
    stat_hospitals: "Hospitals",
    stat_support: "Support",
    
    why_title: "Why Choose Next Blood?",
    why_desc: "We've reimagined the blood donation process to be faster, safer, and more reliable.",
    
    feat_1_title: "Nationwide Network",
    feat_1_desc: "Access donors from anywhere in the country with our intelligent geo-location system.",
    feat_2_title: "Real-time Requests",
    feat_2_desc: "Urgent requests are broadcast instantly to nearby compatible donors via SMS and App.",
    feat_3_title: "Community Trust",
    feat_3_desc: "Verified profiles, transparent history, and secure data ensure safety for everyone involved.",
    
    gallery_title: "Impact Gallery",
    gallery_desc: "See how we are making a difference across the world.",
    
    news_title: "Latest News",
    news_desc: "Updates, stories, and educational content from our community.",
    news_view_all: "View All",
    news_read: "Read Article",
    
    faq_title: "Frequently Asked Questions",
    faq_desc: "Common questions about blood donation.",
    faq_1_q: "How often can I donate blood?",
    faq_1_a: "Men can donate every 3 months, and women can donate every 4 months.",
    faq_2_q: "Is it safe to donate blood?",
    faq_2_a: "Yes, it is completely safe. We use sterile, disposable needles for every donation.",
    faq_3_q: "Who is eligible to donate?",
    faq_3_a: "Anyone aged 18-60, weighing over 45kg (men) or 50kg (women), with normal hemoglobin.",
    faq_4_q: "How do I find a donor in an emergency?",
    faq_4_a: "Use our 'Find' search bar at the top of the page for instant results.",
    
    reg_hero_title: "Join the Community of",
    reg_hero_highlight: "Life Savers",
    reg_hero_desc: "Every 2 seconds, someone needs blood. By registering as a donor, you are taking a heroic step to support your community.",
    reg_feat_1_title: "Quick & Easy Profile",
    reg_feat_1_desc: "Create your profile in less than 2 minutes.",
    reg_feat_2_title: "Smart Matching",
    reg_feat_2_desc: "Get notified only when someone near you needs help.",
    
    reg_form_title: "Donor Registration",
    reg_form_subtitle: "Sign up to become a verified donor today.",
    label_userid: "User ID / Email",
    label_password: "Password",
    label_fullname: "Full Name",
    label_bloodgroup: "Blood Group",
    label_contact: "Contact Number",
    label_location: "Location / City",
    label_medical: "Medical History (Optional)",
    btn_register: "Register as Donor",
    btn_registering: "Creating Profile...",
    reg_terms: "By registering, you agree to our Terms of Service and Privacy Policy.",
    
    slide_1_title: "Every Second Counts",
    slide_1_desc: "Emergency situations don't wait. Your blood donation can be the difference between life and death.",
    slide_1_cta: "Donate Now",
    slide_2_title: "Join Our Community",
    slide_2_desc: "Be part of a growing network of everyday heroes. Connect with other donors.",
    slide_2_cta: "Join Us",
    slide_3_title: "Safe, Sterile & Secure",
    slide_3_desc: "We prioritize your safety with state-of-the-art protocols.",
    slide_3_cta: "Learn More",
    slide_4_title: "Register in Minutes",
    slide_4_desc: "Skip the paperwork. Our streamlined digital registration process gets you ready.",
    slide_4_cta: "Sign Up",
    slide_5_title: "Rapid Response",
    slide_5_desc: "Our advanced network matches donors to patients instantly.",
    slide_5_cta: "View Requests",
    slide_6_title: "One Donation, 3 Lives",
    slide_6_desc: "Your single whole blood donation can save three distinct lives.",
    slide_6_cta: "Read Stories",

    about_hero_title: "Revolutionizing Blood Donation in Bangladesh",
    about_hero_desc: "We are building a future where no life is lost due to the unavailability of blood. Our technology connects donors and patients instantly.",
    
    vision_title: "Our Vision",
    vision_desc: "To create a seamless, technology-driven ecosystem where every blood request is met within minutes, eliminating the scarcity of safe blood across Bangladesh and beyond.",
    
    mission_title: "Our Mission",
    mission_desc: "We are on a mission to empower communities, streamline the donation process through advanced technology, and foster a culture of voluntary blood donation.",
    
    value_1_title: "Innovation",
    value_1_desc: "Leveraging AI and data to optimize donor matching.",
    value_2_title: "Integrity",
    value_2_desc: "Building trust through transparency and verified profiles.",
    value_3_title: "Compassion",
    value_3_desc: "Every feature we build is driven by the desire to save lives.",
    
    future_title: "Future Roadmap",
    future_desc: "We are just getting started. Here is what we are building next to save even more lives.",
    
    plan_1_title: "Mobile App Launch",
    plan_1_desc: "Native iOS and Android apps for instant notifications and easier donor management.",
    plan_1_date: "Q3 2025",
    
    plan_2_title: "AI Smart Matching",
    plan_2_desc: "Machine learning algorithms to predict blood shortages and mobilize donors proactively.",
    plan_2_date: "Q4 2025",
    
    plan_3_title: "Hospital Integration",
    plan_3_desc: "Direct API integration with major hospitals for real-time blood bank inventory management.",
    plan_3_date: "Q1 2026",
    
    plan_4_title: "Global Expansion",
    plan_4_desc: "Taking our life-saving platform to other developing nations facing similar challenges.",
    plan_4_date: "2026+",
    
    dash_overview: "Overview",
    dash_users: "Donors",
    dash_requests: "Blood Requests",
    dash_content: "Content Management",
    dash_login_history: "Login History",
    dash_settings: "Settings"
  },
  bn: {
    nav_home: "হোম",
    nav_about: "আমাদের সম্পর্কে",
    nav_blog: "ব্লগ",
    nav_contact: "যোগাযোগ",
    nav_share_registration: "এখনই নিবন্ধন করুন",
    nav_dashboard: "ড্যাশবোর্ড",
    dash_logout: "লগ আউট",

    view_profile: "প্রোফাইল দেখুন",
    contact_donor: "যোগাযোগ",
    call_now: "কল করুন",
    send_email: "ইমেল পাঠান",
    send_message: "মেসেজ",
    donor_details: "দাতার বিবরণ",
    medical_history: "মেডিকেল ইতিহাস",
    verified_donor: "যাচাইকৃত দাতা",
    status: "অবস্থা",
    availability: "উপলব্ধতা",
    available: "উপলব্ধ",
    unavailable: "অনুপলব্ধ",
    joined_on: "যোগ দিয়েছেন",
    last_donation: "শেষ রক্তদান",
    back_to_search: "অনুসন্ধানে ফিরে যান",
    profile_not_found: "প্রোফাইল পাওয়া যায়নি",
    
    donor_login: "রক্তদাতা লগইন",
    donor_login_subtitle: "আপনার প্রোফাইল এবং অনুদান পরিচালনা করতে ড্যাশবোর্ডে প্রবেশ করুন",
    email_label: "ইমেল ঠিকানা",
    password_label: "পাসওয়ার্ড",
    sign_in: "সাইন ইন",
    no_account: "অ্যাকাউন্ট নেই?",
    register_as_donor: "রক্তদাতা হিসেবে নিবন্ধন করুন",
    welcome_back: "স্বাগতম!",
    login_success_desc: "আপনি সফলভাবে লগ ইন করেছেন।",
    login_failed: "লগইন ব্যর্থ হয়েছে",
    
    join_as_donor: "রক্তদাতা হিসেবে যোগ দিন",
    join_subtitle: "আপনার রক্তদান ৩টি পর্যন্ত জীবন বাঁচাতে পারে",
    full_name: "পুরো নাম",
    age: "বয়স",
    phone: "ফোন নম্বর",
    blood_group: "রক্তের গ্রুপ",
    city: "জেলা / শহর",
    health_conditions: "স্বাস্থ্য অবস্থা",
    confirm_password: "পাসওয়ার্ড নিশ্চিত করুন",
    register_now: "এখনই নিবন্ধন করুন",
    already_registered: "ইতিমধ্যে নিবন্ধিত?",
    login_here: "এখানে লগইন করুন",
    success_registration: "নিবন্ধন সফল হয়েছে!",
    welcome_message: "রক্তদাতা কমিউনিটিতে স্বাগতম!",

    hero_title_1: "জীবন বাঁচানোর",
    hero_title_2: "স্মার্ট উপায়",
    hero_desc: "সরাসরি আপনার এলাকার রক্তদাতাদের সাথে সংযোগ করুন। কোনও মধ্যস্থতাকারী নেই, প্রযুক্তির মাধ্যমে দ্রুত জীবন রক্ষাকারী সংযোগ।",
    hero_badge: "জীবন বাঁচানো এখন আরও সহজ",
    
    search_placeholder: "রক্তদাতা খুঁজুন (যেমন: রহিম)...",
    search_blood_group: "রক্তের গ্রুপ",
    search_location: "অবস্থান",
    search_btn: "খুঁজুন",
    search_advanced: "উন্নত অনুসন্ধান",
    
    stat_donors: "রক্তদাতা",
    stat_lives: "জীবন রক্ষা",
    stat_hospitals: "হাসপাতাল",
    stat_support: "সহায়তা",
    
    why_title: "কেন নেক্সট ব্লাড বাছবেন?",
    why_desc: "আমরা রক্তদান প্রক্রিয়াটিকে আরও দ্রুত, নিরাপদ এবং নির্ভরযোগ্য করে তুলেছি।",
    
    feat_1_title: "দেশব্যাপী নেটওয়ার্ক",
    feat_1_desc: "আমাদের বুদ্ধিমান জিও-লোকেশন সিস্টেমের মাধ্যমে দেশের যেকোনো প্রান্ত থেকে দাতা খুঁজুন।",
    feat_2_title: "রিয়েল-টাইম অনুরোধ",
    feat_2_desc: "জরুরী অনুরোধগুলি এসএমএস এবং অ্যাপের মাধ্যমে নিকটবর্তী উপযুক্ত দাতাদের কাছে অবিলম্বে পাঠানো হয়।",
    feat_3_title: "কমিউনিটি বিশ্বাস",
    feat_3_desc: "যাচাইকৃত প্রোফাইল, স্বচ্ছ ইতিহাস এবং নিরাপদ ডেটা সবার নিরাপত্তা নিশ্চিত করে।",
    
    gallery_title: "ইমপ্যাক্ট গ্যালারি",
    gallery_desc: "দেখুন আমরা কীভাবে সারা বিশ্বে পরিবর্তন আনছি।",
    
    news_title: "সর্বশেষ খবর",
    news_desc: "আমাদের কমিউনিটি থেকে আপডেট, গল্প এবং শিক্ষামূলক বিষয়বস্তু।",
    news_view_all: "সব দেখুন",
    news_read: "নিবন্ধ পড়ুন",
    
    faq_title: "সচরাচর জিজ্ঞাসিত প্রশ্ন",
    faq_desc: "রক্তদান সম্পর্কে সাধারণ প্রশ্নাবলী।",
    faq_1_q: "আমি কত ঘন ঘন রক্ত দিতে পারি?",
    faq_1_a: "পুরুষরা প্রতি ৩ মাস পর পর এবং মহিলারা প্রতি ৪ মাস পর পর রক্ত দিতে পারেন।",
    faq_2_q: "রক্ত দেওয়া কি নিরাপদ?",
    faq_2_a: "হ্যাঁ, এটি সম্পূর্ণ নিরাপদ। আমরা প্রতিটি দানের জন্য জীবাণুমুক্ত, একবার ব্যবহারযোগ্য সুঁচ ব্যবহার করি।",
    faq_3_q: "কারা রক্ত দিতে পারবেন?",
    faq_3_a: "১৮-৬০ বছর বয়সী, ৪৫ কেজি (পুরুষ) বা ৫০ কেজি (মহিলা) ওজনের বেশি এবং স্বাভাবিক হিমোগ্লোবিন সম্পন্ন যে কেউ।",
    faq_4_q: "জরুরী অবস্থায় দাতা কীভাবে খুঁজব?",
    faq_4_a: "তাৎক্ষণিক ফলাফলের জন্য পেজের উপরের আমাদের 'খুঁজুন' সার্চ বার ব্যবহার করুন।",
    
    reg_hero_title: "যোগ দিন",
    reg_hero_highlight: "জীবন রক্ষাকারীদের দলে",
    reg_hero_desc: "প্রতি ২ সেকেন্ডে কারো না কারো রক্তের প্রয়োজন হয়। দাতা হিসেবে নিবন্ধন করে আপনি আপনার কমিউনিটিকে সাহায্য করার জন্য একটি বীরোচিত পদক্ষেপ নিচ্ছেন।",
    reg_feat_1_title: "দ্রুত ও সহজ প্রোফাইল",
    reg_feat_1_desc: "২ মিনিটেরও কম সময়ে আপনার প্রোফাইল তৈরি করুন।",
    reg_feat_2_title: "স্মার্ট ম্যাচিং",
    reg_feat_2_desc: "শুধুমাত্র তখনই নোটিফিকেশন পান যখন আপনার কাছাকাছি কারো সাহায্যের প্রয়োজন হয়।",
    
    reg_form_title: "রক্তদাতা নিবন্ধন",
    reg_form_subtitle: "আজই ভেরিফাইড দাতা হতে সাইন আপ করুন।",
    label_userid: "ইউজার আইডি / ইমেল",
    label_password: "পাসওয়ার্ড",
    label_fullname: "পুরো নাম",
    label_bloodgroup: "রক্তের গ্রুপ",
    label_contact: "যোগাযোগ নম্বর",
    label_location: "অবস্থান / শহর",
    label_medical: "মেডিকেল ইতিহাস (ঐচ্ছিক)",
    btn_register: "দাতা হিসেবে নিবন্ধন করুন",
    btn_registering: "প্রোফাইল তৈরি হচ্ছে...",
    reg_terms: "নিবন্ধন করার মাধ্যমে, আপনি আমাদের শর্তাবলী এবং গোপনীয়তা নীতিতে সম্মত হচ্ছেন।",

    slide_1_title: "প্রতিটি মুহূর্ত মূল্যবান",
    slide_1_desc: "জরুরী অবস্থা অপেক্ষা করে না। আপনার রক্তদান কারো জীবন ও মৃত্যুর মধ্যে পার্থক্য গড়ে দিতে পারে।",
    slide_1_cta: "দান করুন",
    slide_2_title: "আমাদের কমিউনিটিতে যোগ দিন",
    slide_2_desc: "প্রতিদিনের হিরোদের একটি ক্রমবর্ধমান নেটওয়ার্কের অংশ হোন।",
    slide_2_cta: "যোগ দিন",
    slide_3_title: "নিরাপদ ও সুরক্ষিত",
    slide_3_desc: "আমরা অত্যাধুনিক প্রোটোকলের সাথে আপনার নিরাপত্তাকে অগ্রাধিকার দেই।",
    slide_3_cta: "আরও জানুন",
    slide_4_title: "মিনিটে নিবন্ধন",
    slide_4_desc: "কাগজপত্র এড়িয়ে চলুন। আমাদের ডিজিটাল নিবন্ধন প্রক্রিয়া আপনাকে প্রস্তুত করে।",
    slide_4_cta: "সাইন আপ",
    slide_5_title: "দ্রুত প্রতিক্রিয়া",
    slide_5_desc: "আমাদের উন্নত নেটওয়ার্ক দাতাদের রোগীদের সাথে অবিলম্বে সংযুক্ত করে।",
    slide_5_cta: "অনুরোধ দেখুন",
    slide_6_title: "এক দান, ৩টি জীবন",
    slide_6_desc: "আপনার এক ব্যাগ রক্ত তিনটি ভিন্ন জীবন বাঁচাতে পারে।",
    slide_6_cta: "গল্প পড়ুন",

    about_hero_title: "বাংলাদেশে রক্তদানে বিপ্লব",
    about_hero_desc: "আমরা এমন একটি ভবিষ্যৎ গড়ছি যেখানে রক্তের অভাবে কোনো প্রাণ হারাবে না। আমাদের প্রযুক্তি দাতা এবং রোগীদের অবিলম্বে সংযুক্ত করে।",
    
    vision_title: "আমাদের ভিশন",
    vision_desc: "একটি নিরবচ্ছিন্ন, প্রযুক্তি-চালিত ইকোসিস্টেম তৈরি করা যেখানে প্রতিটি রক্তের অনুরোধ কয়েক মিনিটের মধ্যে পূরণ হয়, যা বাংলাদেশ এবং তার বাইরে নিরাপদ রক্তের অভাব দূর করে।",
    
    mission_title: "আমাদের মিশন",
    mission_desc: "আমাদের লক্ষ্য উন্নত প্রযুক্তির মাধ্যমে দান প্রক্রিয়াকে সহজতর করে সম্প্রদায়কে শক্তিশালী করা এবং স্বেচ্ছায় রক্তদানের সংস্কৃতি গড়ে তোলা।",
    
    value_1_title: "উদ্ভাবন",
    value_1_desc: "দাতা ম্যাচিং অপ্টিমাইজ করতে এআই এবং ডেটা ব্যবহার করা।",
    value_2_title: "সততা",
    value_2_desc: "স্বচ্ছতা এবং যাচাইকৃত প্রোফাইলের মাধ্যমে বিশ্বাস তৈরি করা।",
    value_3_title: "সহমর্মিতা",
    value_3_desc: "আমাদের প্রতিটি উদ্যোগ জীবন বাঁচানোর আকাঙ্ক্ষা দ্বারা চালিত।",
    
    future_title: "ভবিষ্যৎ পরিকল্পনা",
    future_desc: "আমরা সবে শুরু করেছি। আরও জীবন বাঁচাতে আমরা যা তৈরি করছি তা এখানে।",
    
    plan_1_title: "মোবাইল অ্যাপ লঞ্চ",
    plan_1_desc: "তাৎক্ষণিক নোটিফিকেশন এবং সহজ দাতা ব্যবস্থাপনার জন্য নেটিভ আইওএস এবং অ্যান্ড্রয়েড অ্যাপ।",
    plan_1_date: "২০২৫ এর ৩য় কোয়ার্টার",
    
    plan_2_title: "এআই স্মার্ট ম্যাচিং",
    plan_2_desc: "রক্তের ঘাটতি পূর্বাভাস এবং দাতাদের সক্রিয় করতে মেশিন লার্নিং অ্যালগরিদম।",
    plan_2_date: "২০২৫ এর ৪র্থ কোয়ার্টার",
    
    plan_3_title: "হাসপাতাল ইন্টিগ্রেশন",
    plan_3_desc: "রিয়েল-টাইম ব্লাড ব্যাংক ইনভেন্টরি ব্যবস্থাপনার জন্য প্রধান হাসপাতালগুলির সাথে সরাসরি এপিআই ইন্টিগ্রেশন।",
    plan_3_date: "২০২৬ এর ১ম কোয়ার্টার",
    
    plan_4_title: "গ্লোবাল এক্সপ্যানশন",
    plan_4_desc: "আমাদের জীবন রক্ষাকারী প্ল্যাটফর্মটি অন্যান্য উন্নয়নশীল দেশে নিয়ে যাওয়া।",
    plan_4_date: "২০২৬+",
    
    dash_overview: "ওভারভিউ",
    dash_users: "রক্তদাতা",
    dash_requests: "রক্তের অনুরোধ",
    dash_content: "বিষয়বস্তু ব্যবস্থাপনা",
    dash_login_history: "লগইন ইতিহাস",
    dash_settings: "সেটিংস"
  }
}

const getTranslation = (lang, key) => {
  if (translations[lang] && translations[lang][key]) return translations[lang][key]
  if (translations['bn'][key]) return translations['bn'][key]
  if (translations['en'][key]) return translations['en'][key]
  return key
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'bn')

  useEffect(() => {
    localStorage.setItem('language', language)
    if (language === 'ar') {
      document.documentElement.dir = 'rtl'
    } else {
      document.documentElement.dir = 'ltr'
    }
  }, [language])

  const changeLanguage = (lang) => {
    setLanguage(lang)
  }

  const t = (key) => getTranslation(language, key)

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, languages }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)