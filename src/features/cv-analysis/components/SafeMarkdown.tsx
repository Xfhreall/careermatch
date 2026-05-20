import * as React from "react"

export function SafeMarkdown({ value }: { value: string }) {
  const html = React.useMemo(() => markdownToSafeHtml(value), [value])

  if (!html) {
    return (
      <p className="text-muted-foreground text-sm">
        Belum ada konten yang tersedia.
      </p>
    )
  }

  return (
    <div
      className="analysis-markdown"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: markdown is escaped before HTML is generated.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function markdownToSafeHtml(value: string) {
  const lines = value.replace(/\r\n/g, "\n").split("\n")
  const html: string[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]?.trimEnd() ?? ""

    if (!line.trim()) {
      index += 1
      continue
    }

    if (line.startsWith("```")) {
      const codeLines: string[] = []
      index += 1

      while (index < lines.length && !lines[index]?.startsWith("```")) {
        codeLines.push(lines[index] ?? "")
        index += 1
      }

      html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`)
      index += 1
      continue
    }

    const table = readTable(lines, index)

    if (table) {
      html.push(renderTable(table.headers, table.rows))
      index = table.nextIndex
      continue
    }

    const headingMatch = /^(#{1,4})\s+(.+)$/.exec(line.trim())

    if (headingMatch) {
      const level = Math.min(headingMatch[1]?.length ?? 2, 4)
      const tag = level === 1 ? "h2" : (`h${level}` as "h2" | "h3" | "h4")

      html.push(`<${tag}>${renderInline(headingMatch[2] ?? "")}</${tag}>`)
      index += 1
      continue
    }

    if (/^[-*]\s+/.test(line.trim())) {
      const items: string[] = []

      while (
        index < lines.length &&
        /^[-*]\s+/.test(lines[index]?.trim() ?? "")
      ) {
        items.push((lines[index] ?? "").trim().replace(/^[-*]\s+/, ""))
        index += 1
      }

      html.push(
        `<ul>${items.map((item) => `<li>${renderInline(item)}</li>`).join("")}</ul>`
      )
      continue
    }

    if (/^\d+\.\s+/.test(line.trim())) {
      const items: string[] = []

      while (
        index < lines.length &&
        /^\d+\.\s+/.test(lines[index]?.trim() ?? "")
      ) {
        items.push((lines[index] ?? "").trim().replace(/^\d+\.\s+/, ""))
        index += 1
      }

      html.push(
        `<ol>${items.map((item) => `<li>${renderInline(item)}</li>`).join("")}</ol>`
      )
      continue
    }

    if (line.trim().startsWith(">")) {
      const quoteLines: string[] = []

      while (
        index < lines.length &&
        (lines[index]?.trim() ?? "").startsWith(">")
      ) {
        quoteLines.push((lines[index] ?? "").trim().replace(/^>\s?/, ""))
        index += 1
      }

      html.push(
        `<blockquote>${renderInline(quoteLines.join(" "))}</blockquote>`
      )
      continue
    }

    const paragraphLines: string[] = []

    while (index < lines.length) {
      const nextLine = lines[index]?.trimEnd() ?? ""

      if (
        !nextLine.trim() ||
        nextLine.startsWith("```") ||
        /^(#{1,4})\s+/.test(nextLine.trim()) ||
        /^[-*]\s+/.test(nextLine.trim()) ||
        /^\d+\.\s+/.test(nextLine.trim()) ||
        nextLine.trim().startsWith(">") ||
        readTable(lines, index)
      ) {
        break
      }

      paragraphLines.push(nextLine.trim())
      index += 1
    }

    html.push(`<p>${renderInline(paragraphLines.join(" "))}</p>`)
  }

  return html.join("").trim()
}

function readTable(lines: string[], startIndex: number) {
  const headerLine = lines[startIndex]?.trim() ?? ""
  const separatorLine = lines[startIndex + 1]?.trim() ?? ""

  if (
    !headerLine.includes("|") ||
    !/^\|?[\s:-]+\|[\s|:-]+$/.test(separatorLine)
  ) {
    return null
  }

  const headers = splitTableRow(headerLine)
  const rows: string[][] = []
  let index = startIndex + 2

  while (index < lines.length && (lines[index]?.trim() ?? "").includes("|")) {
    rows.push(splitTableRow(lines[index] ?? ""))
    index += 1
  }

  return { headers, rows, nextIndex: index }
}

function renderTable(headers: string[], rows: string[][]) {
  return [
    '<div class="analysis-markdown-table"><table>',
    `<thead><tr>${headers.map((header) => `<th>${renderInline(header)}</th>`).join("")}</tr></thead>`,
    `<tbody>${rows
      .map(
        (row) =>
          `<tr>${headers
            .map((_, index) => `<td>${renderInline(row[index] ?? "")}</td>`)
            .join("")}</tr>`
      )
      .join("")}</tbody>`,
    "</table></div>",
  ].join("")
}

function splitTableRow(value: string) {
  return value
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim())
}

function renderInline(value: string) {
  const escaped = escapeHtml(value)

  return escaped
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/_([^_]+)_/g, "<em>$1</em>")
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}
