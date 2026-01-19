import { useState, useEffect } from 'react';
import { Box, Typography, Chip, Autocomplete, TextField } from '@mui/material';
import { Person } from '@mui/icons-material';
import RichTextEditor from './RichTextEditor';
import React from 'react';

const MentionableRichTextEditor = ({ 
  value, 
  onChange, 
  label, 
  error, 
  helperText, 
  disabled, 
  minHeight = 200,
  users = [],
  onMentionsChange
}) => {
  const [editorValue, setEditorValue] = useState(value || '');
  const [mentionedUsers, setMentionedUsers] = useState([]);

  useEffect(() => {
    setEditorValue(value || '');
    // Don't extract mentions from HTML - mentions are only in the dropdown
  }, [value]);

  const handleEditorChange = (event) => {
    const newValue = event.target.value;
    setEditorValue(newValue);
    
    // Don't extract mentions from editor content - keep editor clean
    if (onChange) {
      onChange(event);
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
      
      {/* User Mention Selector */}
      <Box sx={{ mb: 1 }}>
        <Autocomplete
          multiple
          options={users}
          getOptionLabel={(option) => option.name}
          value={mentionedUsers.map(m => {
            const user = users.find(u => u.id === m.id);
            return user || { id: m.id, name: m.name };
          }).filter(Boolean)}
          onChange={(event, newValue) => {
            // Only update the mentioned users list - don't modify editor content
            const newMentions = newValue.map(u => ({ id: u.id, name: u.name }));
            setMentionedUsers(newMentions);
            
            // Notify parent component about mentioned user IDs
            if (onMentionsChange) {
              onMentionsChange(newValue.map(u => u.id));
            }
            
            // Don't modify editorValue - keep editor content clean
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Tag users (@username)"
              size="small"
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <Person sx={{ mr: 1, color: 'text.secondary' }} />
                    {params.InputProps.startAdornment}
                  </>
                )
              }}
            />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                key={option.id}
                label={`@${option.name}`}
                size="small"
                icon={<Person />}
                sx={{
                  bgcolor: 'primary.light',
                  color: 'primary.main',
                  fontWeight: 500
                }}
              />
            ))
          }
          disabled={disabled}
        />
      </Box>

      <RichTextEditor
        value={editorValue}
        onChange={handleEditorChange}
        label=""
        error={error}
        helperText={helperText}
        disabled={disabled}
        minHeight={minHeight}
      />
      
      {mentionedUsers.length > 0 && (
        <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
            Tagged:
          </Typography>
          {mentionedUsers.map((mention) => {
            const user = users.find(u => u.id === mention.id);
            return user ? (
              <Chip
                key={mention.id}
                label={`@${user.name}`}
                size="small"
                icon={<Person />}
                sx={{
                  bgcolor: 'primary.light',
                  color: 'primary.main',
                  fontSize: '0.7rem',
                  height: 20
                }}
              />
            ) : null;
          })}
        </Box>
      )}
    </Box>
  );
};

export default MentionableRichTextEditor;
