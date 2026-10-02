import type { Metadata } from "next";
import Link from "next/link";
import Compressor from "@/components/Compressor";

export const metadata: Metadata = {
  title: "Compress Image to 20KB - Free JAMB, NYSC & NIN Resizer",
  description:
    "Compress your image to 20KB online for free. Reduce JPG, PNG and WebP photos for JAMB, NYSC, NIN and other Nigerian online portals.",
};

export default function CompressImageTo20KB() {
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
            Compress Image to 20KB
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
            Reduce your photo to 20KB or below directly in your browser.
            Useful for online application forms, Nigerian portals and other
            websites with strict image-size limits.
          </p>

          <p className="mt-3 text-sm font-semibold text-gray-500">
            🔒 Your photo stays on your device.
          </p>
        </header>

        <Compressor fixedTarget={20} />

        <section className="mt-12">
          <h2 className="text-2xl font-black sm:text-3xl">
            How to Compress an Image to 20KB
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
              <h3 className="font-black">2. Let SharpKit compress it</h3>

              <p className="mt-1 leading-7 text-gray-600">
                This page is already set to a 20KB target, so you do not need
                to choose a target size manually.
              </p>
            </div>

            <div>
              <h3 className="font-black">3. Download your photo</h3>

              <p className="mt-1 leading-7 text-gray-600">
                When compression is complete, check the resulting file size
                and download the smaller image.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-black sm:text-3xl">
            Why Compress an Image to 20KB?
          </h2>

          <p className="mt-4 leading-7 text-gray-600">
            Some websites and online application forms require users to
            upload photographs below a specific file-size limit. Photos
            taken with modern phones can be several megabytes, which may be
            too large for these upload fields.
          </p>

          <p className="mt-4 leading-7 text-gray-600">
            SharpKit helps reduce the size of your image so it can meet a
            smaller file-size requirement while remaining suitable for
            online applications.
          </p>

          <p className="mt-4 leading-7 text-gray-600">
            Always check the current requirements of the specific portal
            before uploading. Some portals may also specify image
            dimensions, file format or other requirements.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-black sm:text-3xl">
            Frequently Asked Questions
          </h2>

          <div className="mt-6 space-y-6">
            <div>
              <h3 className="font-black">
                Can I compress a JPG to 20KB?
              </h3>

              <p className="mt-2 leading-7 text-gray-600">
                Yes. Upload your JPG and SharpKit will attempt to reduce the
                image to 20KB or below.
              </p>
            </div>

            <div>
              <h3 className="font-black">
                Can I compress a PNG to 20KB?
              </h3>

              <p className="mt-2 leading-7 text-gray-600">
                Yes. PNG images can be uploaded and processed. SharpKit
                converts the resulting image to JPEG to help reduce the
                file size.
              </p>
            </div>

            <div>
              <h3 className="font-black">
                Can I use this on my phone?
              </h3>

              <p className="mt-2 leading-7 text-gray-600">
                Yes. SharpKit works in a modern web browser on phones,
                tablets and computers.
              </p>
            </div>

            <div>
              <h3 className="font-black">
                Is my photo uploaded to a server?
              </h3>

              <p className="mt-2 leading-7 text-gray-600">
                No. Compression happens directly in your browser, so the
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
                Will the result always be exactly 20KB?
              </h3>

              <p className="mt-2 leading-7 text-gray-600">
                SharpKit targets 20KB or below rather than promising an
                exact byte count. The final size can vary depending on the
                original image and its dimensions.
              </p>
            </div>
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