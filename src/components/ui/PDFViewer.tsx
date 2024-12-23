"use client";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
// import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

interface PdfViewerProps {
  fileUrl: string;
}
const PdfViewer: React.FC<PdfViewerProps> = ({ fileUrl }) => {
  // const defaultLayoutPluginInstance = defaultLayoutPlugin();
  return (
    <div className="flex h-[100svh] w-[90svw] items-center justify-center p-4 pt-8">
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <Viewer fileUrl={fileUrl}  />
      </Worker>
    
    </div>
  );
};
export default PdfViewer;
