import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle, Mail, MessageCircle, ChevronDown, ChevronUp, ExternalLink, Heart } from "lucide-react";
import { useLocation } from "wouter";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What is A.Cosmos?",
    answer: "A.Cosmos is an AI-powered guided reflection platform featuring a constellation of specialized AI guides. Each guide focuses on different aspects of life—career, relationships, emotional well-being, leadership, family, grief, legacy, and personal truth. Our Apex feature allows you to integrate insights across multiple conversations."
  },
  {
    question: "Is A.Cosmos a replacement for therapy or professional counseling?",
    answer: "No. A.Cosmos is designed as a supportive self-reflection tool, not a substitute for professional mental health services. Our AI guides can help with reflection, goal-setting, and personal growth, but they are not licensed therapists or counselors. If you're experiencing mental health challenges, please seek help from a qualified professional."
  },
  {
    question: "How is my conversation data protected?",
    answer: "Your privacy is our priority. All conversations are encrypted using AES-256 encryption at rest and TLS 1.3 during transmission. Your data is never used to train third-party AI models, and you can delete your conversation history at any time. See our Privacy Policy for complete details."
  },
  {
    question: "Can I delete my conversation history?",
    answer: "Yes. You can delete individual conversations or your entire conversation history at any time. To request complete data deletion, including your account, please contact us at support@lifemaster.coach."
  },
  {
    question: "What is the Apex Roundtable feature?",
    answer: "Apex is our high-level integrative guide. The Roundtable feature allows you to bring conversations from multiple guides together for deeper reflection and integration. Apex helps you see patterns and connections across your reflection journey."
  },
  {
    question: "What age do I need to be to use A.Cosmos?",
    answer: "You must be at least 17 years old to use A.Cosmos. This is to ensure our users can meaningfully engage with guided reflection content and make informed decisions about their personal development."
  },
  {
    question: "How do I switch between different guides?",
    answer: "From the home screen, you can select any guide from the 'Your Constellation of Guardians' section. Each guide has their own specialty and approach. You can have ongoing conversations with multiple guides and switch between them at any time."
  },
  {
    question: "Is A.Cosmos available in multiple languages?",
    answer: "Currently, A.Cosmos is primarily available in English. We are working on expanding language support. Our AI guides can understand and respond in multiple languages, but the interface is currently in English."
  },
  {
    question: "Why do I keep getting logged out on my phone?",
    answer: "If you're frequently logged out on mobile, it's usually due to browser settings. Here's how to stay logged in:\n\n• Safari (iOS): Go to Settings → Safari → turn OFF 'Prevent Cross-Site Tracking' and 'Block All Cookies'\n• Chrome (Android): Go to Settings → Privacy → ensure 'Block third-party cookies' is OFF\n• General: Avoid using Private/Incognito mode, as it clears all data when closed\n• Don't clear browser data/cookies manually\n\nA.Cosmos sessions are designed to last for 1 year, so once logged in, you should stay logged in unless your browser clears cookies."
  },
  {
    question: "How do I access my conversation history?",
    answer: "You can access your conversation history by tapping the History icon (clock icon) in the top navigation bar on the home page, or in the top-right corner when you're in a chat. All your past conversations are saved and you can resume any of them at any time."
  },
  {
    question: "How do I add A.Cosmos to my phone's home screen?",
    answer: "You can add A.Cosmos to your home screen for an app-like experience:\n\n📱 iPhone/iPad (Safari only):\n1. Open acosmos.app in Safari\n2. Tap the Share button (square with arrow) at the bottom\n3. Scroll down and tap 'Add to Home Screen'\n4. Tap 'Add' to confirm\n\n📱 Android (Chrome):\n1. Open acosmos.app in Chrome\n2. Tap the menu (three dots) in the top right\n3. Tap 'Add to Home Screen' or 'Install App'\n4. Tap 'Add' to confirm\n\n💻 Desktop (Chrome/Edge):\n1. Look for the install icon in the address bar (right side)\n2. Click it and select 'Install'\n\nNote: On iOS, only Safari supports adding websites to the home screen. Chrome and other browsers on iOS cannot do this due to Apple's restrictions."
  }
];

export default function Support() {
  const [, navigate] = useLocation();
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

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
          {/* Safety Statement */}
          <div className="mb-8 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <p className="text-white/60 text-sm leading-relaxed text-center">
              A.Cosmos provides AI-powered guided reflection and life exploration. It is not therapy, medical advice, or a substitute for professional support. If you are experiencing an emergency or crisis, please contact local emergency services or a qualified professional.
            </p>
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center">
              <HelpCircle className="w-8 h-8 text-amber-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Support Center</h1>
            <p className="text-white/60 max-w-xl mx-auto">
              We're here to help you on your journey. Find answers to common questions or reach out to our team.
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            <a 
              href="mailto:support@lifemaster.coach"
              className="group glass-card rounded-2xl p-6 transition-all duration-300 hover:border-amber-500/30 hover:scale-[1.02]"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-amber-400 transition-colors">
                    Email Support
                  </h3>
                  <p className="text-white/60 text-sm mb-2">
                    Get help from our support team
                  </p>
                  <p className="text-amber-400 text-sm font-medium">
                    support@lifemaster.coach
                  </p>
                </div>
              </div>
            </a>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Response Time
                  </h3>
                  <p className="text-white/60 text-sm mb-2">
                    We typically respond within
                  </p>
                  <p className="text-purple-400 text-sm font-medium">
                    24-48 hours
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="glass-card rounded-2xl p-8 md:p-10 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
              <HelpCircle className="w-6 h-6 text-amber-400" />
              Frequently Asked Questions
            </h2>

            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div 
                  key={index}
                  className="border border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:border-white/20"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left"
                  >
                    <span className="text-white font-medium pr-4">{faq.question}</span>
                    {openFAQ === index ? (
                      <ChevronUp className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-white/40 flex-shrink-0" />
                    )}
                  </button>
                  
                  {openFAQ === index && (
                    <div className="px-5 pb-4">
                      <p className="text-white/70 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Crisis Resources */}
          <div className="glass-card rounded-2xl p-8 md:p-10 bg-red-500/5 border-red-500/20">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
              <Heart className="w-5 h-5 text-red-400" />
              Crisis Resources
            </h2>
            <p className="text-white/70 mb-4">
              If you or someone you know is in crisis or experiencing thoughts of self-harm, please reach out to professional help immediately:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <a 
                href="tel:988"
                className="flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <span className="text-red-400 font-bold">988</span>
                </div>
                <div>
                  <p className="text-white font-medium">Suicide & Crisis Lifeline</p>
                  <p className="text-white/50 text-sm">Call or text 988 (US)</p>
                </div>
              </a>
              
              <a 
                href="sms:741741?body=HOME"
                className="flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Crisis Text Line</p>
                  <p className="text-white/50 text-sm">Text HOME to 741741</p>
                </div>
              </a>
            </div>
            
            <a 
              href="https://www.iasp.info/resources/Crisis_Centres/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-red-300 hover:text-red-200 text-sm transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              International Crisis Centers Directory
            </a>
          </div>

          {/* Legal Links */}
          <div className="mt-8 text-center">
            <p className="text-white/40 text-sm mb-3">Legal Information</p>
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <button 
                onClick={() => navigate("/privacy")}
                className="text-white/60 hover:text-amber-400 text-sm transition-colors"
              >
                Privacy Policy
              </button>
              <span className="text-white/20">|</span>
              <button 
                onClick={() => navigate("/terms")}
                className="text-white/60 hover:text-amber-400 text-sm transition-colors"
              >
                Terms of Use
              </button>
              <span className="text-white/20">|</span>
              <button 
                onClick={() => navigate("/purchase-terms")}
                className="text-white/60 hover:text-amber-400 text-sm transition-colors"
              >
                Purchase Terms
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
