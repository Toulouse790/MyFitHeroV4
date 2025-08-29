import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 p-8 max-w-4xl mx-auto text-gray-900 dark:text-gray-100">
      <h1 className="text-4xl font-extrabold mb-6">Privacy Policy</h1>

      <section className="prose max-w-none dark:prose-invert space-y-6">
        <p>
          At MyFitHero, your privacy is paramount. This Privacy Policy explains how we collect, use,
          disclose, and safeguard your information when you use our platform.
        </p>

        <h2>Information We Collect</h2>
        <p>
          We collect personal information that you provide directly to us, such as your name, email
          address, and fitness data. Additionally, we automatically collect usage and device
          information to improve your experience.
        </p>

        <h2>Use of Information</h2>
        <p>
          Your information helps us provide, maintain, and improve our services, personalize your
          experience, and communicate with you regarding updates and promotional offers.
        </p>

        <h2>Sharing of Information</h2>
        <p>
          We do not sell your personal information. We may share data with trusted partners to
          operate our services, comply with legal obligations, or protect rights.
        </p>

        <h2>Data Security</h2>
        <p>
          We implement industry-standard security measures to protect your information from
          unauthorized access.
        </p>

        <h2>Your Choices</h2>
        <p>
          You can access, correct, or request deletion of your personal data. You may opt out of
          marketing communications at any time.
        </p>

        <h2>Cookies and Tracking</h2>
        <p>
          We use cookies and similar tracking technologies to enhance your experience and analyze
          usage.
        </p>

        <h2>Children’s Privacy</h2>
        <p>
          Our services are not directed to children under 13. We do not knowingly collect data from
          children.
        </p>

        <h2>Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify users of significant
          changes through the platform.
        </p>

        <h2>Contact Us</h2>
        <p>
          For questions and concerns regarding privacy, contact our team at privacy@myfithero.com.
        </p>

        <p className="text-sm text-gray-500 mt-12">Effective Date: August 27, 2025</p>
      </section>
    </main>
  );
};

export default PrivacyPolicyPage;
