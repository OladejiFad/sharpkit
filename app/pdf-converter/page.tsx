"use client";

import {
  ChangeEvent,
  DragEvent,
  useRef,
  useState,
} from "react";

import {
  PDFDocument,
  PDFFont,
  PDFImage,
  PDFPage,
  StandardFonts,
  rgb,
} from "pdf-lib";

import mammoth from "mammoth";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";

type FileItem = {
  id: string;
  file: File;
  type:
    | "image"
    | "pdf"
    | "text"
    | "docx"
    | "excel";
  preview?: string;
};

type PageSize = "a4" | "letter" | "original";
type Orientation =
  | "auto"
  | "portrait"
  | "landscape";
type FitMode = "fit" | "fill";

const A4 = {
  width: 595.28,
  height: 841.89,
};

const LETTER = {
  width: 612,
  height: 792,
};

export default function PdfConverterPage() {
  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [files, setFiles] =
    useState<FileItem[]>([]);

  const [pageSize, setPageSize] =
    useState<PageSize>("a4");

  const [orientation, setOrientation] =
    useState<Orientation>("auto");

  const [fitMode, setFitMode] =
    useState<FitMode>("fit");

  const [margin, setMargin] =
    useState(24);

  const [loading, setLoading] =
    useState(false);

  const [status, setStatus] =
    useState("");

  const [error, setError] =
    useState("");

  function createId() {
    return `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`;
  }

  function getFileType(
    file: File
  ): FileItem["type"] | null {
    const name =
      file.name.toLowerCase();

    if (
      file.type.startsWith("image/") ||
      /\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i.test(
        name
      )
    ) {
      return "image";
    }

    if (
      file.type ===
        "application/pdf" ||
      name.endsWith(".pdf")
    ) {
      return "pdf";
    }

    if (
      file.type === "text/plain" ||
      name.endsWith(".txt")
    ) {
      return "text";
    }

    if (
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      name.endsWith(".docx")
    ) {
      return "docx";
    }

    if (
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type ===
        "application/vnd.ms-excel" ||
      /\.(xlsx|xls)$/i.test(name)
    ) {
      return "excel";
    }

    return null;
  }

  function addFiles(
    fileList: FileList | File[]
  ) {
    const incoming =
      Array.from(fileList);

    const newItems: FileItem[] =
      [];

    for (const file of incoming) {
      const type =
        getFileType(file);

      if (!type) continue;

      newItems.push({
        id: createId(),
        file,
        type,
        preview:
          type === "image"
            ? URL.createObjectURL(file)
            : undefined,
      });
    }

    if (newItems.length === 0) {
      setError(
        "Please select JPG, JPEG, PNG, WEBP, GIF, BMP, SVG, PDF, TXT, DOCX, XLSX or XLS files."
      );
      return;
    }

    setError("");

    setFiles((current) => [
      ...current,
      ...newItems,
    ]);
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    if (event.target.files) {
      addFiles(
        event.target.files
      );
    }

    event.target.value = "";
  }

  function handleDrop(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();

    if (event.dataTransfer.files) {
      addFiles(
        event.dataTransfer.files
      );
    }
  }

  function removeFile(id: string) {
    setFiles((current) => {
      const item =
        current.find(
          (file) =>
            file.id === id
        );

      if (item?.preview) {
        URL.revokeObjectURL(
          item.preview
        );
      }

      return current.filter(
        (file) =>
          file.id !== id
      );
    });
  }

  function moveFile(
    index: number,
    direction:
      | "up"
      | "down"
  ) {
    setFiles((current) => {
      const next = [
        ...current,
      ];

      const target =
        direction === "up"
          ? index - 1
          : index + 1;

      if (
        target < 0 ||
        target >= next.length
      ) {
        return current;
      }

      [
        next[index],
        next[target],
      ] = [
        next[target],
        next[index],
      ];

      return next;
    });
  }

  function getPageDimensions(
    width: number,
    height: number
  ) {
    let pageWidth: number;
    let pageHeight: number;

    if (
      pageSize === "a4"
    ) {
      pageWidth =
        A4.width;
      pageHeight =
        A4.height;
    } else if (
      pageSize === "letter"
    ) {
      pageWidth =
        LETTER.width;
      pageHeight =
        LETTER.height;
    } else {
      pageWidth =
        width;
      pageHeight =
        height;
    }

    if (
      orientation ===
        "portrait" &&
      pageWidth > pageHeight
    ) {
      [
        pageWidth,
        pageHeight,
      ] = [
        pageHeight,
        pageWidth,
      ];
    }

    if (
      orientation ===
        "landscape" &&
      pageHeight > pageWidth
    ) {
      [
        pageWidth,
        pageHeight,
      ] = [
        pageHeight,
        pageWidth,
      ];
    }

    if (
      orientation === "auto" &&
      pageSize !== "original" &&
      width > height
    ) {
      [
        pageWidth,
        pageHeight,
      ] = [
        pageHeight,
        pageWidth,
      ];
    }

    return {
      width: pageWidth,
      height: pageHeight,
    };
  }

  async function imageToBytes(
    file: File
  ): Promise<{
    bytes: Uint8Array;
    type: "jpg" | "png";
    width: number;
    height: number;
  }> {
    const url =
      URL.createObjectURL(
        file
      );

    try {
      const image =
        new Image();

      await new Promise<void>(
        (resolve, reject) => {
          image.onload =
            () => resolve();

          image.onerror =
            () =>
              reject(
                new Error(
                  `Unable to read image: ${file.name}`
                )
              );

          image.src = url;
        }
      );

      const canvas =
        document.createElement(
          "canvas"
        );

      canvas.width =
        image.naturalWidth;

      canvas.height =
        image.naturalHeight;

      const context =
        canvas.getContext(
          "2d"
        );

      if (!context) {
        throw new Error(
          "Your browser does not support Canvas."
        );
      }

      context.drawImage(
        image,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const isPng =
        file.type ===
          "image/png" ||
        file.name
          .toLowerCase()
          .endsWith(".png");

      const dataUrl =
        canvas.toDataURL(
          isPng
            ? "image/png"
            : "image/jpeg",
          0.92
        );

      const response =
        await fetch(
          dataUrl
        );

      const buffer =
        await response.arrayBuffer();

      return {
        bytes:
          new Uint8Array(
            buffer
          ),
        type: isPng
          ? "png"
          : "jpg",
        width:
          image.naturalWidth,
        height:
          image.naturalHeight,
      };
    } finally {
      URL.revokeObjectURL(
        url
      );
    }
  }

  function drawImageOnPage(
    page: PDFPage,
    image: PDFImage,
    imageWidth: number,
    imageHeight: number
  ) {
    const pageWidth =
      page.getWidth();

    const pageHeight =
      page.getHeight();

    const availableWidth =
      pageWidth -
      margin * 2;

    const availableHeight =
      pageHeight -
      margin * 2;

    const imageRatio =
      imageWidth /
      imageHeight;

    const pageRatio =
      availableWidth /
      availableHeight;

    let drawWidth: number;
    let drawHeight: number;

    if (
      fitMode === "fill"
    ) {
      if (
        imageRatio >
        pageRatio
      ) {
        drawHeight =
          availableHeight;

        drawWidth =
          drawHeight *
          imageRatio;
      } else {
        drawWidth =
          availableWidth;

        drawHeight =
          drawWidth /
          imageRatio;
      }
    } else {
      if (
        imageRatio >
        pageRatio
      ) {
        drawWidth =
          availableWidth;

        drawHeight =
          drawWidth /
          imageRatio;
      } else {
        drawHeight =
          availableHeight;

        drawWidth =
          drawHeight *
          imageRatio;
      }
    }

    const x =
      (pageWidth -
        drawWidth) /
      2;

    const y =
      (pageHeight -
        drawHeight) /
      2;

    page.drawImage(
      image,
      {
        x,
        y,
        width:
          drawWidth,
        height:
          drawHeight,
      }
    );
  }

  async function addImageToPdf(
    pdf: PDFDocument,
    file: File
  ) {
    const converted =
      await imageToBytes(
        file
      );

    let embeddedImage:
      PDFImage;

    if (
      converted.type ===
      "png"
    ) {
      embeddedImage =
        await pdf.embedPng(
          converted.bytes
        );
    } else {
      embeddedImage =
        await pdf.embedJpg(
          converted.bytes
        );
    }

    const dimensions =
      getPageDimensions(
        converted.width,
        converted.height
      );

    const page =
      pdf.addPage([
        dimensions.width,
        dimensions.height,
      ]);

    drawImageOnPage(
      page,
      embeddedImage,
      converted.width,
      converted.height
    );
  }

  function wrapText(
    text: string,
    font: PDFFont,
    size: number,
    maxWidth: number
  ) {
    const words =
      text.split(
        /\s+/
      );

    const lines: string[] =
      [];

    let currentLine =
      "";

    for (
      const word of words
    ) {
      const testLine =
        currentLine.length >
        0
          ? `${currentLine} ${word}`
          : word;

      const width =
        font.widthOfTextAtSize(
          testLine,
          size
        );

      if (
        width <=
          maxWidth ||
        currentLine.length ===
          0
      ) {
        currentLine =
          testLine;
      } else {
        lines.push(
          currentLine
        );

        currentLine =
          word;
      }
    }

    if (currentLine) {
      lines.push(
        currentLine
      );
    }

    return lines;
  }

  function drawTextLine(
    page: PDFPage,
    text: string,
    x: number,
    y: number,
    font: PDFFont,
    size: number
  ) {
    page.drawText(
      text,
      {
        x,
        y,
        size,
        font,
        color: rgb(
          0.08,
          0.08,
          0.08
        ),
      }
    );
  }

  async function addTextToPdf(
    pdf: PDFDocument,
    file: File
  ) {
    const text =
      await file.text();

    const font =
      await pdf.embedFont(
        StandardFonts.Helvetica
      );

    const pageWidth =
      pageSize === "letter"
        ? LETTER.width
        : A4.width;

    const pageHeight =
      pageSize === "letter"
        ? LETTER.height
        : A4.height;

    const fontSize = 11;
    const lineHeight = 16;

    const maxWidth =
      pageWidth -
      margin * 2;

    const paragraphs =
      text.split(
        /\r?\n/
      );

    let page =
      pdf.addPage([
        pageWidth,
        pageHeight,
      ]);

    let y =
      pageHeight -
      margin;

    for (
      const paragraph of paragraphs
    ) {
      if (
        paragraph.trim() ===
        ""
      ) {
        y -=
          lineHeight;

        continue;
      }

      const lines =
        wrapText(
          paragraph,
          font,
          fontSize,
          maxWidth
        );

      for (
        const line of lines
      ) {
        if (
          y <
          margin +
            lineHeight
        ) {
          page =
            pdf.addPage([
              pageWidth,
              pageHeight,
            ]);

          y =
            pageHeight -
            margin;
        }

        drawTextLine(
          page,
          line,
          margin,
          y,
          font,
          fontSize
        );

        y -=
          lineHeight;
      }
    }
  }

  async function addPdfToPdf(
    outputPdf: PDFDocument,
    file: File
  ) {
    const bytes =
      await file.arrayBuffer();

    const sourcePdf =
      await PDFDocument.load(
        bytes
      );

    const pages =
      await outputPdf.copyPages(
        sourcePdf,
        sourcePdf.getPageIndices()
      );

    for (
      const page of pages
    ) {
      outputPdf.addPage(
        page
      );
    }
  }

  async function addDocxToPdf(
    pdf: PDFDocument,
    file: File
  ) {
    setStatus(
      `Reading Word document: ${file.name}`
    );

    const arrayBuffer =
      await file.arrayBuffer();

    const result =
      await mammoth.convertToHtml(
        {
          arrayBuffer,
        },
        {
          includeDefaultStyleMap:
            true,
        }
      );

    const html =
      result.value;

    if (!html.trim()) {
      throw new Error(
        `The Word document "${file.name}" appears to be empty.`
      );
    }

    const container =
      document.createElement(
        "div"
      );

    container.style.position =
      "fixed";

    container.style.left =
      "-100000px";

    container.style.top =
      "0";

    container.style.width =
      "794px";

    container.style.background =
      "#ffffff";

    container.style.color =
      "#000000";

    container.style.padding =
      "0";

    container.style.margin =
      "0";

    container.style.fontFamily =
      "Arial, Helvetica, sans-serif";

    container.style.fontSize =
      "16px";

    container.style.lineHeight =
      "1.5";

    container.style.boxSizing =
      "border-box";

    container.innerHTML = `
      <style>
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 0;
          background: #ffffff;
          color: #000000;
          font-family: Arial, Helvetica, sans-serif;
        }

        .sharpkit-docx {
          width: 794px;
          background: #ffffff;
          padding: 56px;
          color: #000000;
        }

        .sharpkit-docx img {
          max-width: 100%;
          height: auto;
        }

        .sharpkit-docx table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
        }

        .sharpkit-docx td,
        .sharpkit-docx th {
          border: 1px solid #999999;
          padding: 6px;
          vertical-align: top;
        }

        .sharpkit-docx p {
          margin-top: 0;
          margin-bottom: 12px;
        }

        .sharpkit-docx h1 {
          font-size: 30px;
          margin-top: 0;
          margin-bottom: 20px;
        }

        .sharpkit-docx h2 {
          font-size: 24px;
          margin-top: 20px;
          margin-bottom: 14px;
        }

        .sharpkit-docx h3 {
          font-size: 20px;
          margin-top: 18px;
          margin-bottom: 12px;
        }

        .sharpkit-docx ul,
        .sharpkit-docx ol {
          margin-top: 0;
          margin-bottom: 14px;
          padding-left: 28px;
        }

        .sharpkit-docx blockquote {
          margin: 16px 0;
          padding-left: 16px;
          border-left: 4px solid #cccccc;
        }
      </style>

      <div class="sharpkit-docx">
        ${html}
      </div>
    `;

    document.body.appendChild(
      container
    );

    try {
      await new Promise<void>(
        (resolve) => {
          requestAnimationFrame(
            () => {
              requestAnimationFrame(
                () => {
                  resolve();
                }
              );
            }
          );
        }
      );

      const images =
        Array.from(
          container.querySelectorAll(
            "img"
          )
        );

      await Promise.all(
        images.map(
          (image) =>
            new Promise<void>(
              (resolve) => {
                if (
                  image.complete
                ) {
                  resolve();
                  return;
                }

                image.onload =
                  () =>
                    resolve();

                image.onerror =
                  () =>
                    resolve();
              }
            )
        )
      );

      const canvas =
        await html2canvas(
          container,
          {
            backgroundColor:
              "#ffffff",

            scale: 2,

            useCORS: true,

            logging: false,

            imageTimeout:
              15000,
          }
        );

      if (
        canvas.width ===
          0 ||
        canvas.height ===
          0
      ) {
        throw new Error(
          `Unable to render "${file.name}".`
        );
      }

      const pdfPageWidth =
        pageSize === "letter"
          ? LETTER.width
          : A4.width;

      const pdfPageHeight =
        pageSize === "letter"
          ? LETTER.height
          : A4.height;

      let pageWidth =
        pdfPageWidth;

      let pageHeight =
        pdfPageHeight;

      if (
        orientation ===
        "landscape"
      ) {
        [
          pageWidth,
          pageHeight,
        ] = [
          pageHeight,
          pageWidth,
        ];
      }

      const availableWidth =
        pageWidth -
        margin * 2;

      const availableHeight =
        pageHeight -
        margin * 2;

      const sourcePixelsPerPdfPoint =
        canvas.width /
        availableWidth;

      const sourcePageHeight =
        availableHeight *
        sourcePixelsPerPdfPoint;

      let sourceY = 0;

      while (
        sourceY <
        canvas.height
      ) {
        const remaining =
          canvas.height -
          sourceY;

        const sourceHeight =
          Math.min(
            sourcePageHeight,
            remaining
          );

        const pageCanvas =
          document.createElement(
            "canvas"
          );

        pageCanvas.width =
          canvas.width;

        pageCanvas.height =
          Math.ceil(
            sourceHeight
          );

        const context =
          pageCanvas.getContext(
            "2d"
          );

        if (!context) {
          throw new Error(
            "Unable to create document canvas."
          );
        }

        context.fillStyle =
          "#ffffff";

        context.fillRect(
          0,
          0,
          pageCanvas.width,
          pageCanvas.height
        );

        context.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          sourceHeight,
          0,
          0,
          canvas.width,
          sourceHeight
        );

        const pageDataUrl =
          pageCanvas.toDataURL(
            "image/jpeg",
            0.92
          );

        const pageResponse =
          await fetch(
            pageDataUrl
          );

        const pageBytes =
          new Uint8Array(
            await pageResponse.arrayBuffer()
          );

        const pageImage =
          await pdf.embedJpg(
            pageBytes
          );

        const pdfPage =
          pdf.addPage([
            pageWidth,
            pageHeight,
          ]);

        const drawHeight =
          sourceHeight /
          sourcePixelsPerPdfPoint;

        pdfPage.drawImage(
          pageImage,
          {
            x: margin,
            y:
              pageHeight -
              margin -
              drawHeight,
            width:
              availableWidth,
            height:
              drawHeight,
          }
        );

        sourceY +=
          sourceHeight;
      }
    } finally {
      container.remove();
    }
  }

  async function addExcelToPdf(
    pdf: PDFDocument,
    file: File
  ) {
    setStatus(
      `Reading Excel workbook: ${file.name}`
    );

    const arrayBuffer =
      await file.arrayBuffer();

    const workbook =
      XLSX.read(
        arrayBuffer,
        {
          type: "array",
        }
      );

    if (
      workbook.SheetNames.length ===
      0
    ) {
      throw new Error(
        `The Excel file "${file.name}" does not contain any worksheets.`
      );
    }

    const pdfPageWidth =
      pageSize === "letter"
        ? LETTER.width
        : A4.width;

    const pdfPageHeight =
      pageSize === "letter"
        ? LETTER.height
        : A4.height;

    let pageWidth =
      pdfPageWidth;

    let pageHeight =
      pdfPageHeight;

    if (
      orientation ===
      "landscape"
    ) {
      [
        pageWidth,
        pageHeight,
      ] = [
        pageHeight,
        pageWidth,
      ];
    }

    /*
     * Excel is rendered as an HTML
     * table first, then captured
     * into PDF pages.
     */
    for (
      let sheetIndex = 0;
      sheetIndex <
      workbook.SheetNames.length;
      sheetIndex++
    ) {
      const sheetName =
        workbook.SheetNames[
          sheetIndex
        ];

      setStatus(
        `Processing Excel sheet ${
          sheetIndex + 1
        } of ${
          workbook.SheetNames.length
        }: ${sheetName}`
      );

      const worksheet =
        workbook.Sheets[
          sheetName
        ];

      const range =
        worksheet["!ref"];

      if (!range) {
        continue;
      }

      const rows =
        XLSX.utils.sheet_to_json(
          worksheet,
          {
            header: 1,
            defval: "",
            raw: false,
          }
        ) as unknown[][];

      if (
        rows.length === 0
      ) {
        continue;
      }

      const container =
        document.createElement(
          "div"
        );

      container.style.position =
        "fixed";

      container.style.left =
        "-100000px";

      container.style.top =
        "0";

      container.style.width =
        "1200px";

      container.style.background =
        "#ffffff";

      container.style.color =
        "#111827";

      container.style.padding =
        "40px";

      container.style.fontFamily =
        "Arial, Helvetica, sans-serif";

      container.style.boxSizing =
        "border-box";

      const wrapper =
        document.createElement(
          "div"
        );

      wrapper.style.width =
        "1120px";

      wrapper.style.background =
        "#ffffff";

      const title =
        document.createElement(
          "h2"
        );

      title.textContent =
        sheetName;

      title.style.margin =
        "0 0 18px 0";

      title.style.fontSize =
        "22px";

      title.style.fontWeight =
        "700";

      title.style.color =
        "#111827";

      wrapper.appendChild(
        title
      );

      const table =
        document.createElement(
          "table"
        );

      table.style.borderCollapse =
        "collapse";

      table.style.width =
        "100%";

      table.style.tableLayout =
        "auto";

      table.style.fontSize =
        "13px";

      table.style.background =
        "#ffffff";

      for (
        let rowIndex = 0;
        rowIndex <
        rows.length;
        rowIndex++
      ) {
        const row =
          rows[rowIndex];

        const tr =
          document.createElement(
            "tr"
          );

        for (
          let colIndex = 0;
          colIndex <
          row.length;
          colIndex++
        ) {
          const cell =
            document.createElement(
              rowIndex === 0
                ? "th"
                : "td"
            );

          const value =
            row[colIndex];

          cell.textContent =
            value === null ||
            value === undefined
              ? ""
              : String(value);

          cell.style.border =
            "1px solid #9ca3af";

          cell.style.padding =
            "7px 9px";

          cell.style.textAlign =
            "left";

          cell.style.verticalAlign =
            "top";

          cell.style.wordBreak =
            "break-word";

          if (
            rowIndex === 0
          ) {
            cell.style.background =
              "#e5e7eb";

            cell.style.fontWeight =
              "700";
          }

          tr.appendChild(
            cell
          );
        }

        table.appendChild(
          tr
        );
      }

      wrapper.appendChild(
        table
      );

      container.appendChild(
        wrapper
      );

      document.body.appendChild(
        container
      );

      try {
        await new Promise<void>(
          (resolve) => {
            requestAnimationFrame(
              () => {
                requestAnimationFrame(
                  () => {
                    resolve();
                  }
                );
              }
            );
          }
        );

        const canvas =
          await html2canvas(
            container,
            {
              backgroundColor:
                "#ffffff",

              scale: 2,

              logging: false,
            }
          );

        if (
          canvas.width === 0 ||
          canvas.height === 0
        ) {
          throw new Error(
            `Unable to render Excel sheet "${sheetName}".`
          );
        }

        const availableWidth =
          pageWidth -
          margin * 2;

        const availableHeight =
          pageHeight -
          margin * 2;

        const sourcePixelsPerPdfPoint =
          canvas.width /
          availableWidth;

        const sourcePageHeight =
          availableHeight *
          sourcePixelsPerPdfPoint;

        let sourceY = 0;

        while (
          sourceY <
          canvas.height
        ) {
          const remaining =
            canvas.height -
            sourceY;

          const sourceHeight =
            Math.min(
              sourcePageHeight,
              remaining
            );

          const pageCanvas =
            document.createElement(
              "canvas"
            );

          pageCanvas.width =
            canvas.width;

          pageCanvas.height =
            Math.ceil(
              sourceHeight
            );

          const context =
            pageCanvas.getContext(
              "2d"
            );

          if (!context) {
            throw new Error(
              "Unable to create Excel canvas."
            );
          }

          context.fillStyle =
            "#ffffff";

          context.fillRect(
            0,
            0,
            pageCanvas.width,
            pageCanvas.height
          );

          context.drawImage(
            canvas,
            0,
            sourceY,
            canvas.width,
            sourceHeight,
            0,
            0,
            canvas.width,
            sourceHeight
          );

          const pageDataUrl =
            pageCanvas.toDataURL(
              "image/jpeg",
              0.92
            );

          const response =
            await fetch(
              pageDataUrl
            );

          const bytes =
            new Uint8Array(
              await response.arrayBuffer()
            );

          const image =
            await pdf.embedJpg(
              bytes
            );

          const page =
            pdf.addPage([
              pageWidth,
              pageHeight,
            ]);

          const drawHeight =
            sourceHeight /
            sourcePixelsPerPdfPoint;

          page.drawImage(
            image,
            {
              x: margin,
              y:
                pageHeight -
                margin -
                drawHeight,
              width:
                availableWidth,
              height:
                drawHeight,
            }
          );

          sourceY +=
            sourceHeight;
        }
      } finally {
        container.remove();
      }
    }
  }

  async function createPdf() {
    if (
      files.length === 0
    ) {
      setError(
        "Please add at least one file."
      );

      return;
    }

    setLoading(true);
    setError("");
    setStatus(
      "Creating your PDF..."
    );

    try {
      const pdf =
        await PDFDocument.create();

      for (
        let index = 0;
        index < files.length;
        index++
      ) {
        const item =
          files[index];

        setStatus(
          `Processing ${
            index + 1
          } of ${
            files.length
          }: ${
            item.file.name
          }`
        );

        if (
          item.type ===
          "image"
        ) {
          await addImageToPdf(
            pdf,
            item.file
          );
        }

        if (
          item.type ===
          "pdf"
        ) {
          await addPdfToPdf(
            pdf,
            item.file
          );
        }

        if (
          item.type ===
          "text"
        ) {
          await addTextToPdf(
            pdf,
            item.file
          );
        }

        if (
          item.type ===
          "docx"
        ) {
          await addDocxToPdf(
            pdf,
            item.file
          );
        }

        if (
          item.type ===
          "excel"
        ) {
          await addExcelToPdf(
            pdf,
            item.file
          );
        }
      }

      if (
        pdf.getPageCount() ===
        0
      ) {
        throw new Error(
          "No pages could be created from the selected files."
        );
      }

      setStatus(
        "Finalizing PDF..."
      );

      const pdfBytes =
        await pdf.save();

      const blob =
        new Blob(
          [
            Uint8Array.from(
              pdfBytes
            ),
          ],
          {
            type:
              "application/pdf",
          }
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href = url;

      link.download =
        "sharpkit-document.pdf";

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      URL.revokeObjectURL(
        url
      );

      setStatus(
        "PDF created successfully."
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while creating the PDF."
      );

      setStatus("");
    } finally {
      setLoading(false);
    }
  }

  function clearAll() {
    for (
      const item of files
    ) {
      if (item.preview) {
        URL.revokeObjectURL(
          item.preview
        );
      }
    }

    setFiles([]);
    setError("");
    setStatus("");
  }

  function getFileIcon(
    type: FileItem["type"]
  ) {
    if (
      type === "pdf"
    ) {
      return "📕";
    }

    if (
      type === "docx"
    ) {
      return "📘";
    }

    if (
      type === "excel"
    ) {
      return "📗";
    }

    if (
      type === "text"
    ) {
      return "📄";
    }

    return "🖼️";
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            SHARPKIT PDF TOOL
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Convert Files to PDF
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Convert Word documents,
            Excel spreadsheets,
            images, text files and
            existing PDFs into one
            professional PDF document.
            Everything is processed
            directly in your browser.
          </p>
        </div>

        <div
          onDragOver={(event) =>
            event.preventDefault()
          }
          onDrop={handleDrop}
          className="rounded-3xl border-2 border-dashed border-slate-300 bg-white p-8 shadow-sm transition hover:border-slate-400"
        >
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
              📄
            </div>

            <h2 className="text-xl font-bold">
              Add your files
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              JPG, PNG, WEBP, GIF,
              BMP, SVG, PDF, TXT,
              DOCX, XLSX or XLS
            </p>

            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="mt-6 rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-700"
            >
              Choose Files
            </button>

            <input
              ref={
                fileInputRef
              }
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp,.gif,.bmp,.svg,.pdf,.txt,.docx,.xlsx,.xls,image/*,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              onChange={
                handleFileChange
              }
              className="hidden"
            />

            <p className="mt-3 text-xs text-slate-400">
              Or drag and drop
              your files here
            </p>
          </div>
        </div>

        {files.length > 0 && (
          <section className="mt-8 rounded-3xl bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Files
                </h2>

                <p className="text-sm text-slate-500">
                  {files.length} file
                  {files.length ===
                  1
                    ? ""
                    : "s"} selected
                </p>
              </div>

              <button
                type="button"
                onClick={
                  clearAll
                }
                className="text-sm font-semibold text-red-600 hover:text-red-700"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-3">
              {files.map(
                (
                  item,
                  index
                ) => (
                  <div
                    key={
                      item.id
                    }
                    className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center"
                  >
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                      {item.preview ? (
                        <img
                          src={
                            item.preview
                          }
                          alt={
                            item.file
                              .name
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">
                          {getFileIcon(
                            item.type
                          )}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">
                        {
                          item
                            .file
                            .name
                        }
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {item.type.toUpperCase()}{" "}
                        ·{" "}
                        {(
                          item.file
                            .size /
                          1024 /
                          1024
                        ).toFixed(
                          2
                        )}{" "}
                        MB
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          moveFile(
                            index,
                            "up"
                          )
                        }
                        disabled={
                          index ===
                          0
                        }
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-30"
                        title="Move up"
                      >
                        ↑
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          moveFile(
                            index,
                            "down"
                          )
                        }
                        disabled={
                          index ===
                          files.length -
                            1
                        }
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-30"
                        title="Move down"
                      >
                        ↓
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          removeFile(
                            item.id
                          )
                        }
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          </section>
        )}

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">
            PDF Settings
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">
                Page Size
              </span>

              <select
                value={
                  pageSize
                }
                onChange={(
                  event
                ) =>
                  setPageSize(
                    event.target
                      .value as PageSize
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-900"
              >
                <option value="a4">
                  A4
                </option>

                <option value="letter">
                  Letter
                </option>

                <option value="original">
                  Original Size
                </option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold">
                Orientation
              </span>

              <select
                value={
                  orientation
                }
                onChange={(
                  event
                ) =>
                  setOrientation(
                    event.target
                      .value as Orientation
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-900"
              >
                <option value="auto">
                  Automatic
                </option>

                <option value="portrait">
                  Portrait
                </option>

                <option value="landscape">
                  Landscape
                </option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold">
                Image Fit
              </span>

              <select
                value={
                  fitMode
                }
                onChange={(
                  event
                ) =>
                  setFitMode(
                    event.target
                      .value as FitMode
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-900"
              >
                <option value="fit">
                  Fit — keep entire
                  image
                </option>

                <option value="fill">
                  Fill — use more of
                  the page
                </option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold">
                Margin: {margin}px
              </span>

              <input
                type="range"
                min="0"
                max="72"
                step="4"
                value={
                  margin
                }
                onChange={(
                  event
                ) =>
                  setMargin(
                    Number(
                      event.target
                        .value
                    )
                  )
                }
                className="mt-3 w-full"
              />
            </label>
          </div>
        </section>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {status &&
          !error && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700">
              {status}
            </div>
          )}

        <button
          type="button"
          onClick={
            createPdf
          }
          disabled={
            files.length ===
              0 ||
            loading
          }
          className="mt-6 w-full rounded-2xl bg-slate-900 px-6 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading
            ? "Creating PDF..."
            : "Convert to PDF"}
        </button>

        <div className="mt-8 grid gap-4 text-center sm:grid-cols-5">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="text-2xl">
              🔒
            </div>

            <h3 className="mt-2 font-bold">
              Private
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Files are processed
              in your browser.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="text-2xl">
              📝
            </div>

            <h3 className="mt-2 font-bold">
              Word
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Convert DOCX
              documents.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="text-2xl">
              📊
            </div>

            <h3 className="mt-2 font-bold">
              Excel
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Convert XLSX and
              XLS spreadsheets.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="text-2xl">
              📑
            </div>

            <h3 className="mt-2 font-bold">
              Multiple Files
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Combine files into
              one PDF.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="text-2xl">
              ⚡
            </div>

            <h3 className="mt-2 font-bold">
              Browser Based
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              No upload server is
              required.
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-xs leading-5 text-slate-400">
          Supported: Word DOCX,
          Excel XLSX/XLS, images,
          PDF files and plain text
          files. Everything is
          processed locally in your
          browser.
        </p>
      </div>
    </main>
  );
}

