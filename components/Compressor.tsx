"use client";

import { ChangeEvent, useEffect, useState } from "react";
import imageCompression from "browser-image-compression";

const PRESET_TARGETS = [20, 50, 200];

type CompressorProps = {
  fixedTarget?: 20 | 50 | 200;
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

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <rect x="5" y="10" width="14" height="10" rx="2" />
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
      className="h-4 w-4"
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
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-7 w-7"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

export default function Compressor({ fixedTarget }: CompressorProps) {
  const [target, setTarget] = useState<number>(() => fixedTarget ?? 50);
  const [customTarget, setCustomTarget] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState("");
  const [resultSize, setResultSize] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isFixed = fixedTarget !== undefined;
  const isCustom = !PRESET_TARGETS.includes(target);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  function formatSize(bytes: number) {
    const kb = bytes / 1024;

    if (kb < 1024) {
      return `${kb.toFixed(1)}KB`;
    }

    return `${(kb / 1024).toFixed(2)}MB`;
  }

  function clearResult() {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview(null);
    setOriginalSize("");
    setResultSize("");
    setError("");
  }

  function selectPreset(kb: number) {
    if (isFixed) return;

    setTarget(kb);
    setCustomTarget("");
    clearResult();
  }

  function selectCustom() {
    if (isFixed) return;

    const value = Number(customTarget);

    if (value >= 5 && value <= 5000) {
      setTarget(value);
    } else {
      setTarget(100);
    }

    clearResult();
  }

  function handleCustomTarget(value: string) {
    if (isFixed) return;

    setCustomTarget(value);

    const number = Number(value);

    if (number >= 5 && number <= 5000) {
      setTarget(number);
      clearResult();
    }
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a JPG, PNG or WebP image.");
      return;
    }

    if (target < 5) {
      setError("Please choose a target size of at least 5KB.");
      return;
    }

    setLoading(true);
    setError("");
    setPreview(null);
    setResultSize("");
    setOriginalSize(formatSize(file.size));

    try {
      const compressed = await compressToTarget(file, target);

      const previewUrl = URL.createObjectURL(compressed);

      setPreview(previewUrl);
      setResultSize(formatSize(compressed.size));
    } catch (err) {
      console.error(err);

      setError(
        "Sorry, we couldn't compress this image. Please try another photo."
      );
    } finally {
      setLoading(false);
    }
  }

  async function compressToTarget(
    file: File,
    targetKB: number
  ): Promise<File> {
    const targetBytes = targetKB * 1024;

    let bestFile: File = file;

    let low = 0.1;
    let high = 0.95;

    for (let i = 0; i < 7; i++) {
      const quality = (low + high) / 2;

      const compressed = await imageCompression(file, {
        maxSizeMB: targetKB / 1024,
        maxWidthOrHeight: 1200,
        initialQuality: quality,
        useWebWorker: true,
        fileType: "image/jpeg",
      });

      if (compressed.size <= targetBytes) {
        bestFile = compressed;
        low = quality;
      } else {
        high = quality;
      }
    }

    if (bestFile.size > targetBytes) {
      const dimensions = [1000, 800, 600, 500, 400, 300];

      for (const maxDimension of dimensions) {
        const compressed = await imageCompression(file, {
          maxSizeMB: targetKB / 1024,
          maxWidthOrHeight: maxDimension,
          initialQuality: 0.5,
          useWebWorker: true,
          fileType: "image/jpeg",
        });

        if (compressed.size <= targetBytes) {
          bestFile = compressed;
          break;
        }

        if (compressed.size < bestFile.size) {
          bestFile = compressed;
        }
      }
    }

    return bestFile;
  }

  function handleFileInput(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (file) {
      handleFile(file);
    }

    e.target.value = "";
  }

  function compressAnother() {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview(null);
    setResultSize("");
    setOriginalSize("");
    setError("");
  }

  return (
    <section id="sharpkit-compressor" className="mt-10">
      {/* MAIN TOOL CARD */}
      <div className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-[0_20px_70px_-30px_rgba(16,185,129,0.25)]">
        {/* TOOL HEADER */}
        <div className="border-b border-emerald-900/20 bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-800 px-5 py-7 text-white sm:px-8 sm:py-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-emerald-300 ring-1 ring-white/10">
              <CompressIcon />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                Image Compressor
              </p>

              <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
                Make your image smaller.
              </h2>

              <p className="mt-2 max-w-lg text-sm leading-6 text-emerald-50/75">
                Reduce your photo to the size you need without uploading it to
                a server.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-emerald-50 ring-1 ring-white/10">
              <LockIcon />
              Private
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-emerald-50 ring-1 ring-white/10">
              <BoltIcon />
              Browser-based
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-emerald-50 ring-1 ring-white/10">
              <CheckIcon />
              Free
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-7">
          {/* TARGET SIZE */}
          {isFixed ? (
            <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 text-center">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-200/60 blur-2xl" />

              <p className="relative text-xs font-black uppercase tracking-[0.18em] text-emerald-700/60">
                Target size
              </p>

              <div className="relative mt-1 text-4xl font-black tracking-tight text-emerald-950">
                {fixedTarget}
                <span className="ml-1 text-xl text-emerald-700/50">
                  KB
                </span>
              </div>

              <p className="relative mt-1 text-xs font-medium text-emerald-800/60">
                This compressor is preset to {fixedTarget}KB.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 sm:p-5">
              <div className="text-center">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700/60">
                  Target size
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-600">
                  Choose how small you want your image
                </p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {PRESET_TARGETS.map((kb) => (
                  <button
                    key={kb}
                    type="button"
                    onClick={() => selectPreset(kb)}
                    className={`rounded-xl border px-4 py-3.5 text-sm font-black transition-all duration-200 ${
                      target === kb && !isCustom
                        ? "border-emerald-700 bg-emerald-700 text-white shadow-lg shadow-emerald-700/20"
                        : "border-emerald-100 bg-white text-slate-800 hover:border-emerald-300 hover:bg-emerald-50"
                    }`}
                  >
                    {kb}KB
                  </button>
                ))}

                <button
                  type="button"
                  onClick={selectCustom}
                  className={`rounded-xl border px-4 py-3.5 text-sm font-black transition-all duration-200 ${
                    isCustom
                      ? "border-emerald-700 bg-emerald-700 text-white shadow-lg shadow-emerald-700/20"
                      : "border-emerald-100 bg-white text-slate-800 hover:border-emerald-300 hover:bg-emerald-50"
                  }`}
                >
                  Custom
                </button>
              </div>

              {isCustom && (
                <div className="mx-auto mt-5 max-w-sm">
                  <label
                    htmlFor="customSize"
                    className="mb-2 block text-center text-xs font-black uppercase tracking-wider text-slate-500"
                  >
                    Custom target size
                  </label>

                  <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-white p-1.5 shadow-sm transition focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/10">
                    <input
                      id="customSize"
                      type="number"
                      min="5"
                      max="5000"
                      value={customTarget}
                      onChange={(e) =>
                        handleCustomTarget(e.target.value)
                      }
                      placeholder="e.g. 75"
                      className="w-full bg-transparent px-3 py-2 text-center font-black text-slate-900 outline-none"
                    />

                    <span className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-800">
                      KB
                    </span>
                  </div>

                  <p className="mt-2 text-center text-xs text-slate-400">
                    Enter a value between 5KB and 5000KB.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* UPLOAD */}
          <div className="mt-5">
            <input
              type="file"
              id="sharpkit-file"
              accept="image/jpeg,image/png,image/webp,image/*"
              className="hidden"
              onChange={handleFileInput}
            />

            {!preview && !loading && (
              <label
                htmlFor="sharpkit-file"
                className="group block cursor-pointer rounded-[1.75rem] border-2 border-dashed border-emerald-200 bg-gradient-to-b from-emerald-50/60 to-white px-5 py-10 text-center transition-all duration-200 hover:border-emerald-500 hover:shadow-[0_15px_40px_-25px_rgba(16,185,129,0.5)] active:scale-[0.995] sm:px-10 sm:py-14"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-xl shadow-emerald-700/20 transition duration-200 group-hover:-translate-y-1 group-hover:scale-105">
                  <ImageIcon />
                </div>

                <p className="mt-5 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                  Upload your photo
                </p>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Choose a photo from your phone or computer and we&apos;ll
                  compress it instantly.
                </p>

                <div className="mx-auto mt-6 inline-flex items-center rounded-full bg-emerald-700 px-7 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-700/20 transition-all group-hover:-translate-y-0.5 group-hover:bg-emerald-800">
                  Choose Photo
                  <span className="ml-2 text-base">→</span>
                </div>

                <p className="mt-4 text-xs font-semibold tracking-wide text-slate-400">
                  JPG · PNG · WebP
                </p>
              </label>
            )}

            {/* LOADING */}
            {loading && (
              <div className="rounded-[1.75rem] border border-emerald-100 bg-emerald-50/50 px-6 py-12 text-center sm:px-10 sm:py-14">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 border-emerald-100">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-700" />
                </div>

                <p className="mt-6 text-xl font-black tracking-tight text-slate-950">
                  Compressing to {target}KB...
                </p>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Your photo is being processed directly on your device. This
                  usually takes only a moment.
                </p>

                <div className="mx-auto mt-5 h-1.5 max-w-xs overflow-hidden rounded-full bg-emerald-100">
                  <div className="h-full w-1/2 animate-pulse rounded-full bg-emerald-600" />
                </div>
              </div>
            )}

            {/* ERROR */}
            {error && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm font-semibold leading-6 text-red-600">
                {error}
              </div>
            )}
          </div>

          {/* RESULT */}
          {preview && !loading && (
            <section className="mt-5 overflow-hidden rounded-[1.75rem] border border-emerald-100 bg-emerald-50/40">
              <div className="border-b border-emerald-100 bg-white px-5 py-6 text-center sm:px-8">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <CheckIcon />
                </div>

                <p className="mt-4 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                  Your photo is ready
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Successfully compressed for your target size.
                </p>
              </div>

              <div className="p-4 sm:p-6">
                <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white p-2 shadow-sm">
                  <img
                    src={preview}
                    alt="Compressed photo"
                    className="mx-auto h-56 w-full rounded-xl object-contain sm:h-72"
                  />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-emerald-100 bg-white p-4 text-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Original
                    </p>

                    <p className="mt-1 text-lg font-black text-slate-800">
                      {originalSize}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-emerald-800 p-4 text-center text-white shadow-lg shadow-emerald-800/10">
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                      Compressed
                    </p>

                    <p className="mt-1 text-lg font-black">
                      {resultSize}
                    </p>
                  </div>
                </div>

                <a
                  href={preview}
                  download={`sharpkit-${target}kb.jpg`}
                  className="mt-5 flex w-full items-center justify-center rounded-full bg-emerald-700 px-8 py-4 font-black text-white shadow-lg shadow-emerald-700/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-800"
                >
                  <DownloadIcon />
                  <span className="ml-2">Download Photo</span>
                </a>

                <button
                  type="button"
                  onClick={compressAnother}
                  className="mt-3 w-full rounded-full border-2 border-emerald-100 bg-white px-8 py-3.5 font-bold text-slate-800 transition-all hover:border-emerald-600 hover:bg-emerald-700 hover:text-white"
                >
                  Compress Another Photo
                </button>

                <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                  Check your portal&apos;s current photo requirements before
                  uploading.
                </p>
              </div>
            </section>
          )}
        </div>
      </div>
    </section>
  );
}

