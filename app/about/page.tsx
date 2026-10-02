import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About SharpKit",
  description:
    "Learn about SharpKit, a collection of free online tools for working with images, documents and PDF files.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-16 text-slate-800">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          About SharpKit
        </h1>

        <p className="mt-4 text-lg leading-8 text-slate-600">
          SharpKit is a collection of simple, practical online tools for
          working with images, documents and PDF files.
        </p>

        <div className="mt-10 space-y-10 leading-7">
          <section>
            <h2 className="text-2xl font-semibold text-slate-900">
              What is SharpKit?
            </h2>
            <p className="mt-3">
              SharpKit helps people complete common file and document tasks
              without needing complicated software. Our tools are designed to
              be simple to use, fast and accessible from a modern web browser.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900">
              Our tools
            </h2>

            <p className="mt-3">
              SharpKit provides tools for image compression, image resizing,
              image conversion, image-to-text extraction, document scanning,
              PDF conversion, PDF signing, signatures, letterheads and
              document restoration.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900">
              Privacy-focused processing
            </h2>

            <p className="mt-3">
              Many SharpKit tools are designed to process files directly in
              your browser. This means your files can be processed on your
              device without being uploaded to a SharpKit server.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900">
              Built for practical everyday needs
            </h2>

            <p className="mt-3">
              Whether you need to reduce an image to a specific file size,
              convert an image to PDF, sign a document, scan a page or restore
              an old document, SharpKit is designed to make the process
              straightforward.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900">
              Contact us
            </h2>

            <p className="mt-3">
              We welcome feedback, suggestions and reports about problems with
              our tools.
            </p>

            <a
              href="mailto:sharpkit47@gmail.com"
              className="mt-4 inline-block font-medium text-green-700 hover:text-green-800 hover:underline"
            >
              sharpkit47@gmail.com
            </a>
          </section>
        </div>
      </div>
    </main>
  );
}