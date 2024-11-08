import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IAIAssist } from "@/models/IAIAssist";
import { jsPDF } from "jspdf";
import { useState } from "react";

interface PdfPreviewProps {
  content: string;
  extraInformation: IAIAssist | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: () => void;
}

export function PdfPreview({
  content,
  open,
  extraInformation,
  onOpenChange,
  onDownload,
}: PdfPreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const buildCoverLetterTemplate = (value: string, header: IAIAssist | null) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Cover Letter</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            border-radius: 8px;
          }
          .header,
          .footer {
            text-align: right;
            margin-bottom: 20px;
          }
          .contact-info {
            margin-bottom: 40px;
          }
          .main-content {
            margin-bottom: 20px;
          }
          .body {
            margin-bottom: 20px;
            margin-top: 20px;
          }
          .body p {
            text-align: justify;
          }
        </style>
      </head>
      <body>
        <div class="container">
          ${
            header?.name
              ? `
            <div class="header">
              <strong>${header.name}</strong> <br />
              ${header.role || ""}
            </div>
          `
              : ""
          }

          <div class="contact-info">
            ${
              header?.name
                ? `<strong>${header.address || ""}</strong> <br />`
                : ""
            }
            ${header?.email ? `Email: ${header.email} <br />` : ""}
            ${header?.phone ? `Phone: ${header.phone} <br />` : ""}
            ${header?.linkedin ? `LinkedIn: ${header.linkedin} <br />` : ""}
            ${header?.website ? `Website: ${header.website} <br />` : ""}
          </div>
          
          <div class="recipient-info">
            ${header?.companyName ? `<strong>${header.companyName}</strong> <br />` : ""}
            ${header?.hrName ? `${header.hrName} <br />` : ""}
            ${header?.companyAddress ? `${header.companyAddress}` : ""}
          </div>

          <div class="main-content">
            <div class="body">
              ${value.split("\n").map((line) => `<p>${line}</p>`).join("")}
            </div>
          </div>

        </div>
      </body>
    </html>
  `;
  const handleGeneratePDF = async () => {
    try {
      setIsGenerating(true);
      const element = document.getElementById("pdf-content");
      if (!element) return;

      const pdf = new jsPDF("p", "pt", "a4");

      await pdf.html(element, {
        callback: function (pdf) {
          pdf.save("cover-letter.pdf");
          onDownload();
          setIsGenerating(false);
        },
        x: 10,
        y: 10,
        html2canvas: {
          scale: 0.8,
        },
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Cover Letter Preview</DialogTitle>
        </DialogHeader>
        <div className="bg-white p-8 rounded-lg shadow min-h-[500px] max-h-[600px] overflow-y-auto">
          <div
            id="pdf-content"
            className="prose max-w-none"
            dangerouslySetInnerHTML={{
              __html: buildCoverLetterTemplate(content, extraInformation),
            }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Edit
          </Button>
          <Button onClick={handleGeneratePDF} disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Download PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
