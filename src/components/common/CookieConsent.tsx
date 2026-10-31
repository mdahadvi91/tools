import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
    // এখানে অ্যানালিটিক্স বা অ্যাডসেন্স স্ক্রিপ্ট লোড করার লজিক বসাতে পারো।
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] p-4 sm:p-6">
      <div className="mx-auto max-w-4xl rounded-2xl border border-silk-rose/20 bg-white p-4 shadow-2xl dark:bg-[#0A0B1E] sm:flex sm:items-center sm:justify-between sm:gap-6">
        <p className="mb-4 text-sm text-light-textSecondary dark:text-dark-textSecondary sm:mb-0">
          We use cookies to improve your experience and analyze traffic. By clicking "Accept", you consent to our use of cookies. Read our{" "}
          <Link to="/privacy" className="text-silk-rose underline hover:text-silk-wine">Privacy Policy</Link>.
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            onClick={handleDecline}
            className="rounded-xl px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="rounded-xl bg-silk-rose px-6 py-2 text-sm font-bold text-white hover:bg-silk-wine"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
