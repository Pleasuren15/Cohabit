"use client"

import { forwardRef, useMemo } from "react"
import {
  buildContractSections,
  CONTRACT_TYPE_LABELS,
  type ContractDraft,
} from "@/lib/contracts"
import { PDF_CONTENT_WIDTH_PX } from "@/lib/contract-pdf"
import { cn } from "@/lib/utils"

interface ContractDocumentProps {
  draft: ContractDraft
  className?: string
}

/**
 * Styled contract document used for both the on-screen preview and the PDF
 * capture. Styles are inline so the capture (html2canvas) is consistent
 * regardless of the app's colour scheme.
 */
export const ContractDocument = forwardRef<
  HTMLDivElement,
  ContractDocumentProps
>(function ContractDocument({ draft, className }, ref) {
  const sections = useMemo(() => buildContractSections(draft), [draft])

  return (
    <div
      ref={ref}
      className={cn("overflow-hidden rounded-xl", className)}
      style={{
        width: PDF_CONTENT_WIDTH_PX,
        background: "#ffffff",
        color: "#0f172a",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg,#2563eb,#0ea5e9)",
          color: "#ffffff",
          padding: "28px 32px",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 11,
            letterSpacing: 2,
            textTransform: "uppercase",
            opacity: 0.85,
          }}
        >
          Cohabit — Shared Living
        </p>
        <h2
          style={{
            margin: "6px 0 0",
            fontSize: 24,
            fontWeight: 700,
            lineHeight: 1.2,
          }}
        >
          {CONTRACT_TYPE_LABELS[draft.type]}
        </h2>
      </div>

      <div style={{ padding: "28px 32px 32px" }}>
        <p style={{ margin: "0 0 20px", fontSize: 12, color: "#475569" }}>
          Agreement date: {draft.agreementDate || "__________"}
        </p>
        {sections.map((section) => (
          <section key={section.heading} style={{ marginBottom: 18 }}>
            <h3
              style={{
                margin: "0 0 6px",
                fontSize: 13,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                color: "#1e3a8a",
              }}
            >
              {section.heading}
            </h3>
            {Array.isArray(section.body) ? (
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {section.body.map((item, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: 12.5,
                      lineHeight: 1.6,
                      color: "#1e293b",
                      marginBottom: 4,
                    }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p
                style={{
                  margin: 0,
                  fontSize: 12.5,
                  lineHeight: 1.6,
                  color: "#1e293b",
                }}
              >
                {section.body}
              </p>
            )}
          </section>
        ))}
      </div>
    </div>
  )
})
