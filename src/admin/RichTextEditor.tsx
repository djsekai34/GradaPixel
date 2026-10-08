import { useEffect, useRef, type MouseEvent, type ReactNode } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import {
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Underline,
  Undo2,
  Unlink,
} from "lucide-react"
import { richTextClass } from "@/lib/richtext"
import { safeExternalUrl } from "@/lib/url"

// Solo lo que la web sabe mostrar. Los subtítulos, las citas, etc. tienen su propio bloque.
const extensions = [
  StarterKit.configure({
    heading: false,
    blockquote: false,
    code: false,
    codeBlock: false,
    horizontalRule: false,
    link: {
      openOnClick: false,
      autolink: true,
      defaultProtocol: "https",
      HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
    },
  }),
]

function ToolButton({
  label,
  pressed,
  disabled,
  onClick,
  children,
}: {
  label: string
  pressed?: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      disabled={disabled}
      // Evita que el editor pierda la selección al pulsar el botón
      onMouseDown={(e: MouseEvent) => e.preventDefault()}
      onClick={onClick}
      className={`inline-flex size-9 items-center justify-center border transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        pressed ? "border-azul bg-azul/15 text-azul" : "border-border text-foreground hover:border-foreground"
      }`}
    >
      {children}
    </button>
  )
}

function Separator() {
  return <span aria-hidden="true" className="mx-1 h-6 w-px bg-border" />
}

interface Props {
  value: string // contenido inicial (HTML)
  onChange: (html: string) => void
  label: string
}

export default function RichTextEditor({ value, onChange, label }: Props) {
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  const editor = useEditor({
    extensions,
    content: value,
    // Necesario para que los botones se marquen cuando el cursor está en negrita, lista, etc.
    shouldRerenderOnTransaction: true,
    editorProps: {
      attributes: {
        class: `${richTextClass} min-h-32 px-3 py-2 outline-none`,
        "aria-label": label,
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChangeRef.current(ed.isEmpty ? "" : ed.getHTML())
    },
  })

  if (!editor) return null

  function setLink() {
    if (!editor) return
    const previous = (editor.getAttributes("link").href as string | undefined) ?? ""
    const input = window.prompt("Dirección del enlace (empieza por https://). Déjala vacía para quitarlo.", previous)
    if (input === null) return

    const text = input.trim()
    if (text === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }

    const withScheme = /^(https?:|mailto:)/i.test(text) ? text : `https://${text}`
    const href = /^mailto:[^\s@]+@[^\s@]+$/i.test(withScheme)
      ? withScheme
      : safeExternalUrl(withScheme.replace(/^http:/i, "https:"))

    if (!href) {
      window.alert("Esa dirección no es válida. Debe empezar por https:// o ser un correo (mailto:).")
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run()
  }

  return (
    <div>
      <div className="border border-border bg-background focus-within:border-azul">
        <div
          role="toolbar"
          aria-label="Formato del texto"
          className="flex flex-wrap items-center gap-1 border-b border-border p-1.5"
        >
          <ToolButton
            label="Negrita (Ctrl+B)"
            pressed={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold size={16} aria-hidden="true" />
          </ToolButton>
          <ToolButton
            label="Cursiva (Ctrl+I)"
            pressed={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic size={16} aria-hidden="true" />
          </ToolButton>
          <ToolButton
            label="Subrayado (Ctrl+U)"
            pressed={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <Underline size={16} aria-hidden="true" />
          </ToolButton>
          <ToolButton
            label="Tachado"
            pressed={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough size={16} aria-hidden="true" />
          </ToolButton>

          <Separator />

          <ToolButton
            label="Lista con viñetas"
            pressed={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List size={16} aria-hidden="true" />
          </ToolButton>
          <ToolButton
            label="Lista numerada"
            pressed={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered size={16} aria-hidden="true" />
          </ToolButton>

          <Separator />

          <ToolButton label="Añadir o editar enlace" pressed={editor.isActive("link")} onClick={setLink}>
            <LinkIcon size={16} aria-hidden="true" />
          </ToolButton>
          <ToolButton
            label="Quitar enlace"
            disabled={!editor.isActive("link")}
            onClick={() => editor.chain().focus().extendMarkRange("link").unsetLink().run()}
          >
            <Unlink size={16} aria-hidden="true" />
          </ToolButton>

          <Separator />

          <ToolButton
            label="Quitar formato"
            onClick={() => editor.chain().focus().unsetAllMarks().run()}
          >
            <RemoveFormatting size={16} aria-hidden="true" />
          </ToolButton>
          <ToolButton
            label="Deshacer (Ctrl+Z)"
            disabled={!editor.can().undo()}
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo2 size={16} aria-hidden="true" />
          </ToolButton>
          <ToolButton
            label="Rehacer (Ctrl+Y)"
            disabled={!editor.can().redo()}
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo2 size={16} aria-hidden="true" />
          </ToolButton>
        </div>

        <EditorContent editor={editor} />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Selecciona el texto y pulsa un botón. Intro = párrafo nuevo, Mayús+Intro = salto de línea.
      </p>
    </div>
  )
}
