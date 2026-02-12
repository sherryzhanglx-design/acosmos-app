import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, Mail } from "lucide-react";
import { useLocation } from "wouter";

export default function PurchaseTerms() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen cosmos-bg">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-gradient-to-b from-black/60 to-transparent">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            className="text-white/80 hover:text-amber-400 hover:bg-white/5"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="flex items-center gap-3">
            <img 
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663273647099/brjZCKejzRbtntrI.jpg" 
              alt="A.Cosmos" 
              className="w-8 h-8 rounded-lg object-cover"
            />
            <span className="text-lg font-semibold text-white">A.Cosmos</span>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-amber-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Purchase & Subscription Terms</h1>
            <p className="text-white/60">Version 1.0 · Last updated: February 2026</p>
          </div>

          {/* Content Card */}
          <div className="glass-card rounded-2xl p-8 md:p-12 space-y-8 text-white/80 leading-relaxed">
            {/* Introduction */}
            <section>
              <p className="mb-4">
                These Purchase & Subscription Terms ("Purchase Terms") govern all paid features, subscriptions, 
                and purchases offered through the A.Cosmos web application and related services 
                (collectively, the "Service").
              </p>
              <p>
                By purchasing or subscribing to any paid features within A.Cosmos, you agree to these Purchase Terms 
                in addition to our{" "}
                <button onClick={() => navigate("/terms")} className="text-amber-400 hover:underline">
                  Terms of Use
                </button>{" "}
                and{" "}
                <button onClick={() => navigate("/privacy")} className="text-amber-400 hover:underline">
                  Privacy Policy
                </button>.
              </p>
            </section>

            {/* 1. Paid Features */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">1. Paid Features</h2>
              <p className="mb-4">
                A.Cosmos offers certain optional paid features and subscription plans.
              </p>
              <p className="mb-4">
                The specific features, pricing, and subscription options available to you will be displayed clearly 
                within the Service at the time of purchase.
              </p>
              <p>
                Prices may vary by region and are subject to change at any time. All prices shown include 
                applicable taxes unless otherwise stated.
              </p>
            </section>

            {/* 2. Payment Processing */}
            <section className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">2. Payment Processing</h2>
              <p className="mb-4">
                All payments for A.Cosmos subscriptions and paid features are processed through our secure 
                third-party payment provider.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                  <span>Our payment provider handles all payment processing and billing securely.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                  <span>We do not store your complete payment card details on our servers.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                  <span>
                    We receive limited transaction information (such as purchase confirmation and 
                    subscription status) solely to enable access to paid features.
                  </span>
                </li>
              </ul>
              <p className="mt-4 text-sm text-white/60">
                Your payment information is handled in accordance with industry-standard security practices and our Privacy Policy.
              </p>
            </section>

            {/* 3. Subscriptions */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">3. Subscriptions</h2>
              <p className="mb-4">If you purchase a subscription:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                  <span>
                    Your subscription will automatically renew at the end of each billing period unless canceled 
                    at least 24 hours before the renewal date.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                  <span>
                    Renewal charges will be applied to your payment method within 24 hours prior to the end 
                    of the current subscription period.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                  <span>
                    The subscription price and billing frequency will be clearly shown before you confirm your purchase.
                  </span>
                </li>
              </ul>
            </section>

            {/* 4. Managing and Canceling Subscriptions */}
            <section className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">4. Managing and Canceling Subscriptions</h2>
              <p className="mb-4">
                You can manage or cancel your subscription at any time through your account settings within the Service.
              </p>
              <div className="bg-black/20 rounded-lg p-4 mb-4">
                <p className="text-white font-medium">Account Settings → Subscription Management</p>
              </div>
              <p className="mb-2"><strong className="text-white">Please note:</strong></p>
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                  <span>Canceling your subscription will prevent future billing but will not refund the current billing period.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                  <span>
                    You will retain access to paid features until the end of your current billing period after cancellation.
                  </span>
                </li>
              </ul>
            </section>

            {/* 5. Free Trials */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">5. Free Trials (If Offered)</h2>
              <p className="mb-4">Some subscription plans may include a free trial period. If a free trial is offered:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                  <span>The trial duration will be clearly disclosed before you begin.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                  <span>
                    Unless canceled before the trial ends, your subscription will automatically convert to a paid 
                    subscription and your payment method will be charged.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                  <span>
                    Each user account is typically eligible for one free trial per subscription offering.
                  </span>
                </li>
              </ul>
            </section>

            {/* 6. Refunds */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">6. Refunds</h2>
              <p className="mb-4">
                Refund requests are handled on a case-by-case basis in accordance with our refund policy.
              </p>
              <p className="mb-4">
                To request a refund, please contact our support team with your purchase details and reason for the request.
              </p>
              <p className="mb-4">
                <strong className="text-white">Contact for refund requests:</strong>
              </p>
              <div className="bg-white/10 rounded-lg p-4">
                <p>
                  Email:{" "}
                  <a 
                    href="mailto:support@lifemaster.coach" 
                    className="text-amber-400 hover:underline"
                  >
                    support@lifemaster.coach
                  </a>
                </p>
              </div>
              <p className="mt-4 text-sm text-white/60">
                Refund decisions are made at our discretion and typically processed within 5-10 business days if approved.
              </p>
            </section>

            {/* 7. Changes to Pricing */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">7. Changes to Pricing and Subscription Terms</h2>
              <p className="mb-4">
                We reserve the right to update pricing or subscription offerings at any time.
              </p>
              <p className="mb-4">
                If changes affect an existing subscription, we will notify you in advance via email or through 
                the Service where required by applicable law.
              </p>
              <p>
                Continued use of the subscription after such changes constitutes acceptance of the updated pricing or terms.
              </p>
            </section>

            {/* 8. Contact */}
            <section className="bg-white/5 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-amber-400" />
                8. Contact
              </h2>
              <p className="mb-4">
                If you have questions about purchases or subscriptions related to A.Cosmos, you may contact us at:
              </p>
              <div className="space-y-2 mb-4">
                <p>
                  <strong className="text-white">Email:</strong>{" "}
                  <a href="mailto:support@lifemaster.coach" className="text-amber-400 hover:underline">
                    support@lifemaster.coach
                  </a>
                </p>
                <p>
                  <strong className="text-white">Company:</strong> LifeMaster Development LLC
                </p>
              </div>
              <p className="text-sm text-white/60">
                We aim to respond to all inquiries within 1-2 business days.
              </p>
            </section>

            {/* Related Links */}
            <section className="pt-6 border-t border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Related Documents</h3>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => navigate("/terms")}
                  className="px-4 py-2 bg-white/10 rounded-lg text-white/80 hover:bg-white/20 transition-colors"
                >
                  Terms of Use
                </button>
                <button 
                  onClick={() => navigate("/privacy")}
                  className="px-4 py-2 bg-white/10 rounded-lg text-white/80 hover:bg-white/20 transition-colors"
                >
                  Privacy Policy
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
