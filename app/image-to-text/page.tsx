"use client";

import {
  ChangeEvent,
  useRef,
  useState,
} from "react";
import {
  createWorker,
  PSM,
} from "tesseract.js";
import Link from "next/link";

type OcrMode = "document" | "flyer";

type OCRPassResult = {
  text: string;
  confidence: number;
};

function loadImage(
  source: string
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(
        new Error("Unable to load the image.")
      );

    image.src = source;
  });
}

function imageToCanvas(
  image: HTMLImageElement,
  mode:
    | "original"
    | "gray"
    | "contrast"
    | "threshold"
): string {
  const maxDimension = 3000;
  const minDimension = 1600;

  let width = image.naturalWidth;
  let height = image.naturalHeight;

  const largest =
    Math.max(width, height);

  if (largest > maxDimension) {
    const scale =
      maxDimension / largest;

    width = Math.round(width * scale);
    height = Math.round(height * scale);
  } else if (largest < minDimension) {
    const scale =
      minDimension / largest;

    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas =
    document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const context =
    canvas.getContext("2d", {
      willReadFrequently: true,
    });

  if (!context) {
    throw new Error(
      "Could not prepare the image."
    );
  }

  context.drawImage(
    image,
    0,
    0,
    width,
    height
  );

  if (mode === "original") {
    return canvas.toDataURL("image/png");
  }

  const imageData =
    context.getImageData(
      0,
      0,
      width,
      height
    );

  const { data } = imageData;

  const gray = new Uint8Array(
    width * height
  );

  for (
    let index = 0;
    index < width * height;
    index++
  ) {
    const pixelIndex = index * 4;

    const red =
      data[pixelIndex];

    const green =
      data[pixelIndex + 1];

    const blue =
      data[pixelIndex + 2];

    const value =
      0.299 * red +
      0.587 * green +
      0.114 * blue;

    gray[index] = Math.max(
      0,
      Math.min(255, Math.round(value))
    );
  }

  if (mode === "gray") {
    for (
      let index = 0;
      index < width * height;
      index++
    ) {
      const value = gray[index];
      const pixelIndex = index * 4;

      data[pixelIndex] = value;
      data[pixelIndex + 1] = value;
      data[pixelIndex + 2] = value;
      data[pixelIndex + 3] = 255;
    }

    context.putImageData(
      imageData,
      0,
      0
    );

    return canvas.toDataURL(
      "image/png"
    );
  }

  if (mode === "contrast") {
    const contrast = 1.35;
    const midpoint = 128;

    for (
      let index = 0;
      index < width * height;
      index++
    ) {
      const value = gray[index];

      const adjusted =
        (value - midpoint) *
          contrast +
        midpoint;

      const finalValue = Math.max(
        0,
        Math.min(
          255,
          Math.round(adjusted)
        )
      );

      const pixelIndex = index * 4;

      data[pixelIndex] =
        finalValue;

      data[pixelIndex + 1] =
        finalValue;

      data[pixelIndex + 2] =
        finalValue;

      data[pixelIndex + 3] = 255;
    }

    context.putImageData(
      imageData,
      0,
      0
    );

    return canvas.toDataURL(
      "image/png"
    );
  }

  /*
   * Adaptive thresholding.
   *
   * This helps printed black text stand
   * out from uneven paper backgrounds.
   */
  const radius = 4;

  for (
    let y = 0;
    y < height;
    y++
  ) {
    for (
      let x = 0;
      x < width;
      x++
    ) {
      let sum = 0;
      let count = 0;

      const startX = Math.max(
        0,
        x - radius
      );

      const endX = Math.min(
        width - 1,
        x + radius
      );

      const startY = Math.max(
        0,
        y - radius
      );

      const endY = Math.min(
        height - 1,
        y + radius
      );

      for (
        let yy = startY;
        yy <= endY;
        yy++
      ) {
        for (
          let xx = startX;
          xx <= endX;
          xx++
        ) {
          sum +=
            gray[
              yy * width + xx
            ];

          count++;
        }
      }

      const average =
        sum / count;

      const current =
        gray[y * width + x];

      const output =
        current <
        average - 10
          ? 0
          : 255;

      const pixelIndex =
        (y * width + x) * 4;

      data[pixelIndex] = output;
      data[pixelIndex + 1] =
        output;
      data[pixelIndex + 2] =
        output;
      data[pixelIndex + 3] = 255;
    }
  }

  context.putImageData(
    imageData,
    0,
    0
  );

  return canvas.toDataURL(
    "image/png"
  );
}

function normalizeLine(
  line: string
): string {
  return line
    .replace(/\s+/g, " ")
    .replace(
      /[|]{2,}/g,
      "|"
    )
    .replace(
      /[_]{3,}/g,
      ""
    )
    .replace(
      /[-]{4,}/g,
      ""
    )
    .trim();
}

function looksLikeGarbage(
  line: string
): boolean {
  const cleaned =
    line.replace(/\s/g, "");

  if (!cleaned) {
    return true;
  }

  /*
   * Lines containing mostly decorative
   * characters are usually graphics,
   * not actual text.
   */
  const letters =
    (
      cleaned.match(
        /[A-Za-zÀ-ÿ]/g
      ) || []
    ).length;

  const numbers =
    (
      cleaned.match(
        /[0-9]/g
      ) || []
    ).length;

  const usefulSymbols =
    (
      cleaned.match(
        /[₦$€£%&@:+.,/()'’"-]/g
      ) || []
    ).length;

  const weird =
    (
      cleaned.match(
        /[^A-Za-zÀ-ÿ0-9₦$€£%&@:+.,/()'’" -]/g
      ) || []
    ).length;

  const useful =
    letters +
    numbers +
    usefulSymbols;

  if (
    useful === 0 &&
    weird > 0
  ) {
    return true;
  }

  if (
    cleaned.length >= 3 &&
    weird >
      useful * 1.5
  ) {
    return true;
  }

  /*
   * Very short lines made entirely of
   * repeated punctuation are usually
   * decorative OCR noise.
   */
  if (
    cleaned.length <= 4 &&
    !/[A-Za-z0-9]/.test(
      cleaned
    )
  ) {
    return true;
  }

  return false;
}

function cleanResult(
  text: string
): string {
  const lines =
    text
      .replace(/\r/g, "")
      .split("\n")
      .map(normalizeLine)
      .filter(Boolean)
      .filter(
        (line) =>
          !looksLikeGarbage(line)
      );

  const uniqueLines: string[] =
    [];

  for (const line of lines) {
    const normalized =
      line
        .toLowerCase()
        .replace(
          /[^a-z0-9₦$€£%]+/gi,
          ""
        );

    if (!normalized) {
      continue;
    }

    const alreadyExists =
      uniqueLines.some(
        (existing) => {
          const existingNormalized =
            existing
              .toLowerCase()
              .replace(
                /[^a-z0-9₦$€£%]+/gi,
                ""
              );

          return (
            existingNormalized ===
              normalized ||
            existingNormalized.includes(
              normalized
            ) ||
            normalized.includes(
              existingNormalized
            )
          );
        }
      );

    if (!alreadyExists) {
      uniqueLines.push(line);
    }
  }

  return uniqueLines.join("\n");
}

function scoreText(
  text: string,
  confidence: number
): number {
  const lines =
    text
      .split("\n")
      .map((line) =>
        line.trim()
      )
      .filter(Boolean);

  if (!lines.length) {
    return 0;
  }

  let score =
    confidence * 2;

  for (const line of lines) {
    const letters =
      (
        line.match(
          /[A-Za-z]/g
        ) || []
      ).length;

    const numbers =
      (
        line.match(
          /[0-9]/g
        ) || []
      ).length;

    const weird =
      (
        line.match(
          /[^A-Za-z0-9₦$€£%&@:+.,/()'’" -]/g
        ) || []
      ).length;

    const useful =
      letters +
      numbers;

    if (useful >= 4) {
      score += 10;
    }

    if (letters >= 2) {
      score += 4;
    }

    if (numbers >= 2) {
      score += 3;
    }

    if (
      weird >
      useful * 0.5
    ) {
      score -= 8;
    }
  }

  /*
   * Reward readable multi-line results,
   * but avoid rewarding massive noisy output.
   */
  if (
    lines.length >= 2 &&
    lines.length <= 30
  ) {
    score += 8;
  }

  if (
    lines.length > 40
  ) {
    score -=
      (lines.length - 40) *
      0.5;
  }

  return score;
}

async function runOCRPass(
  imageSource: string,
  mode: OcrMode,
  onProgress: (
    progress: number,
    status: string
  ) => void
): Promise<OCRPassResult> {
  const worker =
    await createWorker(
      "eng",
      1,
      {
        logger: (message) => {
          if (
            typeof message.progress ===
            "number"
          ) {
            onProgress(
              message.progress,
              message.status ||
                "Processing..."
            );
          }
        },
      }
    );

  try {
    await worker.setParameters(
      {
        tessedit_pageseg_mode:
          mode === "flyer"
            ? PSM.SPARSE_TEXT
            : PSM.AUTO,
        preserve_interword_spaces:
          "1",
      }
    );

    const result =
      await worker.recognize(
        imageSource
      );

    const text =
      result.data.text || "";

    const confidence =
      result.data.confidence ||
      0;

    return {
      text: cleanResult(text),
      confidence,
    };
  } finally {
    await worker.terminate();
  }
}

export default function ImageToTextPage() {
  const fileInputRef =
    useRef<HTMLInputElement>(
      null
    );

  const cameraInputRef =
    useRef<HTMLInputElement>(
      null
    );

  const [image, setImage] =
    useState<string | null>(
      null
    );

  const [result, setResult] =
    useState("");

  const [mode, setMode] =
    useState<OcrMode>(
      "document"
    );

  const [loading, setLoading] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const [status, setStatus] =
    useState("");

  const [confidence, setConfidence] =
    useState<number | null>(
      null
    );

  const [error, setError] =
    useState("");

  const [copied, setCopied] =
  useState(false);

  function handleFile(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      setError(
        "Please select an image file."
      );
      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      setImage(
        reader.result as string
      );

      setResult("");
      setConfidence(null);
      setError("");
      setProgress(0);
      setStatus("");
    };

    reader.onerror = () => {
      setError(
        "Could not read this image."
      );
    };

    reader.readAsDataURL(file);
  }

  async function extractText() {
    if (!image) {
      return;
    }

    setLoading(true);
    setError("");
    setResult("");
    setConfidence(null);
    setProgress(0);
    setStatus(
      "Preparing image..."
    );

    try {
      const loadedImage =
        await loadImage(image);

      const versions = [
        {
          name: "Original",
          source:
            imageToCanvas(
              loadedImage,
              "original"
            ),
        },
        {
          name: "Grayscale",
          source:
            imageToCanvas(
              loadedImage,
              "gray"
            ),
        },
        {
          name: "Enhanced",
          source:
            imageToCanvas(
              loadedImage,
              "contrast"
            ),
        },
        {
          name: "High contrast",
          source:
            imageToCanvas(
              loadedImage,
              "threshold"
            ),
        },
      ];

      const results: Array<
        OCRPassResult & {
          score: number;
          name: string;
        }
      > = [];

      for (
        let index = 0;
        index <
        versions.length;
        index++
      ) {
        const version =
          versions[index];

        setStatus(
          `Reading ${version.name.toLowerCase()} image...`
        );

        const pass =
          await runOCRPass(
            version.source,
            mode,
            (
              passProgress,
              passStatus
            ) => {
              const overallProgress =
                Math.round(
                  ((index +
                    passProgress) /
                    versions.length) *
                    100
                );

              setProgress(
                overallProgress
              );

              setStatus(
                `${version.name}: ${passStatus}`
              );
            }
          );

        const score =
          scoreText(
            pass.text,
            pass.confidence
          );

        results.push({
          ...pass,
          score,
          name: version.name,
        });
      }

      /*
       * IMPORTANT:
       *
       * Do NOT combine the four OCR passes.
       * Decorative flyers often cause different
       * passes to produce different noisy text.
       *
       * Instead, select only the strongest pass.
       */
      results.sort(
        (a, b) =>
          b.score - a.score
      );

      const best =
        results[0];

      if (
        !best ||
        !best.text.trim()
      ) {
        setError(
          "No readable text was detected. Try a clearer image with the text facing the camera."
        );
        return;
      }

      setResult(
        cleanResult(best.text)
      );

      setConfidence(
        Math.round(
          best.confidence
        )
      );

      setProgress(100);
      setStatus(
        `Text extracted using ${best.name.toLowerCase()} image.`
      );
    } catch (err) {
      console.error(err);

      setError(
        "Something went wrong while reading the image. Please try again with a clearer image."
      );
    } finally {
      setLoading(false);
    }
  }

async function copyText() {
  if (!result.trim()) {
    return;
  }

  try {
    await navigator.clipboard.writeText(
      result
    );

    setCopied(true);
    setStatus(
      "Text copied to clipboard."
    );

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  } catch {
    setError(
      "Could not copy the text. Please select and copy it manually."
    );
  }
}

  function downloadText() {
    if (!result.trim()) {
      return;
    }

    const blob =
      new Blob(
        [result],
        {
          type: "text/plain;charset=utf-8",
        }
      );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      `sharpkit-text-${Date.now()}.txt`;

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    URL.revokeObjectURL(url);
  }

  function reset() {
    setImage(null);
    setResult("");
    setConfidence(null);
    setError("");
    setProgress(0);
    setStatus("");

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }

    if (cameraInputRef.current) {
      cameraInputRef.current.value =
        "";
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-emerald-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <Link
            href="/"
            className="text-xl font-black tracking-tight text-emerald-800"
          >
            SHARPKIT
          </Link>

          <Link
            href="/"
            className="text-sm font-semibold text-slate-600 transition hover:text-emerald-700"
          >
            All Tools
          </Link>
        </div>
      </header>

      <section className="px-5 pb-16 pt-12 sm:px-8 sm:pt-16">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
              Image to Text
            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              Turn images into editable text
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Extract text from notes,
              assignments, books, documents,
              posters, flyers and other
              images directly in your browser.
            </p>
          </div>

          <div className="mt-10 rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-8">
            {!image ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/60 px-6 py-12 text-center transition hover:border-emerald-400 hover:bg-emerald-50"
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-700 text-white">
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line
                        x1="12"
                        y1="3"
                        x2="12"
                        y2="15"
                      />
                    </svg>
                  </div>

                  <div className="text-lg font-bold">
                    Upload Image
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    JPG, PNG, WEBP and other
                    common image formats
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    cameraInputRef.current?.click()
                  }
                  className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center transition hover:border-emerald-300 hover:bg-emerald-50"
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
                      <circle
                        cx="12"
                        cy="13"
                        r="3"
                      />
                    </svg>
                  </div>

                  <div className="text-lg font-bold">
                    Take a Photo
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    Use your phone or computer
                    camera
                  </p>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  className="hidden"
                />

                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFile}
                  className="hidden"
                />
              </div>
            ) : (
              <div>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                  <img
                    src={image}
                    alt="Selected image"
                    className="mx-auto max-h-[600px] w-auto max-w-full object-contain"
                  />
                </div>

                <div className="mt-6">
                  <div className="mb-3 text-sm font-bold text-slate-700">
                    What type of image is this?
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() =>
                        setMode(
                          "document"
                        )
                      }
                      className={`rounded-xl border px-5 py-4 text-left transition ${
                        mode ===
                        "document"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                          : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300"
                      }`}
                    >
                      <div className="font-bold">
                        Document
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        Books, notes,
                        assignments,
                        letters and normal
                        documents
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setMode(
                          "flyer"
                        )
                      }
                      className={`rounded-xl border px-5 py-4 text-left transition ${
                        mode ===
                        "flyer"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                          : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300"
                      }`}
                    >
                      <div className="font-bold">
                        Flyer / Poster
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        Posters, adverts,
                        menus and
                        graphics-heavy images
                      </div>
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={extractText}
                    disabled={loading}
                    className="rounded-xl bg-emerald-700 px-5 py-4 font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading
                      ? "Extracting Text..."
                      : "Extract Text"}
                  </button>

                  <button
                    type="button"
                    onClick={reset}
                    disabled={loading}
                    className="rounded-xl border border-slate-300 bg-white px-5 py-4 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                  >
                    Start Over
                  </button>
                </div>
              </div>
            )}

            {loading && (
              <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold text-emerald-900">
                    {status ||
                      "Processing..."}
                  </span>

                  <span className="font-bold text-emerald-700">
                    {progress}%
                  </span>
                </div>

                <div className="mt-3 h-3 overflow-hidden rounded-full bg-emerald-100">
                  <div
                    className="h-full rounded-full bg-emerald-700 transition-all"
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {result && (
              <div className="mt-8">
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-black">
                      Extracted Text
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      You can edit the text
                      before copying or
                      downloading it.
                    </p>
                  </div>

                  {confidence !==
                    null && (
                    <div className="w-fit rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800">
                      OCR confidence:{" "}
                      {confidence}%
                    </div>
                  )}
                </div>

                <textarea
                  value={result}
                  onChange={(event) =>
                    setResult(
                      event.target.value
                    )
                  }
                  spellCheck
                  className="min-h-[320px] w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-5 font-mono text-sm leading-7 text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  placeholder="Extracted text will appear here..."
                />

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={copyText}
                    className="rounded-xl bg-emerald-700 px-5 py-4 font-bold text-white transition hover:bg-emerald-800"
                    >
                    {copied ? "✓ Copied" : "Copy Text"}
                    </button>

                  <button
                    type="button"
                    onClick={downloadText}
                    className="rounded-xl bg-slate-950 px-5 py-4 font-bold text-white transition hover:bg-slate-800"
                  >
                    Download TXT
                  </button>

                  <button
                    type="button"
                    onClick={reset}
                    className="rounded-xl border border-slate-300 bg-white px-5 py-4 font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Start Over
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="border-y border-emerald-100 bg-white px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-black tracking-tight">
              Useful for students and everyday documents
            </h2>

            <p className="mt-4 text-slate-600">
              Convert photographed or scanned
              text into editable text without
              manually typing everything again.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold">
                Study Notes
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Extract text from handwritten or
                printed study materials and edit
                the result.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold">
                Assignments
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Turn photographed pages into
                editable text for easier revision
                and reference.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold">
                Books & Documents
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Capture a printed page and extract
                the text directly in your browser.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-emerald-950 px-5 py-16 text-white sm:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-black">
            Your files stay in your browser
          </h2>

          <p className="mt-4 max-w-2xl leading-7 text-emerald-100">
            SharpKit processes your image locally
            in your browser. Your image is not
            uploaded to a SharpKit server for OCR.
          </p>
        </div>
      </section>

      <footer className="bg-slate-950 px-5 py-8 text-center text-sm text-slate-400 sm:px-8">
        <p>
          SHARPKIT — Simple browser tools for
          students, documents and everyday tasks.
        </p>
      </footer>
    </main>
  );
}

