import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | SharpKit",
  description:
    "SharpKit Privacy Policy explaining how we handle information when you use our online tools.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-16 text-slate-800">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Privacy Policy
        </h1>

        <p className="mt-4 text-sm text-slate-500">
          Last updated: October 2, 2026
        </p>

        <div className="mt-10 space-y-8 leading-7">
          <section>
            <h2 className="text-2xl font-semibold text-slate-900">
              1. Introduction
            </h2>
            <p className="mt-3">
              SharpKit provides free online tools for working with images,
              documents and PDF files. This Privacy Policy explains how
              information is handled when you use our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900">
              2. Files You Process
            </h2>
            <p className="mt-3">
              SharpKit&apos;s browser-based tools are designed to process files
              directly on your device whenever the tool supports client-side
              processing. Files processed entirely in your browser are not
              uploaded to a SharpKit server for processing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900">
              3. Information We May Collect
            </h2>
            <p className="mt-3">
              We may collect limited technical information such as browser
              type, device information, approximate location, pages visited
              and general usage information through analytics, advertising or
              other services used on the website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900">
              4. Cookies and Advertising
            </h2>
            <p className="mt-3">
              SharpKit may use cookies and similar technologies for analytics,
              functionality and advertising. Third-party advertising providers,
              including Google, may use cookies to serve and measure
              advertisements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900">
              5. Third-Party Services
            </h2>
            <p className="mt-3">
              SharpKit may use third-party services such as hosting, analytics,
              search tools and advertising services. These services may process
              information according to their own privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900">
              6. Children&apos;s Privacy
            </h2>
            <p className="mt-3">
              SharpKit is not specifically directed toward children. We do not
              knowingly collect personal information from children through
              dedicated registration or account systems.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900">
              7. Changes to This Policy
            </h2>
            <p className="mt-3">
              We may update this Privacy Policy from time to time. Any changes
              will be published on this page with an updated revision date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900">
              8. Contact
            </h2>
            <p className="mt-3">
              If you have questions about this Privacy Policy or SharpKit&apos;s
              privacy practices, please contact us through the contact
              information provided on the website.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}