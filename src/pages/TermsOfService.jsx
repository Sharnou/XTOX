import XTOXHeader from "@/components/layout/XTOXHeader";
import XTOXFooter from "@/components/layout/XTOXFooter";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsOfService() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background font-inter">
      <XTOXHeader selectedCountry="" onCountryChange={() => {}} />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-3 mb-8">
          <FileText className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-black">Terms of Service</h1>
        </div>
        <p className="text-muted-foreground text-sm mb-6">Last updated: March 2026</p>
        <div className="space-y-6 text-sm leading-relaxed text-foreground">
          <section>
            <h2 className="text-lg font-bold mb-2">1. Acceptance of Terms</h2>
            <p>By using XTOX, you agree to these Terms of Service. If you do not agree, please do not use the platform. These terms apply to all users including buyers, sellers, and visitors.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold mb-2">2. Eligibility</h2>
            <p>You must be at least 18 years old to use XTOX. By registering, you confirm that the information you provide is accurate and complete.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold mb-2">3. Listing Rules</h2>
            <p>You may only post items that are legal to sell in your country. Prohibited content includes illegal goods, counterfeit products, weapons, adult content, and scam listings. Violations will result in immediate account suspension.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold mb-2">4. Ad Boosts & Payments</h2>
            <p>Premium Ad Boost (Featured status) costs $2 USD or equivalent per ad per week. Payment is made via Vodafone Cash to +201020326953. After sending payment, notify the AI Assistant and the admin will activate the boost manually. XTOX is not responsible for payment disputes.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold mb-2">5. User Conduct</h2>
            <p>You agree not to spam, harass, or defraud other users. Messaging must be used only for legitimate buying/selling inquiries. Abuse of the messaging system may result in account termination.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold mb-2">6. AI Features</h2>
            <p>XTOX AI generates listing suggestions automatically. These are suggestions only — you are responsible for the accuracy of your listings. AI-generated content that violates our rules is still your responsibility.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold mb-2">7. Ad Expiry</h2>
            <p>Ads expire after 30 days. You will be notified before expiry and can renew your listing from the Dashboard. Expired ads are removed automatically.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold mb-2">8. Limitation of Liability</h2>
            <p>XTOX is a platform connecting buyers and sellers. We do not guarantee the quality or legality of items listed. Transactions are between users — XTOX is not a party to any sale.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold mb-2">9. Changes to Terms</h2>
            <p>We may update these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>
          </section>
        </div>
      </div>
      <XTOXFooter />
    </div>
  );
}