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
    ]
  },
  clipboard: {
    matchVisual: false,
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
          // list-0 is the counter name for level 0 ordered lists in Quill
          setTimeout(() => {
            // We set the counter to value - 1 because increment happens before display
            quill.formatLine(range.index - patternLength, 1, 'list-start', `list-0 ${value - 1}`);
          }, 0);

          return false; // Prevent default space
        }
      }
    }
  }
};

// No font faces to add
