let cvPromise: Promise<OpenCV> | null = null;

export type OpenCV = {
  Mat: new () => OpenCVMat;
  MatVector: new () => OpenCVMatVector;
  Size: new (width: number, height: number) => OpenCVSize;

  imread: (source: HTMLCanvasElement) => OpenCVMat;

  cvtColor: (
    src: OpenCVMat,
    dst: OpenCVMat,
    code: number
  ) => void;

  GaussianBlur: (
    src: OpenCVMat,
    dst: OpenCVMat,
    ksize: OpenCVSize,
    sigmaX: number,
    sigmaY: number,
    borderType: number
  ) => void;

  Canny: (
    src: OpenCVMat,
    dst: OpenCVMat,
    threshold1: number,
    threshold2: number
  ) => void;

  findContours: (
    image: OpenCVMat,
    contours: OpenCVMatVector,
    hierarchy: OpenCVMat,
    mode: number,
    method: number
  ) => void;

  contourArea: (contour: OpenCVMat) => number;

  arcLength: (
    curve: OpenCVMat,
    closed: boolean
  ) => number;

  approxPolyDP: (
    curve: OpenCVMat,
    approxCurve: OpenCVMat,
    epsilon: number,
    closed: boolean
  ) => void;

  COLOR_RGBA2GRAY: number;
  BORDER_DEFAULT: number;
  RETR_LIST: number;
  CHAIN_APPROX_SIMPLE: number;

  onRuntimeInitialized?: () => void;
};

export type OpenCVMat = {
  rows: number;
  cols: number;
  intPtr: (row: number, col: number) => number[];
  delete: () => void;
};

export type OpenCVMatVector = {
  size: () => number;
  get: (index: number) => OpenCVMat;
  delete: () => void;
};

export type OpenCVSize = {
  width: number;
  height: number;
};

declare global {
  interface Window {
    cv?: OpenCV;
  }
}

export function loadOpenCV(): Promise<OpenCV> {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("OpenCV can only run in the browser.")
    );
  }

  if (cvPromise) {
    return cvPromise;
  }

  cvPromise = new Promise<OpenCV>((resolve, reject) => {
    let settled = false;

    const succeed = (cv: OpenCV) => {
      if (settled) return;

      settled = true;

      console.log("SharpKit: OpenCV runtime ready.");

      resolve(cv);
    };

    const fail = (message: string) => {
      if (settled) return;

      settled = true;

      console.error("SharpKit OpenCV error:", message);

      reject(new Error(message));
    };

    const waitForRuntime = () => {
      const started = Date.now();

      const check = () => {
        const cv = window.cv;

        if (cv) {
          console.log("SharpKit: window.cv detected.");

          if (typeof cv.onRuntimeInitialized === "function") {
            const originalHandler = cv.onRuntimeInitialized;

            cv.onRuntimeInitialized = () => {
              try {
                originalHandler();
              } catch {
                // Ignore existing OpenCV handler errors.
              }

              succeed(cv);
            };
          } else {
            succeed(cv);
          }

          return;
        }

        if (Date.now() - started > 15000) {
          fail(
            "OpenCV.js loaded, but the OpenCV runtime did not initialize."
          );
          return;
        }

        window.setTimeout(check, 100);
      };

      check();
    };

    if (window.cv) {
      console.log("SharpKit: OpenCV already exists.");

      succeed(window.cv);

      return;
    }

    const existingScript = document.querySelector(
      'script[data-sharpkit-opencv="true"]'
    );

    if (existingScript) {
      console.log("SharpKit: OpenCV script already exists.");

      waitForRuntime();

      return;
    }

    console.log("SharpKit: Loading OpenCV.js...");

    const script = document.createElement("script");

    script.src = "https://docs.opencv.org/4.x/opencv.js";
    script.async = true;

    script.setAttribute(
      "data-sharpkit-opencv",
      "true"
    );

    script.onload = () => {
      console.log("SharpKit: OpenCV.js downloaded.");

      waitForRuntime();
    };

    script.onerror = () => {
      fail(
        "OpenCV.js could not be downloaded. Please check your internet connection."
      );
    };

    document.head.appendChild(script);
  });

  return cvPromise;
}