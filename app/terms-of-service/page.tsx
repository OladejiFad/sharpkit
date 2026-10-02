import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | SharpKit",
  description:
    "Terms of Service for using SharpKit's free online image, document and PDF tools.",
};

export default function TermsOfServicePage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-black tracking-tight text-slate-900">
        Terms of Service
      </h1>

      <p className="mt-2 text-sm text-slate-500">
        Last updated: October 2, 2026
      </p>

      <div className="mt-10 space-y-8 text-sm leading-7 text-slate-700">
        <section>
          <h2 className="text-lg font-bold text-slate-900">
            1. Acceptance of Terms
          </h2>
          <p className="mt-2">
            By using SharpKit, you agree to these Terms of Service. If you do
            not agree with these terms, please do not use the website or its
            tools.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900">
            2. Use of SharpKit
          </h2>
          <p className="mt-2">
            SharpKit provides online tools for working with images, documents
            and PDF files. You agree to use the service only for lawful
            purposes and in a way that does not interfere with the operation
            of the website.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900">
            3. Your Files
          </h2>
          <p className="mt-2">
            You are responsible for the files you process using SharpKit and
            for ensuring that you have the necessary rights or permission to
            use those files.
          </p>
          <p className="mt-2">
            Many SharpKit tools process files directly in your browser. You
            should still avoid uploading or processing sensitive information
            unless you are comfortable doing so.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900">
            4. No Guarantee of Results
          </h2>
          <p className="mt-2">
            SharpKit tools are provided for general use and convenience.
            Results may vary depending on the file, device, browser and
            settings used. SharpKit does not guarantee that every processed
            file will meet a particular size, quality, format or submission
            requirement.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900">
            5. Third-Party Requirements
          </h2>
          <p className="mt-2">
            Some organizations, schools, government agencies, employers or
            other services may have specific file requirements. You are
            responsible for checking the requirements of the service to which
            you intend to submit a file.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900">
            6. Intellectual Property
          </h2>
          <p className="mt-2">
            The SharpKit website, branding, interface, text and software are
            protected by applicable intellectual property laws. You may use
            SharpKit for its intended purpose but may not copy, reproduce or
            redistribute the website or its software without permission.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900">
            7. Availability
          </h2>
          <p className="mt-2">
            We may modify, suspend or discontinue parts of SharpKit at any
            time. We do not guarantee that the website or any particular tool
            will always be available or error-free.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900">
            8. Limitation of Liability
          </h2>
          <p className="mt-2">
            To the extent permitted by applicable law, SharpKit is not
            responsible for losses or damages arising from the use of the
            website or its tools, including problems caused by files,
            browsers, devices, internet connections or third-party services.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900">
            9. Changes to These Terms
          </h2>
          <p className="mt-2">
            These Terms of Service may be updated from time to time. Updated
            terms will be published on this page with a revised date.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900">
            10. Contact
          </h2>
          <p className="mt-2">
            If you have questions about these Terms of Service, contact
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
    </main>
  );
}