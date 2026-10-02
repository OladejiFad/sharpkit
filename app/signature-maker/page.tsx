"use client";

import Link from "next/link";
import {
  ChangeEvent,
  PointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";

export default function SignatureMakerPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });

  const [penSize, setPenSize] = useState(3);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureColor, setSignatureColor] = useState("#111827");

  function fillWhiteBackground() {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    context.fillStyle = "#ffffff";
    context.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );
  }

  useEffect(() => {
    fillWhiteBackground();
  }, []);

  function getCanvasPoint(
    event: PointerEvent<HTMLCanvasElement>
  ) {
    const canvas = canvasRef.current;

    if (!canvas) {
      return { x: 0, y: 0 };
    }

    const rect = canvas.getBoundingClientRect();

    return {
      x:
        ((event.clientX - rect.left) / rect.width) *
        canvas.width,
      y:
        ((event.clientY - rect.top) / rect.height) *
        canvas.height,
    };
  }

  function startDrawing(
    event: PointerEvent<HTMLCanvasElement>
  ) {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    canvas.setPointerCapture(event.pointerId);

    const point = getCanvasPoint(event);

    drawingRef.current = true;
    lastPointRef.current = point;

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    context.beginPath();
    context.arc(
      point.x,
      point.y,
      penSize / 2,
      0,
      Math.PI * 2
    );
    context.fillStyle = signatureColor;
    context.fill();

    setHasSignature(true);
  }

  function draw(
    event: PointerEvent<HTMLCanvasElement>
  ) {
    if (!drawingRef.current) {
      return;
    }

    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const point = getCanvasPoint(event);
    const lastPoint = lastPointRef.current;

    context.beginPath();
    context.moveTo(lastPoint.x, lastPoint.y);
    context.lineTo(point.x, point.y);

    context.strokeStyle = signatureColor;
    context.lineWidth = penSize;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.stroke();

    lastPointRef.current = point;
    setHasSignature(true);
  }

  function stopDrawing(
    event?: PointerEvent<HTMLCanvasElement>
  ) {
    drawingRef.current = false;

    if (event) {
      try {
        canvasRef.current?.releasePointerCapture(
          event.pointerId
        );
      } catch {
        // Pointer capture may already have been released.
      }
    }
  }

  function clearSignature() {
    fillWhiteBackground();
    setHasSignature(false);
  }

  function downloadSignature() {
    const canvas = canvasRef.current;

    if (!canvas || !hasSignature) {
      return;
    }

    const downloadCanvas =
      document.createElement("canvas");

    downloadCanvas.width = canvas.width;
    downloadCanvas.height = canvas.height;

    const context =
      downloadCanvas.getContext("2d");

    if (!context) {
      return;
    }

    // Always use a solid white background.
    context.fillStyle = "#ffffff";
    context.fillRect(
      0,
      0,
      downloadCanvas.width,
      downloadCanvas.height
    );

    context.drawImage(
      canvas,
      0,
      0
    );

    const link = document.createElement("a");

    link.download = "sharpkit-signature.png";
    link.href =
      downloadCanvas.toDataURL("image/png");

    link.click();
  }

  function handleColorChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setSignatureColor(event.target.value);
  }

  return (
    <main className="min-h-screen bg-emerald-50 text-slate-950">
      <header className="border-b border-emerald-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-xl font-black tracking-tight text-emerald-900"
          >
            SHARPKIT
          </Link>

          <Link
            href="/"
            className="font-semibold text-emerald-700 transition hover:text-emerald-900"
          >
            ← All Tools
          </Link>
        </div>
      </header>

      <section className="px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <div className="mb-4 inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-800">
              Free · Private · Browser-based
            </div>

            <h1 className="text-4xl font-black tracking-tight text-emerald-950 sm:text-5xl">
              Signature Maker
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              Draw your signature with your mouse, touch
              screen or trackpad and download it as a PNG
              with a white background.
            </p>
          </div>

          <div className="mt-10 rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Draw your signature
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Use your mouse or finger to sign inside
                  the box.
                </p>
              </div>

              <button
                type="button"
                onClick={clearSignature}
                className="rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Clear
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl border-2 border-dashed border-emerald-200 bg-white">
              <canvas
                ref={canvasRef}
                width={1200}
                height={500}
                onPointerDown={startDrawing}
                onPointerMove={draw}
                onPointerUp={stopDrawing}
                onPointerCancel={stopDrawing}
                onPointerLeave={stopDrawing}
                className="block h-auto w-full touch-none cursor-crosshair bg-white"
              />
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="pen-size"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  Pen thickness
                </label>

                <div className="flex items-center gap-4">
                  <input
                    id="pen-size"
                    type="range"
                    min="1"
                    max="10"
                    value={penSize}
                    onChange={(event) =>
                      setPenSize(
                        Number(event.target.value)
                      )
                    }
                    className="w-full accent-emerald-700"
                  />

                  <span className="min-w-12 rounded-lg bg-emerald-50 px-3 py-2 text-center text-sm font-bold text-emerald-800">
                    {penSize}px
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="signature-color"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  Signature color
                </label>

                <div className="flex items-center gap-3">
                  <input
                    id="signature-color"
                    type="color"
                    value={signatureColor}
                    onChange={handleColorChange}
                    className="h-11 w-16 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
                  />

                  <span className="text-sm text-slate-500">
                    Choose your preferred ink color.
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={downloadSignature}
                disabled={!hasSignature}
                className="flex-1 rounded-xl bg-emerald-700 px-6 py-4 font-black text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Download Signature
              </button>

              <button
                type="button"
                onClick={clearSignature}
                className="rounded-xl border border-slate-200 px-6 py-4 font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Start Again
              </button>
            </div>

            <p className="mt-4 text-center text-sm text-slate-500">
              Your signature is processed directly in your
              browser. Nothing is uploaded to a server.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            <div className="rounded-2xl border border-emerald-100 bg-white p-6">
              <div className="text-lg font-black text-emerald-900">
                Draw
              </div>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Sign naturally with your mouse, trackpad or
                touchscreen.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-white p-6">
              <div className="text-lg font-black text-emerald-900">
                Customize
              </div>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Adjust the pen thickness and signature color.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-white p-6">
              <div className="text-lg font-black text-emerald-900">
                Download
              </div>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Download your signature as a PNG with a
                white background.
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-emerald-100 bg-emerald-950 p-7 text-white">
            <h2 className="text-2xl font-black">
              Useful for applications and documents
            </h2>

            <p className="mt-3 max-w-3xl leading-7 text-emerald-100">
              Create a digital signature for forms,
              applications, letters, school documents and
              other files that require a signature image.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
