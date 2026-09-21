// A deliberately small Markdown to HTML converter, scoped to the subset the
// design artifacts actually use: headings, paragraphs, bold/italic/code spans,
// fenced code blocks, ordered and unordered lists, tables, blockquotes, rules,
// and links.
//
// It is not a general Markdown implementation and does not try to be. Anything
// it does not understand is emitted as escaped text rather than dropped, so a
// document never silently loses content. Raw HTML in the source is escaped too:
// these documents are data, not markup to execute.

export function markdownToHtml(source) {
  const lines = String(source).replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    // Fenced code block
    if (/^```/.test(line)) {
      const lang = line.slice(3).trim();
      const body = [];
      index += 1;
      while (index < lines.length && !/^```/.test(lines[index])) {
        body.push(lines[index]);
        index += 1;
      }
      index += 1;
      out.push(
        `<pre class="md-pre"><code${lang ? ` data-lang="${esc(lang)}"` : ""}>${esc(body.join("\n"))}</code></pre>`,
      );
      continue;
    }

    // Table: a header row followed by a separator row
    if (/^\|/.test(line) && index + 1 < lines.length && /^\|[\s:|-]+\|?\s*$/.test(lines[index + 1])) {
      const header = splitRow(line);
      index += 2;
      const rows = [];
      while (index < lines.length && /^\|/.test(lines[index])) {
        rows.push(splitRow(lines[index]));
        index += 1;
      }
      out.push(
        `<div class="md-table-wrap"><table class="md-table"><thead><tr>${header
          .map((cell) => `<th>${inline(cell)}</th>`)
          .join("")}</tr></thead><tbody>${rows
          .map((row) => `<tr>${row.map((cell) => `<td>${inline(cell)}</td>`).join("")}</tr>`)
          .join("")}</tbody></table></div>`,
      );
      continue;
    }

    // Heading
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      out.push(`<h${level} class="md-h${level}">${inline(heading[2].trim())}</h${level}>`);
      index += 1;
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      out.push('<hr class="md-hr"/>');
      index += 1;
      continue;
    }

    // Blockquote
    if (/^>\s?/.test(line)) {
      const body = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        body.push(lines[index].replace(/^>\s?/, ""));
        index += 1;
      }
      out.push(`<blockquote class="md-quote">${markdownToHtml(body.join("\n"))}</blockquote>`);
      continue;
    }

    // Lists (ordered / unordered), allowing simple continuation lines
    if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const items = [];
      while (index < lines.length && /^\s*([-*+]|\d+\.)\s+/.test(lines[index])) {
        const item = lines[index].replace(/^\s*([-*+]|\d+\.)\s+/, "");
        index += 1;
        items.push(item);
      }
      const tag = ordered ? "ol" : "ul";
      out.push(
        `<${tag} class="md-list">${items.map((item) => `<li>${inline(item)}</li>`).join("")}</${tag}>`,
      );
      continue;
    }

    // Blank line
    if (!line.trim()) {
      index += 1;
      continue;
    }

    // Paragraph: gather until a blank line or another block start
    const para = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{1,6}\s|```|>|\s*([-*+]|\d+\.)\s|\|)/.test(lines[index]) &&
      !/^(-{3,}|\*{3,}|_{3,})\s*$/.test(lines[index])
    ) {
      para.push(lines[index]);
      index += 1;
    }
    if (para.length) out.push(`<p class="md-p">${inline(para.join(" "))}</p>`);
    else index += 1;
  }

  return out.join("\n");
}

function splitRow(line) {
  return line
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

// Inline spans: escape first, then re-introduce the allowed markup.
function inline(text) {
  let out = esc(text);
  out = out.replace(/`([^`]+)`/g, '<code class="md-code">$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<span class="md-link" title="$2">$1</span>');
  return out;
}

function esc(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}
