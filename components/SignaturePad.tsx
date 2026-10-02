"use client";

import {
  ChangeEvent,
  PointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";

type SignaturePadProps = {
  background?: "white" | "transparent";
  onSignatureChange?: (dataUrl: string | null) => void;
};

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 500;

export default function SignaturePad({
  background = "white",
  onSignatureChange,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });

  const [penSize, setPenSize] = useState(3);
  const [signatureColor, setSignatureColor] =
    useState("#111827");

  function prepareCanvas() {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    if (background === "white") {
      context.fillStyle = "#ffffff";
      context.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
      );
    } else {
      context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );
    }
  }

  useEffect(() => {
    prepareCanvas();
  }, [background]);

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
    event.preventDefault();

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

    onSignatureChange?.(
      canvas.toDataURL("image/png")
    );
  }

  function draw(
    event: PointerEvent<HTMLCanvasElement>
  ) {
    event.preventDefault();

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

    context.moveTo(
      lastPoint.x,
      lastPoint.y
    );

    context.lineTo(
      point.x,
      point.y
    );

    context.strokeStyle = signatureColor;
    context.lineWidth = penSize;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.stroke();

    lastPointRef.current = point;
  }

  function stopDrawing(
    event?: PointerEvent<HTMLCanvasElement>
  ) {
    if (!drawingRef.current) {
      return;
    }

    drawingRef.current = false;

    if (event) {
      try {
        canvasRef.current?.releasePointerCapture(
          event.pointerId
        );
      } catch {
        // Pointer capture may already be released.
      }
    }

    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    onSignatureChange?.(
      canvas.toDataURL("image/png")
    );
  }

  function clearSignature() {
    drawingRef.current = false;

    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    if (background === "white") {
      context.fillStyle = "#ffffff";
      context.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
      );
    } else {
      context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );
    }

    onSignatureChange?.(null);
  }

  function handleColorChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setSignatureColor(event.target.value);
  }

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border-2 border-dashed border-emerald-200 bg-white">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          onPointerLeave={stopDrawing}
          className="block h-auto w-full touch-none cursor-crosshair bg-white"
          style={{
            touchAction: "none",
          }}
        />
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="signature-pen-size"
            className="mb-2 block text-sm font-bold text-slate-800"
          >
            Pen thickness
          </label>

          <div className="flex items-center gap-4">
            <input
              id="signature-pen-size"
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

      <button
        type="button"
        onClick={clearSignature}
        className="mt-6 rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
      >
        Clear
      </button>
    </div>
  );
}
