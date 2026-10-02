"use client";

import { ChangeEvent, useEffect, useState } from "react";

type ImageFormat = "image/jpeg" | "image/png" | "image/webp";

const FORMAT_OPTIONS: {
  value: ImageFormat;
  label: string;
  extension: string;
}[] = [
  {
    value: "image/jpeg",
    label: "JPG",
    extension: "jpg",
  },
  {
    value: "image/png",
    label: "PNG",
    extension: "png",
  },
  {
    value: "image/webp",
    label: "WebP",
    extension: "webp",
  },
];

export default function ImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const [format, setFormat] = useState<ImageFormat>("image/jpeg");
  const [resultSize, setResultSize] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
      if (result) URL.revokeObjectURL(result);
    };
  }, [preview, result]);

  function formatSize(bytes: number) {
    const kb = bytes / 1024;

    if (kb < 1024) {
      return `${kb.toFixed(1)}KB`;
    }

    return `${(kb / 1024).toFixed(2)}MB`;
  }

  function handleFileInput(e: ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a JPG, PNG or WebP image.");
      return;
    }

    setError("");
    setFile(selectedFile);

    if (preview) URL.revokeObjectURL(preview);
    if (result) URL.revokeObjectURL(result);

    const previewUrl = URL.createObjectURL(selectedFile);

    setPreview(previewUrl);
    setResult(null);
    setResultSize("");

    e.target.value = "";
  }

  function convertImage() {
    if (!file) {
      setError("Please select an image first.");
      return;
    }

    setLoading(true);
    setError("");

    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");

      canvas.width = image.width;
      canvas.height = image.height;

      const context = canvas.getContext("2d");

      if (!context) {
        setError("Your browser does not support image conversion.");
        setLoading(false);
        return;
      }

      context.drawImage(image, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError("We couldn't convert this image.");
            setLoading(false);
            return;
          }

          if (result) {
            URL.revokeObjectURL(result);
          }

          const resultUrl = URL.createObjectURL(blob);

          setResult(resultUrl);
          setResultSize(formatSize(blob.size));
          setLoading(false);
        },
        format,
        format === "image/jpeg" ? 0.92 : undefined
      );
    };

    image.onerror = () => {
      setError("We couldn't read this image.");
      setLoading(false);
    };

    image.src = URL.createObjectURL(file);
  }

  function reset() {
    if (preview) URL.revokeObjectURL(preview);
    if (result) URL.revokeObjectURL(result);

    setFile(null);
    setPreview(null);
    setResult(null);
    setResultSize("");
    setError("");
  }

  const selectedFormat = FORMAT_OPTIONS.find(
    (option) => option.value === format
  );

  return (
    <section className="mt-8">
      {!file && (
        <>
          <input
            type="file"
            id="sharpkit-convert-file"
            accept="image/jpeg,image/png,image/webp,image/*"
            className="hidden"
            onChange={handleFileInput}
          />

          <label
            htmlFor="sharpkit-convert-file"
            className="block cursor-pointer rounded-3xl border-2 border-dashed border-black bg-gray-50 p-10 text-center transition hover:bg-gray-100 active:scale-[0.99]"
          >
            <div className="text-6xl">🔄</div>

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
        </>
      )}

      {file && !result && (
        <section className="rounded-3xl bg-gray-50 p-6">
          <img
            src={preview || ""}
            alt="Selected image"
            className="mx-auto h-48 w-48 rounded-xl object-contain"
          />

          <div className="mt-5 rounded-xl bg-white p-4 text-center">
            <p className="text-xs text-gray-500">Original format</p>

            <p className="mt-1 font-black">
              {file.type === "image/jpeg"
                ? "JPG"
                : file.type === "image/png"
                  ? "PNG"
                  : file.type === "image/webp"
                    ? "WebP"
                    : file.type}
            </p>

            <p className="mt-2 text-xs text-gray-500">Original size</p>

            <p className="mt-1 font-black">{formatSize(file.size)}</p>
          </div>

          <div className="mt-6">
            <p className="mb-3 text-center text-sm font-bold">
              Convert to
            </p>

            <div className="grid grid-cols-3 gap-2">
              {FORMAT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setFormat(option.value);
                    setError("");
                  }}
                  className={`rounded-xl border-2 px-3 py-3 font-black transition ${
                    format === option.value
                      ? "border-black bg-black text-white"
                      : "border-gray-200 bg-white text-black hover:border-black"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 p-4 text-center text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={convertImage}
            disabled={loading}
            className="mt-6 w-full rounded-full bg-black px-8 py-4 font-black text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            {loading
              ? "Converting..."
              : `Convert to ${selectedFormat?.label}`}
          </button>

          <button
            type="button"
            onClick={reset}
            className="mt-3 w-full rounded-full border-2 border-black px-8 py-3 font-bold transition hover:bg-black hover:text-white"
          >
            Choose Another Photo
          </button>
        </section>
      )}

      {result && (
        <section className="rounded-3xl bg-gray-50 p-6 text-center">
          <p className="text-lg font-black">
            Your converted image is ready
          </p>

          <img
            src={result}
            alt="Converted image"
            className="mx-auto mt-5 max-h-64 max-w-full rounded-xl object-contain"
          />

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white p-3">
              <p className="text-xs text-gray-500">Original</p>
              <p className="mt-1 font-black">
                {formatSize(file?.size || 0)}
              </p>
            </div>

            <div className="rounded-xl bg-black p-3 text-white">
              <p className="text-xs text-gray-300">Converted</p>
              <p className="mt-1 font-black">{resultSize}</p>
            </div>
          </div>

          <a
            href={result}
            download={`sharpkit-converted.${selectedFormat?.extension}`}
            className="mt-5 block w-full rounded-full bg-black px-8 py-4 font-black text-white transition hover:bg-gray-800"
          >
            Download {selectedFormat?.label}
          </a>

          <button
            type="button"
            onClick={reset}
            className="mt-3 w-full rounded-full border-2 border-black px-8 py-3 font-bold transition hover:bg-black hover:text-white"
          >
            Convert Another Photo
          </button>

          <p className="mt-4 text-xs text-gray-500">
            Your image is converted directly in your browser.
          </p>
        </section>
      )}
    </section>
  );
}