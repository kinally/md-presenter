import type { SlideSection, SlideNode, ParseResult } from '@/types/slide'
import { marked, Token, Tokens } from 'marked'

/**
 * 解析 Markdown 字符串，按标题划分为 SlideSection[]
 */
export function parseMarkdown(md: string): ParseResult {
  const tokens = marked.lexer(md)
  const sections: SlideSection[] = []
  const warnings: string[] = []

  let currentSection: SlideSection | null = null
  let slideIndex = 0

  for (const token of tokens) {
    if (token.type === 'heading' && token.depth <= 3) {
      // 遇到标题 → 切新节
      currentSection = {
        id: `sec-${sections.length + 1}`,
        heading: token.text,
        slides: [],
      }
      sections.push(currentSection)
    } else if (currentSection) {
      // 归入当前节
      const nodes = tokenToSlideNodes(token, slideIndex)
      for (const node of nodes) {
        currentSection.slides.push(node)
        slideIndex++
      }
    } else {
      // 标题前的内容
      warnings.push(`忽略标题前的内容: ${(token as any).text?.slice(0, 30) || '(非文本)'}`)
    }
  }

  return { sections, warnings }
}

/** 将单个 marked token 转为 SlideNode[] */
function tokenToSlideNodes(token: Token, index: number): SlideNode[] {
  const id = `slide-${index}`

  switch (token.type) {
    case 'code': {
      return [{
        id,
        type: 'code',
        content: (token as Tokens.Code).text,
        readable: false,
        holdSeconds: 3,
      }]
    }

    case 'table': {
      const t = token as Tokens.Table
      const html = renderTable(t)
      return [{
        id,
        type: 'table',
        content: html,
        readable: false,
        holdSeconds: 4,
      }]
    }

    case 'list': {
      const t = token as Tokens.List
      const html = renderList(t)
      return [{
        id,
        type: 'list',
        content: html,
        readable: true,
        holdSeconds: 0,
      }]
    }

    case 'paragraph': {
      const text = (token as Tokens.Paragraph).text
      return [{
        id,
        type: 'paragraph',
        content: text,
        readable: true,
        holdSeconds: 0,
      }]
    }

    default:
      return [{
        id,
        type: 'paragraph',
        content: (token as any).text || '',
        readable: true,
        holdSeconds: 0,
      }]
  }
}

/** 简单渲染表格为 HTML */
function renderTable(t: Tokens.Table): string {
  let html = '<table><thead><tr>'
  for (const h of t.header) {
    html += `<th>${h.text}</th>`
  }
  html += '</tr></thead><tbody>'
  for (const row of t.rows) {
    html += '<tr>'
    for (const cell of row) {
      html += `<td>${cell.text}</td>`
    }
    html += '</tr>'
  }
  html += '</tbody></table>'
  return html
}

/** 简单渲染列表为 HTML */
function renderList(t: Tokens.List): string {
  const tag = t.ordered ? 'ol' : 'ul'
  let html = `<${tag}>`
  for (const item of t.items) {
    html += `<li>${item.text}</li>`
  }
  html += `</${tag}>`
  return html
}
