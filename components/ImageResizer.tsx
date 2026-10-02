"use client";

import { ChangeEvent, useEffect, useState } from "react";

export default function ImageResizer() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);

  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");

  const [keepRatio, setKeepRatio] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
      if (result) URL.revokeObjectURL(result);
    };
  }, [preview, result]);

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

    const image = new Image();

    image.onload = () => {
      setOriginalWidth(image.width);
      setOriginalHeight(image.height);
      setWidth(String(image.width));
      setHeight(String(image.height));
    };

    image.src = previewUrl;

    e.target.value = "";
  }

  function handleWidthChange(value: string) {
    setWidth(value);

    if (!keepRatio || !originalWidth || !originalHeight) return;

    const newWidth = Number(value);

    if (!newWidth) {
      setHeight("");
      return;
    }

    const newHeight = Math.round(
      (newWidth / originalWidth) * originalHeight
    );

    setHeight(String(newHeight));
  }

  function handleHeightChange(value: string) {
    setHeight(value);

    if (!keepRatio || !originalWidth || !originalHeight) return;

    const newHeight = Number(value);

    if (!newHeight) {
      setWidth("");
      return;
    }

    const newWidth = Math.round(
      (newHeight / originalHeight) * originalWidth
    );

    setWidth(String(newWidth));
  }

  function resizeImage() {
    if (!file) {
      setError("Please select an image first.");
      return;
    }

    const targetWidth = Number(width);
    const targetHeight = Number(height);

    if (
      !targetWidth ||
      !targetHeight ||
      targetWidth < 20 ||
      targetHeight < 20
    ) {
      setError("Please enter valid width and height values.");
      return;
    }

    if (targetWidth > 5000 || targetHeight > 5000) {
      setError("Maximum width and height are 5000 pixels.");
      return;
    }

    setLoading(true);
    setError("");

    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const context = canvas.getContext("2d");

      if (!context) {
        setError("Your browser does not support image resizing.");
        setLoading(false);
        return;
      }

      context.drawImage(image, 0, 0, targetWidth, targetHeight);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError("We couldn't create the resized image.");
            setLoading(false);
            return;
          }

          if (result) {
            URL.revokeObjectURL(result);
          }

          const resizedUrl = URL.createObjectURL(blob);

          setResult(resizedUrl);
          setLoading(false);
        },
        "image/jpeg",
        0.92
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
    setWidth("");
    setHeight("");
    setOriginalWidth(0);
    setOriginalHeight(0);
    setError("");
  }

  return (
    <section className="mt-8">
      {!file && (
        <>
          <input
            type="file"
            id="sharpkit-resize-file"
            accept="image/jpeg,image/png,image/webp,image/*"
            className="hidden"
            onChange={handleFileInput}
          />

          <label
            htmlFor="sharpkit-resize-file"
            className="block cursor-pointer rounded-3xl border-2 border-dashed border-black bg-gray-50 p-10 text-center transition hover:bg-gray-100 active:scale-[0.99]"
          >
            <div className="text-6xl">📐</div>

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
            <p className="text-xs text-gray-500">Original dimensions</p>

            <p className="mt-1 font-black">
              {originalWidth} × {originalHeight}px
            </p>
          </div>

          <div className="mt-6">
            <p className="mb-3 text-center text-sm font-bold">
              New dimensions
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="resize-width"
                  className="mb-2 block text-sm font-bold"
                >
                  Width
                </label>

                <input
                  id="resize-width"
                  type="number"
                  min="20"
                  max="5000"
                  value={width}
                  onChange={(e) => handleWidthChange(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-center font-bold outline-none focus:border-black"
                />
              </div>

              <div>
                <label
                  htmlFor="resize-height"
                  className="mb-2 block text-sm font-bold"
                >
                  Height
                </label>

                <input
                  id="resize-height"
                  type="number"
                  min="20"
                  max="5000"
                  value={height}
                  onChange={(e) => handleHeightChange(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-center font-bold outline-none focus:border-black"
                />
              </div>
            </div>

            <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={keepRatio}
                onChange={(e) => setKeepRatio(e.target.checked)}
                className="h-4 w-4"
              />

              Keep aspect ratio
            </label>
          </div>

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 p-4 text-center text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={resizeImage}
            disabled={loading}
            className="mt-6 w-full rounded-full bg-black px-8 py-4 font-black text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Resizing..." : "Resize Image"}
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
          <p className="text-lg font-black">Your resized image is ready</p>

          <img
            src={result}
            alt="Resized image"
            className="mx-auto mt-5 max-h-64 max-w-full rounded-xl object-contain"
          />

          <div className="mt-5 rounded-xl bg-white p-4">
            <p className="text-xs text-gray-500">New dimensions</p>

            <p className="mt-1 font-black">
              {width} × {height}px
            </p>
          </div>

          <a
            href={result}
            download="sharpkit-resized.jpg"
            className="mt-5 block w-full rounded-full bg-black px-8 py-4 font-black text-white transition hover:bg-gray-800"
          >
            Download Resized Image
          </a>

          <button
            type="button"
            onClick={reset}
            className="mt-3 w-full rounded-full border-2 border-black px-8 py-3 font-bold transition hover:bg-black hover:text-white"
          >
            Resize Another Photo
          </button>

          <p className="mt-4 text-xs text-gray-500">
            Your image is resized directly in your browser.
          </p>
        </section>
      )}
    </section>
  );
}