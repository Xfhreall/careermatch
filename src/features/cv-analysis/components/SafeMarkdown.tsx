import * as React from "react"

type ListBlock = {
  type: "list"
  ordered: boolean
  items: string[]
}

type ParagraphBlock = {
  type: "paragraph"
  lines: string[]
}

type HeadingBlock = {
  type: "heading"
  level: 2 | 3
  text: string
}

type CodeBlock = {
  type: "code"
  content: string
}

type MarkdownBlock = ListBlock | ParagraphBlock | HeadingBlock | CodeBlock

export function SafeMarkdown({ value }: { value: string }) {
  const blocks = React.useMemo(() => parseMarkdownBlocks(value), [value])

  if (blocks.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Belum ada konten yang tersedia.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4 text-sm leading-7">
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  )
}

function renderBlock(block: MarkdownBlock, index: number) {
  switch (block.type) {
    case "heading":
      return block.level === 2 ? (
        <h2 className="font-medium text-xl" key={index}>
          {block.text}
        </h2>
      ) : (
        <h3 className="font-medium text-base" key={index}>
          {block.text}
        </h3>
      )
    case "list": {
      const Component = block.ordered ? "ol" : "ul"

      return (
        <Component
          className={
            block.ordered
              ? "flex list-decimal flex-col gap-2 pl-5"
              : "flex list-disc flex-col gap-2 pl-5"
          }
          key={index}
        >
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </Component>
      )
    }
    case "code":
      return (
        <pre
          className="overflow-x-auto rounded-lg border border-border bg-background p-4 text-xs leading-6"
          key={index}
        >
          <code>{block.content}</code>
        </pre>
      )
    case "paragraph":
      return (
        <p className="text-muted-foreground" key={index}>
          {block.lines.join(" ")}
        </p>
      )
  }
}

function parseMarkdownBlocks(value: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = []
  const lines = value.replace(/\r\n/g, "\n").split("\n")
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

      blocks.push({ type: "code", content: codeLines.join("\n") })
      index += 1
      continue
    }

    if (line.startsWith("### ")) {
      blocks.push({ type: "heading", level: 3, text: line.slice(4).trim() })
      index += 1
      continue
    }

    if (line.startsWith("## ")) {
      blocks.push({ type: "heading", level: 2, text: line.slice(3).trim() })
      index += 1
      continue
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = []

      while (index < lines.length && /^[-*]\s+/.test(lines[index] ?? "")) {
        items.push((lines[index] ?? "").replace(/^[-*]\s+/, "").trim())
        index += 1
      }

      blocks.push({ type: "list", ordered: false, items })
      continue
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = []

      while (index < lines.length && /^\d+\.\s+/.test(lines[index] ?? "")) {
        items.push((lines[index] ?? "").replace(/^\d+\.\s+/, "").trim())
        index += 1
      }

      blocks.push({ type: "list", ordered: true, items })
      continue
    }

    const paragraphLines: string[] = []

    while (index < lines.length) {
      const nextLine = lines[index]?.trimEnd() ?? ""

      if (
        !nextLine.trim() ||
        nextLine.startsWith("## ") ||
        nextLine.startsWith("### ") ||
        nextLine.startsWith("```") ||
        /^[-*]\s+/.test(nextLine) ||
        /^\d+\.\s+/.test(nextLine)
      ) {
        break
      }

      paragraphLines.push(nextLine.trim())
      index += 1
    }

    blocks.push({ type: "paragraph", lines: paragraphLines })
  }

  return blocks
}
