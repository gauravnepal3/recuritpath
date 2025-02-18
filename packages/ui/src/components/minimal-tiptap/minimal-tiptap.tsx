import * as React from 'react'
import './styles/index.css'

import type { Content, Editor } from '@tiptap/react'
import type { UseMinimalTiptapEditorProps } from './hooks/use-minimal-tiptap.js'
import { EditorContent, EditorProvider } from '@tiptap/react'
import { Separator } from '@repo/ui/components/separator'
import { cn } from '@repo/ui/lib/utils'
import { SectionOne } from '@repo/ui/components/minimal-tiptap/components/section/one.tsx'
import { SectionTwo } from '@repo/ui/components/minimal-tiptap/components/section/two.tsx'
import { SectionThree } from '@repo/ui/components/minimal-tiptap/components/section/three.tsx'
import { SectionFour } from '@repo/ui/components/minimal-tiptap/components/section/four.tsx'
import { SectionFive } from '@repo/ui/components/minimal-tiptap/components/section/five.tsx'
import { LinkBubbleMenu } from './components/bubble-menu/link-bubble-menu.tsx'
import { useMinimalTiptapEditor } from '@repo/ui/components/minimal-tiptap//hooks/use-minimal-tiptap.ts'
import { MeasuredContainer } from '@repo/ui/components/minimal-tiptap/components/measured-container.tsx'

export interface MinimalTiptapProps extends Omit<UseMinimalTiptapEditorProps, 'onUpdate'> {
  value?: Content
  onChange?: (value: Content) => void
  className?: string
  editorContentClassName?: string
}

const Toolbar = ({ editor }: { editor: Editor }) => (
  <div className="shrink-0 overflow-x-auto border-b border-border p-2">
    <div className="flex w-max items-center gap-px">
      <SectionOne editor={editor} activeLevels={[1, 2, 3, 4, 5, 6]} />

      <Separator orientation="vertical" className="mx-2 h-7" />

      <SectionTwo
        editor={editor}
        activeActions={['bold', 'italic', 'underline', 'strikethrough', 'code', 'clearFormatting']}
        mainActionCount={3}
      />

      <Separator orientation="vertical" className="mx-2 h-7" />

      <SectionThree editor={editor} />

      <Separator orientation="vertical" className="mx-2 h-7" />

      <SectionFour editor={editor} activeActions={['orderedList', 'bulletList']} mainActionCount={0} />

      <Separator orientation="vertical" className="mx-2 h-7" />

      <SectionFive editor={editor} activeActions={['codeBlock', 'blockquote', 'horizontalRule']} mainActionCount={0} />
    </div>
  </div>
)

export const MinimalTiptapEditor = React.forwardRef<HTMLDivElement, MinimalTiptapProps>(
  ({ value, onChange, className, editorContentClassName, ...props }, ref) => {
    const editor = useMinimalTiptapEditor({
      value,
      onUpdate: onChange,
      ...props
    })

    if (!editor) {
      return null
    }

    return (
      <MeasuredContainer
        as="div"
        name="editor"
        ref={ref}
        className={cn(
          'flex h-auto min-h-72 w-full flex-col rounded-md border border-input',
          className
        )}
      >
        <Toolbar editor={editor} />

        <EditorContent editor={editor} className={cn('minimal-tiptap-editor [&>div:first-child]:h-full [&>div:first-child>div:first-child]:h-full', editorContentClassName)} />
        <LinkBubbleMenu editor={editor} />
      </MeasuredContainer>
    )
  }
)

MinimalTiptapEditor.displayName = 'MinimalTiptapEditor'

export default MinimalTiptapEditor
