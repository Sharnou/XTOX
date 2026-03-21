import { Link } from "react-router-dom";


export default function XTOXFooter() {
  return (
    <footer className="bg-primary text-primary-foreground mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="text-2xl font-black mb-4">
              <span className="text-secondary">▲</span> XTOX
            </div>
            <p className="text-primary-foreground/60 text-sm leading-relaxed">
              The world's AI-powered classified marketplace. Buy and sell anything, anywhere.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-secondary">Categories</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/Vehicles" className="hover:text-secondary transition-colors">Vehicles</Link></li>
              <li><Link to="/Electronics" className="hover:text-secondary transition-colors">Electronics</Link></li>
              <li><Link to="/RealEstate" className="hover:text-secondary transition-colors">Real Estate</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-secondary">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/Sell" className="hover:text-secondary transition-colors">Post an Ad</Link></li>
              <li><Link to="/Dashboard" className="hover:text-secondary transition-colors">My Account</Link></li>
              <li><Link to="/Admin" className="hover:text-secondary transition-colors">Admin Panel</Link></li>
              <li><Link to="/ContactAdmin" className="hover:text-secondary transition-colors">Contact Admin</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-secondary">Legal</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/PrivacyPolicy" className="hover:text-secondary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/TermsOfService" className="hover:text-secondary transition-colors">Terms of Service</Link></li>
              <li><Link to="/CookiePolicy" className="hover:text-secondary transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/50 text-xs">© 2026 XTOX International Marketplace. All rights reserved.</p>
          <p className="text-primary-foreground/50 text-xs">Powered by AI • Built for the World</p>
        </div>
      </div>
    </footer>
  );
}