import Compressor from "@/components/Compressor";

export default function Home() {
  return (
    <main className="min-h-screen bg-white px-4 py-8 text-black">
      <div className="mx-auto max-w-2xl">
        {/* HEADER */}
        <header className="mt-4 text-center">
          <div className="mb-4 inline-block rounded-full bg-black px-4 py-2 text-xs font-black tracking-wider text-white">
            SHARPKIT
          </div>

          <h1 className="text-3xl font-black leading-tight sm:text-4xl">
            Portal Rejected Your Photo?
            <br />
            Fix It In Seconds.
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base leading-6 text-gray-600">
            Compress your photo to 20KB, 50KB, 200KB or a custom size for
            JAMB, NYSC, NIN and other Nigerian portals.
          </p>

          <p className="mt-2 text-sm font-semibold text-gray-500">
            🔒 Your photo stays on your device.
          </p>
        </header>

        {/* COMPRESSOR */}
        <Compressor />

        {/* HOW IT WORKS */}
        <section className="mt-12">
          <h2 className="text-xl font-black">How it works</h2>

          <ol className="mt-4 ml-5 list-decimal space-y-3 text-sm leading-6 text-gray-700">
            <li>Choose your target size.</li>
            <li>Upload your passport photograph.</li>
            <li>SharpKit compresses the image in your browser.</li>
            <li>Download your compressed photo.</li>
            <li>Upload it to your required portal.</li>
          </ol>
        </section>

        {/* PRIVACY */}
        <section className="mt-8 rounded-2xl border p-5">
          <h2 className="font-black">🔒 Your photo stays private</h2>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            SharpKit performs image compression directly in your browser. The
            image does not need to be uploaded to a SharpKit server for
            compression.
          </p>
        </section>

        {/* FAQ */}
        <section className="mt-8 rounded-2xl bg-gray-50 p-5">
          <h2 className="text-xl font-black">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6 text-sm">
            <div>
              <p className="font-bold">
                How do I compress an image to 50KB on my phone?
              </p>

              <p className="mt-1 leading-6 text-gray-600">
                Choose 50KB, upload your photo and download the compressed
                image. No app installation is required.
              </p>
            </div>

            <div>
              <p className="font-bold">
                Can I compress an image to a custom size?
              </p>

              <p className="mt-1 leading-6 text-gray-600">
                Yes. Select Custom and enter the target size between 5KB and
                5000KB.
              </p>
            </div>

            <div>
              <p className="font-bold">
                Can I use SharpKit for JAMB, NYSC or NIN?
              </p>

              <p className="mt-1 leading-6 text-gray-600">
                SharpKit can reduce your image file size. Always check the
                current requirements of the specific portal before uploading.
              </p>
            </div>

            <div>
              <p className="font-bold">
                Is my photo uploaded to a server?
              </p>

              <p className="mt-1 leading-6 text-gray-600">
                Compression happens directly in your browser, so the image
                does not need to be sent to a SharpKit server.
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-12 pb-6 text-center text-xs text-gray-400">
          <p>SharpKit — Built for Nigeria.</p>
          <p className="mt-1">Free image compression tools.</p>
        </footer>
      </div>
    </main>
  );
}