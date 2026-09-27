"use client";

import { ChangeEvent, useEffect, useState } from "react";
import imageCompression from "browser-image-compression";

const PRESET_TARGETS = [20, 50, 200];

export default function Compressor() {
  const [target, setTarget] = useState(50);
  const [customTarget, setCustomTarget] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState("");
  const [resultSize, setResultSize] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    setTarget(kb);
    setCustomTarget("");
    clearResult();
  }

  function selectCustom() {
    const value = Number(customTarget);

    if (value >= 5 && value <= 5000) {
      setTarget(value);
    } else {
      setTarget(100);
    }

    clearResult();
  }

  function handleCustomTarget(value: string) {
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
    <section className="mt-7">
      {/* SIZE SELECTOR */}
      <p className="mb-3 text-center text-sm font-bold text-gray-700">
        Choose target size
      </p>

      <div className="flex flex-wrap justify-center gap-2">
        {PRESET_TARGETS.map((kb) => (
          <button
            key={kb}
            type="button"
            onClick={() => selectPreset(kb)}
            className={`rounded-full border px-5 py-2.5 font-bold transition ${
              target === kb && !isCustom
                ? "bg-black text-white"
                : "bg-gray-100 text-black hover:bg-gray-200"
            }`}
          >
            {kb}KB
          </button>
        ))}

        <button
          type="button"
          onClick={selectCustom}
          className={`rounded-full border px-5 py-2.5 font-bold transition ${
            isCustom
              ? "bg-black text-white"
              : "bg-gray-100 text-black hover:bg-gray-200"
          }`}
        >
          Custom
        </button>
      </div>

      {/* CUSTOM SIZE */}
      {isCustom && (
        <div className="mx-auto mt-4 max-w-xs">
          <label
            htmlFor="customSize"
            className="mb-2 block text-center text-sm font-bold"
          >
            Enter target size in KB
          </label>

          <div className="flex items-center gap-2">
            <input
              id="customSize"
              type="number"
              min="5"
              max="5000"
              value={customTarget}
              onChange={(e) => handleCustomTarget(e.target.value)}
              placeholder="e.g. 75"
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-center font-bold outline-none focus:border-black"
            />

            <span className="font-bold">KB</span>
          </div>

          <p className="mt-2 text-center text-xs text-gray-500">
            Enter between 5KB and 5000KB.
          </p>
        </div>
      )}

      {/* UPLOAD */}
      <div className="mt-7">
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
            className="block cursor-pointer rounded-3xl border-2 border-dashed border-black bg-gray-50 p-10 text-center transition hover:bg-gray-100 active:scale-[0.99]"
          >
            <div className="text-6xl">📸</div>

            <p className="mt-4 text-xl font-black">
              Tap to Upload Photo
            </p>

            <p className="mt-2 text-sm text-gray-500">
              JPG, PNG or WebP
            </p>

            <div className="mx-auto mt-5 inline-block rounded-full bg-black px-7 py-3 text-sm font-bold text-white">
              Choose Photo
            </div>
          </label>
        )}

        {/* LOADING */}
        {loading && (
          <div className="rounded-3xl border-2 border-gray-200 bg-gray-50 p-10 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-black" />

            <p className="mt-5 font-black">
              Compressing to {target}KB...
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Please wait. Your photo is being processed on your device.
            </p>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mt-4 rounded-xl bg-red-50 p-4 text-center text-sm font-semibold text-red-600">
            {error}
          </div>
        )}
      </div>

      {/* RESULT */}
      {preview && !loading && (
        <section className="mt-7 rounded-3xl bg-gray-50 p-6 text-center">
          <p className="text-lg font-black">Your photo is ready</p>

          <img
            src={preview}
            alt="Compressed photo"
            className="mx-auto mt-5 h-44 w-44 rounded-xl object-cover"
          />

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white p-3">
              <p className="text-xs text-gray-500">Original</p>
              <p className="mt-1 font-black">{originalSize}</p>
            </div>

            <div className="rounded-xl bg-black p-3 text-white">
              <p className="text-xs text-gray-300">Compressed</p>
              <p className="mt-1 font-black">{resultSize}</p>
            </div>
          </div>

          <a
            href={preview}
            download={`sharpkit-${target}kb.jpg`}
            className="mt-5 block w-full rounded-full bg-black px-8 py-4 font-black text-white transition hover:bg-gray-800"
          >
            Download Photo
          </a>

          <button
            type="button"
            onClick={compressAnother}
            className="mt-3 w-full rounded-full border-2 border-black px-8 py-3 font-bold transition hover:bg-black hover:text-white"
          >
            Compress Another Photo
          </button>

          <p className="mt-3 text-xs text-gray-500">
            Check your portal&apos;s current photo requirements before
            uploading.
          </p>
        </section>
      )}
    </section>
  );
}