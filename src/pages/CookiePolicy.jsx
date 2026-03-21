import XTOXHeader from "@/components/layout/XTOXHeader";
import XTOXFooter from "@/components/layout/XTOXFooter";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Cookie } from "lucide-react";

export default function CookiePolicy() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background font-inter">
      <XTOXHeader selectedCountry="" onCountryChange={() => {}} />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-3 mb-8">
          <Cookie className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-black">Cookie Policy</h1>
        </div>
        <p className="text-muted-foreground text-sm mb-6">Last updated: March 2026</p>
        <div className="space-y-6 text-sm leading-relaxed text-foreground">
          <section>
            <h2 className="text-lg font-bold mb-2">1. What Are Cookies?</h2>
            <p>Cookies are small text files stored on your device when you visit XTOX. They help us remember your preferences, keep you logged in, and understand how you use our platform.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold mb-2">2. Types of Cookies We Use</h2>
            <ul className="list-disc ml-5 space-y-1">
              <li><strong>Essential Cookies:</strong> Required for the platform to function. Cannot be disabled.</li>
              <li><strong>Session Cookies:</strong> Keep you logged in during your visit. Deleted when you close your browser.</li>
              <li><strong>Preference Cookies:</strong> Remember your country, language, and display settings.</li>
              <li><strong>Analytics Cookies:</strong> Help us understand page visits and improve the platform.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-bold mb-2">3. How Long Do Cookies Last?</h2>
            <p>Session cookies expire when you close your browser. Preference cookies last up to 12 months. Analytics cookies last up to 6 months.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold mb-2">4. Third-Party Cookies</h2>
            <p>We may use third-party services (such as analytics tools) that set their own cookies. These are governed by the respective third-party privacy policies.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold mb-2">5. Managing Cookies</h2>
            <p>You can control cookies through your browser settings. Disabling essential cookies may affect platform functionality. Most browsers allow you to view, delete, and block cookies from the settings menu.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold mb-2">6. Contact</h2>
            <p>If you have questions about our use of cookies, contact us via the Admin Chat on XTOX or email Ahmed_sharnou@yahoo.com.</p>
          </section>
        </div>
      </div>
      <XTOXFooter />
    </div>
  );
}