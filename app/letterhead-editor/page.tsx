"use client";
import {
  ChangeEvent,
  MouseEvent,
  PointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import SignaturePad from "@/components/SignaturePad";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import TextAlign from "@tiptap/extension-text-align";

import html2canvas from "html2canvas";

import {
  PDFDocument,
} from "pdf-lib";

import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "/pdf.worker.mjs";

type TextBox = {
  id: number;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
};

type Signature = {
  id: number;
  page: number;
  image: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type PageSize = {
  width: number;
  height: number;
};

const DEFAULT_PAGE_WIDTH = 794;
const DEFAULT_PAGE_HEIGHT = 1123;

const DEFAULT_SIGNATURE_WIDTH = 300;
const DEFAULT_SIGNATURE_HEIGHT = 160;

const PLACEHOLDER_CONTENT =
  "<p>Type or paste your document here...</p>";

export default function LetterheadEditor() {

  const [isSmallScreen, setIsSmallScreen] = useState(false);

useEffect(() => {
  const checkScreenSize = () => {
    setIsSmallScreen(window.innerWidth < 1024);
  };

  checkScreenSize();

  window.addEventListener("resize", checkScreenSize);

  return () => {
    window.removeEventListener("resize", checkScreenSize);
  };
}, []);
  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const signatureUploadRef =
    useRef<HTMLInputElement>(null);

  const previewRef =
    useRef<HTMLDivElement>(null);



  const dragOffset = useRef({
    x: 0,
    y: 0,
  });

  const signatureDragStartRef =
    useRef({
      pointerX: 0,
      pointerY: 0,
      startX: 0,
      startY: 0,
    });

  const [fileName, setFileName] =
    useState("");

  const [fileType, setFileType] =
    useState("");

  const [sourcePdf, setSourcePdf] =
    useState<Uint8Array | null>(null);

  const [sourceImageData, setSourceImageData] =
    useState<string | null>(null);

  const [backgroundUrl, setBackgroundUrl] =
    useState<string | null>(null);

  const [pageSize, setPageSize] =
    useState<PageSize>({
      width: DEFAULT_PAGE_WIDTH,
      height: DEFAULT_PAGE_HEIGHT,
    });

  const [textBoxes, setTextBoxes] =
    useState<TextBox[]>([]);

  const [selectedId, setSelectedId] =
    useState<number | null>(null);

  const [signatures, setSignatures] =
    useState<Signature[]>([]);

  const [selectedSignatureId, setSelectedSignatureId] =
    useState<number | null>(null);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [dragging, setDragging] =
    useState(false);

  const [draggingSignature, setDraggingSignature] =
    useState(false);

  const [showSignaturePanel, setShowSignaturePanel] =
    useState(false);

  const [isExporting, setIsExporting] =
    useState(false);

const [drawnSignature, setDrawnSignature] =
  useState<string | null>(null);

const [signaturePadKey, setSignaturePadKey] =
  useState(0);

  const [previewWidth, setPreviewWidth] =
      useState(900);

  // --------------------------------------------------
  // Tiptap
  // --------------------------------------------------

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        underline: false,
      }),
      Underline,
      TextStyle,
      FontFamily,
      TextAlign.configure({
        types: ["paragraph", "heading"],
      }),
    ],
    content: PLACEHOLDER_CONTENT,
    immediatelyRender: false,
  });

  // --------------------------------------------------
// Reusable SignaturePad
// --------------------------------------------------

function handleSignatureChange(
  dataUrl: string | null
) {
  setDrawnSignature(dataUrl);
}

function addDrawnSignature() {
  if (!drawnSignature) {
    alert("Please draw your signature first.");
    return;
  }

  const newSignature: Signature = {
    id: Date.now(),
    page: currentPage,
    image: drawnSignature,
    x: 80,
    y: 80,
    width: DEFAULT_SIGNATURE_WIDTH,
    height: DEFAULT_SIGNATURE_HEIGHT,
  };

  setSignatures((previous) => [
    ...previous,
    newSignature,
  ]);

  setSelectedSignatureId(
    newSignature.id
  );

  setShowSignaturePanel(false);

  setDrawnSignature(null);

  setSignaturePadKey(
    (previous) => previous + 1
  );
}


  // --------------------------------------------------
  // Upload signature
  // --------------------------------------------------

  function handleSignatureUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      ![
        "image/png",
        "image/jpeg",
        "image/webp",
      ].includes(file.type)
    ) {
      alert(
        "Please upload a PNG, JPG or WebP signature."
      );

      event.target.value = "";

      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      if (
        typeof reader.result !==
        "string"
      ) {
        return;
      }

    const newSignature: Signature = {
      id: Date.now(),
      page: currentPage,
      image: reader.result,
      x: 80,
      y: 80,
      width: DEFAULT_SIGNATURE_WIDTH,
      height: DEFAULT_SIGNATURE_HEIGHT,
    };

      setSignatures(
        (previous) => [
          ...previous,
          newSignature,
        ]
      );

      setSelectedSignatureId(
        newSignature.id
      );

      setShowSignaturePanel(
        false
      );
    };

    reader.readAsDataURL(file);

    event.target.value = "";
  }

  // --------------------------------------------------
  // Upload
  // --------------------------------------------------

  const handleUpload = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setFileName(file.name);
    setFileType(file.type);

    if (
      file.type ===
        "application/pdf" ||
      file.name
        .toLowerCase()
        .endsWith(".pdf")
    ) {
      await loadPdf(file);

      return;
    }

    if (
      file.type.startsWith("image/")
    ) {
      await loadImage(file);

      return;
    }

    alert(
      "Please upload a PDF, PNG, JPG, JPEG, or WebP file."
    );

    event.target.value = "";
  };

  // --------------------------------------------------
  // Load image
  // --------------------------------------------------

  const loadImage = async (
    file: File
  ) => {
    const url =
      URL.createObjectURL(file);

    const image =
      new Image();

    image.onload = () => {
      setBackgroundUrl(url);

      setPageSize({
        width: image.width,
        height: image.height,
      });

      setCurrentPage(1);
      setTotalPages(1);

      setSourcePdf(null);

      setSourceImageData(null);

      setTextBoxes([]);

      setSelectedId(null);

      setSignatures([]);

      setSelectedSignatureId(
        null
      );
    };

    image.src = url;

    const reader =
      new FileReader();

    reader.onload = () => {
      if (
        typeof reader.result ===
        "string"
      ) {
        setSourceImageData(
          reader.result
        );
      }
    };

    reader.readAsDataURL(file);
  };

  // --------------------------------------------------
  // Load PDF
  // --------------------------------------------------

  const loadPdf = async (
    file: File
  ) => {
    try {
      const buffer =
        await file.arrayBuffer();

      const bytes =
        new Uint8Array(buffer);

      setSourcePdf(
        new Uint8Array(bytes)
      );

      setSourceImageData(
        null
      );

      const pdf =
        await pdfjsLib.getDocument({
          data: new Uint8Array(
            bytes
          ),
        }).promise;

      setTotalPages(
        pdf.numPages
      );

      setCurrentPage(1);

      await renderPdfPage(
        bytes,
        1
      );

      setTextBoxes([]);

      setSelectedId(null);

      setSignatures([]);

      setSelectedSignatureId(
        null
      );
    } catch (error) {
      console.error(error);

      alert(
        "Unable to open this PDF."
      );
    }
  };

  // --------------------------------------------------
  // Render PDF page
  // --------------------------------------------------

  const renderPdfPage = async (
    bytes: Uint8Array,
    pageNumber: number
  ) => {
    try {
      const pdf =
        await pdfjsLib.getDocument({
          data: new Uint8Array(
            bytes
          ),
        }).promise;

      const page =
        await pdf.getPage(
          pageNumber
        );

      const viewport =
        page.getViewport({
          scale: 1.5,
        });

      const canvas =
        document.createElement(
          "canvas"
        );

      const context =
        canvas.getContext("2d");

      if (!context) {
        return;
      }

      canvas.width =
        viewport.width;

      canvas.height =
        viewport.height;

      await page.render({
        canvas,
        canvasContext: context,
        viewport,
      }).promise;

      const imageUrl =
        canvas.toDataURL(
          "image/png"
        );

      setBackgroundUrl(
        imageUrl
      );

      setPageSize({
        width: viewport.width,
        height: viewport.height,
      });
    } catch (error) {
      console.error(error);
    }
  };

  // --------------------------------------------------
  // Change PDF page
  // --------------------------------------------------

  const changePage = async (
    pageNumber: number
  ) => {
    if (!sourcePdf) {
      return;
    }

    if (
      pageNumber < 1 ||
      pageNumber > totalPages
    ) {
      return;
    }

    await renderPdfPage(
      sourcePdf,
      pageNumber
    );

    setCurrentPage(
      pageNumber
    );

    setSelectedId(null);

    setSelectedSignatureId(
      null
    );
  };

  // --------------------------------------------------
  // Add text box
  // --------------------------------------------------

  const addTextBox = () => {
    if (!backgroundUrl) {
      alert(
        "Upload a letterhead first."
      );

      return;
    }

    const newBox: TextBox = {
      id: Date.now(),
      page: currentPage,
      x: 100,
      y: 250,
      width: pageSize.width - 200,
      height: 350,
      content: PLACEHOLDER_CONTENT,
    };

    setTextBoxes(
      (previous) => [
        ...previous,
        newBox,
      ]
    );

    setSelectedId(
      newBox.id
    );

    setSelectedSignatureId(
      null
    );

    setTimeout(() => {
      editor?.commands.setContent(
        PLACEHOLDER_CONTENT,
        {
          emitUpdate: false,
        }
      );

      editor?.commands.focus();
    }, 50);
  };

  // --------------------------------------------------
  // Delete text box
  // --------------------------------------------------

  const deleteSelected = () => {
    if (
      selectedId === null
    ) {
      return;
    }

    setTextBoxes(
      (previous) =>
        previous.filter(
          (box) =>
            box.id !== selectedId
        )
    );

    setSelectedId(null);
  };

  // --------------------------------------------------
  // Delete signature
  // --------------------------------------------------

  const deleteSelectedSignature =
    () => {
      if (
        selectedSignatureId ===
        null
      ) {
        return;
      }

      setSignatures(
        (previous) =>
          previous.filter(
            (signature) =>
              signature.id !==
              selectedSignatureId
          )
      );

      setSelectedSignatureId(
        null
      );
    };

    const duplicateSelectedSignature = () => {
  if (
    selectedSignatureId === null
  ) {
    return;
  }

  const original =
    signatures.find(
      (signature) =>
        signature.id ===
        selectedSignatureId
    );

  if (!original) {
    return;
  }

  const newSignature: Signature = {
    ...original,

    id: Date.now(),

    x: Math.min(
      original.x + 30,
      pageSize.width -
        original.width
    ),

    y: Math.min(
      original.y + 30,
      pageSize.height -
        original.height
    ),
  };

  setSignatures(
    (previous) => [
      ...previous,
      newSignature,
    ]
  );

  setSelectedSignatureId(
    newSignature.id
  );

  setSelectedId(null);
};

  // --------------------------------------------------
  // Canvas-like coordinates
  // --------------------------------------------------

  const getPreviewCoordinates = (
    event: MouseEvent<HTMLDivElement>
  ) => {
    const container =
      previewRef.current;

    if (!container) {
      return {
        x: 0,
        y: 0,
      };
    }

    const rect =
      container.getBoundingClientRect();

    const scale =
      rect.width /
      pageSize.width;

    return {
      x:
        (event.clientX -
          rect.left) /
        scale,

      y:
        (event.clientY -
          rect.top) /
        scale,
    };
  };

  // --------------------------------------------------
  // Text box dragging
  // --------------------------------------------------

  const startDragging = (
    event: MouseEvent<HTMLDivElement>,
    box: TextBox
  ) => {
    const target =
      event.target as HTMLElement;

    if (
      target.closest(
        ".ProseMirror"
      ) ||
      target.closest("button") ||
      target.closest("select") ||
      target.closest("input")
    ) {
      return;
    }

    event.preventDefault();

    const point =
      getPreviewCoordinates(
        event
      );

    setSelectedId(
      box.id
    );

    setSelectedSignatureId(
      null
    );

    dragOffset.current = {
      x:
        point.x - box.x,
      y:
        point.y - box.y,
    };

    setDragging(true);
  };

  useEffect(() => {
    const handleMove = (
      event: globalThis.MouseEvent
    ) => {
      if (
        !dragging ||
        selectedId === null
      ) {
        return;
      }

      const container =
        previewRef.current;

      if (!container) {
        return;
      }

      const rect =
        container.getBoundingClientRect();

      const scale =
        rect.width /
        pageSize.width;

      const x =
        (event.clientX -
          rect.left) /
          scale -
        dragOffset.current.x;

      const y =
        (event.clientY -
          rect.top) /
          scale -
        dragOffset.current.y;

      setTextBoxes(
        (previous) =>
          previous.map(
            (box) =>
              box.id ===
              selectedId
                ? {
                    ...box,
                    x: Math.max(
                      0,
                      Math.min(
                        x,
                        pageSize.width -
                          box.width
                      )
                    ),
                    y: Math.max(
                      0,
                      Math.min(
                        y,
                        pageSize.height -
                          box.height
                      )
                    ),
                  }
                : box
          )
      );
    };

    const handleUp =
      () => {
        setDragging(false);
      };

    window.addEventListener(
      "mousemove",
      handleMove
    );

    window.addEventListener(
      "mouseup",
      handleUp
    );

    return () => {
      window.removeEventListener(
        "mousemove",
        handleMove
      );

      window.removeEventListener(
        "mouseup",
        handleUp
      );
    };
  }, [
    dragging,
    selectedId,
    pageSize.width,
    pageSize.height,
  ]);

  // --------------------------------------------------
  // Signature dragging
  // --------------------------------------------------

  function startSignatureDrag(
    event: PointerEvent<HTMLDivElement>,
    signature: Signature
  ) {
    event.preventDefault();
    event.stopPropagation();

    setSelectedSignatureId(
      signature.id
    );

    setSelectedId(null);

    setDraggingSignature(true);

    signatureDragStartRef.current = {
      pointerX:
        event.clientX,

      pointerY:
        event.clientY,

      startX:
        signature.x,

      startY:
        signature.y,
    };

    event.currentTarget.setPointerCapture(
      event.pointerId
    );
  }

 function moveSignature(event: PointerEvent<HTMLDivElement>) {
  if (
    !draggingSignature ||
    selectedSignatureId === null
  ) {
    return;
  }

  event.preventDefault();

  const start =
    signatureDragStartRef.current;

  const deltaX =
    event.clientX - start.pointerX;

  const deltaY =
    event.clientY - start.pointerY;

  const previewScale =
    getPreviewScale();

  setSignatures((previous) =>
    previous.map((signature) => {
      if (
        signature.id !==
        selectedSignatureId
      ) {
        return signature;
      }

      const nextX = Math.max(
        0,
        Math.min(
          pageSize.width -
            signature.width,
          start.startX +
            deltaX / previewScale
        )
      );

      const nextY = Math.max(
        0,
        Math.min(
          pageSize.height -
            signature.height,
          start.startY +
            deltaY / previewScale
        )
      );

      return {
        ...signature,
        x: nextX,
        y: nextY,
      };
    })
  );
}

  function finishSignatureDrag(
    event: PointerEvent<HTMLDivElement>
  ) {
    setDraggingSignature(
      false
    );

    try {
      if (
        event.currentTarget.hasPointerCapture(
          event.pointerId
        )
      ) {
        event.currentTarget.releasePointerCapture(
          event.pointerId
        );
      }
    } catch {
      // Pointer capture may already be released.
    }
  }

function getPreviewScale() {
  const container = previewRef.current;
  if (!container) return 1;

  return (
    container.getBoundingClientRect().width /
    pageSize.width
  );
}

  // --------------------------------------------------
  // Resize signature
  // --------------------------------------------------

  function resizeSignature(
    event: PointerEvent<HTMLDivElement>,
    signature: Signature
  ) {
    event.preventDefault();
    event.stopPropagation();

    setSelectedSignatureId(
      signature.id
    );

    setSelectedId(null);

    const startX =
      event.clientX;

    const startY =
      event.clientY;

    const startWidth =
      signature.width;

    const startHeight =
      signature.height;

    const aspectRatio =
      startWidth /
      startHeight;

    const handleMove = (
      moveEvent: globalThis.PointerEvent
    ) => {
      const scale =
        getPreviewScale();

      const deltaX =
        (moveEvent.clientX -
          startX) /
        scale;

      const deltaY =
        (moveEvent.clientY -
          startY) /
        scale;

      let newWidth =
        startWidth +
        deltaX;

      let newHeight =
        newWidth /
        aspectRatio;

      if (
        Math.abs(deltaY) >
        Math.abs(deltaX)
      ) {
        newHeight =
          startHeight +
          deltaY;

        newWidth =
          newHeight *
          aspectRatio;
      }

      newWidth =
        Math.max(
          80,
          newWidth
        );

      newHeight =
        Math.max(
          40,
          newHeight
        );

      setSignatures(
        (previous) =>
          previous.map(
            (item) => {
              if (
                item.id !==
                signature.id
              ) {
                return item;
              }

              newWidth =
                Math.min(
                  newWidth,
                  pageSize.width -
                    item.x
                );

              newHeight =
                Math.min(
                  newHeight,
                  pageSize.height -
                    item.y
                );

              return {
                ...item,
                width:
                  newWidth,
                height:
                  newHeight,
              };
            }
          )
      );
    };

    const handleUp =
      () => {
        window.removeEventListener(
          "pointermove",
          handleMove
        );

        window.removeEventListener(
          "pointerup",
          handleUp
        );
      };

    window.addEventListener(
      "pointermove",
      handleMove
    );

    window.addEventListener(
      "pointerup",
      handleUp
    );
  }

  // --------------------------------------------------
  // Formatting helpers
  // --------------------------------------------------

  const setFontFamily = (
    font: string
  ) => {
    editor
      ?.chain()
      .focus()
      .setFontFamily(font)
      .run();
  };

  const setFontSize = (
    size: string
  ) => {
    editor
      ?.chain()
      .focus()
      .setMark(
        "textStyle",
        {
          fontSize: size,
        }
      )
      .run();
  };

async function renderTextBoxToPng(
  content: string,
  width: number,
  height: number
): Promise<string> {
  const container = document.createElement("div");

  container.style.position = "fixed";
  container.style.left = "-100000px";
  container.style.top = "0";
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.boxSizing = "border-box";
  container.style.padding = "0";
  container.style.margin = "0";
  container.style.overflow = "hidden";
  container.style.background = "transparent";
  container.style.color = "#111827";
  container.style.fontFamily = "Arial, sans-serif";
  container.style.fontSize = "16px";
  container.style.lineHeight = "1.4";
  container.style.wordWrap = "break-word";
  container.style.overflowWrap = "break-word";

  container.innerHTML = `
    <style>
      * {
        box-sizing: border-box;
      }

      p {
          margin: 0 0 8px 0;
        }

      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        margin-top: 0;
      }

      strong {
        font-weight: 700;
      }

      em {
        font-style: italic;
      }

      u {
        text-decoration: underline;
      }

      span {
        max-width: 100%;
      }
    </style>

    ${content}
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      backgroundColor: null,
      width,
      height,
      scale: 2,
      useCORS: true,
      logging: false,
    });

    return canvas.toDataURL("image/png");
  } finally {
    document.body.removeChild(container);
  }
}
  // --------------------------------------------------
  // Export
  // --------------------------------------------------
// --------------------------------------------------
// Export
// --------------------------------------------------

const exportPdf = async () => {
  if (!backgroundUrl) {
    alert("Upload a letterhead first.");
    return;
  }

  setIsExporting(true);

  try {
    let pdfDoc: PDFDocument;

    /*
     * ---------------------------------------------------------
     * CREATE / LOAD PDF
     * ---------------------------------------------------------
     */

    if (sourcePdf) {
      pdfDoc = await PDFDocument.load(
        new Uint8Array(sourcePdf)
      );
    } else {
      pdfDoc = await PDFDocument.create();

      const newPage = pdfDoc.addPage([
        pageSize.width,
        pageSize.height,
      ]);

      if (sourceImageData) {
        const image = new Image();

        await new Promise<void>((resolve, reject) => {
          image.onload = () => resolve();

          image.onerror = () =>
            reject(
              new Error(
                "Unable to load letterhead image."
              )
            );

          image.src = sourceImageData;
        });

        const canvas =
          document.createElement("canvas");

        canvas.width =
          image.naturalWidth ||
          pageSize.width;

        canvas.height =
          image.naturalHeight ||
          pageSize.height;

        const context =
          canvas.getContext("2d");

        if (!context) {
          throw new Error(
            "Unable to create image canvas."
          );
        }

        context.drawImage(
          image,
          0,
          0,
          canvas.width,
          canvas.height
        );

        const backgroundPng =
          canvas.toDataURL("image/png");

        const backgroundImage =
          await pdfDoc.embedPng(
            backgroundPng
          );

        newPage.drawImage(
          backgroundImage,
          {
            x: 0,
            y: 0,
            width: pageSize.width,
            height: pageSize.height,
          }
        );
      }
    }

    /*
     * ---------------------------------------------------------
     * EXPORT DIMENSIONS
     * ---------------------------------------------------------
     *
     * These are the editor's logical coordinates.
     *
     * Nothing here depends on the phone, iPad, laptop,
     * browser width, or preview size.
     */

    const exportWidth =
      pageSize.width;

    const exportHeight =
      pageSize.height;

    const pages =
      pdfDoc.getPages();

    /*
     * ---------------------------------------------------------
     * PROCESS EACH PDF PAGE
     * ---------------------------------------------------------
     */

    for (
      let pageIndex = 0;
      pageIndex < pages.length;
      pageIndex++
    ) {
      const pdfPage =
        pages[pageIndex];

      const pageNumber =
        pageIndex + 1;

      const pdfWidth =
        pdfPage.getWidth();

      const pdfHeight =
        pdfPage.getHeight();

      const scaleX =
        pdfWidth /
        exportWidth;

      const scaleY =
        pdfHeight /
        exportHeight;

      /*
       * -------------------------------------------------------
       * FIND CONTENT FOR THIS PAGE
       * -------------------------------------------------------
       */

     const currentEditorContent =
  selectedId !== null && editor
    ? editor.getHTML()
    : null;

const pageTextBoxes =
  textBoxes
    .map((box) => {
      if (
        box.id === selectedId &&
        currentEditorContent
      ) {
        return {
          ...box,
          content:
            currentEditorContent,
        };
      }

      return box;
    })
    .filter(
      (box) =>
        box.page === pageNumber &&
        box.content &&
        box.content !==
          PLACEHOLDER_CONTENT
    );

      const pageSignatures =
        signatures.filter(
          (signature) =>
            signature.page ===
            pageNumber
        );

      /*
       * If there is no text and no signature,
       * there is nothing to overlay.
       */

      if (
        pageTextBoxes.length === 0 &&
        pageSignatures.length === 0
      ) {
        continue;
      }

      /*
       * -------------------------------------------------------
       * TEXT EXPORT SURFACE
       * -------------------------------------------------------
       *
       * IMPORTANT:
       *
       * The signatures are NOT placed in this HTML surface.
       *
       * This is the key change that prevents mobile/iPad
       * html2canvas layout interactions between text and
       * signature images.
       */

      const textSurface =
        document.createElement("div");

      textSurface.style.position =
        "fixed";

      textSurface.style.left =
        "-100000px";

      textSurface.style.top =
        "0";

      textSurface.style.width =
        `${exportWidth}px`;

      textSurface.style.height =
        `${exportHeight}px`;

      textSurface.style.minWidth =
        `${exportWidth}px`;

      textSurface.style.minHeight =
        `${exportHeight}px`;

      textSurface.style.maxWidth =
        `${exportWidth}px`;

      textSurface.style.maxHeight =
        `${exportHeight}px`;

      textSurface.style.overflow =
        "visible";

      textSurface.style.background =
        "transparent";

      textSurface.style.boxSizing =
        "border-box";

      textSurface.style.fontFamily =
        "Arial, sans-serif";

      textSurface.innerHTML = `
        <style>
          * {
            box-sizing: border-box;
          }

          .sharpkit-export-text {
            position: absolute;
            color: #111827;
            font-family: Arial, sans-serif;
            font-size: 16px;
            line-height: 1.4;
            word-wrap: break-word;
            overflow-wrap: break-word;
            white-space: normal;
            margin: 0;
            padding: 0;
          }

          .sharpkit-export-text p {
            margin: 0 0 8px 0;
          }

          .sharpkit-export-text h1,
          .sharpkit-export-text h2,
          .sharpkit-export-text h3,
          .sharpkit-export-text h4,
          .sharpkit-export-text h5,
          .sharpkit-export-text h6 {
            margin-top: 0;
          }

          .sharpkit-export-text strong {
            font-weight: 700;
          }

          .sharpkit-export-text em {
            font-style: italic;
          }

          .sharpkit-export-text u {
            text-decoration: underline;
          }

          .sharpkit-export-text span {
            max-width: 100%;
          }
        </style>
      `;

      /*
       * Add ONLY text to the html2canvas surface.
       */

      for (
        const box of pageTextBoxes
      ) {
        const text =
          document.createElement("div");

        text.className =
          "sharpkit-export-text";

        text.style.left =
          `${box.x}px`;

        text.style.top =
          `${box.y}px`;

        text.style.width =
          `${box.width}px`;

        text.style.minHeight =
          `${box.height}px`;

        text.style.height =
          "auto";

        text.innerHTML =
          box.content;

        textSurface.appendChild(
          text
        );
      }

      /*
       * -------------------------------------------------------
       * RENDER TEXT
       * -------------------------------------------------------
       */

      let textCanvas:
        HTMLCanvasElement | null =
        null;

      document.body.appendChild(
        textSurface
      );

      try {
        if (pageTextBoxes.length > 0) {
          textCanvas =
            await html2canvas(
              textSurface,
              {
                backgroundColor: null,

                width:
                  exportWidth,

                height:
                  exportHeight,

                windowWidth:
                  exportWidth,

                windowHeight:
                  exportHeight,

                scale: 2,

                useCORS: true,

                logging: false,

                scrollX: 0,

                scrollY: 0,
              }
            );
        }
      } finally {
        document.body.removeChild(
          textSurface
        );
      }

      /*
       * -------------------------------------------------------
       * FINAL EXPORT CANVAS
       * -------------------------------------------------------
       *
       * This canvas becomes the single, final overlay.
       *
       * Text and signatures are now completely independent.
       */

      const finalCanvas =
        document.createElement("canvas");

      /*
       * Use the same scale as html2canvas.
       */

      const renderScale = 2;

      finalCanvas.width =
        Math.round(
          exportWidth *
            renderScale
        );

      finalCanvas.height =
        Math.round(
          exportHeight *
            renderScale
        );

      const finalContext =
        finalCanvas.getContext("2d");

      if (!finalContext) {
        throw new Error(
          "Unable to create final export canvas."
        );
      }

      /*
       * Transparent background.
       */

      finalContext.clearRect(
        0,
        0,
        finalCanvas.width,
        finalCanvas.height
      );

      /*
       * -------------------------------------------------------
       * DRAW TEXT
       * -------------------------------------------------------
       */

      if (textCanvas) {
        finalContext.drawImage(
          textCanvas,
          0,
          0
        );
      }

      /*
       * -------------------------------------------------------
       * DRAW SIGNATURES DIRECTLY
       * -------------------------------------------------------
       *
       * IMPORTANT:
       *
       * We do NOT create HTML <img> elements inside the
       * html2canvas surface.
       *
       * The signature's x/y/width/height are converted directly
       * into canvas coordinates.
       *
       * This makes the signature completely independent of
       * the text box layout.
       */

      for (
        const signature of pageSignatures
      ) {
        const signatureImage =
          new Image();

        signatureImage.decoding =
          "async";

        signatureImage.src =
          signature.image;

        await new Promise<void>(
          (resolve) => {
            if (
              signatureImage.complete &&
              signatureImage.naturalWidth >
                0
            ) {
              resolve();
              return;
            }

            signatureImage.onload =
              () => resolve();

            signatureImage.onerror =
              () => resolve();
          }
        );

        /*
         * Convert logical editor coordinates
         * into final canvas coordinates.
         */

        const x =
          signature.x *
          renderScale;

        const y =
          signature.y *
          renderScale;

        const width =
          signature.width *
          renderScale;

        const height =
          signature.height *
          renderScale;

        /*
         * Draw the signature at EXACTLY the same
         * logical position used by the editor.
         */

        if (
          signatureImage.naturalWidth >
            0
        ) {
          finalContext.drawImage(
            signatureImage,
            x,
            y,
            width,
            height
          );
        }
      }

      /*
       * -------------------------------------------------------
       * CONVERT FINAL CANVAS TO PNG
       * -------------------------------------------------------
       */

      const finalImageData =
        finalCanvas.toDataURL(
          "image/png"
        );

      const overlayImage =
        await pdfDoc.embedPng(
          finalImageData
        );

      /*
       * -------------------------------------------------------
       * PUT FINAL OVERLAY ON PDF
       * -------------------------------------------------------
       *
       * PDF coordinates are handled ONLY here.
       */

      pdfPage.drawImage(
        overlayImage,
        {
          x: 0,

          y: 0,

          width:
            exportWidth *
            scaleX,

          height:
            exportHeight *
            scaleY,
        }
      );
    }

    /*
     * ---------------------------------------------------------
     * DOWNLOAD
     * ---------------------------------------------------------
     */

    const pdfBytes =
      await pdfDoc.save();

    const blob =
      new Blob(
        [
          new Uint8Array(
            pdfBytes
          ).buffer,
        ],
        {
          type:
            "application/pdf",
        }
      );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement(
        "a"
      );

    link.href =
      url;

    link.download =
      fileName
        ? `${fileName.replace(
            /\.[^/.]+$/,
            ""
          )}-completed.pdf`
        : "completed-letterhead.pdf";

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  } catch (error) {
    console.error(
      "PDF export error:",
      error
    );

    alert(
      "There was a problem creating the PDF."
    );
  } finally {
    setIsExporting(false);
  }
};
  // --------------------------------------------------
  // New document
  // --------------------------------------------------

  const newDocument = () => {
    if (backgroundUrl) {
      URL.revokeObjectURL(
        backgroundUrl
      );
    }

    setBackgroundUrl(
      null
    );

    setSourcePdf(null);

    setSourceImageData(null);

    setFileName("");

    setFileType("");

    setTextBoxes([]);

    setSelectedId(null);

    setSignatures([]);

    setSelectedSignatureId(
      null
    );

    setCurrentPage(1);

    setTotalPages(1);

    setShowSignaturePanel(
      false
    );

    setDrawnSignature(null);

setSignaturePadKey(
  (previous) => previous + 1
);

    editor?.commands.setContent(
      PLACEHOLDER_CONTENT,
      {
        emitUpdate: false,
      }
    );

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }
  };

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

return (
  <main className="min-h-screen bg-slate-100 text-slate-900">
    <div className="mx-auto max-w-[1500px] px-4 py-6">

      {isSmallScreen && (
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-5 text-center">
          <div className="mb-2 text-2xl">💻</div>

          <h2 className="text-lg font-bold text-gray-900">
            Laptop or Desktop Recommended
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-600">
            The SharpKit Letterhead Editor is currently optimized for laptop
            and desktop screens. Please use a laptop or desktop computer for
            the best editing experience.
          </p>
        </div>
      )}

      {/* Header */}

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              SharpKit Letterhead Editor
            </h1>

            <p className="mt-1 text-sm text-slate-600">
              Upload your letterhead, write your
              document, format it, add signatures,
              and export PDF.
            </p>
          </div>

          <button
            type="button"
            onClick={newDocument}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold hover:bg-slate-50"
          >
            New Document
          </button>
        </div>

        <div
  className={`grid gap-6 lg:grid-cols-[380px_1fr] ${
    isSmallScreen ? "hidden" : ""
  }`}
>

          {/* SIDEBAR */}

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp,application/pdf"
              onChange={handleUpload}
              className="hidden"
            />

            <input
              ref={signatureUploadRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleSignatureUpload}
              className="hidden"
            />

            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800"
            >
              Upload Letterhead
            </button>

            {fileName && (
              <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                {fileName}
              </div>
            )}

            {/* Pages */}

            {totalPages > 1 && (
              <div className="mt-5 border-t pt-5">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    disabled={
                      currentPage === 1
                    }
                    onClick={() =>
                      changePage(
                        currentPage - 1
                      )
                    }
                    className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40"
                  >
                    ←
                  </button>

                  <span className="text-sm font-medium">
                    Page {currentPage} of{" "}
                    {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={
                      currentPage ===
                      totalPages
                    }
                    onClick={() =>
                      changePage(
                        currentPage + 1
                      )
                    }
                    className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40"
                  >
                    →
                  </button>
                </div>
              </div>
            )}

            {/* Add text */}

            <div className="mt-5 border-t pt-5">
              <button
                type="button"
                disabled={!backgroundUrl}
                onClick={addTextBox}
                className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-40"
              >
                + Add Text
              </button>
            </div>

            {/* Signature */}

            <div className="mt-5 border-t pt-5">
              <button
                type="button"
                disabled={!backgroundUrl}
                onClick={() => {
                  setShowSignaturePanel(
                    (previous) =>
                      !previous
                  );

                  setSelectedId(
                    null
                  );
                }}
                className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-40"
              >
                + Add Signature
              </button>
            </div>

            {/* Signature panel */}

            {showSignaturePanel && (
              <div className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-4">

                <div className="mb-4">
                  <h2 className="font-bold text-slate-950">
                    Add Signature
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Draw a signature or upload an
                    existing signature image.
                  </p>
                </div>

              {/* Draw */}

<div className="rounded-xl border border-slate-200 bg-white p-3">
  <h3 className="text-sm font-bold">
    Draw Signature
  </h3>

  <p className="mt-1 text-xs text-slate-500">
    Draw your signature below.
  </p>

  <div className="mt-3">
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
    disabled={!drawnSignature}
    onClick={addDrawnSignature}
    className="mt-3 w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
  >
    Add Signature
  </button>
</div>

                {/* Upload */}

                <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                  <h3 className="text-sm font-bold">
                    Upload Signature
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    PNG, JPG or WebP
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      signatureUploadRef.current?.click()
                    }
                    className="mt-3 w-full rounded-lg border-2 border-dashed border-indigo-300 px-3 py-4 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
                  >
                    Upload Signature Image
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowSignaturePanel(
                      false
                    )
                  }
                  className="mt-3 w-full text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  Close
                </button>
              </div>
            )}

            {/* Text toolbar */}

            {selectedId !== null &&
              editor && (
                <div className="mt-5 border-t pt-5">
                  <h2 className="mb-3 font-semibold">
                    Text Formatting
                  </h2>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        editor
                          .chain()
                          .focus()
                          .toggleBold()
                          .run()
                      }
                      className={`rounded-lg border px-3 py-2 font-bold ${
                        editor.isActive(
                          "bold"
                        )
                          ? "bg-slate-900 text-white"
                          : "bg-white"
                      }`}
                    >
                      B
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        editor
                          .chain()
                          .focus()
                          .toggleItalic()
                          .run()
                      }
                      className={`rounded-lg border px-3 py-2 italic ${
                        editor.isActive(
                          "italic"
                        )
                          ? "bg-slate-900 text-white"
                          : "bg-white"
                      }`}
                    >
                      I
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        editor
                          .chain()
                          .focus()
                          .toggleUnderline()
                          .run()
                      }
                      className={`rounded-lg border px-3 py-2 underline ${
                        editor.isActive(
                          "underline"
                        )
                          ? "bg-slate-900 text-white"
                          : "bg-white"
                      }`}
                    >
                      U
                    </button>
                  </div>

                  <select
                    onChange={(
                      event
                    ) =>
                      setFontFamily(
                        event.target.value
                      )
                    }
                    className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    defaultValue="Arial"
                  >
                    <option value="Arial">
                      Arial
                    </option>

                    <option value="Georgia">
                      Georgia
                    </option>

                    <option value="Times New Roman">
                      Times New Roman
                    </option>

                    <option value="Courier New">
                      Courier New
                    </option>

                    <option value="Verdana">
                      Verdana
                    </option>

                    <option value="Trebuchet MS">
                      Trebuchet MS
                    </option>
                  </select>

                  <select
                    onChange={(
                      event
                    ) =>
                      setFontSize(
                        event.target.value
                      )
                    }
                    className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    defaultValue="16px"
                  >
                    <option value="12px">
                      12px
                    </option>

                    <option value="14px">
                      14px
                    </option>

                    <option value="16px">
                      16px
                    </option>

                    <option value="18px">
                      18px
                    </option>

                    <option value="20px">
                      20px
                    </option>

                    <option value="24px">
                      24px
                    </option>

                    <option value="28px">
                      28px
                    </option>

                    <option value="32px">
                      32px
                    </option>
                  </select>

                  <div className="mt-3 grid grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        editor
                          .chain()
                          .focus()
                          .setTextAlign(
                            "left"
                          )
                          .run()
                      }
                      className="rounded-lg border px-2 py-2 text-xs"
                    >
                      Left
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        editor
                          .chain()
                          .focus()
                          .setTextAlign(
                            "center"
                          )
                          .run()
                      }
                      className="rounded-lg border px-2 py-2 text-xs"
                    >
                      Center
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        editor
                          .chain()
                          .focus()
                          .setTextAlign(
                            "right"
                          )
                          .run()
                      }
                      className="rounded-lg border px-2 py-2 text-xs"
                    >
                      Right
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        editor
                          .chain()
                          .focus()
                          .setTextAlign(
                            "justify"
                          )
                          .run()
                      }
                      className="rounded-lg border px-2 py-2 text-xs"
                    >
                      Justify
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={
                      deleteSelected
                    }
                    className="mt-4 w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
                  >
                    Delete Text Box
                  </button>
                </div>
              )}

            {/* Signature controls */}

            {selectedSignatureId !==
              null && (
              <div className="mt-5 border-t pt-5">
                <h2 className="font-semibold">
                  Signature
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Drag the signature to move it.
                  Use the corner handle to resize it.
                </p>

               <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={
                      duplicateSelectedSignature
                    }
                    className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
                  >
                    Duplicate
                  </button>

                  <button
                    type="button"
                    onClick={
                      deleteSelectedSignature
                    }
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}

            {/* Export */}

            <button
              type="button"
              disabled={
                !backgroundUrl ||
                isExporting
              }
              onClick={
                exportPdf
              }
              className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-40"
            >
              {isExporting
                ? "Creating PDF..."
                : "Download PDF"}
            </button>
          </aside>

          {/* PREVIEW */}

          <section className="rounded-2xl border border-slate-200 bg-slate-300 p-4 shadow-sm">

            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold">
                  Document Preview
                </h2>

                <p className="text-xs text-slate-500">
                  Select text to format it. Use the
                  blue Drag handle to move text.
                  Signatures can be moved and resized.
                </p>
              </div>
            </div>

            <div className="flex w-full justify-center">
              <div
                ref={previewRef}
                className="relative shadow-2xl"
                style={{
                  width: `${pageSize.width}px`,
                  height: `${pageSize.height}px`,
                  maxWidth: "100%",
                  transformOrigin: "top center",
                }}
              >
                {backgroundUrl ? (
                  <img
                    src={backgroundUrl}
                    alt="Letterhead"
                    className="absolute inset-0 h-full w-full object-contain"
                    draggable={false}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-white text-center text-slate-400">
                    <div>
                      <p className="text-lg font-semibold">
                        Upload your letterhead
                      </p>

                      <p className="mt-1 text-sm">
                        PDF, PNG, JPG or WebP
                      </p>
                    </div>
                  </div>
                )}

                {/* Text boxes */}

                {textBoxes
                  .filter((box) => box.page === currentPage)
                  .map((box) => (
                    <div
                      key={box.id}
                      onClick={(
                        event
                      ) => {
                        event.stopPropagation();

                        setSelectedId(
                          box.id
                        );

                        setSelectedSignatureId(
                          null
                        );
                      }}
                      className={`absolute overflow-visible ${
                        selectedId ===
                        box.id
                          ? "ring-2 ring-blue-500"
                          : ""
                      }`}
                      style={{
                        left: `${
                          (box.x /
                            pageSize.width) *
                          100
                        }%`,

                        top: `${
                          (box.y /
                            pageSize.height) *
                          100
                        }%`,

                        width: `${
                          (box.width /
                            pageSize.width) *
                          100
                        }%`,

                        minHeight: `${
                          (box.height /
                            pageSize.height) *
                          100
                        }%`,
                      }}
                    >
                      {/* Drag handle */}

                      {selectedId ===
                        box.id && (
                        <div
                          onMouseDown={(
                            event
                          ) => {
                            event.preventDefault();
                            event.stopPropagation();

                            const point =
                              getPreviewCoordinates(
                                event
                              );

                            dragOffset.current =
                              {
                                x:
                                  point.x -
                                  box.x,

                                y:
                                  point.y -
                                  box.y,
                              };

                            setDragging(
                              true
                            );
                          }}
                          className="absolute -top-7 left-1/2 z-50 flex -translate-x-1/2 cursor-move items-center gap-1 rounded-t-md bg-blue-500 px-3 py-1 text-xs font-semibold text-white shadow"
                        >
                          <span>
                            ✥
                          </span>

                          Drag
                        </div>
                      )}

                      {/* Text editor */}

                      <div
                        className="relative z-10 h-full w-full cursor-text"
                        onMouseDown={(
                          event
                        ) => {
                          event.stopPropagation();
                        }}
                        onClick={(
                          event
                        ) => {
                          event.stopPropagation();

                          setSelectedId(
                            box.id
                          );

                          setSelectedSignatureId(
                            null
                          );
                        }}
                      >
                        {selectedId ===
                        box.id ? (
                          <EditorContent
                            editor={
                              editor
                            }
                            className="prose max-w-none bg-white/5 p-2 text-black"
                          />
                        ) : (
                          <div className="p-2 text-sm text-slate-700">
                            Click to edit text
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}

                {/* Signatures */}

                {signatures
                  .filter(
                    (signature) =>
                      signature.page ===
                      currentPage
                  )
                  .map(
                    (signature) => (
                      <div
                        key={
                          signature.id
                        }
                        className={`absolute touch-none select-none ${
                          draggingSignature &&
                          selectedSignatureId ===
                            signature.id
                            ? "cursor-grabbing"
                            : "cursor-move"
                        }`}
                        style={{
                          left: `${
                            (signature.x /
                              pageSize.width) *
                            100
                          }%`,

                          top: `${
                            (signature.y /
                              pageSize.height) *
                            100
                          }%`,

                          width: `${
                            (signature.width /
                              pageSize.width) *
                            100
                          }%`,

                          height: `${
                            (signature.height /
                              pageSize.height) *
                            100
                          }%`,

                          zIndex:
                            selectedSignatureId ===
                            signature.id
                              ? 40
                              : 30,
                        }}
                        onPointerDown={(
                          event
                        ) =>
                          startSignatureDrag(
                            event,
                            signature
                          )
                        }
                        onPointerMove={
                          moveSignature
                        }
                        onPointerUp={
                          finishSignatureDrag
                        }
                        onPointerCancel={
                          finishSignatureDrag
                        }
                        onClick={(
                          event
                        ) => {
                          event.stopPropagation();

                          setSelectedSignatureId(
                            signature.id
                          );

                          setSelectedId(
                            null
                          );
                        }}
                      >
                        <img
                          src={
                            signature.image
                          }
                          alt="Signature"
                          draggable={
                            false
                          }
                          className="pointer-events-none block h-full w-full select-none object-fill"
                        />

                        {selectedSignatureId ===
                          signature.id && (
                          <>
                            <div className="pointer-events-none absolute inset-0 rounded border-2 border-dashed border-indigo-500" />

                            <div
                              onPointerDown={(
                                event
                              ) =>
                                resizeSignature(
                                  event,
                                  signature
                                )
                              }
                              className="absolute -bottom-2 -right-2 h-5 w-5 cursor-se-resize rounded-full border-2 border-white bg-indigo-600 shadow"
                            />
                          </>
                        )}
                      </div>
                    )
                  )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Tiptap styling */}

      <style jsx global>{`
        .ProseMirror {
          min-height: 100px;
          outline: none;
          font-family: Arial, sans-serif;
          color: #111827;
        }

        .ProseMirror p {
          margin: 0 0 8px;
        }

        .ProseMirror strong {
          font-weight: 700;
        }

        .ProseMirror em {
          font-style: italic;
        }

        .ProseMirror u {
          text-decoration: underline;
        }

        .ProseMirror p.is-editor-empty:first-child::before {
          content: "Type or paste your document here...";
          color: #94a3b8;
          pointer-events: none;
          float: left;
          height: 0;
        }
      `}</style>
    </main>
  );
}