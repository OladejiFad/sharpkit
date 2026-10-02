import type { Metadata } from "next";
import Link from "next/link";
import ImageResizer from "@/components/ImageResizer";

export const metadata: Metadata = {
  title: "Resize Image Online",
  description:
    "Resize JPG, PNG and WebP images online for free. Change image width and height directly in your browser with SharpKit.",
};

export default function ResizeImagePage() {
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
            Resize Your Image
            <br />
            In Seconds.
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base leading-6 text-gray-600">
            Change the width and height of your JPG, PNG or WebP image
            directly in your browser.
          </p>

          <p className="mt-2 text-sm font-semibold text-gray-500">
            🔒 Your photo stays on your device.
          </p>
        </header>

        <ImageResizer />

        <section className="mt-12">
          <h2 className="text-xl font-black">How to resize an image</h2>

          <ol className="mt-4 ml-5 list-decimal space-y-3 text-sm leading-6 text-gray-700">
            <li>Upload your image.</li>
            <li>Enter your desired width and height.</li>
            <li>
              Keep aspect ratio enabled if you want to preserve the image
              shape.
            </li>
            <li>Click Resize Image.</li>
            <li>Download your resized image.</li>
          </ol>
        </section>

        <section className="mt-8 rounded-2xl border p-5">
          <h2 className="font-black">🔒 Private image processing</h2>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            SharpKit resizes your image directly in your browser. Your photo
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
                Can I resize a JPG image online?
              </p>

              <p className="mt-1 leading-6 text-gray-600">
                Yes. Upload your JPG and enter the dimensions you want.
              </p>
            </div>

            <div>
              <p className="font-bold">
                Can I resize PNG and WebP images?
              </p>

              <p className="mt-1 leading-6 text-gray-600">
                Yes. SharpKit accepts JPG, PNG and WebP images.
              </p>
            </div>

            <div>
              <p className="font-bold">
                Does resizing reduce image quality?
              </p>

              <p className="mt-1 leading-6 text-gray-600">
                Reducing dimensions can reduce the amount of image detail.
                SharpKit uses high-quality JPEG output for the resized image.
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