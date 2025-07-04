import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface LegalTermsViewProps {
  type: 'terms' | 'privacy' | 'ai';
  onBack: () => void;
}

const LegalTermsView: React.FC<LegalTermsViewProps> = ({ type, onBack }) => {
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="p-2 mr-2 rounded-full hover:bg-gray-100"
          aria-label="Go back"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-2xl font-semibold">
          {type === 'terms' && 'Terms of Service'}
          {type === 'privacy' && 'Privacy Policy'}
          {type === 'ai' && 'AI Transparency'}
        </h1>
      </div>

      <div className="prose max-w-none">
        {type === 'terms' && (
          <>
            <h2>1. Introduction</h2>
            <p>
              These Terms of Service ("Terms") govern your access to and use of Soberi.ai, including any content, functionality, and services offered through Soberi.ai (the "Service").
            </p>

            <h2>2. Important Note on Guidance</h2>
            <p>
              Soberi.ai is an informational and self-help tool designed for personal growth and general well-being. The content and conversations provided by the service do not constitute professional advice (such as medical, legal, or financial advice) and do not create a professional-client relationship. Always seek the advice of a qualified professional with any questions you may have regarding specific personal concerns or well-being.
            </p>

            <h2>3. Emergency Situations</h2>
            <p>
              If you believe you may harm yourself or others, or are having an emergency, call your local emergency number (e.g., 112 in the EU/UK, 911 in the US) immediately. Soberi.ai is not a crisis-response service and cannot contact emergency services on your behalf.
            </p>

            <h2>4. AI & Accuracy Disclaimer</h2>
            <p>
              Conversations are generated by an artificial-intelligence system and may occasionally produce inaccurate, incomplete, or biased information. You are solely responsible for how you interpret and act on the content.
            </p>

            <h2>5. No Warranties / Limitation of Liability</h2>
            <p>
              The service is provided "as is" and "as available," without warranties of any kind, express or implied. To the maximum extent permitted by law, the company disclaims all liability for losses or damages arising from your use of Soberi.ai.
            </p>

            <h2>6. Age Restriction</h2>
            <p>
              Soberi.ai is intended for users 18 years and older. If you are under 18, please do not use the service.
            </p>

            <h2>7. User-Generated Content & Moderation</h2>
            <p>
              We reserve the right to remove any content that violates these Terms or that we find objectionable for any reason. You are responsible for all content you submit to the Service.
            </p>

            <h2>8. Intellectual Property</h2>
            <p>
              "Soberi.ai" and all related logos, trademarks, and service marks are owned by us. All other trademarks, service marks, and logos used in connection with our Service are the property of their respective owners.
            </p>

            <h2>9. Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. It is your responsibility to review these Terms periodically. Your continued use of the Service constitutes acceptance of any changes.
            </p>
          </>
        )}

        {type === 'privacy' && (
          <>
            <h2>1. Introduction</h2>
            <p>
              This Privacy Policy describes how we collect, use, and share your personal information when you use Soberi.ai (the "Service").
            </p>

            <h2>2. Information We Collect and How It's Handled</h2>
            <p>
              Soberi.ai is designed to be a private, client-sided application for most of your personal data.
            </p>
            <ul>
              <li><strong>Locally Stored Interaction Data:</strong> All personal interaction data you generate within the app – including your chat messages, journal entries, daily check-ins (mood, cravings, notes), progress details, and task information – is stored exclusively on your local device and is encrypted. <strong>We do not collect, transmit, or store this personal interaction data on our servers.</strong></li>
              <li><strong>Account Information (Server-Stored):</strong> If you choose to create an account for features like subscription management, we collect your email address for authentication. This, along with your subscription status (managed via Stripe), is the only personal data stored on our secure servers (managed via Supabase).</li>
              <li><strong>Anonymized Usage Data (Optional & Aggregated):</strong> To help us improve Soberi.ai, we may collect anonymized and aggregated usage statistics (e.g., which features are most used). This data does not contain any of your personal interaction content and cannot be used to identify you.</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>
              We use your information to:
            </p>
            <ul>
              <li>Provide, maintain, and improve the Service.</li>
              <li>Manage your account and subscription (if applicable).</li>
              <li>Personalize your experience (primarily through local data processing).</li>
              <li>Monitor and analyze usage trends to enhance app functionality (using anonymized data).</li>
              <li>Communicate with you about your account or important updates to the Service.</li>
            </ul>

            <h2>4. Data Storage and Security</h2>
            <p>
              <strong>Your personal interaction data (chats, journals, check-ins, tasks, progress details) is stored exclusively on your local device. This data is encrypted on your device, and Soberi.ai (the company) does not have access to it.</strong>
            </p>
            <p>
              The only personal information stored on our servers is your email address (for account authentication via Supabase) and your subscription status (managed by our payment processor, Stripe). We implement industry-standard security measures to protect this limited server-stored data.
            </p>
            <p>
              The security of your locally stored data also depends on the security of your own device. Please take appropriate measures to secure your device.
            </p>

            <h2>5. GDPR Compliance</h2>
            <p>
              For users in the European Economic Area (EEA), we process your personal data in accordance with the General Data Protection Regulation (GDPR).
            </p>
            <p>
              Lawful basis for processing:
            </p>
            <ul>
              <li>Consent: For processing sensitive personal data (if applicable and with your explicit consent)</li>
              <li>Contract: To provide you with the Service</li>
              <li>Legitimate Interests: To improve our Service</li>
            </ul>

            <h2>6. Your Rights</h2>
            <p>
              Depending on your location, you may have certain rights regarding your personal information, including:
            </p>
            <ul>
              <li>Access to your personal data</li>
              <li>Correction of inaccurate data</li>
              <li>Deletion of your data</li>
              <li>Data portability</li>
              <li>Withdrawal of consent</li>
            </ul>

            <h2>7. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
            </p>

            <h2>8. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at: privacy@soberi.ai
            </p>
          </>
        )}

        {type === 'ai' && (
          <>
            <h2>1. AI Technology</h2>
            <p>
              Soberi.ai uses advanced artificial intelligence technology to provide helpful conversations. Our AI system is designed to offer encouragement and information.
            </p>

            <h2>2. How Our AI Works</h2>
            <p>
              Our AI uses natural language processing to understand your messages and generate helpful responses. The system is trained on a wide range of information but does not provide professional advice or treatment.
            </p>

            <h2>3. AI Limitations</h2>
            <p>
              While our AI strives to provide accurate and helpful information, it has several limitations:
            </p>
            <ul>
              <li>It may occasionally generate incorrect or incomplete information</li>
              <li>It cannot diagnose conditions or provide personalized professional advice</li>
              <li>It cannot contact emergency services if you are in crisis</li>
              <li>It may not always understand complex emotional states or nuanced situations</li>
            </ul>

            <h2>4. EU AI Act Compliance</h2>
            <p>
              Soberi.ai is designed to comply with the EU AI Act requirements for AI systems, including risk assessment, bias monitoring, and technical documentation where applicable.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default LegalTermsView;
