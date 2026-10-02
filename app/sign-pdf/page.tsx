"use client";

import {
  ChangeEvent,
  PointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { PDFDocument, PDFPage } from "pdf-lib";
import SignaturePad from "@/components/SignaturePad";

type PageInfo = {
  width: number;
  height: number;
};

type SignaturePosition = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const SIGNATURE_ASPECT_RATIO = 1200 / 500;

export default function SignPdfPage() {
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [pdfRendered, setPdfRendered] = useState(false);

  const [signatureImage, setSignatureImage] = useState<string | null>(
    null
  );

  const [signatureVisible, setSignatureVisible] = useState(false);

  const [signaturePosition, setSignaturePosition] =
    useState<SignaturePosition>({
      x: 80,
      y: 80,
      width: 300,
      height: 125,
    });

  const [isDraggingSignature, setIsDraggingSignature] =
    useState(false);

  const [signaturePadKey, setSignaturePadKey] = useState(0);

  const dragStartRef = useRef({
    pointerX: 0,
    pointerY: 0,
    signatureX: 0,
    signatureY: 0,
  });

  function handleSignatureChange(
    dataUrl: string | null
  ) {
    setSignatureImage(dataUrl);

    if (!dataUrl) {
      setSignatureVisible(false);
    }
  }

  function resetSignature() {
    setSignatureImage(null);
    setSignatureVisible(false);

    setSignaturePosition({
      x: 80,
      y: 80,
      width: 300,
      height: 125,
    });

    setSignaturePadKey((key) => key + 1);
  }

  function useSignature() {
    if (!signatureImage) {
      return;
    }

    setSignaturePosition({
      x: 80,
      y: 80,
      width: 300,
      height: 125,
    });

    setSignatureVisible(true);
  }

  async function handlePdfUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.type !== "application/pdf") {
      alert("Please select a PDF file.");
      return;
    }

    try {
      const bytes = await file.arrayBuffer();

      const pdf = await PDFDocument.load(bytes);

      setPdfFile(file);
      setPdfBytes(bytes.slice(0));
      setPageCount(pdf.getPageCount());
      setCurrentPage(1);
      setPageInfo(null);
      setPdfRendered(false);

      resetSignature();
    } catch {
      alert("Unable to open this PDF file.");
    }
  }

  useEffect(() => {
    if (!pdfBytes) {
      return;
    }

    let cancelled = false;

    async function renderPage() {
  if (!pdfBytes) {
    return;
  }

  try {
        const pdfjsLib =
          await import("pdfjs-dist/legacy/build/pdf.mjs");

        pdfjsLib.GlobalWorkerOptions.workerSrc =
          "/pdf.worker.mjs";

        const pdfData = pdfBytes.slice(0);

        const loadingTask =
          pdfjsLib.getDocument({
            data: pdfData,
          });

        const pdf = await loadingTask.promise;

        if (cancelled) {
          return;
        }

        const page = await pdf.getPage(
          currentPage
        );

        const canvas = pdfCanvasRef.current;

        if (!canvas) {
          return;
        }

        const context = canvas.getContext("2d");

        if (!context) {
          return;
        }

        const viewport = page.getViewport({
          scale: 1.5,
        });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvas,
          canvasContext: context,
          viewport,
        }).promise;

        if (cancelled) {
          return;
        }

        setPageInfo({
          width: viewport.width,
          height: viewport.height,
        });

        setPdfRendered(true);

        await loadingTask.destroy();
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Failed to render PDF page:",
            error
          );

          setPdfRendered(false);
        }
      }
    }

    renderPage();

    return () => {
      cancelled = true;
    };
  }, [pdfBytes, currentPage]);

  function startSignatureDrag(
    event: PointerEvent<HTMLDivElement>
  ) {
    event.preventDefault();

    setIsDraggingSignature(true);

    dragStartRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      signatureX: signaturePosition.x,
      signatureY: signaturePosition.y,
    };

    event.currentTarget.setPointerCapture(
      event.pointerId
    );
  }

  function moveSignature(
    event: PointerEvent<HTMLDivElement>
  ) {
    if (!isDraggingSignature) {
      return;
    }

    const canvas = pdfCanvasRef.current;

    if (!canvas) {
      return;
    }

    const deltaX =
      event.clientX -
      dragStartRef.current.pointerX;

    const deltaY =
      event.clientY -
      dragStartRef.current.pointerY;

    let newX =
      dragStartRef.current.signatureX +
      deltaX;

    let newY =
      dragStartRef.current.signatureY +
      deltaY;

    const maxX =
      canvas.clientWidth -
      signaturePosition.width;

    const maxY =
      canvas.clientHeight -
      signaturePosition.height;

    newX = Math.max(
      0,
      Math.min(newX, Math.max(0, maxX))
    );

    newY = Math.max(
      0,
      Math.min(newY, Math.max(0, maxY))
    );

    setSignaturePosition((current) => ({
      ...current,
      x: newX,
      y: newY,
    }));
  }

  function finishSignatureDrag(
    event?: PointerEvent<HTMLDivElement>
  ) {
    setIsDraggingSignature(false);

    if (event) {
      try {
        event.currentTarget.releasePointerCapture(
          event.pointerId
        );
      } catch {
        // Pointer capture may already be released.
      }
    }
  }

  function resizeSignature(
    event: PointerEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    event.stopPropagation();

    const canvas = pdfCanvasRef.current;

    if (!canvas) {
      return;
    }

    const rect =
      canvas.getBoundingClientRect();

    const pointerX =
      event.clientX - rect.left;

    const pointerY =
      event.clientY - rect.top;

    let newWidth =
      pointerX - signaturePosition.x;

    let newHeight =
      newWidth / SIGNATURE_ASPECT_RATIO;

    const minWidth = 120;

    if (newWidth < minWidth) {
      newWidth = minWidth;
      newHeight =
        newWidth / SIGNATURE_ASPECT_RATIO;
    }

    const maxWidth =
      canvas.clientWidth -
      signaturePosition.x;

    if (newWidth > maxWidth) {
      newWidth = maxWidth;
      newHeight =
        newWidth / SIGNATURE_ASPECT_RATIO;
    }

    const maxHeight =
      canvas.clientHeight -
      signaturePosition.y;

    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth =
        newHeight *
        SIGNATURE_ASPECT_RATIO;
    }

    setSignaturePosition((current) => ({
      ...current,
      width: newWidth,
      height: newHeight,
    }));
  }

  async function drawSignatureOnPdf(
    pdfDoc: PDFDocument,
    pdfPage: PDFPage
  ) {
    if (!signatureImage) {
      return;
    }

    const canvas = pdfCanvasRef.current;

    if (!canvas) {
      return;
    }

    const signatureBytes =
      await fetch(signatureImage).then(
        (response) => response.arrayBuffer()
      );

    const signature =
      await pdfDoc.embedPng(signatureBytes);

    const displayedCanvasWidth =
      canvas.clientWidth;

    const displayedCanvasHeight =
      canvas.clientHeight;

    if (
      displayedCanvasWidth === 0 ||
      displayedCanvasHeight === 0
    ) {
      return;
    }

    const scaleX =
      pdfPage.getWidth() /
      displayedCanvasWidth;

    const scaleY =
      pdfPage.getHeight() /
      displayedCanvasHeight;

    const pdfX =
      signaturePosition.x * scaleX;

    const pdfWidth =
      signaturePosition.width * scaleX;

    const pdfHeight =
      signaturePosition.height * scaleY;

    const pdfY =
      pdfPage.getHeight() -
      (signaturePosition.y +
        signaturePosition.height) *
        scaleY;

    pdfPage.drawImage(signature, {
      x: pdfX,
      y: pdfY,
      width: pdfWidth,
      height: pdfHeight,
    });
  }

  async function downloadSignedPdf() {
    if (
      !pdfBytes ||
      !pdfRendered ||
      !signatureVisible ||
      !signatureImage
    ) {
      return;
    }

    try {
      const pdfDoc =
        await PDFDocument.load(pdfBytes);

      const pdfPage =
        pdfDoc.getPage(currentPage - 1);

      await drawSignatureOnPdf(
        pdfDoc,
        pdfPage
      );

      const signedPdfBytes =
        await pdfDoc.save();

      const blob = new Blob(
        [new Uint8Array(signedPdfBytes)],
        {
          type: "application/pdf",
        }
      );

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;
      link.download =
        "sharpkit-signed-document.pdf";

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        "Failed to create signed PDF:",
        error
      );

      alert(
        "Unable to create the signed PDF."
      );
    }
  }

  function resetDocument() {
    setPdfFile(null);
    setPdfBytes(null);
    setPageCount(0);
    setCurrentPage(1);
    setPageInfo(null);
    setPdfRendered(false);

    resetSignature();

    if (pdfInputRef.current) {
      pdfInputRef.current.value = "";
    }
  }

  function signAnotherDocument() {
    resetDocument();

    setTimeout(() => {
      pdfInputRef.current?.click();
    }, 0);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <input
          ref={pdfInputRef}
          type="file"
          accept="application/pdf"
          onChange={handlePdfUpload}
          className="hidden"
        />

        {!pdfFile ? (
          <section className="mx-auto max-w-3xl">
            <div className="rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-sm sm:p-12">
              <div className="mb-5 text-5xl">
                ✍️
              </div>

              <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">
                Sign PDF
              </h1>

              <p className="mx-auto mt-4 max-w-xl text-slate-600">
                Upload a PDF, draw your signature,
                place it where you want, and
                download the signed document.
              </p>

              <button
                type="button"
                onClick={() =>
                  pdfInputRef.current?.click()
                }
                className="mt-8 rounded-xl bg-emerald-700 px-7 py-4 font-bold text-white transition hover:bg-emerald-800"
              >
                Upload PDF
              </button>

              <p className="mt-5 text-sm text-slate-500">
                Free · Private · Browser-based
              </p>
            </div>
          </section>
        ) : (
          <section>
            <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl font-black text-slate-900">
                  Sign PDF
                </h1>

                <p className="mt-1 break-all text-sm text-slate-500">
                  {pdfFile.name}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Page {currentPage} of{" "}
                  {pageCount}
                </p>
              </div>

              <button
                type="button"
                onClick={signAnotherDocument}
                className="rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Sign Another PDF
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
              <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-black text-slate-900">
                  Draw your signature
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Draw your signature below.
                  You can change the pen thickness
                  and color.
                </p>

                <div className="mt-4">
                  <SignaturePad
                    key={signaturePadKey}
                    background="transparent"
                    onSignatureChange={
                      handleSignatureChange
                    }
                  />
                </div>

                <button
                  type="button"
                  onClick={useSignature}
                  disabled={!signatureImage}
                  className="mt-6 w-full rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Use Signature
                </button>
              </aside>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      PDF Preview
                    </h2>

                    <p className="text-sm text-slate-500">
                      Drag your signature to
                      position it.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={downloadSignedPdf}
                    disabled={
                      !pdfRendered ||
                      !signatureVisible ||
                      !signatureImage
                    }
                    className="rounded-xl bg-slate-900 px-5 py-3 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Download Signed PDF
                  </button>
                </div>
<div className="overflow-auto rounded-xl border border-slate-200 bg-slate-100 p-4">
  <div className="relative mx-auto w-fit">
    <canvas
      ref={pdfCanvasRef}
      className="block max-w-full shadow-lg"
    />

    {signatureVisible &&
      signatureImage &&
      pageInfo && (
        <div
          className="absolute touch-none select-none"
          style={{
            left: signaturePosition.x,
            top: signaturePosition.y,
            width: signaturePosition.width,
            height: signaturePosition.height,
            cursor: isDraggingSignature
              ? "grabbing"
              : "grab",
          }}
          onPointerDown={startSignatureDrag}
          onPointerMove={moveSignature}
          onPointerUp={finishSignatureDrag}
          onPointerCancel={finishSignatureDrag}
        >
          <img
            src={signatureImage}
            alt="Your signature"
            draggable={false}
            className="block h-full w-full object-contain"
          />

          <div className="pointer-events-none absolute inset-0 rounded border-2 border-emerald-500" />

          <div
            className="absolute -bottom-2 -right-2 h-5 w-5 cursor-se-resize rounded-full border-2 border-white bg-emerald-600 shadow"
            onPointerDown={resizeSignature}
          />
        </div>
      )}
  </div>
</div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage(
                        (page) =>
                          Math.max(1, page - 1)
                      )
                    }
                    disabled={currentPage === 1}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage(
                        (page) =>
                          Math.min(
                            pageCount,
                            page + 1
                          )
                      )
                    }
                    disabled={
                      currentPage === pageCount
                    }
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </section>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}