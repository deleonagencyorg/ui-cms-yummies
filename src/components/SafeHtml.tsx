import { type JSX } from 'react'
import DOMPurify from 'dompurify'

interface SafeHtmlProps {
  html: string
  className?: string
  as?: keyof JSX.IntrinsicElements
}

export default function SafeHtml({ html, className, as: Component = 'div' }: SafeHtmlProps) {
  const sanitizedHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'ul', 'ol', 'li',
      'blockquote',
      'strong', 'b', 'em', 'i', 'u', 's', 'del',
      'code', 'pre',
      'a', 'span', 'div',
      'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel',
      'src', 'alt', 'width', 'height',
      'class', 'style',
    ],
    ALLOW_DATA_ATTR: false,
  })

  return (
    <Component
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  )
}
