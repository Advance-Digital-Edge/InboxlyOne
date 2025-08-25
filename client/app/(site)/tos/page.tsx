// app/terms/page.tsx
export default function TermsOfUsePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Terms of Use</h1>
      <p className="text-sm text-gray-500 mb-8">Last Updated: August 2025</p>

      <section className="space-y-6">
        <p>
          Welcome to Inboxlyone! By using our website and services, you agree to
          these Terms of Use. Please read them carefully.
        </p>

        <h2 className="text-xl font-semibold">1. Service Description</h2>
        <p>
          Inboxlyone is a web service that allows users to connect their Gmail,
          Facebook Page, and Instagram Business/Creator accounts to manage
          messages more easily in one place.
        </p>

        <h2 className="text-xl font-semibold">2. User Responsibilities</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>You agree to use Inboxlyone only for lawful purposes.</li>
          <li>
            You must comply with Google, Facebook, and Instagram platform
            policies when connecting your accounts.
          </li>
          <li>
            You may not use Inboxlyone to send spam, abuse the service, or
            engage in harmful or illegal activities.
          </li>
        </ul>

        <h2 className="text-xl font-semibold">3. Privacy</h2>
        <p>
          Your use of Inboxlyone is also governed by our{" "}
          <a href="/privacy" className="text-blue-600 underline">
            Privacy Policy
          </a>
          .
        </p>

        <h2 className="text-xl font-semibold">4. Service Availability</h2>
        <p>
          Inboxlyone is provided on an “as is” and “as available” basis. We do
          not guarantee that the service will be uninterrupted, error-free, or
          secure.
        </p>

        <h2 className="text-xl font-semibold">5. Termination</h2>
        <p>
          We may suspend or terminate your access to Inboxlyone if you misuse
          the service or violate these Terms.
        </p>

        <h2 className="text-xl font-semibold">6. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, Inboxlyone and its creators
          are not liable for any damages, losses, or issues arising from your
          use of the service, including but not limited to loss of data, service
          interruptions, or unauthorized access.
        </p>

        <h2 className="text-xl font-semibold">7. Governing Law</h2>
        <p>
          These Terms are governed by the laws of Bulgaria and applicable
          European Union regulations. Any disputes shall be resolved in
          accordance with Bulgarian law.
        </p>

        <h2 className="text-xl font-semibold">8. Contact</h2>
        <p>
          If you have questions about these Terms, contact us at:
          <br />
          <a
            href="mailto:support@inboxlyone.com"
            className="text-blue-600 underline"
          >
            support@inboxlyone.com
          </a>
        </p>
      </section>
    </div>
  );
}
