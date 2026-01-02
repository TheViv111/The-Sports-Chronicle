import { Quill } from 'react-quill-new';

export function setupQuill() {
  const Font = Quill.import('formats/font');
  Font.whitelist = [
    'inter', 'playfair-display', 'arial', 'sans-serif', 'serif', 'monospace'
  ]; // Add desired fonts
  Quill.register(Font, true);

  const Size = Quill.import('attributors/style/size');
  Size.whitelist = [
    '8px', '9px', '10px', '11px', '12px', '14px', '16px', '18px', '20px', '24px', '32px', '48px', '64px', '72px'
  ]; // Add desired sizes
  Quill.register(Size, true);

  const FontAttributor = Quill.import('attributors/class/font');
  Quill.register(FontAttributor, true);

  const Bold = Quill.import('formats/bold');
  const Italic = Quill.import('formats/italic');
  const Underline = Quill.import('formats/underline');

  Quill.register(Bold, true);
  Quill.register(Italic, true);
  Quill.register(Underline, true);

  // Add more custom registrations here if needed
}
