import { forwardRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'quill/dist/quill.snow.css';
import { modules as defaultModules } from './quill-config';
import './CustomQuillEditor.css';
import { setupQuill } from '@/lib/quill-setup';
import { useEffect } from 'react';

interface CustomQuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
  theme?: 'snow' | 'bubble';
  modules?: any;
}

  const CustomQuillEditor = forwardRef<ReactQuill, CustomQuillEditorProps>(({
    className = '',
    value,
    onChange,
    readOnly = false,
    placeholder = ''
  }, ref) => {
    useEffect(() => {
      setupQuill(); // Setup Quill on component mount
    }, []);
  return (
    <div className={`quill-editor-container ${className}`}>
      <ReactQuill
        ref={ref}
        theme={theme}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules || defaultModules}
        readOnly={readOnly}
        style={{ minHeight: '300px' }}
      />
    </div>
  );
});

CustomQuillEditor.displayName = 'CustomQuillEditor';

export default CustomQuillEditor;
