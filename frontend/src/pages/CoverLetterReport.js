import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Download,
  Edit,
  Share2,
  Lightbulb,
  Star,
  FileText,
} from "lucide-react";
import jsPDF from "jspdf";

export default function CoverLetterReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [coverLetter, setCoverLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const letterRef = useRef(null);

  useEffect(() => {
    const fetchCoverLetter = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/api/cover-letters/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setCoverLetter(res.data.data);
        } else {
          setError(res.data.message || "Failed to fetch cover letter");
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch cover letter, please try again"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchCoverLetter();
  }, [id]);

  const handleDownload = async () => {
    if (!coverLetter) return;

    try {
      // Create PDF document
      const doc = new jsPDF({
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      });

      // Set page margins
      const margin = 25;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const contentWidth = pageWidth - margin * 2;

      // Add date
      const formattedDate = new Date(coverLetter.createdAt).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );
      doc.setFontSize(10);
      doc.text(formattedDate, pageWidth - margin, margin, { align: "right" });

      // Add recipient
      doc.setFontSize(12);
      doc.text(coverLetter.recipient, margin, margin + 10);

      // Add subject
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(coverLetter.subject, margin, margin + 20);

      // Add content
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      let y = margin + 30;
      const lineHeight = 7;

      // Process paragraphs
      coverLetter.paragraphs.forEach((paragraph) => {
        // Split long text to fit page width
        const lines = doc.splitTextToSize(paragraph, contentWidth);
        lines.forEach((line) => {
          if (y > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, margin, y);
          y += lineHeight;
        });
        y += lineHeight; // Paragraph spacing
      });

      // Add closing and signature
      y += lineHeight;
      doc.text(coverLetter.closing, margin, y);
      y += lineHeight * 2;
      doc.setFont("helvetica", "bold");
      doc.text(coverLetter.signature, margin, y);

      // Save PDF
      doc.save(`Cover_Letter_${coverLetter.subject}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("PDF generation failed, please try again");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        <span className="ml-3 text-black">Loading cover letter...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-16 bg-red-50 rounded-lg p-6">
        <div className="flex items-center">
          <FileText className="text-red-500 mr-2" />
          <div>
            <h3 className="text-lg font-medium text-red-800">Loading Failed</h3>
            <p className="text-red-700">{error}</p>
            <button
              className="mt-2 text-red-600 hover:underline"
              onClick={() => navigate(-1)}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!coverLetter) return null;

  const formattedDate = new Date(coverLetter.createdAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <div className="bg-white min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {coverLetter.subject}
            </h1>
            <p className="text-gray-500 mt-2">
              Created on {formattedDate} · Using {coverLetter.model}
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 gap-1">
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black text-white hover:bg-gray-800 h-9 px-4 gap-1"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>
          </div>
        </div>

        <div className="relative">
          {/* Letter body */}
          <div className="bg-white border rounded-lg shadow-sm overflow-hidden relative mx-auto max-w-3xl">
            {/* Letter background */}
            <div className="bg-[#fffdf8] bg-opacity-70 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBmaWxsPSIjZmZmZmZmMDUiIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBhMSAxIDAgMTEtMi4wMDEtLjAwMUExIDEgMCAwMTMwIDMweiIgZmlsbD0iIzIxMjEyMTA1IiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48L2c+PC9zdmc+')]">
              {/* Letter header */}
              <div className="border-b pt-8 pb-6 px-10 md:px-16">
                <div className="text-right mb-4">
                  <p className="text-gray-500 text-sm">{formattedDate}</p>
                </div>
                <div className="mb-4">
                  <p className="font-medium">{coverLetter.recipient}</p>
                </div>
                <div>
                  <p className="font-medium">Subject: {coverLetter.subject}</p>
                </div>
              </div>

              {/* Letter content */}
              <div className="p-10 md:p-16 pt-8 space-y-5 font-serif">
                {coverLetter.paragraphs.map((paragraph, index) => (
                  <p key={index} className="text-gray-800 leading-relaxed">
                    {paragraph}
                  </p>
                ))}

                <div className="mt-12 pt-4">
                  <p className="mb-4">{coverLetter.closing}</p>
                  <p className="font-medium">{coverLetter.signature}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Highlights - Right Side */}
          <div className="absolute right-0 top-10 translate-x-1/2 md:translate-x-3/4 transform space-y-3 max-w-xs hidden md:block">
            {coverLetter.highlights?.map((highlight, index) => (
              <div
                key={`highlight-${index}`}
                className={`bg-yellow-100 p-3 rounded-lg shadow-md border border-yellow-200 rotate-${
                  index % 2 === 0 ? "2" : "-2"
                } transform transition-transform hover:scale-105`}
                style={{
                  transform: `rotate(${
                    (index % 2 === 0 ? 2 : -2) + (index - 2) * 0.5
                  }deg)`,
                  zIndex: 10 - index,
                }}
              >
                <div className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-medium">{highlight}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Improvement Suggestions - Left Side */}
          <div className="absolute left-0 top-1/3 -translate-x-1/2 md:-translate-x-3/4 transform space-y-3 max-w-xs hidden md:block">
            {coverLetter.suggestions?.slice(0, 3).map((suggestion, index) => (
              <div
                key={`suggestion-${index}`}
                className={`bg-blue-50 p-3 rounded-lg shadow-md border border-blue-100 rotate-${
                  index % 2 === 0 ? "-2" : "2"
                } transform transition-transform hover:scale-105`}
                style={{
                  transform: `rotate(${
                    (index % 2 === 0 ? -2 : 2) + (index - 1) * 0.5
                  }deg)`,
                  zIndex: 10 - index,
                }}
              >
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{suggestion}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Highlights and Suggestions */}
        <div className="md:hidden mt-8 space-y-6">
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg">
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Star className="h-5 w-5 text-yellow-500 mr-2" />
                Highlights
              </h3>
              <ul className="space-y-2">
                {coverLetter.highlights?.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="min-w-4 mt-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-yellow-500 mt-1"></div>
                    </div>
                    <span className="text-sm">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg">
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Lightbulb className="h-5 w-5 text-blue-500 mr-2" />
                Improvement Suggestions
              </h3>
              <ul className="space-y-2">
                {coverLetter.suggestions?.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="min-w-4 mt-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1"></div>
                    </div>
                    <span className="text-sm">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
