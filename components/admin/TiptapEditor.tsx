import React, { useEffect } from 'react';
import { useEditor, EditorContent, Extension, mergeAttributes } from '@tiptap/react';
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
  AlignJustify, Indent as IndentIcon, Outdent as OutdentIcon,
  Layout, Bookmark
} from 'lucide-react';

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

// Helper to parse full style attribute
const styleAttr = {
  style: {
    default: null,
    parseHTML: (element: HTMLElement) => element.getAttribute('style') || null,
    renderHTML: (attributes: any) => {
      if (!attributes.style) return {};
      return { style: attributes.style };
    },
  },
  class: {
    default: null,
    parseHTML: (element: HTMLElement) => element.getAttribute('class') || null,
    renderHTML: (attributes: any) => {
      if (!attributes.class) return {};
      return { class: attributes.class };
    },
  },
};

// Custom Table extensions to preserve style and class
const CustomTable = Table.extend({
  addAttributes() {
    return { ...this.parent?.(), ...styleAttr };
  },
});

const CustomTableRow = TableRow.extend({
  addAttributes() {
    return { ...this.parent?.(), ...styleAttr };
  },
});

const CustomTableCell = TableCell.extend({
  addAttributes() {
    return { ...this.parent?.(), ...styleAttr };
  },
});

const CustomTableHeader = TableHeader.extend({
  addAttributes() {
    return { ...this.parent?.(), ...styleAttr };
  },
});

// Custom Indent extension (unchanged)
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

  const insertMasterHeader = () => {
    const tableStyle = 'border:4px solid #000;width:100%;border-collapse:collapse;table-layout:fixed;margin-bottom:24px;';
    const cellBase = 'border:1px solid #000;padding:10px 16px;vertical-align:middle;';

    // p tags get explicit text-align so Tiptap's TextAlign extension registers it correctly
    const pC = 'style="text-align:center;margin:0;line-height:1.5;"'; // center paragraph
    const pL = 'style="text-align:left;margin:0;line-height:1.5;"';   // left paragraph
    const pR = 'style="text-align:right;margin:0;line-height:1.5;"';  // right paragraph
    const pCW = 'style="text-align:center;margin:0;color:#fff;line-height:1.5;"'; // center white

    const html = `<table style="${tableStyle}"><tbody>`
      + `<tr><td colspan="2" style="${cellBase}"><p ${pC}><strong>लोक सेवा आयोग</strong></p></td></tr>`
      + `<tr><td colspan="2" style="${cellBase}"><p ${pC}>कृषि विकास बैंक लिमिटेड, प्रशासन, चौथो, लेखपाल पदको</p><p ${pC}>खुल्ला प्रतियोगितात्मक लिखित परीक्षा</p></td></tr>`
      + `<tr><td colspan="2" style="${cellBase}background-color:#000;padding:8px 16px;"><p ${pCW}><strong>२०८१/०४/१२</strong></p></td></tr>`
      + `<tr><td style="${cellBase}vertical-align:top;"><p ${pL}>पत्र : द्वितीय</p><p ${pL}>समय: २ घण्टा ३० मिनेट</p></td><td style="${cellBase}vertical-align:top;"><p ${pR}>पूर्णाङ्क : १००</p></td></tr>`
      + `<tr><td colspan="2" style="${cellBase}"><p ${pC}><strong>विषय : सेवा सम्बन्धी</strong></p></td></tr>`
      + `</tbody></table><p></p>`;
    editor.chain().focus().insertContent(html, { parseOptions: { preserveWhitespace: false } }).run();
  };

  const insertSectionHeader = () => {
    const section = window.prompt('Section Name (e.g. खण्ड "क")', 'खण्ड "क"');
    const marks = window.prompt('Marks (e.g. ५० अङ्क)', '५० अङ्क');
    if (section) {
      // Use a borderless table for section - Tiptap converts <div> to <p>, destroying flex layout
      const noCell = 'border:none;padding:8px 0;vertical-align:middle;';
      const html = `<table style="width:100%;border:none;border-collapse:collapse;margin:3rem 0 1.5rem 0;"><tbody>`
        + `<tr>`
        + `<td style="${noCell}width:33%;"></td>`
        + `<td style="${noCell}text-align:center;font-weight:800;font-size:1.35rem;width:34%;">${section}</td>`
        + `<td style="${noCell}text-align:right;font-weight:800;font-size:1.1rem;width:33%;white-space:nowrap;">${marks}</td>`
        + `</tr>`
        + `</tbody></table><p></p>`;
      editor.chain().focus().insertContent(html).run();
    }
  };

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 z-10 sticky top-0">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('bold') ? 'bg-primary-100 text-primary-600' : 'text-slate-600 dark:text-slate-400'}`} title="Bold"><Bold size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('italic') ? 'bg-primary-100 text-primary-600' : 'text-slate-600 dark:text-slate-400'}`} title="Italic"><Italic size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('underline') ? 'bg-primary-100 text-primary-600' : 'text-slate-600 dark:text-slate-400'}`} title="Underline"><UnderlineIcon size={18} /></button>
      
      <div className="w-[1px] h-6 bg-slate-300 dark:bg-slate-700 mx-1 self-center" />

      {/* Font Size Selector */}
      <div className="relative group/size flex items-center">
        <select 
          onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
          className="appearance-none bg-transparent h-8 pl-3 pr-8 rounded border border-transparent hover:border-slate-300 dark:hover:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 focus:outline-none"
          title="Font Size"
        >
          <option value="">Size</option>
          <option value="12px">12</option>
          <option value="14px">14</option>
          <option value="16px">16</option>
          <option value="18px">18</option>
          <option value="20px">20</option>
          <option value="24px">24</option>
        </select>
        <ChevronDown size={12} className="absolute right-2 pointer-events-none text-slate-400" />
      </div>

      <div className="w-[1px] h-6 bg-slate-300 dark:bg-slate-700 mx-1 self-center" />
      
      {/* Templates */}
      <button type="button" onClick={insertMasterHeader} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-200 dark:bg-slate-800 hover:bg-primary-600 hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider" title="Insert PSC Header">
        <Layout size={14} />
        <span>PSC Header</span>
      </button>

      <button type="button" onClick={insertSectionHeader} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-200 dark:bg-slate-800 hover:bg-primary-600 hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider" title="Insert Section Row">
        <Bookmark size={14} />
        <span>Section</span>
      </button>

      <div className="w-[1px] h-6 bg-slate-300 dark:bg-slate-700 mx-1 self-center" />

      <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive({ textAlign: 'left' }) ? 'bg-primary-100 text-primary-600' : 'text-slate-600 dark:text-slate-400'}`} title="Align Left"><AlignLeft size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive({ textAlign: 'center' }) ? 'bg-primary-100 text-primary-600' : 'text-slate-600 dark:text-slate-400'}`} title="Align Center"><AlignCenter size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive({ textAlign: 'right' }) ? 'bg-primary-100 text-primary-600' : 'text-slate-600 dark:text-slate-400'}`} title="Align Right"><AlignRight size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-primary-100 text-primary-600' : 'text-slate-600 dark:text-slate-400'}`} title="Justify"><AlignJustify size={18} /></button>

      <div className="w-[1px] h-6 bg-slate-300 dark:bg-slate-700 mx-1 self-center" />

      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('bulletList') ? 'bg-primary-100 text-primary-600' : 'text-slate-600 dark:text-slate-400'}`} title="Bullet List"><List size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('orderedList') ? 'bg-primary-100 text-primary-600' : 'text-slate-600 dark:text-slate-400'}`} title="Ordered List"><ListOrdered size={18} /></button>

      <div className="w-[1px] h-6 bg-slate-300 dark:bg-slate-700 mx-1 self-center" />

      <button type="button" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400" title="Insert Table"><TableIcon size={18} /></button>
      <button type="button" onClick={setLink} className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('link') ? 'bg-primary-100 text-primary-600' : 'text-slate-600 dark:text-slate-400'}`} title="Link"><LinkIcon size={18} /></button>
      
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
        codeBlock: false,
        code: false,
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
      CustomTable.configure({ resizable: true }),
      CustomTableRow,
      CustomTableHeader,
      CustomTableCell,
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
