import { Quill } from 'react-quill-new';

export function setupQuill() {
  const Font = Quill.import('formats/font') as any;
  Font.whitelist = [
    'inter', 'playfair-display', 'arial', 'sans-serif', 'serif', 'monospace'
  ]; // Add desired fonts
  Quill.register(Font, true);

  const Size = Quill.import('attributors/style/size') as any;
  Size.whitelist = [
    '8px', '9px', '10px', '11px', '12px', '14px', '16px', '18px', '20px', '24px', '32px', '48px', '64px', '72px'
  ]; // Add desired sizes
  Quill.register(Size, true);

  const FontAttributor = Quill.import('attributors/class/font') as any;
  Quill.register(FontAttributor, true);

  const Bold = Quill.import('formats/bold') as any;
  const Italic = Quill.import('formats/italic') as any;
  const Underline = Quill.import('formats/underline') as any;
  const Video = Quill.import('formats/video') as any;

  Quill.register(Bold, true);
  Quill.register(Italic, true);
  Quill.register(Underline, true);
  Quill.register(Video, true);

  // Add support for custom list start numbers via counter-set
  try {
    const Parchment = Quill.import('parchment') as any;

    // Use the dynamic constructor for style attributors
    const Style = Parchment.StyleAttributor || (Quill.import('attributors/style/size') as any).constructor;

    const ListStart = new Style('list-start', 'counter-set', {
      scope: Parchment.Scope.BLOCK
    });
    Quill.register(ListStart, true);
  } catch (e) {
    console.error('Failed to register Quill list-start style:', e);
  }
}
