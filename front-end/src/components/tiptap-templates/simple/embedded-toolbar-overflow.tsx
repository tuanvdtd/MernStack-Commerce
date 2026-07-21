import { useState } from "react"
import { MoreHorizontal } from "lucide-react"
import { BlockquoteButton } from "~/components/tiptap-ui/blockquote-button"
import { ColorHighlightPopover } from "~/components/tiptap-ui/color-highlight-popover"
import { TextAlignButton } from "~/components/tiptap-ui/text-align-button"
import { Button } from "~/components/tiptap-ui-primitive/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/tiptap-ui-primitive/popover"
import {
  ToolbarGroup,
  ToolbarSeparator,
} from "~/components/tiptap-ui-primitive/toolbar"

type EmbeddedToolbarOverflowMenuProps = {
  /** When true, align / blockquote / highlight render inline instead of the menu. */
  inline?: boolean
}

/** Secondary formatting tools — inline on wide toolbars, otherwise behind "…". */
export const EmbeddedToolbarOverflowMenu = ({
  inline = false,
}: EmbeddedToolbarOverflowMenuProps) => {
  const [open, setOpen] = useState(false)

  const extraTools = (
    <>
      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <BlockquoteButton />
        <ColorHighlightPopover />
      </ToolbarGroup>
    </>
  )

  if (inline) {
    return (
      <>
        <ToolbarSeparator />
        {extraTools}
      </>
    )
  }

  return (
    <>
      <ToolbarSeparator />
      <ToolbarGroup>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              aria-label="More formatting options"
              data-active-state={open ? "on" : "off"}
              className="embedded-toolbar-overflow-trigger"
            >
              <MoreHorizontal className="tiptap-button-icon" strokeWidth={2} />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={6}
            className="embedded-toolbar-overflow-content w-auto p-1"
            onOpenAutoFocus={(event) => event.preventDefault()}
          >
            <div className="embedded-toolbar-overflow-panel flex items-center">
              {extraTools}
            </div>
          </PopoverContent>
        </Popover>
      </ToolbarGroup>
    </>
  )
}
