import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | SharpKit",
  description:
    "SharpKit Cookie Policy explaining how cookies and similar technologies may be used on the website.",
};

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-16 text-slate-800">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Cookie Policy
        </h1>

        <p className="mt-4 text-sm text-slate-500">
          Last updated: October 2, 2026
        </p>

        <div className="mt-10 space-y-8 leading-7">
          <section>
            <h2 className="text-2xl font-semibold text-slate-900">
              1. What Are Cookies?
            </h2>
            <p className="mt-3">
              Cookies are small text files that websites may store on your
              device. They can help websites remember information, understand
              how visitors use the site and provide certain features.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900">
              2. How SharpKit May Use Cookies
            </h2>
            <p className="mt-3">
              SharpKit may use cookies and similar technologies for essential
              website functionality, analytics, security, advertising and
              understanding how visitors interact with the website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900">
              3. Advertising Cookies
            </h2>
            <p className="mt-3">
              SharpKit may use third-party advertising services, including
              Google AdSense. These services may use cookies or similar
              technologies to provide, personalize and measure advertisements,
              subject to their applicable policies and user choices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900">
              4. Analytics
            </h2>
            <p className="mt-3">
              We may use analytics services to understand general website
              traffic and usage. This information can help us improve SharpKit
              and identify problems with our tools.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900">
              5. Managing Cookies
            </h2>
            <p className="mt-3">
              Most modern web browsers allow you to control or delete cookies
              through browser settings. Disabling certain cookies may affect
              some website functionality or preferences.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900">
              6. Third-Party Services
            </h2>
            <p className="mt-3">
              Third-party services used by SharpKit may have their own privacy
              and cookie policies. We recommend reviewing those policies for
              more information about how those services handle information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900">
              7. Changes to This Policy
            </h2>
            <p className="mt-3">
              This Cookie Policy may be updated as SharpKit&apos;s services
              change. Updates will be published on this page with a revised
              date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900">
              8. Contact
            </h2>
            <p className="mt-3">
              If you have questions about this Cookie Policy, please contact
              SharpKit at:
            </p>

            <a
              href="mailto:sharpkit47@gmail.com"
              className="mt-3 inline-block font-medium text-green-700 hover:text-green-800 hover:underline"
            >
              sharpkit47@gmail.com
            </a>
          </section>
        </div>
      </div>
    </main>
  );
}