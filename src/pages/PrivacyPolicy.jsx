import XTOXHeader from "@/components/layout/XTOXHeader";
import XTOXFooter from "@/components/layout/XTOXFooter";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background font-inter">
      <XTOXHeader selectedCountry="" onCountryChange={() => {}} />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-black">Privacy Policy</h1>
        </div>
        <p className="text-muted-foreground text-sm mb-6">Last updated: March 2026</p>
        <div className="space-y-6 text-sm leading-relaxed text-foreground">
          <section>
            <h2 className="text-lg font-bold mb-2">1. Information We Collect</h2>
            <p>XTOX collects information you provide when registering, posting ads, or contacting sellers. This includes your name, email address, phone number, location data, and listing content such as photos, videos, and descriptions.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold mb-2">2. How We Use Your Information</h2>
            <p>We use your data to operate and improve the marketplace, display your listings to potential buyers, send notifications about your ads and messages, detect fraud and maintain safety, and comply with legal obligations.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold mb-2">3. Data Sharing</h2>
            <p>We do not sell your personal data. We may share data with trusted service providers who assist in operating the platform, and as required by law. Your contact info is only visible to users you engage with directly.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold mb-2">4. AI Features</h2>
            <p>XTOX uses AI to analyze listing images and content for quality improvement. Images and descriptions you upload may be processed by AI models to auto-generate titles, descriptions, and keywords. This data is used solely to improve your listings.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold mb-2">5. Data Retention</h2>
            <p>Your data is retained as long as your account is active. Expired or deleted ads are removed after 30 days. You may request deletion of your account and all associated data at any time by contacting our admin.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold mb-2">6. Cookies</h2>
            <p>We use cookies to maintain your session, remember your preferences, and analyze usage patterns. See our Cookie Policy for details.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold mb-2">7. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data. To exercise these rights, contact us via the Admin Chat on this platform.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold mb-2">8. Contact</h2>
            <p>For privacy concerns, contact us through the Admin Panel chat or email Ahmed_sharnou@yahoo.com.</p>
          </section>
        </div>
      </div>
      <XTOXFooter />
    </div>
  );
}