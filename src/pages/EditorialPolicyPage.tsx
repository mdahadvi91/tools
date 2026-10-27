import { TrustPageLayout } from "@components/trust/TrustPageLayout";
import { useLanguage } from "@contexts/LanguageContext";

const CONTACT = "mdahadvi91@gmail.com";
const UPDATED_EN = "Last updated: October 2026";
const UPDATED_BN = "সর্বশেষ আপডেট: অক্টোবর ২০২৬";

export const EDITORIAL_POLICY_CONTENT = {
  en: {
    eyebrow: "Editorial Policy",
    title: "How we create our content.",
    subtitle: "Our commitment to accuracy, independence, and transparency. We aim to provide the most reliable, privacy-first tools and documentation on the web.",
    lastUpdated: UPDATED_EN,
    contactEmail: CONTACT,
    sections: [
      {
        heading: "1. Accuracy and Fact-Checking",
        paragraphs: [
          "Every technical guide, tool description, and article on AHADEX Tools is written by humans and reviewed for technical accuracy. We test our tools extensively across different browsers (Chrome, Safari, Firefox) and devices.",
          "We do not publish industry statistics or claims without verification. If we mention a standard (like 300 DPI for printing or QR error correction levels), it is based on official specifications or direct testing."
        ]
      },
      {
        heading: "2. Independence and Advertising",
        paragraphs: [
          "AHADEX Tools is supported by advertising (Google AdSense). However, our advertising partners have no influence over our editorial content, tool rankings, or reviews.",
          "We do not write sponsored posts disguised as regular content. Any affiliate links or sponsored placements (if present in the future) will be explicitly labeled."
        ]
      },
      {
        heading: "3. Privacy and AI",
        paragraphs: [
          "We do not use AI to generate our technical documentation or articles. Every piece of content is written by our team.",
          "Our tools are built with a privacy-first architecture. We do not upload, store, or analyze the files you process with our tools."
        ]
      },
      {
        heading: "4. Corrections Policy",
        paragraphs: [
          "We strive for 100% accuracy, but mistakes can happen. If you spot a factual error, a broken link, or outdated technical information, please contact us immediately.",
          "We will review your feedback and, if necessary, update the content and add a correction note at the bottom of the page."
        ]
      },
      {
        heading: "5. Contact",
        paragraphs: [
          `If you have questions about our editorial standards or want to report an issue, email us at ${CONTACT}. We aim to respond within 48 hours.`
        ]
      }
    ]
  },
  bn: {
    eyebrow: "সম্পাদকীয় নীতি",
    title: "আমরা কীভাবে আমাদের কনটেন্ট তৈরি করি।",
    subtitle: "নির্ভুলতা, স্বাধীনতা এবং স্বচ্ছতার প্রতি আমাদের অঙ্গীকার। আমাদের লক্ষ্য হলো ওয়েবে সবচেয়ে নির্ভরযোগ্য, প্রাইভেসি-প্রথম টুল এবং ডকুমেন্টেশন প্রদান করা।",
    lastUpdated: UPDATED_BN,
    contactEmail: CONTACT,
    sections: [
      {
        heading: "১. নির্ভুলতা ও ফ্যাক্ট-চেকিং",
        paragraphs: [
          "AHADEX Tools-এর প্রতিটি টেকনিক্যাল গাইড, টুলের বিবরণ এবং নিবন্ধ মানুষ দ্বারা লেখা হয় এবং টেকনিক্যাল নির্ভুলতার জন্য পর্যালোচনা করা হয়। আমরা বিভিন্ন ব্রাউজার (Chrome, Safari, Firefox) এবং ডিভাইসে আমাদের টুলগুলো ব্যাপকভাবে পরীক্ষা করি।",
          "আমরা যাচাই ছাড়া কোনো পরিসংখ্যান বা দাবি প্রকাশ করি না। যদি আমরা কোনো স্ট্যান্ডার্ডের কথা বলি (যেমন প্রিন্টিংয়ের জন্য 300 DPI বা QR এ্যারর কারেকশন লেভেল), তবে তা অফিসিয়াল স্পেসিফিকেশন বা সরাসরি পরীক্ষার উপর ভিত্তি করে হয়।"
        ]
      },
      {
        heading: "২. স্বাধীনতা ও বিজ্ঞাপন",
        paragraphs: [
          "AHADEX Tools বিজ্ঞাপন (Google AdSense) দ্বারা সমর্থিত। তবে, আমাদের বিজ্ঞাপন পার্টনারদের আমাদের সম্পাদকীয় কনটেন্ট, টুল র্যাঙ্কিং বা রিভিউতে কোনো প্রভাব নেই।",
          "আমরা সাধারণ কনটেন্টের ছদ্মবেশে স্পনসর্ড পোস্ট লিখি না। ভবিষ্যতে কোনো অ্যাফিলিয়েট লিঙ্ক বা স্পনসর্ড প্লেসমেন্ট থাকলে তা স্পষ্টভাবে লেবেল করা হবে।"
        ]
      },
      {
        heading: "৩. প্রাইভেসি ও এআই",
        paragraphs: [
          "আমরা আমাদের টেকনিক্যাল ডকুমেন্টেশন বা নিবন্ধ তৈরি করতে AI ব্যবহার করি না। প্রতিটি কনটেন্ট আমাদের টিম লিখে।",
          "আমাদের টুলগুলো প্রাইভেসি-প্রথম আর্কিটেকচার দিয়ে তৈরি। আপনি আমাদের টুল দিয়ে যে ফাইল প্রসেস করেন, আমরা তা আপলোড, স্টোর বা বিশ্লেষণ করি না।"
        ]
      },
      {
        heading: "৪. সংশোধন নীতি",
        paragraphs: [
          "আমরা ১০০% নির্ভুলতার চেষ্টা করি, তবে ভুল হতে পারে। আপনি যদি কোনো তথ্যগত ত্রুটি, ভাঙা লিঙ্ক বা পুরানো টেকনিক্যাল তথ্য খুঁজে পান, তবে অবিলম্বে আমাদের সাথে যোগাযোগ করুন।",
          "আমরা আপনার মতামত পর্যালোচনা করব এবং প্রয়োজনে কনটেন্ট আপডেট করব এবং পেজের নিচে একটি সংশোধন নোট যোগ করব।"
        ]
      },
      {
        heading: "৫. যোগাযোগ",
        paragraphs: [
          `আমাদের সম্পাদকীয় মান সম্পর্কে প্রশ্ন থাকলে বা কোনো সমস্যা রিপোর্ট করতে চাইলে ${CONTACT}-এ ইমেইল করুন। আমরা ৪৮ ঘণ্টার মধ্যে উত্তর দেওয়ার চেষ্টা করি।`
        ]
      }
    ]
  }
};

export default function EditorialPolicyPage() {
  const { language } = useLanguage();
  return <TrustPageLayout content={EDITORIAL_POLICY_CONTENT[language]} icon="document" />;
}
