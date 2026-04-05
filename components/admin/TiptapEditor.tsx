import React, { useEffect } from 'react';
import { useEditor, EditorContent, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Highlight } from '@tiptap/extension-highlight';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, 
  Type, Palette, Highlighter, AlignLeft, AlignCenter, 
  AlignRight, List, ListOrdered, Heading1, Heading2, 
  Heading3, Link as LinkIcon, Image as ImageIcon, 
  Table as TableIcon, Undo, Redo, Quote, Code, ChevronDown,
  AlignJustify, Indent as IndentIcon, Outdent as OutdentIcon
} from 'lucide-react';
import { Markdown } from 'tiptap-markdown';

// Custom font size extension
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
  addCommands(): any {
    return {
      setFontSize: (fontSize: string) => ({ chain }: any) => {
        return chain().setMark('textStyle', { fontSize }).run();
      },
      unsetFontSize: () => ({ chain }: any) => {
        return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run();
      },
    };
  },
});

// Custom Indent extension
const Indent = Extension.create({
  name: 'indent',
  addOptions() {
    return {
      types: ['paragraph', 'heading', 'blockquote'],
      minLevel: 0,
      maxLevel: 3,
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            default: 0,
            parseHTML: element => parseInt(element.getAttribute('data-indent') || '0', 10),
            renderHTML: attributes => {
              if (!attributes.indent) return {};
              return { 
                'data-indent': attributes.indent,
                class: `indent-${attributes.indent} professional-doc` 
              };
            },
          },
        },
      },
    ];
  },
  addCommands(): any {
    return {
      indent: () => ({ tr, state, dispatch }: any) => {
        const { selection } = state;
        tr = tr.setSelection(selection);
        const { from, to } = selection;
        state.doc.nodesBetween(from, to, (node: any, pos: any) => {
          if (this.options.types.includes(node.type.name)) {
            const currentIndent = node.attrs.indent || 0;
            const newIndent = Math.min(currentIndent + 1, this.options.maxLevel);
            if (newIndent !== currentIndent) {
              tr = tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent: newIndent });
            }
          }
        });
        if (dispatch) dispatch(tr);
        return true;
      },
      outdent: () => ({ tr, state, dispatch }: any) => {
        const { selection } = state;
        tr = tr.setSelection(selection);
        const { from, to } = selection;
        state.doc.nodesBetween(from, to, (node: any, pos: any) => {
          if (this.options.types.includes(node.type.name)) {
            const currentIndent = node.attrs.indent || 0;
            const newIndent = Math.max(currentIndent - 1, this.options.minLevel);
            if (newIndent !== currentIndent) {
              tr = tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent: newIndent });
            }
          }
        });
        if (dispatch) dispatch(tr);
        return true;
      },
    };
  },
});

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const setLink = () => {
    const url = window.prompt('URL');
    if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 z-10">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('bold') ? 'bg-primary-100 text-primary-600' : 'text-slate-600 dark:text-slate-400'}`} title="Bold"><Bold size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('italic') ? 'bg-primary-100 text-primary-600' : 'text-slate-600 dark:text-slate-400'}`} title="Italic"><Italic size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('underline') ? 'bg-primary-100 text-primary-600' : 'text-slate-600 dark:text-slate-400'}`} title="Underline"><UnderlineIcon size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('strike') ? 'bg-primary-100 text-primary-600' : 'text-slate-600 dark:text-slate-400'}`} title="Strike"><Strikethrough size={18} /></button>
      
      <div className="w-[1px] h-6 bg-slate-300 dark:bg-slate-700 mx-1 self-center" />

      {/* Font Size Selector */}
      <div className="relative group/size flex items-center">
        <select 
          onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
          className="appearance-none bg-transparent h-8 pl-3 pr-8 rounded border border-transparent hover:border-slate-300 dark:hover:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 focus:outline-none"
          title="Font Size"
        >
          <option value="">Size</option>
          <option value="12px">XS (12)</option>
          <option value="14px">S (14)</option>
          <option value="16px">M (16)</option>
          <option value="20px">L (20)</option>
          <option value="24px">XL (24)</option>
          <option value="32px">XXL (32)</option>
        </select>
        <ChevronDown size={12} className="absolute right-2 pointer-events-none text-slate-400" />
      </div>

      <div className="w-[1px] h-6 bg-slate-300 dark:bg-slate-700 mx-1 self-center" />

      {/* Color Picker (Basic) */}
      <input 
        type="color" 
        onInput={(e: any) => editor.chain().focus().setColor(e.target.value).run()} 
        className="w-8 h-8 p-1 bg-transparent border-none cursor-pointer"
        title="Text Color"
      />
      
      {/* Highlight Color */}
      <button type="button" onClick={() => editor.chain().focus().toggleHighlight({ color: '#ffcc00' }).run()} className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('highlight') ? 'bg-amber-100 text-amber-700' : 'text-slate-600 dark:text-slate-400'}`} title="Highlight"><Highlighter size={18} /></button>

      <div className="w-[1px] h-6 bg-slate-300 dark:bg-slate-700 mx-1 self-center" />

      <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive({ textAlign: 'left' }) ? 'bg-primary-100 text-primary-600' : 'text-slate-600 dark:text-slate-400'}`} title="Align Left"><AlignLeft size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive({ textAlign: 'center' }) ? 'bg-primary-100 text-primary-600' : 'text-slate-600 dark:text-slate-400'}`} title="Align Center"><AlignCenter size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive({ textAlign: 'right' }) ? 'bg-primary-100 text-primary-600' : 'text-slate-600 dark:text-slate-400'}`} title="Align Right"><AlignRight size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-primary-100 text-primary-600' : 'text-slate-600 dark:text-slate-400'}`} title="Justify"><AlignJustify size={18} /></button>

      <div className="w-[1px] h-6 bg-slate-300 dark:bg-slate-700 mx-1 self-center" />

      <button type="button" onClick={() => editor.chain().focus().indent().run()} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400" title="Indent"><IndentIcon size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().outdent().run()} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400" title="Outdent"><OutdentIcon size={18} /></button>

      <div className="w-[1px] h-6 bg-slate-300 dark:bg-slate-700 mx-1 self-center" />

      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('bulletList') ? 'bg-primary-100 text-primary-600' : 'text-slate-600 dark:text-slate-400'}`} title="Bullet List"><List size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('orderedList') ? 'bg-primary-100 text-primary-600' : 'text-slate-600 dark:text-slate-400'}`} title="Ordered List"><ListOrdered size={18} /></button>

      <div className="w-[1px] h-6 bg-slate-300 dark:bg-slate-700 mx-1 self-center" />

      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('heading', { level: 1 }) ? 'bg-primary-100 text-primary-600' : 'text-slate-600 dark:text-slate-400 font-bold'}`} title="H1"><Heading1 size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('heading', { level: 2 }) ? 'bg-primary-100 text-primary-600' : 'text-slate-600 dark:text-slate-400 font-bold'}`} title="H2"><Heading2 size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('heading', { level: 3 }) ? 'bg-primary-100 text-primary-600' : 'text-slate-600 dark:text-slate-400 font-bold'}`} title="H3"><Heading3 size={18} /></button>

      <div className="w-[1px] h-6 bg-slate-300 dark:bg-slate-700 mx-1 self-center" />

      <button type="button" onClick={setLink} className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('link') ? 'bg-primary-100 text-primary-600' : 'text-slate-600 dark:text-slate-400'}`} title="Link"><LinkIcon size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('blockquote') ? 'bg-primary-100 text-primary-600' : 'text-slate-600 dark:text-slate-400'}`} title="Quote"><Quote size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('codeBlock') ? 'bg-primary-100 text-primary-600' : 'text-slate-600 dark:text-slate-400'}`} title="Code Block"><Code size={18} /></button>

      <div className="flex-1" />
      <button type="button" onClick={() => editor.chain().focus().undo().run()} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><Undo size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><Redo size={18} /></button>
    </div>
  );
};

export default function TiptapEditor({ content, onChange, placeholder }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Color,
      TextStyle,
      Highlight.configure({ multicolor: true }),
      FontSize,
      Indent,
      TextAlign.configure({ 
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
        defaultAlignment: 'justify',
      }),
      Link.configure({ openOnClick: false }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Markdown,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'tiptap prose prose-sm md:prose-base dark:prose-invert document-paper professional-doc max-w-none focus:outline-none min-h-[500px] shadow-none border-none rounded-none',
      },
    },
  });

  // Update content if it changes externally (e.g. from DB load)
  // But ONLY if the content is different to avoid cursor reset.
  useEffect(() => {
    if (editor && content !== editor.getHTML() && !editor.isFocused) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  return (
    <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="tiptap-container" />
    </div>
  );
}
