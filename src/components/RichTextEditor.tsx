import { useCallback, useMemo, useState, createContext, useContext } from 'react'
import { createEditor, type Descendant, Element as SlateElement, Text, Transforms, type BaseEditor, Editor } from 'slate'
import { Slate, Editable, withReact, useSlate, type RenderElementProps, type RenderLeafProps, type ReactEditor } from 'slate-react'
import { withHistory } from 'slate-history'
import MediaPicker from './MediaPicker'
import type { MultimediaResponse } from '@/actions/multimedia'

// Custom types
type ImageElement = {
  type: 'image'
  url: string
  alt?: string
  children: [{ text: '' }]
}

type ParagraphElement = {
  type: 'paragraph'
  children: CustomText[]
}

type HeadingOneElement = {
  type: 'heading-one'
  children: CustomText[]
}

type HeadingTwoElement = {
  type: 'heading-two'
  children: CustomText[]
}

type HeadingThreeElement = {
  type: 'heading-three'
  children: CustomText[]
}

type BlockQuoteElement = {
  type: 'block-quote'
  children: CustomText[]
}

type BulletedListElement = {
  type: 'bulleted-list'
  children: ListItemElement[]
}

type NumberedListElement = {
  type: 'numbered-list'
  children: ListItemElement[]
}

type ListItemElement = {
  type: 'list-item'
  children: CustomText[]
}

type CustomElement =
  | ParagraphElement
  | HeadingOneElement
  | HeadingTwoElement
  | HeadingThreeElement
  | BlockQuoteElement
  | BulletedListElement
  | NumberedListElement
  | ListItemElement
  | ImageElement

type CustomText = {
  text: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  code?: boolean
}

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor
    Element: CustomElement
    Text: CustomText
  }
}

// Context for MediaPicker
const MediaPickerContext = createContext<{
  openMediaPicker: () => void
} | null>(null)

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
}

const LIST_TYPES = ['numbered-list', 'bulleted-list']
const VOID_TYPES = ['image']

// Custom editor with void elements support
const withImages = (editor: BaseEditor & ReactEditor) => {
  const { isVoid } = editor

  editor.isVoid = (element) => {
    return VOID_TYPES.includes(element.type) ? true : isVoid(element)
  }

  return editor
}

export default function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editor = useMemo(() => withImages(withHistory(withReact(createEditor()))), [])
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)

  const [initialValue] = useState<Descendant[]>(() => htmlToSlate(value))

  const renderElement = useCallback((props: RenderElementProps) => <Element {...props} />, [])
  const renderLeaf = useCallback((props: RenderLeafProps) => <Leaf {...props} />, [])

  const handleChange = (newValue: Descendant[]) => {
    const html = slateToHtml(newValue)
    onChange(html)
  }

  const handleMediaSelect = (media: MultimediaResponse) => {
    insertImage(editor, media.originalUrl, media.fileName)
    setIsMediaPickerOpen(false)
  }

  const openMediaPicker = () => {
    setIsMediaPickerOpen(true)
  }

  return (
    <MediaPickerContext.Provider value={{ openMediaPicker }}>
      <div className={`border border-border rounded-lg overflow-hidden ${className || ''}`}>
        <Slate editor={editor} initialValue={initialValue} onValueChange={handleChange}>
          <Toolbar />
          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder={placeholder || 'Enter content...'}
            spellCheck
            className="min-h-[200px] p-4 bg-background focus:outline-none prose prose-sm max-w-none"
            onKeyDown={(event) => {
              if (event.key === 'Tab') {
                event.preventDefault()
                Transforms.insertText(editor, '  ')
              }
            }}
          />
        </Slate>
      </div>

      <MediaPicker
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
        title="Insert Image"
      />
    </MediaPickerContext.Provider>
  )
}

// Insert image into editor
function insertImage(editor: BaseEditor & ReactEditor, url: string, alt?: string) {
  const image: ImageElement = {
    type: 'image',
    url,
    alt,
    children: [{ text: '' }],
  }
  Transforms.insertNodes(editor, image)
  Transforms.insertNodes(editor, {
    type: 'paragraph',
    children: [{ text: '' }],
  })
}

// Toolbar Component
function Toolbar() {
  const context = useContext(MediaPickerContext)

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-secondary/30">
      <MarkButton format="bold" icon={<BoldIcon />} />
      <MarkButton format="italic" icon={<ItalicIcon />} />
      <MarkButton format="underline" icon={<UnderlineIcon />} />
      <MarkButton format="strikethrough" icon={<StrikethroughIcon />} />
      <MarkButton format="code" icon={<CodeIcon />} />
      <div className="w-px h-6 bg-border mx-1" />
      <BlockButton format="heading-one" icon={<H1Icon />} />
      <BlockButton format="heading-two" icon={<H2Icon />} />
      <BlockButton format="heading-three" icon={<H3Icon />} />
      <div className="w-px h-6 bg-border mx-1" />
      <BlockButton format="block-quote" icon={<QuoteIcon />} />
      <BlockButton format="bulleted-list" icon={<BulletListIcon />} />
      <BlockButton format="numbered-list" icon={<NumberListIcon />} />
      <div className="w-px h-6 bg-border mx-1" />
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          context?.openMediaPicker()
        }}
        className="p-1.5 rounded transition-colors hover:bg-secondary text-muted-foreground hover:text-foreground"
        title="Insert Image"
      >
        <ImageIcon />
      </button>
    </div>
  )
}

// Mark Button (for inline formatting)
function MarkButton({ format, icon }: { format: string; icon: React.ReactNode }) {
  const editor = useSlate()
  const isActive = isMarkActive(editor, format)

  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault()
        toggleMark(editor, format)
      }}
      className={`p-1.5 rounded transition-colors ${
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
      }`}
      title={format}
    >
      {icon}
    </button>
  )
}

// Block Button (for block-level formatting)
function BlockButton({ format, icon }: { format: string; icon: React.ReactNode }) {
  const editor = useSlate()
  const isActive = isBlockActive(editor, format)

  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault()
        toggleBlock(editor, format)
      }}
      className={`p-1.5 rounded transition-colors ${
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
      }`}
      title={format}
    >
      {icon}
    </button>
  )
}

// Element Renderer
function Element({ attributes, children, element }: RenderElementProps) {
  switch (element.type) {
    case 'heading-one':
      return <h1 {...attributes} className="text-2xl font-bold mb-2">{children}</h1>
    case 'heading-two':
      return <h2 {...attributes} className="text-xl font-bold mb-2">{children}</h2>
    case 'heading-three':
      return <h3 {...attributes} className="text-lg font-bold mb-2">{children}</h3>
    case 'block-quote':
      return <blockquote {...attributes} className="border-l-4 border-primary pl-4 italic text-muted-foreground my-2">{children}</blockquote>
    case 'bulleted-list':
      return <ul {...attributes} className="list-disc list-inside my-2">{children}</ul>
    case 'numbered-list':
      return <ol {...attributes} className="list-decimal list-inside my-2">{children}</ol>
    case 'list-item':
      return <li {...attributes}>{children}</li>
    case 'image':
      return (
        <div {...attributes} contentEditable={false} className="my-4">
          <img
            src={element.url}
            alt={element.alt || ''}
            className="max-w-full h-auto rounded-lg border border-border"
          />
          {children}
        </div>
      )
    default:
      return <p {...attributes} className="mb-2">{children}</p>
  }
}

// Leaf Renderer (for inline formatting)
function Leaf({ attributes, children, leaf }: RenderLeafProps) {
  if (leaf.bold) {
    children = <strong>{children}</strong>
  }
  if (leaf.italic) {
    children = <em>{children}</em>
  }
  if (leaf.underline) {
    children = <u>{children}</u>
  }
  if (leaf.strikethrough) {
    children = <s>{children}</s>
  }
  if (leaf.code) {
    children = <code className="bg-secondary px-1 rounded text-sm font-mono">{children}</code>
  }
  return <span {...attributes}>{children}</span>
}

// Helper functions
function isMarkActive(editor: BaseEditor & ReactEditor, format: string) {
  const marks = Editor.marks(editor)
  return marks ? marks[format as keyof typeof marks] === true : false
}

function isBlockActive(editor: BaseEditor & ReactEditor, format: string) {
  const { selection } = editor
  if (!selection) return false

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) =>
        !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
    })
  )

  return !!match
}

function toggleMark(editor: BaseEditor & ReactEditor, format: string) {
  const isActive = isMarkActive(editor, format)
  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

function toggleBlock(editor: BaseEditor & ReactEditor, format: string) {
  const isActive = isBlockActive(editor, format)
  const isList = LIST_TYPES.includes(format)

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type),
    split: true,
  })

  type BlockType = 'paragraph' | 'heading-one' | 'heading-two' | 'heading-three' | 'block-quote' | 'list-item'

  const newProperties: Partial<SlateElement> = {
    type: isActive ? 'paragraph' : isList ? 'list-item' : (format as BlockType),
  }
  Transforms.setNodes<SlateElement>(editor, newProperties)

  if (!isActive && isList) {
    const block: CustomElement = {
      type: format as 'bulleted-list' | 'numbered-list',
      children: [] as unknown as ListItemElement[]
    }
    Transforms.wrapNodes(editor, block)
  }
}

// Convert HTML to Slate nodes
function htmlToSlate(html: string): Descendant[] {
  if (!html || html.trim() === '') {
    return [{ type: 'paragraph', children: [{ text: '' }] }]
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const nodes: Descendant[] = []

  const parseNode = (node: Node): Descendant | Descendant[] | null => {
    if (node.nodeType === Node.TEXT_NODE) {
      return { text: node.textContent || '' }
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return null
    }

    const element = node as HTMLElement
    const children: Descendant[] = []

    element.childNodes.forEach((child) => {
      const parsed = parseNode(child)
      if (parsed) {
        if (Array.isArray(parsed)) {
          children.push(...parsed)
        } else {
          children.push(parsed)
        }
      }
    })

    if (children.length === 0) {
      children.push({ text: '' })
    }

    switch (element.tagName.toLowerCase()) {
      case 'img': {
        const src = element.getAttribute('src') || ''
        const alt = element.getAttribute('alt') || ''
        return {
          type: 'image',
          url: src,
          alt,
          children: [{ text: '' }],
        } as ImageElement
      }
      case 'h1':
        return { type: 'heading-one', children: children as CustomText[] }
      case 'h2':
        return { type: 'heading-two', children: children as CustomText[] }
      case 'h3':
        return { type: 'heading-three', children: children as CustomText[] }
      case 'blockquote':
        return { type: 'block-quote', children: children as CustomText[] }
      case 'ul':
        return { type: 'bulleted-list', children: children as unknown as ListItemElement[] }
      case 'ol':
        return { type: 'numbered-list', children: children as unknown as ListItemElement[] }
      case 'li':
        return { type: 'list-item', children: children as CustomText[] }
      case 'p':
        return { type: 'paragraph', children: children as CustomText[] }
      case 'strong':
      case 'b':
        return children.map((child) =>
          Text.isText(child) ? { ...child, bold: true } : child
        )
      case 'em':
      case 'i':
        return children.map((child) =>
          Text.isText(child) ? { ...child, italic: true } : child
        )
      case 'u':
        return children.map((child) =>
          Text.isText(child) ? { ...child, underline: true } : child
        )
      case 's':
      case 'del':
        return children.map((child) =>
          Text.isText(child) ? { ...child, strikethrough: true } : child
        )
      case 'code':
        return children.map((child) =>
          Text.isText(child) ? { ...child, code: true } : child
        )
      case 'br':
        return { text: '\n' }
      case 'div':
      case 'span':
        return children
      default:
        if (children.every((c) => Text.isText(c))) {
          return { type: 'paragraph', children: children as CustomText[] }
        }
        return children
    }
  }

  doc.body.childNodes.forEach((node) => {
    const parsed = parseNode(node)
    if (parsed) {
      if (Array.isArray(parsed)) {
        parsed.forEach((p) => {
          if (SlateElement.isElement(p)) {
            nodes.push(p)
          } else if (Text.isText(p) && p.text.trim()) {
            nodes.push({ type: 'paragraph', children: [p] })
          }
        })
      } else if (SlateElement.isElement(parsed)) {
        nodes.push(parsed)
      } else if (Text.isText(parsed) && parsed.text.trim()) {
        nodes.push({ type: 'paragraph', children: [parsed] })
      }
    }
  })

  if (nodes.length === 0) {
    return [{ type: 'paragraph', children: [{ text: '' }] }]
  }

  return nodes
}

// Convert Slate nodes to HTML
function slateToHtml(nodes: Descendant[]): string {
  return nodes.map((node) => serializeNode(node)).join('')
}

function serializeNode(node: Descendant): string {
  if (Text.isText(node)) {
    let text = escapeHtml(node.text)
    if (node.bold) text = `<strong>${text}</strong>`
    if (node.italic) text = `<em>${text}</em>`
    if (node.underline) text = `<u>${text}</u>`
    if (node.strikethrough) text = `<s>${text}</s>`
    if (node.code) text = `<code>${text}</code>`
    return text
  }

  const children = node.children.map((n) => serializeNode(n)).join('')

  switch (node.type) {
    case 'image':
      return `<img src="${escapeHtml(node.url)}" alt="${escapeHtml(node.alt || '')}" />`
    case 'heading-one':
      return `<h1>${children}</h1>`
    case 'heading-two':
      return `<h2>${children}</h2>`
    case 'heading-three':
      return `<h3>${children}</h3>`
    case 'block-quote':
      return `<blockquote>${children}</blockquote>`
    case 'bulleted-list':
      return `<ul>${children}</ul>`
    case 'numbered-list':
      return `<ol>${children}</ol>`
    case 'list-item':
      return `<li>${children}</li>`
    case 'paragraph':
    default:
      return `<p>${children}</p>`
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Icons
function BoldIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
    </svg>
  )
}

function ItalicIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h4m-2 0l-4 16m0 0h4" />
    </svg>
  )
}

function UnderlineIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v7a5 5 0 0010 0V4M5 20h14" />
    </svg>
  )
}

function StrikethroughIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9a5 5 0 00-10 0M4 12h16M7 15a5 5 0 0010 0" />
    </svg>
  )
}

function CodeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  )
}

function H1Icon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <text x="2" y="17" fontSize="14" fontWeight="bold">H1</text>
    </svg>
  )
}

function H2Icon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <text x="2" y="17" fontSize="14" fontWeight="bold">H2</text>
    </svg>
  )
}

function H3Icon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <text x="2" y="17" fontSize="14" fontWeight="bold">H3</text>
    </svg>
  )
}

function QuoteIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  )
}

function BulletListIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16M4 6h.01M4 12h.01M4 18h.01" />
    </svg>
  )
}

function NumberListIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 6h13M7 12h13M7 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  )
}

function ImageIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}
