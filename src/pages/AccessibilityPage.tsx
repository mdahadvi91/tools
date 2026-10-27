import { TrustPageLayout } from "@components/trust/TrustPageLayout";
import { useLanguage } from "@contexts/LanguageContext";

const CONTACT = "mdahadvi91@gmail.com";
const UPDATED_EN = "Last updated: October 2026";
const UPDATED_BN = "সর্বশেষ আপডেট: অক্টোবর ২০২৬";

export const ACCESSIBILITY_CONTENT = {
  en: {
    eyebrow: "Accessibility Statement",
    title: "Accessible to everyone.",
    subtitle: "We want everyone to be able to use AHADEX Tools, regardless of ability or technology. We continuously work to improve accessibility across the site.",
    lastUpdated: UPDATED_EN,
    contactEmail: CONTACT,
    sections: [
      {
        heading: "1. Our Commitment",
        paragraphs: [
          "AHADEX Tools aims to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA. These guidelines explain how to make web content more accessible for people with disabilities.",
          "Because our tools run entirely in the browser, we have unique advantages: no waiting for server uploads or downloads, immediate visual feedback, and full functionality even on slower connections."
        ]
      },
      {
        heading: "2. Keyboard Navigation",
        paragraphs: [
          "We strive to ensure that all interactive elements (buttons, form inputs, links) can be accessed and operated using only a keyboard.",
          "If you encounter any focus traps or unreachable elements, please let us know so we can fix them."
        ]
      },
      {
        heading: "3. Screen Readers and Assistive Technology",
        paragraphs: [
          "We use semantic HTML elements and ARIA (Accessible Rich Internet Applications) attributes where necessary to ensure our tools are understandable by screen readers.",
          "Our color contrast ratios are tested to meet WCAG AA standards for text legibility."
        ]
      },
      {
        heading: "4. Known Limitations",
        paragraphs: [
          "While we aim for full accessibility, some complex visual tools (like the CV builder drag-and-drop interface or the visiting card canvas) may still present challenges for certain screen readers.",
          "We are actively working on providing text-based alternatives and better keyboard controls for these visual tools."
        ]
      },
      {
        heading: "5. Feedback and Contact",
        paragraphs: [
          `We welcome your feedback on the accessibility of AHADEX Tools. If you encounter accessibility barriers, please email us at ${CONTACT}.`,
          "We aim to respond to accessibility feedback within 2 business days."
        ]
      }
    ]
  },
  bn: {
    eyebrow: "অ্যাক্সেসিবিলিটি স্টেটমেন্ট",
    title: "সবার জন্য অ্যাক্সেসযোগ্য।",
    subtitle: "আমরা চাই যে যে কেউ, তার সামর্থ্য বা প্রযুক্তি যাই হোক না কেন, AHADEX Tools ব্যবহার করতে পারুক। সাইট জুড়ে অ্যাক্সেসিবিলিটি উন্নত করতে আমরা নিরন্তর কাজ করছি।",
    lastUpdated: UPDATED_BN,
    contactEmail: CONTACT,
    sections: [
      {
        heading: "১. আমাদের অঙ্গীকার",
        paragraphs: [
          "AHADEX Tools ওয়েব কনটেন্ট অ্যাক্সেসিবিলিটি গাইডলাইন (WCAG) 2.1 লেভেল AA মেনে চলার লক্ষ্য রাখে। এই গাইডলাইনগুলো প্রতিবন্ধী ব্যক্তিদের জন্য ওয়েব কনটেন্ট আরও অ্যাক্সেসযোগ্য করার উপায় ব্যাখ্যা করে।",
          "যেহেতু আমাদের টুলগুলো সম্পূর্ণ ব্রাউজারে চলে, তাই আমাদের কিছু অনন্য সুবিধা আছে: সার্ভার আপলোড বা ডাউনলোডের জন্য অপেক্ষা করতে হয় না, সাথে সাথে ভিজ্যুয়াল ফিডব্যাক পাওয়া যায় এবং ধীর ইন্টারনেট সংযোগেও পুরোপুরি কাজ করে।"
        ]
      },
      {
        heading: "২. কীবোর্ড নেভিগেশন",
        paragraphs: [
          "আমরা নিশ্চিত করার চেষ্টা করি যে সমস্ত ইন্টারঅ্যাকটিভ উপাদান (বাটন, ফর্ম ইনপুট, লিঙ্ক) শুধুমাত্র কীবোর্ড ব্যবহার করে অ্যাক্সেস এবং পরিচালনা করা যায়।",
          "আপনি যদি কোনো ফোকাস ট্র্যাপ বা অপ্রাপ্য উপাদানের সম্মুখীন হন, তবে অনুগ্রহ করে আমাদের জানান যাতে আমরা সেগুলো ঠিক করতে পারি।"
        ]
      },
      {
        heading: "৩. স্ক্রিন রিডার এবং সহায়ক প্রযুক্তি",
        paragraphs: [
          "আমরা সিম্যান্টিক HTML এলিমেন্ট এবং প্রয়োজনে ARIA অ্যাট্রিবিউট ব্যবহার করি যাতে আমাদের টুলগুলো স্ক্রিন রিডার দ্বারা বোধগম্য হয়।",
          "টেক্সটের পাঠযোগ্যতার জন্য আমাদের রঙের বৈসাদৃশ্য (color contrast) অনুপাত WCAG AA স্ট্যান্ডার্ড পূরণ করার জন্য পরীক্ষা করা হয়।"
        ]
      },
      {
        heading: "৪. পরিচিত সীমাবদ্ধতা",
        paragraphs: [
          "যদিও আমরা সম্পূর্ণ অ্যাক্সেসিবিলিটির লক্ষ্য রাখি, কিছু জটিল ভিজ্যুয়াল টুল (যেমন CV বিল্ডারের ড্র্যাগ-অ্যান্ড-ড্রপ ইন্টারফেস বা ভিজিটিং কার্ড ক্যানভাস) নির্দিষ্ট স্ক্রিন রিডারের জন্য এখনও চ্যালেঞ্জ তৈরি করতে পারে।",
          "আমরা এই ভিজ্যুয়াল টুলগুলোর জন্য টেক্সট-ভিত্তিক বিকল্প এবং আরও ভালো কীবোর্ড কন্ট্রোল প্রদানের জন্য সক্রিয়ভাবে কাজ করছি।"
        ]
      },
      {
        heading: "৫. মতামত এবং যোগাযোগ",
        paragraphs: [
          `AHADEX Tools-এর অ্যাক্সেসিবিলিটি নিয়ে আপনার মতামত আমরা স্বাগত জানাই। আপনি যদি অ্যাক্সেসিবিলিটি সংক্রান্ত কোনো বাধার সম্মুখীন হন, তবে ${CONTACT}-এ ইমেইল করুন।`,
          "আমরা ২ কর্মদিবসের মধ্যে অ্যাক্সেসিবিলিটি ফিডব্যাকের উত্তর দেওয়ার চেষ্টা করি।"
        ]
      }
    ]
  }
};

export default function AccessibilityPage() {
  const { language } = useLanguage();
  return <TrustPageLayout content={ACCESSIBILITY_CONTENT[language]} icon="access" />;
}
