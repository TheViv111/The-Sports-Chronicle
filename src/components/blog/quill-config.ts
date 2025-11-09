import ReactQuill from 'react-quill';

// Define font families with proper font stacks
export const fontFamilies = {
  'Roboto': 'Roboto, sans-serif',
  'Arial': 'Arial, sans-serif',
  'Georgia': 'Georgia, serif',
  'Verdana': 'Verdana, sans-serif',
  'Courier New': '"Courier New", monospace',
  'Times New Roman': '"Times New Roman", serif',
  'Merriweather': '"Merriweather", serif',
  'Open Sans': '"Open Sans", sans-serif',
  'sans-serif': 'sans-serif',
  'serif': 'serif',
  'monospace': 'monospace'
};

// Register fonts with Quill
const Font = ReactQuill.Quill.import('formats/font');
// Clear any existing font formats
Font.whitelist = [];
// Register our font families
Font.whitelist = Object.keys(fontFamilies);
ReactQuill.Quill.register(Font, true);

// Clear the format for the font to prevent it from being applied to the entire editor
const Block = ReactQuill.Quill.import('blots/block');
Block.tagName = 'DIV';
ReactQuill.Quill.register(Block, true);

// Define the toolbar options
export const modules = {
  toolbar: {
    container: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': Object.keys(fontFamilies) }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean'],
      ['code-block', 'blockquote'],
      // Quill core does not include a table module; remove to avoid non-functional button
    ]
  },
  clipboard: {
    matchVisual: false,
  }
};

// Add font families to the document
export const addFontFaces = () => {
  if (typeof document === 'undefined') return;
  
  const style = document.createElement('style');
  style.textContent = Object.entries(fontFamilies)
    .map(([name, stack]) => `
      /* Style for font dropdown */
      .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="${name}"], 
      .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="${name}"] {
        font-family: ${stack} !important;
      }
      
      /* Style for applying font to selected text */
      .ql-font-${name.toLowerCase().replace(/\s+/g, '-')} {
        font-family: ${stack} !important;
      }`)
    .join('\n');
  document.head.appendChild(style);
};
