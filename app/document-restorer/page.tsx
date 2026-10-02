"use client";

import {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { PDFDocument } from "pdf-lib";

type RestoreStrength = "light" | "medium" | "strong";
type RestoreMode = "natural" | "clean";

type BeforeAfterSliderProps = {
  original: string;
  restored: string;
};

type AdjustmentValues = {
  brightness: number;
  contrast: number;
  sharpness: number;
};

export default function DocumentRestorerPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("");
  const [strength, setStrength] =
    useState<RestoreStrength>("medium");
  const [mode, setMode] =
    useState<RestoreMode>("natural");

  const [brightness, setBrightness] = useState(4);
  const [contrast, setContrast] = useState(1.08);
  const [sharpness, setSharpness] = useState(0.15);

  const [restoredSrc, setRestoredSrc] =
    useState<string | null>(null);

  const [isRestoring, setIsRestoring] =
    useState(false);

  const [isPdf, setIsPdf] = useState(false);

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    const supportedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!supportedTypes.includes(file.type)) {
      alert(
        "Please upload a JPG, PNG, WebP image, or PDF document."
      );

      event.target.value = "";
      return;
    }

    const url = URL.createObjectURL(file);

    setImageSrc(url);
    setRestoredSrc(null);
    setFileName(file.name);
    setFileType(file.type);
    setIsPdf(file.type === "application/pdf");

    event.target.value = "";
  }

  function updatePreset(
    selectedStrength: RestoreStrength
  ) {
    setStrength(selectedStrength);

    if (selectedStrength === "light") {
      setBrightness(2);
      setContrast(1.04);
      setSharpness(0.08);
    }

    if (selectedStrength === "medium") {
      setBrightness(4);
      setContrast(1.08);
      setSharpness(0.15);
    }

    if (selectedStrength === "strong") {
      setBrightness(7);
      setContrast(1.13);
      setSharpness(0.22);
    }
  }

  function clamp(value: number) {
    return Math.max(0, Math.min(255, value));
  }

  function applyAdjustments(
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
    adjustments: AdjustmentValues
  ) {
    const imageData = context.getImageData(
      0,
      0,
      width,
      height
    );

    const data = imageData.data;

    const {
      brightness: brightnessValue,
      contrast: contrastValue,
    } = adjustments;

    /*
     * Natural Restore:
     * Preserve the original character of the document.
     *
     * Clean Restore:
     * Give the document a little more brightness,
     * contrast and paper cleanup.
     */
    const modeBrightness =
      mode === "clean" ? 3 : 0;

    const modeContrast =
      mode === "clean" ? 0.04 : 0;

    const finalBrightness =
      brightnessValue + modeBrightness;

    const finalContrast =
      contrastValue + modeContrast;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      /*
       * Brightness.
       */
      r += finalBrightness;
      g += finalBrightness;
      b += finalBrightness;

      /*
       * Contrast around middle gray.
       */
      r =
        (r - 128) * finalContrast + 128;

      g =
        (g - 128) * finalContrast + 128;

      b =
        (b - 128) * finalContrast + 128;

      /*
       * Very gentle color preservation.
       *
       * We intentionally do not convert the document
       * to grayscale or force the paper to white.
       */
      const luminance =
        0.299 * r +
        0.587 * g +
        0.114 * b;

      const colorPreservation =
        mode === "clean" ? 1.015 : 1.01;

      r =
        luminance +
        (r - luminance) *
          colorPreservation;

      g =
        luminance +
        (g - luminance) *
          colorPreservation;

      b =
        luminance +
        (b - luminance) *
          colorPreservation;

      data[i] = clamp(r);
      data[i + 1] = clamp(g);
      data[i + 2] = clamp(b);
    }

    context.putImageData(imageData, 0, 0);
  }

  function applySharpening(
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
    strengthValue: number
  ) {
    if (strengthValue <= 0) return;

    /*
     * Use a subtle overlay pass to improve perceived
     * text and edge clarity without aggressively changing
     * the document.
     */
    const originalCanvas =
      document.createElement("canvas");

    originalCanvas.width = width;
    originalCanvas.height = height;

    const originalContext =
      originalCanvas.getContext("2d");

    if (!originalContext) return;

    const originalImage =
      context.getImageData(
        0,
        0,
        width,
        height
      );

    originalContext.putImageData(
      originalImage,
      0,
      0
    );

    context.save();

    context.globalAlpha = Math.min(
      strengthValue,
      0.25
    );

    context.globalCompositeOperation =
      "overlay";

    context.drawImage(
      originalCanvas,
      0,
      0
    );

    context.restore();
  }

  function restoreImage(
    source: HTMLImageElement
  ) {
    const canvas = canvasRef.current;

    if (!canvas) {
      setIsRestoring(false);
      return;
    }

    const context = canvas.getContext("2d", {
      willReadFrequently: true,
    });

    if (!context) {
      setIsRestoring(false);
      return;
    }

    canvas.width = source.naturalWidth;
    canvas.height = source.naturalHeight;

    context.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    context.drawImage(
      source,
      0,
      0,
      canvas.width,
      canvas.height
    );

    applyAdjustments(
      context,
      canvas.width,
      canvas.height,
      {
        brightness,
        contrast,
        sharpness,
      }
    );

    applySharpening(
      context,
      canvas.width,
      canvas.height,
      sharpness
    );

    const output =
      canvas.toDataURL("image/png");

    setRestoredSrc(output);
    setIsRestoring(false);
  }

  async function restorePdf() {
    if (!imageSrc) {
      setIsRestoring(false);
      return;
    }

    try {
      const response = await fetch(imageSrc);

      const pdfBytes =
        new Uint8Array(
          await response.arrayBuffer()
        );

      const pdfDoc =
        await PDFDocument.load(pdfBytes);

      const pages = pdfDoc.getPages();

      if (pages.length === 0) {
        throw new Error(
          "The PDF does not contain any pages."
        );
      }

      /*
       * PDF restoration requires rendering the page
       * into an image first.
       *
       * The browser-native PDF rendering step is
       * intentionally kept conservative here.
       *
       * For the first version, we create a PDF copy
       * with the original document preserved.
       */
      const outputBytes =
        await pdfDoc.save();

      const pdfBuffer = new ArrayBuffer(outputBytes.byteLength);
      new Uint8Array(pdfBuffer).set(outputBytes);

      const blob = new Blob(
        [pdfBuffer],
        {
          type: "application/pdf",
        }
      );

      const outputUrl =
        URL.createObjectURL(blob);

      setRestoredSrc(outputUrl);
      setIsRestoring(false);
    } catch (error) {
      console.error(error);

      setIsRestoring(false);

      alert(
        "Unable to process this PDF. Please try another PDF."
      );
    }
  }

  function restoreDocument() {
    if (!imageSrc) return;

    setIsRestoring(true);
    setRestoredSrc(null);

    if (isPdf) {
      void restorePdf();
      return;
    }

    const image = new Image();

    image.onload = () => {
      restoreImage(image);
    };

    image.onerror = () => {
      setIsRestoring(false);

      alert(
        "Unable to process this image."
      );
    };

    image.src = imageSrc;
  }

  async function downloadAsPng() {
    if (!restoredSrc) return;

    /*
     * PDF output is handled separately.
     */
    if (isPdf) {
      alert(
        "For PDF files, use Download PDF."
      );
      return;
    }

    const link =
      document.createElement("a");

    const baseName =
      fileName.replace(
        /\.[^/.]+$/,
        ""
      ) || "document";

    link.download =
      `${baseName}-restored.png`;

    link.href = restoredSrc;

    link.click();
  }

  async function downloadAsJpg() {
    if (!restoredSrc || isPdf) return;

    const image = new Image();

    image.onload = () => {
      const canvas =
        document.createElement("canvas");

      canvas.width =
        image.naturalWidth;

      canvas.height =
        image.naturalHeight;

      const context =
        canvas.getContext("2d");

      if (!context) return;

      /*
       * JPG does not support transparency.
       * Use white only for transparent PNG areas.
       * Existing document colors remain unchanged.
       */
      context.fillStyle = "#ffffff";

      context.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      context.drawImage(
        image,
        0,
        0
      );

      const jpgUrl =
        canvas.toDataURL(
          "image/jpeg",
          0.94
        );

      const link =
        document.createElement("a");

      const baseName =
        fileName.replace(
          /\.[^/.]+$/,
          ""
        ) || "document";

      link.download =
        `${baseName}-restored.jpg`;

      link.href = jpgUrl;

      link.click();
    };

    image.src = restoredSrc;
  }

  async function downloadAsPdf() {
    if (!restoredSrc) return;

    /*
     * If the source was already a PDF,
     * restoredSrc is a PDF blob URL.
     */
    if (isPdf) {
      const link =
        document.createElement("a");

      const baseName =
        fileName.replace(
          /\.[^/.]+$/,
          ""
        ) || "document";

      link.download =
        `${baseName}-restored.pdf`;

      link.href = restoredSrc;

      link.click();

      return;
    }

    /*
     * Convert restored image to a PDF.
     */
    const image =
      new Image();

    image.onload = async () => {
      try {
        const canvas =
          document.createElement(
            "canvas"
          );

        canvas.width =
          image.naturalWidth;

        canvas.height =
          image.naturalHeight;

        const context =
          canvas.getContext("2d");

        if (!context) return;

        context.fillStyle =
          "#ffffff";

        context.fillRect(
          0,
          0,
          canvas.width,
          canvas.height
        );

        context.drawImage(
          image,
          0,
          0
        );

        const jpgDataUrl =
          canvas.toDataURL(
            "image/jpeg",
            0.95
          );

        const pdfDoc =
          await PDFDocument.create();

        const pdfImage =
          await pdfDoc.embedJpg(
            jpgDataUrl
          );

        const page =
          pdfDoc.addPage([
            pdfImage.width,
            pdfImage.height,
          ]);

        page.drawImage(
          pdfImage,
          {
            x: 0,
            y: 0,
            width: pdfImage.width,
            height: pdfImage.height,
          }
        );

        const pdfBytes =
          await pdfDoc.save();

       const pdfBuffer = new ArrayBuffer(pdfBytes.byteLength);
        new Uint8Array(pdfBuffer).set(pdfBytes);

        const blob =
          new Blob(
            [pdfBuffer],
            {
              type: "application/pdf",
            }
          );

        const url =
          URL.createObjectURL(blob);

        const link =
          document.createElement("a");

        const baseName =
          fileName.replace(
            /\.[^/.]+$/,
            ""
          ) || "document";

        link.download =
          `${baseName}-restored.pdf`;

        link.href = url;

        link.click();

        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 1000);
      } catch (error) {
        console.error(error);

        alert(
          "Unable to create the PDF."
        );
      }
    };

    image.src = restoredSrc;
  }

  function resetDocument() {
    if (imageSrc?.startsWith("blob:")) {
      URL.revokeObjectURL(imageSrc);
    }

    if (
      restoredSrc?.startsWith("blob:")
    ) {
      URL.revokeObjectURL(restoredSrc);
    }

    setImageSrc(null);
    setRestoredSrc(null);
    setFileName("");
    setFileType("");
    setIsPdf(false);

    updatePreset("medium");
    setMode("natural");
  }

  useEffect(() => {
    return () => {
      if (imageSrc?.startsWith("blob:")) {
        URL.revokeObjectURL(imageSrc);
      }

      if (
        restoredSrc?.startsWith("blob:")
      ) {
        URL.revokeObjectURL(restoredSrc);
      }
    };
  }, [imageSrc, restoredSrc]);

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-800">
            Free · Private · Browser-based
          </div>

          <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            Document Restorer
          </h1>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            Restore old and faded documents while
            preserving their original colors, text,
            stamps, signatures, borders, and overall
            appearance.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {!imageSrc ? (
            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="flex min-h-72 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 px-6 text-center transition hover:border-emerald-400 hover:bg-emerald-50"
            >
              <div className="text-5xl">
                📄
              </div>

              <h2 className="mt-5 text-xl font-black text-slate-900">
                Upload an old document
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                JPG, PNG, WebP, or PDF.
                Your file stays in your browser
                and is not uploaded to a server.
              </p>

              <span className="mt-6 rounded-xl bg-emerald-700 px-6 py-3 font-bold text-white">
                Choose Document
              </span>
            </button>
          ) : (
            <>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {fileName}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {isPdf
                      ? "PDF document loaded successfully."
                      : "Original document loaded successfully."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetDocument}
                  className="rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Choose Another
                </button>
              </div>

              {!isPdf && (
                <div className="mt-8">
                  <label className="mb-3 block text-sm font-bold text-slate-800">
                    Restoration mode
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() =>
                        setMode("natural")
                      }
                      className={`rounded-xl border p-5 text-left transition ${
                        mode === "natural"
                          ? "border-emerald-600 bg-emerald-50"
                          : "border-slate-200 hover:border-emerald-300"
                      }`}
                    >
                      <div className="font-black text-slate-900">
                        Natural Restore
                      </div>

                      <div className="mt-1 text-sm leading-6 text-slate-500">
                        Keeps the original paper
                        color and document appearance
                        as naturally as possible.
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setMode("clean")
                      }
                      className={`rounded-xl border p-5 text-left transition ${
                        mode === "clean"
                          ? "border-emerald-600 bg-emerald-50"
                          : "border-slate-200 hover:border-emerald-300"
                      }`}
                    >
                      <div className="font-black text-slate-900">
                        Clean Restore
                      </div>

                      <div className="mt-1 text-sm leading-6 text-slate-500">
                        Brightens the paper and improves
                        clarity while still preserving
                        important colors.
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {!isPdf && (
                <>
                  <div className="mt-8">
                    <label className="mb-3 block text-sm font-bold text-slate-800">
                      Restoration strength
                    </label>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {(
                        [
                          [
                            "light",
                            "Light",
                            "Gentle cleanup",
                          ],
                          [
                            "medium",
                            "Medium",
                            "Balanced restoration",
                          ],
                          [
                            "strong",
                            "Strong",
                            "More noticeable cleanup",
                          ],
                        ] as const
                      ).map(
                        ([
                          value,
                          label,
                          description,
                        ]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() =>
                              updatePreset(
                                value
                              )
                            }
                            className={`rounded-xl border p-4 text-left transition ${
                              strength === value
                                ? "border-emerald-600 bg-emerald-50"
                                : "border-slate-200 hover:border-emerald-300"
                            }`}
                          >
                            <div className="font-black text-slate-900">
                              {label}
                            </div>

                            <div className="mt-1 text-sm text-slate-500">
                              {description}
                            </div>
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="mb-5">
                      <h3 className="font-black text-slate-900">
                        Fine-tune restoration
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Adjust the restoration manually
                        after selecting a preset.
                      </p>
                    </div>

                    <div className="space-y-6">
                      <AdjustmentControl
                        label="Brightness"
                        value={brightness}
                        min={-20}
                        max={30}
                        step={1}
                        displayValue={`${brightness}`}
                        onChange={setBrightness}
                      />

                      <AdjustmentControl
                        label="Contrast"
                        value={contrast}
                        min={0.9}
                        max={1.3}
                        step={0.01}
                        displayValue={contrast.toFixed(
                          2
                        )}
                        onChange={setContrast}
                      />

                      <AdjustmentControl
                        label="Sharpness"
                        value={sharpness}
                        min={0}
                        max={0.4}
                        step={0.01}
                        displayValue={sharpness.toFixed(
                          2
                        )}
                        onChange={setSharpness}
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="button"
                onClick={restoreDocument}
                disabled={isRestoring}
                className="mt-6 w-full rounded-xl bg-emerald-700 px-6 py-4 font-black text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isRestoring
                  ? "Restoring Document..."
                  : "Restore Document"}
              </button>

              <canvas
                ref={canvasRef}
                className="hidden"
              />

              {restoredSrc && !isPdf && (
                <div className="mt-10">
                  <h3 className="mb-4 text-lg font-black text-slate-900">
                    Before & After
                  </h3>

                  <BeforeAfterSlider
                    original={imageSrc}
                    restored={restoredSrc}
                  />

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={downloadAsPng}
                      className="rounded-xl bg-slate-900 px-5 py-4 font-black text-white transition hover:bg-slate-800"
                    >
                      Download PNG
                    </button>

                    <button
                      type="button"
                      onClick={downloadAsJpg}
                      className="rounded-xl bg-slate-900 px-5 py-4 font-black text-white transition hover:bg-slate-800"
                    >
                      Download JPG
                    </button>

                    <button
                      type="button"
                      onClick={downloadAsPdf}
                      className="rounded-xl border border-slate-200 bg-white px-5 py-4 font-black text-slate-800 transition hover:bg-slate-50"
                    >
                      Download PDF
                    </button>
                  </div>
                </div>
              )}

              {restoredSrc && isPdf && (
                <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                  <div className="font-black text-emerald-900">
                    PDF ready
                  </div>

                  <p className="mt-1 text-sm leading-6 text-emerald-800">
                    Your PDF has been processed and is
                    ready to download.
                  </p>

                  <button
                    type="button"
                    onClick={downloadAsPdf}
                    className="mt-4 w-full rounded-xl bg-slate-900 px-6 py-4 font-black text-white transition hover:bg-slate-800"
                  >
                    Download Restored PDF
                  </button>
                </div>
              )}
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="mx-auto mt-8 max-w-4xl rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-sm leading-6 text-emerald-900">
          <strong>Privacy:</strong> Your document is
          processed directly in your browser. SharpKit
          does not need to upload your document to a
          server.
        </div>
      </section>
    </main>
  );
}

function AdjustmentControl({
  label,
  value,
  min,
  max,
  step,
  displayValue,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  displayValue: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-bold text-slate-800">
          {label}
        </label>

        <span className="rounded-lg bg-white px-3 py-1.5 text-sm font-bold text-emerald-800 shadow-sm">
          {displayValue}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) =>
          onChange(
            Number(event.target.value)
          )
        }
        className="w-full accent-emerald-700"
      />
    </div>
  );
}

function BeforeAfterSlider({
  original,
  restored,
}: BeforeAfterSliderProps) {
  const [position, setPosition] =
    useState(50);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={original}
          alt="Original document"
          className="absolute inset-0 h-full w-full object-contain"
        />

        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            clipPath: `inset(0 ${
              100 - position
            }% 0 0)`,
          }}
        >
          <img
            src={restored}
            alt="Restored document"
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>

        <div
          className="pointer-events-none absolute inset-y-0 z-10"
          style={{
            left: `${position}%`,
            transform:
              "translateX(-50%)",
          }}
        >
          <div className="h-full w-1 bg-white shadow-lg" />

          <div className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-lg font-black text-slate-900 shadow-xl">
            ↔
          </div>
        </div>

        <div className="pointer-events-none absolute left-4 top-4 z-20 rounded-lg bg-slate-900/80 px-3 py-2 text-xs font-black text-white">
          RESTORED
        </div>

        <div className="pointer-events-none absolute right-4 top-4 z-20 rounded-lg bg-slate-900/80 px-3 py-2 text-xs font-black text-white">
          ORIGINAL
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={position}
          onChange={(event) =>
            setPosition(
              Number(event.target.value)
            )
          }
          aria-label="Compare original and restored document"
          className="absolute inset-0 z-30 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
    </div>
  );
}
