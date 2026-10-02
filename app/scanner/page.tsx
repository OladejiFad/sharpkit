"use client";
import { PDFDocument } from "pdf-lib";
import {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";

type Point = {
  x: number;
  y: number;
};

type ScanMode = "color" | "gray" | "bw";

type Detection = {
  corners: Point[];
  confidence: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function distance(a: Point, b: Point) {
  return Math.sqrt(
    Math.pow(a.x - b.x, 2) +
      Math.pow(a.y - b.y, 2)
  );
}

function orderCorners(points: Point[]): Point[] {
  if (points.length !== 4) {
    throw new Error("Four document corners are required.");
  }

  const sums = points.map(
    (p) => p.x + p.y
  );

  const differences = points.map(
    (p) => p.x - p.y
  );

  const topLeft =
    points[sums.indexOf(Math.min(...sums))];

  const bottomRight =
    points[sums.indexOf(Math.max(...sums))];

  const topRight =
    points[
      differences.indexOf(
        Math.max(...differences)
      )
    ];

  const bottomLeft =
    points[
      differences.indexOf(
        Math.min(...differences)
      )
    ];

  return [
    topLeft,
    topRight,
    bottomRight,
    bottomLeft,
  ];
}

/*
 * Small median helper.
 */
function median(values: number[]) {
  if (!values.length) return 0;

  const sorted = [...values].sort(
    (a, b) => a - b
  );

  const middle = Math.floor(
    sorted.length / 2
  );

  if (sorted.length % 2 === 0) {
    return (
      (sorted[middle - 1] +
        sorted[middle]) /
      2
    );
  }

  return sorted[middle];
}

/*
 * Detect the document by separating the
 * page from the surrounding background.
 *
 * This is intentionally different from the
 * previous "strongest gradient" detector.
 */
function detectDocument(
  sourceCanvas: HTMLCanvasElement
): Detection {
  const originalWidth =
    sourceCanvas.width;

  const originalHeight =
    sourceCanvas.height;

  const analysisMax = 900;

  const scale = Math.min(
    1,
    analysisMax /
      Math.max(
        originalWidth,
        originalHeight
      )
  );

  const width = Math.max(
    1,
    Math.round(originalWidth * scale)
  );

  const height = Math.max(
    1,
    Math.round(originalHeight * scale)
  );

  const canvas =
    document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d", {
    willReadFrequently: true,
  });

  if (!ctx) {
    throw new Error(
      "Unable to create detection canvas."
    );
  }

  ctx.drawImage(
    sourceCanvas,
    0,
    0,
    width,
    height
  );

  const image = ctx.getImageData(
    0,
    0,
    width,
    height
  );

  const data = image.data;

  const gray = new Float32Array(
    width * height
  );

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i =
        (y * width + x) * 4;

      gray[
        y * width + x
      ] =
        0.299 * data[i] +
        0.587 * data[i + 1] +
        0.114 * data[i + 2];
    }
  }

  /*
   * Estimate the brightness of the outside
   * background from the image border.
   */
  const borderSamples: number[] = [];

  const border = Math.max(
    3,
    Math.round(
      Math.min(width, height) * 0.045
    )
  );

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (
        x < border ||
        x >= width - border ||
        y < border ||
        y >= height - border
      ) {
        borderSamples.push(
          gray[y * width + x]
        );
      }
    }
  }

  const background =
    median(borderSamples);

  /*
   * Build a mask for pixels that are
   * sufficiently different from the
   * surrounding background.
   */
  const mask = new Uint8Array(
    width * height
  );

  /*
   * Documents are normally brighter than
   * their surroundings. We also allow a
   * strong difference in either direction.
   */
  const differenceThreshold = 20;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const value =
        gray[y * width + x];

      const difference =
        Math.abs(value - background);

      if (
        difference >
        differenceThreshold
      ) {
        mask[y * width + x] = 1;
      }
    }
  }

  /*
   * Morphological cleanup.
   *
   * Remove tiny isolated pixels and
   * fill small gaps around the document.
   */
  const cleaned =
    new Uint8Array(mask);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let count = 0;

      for (let yy = -1; yy <= 1; yy++) {
        for (let xx = -1; xx <= 1; xx++) {
          count +=
            mask[
              (y + yy) * width +
                (x + xx)
            ];
        }
      }

      if (count >= 5) {
        cleaned[
          y * width + x
        ] = 1;
      } else {
        cleaned[
          y * width + x
        ] = 0;
      }
    }
  }

  /*
   * Find the largest connected component.
   */
  const visited =
    new Uint8Array(
      width * height
    );

  let bestComponent: number[] = [];

  const queueX = new Int32Array(
    width * height
  );

  const queueY = new Int32Array(
    width * height
  );

  for (let startY = 0; startY < height; startY++) {
    for (let startX = 0; startX < width; startX++) {
      const startIndex =
        startY * width + startX;

      if (
        !cleaned[startIndex] ||
        visited[startIndex]
      ) {
        continue;
      }

      let head = 0;
      let tail = 0;

      queueX[tail] = startX;
      queueY[tail] = startY;
      tail++;

      visited[startIndex] = 1;

      const component: number[] = [];

      while (head < tail) {
        const x = queueX[head];
        const y = queueY[head];
        head++;

        component.push(
          y * width + x
        );

        const neighbors = [
          [x + 1, y],
          [x - 1, y],
          [x, y + 1],
          [x, y - 1],
        ];

        for (const [nx, ny] of neighbors) {
          if (
            nx < 0 ||
            nx >= width ||
            ny < 0 ||
            ny >= height
          ) {
            continue;
          }

          const index =
            ny * width + nx;

          if (
            cleaned[index] &&
            !visited[index]
          ) {
            visited[index] = 1;

            queueX[tail] = nx;
            queueY[tail] = ny;
            tail++;
          }
        }
      }

      if (
        component.length >
        bestComponent.length
      ) {
        bestComponent = component;
      }
    }
  }

  /*
   * If segmentation failed, use a safe
   * page-like region instead of returning
   * a tiny middle crop.
   */
  if (
    bestComponent.length <
    width * height * 0.04
  ) {
    const marginX =
      width * 0.04;

    const marginY =
      height * 0.04;

    const fallback = [
      {
        x: marginX,
        y: marginY,
      },
      {
        x: width - marginX,
        y: marginY,
      },
      {
        x: width - marginX,
        y: height - marginY,
      },
      {
        x: marginX,
        y: height - marginY,
      },
    ];

    return {
      corners: fallback.map(
        (point) => ({
          x: point.x / scale,
          y: point.y / scale,
        })
      ),
      confidence: 0.35,
    };
  }

  /*
   * Find extreme points of the largest
   * document-like component.
   *
   * These four extreme directions give
   * us a useful quadrilateral.
   */
  let topLeft = bestComponent[0];
  let topRight = bestComponent[0];
  let bottomRight = bestComponent[0];
  let bottomLeft = bestComponent[0];

  let minSum = Infinity;
  let maxSum = -Infinity;
  let maxDifference = -Infinity;
  let minDifference = Infinity;

  for (const index of bestComponent) {
    const x = index % width;
    const y = Math.floor(index / width);

    const sum = x + y;
    const difference = x - y;

    if (sum < minSum) {
      minSum = sum;
      topLeft = index;
    }

    if (sum > maxSum) {
      maxSum = sum;
      bottomRight = index;
    }

    if (
      difference >
      maxDifference
    ) {
      maxDifference =
        difference;

      topRight = index;
    }

    if (
      difference <
      minDifference
    ) {
      minDifference =
        difference;

      bottomLeft = index;
    }
  }

  const toPoint = (index: number): Point => ({
    x: index % width,
    y: Math.floor(index / width),
  });

  const points = orderCorners([
    toPoint(topLeft),
    toPoint(topRight),
    toPoint(bottomRight),
    toPoint(bottomLeft),
  ]);

  /*
   * Add a very small inward correction.
   * This prevents noisy edge pixels from
   * being selected outside the paper.
   */
  const center = {
    x: points.reduce(
      (sum, p) => sum + p.x,
      0
    ) / 4,
    y: points.reduce(
      (sum, p) => sum + p.y,
      0
    ) / 4,
  };

  const adjusted = points.map(
    (point) => ({
      x:
        point.x +
        (center.x - point.x) *
          0.015,
      y:
        point.y +
        (center.y - point.y) *
          0.015,
    })
  );

  const finalCorners =
    adjusted.map((point) => ({
      x: point.x / scale,
      y: point.y / scale,
    }));

  /*
   * Confidence is based on how much
   * of the image the detected component
   * occupies.
   */
  const areaRatio =
    bestComponent.length /
    (width * height);

  const confidence = clamp(
    0.45 +
      Math.min(
        0.45,
        areaRatio
      ),
    0.35,
    0.95
  );

  return {
    corners: finalCorners,
    confidence,
  };
}

/*
 * Solve an 8x8 linear system for the
 * perspective transformation.
 */
function solveHomography(
  source: Point[],
  destination: Point[]
): number[] {
  const matrix: number[][] = [];

  for (let i = 0; i < 4; i++) {
    const x = source[i].x;
    const y = source[i].y;

    const X = destination[i].x;
    const Y = destination[i].y;

    matrix.push([
      x,
      y,
      1,
      0,
      0,
      0,
      -X * x,
      -X * y,
      X,
    ]);

    matrix.push([
      0,
      0,
      0,
      x,
      y,
      1,
      -Y * x,
      -Y * y,
      Y,
    ]);
  }

  /*
   * Gaussian elimination.
   */
  for (let column = 0; column < 8; column++) {
    let pivot = column;

    for (
      let row = column + 1;
      row < 8;
      row++
    ) {
      if (
        Math.abs(
          matrix[row][column]
        ) >
        Math.abs(
          matrix[pivot][column]
        )
      ) {
        pivot = row;
      }
    }

    if (pivot !== column) {
      const temp =
        matrix[column];

      matrix[column] =
        matrix[pivot];

      matrix[pivot] = temp;
    }

    const divisor =
      matrix[column][column];

    if (Math.abs(divisor) < 1e-10) {
      throw new Error(
        "Unable to calculate document perspective."
      );
    }

    for (
      let j = column;
      j < 9;
      j++
    ) {
      matrix[column][j] /=
        divisor;
    }

    for (
      let row = 0;
      row < 8;
      row++
    ) {
      if (row === column) continue;

      const factor =
        matrix[row][column];

      for (
        let j = column;
        j < 9;
        j++
      ) {
        matrix[row][j] -=
          factor *
          matrix[column][j];
      }
    }
  }

  return [
    matrix[0][8],
    matrix[1][8],
    matrix[2][8],
    matrix[3][8],
    matrix[4][8],
    matrix[5][8],
    matrix[6][8],
    matrix[7][8],
    1,
  ];
}

/*
 * Perspective transform.
 */
function perspectiveScan(
  sourceCanvas: HTMLCanvasElement,
  corners: Point[],
  mode: ScanMode
): string {
  const [
    topLeft,
    topRight,
    bottomRight,
    bottomLeft,
  ] = orderCorners(corners);

  const widthTop =
    distance(
      topLeft,
      topRight
    );

  const widthBottom =
    distance(
      bottomLeft,
      bottomRight
    );

  const heightLeft =
    distance(
      topLeft,
      bottomLeft
    );

  const heightRight =
    distance(
      topRight,
      bottomRight
    );

  const outputWidth = clamp(
    Math.round(
      Math.max(
        widthTop,
        widthBottom
      )
    ),
    500,
    2800
  );

  const outputHeight = clamp(
    Math.round(
      Math.max(
        heightLeft,
        heightRight
      )
    ),
    500,
    3600
  );

  const canvas =
    document.createElement("canvas");

  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const context = canvas.getContext(
    "2d",
    {
      willReadFrequently: true,
    }
  );

  if (!context) {
    throw new Error(
      "Unable to create scan canvas."
    );
  }

  const destination = [
    {
      x: 0,
      y: 0,
    },
    {
      x: outputWidth,
      y: 0,
    },
    {
      x: outputWidth,
      y: outputHeight,
    },
    {
      x: 0,
      y: outputHeight,
    },
  ];

  const source = [
    topLeft,
    topRight,
    bottomRight,
    bottomLeft,
  ];

  const H = solveHomography(
    destination,
    source
  );

  /*
   * Inverse-map every destination pixel
   * back to the original photograph.
   */
  const sourceContext =
    sourceCanvas.getContext(
      "2d",
      {
        willReadFrequently: true,
      }
    );

  if (!sourceContext) {
    throw new Error(
      "Unable to read source image."
    );
  }

  const sourceImage =
    sourceContext.getImageData(
      0,
      0,
      sourceCanvas.width,
      sourceCanvas.height
    );

  const outputImage =
    context.createImageData(
      outputWidth,
      outputHeight
    );

  const sourceData =
    sourceImage.data;

  const outputData =
    outputImage.data;

  for (let y = 0; y < outputHeight; y++) {
    for (
      let x = 0;
      x < outputWidth;
      x++
    ) {
      const denominator =
        H[6] * x +
        H[7] * y +
        H[8];

      const sourceX =
        (H[0] * x +
          H[1] * y +
          H[2]) /
        denominator;

      const sourceY =
        (H[3] * x +
          H[4] * y +
          H[5]) /
        denominator;

      const outputIndex =
        (y * outputWidth + x) * 4;

      if (
        sourceX < 0 ||
        sourceY < 0 ||
        sourceX >=
          sourceCanvas.width - 1 ||
        sourceY >=
          sourceCanvas.height - 1
      ) {
        outputData[
          outputIndex
        ] = 255;

        outputData[
          outputIndex + 1
        ] = 255;

        outputData[
          outputIndex + 2
        ] = 255;

        outputData[
          outputIndex + 3
        ] = 255;

        continue;
      }

      /*
       * Bilinear interpolation.
       */
      const x0 =
        Math.floor(sourceX);

      const y0 =
        Math.floor(sourceY);

      const x1 =
        Math.min(
          x0 + 1,
          sourceCanvas.width - 1
        );

      const y1 =
        Math.min(
          y0 + 1,
          sourceCanvas.height - 1
        );

      const dx =
        sourceX - x0;

      const dy =
        sourceY - y0;

      const i00 =
        (y0 *
          sourceCanvas.width +
          x0) *
        4;

      const i10 =
        (y0 *
          sourceCanvas.width +
          x1) *
        4;

      const i01 =
        (y1 *
          sourceCanvas.width +
          x0) *
        4;

      const i11 =
        (y1 *
          sourceCanvas.width +
          x1) *
        4;

      const r =
        sourceData[i00] *
          (1 - dx) *
          (1 - dy) +
        sourceData[i10] *
          dx *
          (1 - dy) +
        sourceData[i01] *
          (1 - dx) *
          dy +
        sourceData[i11] *
          dx *
          dy;

      const g =
        sourceData[i00 + 1] *
          (1 - dx) *
          (1 - dy) +
        sourceData[i10 + 1] *
          dx *
          (1 - dy) +
        sourceData[i01 + 1] *
          (1 - dx) *
          dy +
        sourceData[i11 + 1] *
          dx *
          dy;

      const b =
        sourceData[i00 + 2] *
          (1 - dx) *
          (1 - dy) +
        sourceData[i10 + 2] *
          dx *
          (1 - dy) +
        sourceData[i01 + 2] *
          (1 - dx) *
          dy +
        sourceData[i11 + 2] *
          dx *
          dy;

      outputData[
        outputIndex
      ] = r;

      outputData[
        outputIndex + 1
      ] = g;

      outputData[
        outputIndex + 2
      ] = b;

      outputData[
        outputIndex + 3
      ] = 255;
    }
  }

  context.putImageData(
    outputImage,
    0,
    0
  );

  /*
   * Color mode.
   */
  if (mode === "color") {
    return canvas.toDataURL(
      "image/jpeg",
      0.96
    );
  }

  const processed =
    context.getImageData(
      0,
      0,
      outputWidth,
      outputHeight
    );

  const pixels =
    processed.data;

  /*
   * Convert to luminance.
   */
  const luminance =
    new Float32Array(
      outputWidth *
        outputHeight
    );

  for (
    let i = 0, p = 0;
    i < pixels.length;
    i += 4, p++
  ) {
    luminance[p] =
      0.299 * pixels[i] +
      0.587 * pixels[i + 1] +
      0.114 * pixels[i + 2];
  }

  /*
   * Estimate paper brightness using
   * bright pixels.
   */
  const brightPixels: number[] = [];

  for (
    let i = 0;
    i < luminance.length;
    i += 20
  ) {
    if (luminance[i] > 170) {
      brightPixels.push(
        luminance[i]
      );
    }
  }

  const paper =
    brightPixels.length
      ? median(brightPixels)
      : 220;

  /*
   * Document enhancement.
   */
  for (
    let y = 0;
    y < outputHeight;
    y++
  ) {
    for (
      let x = 0;
      x < outputWidth;
      x++
    ) {
      const index =
        y * outputWidth + x;

      let value =
        luminance[index];

      /*
       * Normalize the paper toward white.
       */
      if (value > paper - 35) {
        const normalized =
          (value -
            (paper - 35)) /
          35;

        value =
          235 +
          normalized * 20;
      } else {
        /*
         * Preserve darker text while
         * increasing separation.
         */
        value =
          235 -
          ((paper - 35) -
            value) *
            1.35;
      }

      value = clamp(
        value,
        0,
        255
      );

      if (mode === "bw") {
        /*
         * Adaptive-looking document
         * threshold.
         */
        value =
          value > 158
            ? 255
            : 20;
      }

      const i =
        index * 4;

      pixels[i] = value;
      pixels[i + 1] = value;
      pixels[i + 2] = value;
      pixels[i + 3] = 255;
    }
  }

  /*
   * Mild sharpening.
   */
  if (mode === "gray") {
    const copy =
      new Uint8ClampedArray(
        pixels
      );

    for (
      let y = 1;
      y < outputHeight - 1;
      y++
    ) {
      for (
        let x = 1;
        x < outputWidth - 1;
        x++
      ) {
        const index =
          (y * outputWidth + x) *
          4;

        const top =
          ((y - 1) *
            outputWidth +
            x) *
          4;

        const bottom =
          ((y + 1) *
            outputWidth +
            x) *
          4;

        const left =
          (y *
            outputWidth +
            x -
            1) *
          4;

        const right =
          (y *
            outputWidth +
            x +
            1) *
          4;

        const surrounding =
          (
            copy[top] +
            copy[bottom] +
            copy[left] +
            copy[right]
          ) / 4;

        const sharpened =
          copy[index] +
          (copy[index] -
            surrounding) *
            0.22;

        pixels[index] =
          clamp(
            sharpened,
            0,
            255
          );

        pixels[index + 1] =
          pixels[index];

        pixels[index + 2] =
          pixels[index];
      }
    }
  }

  context.putImageData(
    processed,
    0,
    0
  );

  return canvas.toDataURL(
    "image/jpeg",
    0.96
  );
}

export default function ScannerPage() {

  

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const videoRef =
    useRef<HTMLVideoElement>(null);

  const streamRef =
    useRef<MediaStream | null>(null);

  const [image, setImage] =
    useState<string | null>(null);

  const [scannedImage, setScannedImage] =
    useState<string | null>(null);

  const [cameraOpen, setCameraOpen] =
    useState(false);

  const [cameraReady, setCameraReady] =
    useState(false);

  const [cameraError, setCameraError] =
    useState("");

  const [processing, setProcessing] =
    useState(false);

  const [corners, setCorners] =
    useState<Point[]>([]);

  const [confidence, setConfidence] =
    useState(0);

  const [scanMode, setScanMode] =
    useState<ScanMode>("gray");

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) =>
          track.stop()
        );

      streamRef.current = null;
    }

    setCameraReady(false);
  }

  async function openCamera() {
    setCameraError("");

    try {
      stopCamera();

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: {
              facingMode: {
                ideal: "environment",
              },
              width: {
                ideal: 1920,
              },
              height: {
                ideal: 1080,
              },
            },
            audio: false,
          }
        );

      streamRef.current =
        stream;

      setCameraOpen(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject =
            stream;

          videoRef.current
            .play()
            .catch(() => {});

          setCameraReady(true);
        }
      }, 100);
    } catch {
      setCameraError(
        "Camera access was not available. Please allow camera permission or upload an image instead."
      );
    }
  }

  function closeCamera() {
    stopCamera();
    setCameraOpen(false);
  }

  function capturePhoto() {
    const video =
      videoRef.current;

    if (
      !video ||
      !video.videoWidth ||
      !video.videoHeight
    ) {
      return;
    }

    const canvas =
      document.createElement("canvas");

    canvas.width =
      video.videoWidth;

    canvas.height =
      video.videoHeight;

    const context =
      canvas.getContext("2d");

    if (!context) return;

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const data =
      canvas.toDataURL(
        "image/jpeg",
        0.96
      );

    setImage(data);
    closeCamera();
  }

  function handleFile(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert(
        "Please select an image file."
      );
      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      if (
        typeof reader.result ===
        "string"
      ) {
        setImage(
          reader.result
        );
        setScannedImage(null);
        setCorners([]);
      }
    };

    reader.readAsDataURL(file);
  }

  function loadImage(
    source: string
  ): Promise<HTMLImageElement> {
    return new Promise(
      (resolve, reject) => {
        const img =
          new Image();

        img.onload = () =>
          resolve(img);

        img.onerror = () =>
          reject(
            new Error(
              "Unable to load image."
            )
          );

        img.src = source;
      }
    );
  }

  async function scanDocument() {
    if (!image) return;

    setProcessing(true);
    setScannedImage(null);

    try {
      const img =
        await loadImage(image);

      /*
       * Keep the source at a sensible
       * processing size.
       */
      const maxSize = 2400;

      const scale = Math.min(
        1,
        maxSize /
          Math.max(
            img.naturalWidth,
            img.naturalHeight
          )
      );

      const canvas =
        document.createElement(
          "canvas"
        );

      canvas.width = Math.max(
        1,
        Math.round(
          img.naturalWidth * scale
        )
      );

      canvas.height = Math.max(
        1,
        Math.round(
          img.naturalHeight * scale
        )
      );

      const context =
        canvas.getContext(
          "2d",
          {
            willReadFrequently: true,
          }
        );

      if (!context) {
        throw new Error(
          "Unable to process image."
        );
      }

      context.drawImage(
        img,
        0,
        0,
        canvas.width,
        canvas.height
      );

      /*
       * Detect the actual document.
       */
const detection =
  detectDocument(canvas);

let scanCorners =
  detection.corners;

/*
 * Check how much of the original image
 * the detected document occupies.
 *
 * If the detector accidentally finds text,
 * a table, or another object in the middle
 * of the image, the detected area will be
 * suspiciously small.
 */
const xs = scanCorners.map(
  (point) => point.x
);

const ys = scanCorners.map(
  (point) => point.y
);

const detectedWidth =
  Math.max(...xs) -
  Math.min(...xs);

const detectedHeight =
  Math.max(...ys) -
  Math.min(...ys);

const imageArea =
  canvas.width *
  canvas.height;

const detectedArea =
  detectedWidth *
  detectedHeight;

const areaRatio =
  detectedArea /
  imageArea;

/*
 * How close the detected document is
 * to the edges of the photograph.
 */
const touchesLeft =
  Math.min(...xs) <
  canvas.width * 0.08;

const touchesRight =
  Math.max(...xs) >
  canvas.width * 0.92;

const touchesTop =
  Math.min(...ys) <
  canvas.height * 0.08;

const touchesBottom =
  Math.max(...ys) >
  canvas.height * 0.92;

/*
 * If detection is too small, use the
 * complete image instead of producing a
 * bad middle crop.
 *
 * This is particularly important for
 * uploaded photos and screenshots.
 */
const suspiciousDetection =
  areaRatio < 0.45 ||
  detection.confidence < 0.48;

/*
 * If the detected page is already almost
 * the entire image, simply use the complete
 * image. This prevents unnecessary cropping.
 */
const nearlyFullImage =
  areaRatio > 0.82 &&
  touchesLeft &&
  touchesRight &&
  touchesTop &&
  touchesBottom;

if (
  suspiciousDetection ||
  nearlyFullImage
) {
  const margin = 2;

  scanCorners = [
    {
      x: margin,
      y: margin,
    },
    {
      x: canvas.width - margin,
      y: margin,
    },
    {
      x: canvas.width - margin,
      y: canvas.height - margin,
    },
    {
      x: margin,
      y: canvas.height - margin,
    },
  ];
}

setCorners(scanCorners);

setConfidence(
  suspiciousDetection
    ? 0.55
    : detection.confidence
);

/*
 * Perspective-correct and clean.
 */
const result =
  perspectiveScan(
    canvas,
    scanCorners,
    scanMode
  );

setScannedImage(result);


    } catch (error) {
      console.error(
        "Scanner error:",
        error
      );

      alert(
        "SharpKit could not detect the document clearly. Try a photo where the entire document is visible with some background around it."
      );
    } finally {
      setProcessing(false);
    }
  }

  function resetScanner() {
    setImage(null);
    setScannedImage(null);
    setCorners([]);
    setConfidence(0);

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }
  }

  function downloadScan() {
    if (!scannedImage) return;

    const link =
      document.createElement("a");

    link.href =
      scannedImage;

    link.download =
      `sharpkit-scan-${Date.now()}.jpg`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(
      link
    );
  }

  async function downloadScannedPdf() {
  if (!scannedImage) {
    alert("Please scan a document first.");
    return;
  }

  try {
    const response =
      await fetch(scannedImage);

    const imageBytes =
      await response.arrayBuffer();

    const pdf =
      await PDFDocument.create();

    const image =
      await pdf.embedJpg(
        new Uint8Array(imageBytes)
      );

    const imageWidth =
      image.width;

    const imageHeight =
      image.height;

    const A4_WIDTH =
      595.28;

    const A4_HEIGHT =
      841.89;

    const margin = 24;

    const availableWidth =
      A4_WIDTH - margin * 2;

    const availableHeight =
      A4_HEIGHT - margin * 2;

    const imageRatio =
      imageWidth / imageHeight;

    const pageRatio =
      availableWidth /
      availableHeight;

    let drawWidth: number;
    let drawHeight: number;

    if (imageRatio > pageRatio) {
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

    const page =
      pdf.addPage([
        A4_WIDTH,
        A4_HEIGHT,
      ]);

    const x =
      (A4_WIDTH - drawWidth) /
      2;

    const y =
      (A4_HEIGHT - drawHeight) /
      2;

    page.drawImage(image, {
      x,
      y,
      width: drawWidth,
      height: drawHeight,
    });

    const pdfBytes =
      await pdf.save();

    const blob =
      new Blob(
        [Uint8Array.from(pdfBytes)],
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
      "sharpkit-scanned-document.pdf";

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error(
      "PDF creation error:",
      error
    );

    alert(
      "Unable to create the PDF. Please try scanning the document again."
    );
  }
}

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            ← Back to SharpKit
          </Link>
        </div>

        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">
            SharpKit Scanner
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Scan Documents Online
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Turn a photo of a document into
            a clean scanned copy directly in
            your browser.
          </p>
        </div>

        {!image && !cameraOpen && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
            <div className="mx-auto max-w-xl text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50 text-4xl">
                📄
              </div>

              <h2 className="text-2xl font-bold text-slate-900">
                Add your document
              </h2>

              <p className="mt-2 text-slate-500">
                Take a photo or upload an
                existing document image.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={openCamera}
                  className="rounded-xl bg-emerald-600 px-5 py-4 font-semibold text-white transition hover:bg-emerald-700"
                >
                  📷 Use Camera
                </button>

                <label
                  htmlFor="document-upload"
                  className="cursor-pointer rounded-xl border border-slate-300 bg-white px-5 py-4 font-semibold text-slate-800 transition hover:bg-slate-50"
                >
                  📁 Upload Image
                </label>
              </div>

              <input
                ref={fileInputRef}
                id="document-upload"
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="hidden"
              />

              {cameraError && (
                <p className="mt-4 text-sm text-red-600">
                  {cameraError}
                </p>
              )}
            </div>
          </div>
        )}

        {cameraOpen && (
          <div className="overflow-hidden rounded-3xl bg-slate-950 shadow-xl">
            <div className="relative aspect-[3/4] sm:aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-contain"
              />

              {!cameraReady && (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  Starting camera...
                </div>
              )}

              <div className="pointer-events-none absolute inset-5 rounded-2xl border-2 border-dashed border-white/80" />
            </div>

            <div className="flex gap-3 p-4">
              <button
                type="button"
                onClick={closeCamera}
                className="flex-1 rounded-xl bg-white/10 px-5 py-4 font-semibold text-white hover:bg-white/20"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={capturePhoto}
                disabled={!cameraReady}
                className="flex-1 rounded-xl bg-emerald-500 px-5 py-4 font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
              >
                Capture
              </button>
            </div>
          </div>
        )}

        {image && !scannedImage && !processing && (
          <div className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-4">
                <h2 className="font-semibold text-slate-900">
                  Document Preview
                </h2>
              </div>

              <div className="relative flex justify-center bg-slate-100 p-4 sm:p-8">
                <div className="relative max-h-[70vh] max-w-full">
                  <img
                    src={image}
                    alt="Document preview"
                    className="max-h-[65vh] max-w-full rounded-lg object-contain shadow-md"
                  />

                  {corners.length === 4 && (
                    <svg
                      className="pointer-events-none absolute inset-0 h-full w-full"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                    >
                      <polygon
                        points={corners
                          .map(
                            (point) =>
                              `${(point.x /
                                2400) *
                                100},${(point.y /
                                1600) *
                                100}`
                          )
                          .join(" ")}
                        fill="rgba(16,185,129,0.10)"
                        stroke="rgb(16,185,129)"
                        strokeWidth="0.7"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900">
                Scan style
              </h3>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setScanMode("color")
                  }
                  className={`rounded-xl border px-3 py-3 text-sm font-semibold ${
                    scanMode === "color"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  Color
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setScanMode("gray")
                  }
                  className={`rounded-xl border px-3 py-3 text-sm font-semibold ${
                    scanMode === "gray"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  Grayscale
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setScanMode("bw")
                  }
                  className={`rounded-xl border px-3 py-3 text-sm font-semibold ${
                    scanMode === "bw"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  B&W
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={scanDocument}
                className="rounded-xl bg-emerald-600 px-5 py-4 font-bold text-white shadow-sm transition hover:bg-emerald-700"
              >
                Scan Document
              </button>

              <button
                type="button"
                onClick={resetScanner}
                className="rounded-xl border border-slate-300 bg-white px-5 py-4 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Choose Another
              </button>
            </div>
          </div>
        )}

        {processing && (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

            <h2 className="text-xl font-bold text-slate-900">
              Scanning document...
            </h2>

            <p className="mt-2 text-slate-500">
              Detecting the page, correcting
              perspective and cleaning the scan.
            </p>
          </div>
        )}

        {scannedImage && !processing && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 p-4">
                <div>
                  <h2 className="font-bold text-slate-900">
                    Scan Complete
                  </h2>

                  <p className="text-sm text-slate-500">
                    Your document has been
                    perspective-corrected and
                    processed.
                  </p>
                </div>

                <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {Math.round(
                    confidence * 100
                  )}
                  % detection
                </div>
              </div>

              <div className="flex justify-center bg-slate-100 p-4 sm:p-8">
                <img
                  src={scannedImage}
                  alt="Scanned document"
                  className="max-h-[75vh] max-w-full rounded-md bg-white shadow-xl"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={downloadScan}
                className="rounded-xl bg-emerald-600 px-5 py-4 font-bold text-white hover:bg-emerald-700"
              >
                Download Scan
              </button>

              <button
                type="button"
                onClick={downloadScannedPdf}
                className="rounded-xl bg-zinc-950 px-5 py-4 font-bold text-white transition hover:bg-zinc-800"
              >
                Download PDF
              </button>

              <button
                type="button"
                onClick={resetScanner}
                className="rounded-xl border border-slate-300 bg-white px-5 py-4 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Scan Another Document
              </button>
            </div>
          </div>
        )}

        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">
            Privacy
          </p>

          <p className="mt-1">
            Your document is processed directly
            in your browser. SharpKit does not
            upload the image to a server for
            scanning.
          </p>
        </div>
      </div>
    </main>
  );
}

