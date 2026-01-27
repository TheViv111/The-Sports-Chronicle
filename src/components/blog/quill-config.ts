import { Quill } from 'react-quill-new';

// Define the toolbar options
export const modules = {
  toolbar: {
    container: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{
        'color': [
          '#e11d48', '#2563eb', '#16a34a', '#d97706', '#7c3aed', '#db2777', '#0891b2',
          '#4b5563', '#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'
        ]
      }, { 'background': [] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean'],
      ['code-block', 'blockquote']
    ],
    handlers: {
      image: function (this: any) {
        const url = prompt('Enter the image URL (or leave blank to upload from your device):');
        if (url && url.trim().length > 0) {
          const range = this.quill.getSelection();
          this.quill.insertEmbed(range ? range.index : 0, 'image', url);
        } else {
          // Trigger the default file upload behavior
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.click();
          input.onchange = () => {
            const file = input.files ? input.files[0] : null;
            if (file) {
              const reader = new FileReader();
              reader.onload = (e) => {
                const range = this.quill.getSelection();
                this.quill.insertEmbed(range ? range.index : 0, 'image', e.target?.result);
              };
              reader.readAsDataURL(file);
            }
          };
        }
      }
    }
  },
  clipboard: {
    matchVisual: false,
    matchers: [
      [Node.TEXT_NODE, (node: any, delta: any) => {
        const urlPattern = /^(https?:\/\/[^\s]+)$/;
        const text = node.data;

        if (urlPattern.test(text)) {
          const url = text.trim();
          const imageExtensions = ['.gif', '.jpg', '.jpeg', '.png', '.webp'];
          const isDirectImage = imageExtensions.some(ext => url.toLowerCase().includes(ext));
          const isGiphyTenor = url.includes('giphy.com/gifs/') || url.includes('tenor.com/view/');

          const videoPatterns = ['youtube.com', 'youtu.be', 'vimeo.com'];
          const isVideo = videoPatterns.some(p => url.toLowerCase().includes(p));

          if (isDirectImage || isGiphyTenor) {
            let mediaUrl = url;
            // Handle common Giphy link formats to try and get something embeddable
            if (url.includes('giphy.com/gifs/')) {
              const urlParts = url.split('-');
              const id = urlParts[urlParts.length - 1];
              mediaUrl = `https://media.giphy.com/media/${id}/giphy.gif`;
            }
            return new (Quill.import('delta'))().insert({ image: mediaUrl });
          } else if (isVideo) {
            // Transform YouTube links to embed format if needed
            let embedUrl = url;
            if (url.includes('youtube.com/watch?v=')) {
              embedUrl = url.replace('watch?v=', 'embed/');
            } else if (url.includes('youtu.be/')) {
              embedUrl = url.replace('youtu.be/', 'youtube.com/embed/');
            }
            return new (Quill.import('delta'))().insert({ video: embedUrl });
          }
        }
        return delta;
      }]
    ]
  },
  keyboard: {
    bindings: {
      customList: {
        key: ' ',
        collapsed: true,
        format: { list: false },
        prefix: /^\d+\.$/,
        handler: function (this: any, range: any, context: any) {
          const value = parseInt(context.prefix);
          if (isNaN(value)) return true; // Fallback to default space behavior

          const quill = this.quill;

          // Delete the pattern (e.g., "2.")
          const patternLength = context.prefix.length;
          quill.deleteText(range.index - patternLength, patternLength);

          // Apply bullet/list format
          quill.formatLine(range.index - patternLength, 1, 'list', 'ordered');

          // Apply custom start number using counter-set style
          // list-0 is the counter name for level 0, list-1 for level 1, etc.
          setTimeout(() => {
            const [line] = quill.getLine(range.index - patternLength);
            const indent = line.formats().indent || 0;
            const counterName = `list-${indent}`;

            // We set the counter to value - 1 because increment happens before display
            quill.formatLine(range.index - patternLength, 1, 'list-start', `${counterName} ${value - 1}`);
          }, 0);

          return false; // Prevent default space
        }
      }
    }
  }
};

// No font faces to add
