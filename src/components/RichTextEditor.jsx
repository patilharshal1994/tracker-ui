import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import React from 'react';

const RichTextEditor = ({ value, onChange, label, error, helperText, disabled, minHeight = 200 }) => {
  const [editorData, setEditorData] = useState(value || '');

  useEffect(() => {
    setEditorData(value || '');
  }, [value]);

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
          '& .ck-editor': {
            minHeight: `${minHeight}px`
          },
          '& .ck-editor__editable': {
            minHeight: `${minHeight}px`,
            maxHeight: '400px',
            overflowY: 'auto'
          },
          '& .ck-editor__editable_inline': {
            border: 'none'
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
