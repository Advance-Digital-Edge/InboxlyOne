// app/privacy/page.tsx
export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last Updated: August 2025</p>

      <section className="space-y-4">
        <p>
          Inboxlyone (“we,” “our,” or “us”) respects your privacy. This Privacy
          Policy explains how we collect, use, and protect your personal
          information when you use our website and services.
        </p>

        <h2 className="text-xl font-semibold mt-6">
          1. Information We Collect
        </h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>
            <span className="font-medium">Account information</span>: name,
            email address, and profile picture when you connect Google or
            Facebook/Instagram.
          </li>
          <li>
            <span className="font-medium">Authentication data</span>: access
            tokens and refresh tokens to enable secure integrations with Gmail,
            Facebook Messenger, and Instagram Messaging APIs.
          </li>
          <li>
            <span className="font-medium">
              Content data (only as needed to provide the service)
            </span>
            :
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                Gmail: message metadata (subject, sender, recipient) and message
                content you choose to view/manage in Inboxlyone.
              </li>
              <li>
                Facebook Messenger: conversations/messages for connected Pages
                you choose to manage.
              </li>
              <li>
                Instagram: Direct Messages (DMs) for connected Instagram
                Business/Creator accounts linked to your Facebook Page; basic
                account info such as username, account ID, and profile picture;
                and message metadata/content you choose to view/manage.
              </li>
            </ul>
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">
          2. How We Use Information
        </h2>
        <p>
          We use your information to provide and improve the Inboxlyone service,
          connect and manage your Gmail, Facebook Messenger, and Instagram
          accounts, troubleshoot issues, and communicate with you about updates.
          We do not sell your data.
        </p>

        <h2 className="text-xl font-semibold mt-6">3. Legal Basis (GDPR)</h2>
        <p>
          If you are in the European Economic Area (EEA), we process your
          information under the following legal bases: with your consent (when
          you connect the integrations), to perform our contract with you
          (providing the service), and to comply with legal obligations.
        </p>

        <h2 className="text-xl font-semibold mt-6">
          4. Data Storage and Security
        </h2>
        <p>
          Data is stored securely using Supabase and industry-standard
          encryption. Tokens are encrypted and restricted to service use. We
          take reasonable measures to protect your data but cannot guarantee
          absolute security.
        </p>

        <h2 className="text-xl font-semibold mt-6">5. Your Rights</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>Access the personal data we hold about you.</li>
          <li>Request correction or deletion of your data.</li>
          <li>
            Withdraw your consent and disconnect integrations at any time.
          </li>
          <li>Lodge a complaint with your local data protection authority.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">
          6. Permissions & How to Revoke Access
        </h2>
        <p className="mb-2">
          Integrations use the following platform permissions only to provide
          the features you choose:
        </p>
        <ul className="list-disc ml-6 space-y-2">
          <li>
            <span className="font-medium">Google (Gmail)</span>: e.g.,{" "}
            <code>gmail.modify</code>, <code>gmail.send</code>. You can revoke
            access in your Google Account &rarr; Security &rarr; Third-party
            access.
          </li>
          <li>
            <span className="font-medium">Facebook/Instagram</span>: e.g.,{" "}
            <code>pages_messaging</code>, <code>pages_show_list</code>,
            <code>instagram_basic</code>, <code>instagram_manage_messages</code>
            . Revoke in Facebook &rarr; Settings &amp; Privacy &rarr; Business
            Integrations (or Linked Accounts for Instagram Business/Creator).
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">7. Data Retention</h2>
        <p>
          We keep your data only as long as necessary to provide the service.
          You may request deletion at any time by contacting us or by
          disconnecting integrations.
        </p>

        <h2 className="text-xl font-semibold mt-6">
          8. Changes to This Policy
        </h2>
        <p>
          We may update this Privacy Policy. Updates will be posted on this page
          with a new “Last Updated” date.
        </p>

        <h2 className="text-xl font-semibold mt-6">9. Contact</h2>
        <p>
          If you have questions about this Privacy Policy, contact us at:
          <br />
          <a
            href="mailto:support@inboxlyone.com"
            className="text-blue-600 underline"
          >
            support@inboxly.one
          </a>
        </p>
      </section>
    </div>
  );
}
