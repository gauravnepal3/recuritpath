import type { Editor } from '@tiptap/react'
import type { VariantProps } from 'class-variance-authority'
import type { toggleVariants } from '@repo/ui/components/toggle'
import { useState } from 'react'
import { ImageIcon } from '@radix-ui/react-icons'
import { ToolbarButton } from '@repo/ui/components/minimal-tiptap/components/toolbar-button.tsx'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogTrigger
} from '@repo/ui/components/dialog'
import { ImageEditBlock } from '@repo/ui/components/minimal-tiptap/components/image/image-edit-block.tsx'

interface ImageEditDialogProps extends VariantProps<typeof toggleVariants> {
  editor: Editor
}

const ImageEditDialog = ({ editor, size, variant }: ImageEditDialogProps) => {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ToolbarButton
          isActive={editor.isActive('image')}
          tooltip="Image"
          aria-label="Image"
          size={size}
          variant={variant}
        >
          <ImageIcon className="size-5" />
        </ToolbarButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Select image</DialogTitle>
          <DialogDescription className="sr-only">Upload an image from your computer</DialogDescription>
        </DialogHeader>
        <ImageEditBlock editor={editor} close={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

export { ImageEditDialog }
