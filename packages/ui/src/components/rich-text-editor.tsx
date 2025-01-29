import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { Bold, Italic, Underline } from "lucide-react";

const RichTextEditor = () => {
    const editor = useEditor({
        extensions: [StarterKit],
        content: "<p>Start typing...</p>",
    });

    if (!editor) {
        return null;
    }

    return (
        <div className="">


            <EditorContent editor={editor} className="border p-4 rounded-md" />
        </div>
    );
};

export default RichTextEditor;
