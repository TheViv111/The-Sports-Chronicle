import { forwardRef, useEffect, useMemo, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { modules as defaultModules, addFontFaces, fontFamilies } from './quill-config';
import './CustomQuillEditor.css';

// Import Google Fonts
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@fontsource/roboto/900.css';
import '@fontsource/merriweather/400.css';
import '@fontsource/merriweather/700.css';
import '@fontsource/open-sans/400.css';
import '@fontsource/open-sans/600.css';

// Register the font formats with Quill
const Font = ReactQuill.Quill.import('formats/font');
Font.whitelist = Object.keys(fontFamilies);
ReactQuill.Quill.register(Font, true);

interface CustomQuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
  theme?: 'snow' | 'bubble';
}

const CustomQuillEditor = forwardRef<ReactQuill, CustomQuillEditorProps>(({
  value,
  onChange,
  placeholder = 'Write something...',
  className = '',
  readOnly = false,
  theme = 'snow',
}, ref) => {
  const quillRef = useRef<ReactQuill | null>(null);

  // Add font faces to the document
  useEffect(() => {
    addFontFaces();
  }, []);

  // Handle change
  const handleChange = (content: string) => {
    onChange(content);
  };

  // Define the type for the toolbar handler context
  type ToolbarHandler = {
    quill: {
      getSelection: () => { index: number; length: number } | null;
      format: (format: string, value: any) => void;
    };
  };

  // Custom modules to ensure proper font handling
  const editorModules = useMemo(() => ({
    ...defaultModules,
    toolbar: {
      ...defaultModules.toolbar,
      handlers: {
        // Custom font handler to ensure proper font application
        font: function(this: ToolbarHandler, value: string) {
          const quill = this.quill;
          const range = quill.getSelection();
          if (range) {
            if (range.length > 0) {
              // Apply font to selected text only
              quill.format('font', value);
            } else {
              // Set font for new text at cursor position
              quill.format('font', value);
            }
          }
        }
      }
    }
  }), []);

  return (
    <div className={`quill-editor-container ${className}`}>
      <ReactQuill
        ref={(instance) => {
          quillRef.current = instance;
          if (typeof ref === 'function') {
            ref(instance);
          } else if (ref) {
            ref.current = instance;
          }
        }}
        theme={theme}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        modules={editorModules}
        readOnly={readOnly}
        style={{ minHeight: '300px' }}
      />
    </div>
  );
});

CustomQuillEditor.displayName = 'CustomQuillEditor';

export default CustomQuillEditor;
