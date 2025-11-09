import React, { forwardRef, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useTheme } from '../common/ThemeProvider';

interface CustomQuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  modules?: any;
  theme?: string;
}

// Extend ReactQuill types to include the editingArea property
type CustomReactQuill = ReactQuill & {
  editingArea?: HTMLDivElement | null;
};

const CustomQuillEditor = forwardRef<ReactQuill, CustomQuillEditorProps>(
  ({ value, onChange, placeholder, className, modules, theme: editorTheme = 'snow' }, ref) => {
    const { theme: appTheme } = useTheme();
    const quillRef = useRef<CustomReactQuill>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Combine refs
    React.useEffect(() => {
      if (ref) {
        if (typeof ref === 'function') {
          ref(quillRef.current);
        } else {
          (ref as React.MutableRefObject<ReactQuill | null>).current = quillRef.current;
        }
      }
    }, [ref]);

    // Handle theme changes
    useEffect(() => {
      const updateTheme = () => {
        if (containerRef.current) {
          if (appTheme === 'dark') {
            containerRef.current.classList.add('dark');
            document.documentElement.classList.add('quill-dark');
          } else {
            containerRef.current.classList.remove('dark');
            document.documentElement.classList.remove('quill-dark');
          }
        }
      };

      // Initial theme setup
      updateTheme();

      // Force update to apply theme changes
      const timer = setTimeout(() => {
        if (quillRef.current) {
          const editor = quillRef.current.getEditor();
          editor.enable(false);
          editor.enable(true);
        }
      }, 0);
      
      return () => clearTimeout(timer);
    }, [appTheme]);

    return (
      <div ref={containerRef} className={`quill-container ${className || ''}`}>
        <ReactQuill
          ref={quillRef}
          theme={editorTheme}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          modules={modules}
          className="min-h-[300px]"
        />
      </div>
    );
  }
);

CustomQuillEditor.displayName = 'CustomQuillEditor';

export default CustomQuillEditor;
