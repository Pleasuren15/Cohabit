const PAGE_WIDTH_MM = 210
const PAGE_HEIGHT_MM = 297
const MARGIN_MM = 14

/** Fixed capture width (A4 @ 96dpi) so html2canvas renders at a predictable scale. */
export const PDF_CONTENT_WIDTH_PX = 794

/**
 * Render a DOM node into a multi-page A4 PDF and trigger a download.
 * The node is captured at its natural width, so it should be as wide as
 * PDF_CONTENT_WIDTH_PX (see ContractDocument) for a crisp 1:1 result.
 * jsPDF and html2canvas are loaded lazily so they don't inflate the
 * initial application bundle.
 */
export async function downloadNodeAsPdf(
  node: HTMLElement,
  fileName = "cohabit-contract.pdf"
): Promise<void> {
  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ])

  const canvas = await html2canvas(node, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    width: node.scrollWidth,
    windowWidth: node.scrollWidth,
  })
  const imageHeightPx = canvas.height
  const imageWidthPx = canvas.width

  const usableWidth = PAGE_WIDTH_MM - MARGIN_MM * 2
  const usableHeight = PAGE_HEIGHT_MM - MARGIN_MM * 2
  const scale = usableWidth / imageWidthPx

  const imgHeightMm = imageHeightPx * scale
  const pageCount = Math.max(1, Math.ceil(imgHeightMm / usableHeight))

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" })
  const imgData = canvas.toDataURL("image/jpeg", 0.95)

  for (let page = 0; page < pageCount; page++) {
    if (page > 0) pdf.addPage()
    pdf.addImage(
      imgData,
      "JPEG",
      MARGIN_MM,
      MARGIN_MM,
      usableWidth,
      imgHeightMm,
      undefined,
      "FAST",
      page * usableHeight
    )
  }

  pdf.save(fileName)
}
