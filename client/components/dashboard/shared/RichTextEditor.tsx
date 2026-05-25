"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link as LinkIcon,
  Eraser,
  Heading1,
  Heading2,
  Strikethrough,
  Quote,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Editor } from "@tiptap/react";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: string | number;
  onSave?: () => void;
}

const Toolbar = ({
  editor,
  isFullScreen,
  onToggleFullScreen,
  onSave,
}: {
  editor: Editor | null;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
  onSave?: () => void;
}) => {
  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("Enter URL");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b bg-transparent rounded-t-lg">
      {/* History */}
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="p-1.5 rounded hover:bg-muted transition-colors disabled:opacity-30"
        title="Undo"
      >
        <Undo size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="p-1.5 rounded hover:bg-muted transition-colors disabled:opacity-30"
        title="Redo"
      >
        <Redo size={18} />
      </button>

      <div className="w-px h-6 bg-border mx-1 self-center" />

      {/* Typography */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-1.5 rounded hover:bg-muted transition-colors ${
          editor.isActive("heading", { level: 1 })
            ? "bg-accent text-accent-foreground"
            : ""
        }`}
        title="Heading 1"
      >
        <Heading1 size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1.5 rounded hover:bg-muted transition-colors ${
          editor.isActive("heading", { level: 2 })
            ? "bg-accent text-accent-foreground"
            : ""
        }`}
        title="Heading 2"
      >
        <Heading2 size={18} />
      </button>

      <div className="w-px h-6 bg-border mx-1 self-center" />

      {/* Main Formatting */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded hover:bg-muted transition-colors ${
          editor.isActive("bold") ? "bg-accent text-accent-foreground" : ""
        }`}
        title="Bold"
      >
        <Bold size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded hover:bg-muted transition-colors ${
          editor.isActive("italic") ? "bg-accent text-accent-foreground" : ""
        }`}
        title="Italic"
      >
        <Italic size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1.5 rounded hover:bg-muted transition-colors ${
          editor.isActive("underline") ? "bg-accent text-accent-foreground" : ""
        }`}
        title="Underline"
      >
        <UnderlineIcon size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-1.5 rounded hover:bg-muted transition-colors ${
          editor.isActive("strike") ? "bg-accent text-accent-foreground" : ""
        }`}
        title="Strike"
      >
        <Strikethrough size={18} />
      </button>

      <div className="w-px h-6 bg-border mx-1 self-center" />

      {/* Alignment */}
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className={`p-1.5 rounded hover:bg-muted transition-colors ${
          editor.isActive({ textAlign: "left" })
            ? "bg-accent text-accent-foreground"
            : ""
        }`}
        title="Align Left"
      >
        <AlignLeft size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className={`p-1.5 rounded hover:bg-muted transition-colors ${
          editor.isActive({ textAlign: "center" })
            ? "bg-accent text-accent-foreground"
            : ""
        }`}
        title="Align Center"
      >
        <AlignCenter size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className={`p-1.5 rounded hover:bg-muted transition-colors ${
          editor.isActive({ textAlign: "right" })
            ? "bg-accent text-accent-foreground"
            : ""
        }`}
        title="Align Right"
      >
        <AlignRight size={18} />
      </button>

      <div className="w-px h-6 bg-border mx-1 self-center" />

      {/* Lists & Layout */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded hover:bg-muted transition-colors ${
          editor.isActive("bulletList")
            ? "bg-accent text-accent-foreground"
            : ""
        }`}
        title="Bullet List"
      >
        <List size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded hover:bg-muted transition-colors ${
          editor.isActive("orderedList")
            ? "bg-accent text-accent-foreground"
            : ""
        }`}
        title="Ordered List"
      >
        <ListOrdered size={18} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-1.5 rounded hover:bg-muted transition-colors ${
          editor.isActive("blockquote")
            ? "bg-accent text-accent-foreground"
            : ""
        }`}
        title="Blockquote"
      >
        <Quote size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="p-1.5 rounded hover:bg-muted transition-colors"
        title="Horizontal Rule"
      >
        <Minus size={18} />
      </button>

      <div className="w-px h-6 bg-border mx-1 self-center" />

      {/* Links & Clear */}
      <button
        type="button"
        onClick={addLink}
        className={`p-1.5 rounded hover:bg-muted transition-colors ${
          editor.isActive("link") ? "bg-accent text-accent-foreground" : ""
        }`}
        title="Add Link"
      >
        <LinkIcon size={18} />
      </button>

      <div className="flex-1" />

      {isFullScreen && onSave && (
        <button
          type="button"
          onClick={onSave}
          className="px-3 py-1.5 rounded bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors mr-2"
        >
          Update Settings
        </button>
      )}

      <button
        type="button"
        onClick={onToggleFullScreen}
        className="p-1.5 rounded hover:bg-muted transition-colors text-primary ml-auto"
        title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
      >
        {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
      </button>

      <div className="w-px h-6 bg-border mx-1 self-center" />

      <button
        type="button"
        onClick={() =>
          editor.chain().focus().unsetAllMarks().clearNodes().run()
        }
        className="p-1.5 rounded hover:bg-muted transition-colors text-red-500"
        title="Clear Formatting"
      >
        <Eraser size={18} />
      </button>
    </div>
  );
};

const RichTextEditor = ({
  value,
  onChange,
  placeholder,
  height = "200px",
  onSave,
}: RichTextEditorProps) => {
  const [isFullScreen, setIsFullScreen] = React.useState(false);

  // Handle Escape key to exit full screen
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isFullScreen]);

  // Disable body scroll when in full screen
  useEffect(() => {
    if (isFullScreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isFullScreen]);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: placeholder || "Write something...",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    immediatelyRender: false,
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm dark:prose-invert max-w-none focus:outline-none p-4 ${
          isFullScreen ? "min-h-[calc(100vh-80px)]" : "min-h-full"
        }`,
      },
    },
  });

  // Keep editor content in sync with external value
  useEffect(() => {
    if (!editor) return;

    // Only update if the value is different and the user is not currently typing (focused)
    const currentHTML = editor.getHTML();
    if (
      value !== undefined &&
      value !== null &&
      value !== currentHTML &&
      !editor.isFocused
    ) {
      const isEmptyEditor = currentHTML === "<p></p>" || currentHTML === "";
      const isEmptyValue = value === "" || value === "<p></p>";

      if (!(isEmptyEditor && isEmptyValue)) {
        editor.commands.setContent(value, { emitUpdate: false });
      }
    }
  }, [value, editor]);

  return (
    <div
      className={`flex flex-col border border-input rounded-md focus-within:ring-1 focus-within:ring-ring bg-background transition-all duration-300 ${
        isFullScreen
          ? "fixed inset-0 z-99999 rounded-none w-screen h-screen"
          : "relative overflow-hidden bg-secondary/30"
      }`}
    >
      <Toolbar
        editor={editor}
        isFullScreen={isFullScreen}
        onToggleFullScreen={() => setIsFullScreen(!isFullScreen)}
        onSave={onSave}
      />
      <div
        className="overflow-y-auto flex-1"
        style={{
          height: isFullScreen
            ? "calc(100vh - 50px)"
            : typeof height === "number"
              ? `${height}px`
              : height,
        }}
      >
        <EditorContent editor={editor} className="h-full cursor-text" />
      </div>
    </div>
  );
};

export default RichTextEditor;
