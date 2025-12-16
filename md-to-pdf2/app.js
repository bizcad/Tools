
/* md-to-pdf: glue code for Markdown → HTML → PDF (CDN-only) */

// —— State ——
let currentMdFileName = "document.md";
let outputDirHandle = null; // File System Access API directory handle (optional)

// —— Elements ——
const mdInput       = document.getElementById("mdInput");
const htmlPreview   = document.getElementById("htmlPreview");
const fileInput     = document.getElementById("fileInput");
const dropZone      = document.getElementById("dropZone");
const renderBtn     = document.getElementById("renderBtn");
const exportBtn     = document.getElementById("exportBtn");
const chooseFolderBtn = document.getElementById("chooseFolderBtn");
const pdfIframe     = document.getElementById("pdfIframe");
const usePdfJs      = document.getElementById("usePdfJs");
const pdfjsContainer= document.getElementById("pdfjsContainer");
const pdfjsViewer   = document.getElementById("pdfjsViewer");

// —— Optional: PDF.js worker (only if user enables the PDF.js viewer) ——
// We set this when the checkbox is turned on; keeps page lighter by default.
function ensurePdfJsWorker() {
  if (window.pdfjsLib) {
    // Version must match the CDN version we loaded.
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js";
  }
}

// —— Markdown → HTML preview ——
function renderMarkdownToHtml() {
  const md = mdInput.value || "";
  // If you want sanitization for untrusted markdown, add DOMPurify and replace this line with:
  // const safeHtml = DOMPurify.sanitize(marked.parse(md));
  const html = marked.parse(md); // Marked exposes `marked.parse` in UMD build
  htmlPreview.innerHTML = html;
}

// —— File input handling ——
fileInput.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  await loadMarkdownFile(file);
});

async function loadMarkdownFile(file) {
  currentMdFileName = file.name || "document.md";
  const text = await file.text();
  mdInput.value = text;
  renderMarkdownToHtml();
}

// —— Drag & drop handling ——
;["dragenter","dragover"].forEach(evt =>
  dropZone.addEventListener(evt, (e) => { e.preventDefault(); dropZone.classList.add("hover"); })
);
;["dragleave","drop"].forEach(evt =>
  dropZone.addEventListener(evt, (e) => { e.preventDefault(); dropZone.classList.remove("hover"); })
);
dropZone.addEventListener("drop", async (e) => {
  const file = e.dataTransfer?.files?.[0];
  if (!file) return;            // If a "file location string" is dropped, browsers don't provide a path for security.
  await loadMarkdownFile(file);
});

// —— Clipboard paste into the Markdown editor ——
mdInput.addEventListener("paste", (e) => {
  // Prefer text; if a file is pasted (some OSes allow), handle that too.
  const items = e.clipboardData?.items || [];
  for (const item of items) {
    if (item.kind === "file") {
      const file = item.getAsFile();
      if (file) { loadMarkdownFile(file); return; }
    }
  }
  // Otherwise default paste behavior; re-render after a microtask.
  setTimeout(renderMarkdownToHtml, 0);
});

// —— Buttons ——
renderBtn.addEventListener("click", renderMarkdownToHtml);

exportBtn.addEventListener("click", async () => {
  await exportToPdfAndPreview();
});

chooseFolderBtn.addEventListener("click", async () => {
  if (!window.showDirectoryPicker) {
    alert("Your browser does not support choosing a folder. Use the download button after export.");
    return;
  }
  try {
    outputDirHandle = await window.showDirectoryPicker();
    alert("Output folder set. Future exports will save directly there.");
  } catch (err) {
    console.error(err);
    alert("Folder selection cancelled.");
  }
});

usePdfJs.addEventListener("change", () => {
  const enabled = usePdfJs.checked;
  pdfIframe.classList.toggle("hidden", enabled);
  pdfjsContainer.classList.toggle("hidden", !enabled);
  if (enabled) ensurePdfJsWorker();
});

// —— HTML → PDF via html2pdf.js ——
async function exportToPdfAndPreview() {
  // Use the HTML preview node; ensure it’s current
  renderMarkdownToHtml();

  const baseName = (currentMdFileName || "document.md").replace(/\.[^.]+$/, "") || "document";
  const pdfName = `${baseName}.pdf`;

  // html2pdf options: US Letter portrait, light margins, good quality
  const opt = {
    margin:       10,              // px
    filename:     pdfName,
    image:        { type: "jpeg", quality: 0.95 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: "pt", format: "letter", orientation: "portrait" },
    pagebreak:    { mode: ["css", "legacy"] } // allow CSS-driven page breaks
  };

  // Use the promise chain to get the jsPDF instance for Blob
  const worker = html2pdf().from(htmlPreview).set(opt).toPdf();
  const pdf = await worker.get("pdf");
  const blob = pdf.output("blob");
  const blobUrl = URL.createObjectURL(blob);

  // Preview: either native iframe or PDF.js
  if (!usePdfJs.checked) {
    pdfIframe.src = blobUrl;
  } else {
    await renderPdfWithPdfJs(blob);
  }

  // Save: if a folder was chosen, write there; else trigger download
  if (outputDirHandle && window.isSecureContext) {
    try {
      await saveBlobToFolder(outputDirHandle, pdfName, blob);
    } catch (err) {
      console.error(err);
      triggerDownloadFallback(blobUrl, pdfName);
    }
  } else {
    triggerDownloadFallback(blobUrl, pdfName);
  }
}

// —— PDF.js rendering (optional) ——
async function renderPdfWithPdfJs(blob) {
  if (!window.pdfjsLib) {
    alert("PDF.js not loaded yet. Please wait or uncheck the PDF.js viewer option.");
    return;
  }
  ensurePdfJsWorker();
  // Convert Blob to typed array
  const arrayBuffer = await blob.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);

  // Load document
  const loadingTask = window.pdfjsLib.getDocument({ data: uint8 });
  const pdfDoc = await loadingTask.promise;

  // Clear viewer
  pdfjsViewer.innerHTML = "";

  // Render first few pages (or all if small)
  const maxPagesToRender = Math.min(pdfDoc.numPages, 5); // demo-friendly
  for (let pageNum = 1; pageNum <= maxPagesToRender; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.2 });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const renderContext = { canvasContext: ctx, viewport };
    await page.render(renderContext).promise;
    pdfjsViewer.appendChild(canvas);
  }
}

// —— Save via File System Access API ——
async function saveBlobToFolder(dirHandle, fileName, blob) {
  // Request write permission
  const perm = await dirHandle.requestPermission({ mode: "readwrite" });
  if (perm !== "granted") throw new Error("Permission denied");

  // Create or overwrite
  const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
}

// —— Fallback: download via anchor ——
function triggerDownloadFallback(url, fileName) {
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// —— Initial render placeholder ——
mdInput.value = `# Hello, Nick 👋

Paste a Markdown file or text on the left, then click **Render HTML** or **Export to PDF**.

- Uses **Marked** for Markdown → HTML
- Uses **html2pdf.js** for HTML → PDF
- Optional **PDF.js** viewer if you prefer canvas rendering

\`\`\`csharp
// Your Blazor snippet here…
Console.WriteLine("Hello md-to-pdf!");
\`\`\`
`;
renderMarkdownToHtml();
``
