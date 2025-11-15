import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Art Bay',
};

export default function PrivacyPolicyPage() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-16 space-y-6 text-sm leading-relaxed">
      <h1 className="text-3xl font-semibold">Privacy Policy</h1>
      <p>
        We collect the minimum amount of personal data required to process orders, deliver updates, and
        keep your account secure. This typically includes your name, email address, shipping details, and
        payment confirmation from our processors (Stripe and PayPal). We never sell your information.
      </p>
      <p>
        Data is stored using encrypted providers (Stripe, our database provider, and Netlify). You can
        request a copy or deletion of your personal data by emailing{' '}
        <a className="text-blue-500 underline" href="mailto:support@art-bay.com">
          support@art-bay.com
        </a>
        .
      </p>
      <p>
        Cookies are used only for session management, analytics, and remembering cart contents. By using
        this site you consent to these cookies. If you disable cookies, some functionality (checkout,
        account pages) may stop working.
      </p>
    </section>
  );
}
