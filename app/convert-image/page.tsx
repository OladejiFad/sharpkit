import type { Metadata } from "next";
import Link from "next/link";
import ImageConverter from "@/components/ImageConverter";

export const metadata: Metadata = {
  title: "Convert Image Format Online",
  description:
    "Convert JPG, PNG and WebP images online for free. Convert image formats directly in your browser with SharpKit.",
};

export default function ConvertImagePage() {
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
            Convert Your Image
            <br />
            To Another Format.
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base leading-6 text-gray-600">
            Convert JPG, PNG and WebP images directly in your browser.
          </p>

          <p className="mt-2 text-sm font-semibold text-gray-500">
            🔒 Your photo stays on your device.
          </p>
        </header>

        <ImageConverter />

        <section className="mt-12">
          <h2 className="text-xl font-black">How to convert an image</h2>

          <ol className="mt-4 ml-5 list-decimal space-y-3 text-sm leading-6 text-gray-700">
            <li>Upload your image.</li>
            <li>Choose the format you want.</li>
            <li>Click the Convert button.</li>
            <li>Wait for the conversion to finish.</li>
            <li>Download your converted image.</li>
          </ol>
        </section>

        <section className="mt-8 rounded-2xl border p-5">
          <h2 className="font-black">🔒 Private image conversion</h2>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            SharpKit converts your image directly in your browser. Your photo
            does not need to be uploaded to a SharpKit server.
          </p>
        </section>

        <section className="mt-8 rounded-2xl bg-gray-50 p-5">
          <h2 className="text-xl font-black">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6 text-sm">
            <div>
              <p className="font-bold">
                Can I convert JPG to PNG?
              </p>

              <p className="mt-1 leading-6 text-gray-600">
                Yes. Upload your JPG image and select PNG as the output
                format.
              </p>
            </div>

            <div>
              <p className="font-bold">
                Can I convert PNG to JPG?
              </p>

              <p className="mt-1 leading-6 text-gray-600">
                Yes. SharpKit can convert PNG images to JPG.
              </p>
            </div>

            <div>
              <p className="font-bold">
                Can I convert WebP images?
              </p>

              <p className="mt-1 leading-6 text-gray-600">
                Yes. You can convert WebP images to JPG or PNG, or convert
                other supported images to WebP.
              </p>
            </div>

            <div>
              <p className="font-bold">
                Are my images uploaded to a server?
              </p>

              <p className="mt-1 leading-6 text-gray-600">
                No. The conversion is performed directly in your browser.
              </p>
            </div>
          </div>
        </section>

        <footer className="mt-12 pb-6 text-center text-xs text-gray-400">
          <p>SharpKit — Built for Nigeria.</p>
          <p className="mt-1">Free image tools.</p>
        </footer>
      </div>
    </main>
  );
}