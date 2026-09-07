/**
 * 极简语法高亮（§4.2 / §5.3）：仅 4 类 token —— keyword / string / comment /
 * default（函数名等继承默认色，保持纸墨安静）。返回带 className 的 span 数组，
 * 不用 dangerouslySetInnerHTML。
 */
export type Token = { cls: '' | 'tok-kw' | 'tok-str' | 'tok-com'; text: string };

const KEYWORDS: Record<string, Set<string>> = {
  Rust: new Set([
    'fn', 'let', 'mut', 'pub', 'struct', 'impl', 'enum', 'trait', 'use', 'mod', 'for', 'in', 'if',
    'else', 'match', 'return', 'self', 'Self', 'crate', 'async', 'await', 'loop', 'while', 'where',
    'type', 'const', 'static', 'move', 'ref', 'dyn', 'as', 'break', 'continue', 'true', 'false',
    'unsafe', 'box', 'Pin',
  ]),
  TypeScript: new Set([
    'type', 'interface', 'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'of',
    'in', 'extends', 'implements', 'class', 'new', 'import', 'export', 'from', 'as', 'keyof',
    'infer', 'typeof', 'instanceof', 'await', 'async', 'true', 'false', 'null', 'undefined',
    'never', 'string', 'number', 'boolean', 'unknown', 'satisfies', 'declare', 'namespace',
  ]),
  TSX: new Set([
    'type', 'interface', 'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'of',
    'in', 'extends', 'class', 'new', 'import', 'export', 'from', 'as', 'await', 'async', 'true',
    'false', 'null', 'undefined', 'string', 'number', 'boolean', 'satisfies', 'default',
  ]),
  CSS: new Set(['@import', '@theme', '@media', '@keyframes', 'from', 'to', 'var']),
  Bash: new Set(['npm', 'npx', 'cd', 'echo', 'curl', 'git']),
};

const ALIASES: Record<string, string> = {
  rust: 'Rust',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  tsx: 'TSX',
  css: 'CSS',
  bash: 'Bash',
  sh: 'Bash',
  shell: 'Bash',
};

export function tokenize(code: string, lang: string): Token[] {
  const kw = KEYWORDS[ALIASES[lang.toLowerCase()] ?? lang];
  const tokens: Token[] = [];
  let i = 0;
  const n = code.length;
  const push = (text: string, cls: Token['cls'] = '') => {
    if (!text) return;
    const last = tokens[tokens.length - 1];
    if (last && last.cls === cls) last.text += text;
    else tokens.push({ cls, text });
  };

  while (i < n) {
    const ch = code[i];
    const rest = code.slice(i);

    // 行注释：// 或 #
    if (rest.startsWith('//') || ch === '#') {
      const end = code.indexOf('\n', i);
      const stop = end === -1 ? n : end;
      push(code.slice(i, stop), 'tok-com');
      i = stop;
      continue;
    }
    // 块注释 /* */
    if (rest.startsWith('/*')) {
      const end = code.indexOf('*/', i + 2);
      const stop = end === -1 ? n : end + 2;
      push(code.slice(i, stop), 'tok-com');
      i = stop;
      continue;
    }
    // 字符串：' " `
    if (ch === '"' || ch === "'" || ch === '`') {
      let j = i + 1;
      while (j < n) {
        if (code[j] === '\\') {
          j += 2;
          continue;
        }
        if (code[j] === ch) {
          j++;
          break;
        }
        if (ch !== '`' && code[j] === '\n') break;
        j++;
      }
      push(code.slice(i, j), 'tok-str');
      i = j;
      continue;
    }
    // 属性字符串（JSX 内 name="..."）由上面分支覆盖
    // 关键字
    if (kw && /[A-Za-z_@]/.test(ch)) {
      const m = rest.match(/^[A-Za-z_@][A-Za-z0-9_]*/);
      if (m) {
        push(m[0], kw.has(m[0]) ? 'tok-kw' : '');
        i += m[0].length;
        continue;
      }
    }
    // 其余：默认色
    const m = rest.match(/^[^A-Za-z_@#"'/`]+/);
    if (m && m[0].length > 0) {
      push(m[0]);
      i += m[0].length;
    } else {
      push(ch);
      i++;
    }
  }
  return tokens;
}
