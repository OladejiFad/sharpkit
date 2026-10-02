import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact SharpKit",
  description:
    "Contact SharpKit for questions, feedback, bug reports and support.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-16 text-slate-800">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Contact SharpKit
        </h1>

        <p className="mt-4 text-lg leading-7 text-slate-600">
          Have a question, found a problem, or have an idea for a new SharpKit
          tool? We&apos;d like to hear from you.
        </p>

        <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-8">
          <h2 className="text-2xl font-semibold text-slate-900">
            Get in touch
          </h2>

          <p className="mt-3 leading-7 text-slate-600">
            For support, feedback, bug reports or business enquiries, please
            contact the SharpKit team by email.
          </p>

<a
  href="mailto:sharpkit47@gmail.com"
  className="mt-6 inline-block font-medium text-green-700 hover:text-green-800 hover:underline"
>
  sharpkit47@gmail.com
</a>
        </div>

        <div className="mt-8 space-y-6 leading-7">
          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              Bug reports
            </h2>
            <p className="mt-2 text-slate-600">
              When reporting a problem, please tell us which SharpKit tool you
              were using, what happened, and what device or browser you were
              using. Screenshots are helpful when available.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              Feedback and suggestions
            </h2>
            <p className="mt-2 text-slate-600">
              We welcome suggestions for new tools, improvements and features
              that could make SharpKit more useful.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}