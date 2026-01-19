import { useState, useEffect } from 'react';
import { Box, Typography, useTheme as useMuiTheme } from '@mui/material';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { useTheme } from '../context/ThemeContext';
import React from 'react';

const RichTextEditor = ({ value, onChange, label, error, helperText, disabled, minHeight = 200 }) => {
  const [editorData, setEditorData] = useState(value || '');
  const { mode } = useTheme();
  const muiTheme = useMuiTheme();

  useEffect(() => {
    setEditorData(value || '');
  }, [value]);

  // Inject dark mode styles for CKEditor
  useEffect(() => {
    const styleId = 'ckeditor-dark-mode';
    let style = document.getElementById(styleId);
    
    if (mode === 'dark') {
      if (!style) {
        style = document.createElement('style');
        style.id = styleId;
        document.head.appendChild(style);
      }
      style.textContent = `
        .ck-editor__editable {
          background-color: #1e1e1e !important;
          color: #ffffff !important;
        }
        .ck-editor__editable.ck-focused {
          background-color: #1e1e1e !important;
          color: #ffffff !important;
          box-shadow: none !important;
        }
        .ck-editor__editable p {
          color: #ffffff !important;
        }
        .ck-editor__editable h1,
        .ck-editor__editable h2,
        .ck-editor__editable h3,
        .ck-editor__editable h4,
        .ck-editor__editable h5,
        .ck-editor__editable h6 {
          color: #ffffff !important;
        }
        .ck-editor__editable ul,
        .ck-editor__editable ol {
          color: #ffffff !important;
        }
        .ck-editor__editable blockquote {
          color: #ffffff !important;
          border-left-color: #424242 !important;
        }
        .ck-editor__editable a {
          color: #64b5f6 !important;
        }
        .ck-toolbar {
          background-color: #2d2d2d !important;
          border-color: #424242 !important;
        }
        .ck-toolbar__separator {
          background-color: #424242 !important;
        }
        .ck-button {
          color: #ffffff !important;
        }
        .ck-button:hover:not(.ck-disabled) {
          background-color: #424242 !important;
        }
        .ck-button.ck-on {
          background-color: #424242 !important;
        }
        .ck-dropdown__panel {
          background-color: #2d2d2d !important;
          border-color: #424242 !important;
        }
        .ck-list__item {
          color: #ffffff !important;
        }
        .ck-list__item:hover {
          background-color: #424242 !important;
        }
        .ck-list__item.ck-on {
          background-color: #424242 !important;
        }
        .ck-input-text {
          background-color: #1e1e1e !important;
          color: #ffffff !important;
          border-color: #424242 !important;
        }
        .ck-input-text:focus {
          border-color: #1976d2 !important;
        }
        .ck-placeholder::before {
          color: rgba(255, 255, 255, 0.5) !important;
        }
        .ck-editor__editable span[data-user-id] {
          background-color: rgba(25, 118, 210, 0.2) !important;
          color: #64b5f6 !important;
          padding: 2px 6px !important;
          border-radius: 4px !important;
          font-weight: 500 !important;
          display: inline-block !important;
          margin-right: 4px !important;
        }
      `;
    } else {
      if (style) {
        style.textContent = '';
      }
    }
    
    return () => {
      // Cleanup on unmount
      if (style && mode === 'light') {
        style.textContent = '';
      }
    };
  }, [mode]);

  const handleEditorChange = (event, editor) => {
    const data = editor.getData();
    setEditorData(data);
    if (onChange) {
      // Create a synthetic event object to match Material-UI TextField onChange signature
      const syntheticEvent = {
        target: {
          value: data,
          name: 'description'
        }
      };
      onChange(syntheticEvent);
    }
  };

  return (
    <Box>
      {label && (
        <Typography
          variant="body2"
          sx={{
            mb: 1,
            color: error ? 'error.main' : 'text.secondary',
            fontWeight: 500
          }}
        >
          {label}
        </Typography>
      )}
      <Box
        sx={{
          border: error ? '1px solid' : '1px solid',
          borderColor: error ? 'error.main' : 'divider',
          borderRadius: 1,
          overflow: 'hidden',
          bgcolor: mode === 'dark' ? 'background.paper' : 'background.paper',
          '& .ck-editor': {
            minHeight: `${minHeight}px`
          },
          '& .ck-editor__editable': {
            minHeight: `${minHeight}px`,
            maxHeight: '400px',
            overflowY: 'auto',
            backgroundColor: mode === 'dark' ? '#1e1e1e' : '#ffffff',
            color: mode === 'dark' ? '#ffffff' : '#000000',
            '&:focus': {
              backgroundColor: mode === 'dark' ? '#1e1e1e' : '#ffffff',
              color: mode === 'dark' ? '#ffffff' : '#000000'
            },
            '& p': {
              color: mode === 'dark' ? '#ffffff' : '#000000'
            },
            '& h1, & h2, & h3, & h4, & h5, & h6': {
              color: mode === 'dark' ? '#ffffff' : '#000000'
            },
            '& ul, & ol': {
              color: mode === 'dark' ? '#ffffff' : '#000000'
            },
            '& blockquote': {
              color: mode === 'dark' ? '#ffffff' : '#000000',
              borderLeftColor: mode === 'dark' ? '#424242' : '#e0e0e0'
            },
            '& a': {
              color: mode === 'dark' ? '#64b5f6' : '#1976d2'
            }
          },
          '& .ck-editor__editable_inline': {
            border: 'none'
          },
          '& .ck-toolbar': {
            backgroundColor: mode === 'dark' ? '#2d2d2d' : '#f5f5f5',
            borderColor: mode === 'dark' ? '#424242' : '#e0e0e0'
          },
          '& .ck-button': {
            color: mode === 'dark' ? '#ffffff' : '#000000',
            '&:hover:not(.ck-disabled)': {
              backgroundColor: mode === 'dark' ? '#424242' : '#e0e0e0'
            },
            '&.ck-on': {
              backgroundColor: mode === 'dark' ? '#424242' : '#e0e0e0'
            }
          },
          '& .ck-toolbar__separator': {
            backgroundColor: mode === 'dark' ? '#424242' : '#e0e0e0'
          },
          '& .ck-editor__editable span[data-user-id]': {
            backgroundColor: mode === 'dark' ? 'rgba(25, 118, 210, 0.2)' : 'rgba(25, 118, 210, 0.1)',
            color: mode === 'dark' ? '#64b5f6' : '#1976d2',
            padding: '2px 6px',
            borderRadius: '4px',
            fontWeight: 500,
            display: 'inline-block',
            marginRight: '4px',
            marginBottom: '2px'
          }
        }}
      >
        <CKEditor
          editor={ClassicEditor}
          data={editorData}
          onChange={handleEditorChange}
          disabled={disabled}
          config={{
            toolbar: [
              'heading',
              '|',
              'bold',
              'italic',
              'underline',
              '|',
              'bulletedList',
              'numberedList',
              '|',
              'blockQuote',
              'link',
              '|',
              'undo',
              'redo'
            ],
            placeholder: 'Enter description...'
          }}
        />
      </Box>
      {helperText && (
        <Typography
          variant="caption"
          sx={{
            mt: 0.5,
            color: error ? 'error.main' : 'text.secondary',
            display: 'block'
          }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

export default RichTextEditor;
