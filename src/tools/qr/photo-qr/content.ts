export const photoQrContent = {
  en: {
    heroTag: "QR + Photo",

    heroSubtitle:
      "Combine your photo with a QR code that people can scan to open a website, contact method, WiFi details, or another destination you choose. Design the placement, review the result, and export your image.",

    introHighlights: [
      {
        emoji: "🎯",
        title: "Custom QR Placement",
        text: "Choose where the QR code appears on your photo.",
      },
      {
        emoji: "🏷️",
        title: "Platform Recognition",
        text: "Optional platform icon in the QR centre.",
      },
      {
        emoji: "🎨",
        title: "11 Content Types",
        text: "Social links, websites, contact details, WiFi, and text.",
      },
      {
        emoji: "💎",
        title: "Full Pixel Dimensions",
        text: "Export at the source image's pixel dimensions.",
      },
      {
        emoji: "⚡",
        title: "Live Preview",
        text: "Review design changes before exporting.",
      },
      {
        emoji: "🔒",
        title: "Browser-Based Workflow",
        text: "Image processing is designed to run locally in your browser.",
      },
    ],

    introBlocks: [
      {
        emoji: "🪄",
        icon: "sparkle",
        title: "What is Photo QR?",
        text:
          "Photo QR combines an ordinary image with a generated QR code. Instead of sharing a QR code separately, you can place it directly on a photograph, promotional graphic, invitation, or other visual design. Anyone with a compatible QR scanner can scan the code to access the encoded destination.",
      },
      {
        emoji: "🛡️",
        icon: "shield",
        title: "How the QR code works",
        text:
          "A QR code stores information in a pattern of dark and light modules. This tool generates the code with a high error-correction setting and places it over your selected image. Error correction can help recover information when some modules are damaged or obscured, but it does not guarantee successful scanning. QR size, contrast, quiet-zone spacing, placement, print quality, and camera conditions all matter.",
      },
      {
        emoji: "🎁",
        icon: "gift",
        title: "Where can you use it?",
        text:
          "Add a scannable destination to business cards, product packaging, restaurant menus, event flyers, wedding invitations, social media graphics, promotional photographs, and printed materials. For example, a restaurant can place a menu link on a food photograph, while a business can add a contact or website QR code to a promotional image.",
      },
      {
        emoji: "🔐",
        icon: "lock",
        title: "Image privacy and processing",
        text:
          "Photo QR is designed around an in-browser image editing workflow using web technologies such as the HTML Canvas API. Your selected image is used to generate the preview and exported composition. Do not upload private or confidential images to any online tool unless you have reviewed and are comfortable with its actual data-handling practices.",
      },
    ],

    scanReliability: {
      title: "QR Code Scanning: Practical Guidelines",

      intro:
        "A QR code that looks clear on your screen may behave differently when printed or scanned from another device. Use these guidelines to improve readability, then test the exported image in the conditions where it will actually be used.",

      tips: [
        {
          title: "Choose a suitable physical size",
          text:
            "The QR code must contain enough visible detail for the scanner to distinguish its individual modules. A code that looks large on a phone screen may become too small on a printed card. Consider the intended scanning distance, the amount of encoded information, and the final physical dimensions.",
        },
        {
          title: "Maintain strong contrast",
          text:
            "Dark QR modules on a light, uniform background are generally easier to scan. Avoid placing the code over busy photographs, patterns, reflections, or similarly coloured areas. A clear white background or padding around the code can help separate it from the photo.",
        },
        {
          title: "Understand error correction",
          text:
            "This generator uses the high error-correction setting, Level H. QR error correction adds redundant information so a scanner may recover data when part of the symbol is damaged. The commonly quoted figure of approximately 30% describes a theoretical codeword recovery level, not permission to cover any arbitrary 30% of the visible QR image. A large centre logo or obstruction can still prevent scanning.",
        },
        {
          title: "Keep the quiet zone clear",
          text:
            "QR codes need an empty margin around the symbol so scanners can identify its boundaries. This is commonly called the quiet zone. Avoid cropping it, placing text or decorative elements too close to the code, or letting the photo blend into the QR boundary.",
        },
        {
          title: "Test the final output",
          text:
            "Export the finished image and scan it with another device. Test at the intended display size or print size, under realistic lighting, and from the expected distance. Check that the correct website, contact information, or other destination opens.",
        },
      ],

      disclaimer:
        "No QR generator can guarantee successful scanning in every situation. Always test the exported image before distributing it, printing large quantities, or using it on important materials.",
    },

    howTo: [
      {
        step: 1,
        title: "Upload a photo 📤",
        description:
          "Choose a JPG, PNG, or WebP image using the upload control. The current upload limit is 50 MB per file. Use an image with enough resolution for the size at which you plan to display or print the final design.",
      },
      {
        step: 2,
        title: "Choose the QR content 🎯",
        description:
          "Select the type of information you want the QR code to contain, such as a website, social profile, WhatsApp contact, phone number, email, WiFi details, SMS, digital contact card, or plain text.",
      },
      {
        step: 3,
        title: "Enter and check your information ✏️",
        description:
          "Provide the required details for your selected content type. Check spelling, phone numbers, URLs, and other information carefully. The encoded content determines what a scanner will open or display.",
      },
      {
        step: 4,
        title: "Adjust the QR design 🎨",
        description:
          "Choose a corner or position for the QR code. Adjust its size and surrounding background or padding. Keep the code clear of important photo details and preserve sufficient empty space around it.",
      },
      {
        step: 5,
        title: "Preview, test, and download ⬇️",
        description:
          "Review the complete composition before exporting it as a PNG image. Scan the exported file with another device to confirm that the QR code opens the intended destination.",
      },
    ],

    features: [
      {
        emoji: "🎯",
        title: "High Error Correction",
        description:
          "The QR generator uses Level H error correction. This adds redundancy that can improve recovery from some forms of damage, but size, contrast, placement, and unobstructed scanning space remain essential.",
      },
      {
        emoji: "🏷️",
        title: "Platform Icon Overlay",
        description:
          "A selected platform icon can be placed in the centre of the QR code to help communicate its intended destination. Centre overlays must remain appropriately sized so they do not interfere with scanning.",
      },
      {
        emoji: "🎨",
        title: "11 QR Content Types",
        description:
          "Create QR content for WhatsApp, Facebook, Instagram, Telegram, phone calls, email, WiFi, websites, SMS, contact cards, and plain text. Each type uses its corresponding data format or link structure.",
      },
      {
        emoji: "💎",
        title: "Source Pixel Dimensions",
        description:
          "The exported canvas is designed to use the source image's pixel width and height. The output is a newly rendered PNG composition, not an untouched copy of the original file. Image metadata and original encoding are not necessarily preserved.",
      },
      {
        emoji: "⚡",
        title: "Live Design Preview",
        description:
          "Review the QR placement and design while adjusting the available settings. Preview rendering may use a smaller working resolution to keep editing responsive.",
      },
      {
        emoji: "🔒",
        title: "In-Browser Image Workflow",
        description:
          "The image composition workflow uses browser technologies such as HTML Canvas. This avoids requiring a separate image-editing application. Review the privacy information and avoid using confidential images in tools whose data handling you have not verified.",
      },
    ],

    faq: [
      {
        question: "Will the QR code scan after I add it to a photo?",
        answer:
          "It can, provided the QR code remains clear and large enough to scan. Readability depends on contrast, quiet-zone spacing, the amount of encoded information, placement, print or display size, lighting, and camera quality. Always scan the exported image with another device before sharing or printing it.",
      },
      {
        question: "Does adding a QR code preserve my original photo?",
        answer:
          "The exported composition is rendered on a canvas using the source image's pixel dimensions. The result is a newly generated PNG image containing both the photo and QR overlay. It is not an untouched copy of the original file, so original metadata, file encoding, and every aspect of image quality are not guaranteed to remain identical.",
      },
      {
        question: "Which image formats can I upload?",
        answer:
          "The supported input formats are JPG, PNG, and WebP, with a maximum file size of 50 MB per file. The generated composition is exported as PNG.",
      },
      {
        question: "Can I use the generated image for business purposes?",
        answer:
          "You can use the generated composition in projects where you have the necessary rights to the source image and encoded content. You are responsible for permissions relating to photographs, logos, trademarks, personal information, and any third-party material you include. Using a platform name or icon does not imply endorsement by that platform.",
      },
      {
        question: "What information does the QR code contain?",
        answer:
          "The QR code stores the information entered for the selected content type. Depending on the type, scanning may open a website, start a phone call, compose an email or SMS, display WiFi connection details, show contact information, or display plain text. Check the generated destination before sharing the image.",
      },
      {
        question: "Does the QR code contain a tracking system?",
        answer:
          "A standard QR code stores the encoded information supplied during generation. It does not automatically provide scan analytics or visitor tracking. If you encode a third-party tracking URL, the tracking behaviour belongs to that destination, not to the QR image itself.",
      },
      {
        question: "Why does my QR code sometimes fail to scan?",
        answer:
          "Common causes include a QR code that is too small, insufficient contrast, a missing quiet zone, a centre logo that covers too much of the symbol, image compression, glare, or a camera that cannot focus at the selected distance. Increase the usable QR area, keep the surrounding margin clear, and test the exported image.",
      },
      {
        question: "Does it work on mobile devices?",
        answer:
          "The page is designed with a responsive interface for different screen sizes. Actual image-processing limits and performance depend on the browser, available device memory, image dimensions, and operating system. Test the workflow on your device before working with large images.",
      },
    ],

    privacyNote:
      "Photo QR uses an in-browser image editing workflow. Your image is used to create the preview and final composition. Avoid uploading confidential or sensitive photographs to any online service unless you have verified its data-handling practices.",
  },

  bn: {
    heroTag: "QR + ছবি",

    heroSubtitle:
      "আপনার ছবির সঙ্গে একটি QR কোড যুক্ত করুন, যা স্ক্যান করলে ওয়েবসাইট, যোগাযোগের মাধ্যম, WiFi তথ্য অথবা আপনার নির্বাচিত অন্য কোনো গন্তব্য খোলা যাবে। ডিজাইন সাজান, ফলাফল দেখুন এবং ছবিটি এক্সপোর্ট করুন।",

    introHighlights: [
      {
        emoji: "🎯",
        title: "QR-এর অবস্থান নিয়ন্ত্রণ",
        text: "ছবির কোন জায়গায় QR কোড থাকবে তা বেছে নিন।",
      },
      {
        emoji: "🏷️",
        title: "প্ল্যাটফর্ম আইকন",
        text: "QR-এর মাঝখানে নির্বাচিত প্ল্যাটফর্মের আইকন।",
      },
      {
        emoji: "🎨",
        title: "১১ ধরনের কনটেন্ট",
        text: "সোশ্যাল লিংক, ওয়েবসাইট, যোগাযোগ, WiFi ও টেক্সট।",
      },
      {
        emoji: "💎",
        title: "মূল পিক্সেল ডাইমেনশন",
        text: "মূল ছবির পিক্সেল প্রস্থ ও উচ্চতায় এক্সপোর্ট।",
      },
      {
        emoji: "⚡",
        title: "লাইভ প্রিভিউ",
        text: "এক্সপোর্টের আগে ডিজাইনের পরিবর্তন দেখুন।",
      },
      {
        emoji: "🔒",
        title: "ব্রাউজারভিত্তিক কাজ",
        text: "ছবি প্রসেসিং ব্রাউজারেই করার জন্য তৈরি।",
      },
    ],

    introBlocks: [
      {
        emoji: "🪄",
        icon: "sparkle",
        title: "Photo QR কী?",
        text:
          "Photo QR একটি সাধারণ ছবির সঙ্গে তৈরি করা QR কোড যুক্ত করে। আলাদা QR কোড শেয়ার করার পরিবর্তে আপনি সেটি সরাসরি ছবি, প্রচারণামূলক ডিজাইন, আমন্ত্রণপত্র বা অন্য কোনো ভিজ্যুয়াল ডিজাইনের ওপর বসাতে পারেন। উপযুক্ত QR স্ক্যানার ব্যবহার করে যে কেউ কোডটি স্ক্যান করে নির্ধারিত তথ্য বা গন্তব্যে যেতে পারবেন।",
      },
      {
        emoji: "🛡️",
        icon: "shield",
        title: "QR কোড কীভাবে কাজ করে?",
        text:
          "QR কোড আলো ও অন্ধকার রঙের ছোট ছোট মডিউলের বিন্যাসে তথ্য সংরক্ষণ করে। এই টুল উচ্চ Error Correction সেটিং Level H ব্যবহার করে কোড তৈরি করে এবং নির্বাচিত ছবির ওপর বসায়। Error Correction কোডের কিছু অংশ ক্ষতিগ্রস্ত বা আড়াল হলেও তথ্য উদ্ধার করতে সাহায্য করতে পারে। তবে সফল স্ক্যানের নিশ্চয়তা দেয় না। QR-এর আকার, কনট্রাস্ট, চারপাশের ফাঁকা জায়গা, অবস্থান, প্রিন্টের মান এবং ক্যামেরার পরিবেশ গুরুত্বপূর্ণ।",
      },
      {
        emoji: "🎁",
        icon: "gift",
        title: "কোথায় ব্যবহার করতে পারেন?",
        text:
          "বিজনেস কার্ড, পণ্যের প্যাকেজিং, রেস্টুরেন্ট মেনু, ইভেন্ট ফ্লায়ার, বিয়ের আমন্ত্রণপত্র, সোশ্যাল মিডিয়া গ্রাফিক্স, প্রচারণামূলক ছবি এবং প্রিন্ট করা উপকরণে QR কোড যুক্ত করতে পারেন। যেমন, রেস্টুরেন্ট খাবারের ছবির ওপর মেনুর লিংক দিতে পারে, আবার কোনো ব্যবসা প্রতিষ্ঠানের প্রচারণামূলক ছবিতে যোগাযোগের তথ্য বা ওয়েবসাইটের QR যুক্ত করতে পারে।",
      },
      {
        emoji: "🔐",
        icon: "lock",
        title: "ছবির গোপনীয়তা ও প্রসেসিং",
        text:
          "Photo QR-এর ছবি সম্পাদনার প্রক্রিয়া ব্রাউজারের ভেতরে চালানোর জন্য তৈরি এবং এতে HTML Canvas API-এর মতো ওয়েব প্রযুক্তি ব্যবহার করা হয়। নির্বাচিত ছবি থেকে প্রিভিউ ও এক্সপোর্ট করা ডিজাইন তৈরি হয়। কোনো অনলাইন টুলে ব্যক্তিগত বা গোপনীয় ছবি দেওয়ার আগে তার প্রকৃত ডেটা ব্যবস্থাপনা সম্পর্কে নিশ্চিত হয়ে নিন।",
      },
    ],

    scanReliability: {
      title: "QR কোড স্ক্যান: ব্যবহারিক নির্দেশনা",

      intro:
        "স্ক্রিনে পরিষ্কার দেখালেও প্রিন্ট করার পর বা অন্য ডিভাইস দিয়ে স্ক্যান করলে QR কোড ভিন্নভাবে কাজ করতে পারে। স্ক্যানের সুবিধার জন্য নিচের নির্দেশনাগুলো অনুসরণ করুন এবং যে পরিবেশে ব্যবহার করবেন, সেখানে এক্সপোর্ট করা ছবিটি পরীক্ষা করুন।",

      tips: [
        {
          title: "উপযুক্ত আকার নির্বাচন করুন",
          text:
            "QR কোডের প্রতিটি ছোট মডিউল যেন স্ক্যানার আলাদা করে বুঝতে পারে, সে জন্য যথেষ্ট আকার প্রয়োজন। ফোনের স্ক্রিনে বড় দেখালেও প্রিন্ট করা কার্ডে কোডটি খুব ছোট হয়ে যেতে পারে। স্ক্যানের দূরত্ব, কোডে থাকা তথ্যের পরিমাণ এবং চূড়ান্ত প্রিন্টের মাপ বিবেচনা করুন।",
        },
        {
          title: "পর্যাপ্ত কনট্রাস্ট রাখুন",
          text:
            "হালকা ও একরঙা ব্যাকগ্রাউন্ডের ওপর গাঢ় QR মডিউল সাধারণত স্ক্যান করা সহজ। জটিল ছবি, প্যাটার্ন, প্রতিফলন বা কাছাকাছি রঙের জায়গার ওপর কোড বসানো এড়িয়ে চলুন। QR-এর চারপাশে সাদা ব্যাকগ্রাউন্ড বা পর্যাপ্ত প্যাডিং রাখলে ছবির সঙ্গে কোডের পার্থক্য বোঝা সহজ হয়।",
        },
        {
          title: "Error Correction বুঝে ব্যবহার করুন",
          text:
            "এই জেনারেটর উচ্চ Error Correction সেটিং Level H ব্যবহার করে। এতে অতিরিক্ত তথ্য যুক্ত থাকে, যা QR-এর কিছু অংশ ক্ষতিগ্রস্ত হলেও তথ্য উদ্ধার করতে সাহায্য করতে পারে। প্রচলিত প্রায় ৩০% পরিমাণটি তাত্ত্বিক codeword recovery capacity বোঝায়; এর অর্থ QR-এর যেকোনো ৩০% অংশ ঢেকে রাখলেও স্ক্যান হবে, তা নয়। মাঝখানে বড় লোগো বা অন্য কিছু বসালে স্ক্যান ব্যর্থ হতে পারে।",
        },
        {
          title: "Quiet Zone ফাঁকা রাখুন",
          text:
            "QR কোডের সীমানা শনাক্ত করার জন্য চারপাশে ফাঁকা মার্জিন প্রয়োজন। একে Quiet Zone বলা হয়। এই জায়গা কেটে ফেলবেন না, খুব কাছে লেখা বা ডিজাইন বসাবেন না এবং ছবির ব্যাকগ্রাউন্ডের সঙ্গে QR-এর সীমানা মিশে যেতে দেবেন না।",
        },
        {
          title: "চূড়ান্ত ছবি পরীক্ষা করুন",
          text:
            "ডিজাইন এক্সপোর্ট করার পর অন্য একটি ডিভাইস দিয়ে স্ক্যান করুন। বাস্তবে যে আকারে দেখানো বা প্রিন্ট করা হবে, সেই আকারে এবং স্বাভাবিক আলোতে পরীক্ষা করুন। সঠিক ওয়েবসাইট, যোগাযোগের তথ্য বা অন্য নির্ধারিত গন্তব্য খুলছে কি না নিশ্চিত করুন।",
        },
      ],

      disclaimer:
        "কোনো QR জেনারেটর সব পরিস্থিতিতে সফল স্ক্যানের নিশ্চয়তা দিতে পারে না। বিতরণ, বেশি সংখ্যায় প্রিন্ট বা গুরুত্বপূর্ণ কাজে ব্যবহারের আগে এক্সপোর্ট করা ছবিটি অবশ্যই পরীক্ষা করুন।",
    },

    howTo: [
      {
        step: 1,
        title: "ছবি আপলোড করুন 📤",
        description:
          "আপলোড অপশন ব্যবহার করে JPG, PNG অথবা WebP ছবি নির্বাচন করুন। প্রতি ফাইলের বর্তমান সর্বোচ্চ সীমা ৫০ MB। চূড়ান্ত ডিজাইন যে আকারে দেখাবেন বা প্রিন্ট করবেন, সেই অনুযায়ী যথেষ্ট রেজোলিউশনের ছবি ব্যবহার করুন।",
      },
      {
        step: 2,
        title: "QR-এর কনটেন্ট নির্বাচন করুন 🎯",
        description:
          "QR কোডে কী ধরনের তথ্য রাখতে চান তা বেছে নিন। যেমন ওয়েবসাইট, সোশ্যাল প্রোফাইল, WhatsApp যোগাযোগ, ফোন নম্বর, ইমেইল, WiFi তথ্য, SMS, ডিজিটাল কন্টাক্ট কার্ড অথবা সাধারণ টেক্সট।",
      },
      {
        step: 3,
        title: "তথ্য লিখে যাচাই করুন ✏️",
        description:
          "নির্বাচিত কনটেন্টের প্রয়োজনীয় তথ্য দিন। বানান, ফোন নম্বর, URL এবং অন্যান্য তথ্য ভালোভাবে পরীক্ষা করুন। স্ক্যান করার পর কী খুলবে বা দেখাবে, তা এই তথ্যের ওপর নির্ভর করে।",
      },
      {
        step: 4,
        title: "QR ডিজাইন সাজান 🎨",
        description:
          "ছবির কোন কোণায় বা অবস্থানে QR থাকবে তা নির্বাচন করুন। আকার এবং চারপাশের ব্যাকগ্রাউন্ড বা প্যাডিং নিয়ন্ত্রণ করুন। ছবির গুরুত্বপূর্ণ অংশের ওপর কোড বসানো এড়িয়ে চলুন এবং চারপাশে যথেষ্ট ফাঁকা জায়গা রাখুন।",
      },
      {
        step: 5,
        title: "প্রিভিউ, পরীক্ষা ও ডাউনলোড করুন ⬇️",
        description:
          "PNG হিসেবে এক্সপোর্ট করার আগে সম্পূর্ণ ডিজাইন দেখে নিন। অন্য একটি ডিভাইস দিয়ে এক্সপোর্ট করা ছবিটি স্ক্যান করে নিশ্চিত করুন যে সঠিক গন্তব্য খুলছে।",
      },
    ],

    features: [
      {
        emoji: "🎯",
        title: "High Error Correction",
        description:
          "QR জেনারেটর Level H Error Correction ব্যবহার করে। এটি কিছু ধরনের ক্ষতির পর তথ্য উদ্ধার করতে সাহায্য করতে পারে। তবে সঠিক আকার, কনট্রাস্ট, অবস্থান এবং চারপাশের ফাঁকা জায়গা বজায় রাখা জরুরি।",
      },
      {
        emoji: "🏷️",
        title: "মাঝখানে প্ল্যাটফর্ম আইকন",
        description:
          "QR কোডের মাঝখানে নির্বাচিত প্ল্যাটফর্মের আইকন বসানো যায়, যাতে ব্যবহারকারী সম্ভাব্য গন্তব্য সম্পর্কে ধারণা পান। তবে আইকনের আকার এমন রাখতে হবে যেন QR স্ক্যান করতে সমস্যা না হয়।",
      },
      {
        emoji: "🎨",
        title: "১১ ধরনের QR কনটেন্ট",
        description:
          "WhatsApp, Facebook, Instagram, Telegram, ফোন কল, ইমেইল, WiFi, ওয়েবসাইট, SMS, কন্টাক্ট কার্ড এবং সাধারণ টেক্সটের জন্য QR তৈরি করুন। প্রতিটি ধরনের জন্য উপযুক্ত তথ্যের বিন্যাস বা লিংক ব্যবহার করা হয়।",
      },
      {
        emoji: "💎",
        title: "মূল ছবির পিক্সেল ডাইমেনশন",
        description:
          "এক্সপোর্ট করা ক্যানভাস মূল ছবির পিক্সেল প্রস্থ ও উচ্চতা ব্যবহার করার জন্য তৈরি। ফলাফলটি নতুন করে রেন্ডার করা PNG, মূল ফাইলের অপরিবর্তিত কপি নয়। তাই মূল metadata ও encoding হুবহু থাকবে এমন নিশ্চয়তা নেই।",
      },
      {
        emoji: "⚡",
        title: "লাইভ ডিজাইন প্রিভিউ",
        description:
          "উপলভ্য সেটিংস পরিবর্তনের সঙ্গে QR-এর অবস্থান ও ডিজাইন দেখে নিতে পারবেন। দ্রুত সম্পাদনার সুবিধার জন্য প্রিভিউ কখনো মূল ছবির চেয়ে কম রেজোলিউশনে তৈরি হতে পারে।",
      },
      {
        emoji: "🔒",
        title: "ব্রাউজারভিত্তিক ছবি সম্পাদনা",
        description:
          "ছবি সাজানোর কাজে HTML Canvas-এর মতো ব্রাউজার প্রযুক্তি ব্যবহার করা হয়। এতে আলাদা ছবি সম্পাদনার সফটওয়্যার প্রয়োজন হয় না। গোপনীয় ছবি ব্যবহারের আগে সংশ্লিষ্ট টুলের ডেটা ব্যবস্থাপনা সম্পর্কে নিশ্চিত হোন।",
      },
    ],

    faq: [
      {
        question: "ছবিতে QR যোগ করার পরও কি স্ক্যান হবে?",
        answer:
          "QR কোড যথেষ্ট বড় ও পরিষ্কার থাকলে স্ক্যান করা সম্ভব। এর নির্ভরযোগ্যতা কনট্রাস্ট, Quiet Zone, তথ্যের পরিমাণ, অবস্থান, প্রিন্ট বা স্ক্রিনের আকার, আলো এবং ক্যামেরার ওপর নির্ভর করে। শেয়ার বা প্রিন্ট করার আগে অন্য একটি ডিভাইস দিয়ে এক্সপোর্ট করা ছবিটি পরীক্ষা করুন।",
      },
      {
        question: "QR যোগ করলে কি মূল ছবির কোয়ালিটি অপরিবর্তিত থাকে?",
        answer:
          "এক্সপোর্ট করা ডিজাইন মূল ছবির পিক্সেল ডাইমেনশন ব্যবহার করে ক্যানভাসে রেন্ডার করা হয়। ফলাফলটি QR ওভারলেসহ নতুন PNG ছবি। এটি মূল ফাইলের অপরিবর্তিত কপি নয়। তাই মূল metadata, file encoding এবং ছবির সব গুণাগুণ হুবহু থাকবে এমন নিশ্চয়তা দেওয়া যায় না।",
      },
      {
        question: "কোন ছবির ফরম্যাট আপলোড করা যায়?",
        answer:
          "JPG, PNG এবং WebP ফরম্যাটের ছবি আপলোড করা যায়। প্রতি ফাইলের সর্বোচ্চ সীমা ৫০ MB। তৈরি করা ডিজাইন PNG ফরম্যাটে এক্সপোর্ট হয়।",
      },
      {
        question: "তৈরি করা ছবি কি ব্যবসায়িক কাজে ব্যবহার করা যাবে?",
        answer:
          "যে ছবির এবং কনটেন্টের প্রয়োজনীয় ব্যবহারের অধিকার আপনার আছে, সেই উপকরণ দিয়ে তৈরি ডিজাইন ব্যবসায়িক প্রকল্পে ব্যবহার করতে পারেন। ছবি, লোগো, ট্রেডমার্ক, ব্যক্তিগত তথ্য এবং তৃতীয় পক্ষের উপকরণের অনুমতির দায়িত্ব আপনার। কোনো প্ল্যাটফর্মের নাম বা আইকন ব্যবহার করলেই সেই প্ল্যাটফর্মের অনুমোদন বোঝায় না।",
      },
      {
        question: "QR কোডে কী ধরনের তথ্য থাকে?",
        answer:
          "QR কোডে নির্বাচিত কনটেন্ট অনুযায়ী তথ্য সংরক্ষিত থাকে। স্ক্যান করলে ওয়েবসাইট খুলতে পারে, ফোন কল শুরু হতে পারে, ইমেইল বা SMS লেখার অপশন আসতে পারে, WiFi তথ্য দেখাতে পারে, যোগাযোগের তথ্য বা সাধারণ টেক্সট দেখাতে পারে। শেয়ার করার আগে গন্তব্যটি যাচাই করুন।",
      },
      {
        question: "QR কোডে কি স্বয়ংক্রিয় tracking থাকে?",
        answer:
          "সাধারণ QR কোড তৈরির সময় দেওয়া তথ্যই সংরক্ষণ করে। এটি নিজে থেকে scan analytics বা visitor tracking চালু করে না। আপনি যদি tracking-যুক্ত কোনো third-party URL ব্যবহার করেন, সেই tracking সংশ্লিষ্ট ওয়েবসাইটের বিষয়, QR ছবির নিজস্ব ফিচার নয়।",
      },
      {
        question: "আমার QR কোড মাঝে মাঝে স্ক্যান হয় না কেন?",
        answer:
          "QR খুব ছোট হওয়া, কনট্রাস্ট কম থাকা, Quiet Zone না থাকা, মাঝের লোগো বেশি জায়গা ঢেকে ফেলা, ছবির compression, আলো প্রতিফলিত হওয়া অথবা ক্যামেরার focus সমস্যা হওয়ার কারণে স্ক্যান ব্যর্থ হতে পারে। QR-এর কার্যকর জায়গা বাড়ান, চারপাশ ফাঁকা রাখুন এবং এক্সপোর্ট করা ছবিটি পরীক্ষা করুন।",
      },
      {
        question: "মোবাইল ফোনে কি টুলটি ব্যবহার করা যাবে?",
        answer:
          "পেজটি বিভিন্ন স্ক্রিনের জন্য responsive interface দিয়ে তৈরি। তবে ছবি প্রসেসিংয়ের গতি ও সীমা ব্রাউজার, ডিভাইসের মেমরি, ছবির ডাইমেনশন এবং অপারেটিং সিস্টেমের ওপর নির্ভর করে। বড় ছবি নিয়ে কাজ করার আগে নিজের ডিভাইসে workflow পরীক্ষা করুন।",
      },
    ],

    privacyNote:
      "Photo QR-এ ব্রাউজারের ভেতরে ছবি সম্পাদনার workflow ব্যবহার করা হয়। আপনার ছবি প্রিভিউ এবং চূড়ান্ত ডিজাইন তৈরির কাজে ব্যবহৃত হয়। কোনো অনলাইন সেবায় গোপনীয় বা সংবেদনশীল ছবি ব্যবহারের আগে তার ডেটা ব্যবস্থাপনা সম্পর্কে নিশ্চিত হয়ে নিন।",
  },
};

export type PhotoQrContent = typeof photoQrContent;
export type PhotoQrLangContent = typeof photoQrContent.en;
