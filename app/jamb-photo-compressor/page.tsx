import type { Metadata } from "next";
import Link from "next/link";
import Compressor from "@/components/Compressor";

export const metadata: Metadata = {
  title: "JAMB Photo Compressor",
  description:
    "Compress your passport photo online for JAMB. Reduce JPG, PNG or WebP images to a smaller file size with SharpKit.",
};

export default function JambPhotoCompressorPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-8 text-black">
      <div className="mx-auto max-w-2xl">
        <header className="text-center">
          <Link
            href="/"
            className="mb-4 inline-block rounded-full bg-black px-4 py-2 text-xs font-black tracking-wider text-white"
          >
            SHARPKIT
          </Link>

          <h1 className="text-3xl font-black leading-tight sm:text-4xl">
            JAMB Photo Compressor
            <br />
            Reduce Your Photo Size.
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base leading-6 text-gray-600">
            Compress your passport photograph to a smaller file size for
            JAMB and other Nigerian online portals.
          </p>

          <p className="mt-2 text-sm font-semibold text-gray-500">
            🔒 Your photo stays on your device.
          </p>
        </header>

        <Compressor />

        <section className="mt-12">
          <h2 className="text-xl font-black">
            How to compress a photo for JAMB
          </h2>

          <ol className="mt-4 ml-5 list-decimal space-y-3 text-sm leading-6 text-gray-700">
            <li>Choose the target file size you need.</li>
            <li>Upload your passport photograph.</li>
            <li>Allow SharpKit to compress the image.</li>
            <li>Download the compressed photograph.</li>
            <li>Upload the photo to the JAMB portal.</li>
          </ol>
        </section>

        <section className="mt-8 rounded-2xl border p-5">
          <h2 className="font-black">What photo size should I use for JAMB?</h2>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            Photo requirements can change depending on the JAMB application
            or service. Check the current JAMB instructions for the exact
            file size, dimensions and format required before uploading.
          </p>
        </section>

        <section className="mt-8 rounded-2xl bg-gray-50 p-5">
          <h2 className="text-xl font-black">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6 text-sm">
            <div>
              <p className="font-bold">
                Can I compress my JAMB passport photograph online?
              </p>

              <p className="mt-1 leading-6 text-gray-600">
                Yes. Upload your photograph to SharpKit, choose the target
                size and download the compressed image.
              </p>
            </div>

            <div>
              <p className="font-bold">
                Can I compress a photo to 50KB?
              </p>

              <p className="mt-1 leading-6 text-gray-600">
                Yes. SharpKit includes a 50KB compression option as well as
                20KB, 200KB and custom sizes.
              </p>
            </div>

            <div>
              <p className="font-bold">
                Does SharpKit upload my JAMB photograph?
              </p>

              <p className="mt-1 leading-6 text-gray-600">
                Compression is performed directly in your browser, so the
                image does not need to be uploaded to a SharpKit server.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="font-bold underline underline-offset-4"
          >
            ← Back to SharpKit
          </Link>
        </div>

        <footer className="mt-12 pb-6 text-center text-xs text-gray-400">
          <p>SharpKit — Built for Nigeria.</p>
          <p className="mt-1">Free image compression tools.</p>
        </footer>
      </div>
    </main>
  );
}