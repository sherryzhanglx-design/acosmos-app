import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Mail, Database, Lock, Trash2, Globe } from "lucide-react";
import { useLocation } from "wouter";

export default function Privacy() {
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
              <Shield className="w-8 h-8 text-amber-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Privacy Policy</h1>
            <p className="text-white/60">Last updated: February 11, 2026</p>
          </div>

          {/* Content Card */}
          <div className="glass-card rounded-2xl p-8 md:p-12 space-y-8 text-white/80 leading-relaxed">
            {/* Introduction */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Introduction</h2>
              <p className="mb-4">
                LifeMaster Development LLC ("we," "our," or "us") operates A.Cosmos, an AI-powered self-reflection 
                and life exploration application designed to support personal insight, emotional awareness, and 
                reflective dialogue.
              </p>
              <p>
                This Privacy Policy explains how we collect, use, store, and protect your information when you use 
                our website and web application (collectively, the "Service"). We are committed to handling 
                personal information responsibly and transparently.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-amber-400" />
                Information We Collect
              </h2>
              
              <h3 className="text-lg font-semibold text-white mt-6 mb-3">Account Information</h3>
              <p className="mb-4">
                When you create an account, we collect basic information such as your name, email address, and 
                authentication credentials. This information is necessary to create and manage your account and 
                provide access to the Service.
              </p>

              <h3 className="text-lg font-semibold text-white mt-6 mb-3">Conversation Data</h3>
              <p className="mb-4">
                When you interact with the Service, we process and store the messages you submit and the AI-generated 
                responses you receive. This allows us to support conversation continuity and user-requested features 
                that rely on contextual understanding.
              </p>

              <h3 className="text-lg font-semibold text-white mt-6 mb-3">Usage Information</h3>
              <p>
                We automatically collect limited technical and usage information, such as device type, operating system, 
                session duration, and feature interaction patterns. This information helps us operate, maintain, and 
                improve the Service.
              </p>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">How We Use Your Information</h2>
              <p className="mb-4">We use the information we collect to:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                  <span>Provide, operate, and maintain the Service;</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                  <span>Enable conversation continuity and features you request;</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                  <span>Improve Service performance, reliability, and user experience;</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                  <span>Communicate important updates related to the Service;</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                  <span>Comply with applicable legal and regulatory obligations.</span>
                </li>
              </ul>
            </section>

            {/* AI Data Processing & Security */}
            <section className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-green-400" />
                AI Data Processing & Security
              </h2>
              <p className="mb-4">
                We implement reasonable administrative, technical, and organizational safeguards to protect user 
                information, including:
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                  <span><strong className="text-white">Secure Infrastructure:</strong> The Service is hosted on reputable cloud infrastructure providers with industry-standard security practices.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                  <span><strong className="text-white">Encryption:</strong> Personal data and conversation content are encrypted in transit using TLS and encrypted at rest on secure servers.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                  <span><strong className="text-white">Limited Access:</strong> Access to system infrastructure is restricted to authorized personnel and governed by internal access controls.</span>
                </li>
              </ul>

              <h3 className="text-lg font-semibold text-white mt-6 mb-3">Non-Training Policy</h3>
              <div className="bg-green-500/10 rounded-lg p-4">
                <p className="mb-3">
                  <strong className="text-green-300">Your private conversations and reflection logs are used solely to provide and support the Service.</strong>
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                    <span>We do not use your personal dialogue to train general-purpose AI models.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                    <span>We do not sell conversation data or share it with third parties for advertising purposes.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                    <span>Any AI service providers involved in generating responses process data only as necessary to support the Service and are subject to appropriate confidentiality and security obligations.</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Account and Data Deletion */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-amber-400" />
                Account and Data Deletion
              </h2>
              <p className="mb-4">
                We provide a straightforward way for you to delete your account.
              </p>
              <p className="mb-4">
                You can initiate permanent deletion of your account and associated conversation history directly 
                within your account settings. Once deletion is completed, your data cannot be recovered.
              </p>
              <p>
                Certain information may be retained for a limited period if required to comply with legal obligations, 
                resolve disputes, or enforce our agreements.
              </p>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Data Retention</h2>
              <p>
                We retain personal information and conversation data for as long as necessary to provide the Service 
                and fulfill the purposes described in this Privacy Policy, unless a longer retention period is required 
                or permitted by law.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Your Rights</h2>
              <p className="mb-4">Depending on your location, you may have the right to:</p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                  <span>Request access to your personal information;</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                  <span>Request deletion of your account and associated data;</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                  <span>Request a copy of your data in a portable format.</span>
                </li>
              </ul>
              <p>
                To exercise these rights, please contact us at{" "}
                <a href="mailto:support@lifemaster.coach" className="text-amber-400 hover:underline">
                  support@lifemaster.coach
                </a>.
              </p>
            </section>

            {/* Third-Party Services */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-amber-400" />
                Third-Party Services
              </h2>
              <p className="mb-4">
                We rely on third-party service providers to operate the Service, such as:
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40 mt-2 flex-shrink-0" />
                  <span>Cloud infrastructure providers;</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40 mt-2 flex-shrink-0" />
                  <span>AI service providers used to generate responses within the Service;</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40 mt-2 flex-shrink-0" />
                  <span>Analytics or operational tools used to maintain Service performance.</span>
                </li>
              </ul>
              <p>
                These providers process data solely to support the Service and are subject to appropriate 
                confidentiality and security obligations.
              </p>
            </section>

            {/* Age Requirements */}
            <section className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Age Requirements</h2>
              <p className="mb-4">
                <strong className="text-amber-300">The Service is intended for users 18 years of age or older.</strong>
              </p>
              <p>
                We do not knowingly collect personal information from individuals under 18. If we become aware that 
                such information has been collected, we will take reasonable steps to delete it.
              </p>
            </section>

            {/* Changes to This Policy */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. Updates will be reflected by revising the 
                "Last updated" date. We encourage you to review this Policy periodically.
              </p>
            </section>

            {/* Contact Us */}
            <section className="border-t border-white/10 pt-8">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-amber-400" />
                Contact Us
              </h2>
              <p className="mb-4">
                If you have questions about this Privacy Policy or our data practices, please contact:
              </p>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="font-semibold text-white">LifeMaster Development LLC</p>
                <p className="mt-2">
                  Email: <a href="mailto:support@lifemaster.coach" className="text-amber-400 hover:underline">support@lifemaster.coach</a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center text-white/40 text-sm">
          <p>© 2026 LifeMaster Development LLC. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
