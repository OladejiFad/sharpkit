import type { Metadata } from "next";
import Link from "next/link";
import Compressor from "@/components/Compressor";

export const metadata: Metadata = {
  title: "Compress Image to 50KB - Free JAMB, NYSC & NIN Resizer",
  description:
    "Compress your image to 50KB online for free. Reduce JPG, PNG and WebP photos for JAMB, NYSC, NIN and other Nigerian online portals.",
};

export default function CompressImageTo50KB() {
  return (
    <main className="min-h-screen bg-white px-4 py-8 text-black">
      <div className="mx-auto max-w-3xl">
        <header className="mt-4 text-center">
          <Link
            href="/"
            className="mb-4 inline-block rounded-full bg-black px-4 py-2 text-xs font-black tracking-wider text-white"
          >
            SHARPKIT
          </Link>

          <h1 className="text-3xl font-black leading-tight sm:text-5xl">
            Compress Image to 50KB
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
            Reduce your photo to 50KB or below directly in your browser.
            Useful for JAMB, NYSC, NIN and other Nigerian portals that have
            image-size limits.
          </p>

          <p className="mt-3 text-sm font-semibold text-gray-500">
            🔒 Your photo stays on your device.
          </p>
        </header>

        <Compressor />

        <section className="mt-12">
          <h2 className="text-2xl font-black sm:text-3xl">
            How to Compress an Image to 50KB
          </h2>

          <div className="mt-6 space-y-5">
            <div>
              <h3 className="font-black">1. Upload your photo</h3>

              <p className="mt-1 leading-7 text-gray-600">
                Tap the upload button and select the JPG, PNG or WebP image
                you want to reduce.
              </p>
            </div>

            <div>
              <h3 className="font-black">2. Select 50KB</h3>

              <p className="mt-1 leading-7 text-gray-600">
                Choose the 50KB option. SharpKit will process the image
                directly in your browser.
              </p>
            </div>

            <div>
              <h3 className="font-black">3. Download your photo</h3>

              <p className="mt-1 leading-7 text-gray-600">
                After compression, check the resulting file size and
                download the smaller image to your device.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-black sm:text-3xl">
            Why Compress an Image to 50KB?
          </h2>

          <p className="mt-4 leading-7 text-gray-600">
            Some online application forms and portals place limits on the
            size of uploaded photographs. A large phone camera photo can be
            several megabytes, which may be too large for a particular
            upload field.
          </p>

          <p className="mt-4 leading-7 text-gray-600">
            SharpKit helps reduce the file size while keeping the image
            usable for online applications and document submissions.
          </p>

          <p className="mt-4 leading-7 text-gray-600">
            Always check the current requirements of the specific portal
            before uploading your photo, because image dimensions, file
            format and maximum file size can vary.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-black sm:text-3xl">
            Frequently Asked Questions
          </h2>

          <div className="mt-6 space-y-6">
            <div>
              <h3 className="font-black">
                Can I compress a JPG to 50KB?
              </h3>

              <p className="mt-2 leading-7 text-gray-600">
                Yes. SharpKit can compress JPG images to a target size of
                50KB or below when the image can be reduced to that size.
              </p>
            </div>

            <div>
              <h3 className="font-black">
                Can I compress a PNG to 50KB?
              </h3>

              <p className="mt-2 leading-7 text-gray-600">
                Yes. PNG images can be uploaded and processed. The resulting
                image is converted to JPEG to help achieve a smaller file
                size.
              </p>
            </div>

            <div>
              <h3 className="font-black">
                Is the image uploaded to a server?
              </h3>

              <p className="mt-2 leading-7 text-gray-600">
                No. The compression happens directly in your browser, so the
                photo does not need to be uploaded to a SharpKit server.
              </p>
            </div>

            <div>
              <h3 className="font-black">
                Is SharpKit free?
              </h3>

              <p className="mt-2 leading-7 text-gray-600">
                Yes. SharpKit&apos;s image compressor is free to use.
              </p>
            </div>

            <div>
              <h3 className="font-black">
                Will the result always be exactly 50KB?
              </h3>

              <p className="mt-2 leading-7 text-gray-600">
                The tool targets 50KB or below rather than promising an
                exact byte count. The final size can vary depending on the
                original image and its dimensions.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-12 rounded-3xl bg-gray-50 p-6">
          <h2 className="text-xl font-black">
            Other SharpKit Image Compression Tools
          </h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Link
              href="/"
              className="rounded-xl border border-gray-200 bg-white p-4 text-center font-bold transition hover:border-black hover:bg-black hover:text-white"
            >
              Image Compressor
            </Link>

            <Link
              href="/compress-image-to-20kb"
              className="rounded-xl border border-gray-200 bg-white p-4 text-center font-bold transition hover:border-black hover:bg-black hover:text-white"
            >
              Compress to 20KB
            </Link>

            <Link
              href="/compress-image-to-200kb"
              className="rounded-xl border border-gray-200 bg-white p-4 text-center font-bold transition hover:border-black hover:bg-black hover:text-white"
            >
              Compress to 200KB
            </Link>
          </div>
        </section>

        <footer className="mt-16 border-t border-gray-200 py-8 text-center text-sm text-gray-500">
          <p className="font-bold text-gray-700">SharpKit</p>

          <p className="mt-1">
            Free image compression tools built for everyday online forms.
          </p>
        </footer>
      </div>
    </main>
  );
}
