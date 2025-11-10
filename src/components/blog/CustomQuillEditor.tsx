import { forwardRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { modules } from './quill-config';
import './CustomQuillEditor.css';

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
  theme = 'snow'
}, ref) => {
  return (
    <div className={`quill-editor-container ${className}`}>
      <ReactQuill
        ref={ref}
        theme={theme}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        readOnly={readOnly}
        style={{ minHeight: '300px' }}
      />
    </div>
  );
});

CustomQuillEditor.displayName = 'CustomQuillEditor';

export default CustomQuillEditor;
