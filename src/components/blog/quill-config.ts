// Define the toolbar options
export const modules = {
  toolbar: {
    container: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [
        '#e11d48', '#2563eb', '#16a34a', '#d97706', '#7c3aed', '#db2777', '#0891b2', 
        '#4b5563', '#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'
      ] }, { 'background': [] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean'],
      ['code-block', 'blockquote']
    ]
  },
  clipboard: {
    matchVisual: false,
  }
};

// No font faces to add
