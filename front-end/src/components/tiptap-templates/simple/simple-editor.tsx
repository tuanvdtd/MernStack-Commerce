"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  EditorContent,
  EditorContext,
  useEditor,
  type Editor,
  type Extensions,
} from "@tiptap/react"

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Selection } from "@tiptap/extensions"

// --- UI Primitives ---
import { Button } from "~/components/tiptap-ui-primitive/button"
import { Spacer } from "~/components/tiptap-ui-primitive/spacer"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "~/components/tiptap-ui-primitive/toolbar"

// --- Tiptap Node ---
import { ImageUploadNode } from "~/components/tiptap-node/image-upload-node/image-upload-node-extension"
import { HorizontalRule } from "~/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import "~/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "~/components/tiptap-node/code-block-node/code-block-node.scss"
import "~/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "~/components/tiptap-node/list-node/list-node.scss"
import "~/components/tiptap-node/image-node/image-node.scss"
import "~/components/tiptap-node/heading-node/heading-node.scss"
import "~/components/tiptap-node/paragraph-node/paragraph-node.scss"

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "~/components/tiptap-ui/heading-dropdown-menu"
import { ImageUploadButton } from "~/components/tiptap-ui/image-upload-button"
import { ListDropdownMenu } from "~/components/tiptap-ui/list-dropdown-menu"
import { BlockquoteButton } from "~/components/tiptap-ui/blockquote-button"
import { CodeBlockButton } from "~/components/tiptap-ui/code-block-button"
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "~/components/tiptap-ui/color-highlight-popover"
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "~/components/tiptap-ui/link-popover"
import { MarkButton } from "~/components/tiptap-ui/mark-button"
import { TextAlignButton } from "~/components/tiptap-ui/text-align-button"
import { UndoRedoButton } from "~/components/tiptap-ui/undo-redo-button"

// --- Icons ---
import { ArrowLeftIcon } from "~/components/tiptap-icons/arrow-left-icon"
import { HighlighterIcon } from "~/components/tiptap-icons/highlighter-icon"
import { LinkIcon } from "~/components/tiptap-icons/link-icon"

// --- Hooks ---
import { useIsBreakpoint } from "~/hooks/use-is-breakpoint"
import { useWindowSize } from "~/hooks/use-window-size"
import { useCursorVisibility } from "~/hooks/use-cursor-visibility"

// --- Components ---
import { ThemeToggle } from "~/components/tiptap-templates/simple/theme-toggle"
import { EmbeddedToolbarOverflowMenu } from "~/components/tiptap-templates/simple/embedded-toolbar-overflow"

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "~/lib/tiptap-utils"

// --- Styles ---
import "~/components/tiptap-templates/simple/simple-editor.scss"

import content from "~/components/tiptap-templates/simple/data/content.json"

export type SimpleEditorProps = {
  /** HTML content for controlled usage (e.g. react-hook-form). */
  value?: string
  onChange?: (html: string) => void
  onBlur?: () => void
  /** Compact layout for embedding inside admin forms instead of full-page demo. */
  embedded?: boolean
}

/** Toolbar for product descriptions: headings, lists, basic marks, link, image. */
const EmbeddedToolbarContent = ({
  isMobile,
  onLinkClick,
  useOverflowMenu,
}: {
  isMobile: boolean
  onLinkClick: () => void
  useOverflowMenu: boolean
}) => (
  <>
    <ToolbarGroup>
      <UndoRedoButton action="undo" />
      <UndoRedoButton action="redo" />
    </ToolbarGroup>

    <ToolbarSeparator />

    <ToolbarGroup>
      <HeadingDropdownMenu modal={false} levels={[2, 3]} />
      <ListDropdownMenu
        modal={false}
        types={["bulletList", "orderedList"]}
      />
    </ToolbarGroup>

    <ToolbarSeparator />

    <ToolbarGroup>
      <MarkButton type="bold" />
      <MarkButton type="italic" />
      <MarkButton type="underline" />
      {isMobile ? <LinkButton onClick={onLinkClick} /> : <LinkPopover />}
    </ToolbarGroup>

    <ToolbarSeparator />

    <ToolbarGroup>
      <ImageUploadButton text={isMobile ? undefined : "Add"} />
    </ToolbarGroup>

    <EmbeddedToolbarOverflowMenu inline={!useOverflowMenu} />
  </>
)

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
  showThemeToggle,
}: {
  onHighlighterClick: () => void
  onLinkClick: () => void
  isMobile: boolean
  showThemeToggle: boolean
}) => {
  return (
    <>
      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu modal={false} levels={[1, 2, 3, 4]} />
        <ListDropdownMenu
          modal={false}
          types={["bulletList", "orderedList", "taskList"]}
        />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageUploadButton text="Add" />
      </ToolbarGroup>

      <Spacer />

      {isMobile && <ToolbarSeparator />}

      {showThemeToggle && (
        <ToolbarGroup>
          <ThemeToggle />
        </ToolbarGroup>
      )}
    </>
  )
}

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link"
  onBack: () => void
}) => (
  <>
    <ToolbarGroup>
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
)

/** Build Tiptap extensions; embedded mode keeps only what product descriptions need. */
const buildEditorExtensions = (embedded: boolean): Extensions => {
  const imageUpload = ImageUploadNode.configure({
    accept: "image/*",
    maxSize: MAX_FILE_SIZE,
    limit: 3,
    upload: handleImageUpload,
    onError: (error) => console.error("Upload failed:", error),
  })

  if (embedded) {
    return [
      StarterKit.configure({
        horizontalRule: false,
        codeBlock: false,
        strike: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight.configure({ multicolor: true }),
      Image,
      Selection,
      imageUpload,
    ]
  }

  return [
    StarterKit.configure({
      horizontalRule: false,
      link: {
        openOnClick: false,
        enableClickSelection: true,
      },
    }),
    HorizontalRule,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    TaskList,
    TaskItem.configure({ nested: true }),
    Highlight.configure({ multicolor: true }),
    Image,
    Typography,
    Superscript,
    Subscript,
    Selection,
    imageUpload,
  ]
}

export function SimpleEditor({
  value,
  onChange,
  onBlur,
  embedded = false,
}: SimpleEditorProps) {
  const isMobile = useIsBreakpoint()
  const { height } = useWindowSize()
  const [mobileView, setMobileView] = useState<"main" | "highlighter" | "link">(
    "main"
  )
  const [embeddedMobileView, setEmbeddedMobileView] = useState<"main" | "link">(
    "main"
  )
  const toolbarRef = useRef<HTMLDivElement>(null)
  const isInternalUpdateRef = useRef(false)
  const onChangeRef = useRef(onChange)
  const onBlurRef = useRef(onBlur)
  const isControlled = value !== undefined
  const extensions = useMemo(() => buildEditorExtensions(embedded), [embedded])
  /** Wide viewports show align / blockquote / highlight inline; narrower uses "…" menu. */
  const showInlineExtras = useIsBreakpoint("min", 1280)

  useEffect(() => {
    onChangeRef.current = onChange
    onBlurRef.current = onBlur
  }, [onChange, onBlur])

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
      handleDOMEvents: {
        blur: () => {
          onBlurRef.current?.()
          return false
        },
      },
    },
    extensions,
    content: isControlled ? (value ?? "") : content,
    onUpdate: ({ editor: currentEditor }) => {
      if (!onChangeRef.current) return
      isInternalUpdateRef.current = true
      onChangeRef.current(currentEditor.getHTML())
    },
  })

  useEffect(() => {
    if (!editor || !isControlled) return
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false
      return
    }
    const nextContent = value ?? ""
    if (nextContent !== currentEditorHtml(editor)) {
      editor.commands.setContent(nextContent, { emitUpdate: false })
    }
  }, [editor, isControlled, value])

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  })

  useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main")
    }
    if (!isMobile && embeddedMobileView !== "main") {
      setEmbeddedMobileView("main")
    }
  }, [embeddedMobileView, isMobile, mobileView])

  return (
    <div
      className={`simple-editor-wrapper${embedded ? " is-embedded" : ""}`}
    >
      <EditorContext.Provider value={{ editor }}>
        <Toolbar
          ref={toolbarRef}
          style={{
            ...(isMobile && !embedded
              ? {
                  bottom: `calc(100% - ${height - rect.y}px)`,
                }
              : {}),
          }}
        >
          {embedded ? (
            embeddedMobileView === "main" ? (
              <EmbeddedToolbarContent
                isMobile={isMobile}
                onLinkClick={() => setEmbeddedMobileView("link")}
                useOverflowMenu={!showInlineExtras}
              />
            ) : (
              <MobileToolbarContent
                type="link"
                onBack={() => setEmbeddedMobileView("main")}
              />
            )
          ) : mobileView === "main" ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView("highlighter")}
              onLinkClick={() => setMobileView("link")}
              isMobile={isMobile}
              showThemeToggle
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === "highlighter" ? "highlighter" : "link"}
              onBack={() => setMobileView("main")}
            />
          )}
        </Toolbar>

        <EditorContent
          editor={editor}
          role="presentation"
          className="simple-editor-content"
        />
      </EditorContext.Provider>
    </div>
  )
}

/** Read current HTML from the editor instance for controlled sync checks. */
function currentEditorHtml(editor: Editor) {
  return editor.getHTML()
}
