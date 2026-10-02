import type { Metadata } from "next";
import Link from "next/link";
import Compressor from "@/components/Compressor";

export const metadata: Metadata = {
  title: "SharpKit - Free Image & PDF Tools",
  description:
    "Free online image compressor, resizer, converter, document scanner, image-to-text and PDF tools built for Nigeria. Process files directly in your browser.",
};

function CompressIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M4 7h16" />
      <path d="M4 12h10" />
      <path d="M4 17h7" />
      <path d="M18 11v7" />
      <path d="m15 15 3 3 3-3" />
    </svg>
  );
}

function ResizeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M4 9V4h5" />
      <path d="M20 9V4h-5" />
      <path d="M4 15v5h5" />
      <path d="M20 15v5h-5" />
      <path d="M4 4l6 6" />
      <path d="m20 4-6 6" />
      <path d="m4 20 6-6" />
      <path d="m20 20-6-6" />
    </svg>
  );
}

function ConvertIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M7 7h10l-3-3" />
      <path d="M17 7l-3 3" />
      <path d="M17 17H7l3 3" />
      <path d="m7 17 3-3" />
      <path d="M5 7v4" />
      <path d="M19 13v4" />
    </svg>
  );
}

function ScannerIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M6 3h12" />
      <path d="M6 21h12" />
      <path d="M4 7v10" />
      <path d="M20 7v10" />
      <path d="M8 7h8v10H8z" />
      <path d="M10 10h4" />
      <path d="M10 13h3" />
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 15h1.5a1.5 1.5 0 0 0 0-3H8v6" />
      <path d="M13 12v6h1.5a3 3 0 0 0 0-6H13z" />
      <path d="M19 12h-3v6" />
      <path d="M16 15h2.5" />
    </svg>
  );
}

function SignPdfIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 15c1.5-2 3-2 4 0s2.5 2 4 0" />
    </svg>
  );
}

function SignatureIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M4 18c2.5-4 4-7 6-7 1.5 0 1.5 2 0 4-1.5 2-1 3 1 2 2.5-1.5 4-3.5 4.5-5.5" />
      <path d="M14 17c1.5-2 3-3 4-2 .8.8-.2 2-1 3" />
      <path d="M4 21h16" />
    </svg>
  );
}

function LetterheadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M8 7h8" />
      <path d="M8 11h8" />
      <path d="M8 15h5" />
      <path d="M16 15h.01" />
    </svg>
  );
}

function TextIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M5 4h14" />
      <path d="M12 4v16" />
      <path d="M8 20h8" />
      <path d="M7 8h2" />
      <path d="M15 8h2" />
      <path d="M7 12h2" />
      <path d="M15 12h2" />
      <path d="M7 16h2" />
      <path d="M15 16h2" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2"
      />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      <path d="M12 14v2" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

const tools = [
  {
    icon: <CompressIcon />,
    title: "Compress to 20KB",
    description:
      "Perfect for portals and forms with strict file-size limits.",
    href: "/compress-image-to-20kb",
  },
  {
    icon: <CompressIcon />,
    title: "Compress to 50KB",
    description:
      "Reduce your photo quickly while keeping a useful image quality.",
    href: "/compress-image-to-50kb",
  },
  {
    icon: <CompressIcon />,
    title: "Compress to 200KB",
    description:
      "A larger target for websites, applications and online forms.",
    href: "/compress-image-to-200kb",
  },
  {
    icon: <ResizeIcon />,
    title: "Resize Image",
    description:
      "Change your image width and height in pixels.",
    href: "/resize-image",
  },
  {
    icon: <ConvertIcon />,
    title: "Convert Image",
    description:
      "Convert between JPG, PNG and WebP formats.",
    href: "/convert-image",
  },
  {
    icon: <TextIcon />,
    title: "Image to Text",
    description:
      "Extract editable text from notes, books, documents, posters and images.",
    href: "/image-to-text",
  },
  {
    icon: <ScannerIcon />,
    title: "Document Scanner",
    description:
      "Scan documents, correct perspective and create clean digital copies.",
    href: "/scanner",
  },
    {
    icon: <PdfIcon />,
    title: "PDF Converter",
    description:
      "Convert images, Word documents and Excel files to PDF directly in your browser.",
    href: "/pdf-converter",
  },
  {
    icon: <LetterheadIcon />,
    title: "Letterhead Editor",
    description:
      "Edit documents on your letterhead, add text and signatures, and export as PDF.",
    href: "/letterhead-editor",
  },
  {
    icon: <SignPdfIcon />,
    title: "Sign PDF",
    description:
      "Add your signature to PDF documents and download the signed file.",
    href: "/sign-pdf",
  },
  {
    icon: <SignatureIcon />,
    title: "Signature Maker",
    description:
      "Create a digital signature and download it as an image.",
    href: "/signature-maker",
  },
];

const faqs = [
  {
    question: "How do I compress an image to 50KB?",
    answer:
      "Choose 50KB, upload your photo and download the compressed image when processing is complete.",
  },
  {
    question: "Can I compress an image to a custom size?",
    answer:
      "Yes. Select Custom and enter a target size between 5KB and 5000KB.",
  },
  {
    question: "Can I resize an image?",
    answer:
      "Yes. SharpKit lets you change the width and height of your image in pixels.",
  },
  {
    question: "Can I convert JPG, PNG and WebP?",
    answer:
      "Yes. SharpKit supports conversion between JPG, PNG and WebP.",
  },
  {
    question: "Can I extract text from an image?",
    answer:
      "Yes. Use Image to Text to extract readable text from documents, notes, books, posters, flyers and other images. You can edit, copy or download the extracted text.",
  },
  {
    question: "Can I convert files to PDF?",
    answer:
      "Yes. SharpKit's PDF Converter supports images, TXT, Word documents and Excel files, and can also merge multiple PDF files.",
  },
  {
    question: "Can I scan a document and save it as PDF?",
    answer:
      "Yes. Use the Document Scanner to capture or upload a document, correct its perspective and download the finished scan as a PDF.",
  },
  {
    question: "Is my photo uploaded to a server?",
    answer:
      "No. Image processing happens directly in your browser, so your files do not need to be uploaded to a SharpKit server.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-950">
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-emerald-100/60 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[500px] rounded-full bg-green-100/50 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <header className="pt-6 sm:pt-8">
          <nav className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2.5"
              aria-label="SharpKit home"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M12 3v18" />
                  <path d="M3 12h18" />
                  <path d="m5.5 5.5 13 13" />
                  <path d="m18.5 5.5-13 13" />
                </svg>
              </span>

              <span className="text-lg font-black tracking-tight">
                SharpKit
              </span>
            </Link>

            <div className="hidden items-center gap-1 sm:flex">
              <Link
                href="/resize-image"
                className="rounded-full px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-white hover:text-emerald-600"
              >
                Resize
              </Link>

              <Link
                href="/convert-image"
                className="rounded-full px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-white hover:text-emerald-600"
              >
                Convert
              </Link>

              <Link
                href="/image-to-text"
                className="rounded-full px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-white hover:text-emerald-600"
              >
                Image to Text
              </Link>

              <Link
                href="/pdf-converter"
                className="rounded-full px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-white hover:text-emerald-600"
              >
                PDF
              </Link>
            </div>

            <div className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-black text-slate-600 shadow-sm sm:hidden">
              Free
            </div>
          </nav>
        </header>

        {/* HERO */}
        <section className="relative pb-6 pt-16 text-center sm:pb-8 sm:pt-20">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Free · Private · Browser-based
          </div>

          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-black leading-[1.05] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
            Your files.
            <br />
            <span className="text-slate-400">
              Exactly how you need them.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Compress, resize, convert, extract text, scan and create PDFs
            in seconds. Built for Nigerian portals, applications, students,
            forms and everyday file needs.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <LockIcon />
              Your files stay on your device
            </span>

            <span className="hidden text-slate-300 sm:inline">
              •
            </span>

            <span className="inline-flex items-center gap-1.5">
              <BoltIcon />
              No software to install
            </span>
          </div>
        </section>

        {/* MAIN COMPRESSOR */}
        <Compressor />

        {/* QUICK TARGETS */}
        <section className="mt-14">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                Popular tools
              </p>

              <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
                Choose what you need
              </h2>
            </div>

            <p className="max-w-md text-sm leading-6 text-slate-500 sm:text-right">
              Quick tools for common image and document requirements.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-950/5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white">
                    {tool.icon}
                  </div>

                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-lg font-bold text-slate-400 transition group-hover:border-emerald-600 group-hover:bg-emerald-600 group-hover:text-white">
                    ↗
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-black tracking-tight">
                  {tool.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {tool.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* TRUST STRIP */}
        <section className="mt-14 overflow-hidden rounded-[2rem] bg-emerald-950 text-white shadow-2xl shadow-emerald-950/10">
          <div className="grid gap-0 sm:grid-cols-3">
            <div className="border-b border-white/10 p-6 sm:border-b-0 sm:border-r">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-emerald-400">
                <LockIcon />
              </div>

              <h3 className="mt-4 font-black">
                Private
              </h3>

              <p className="mt-1 text-sm leading-6 text-emerald-100/60">
                Your files are processed directly in your browser.
              </p>
            </div>

            <div className="border-b border-white/10 p-6 sm:border-b-0 sm:border-r">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-emerald-400">
                <BoltIcon />
              </div>

              <h3 className="mt-4 font-black">
                Fast
              </h3>

              <p className="mt-1 text-sm leading-6 text-emerald-100/60">
                No account, installation or complicated setup.
              </p>
            </div>

            <div className="p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-emerald-400">
                <CheckIcon />
              </div>

              <h3 className="mt-4 font-black">
                Free
              </h3>

              <p className="mt-1 text-sm leading-6 text-emerald-100/60">
                Use the core SharpKit tools at no cost.
              </p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="mt-16">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              Simple process
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              How SharpKit works
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
              No complicated settings. Pick a tool, select your file and get
              your finished result.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-black text-white">
                01
              </div>

              <h3 className="mt-5 font-black">
                Choose a tool
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Select compression, resizing, conversion, text extraction,
                scanning or PDF tools.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-black text-white">
                02
              </div>

              <h3 className="mt-5 font-black">
                Select your file
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Choose an image or supported document from your device.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-black text-white">
                03
              </div>

              <h3 className="mt-5 font-black">
                Download
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Download your finished file when processing is complete.
              </p>
            </div>
          </div>
        </section>

        {/* PRIVACY */}
        <section className="mt-14 rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
              <LockIcon />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                Privacy first
              </p>

              <h2 className="mt-1 text-2xl font-black tracking-tight">
                Your files stay on your device.
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-emerald-950/70">
                SharpKit processes supported files directly in your browser.
                Your files do not need to be uploaded to a SharpKit server
                for these tools to work.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              Questions
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              Frequently asked questions
            </h2>
          </div>

          <div className="mt-7 grid gap-3">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
              >
                <h3 className="font-black">
                  {faq.question}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="mt-16 rounded-[2rem] bg-gradient-to-br from-emerald-700 to-green-600 px-6 py-12 text-center text-white shadow-2xl shadow-emerald-950/15 sm:px-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-100">
            SharpKit
          </p>

          <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">
            Get your files ready in seconds.
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-emerald-50">
            Compress, resize, convert, extract text, scan or create PDFs
            without installing anything.
          </p>

          <a
            href="#sharpkit-compressor"
            className="mt-7 inline-flex rounded-full bg-white px-7 py-3.5 text-sm font-black text-emerald-700 transition hover:bg-emerald-50"
          >
            Back to compressor ↑
          </a>
        </section>

        {/* FOOTER */}
        <footer className="mt-12 border-t border-slate-200 py-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-black tracking-tight">
                SharpKit
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Free image and document tools built for Nigeria.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500">
              <Link
                href="/compress-image-to-20kb"
                className="transition hover:text-emerald-600"
              >
                20KB
              </Link>

              <Link
                href="/compress-image-to-50kb"
                className="transition hover:text-emerald-600"
              >
                50KB
              </Link>

              <Link
                href="/compress-image-to-200kb"
                className="transition hover:text-emerald-600"
              >
                200KB
              </Link>

              <Link
                href="/resize-image"
                className="transition hover:text-emerald-600"
              >
                Resize
              </Link>

              <Link
                href="/convert-image"
                className="transition hover:text-emerald-600"
              >
                Convert
              </Link>

              <Link
                href="/image-to-text"
                className="transition hover:text-emerald-600"
              >
                Image to Text
              </Link>

              <Link
                href="/scanner"
                className="transition hover:text-emerald-600"
              >
                Scanner
              </Link>

              <Link
                href="/pdf-converter"
                className="transition hover:text-emerald-600"
              >
                PDF
              </Link>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400 sm:text-left">
            © {new Date().getFullYear()} SharpKit. All rights reserved.
          </p>
        </footer>
      </div>
    </main>
  );
}

