import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/components/common/ThemeProvider';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = 'Write your content here...',
  className = '',
}) => {
  const { theme } = useTheme();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Force a re-render when theme changes to ensure proper styling
  useEffect(() => {
    // This effect ensures the component updates when the theme changes
  }, [theme]);

  return (
    <div className={`relative ${className}`}>
      <textarea
        ref={textareaRef}
        className={`
          w-full min-h-64 h-96 resize-y rounded-md border 
          border-input bg-background p-3 text-sm 
          focus-visible:outline-none focus-visible:ring-2 
          focus-visible:ring-ring focus-visible:ring-offset-2
          disabled:cursor-not-allowed disabled:opacity-50
          transition-colors duration-200
          dark:border-gray-700 dark:bg-gray-800/50 dark:text-foreground
          dark:placeholder:text-gray-500
          ${className}
        `}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        style={{
          minHeight: '16rem',
        }}
      />
    </div>
  );
};

export default RichTextEditor;