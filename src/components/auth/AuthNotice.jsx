/**
 * Shown on pages that require login — explains registration process.
 * Base44 handles real email verification automatically via OTP.
 */
import { base44 } from "@/api/base44Client";
import { Mail, ShieldCheck, CheckCircle } from "lucide-react";

export default function AuthNotice({ redirectTo = "/" }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl font-black text-secondary">▲</span>
        </div>
        <h2 className="text-2xl font-black mb-2">Join XTOX</h2>
        <p className="text-muted-foreground mb-8">Create a free account to post ads, chat with sellers, and save favorites.</p>

        <div className="bg-card border border-border rounded-2xl p-5 mb-6 text-left space-y-3">
          {[
            { icon: Mail, text: "Enter your real email address to register" },
            { icon: ShieldCheck, text: "A verification code (OTP) is sent to your email" },
            { icon: CheckCircle, text: "Enter the code to verify and activate your account" },
          ].map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <span>{text}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => base44.auth.redirectToLogin(redirectTo)}
          className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-2xl hover:bg-primary/90 transition-colors"
        >
          Register / Login
        </button>
        <p className="text-xs text-muted-foreground mt-4">
          ✅ Real email verification required. No fake accounts allowed.
        </p>
      </div>
    </div>
  );
}