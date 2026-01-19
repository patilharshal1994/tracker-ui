import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Chip, Autocomplete, TextField } from '@mui/material';
import { Person } from '@mui/icons-material';
import RichTextEditor from './RichTextEditor';
import UserMentionSelector from './UserMentionSelector';
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
  const [showMentionSelector, setShowMentionSelector] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const editorRef = useRef(null);
  const mentionAnchorRef = useRef(null);

  useEffect(() => {
    setEditorValue(value || '');
    // Extract mentions from HTML
    extractMentions(value || '');
  }, [value]);

  const extractMentions = (html) => {
    if (!html) {
      setMentionedUsers([]);
      return;
    }

    // Extract user mentions from HTML (format: <span data-user-id="1" data-user-name="John Doe">@John Doe</span>)
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const mentionSpans = doc.querySelectorAll('span[data-user-id]');
    const mentions = Array.from(mentionSpans).map(span => ({
      id: parseInt(span.getAttribute('data-user-id')),
      name: span.getAttribute('data-user-name')
    }));
    setMentionedUsers(mentions);
    if (onMentionsChange) {
      onMentionsChange(mentions.map(m => m.id));
    }
  };

  const handleEditorChange = (event) => {
    const newValue = event.target.value;
    setEditorValue(newValue);
    extractMentions(newValue);
    
    if (onChange) {
      onChange(event);
    }
  };

  const handleUserSelect = (user) => {
    // Create mention HTML
    const mentionHtml = `<span data-user-id="${user.id}" data-user-name="${user.name}" style="background-color: rgba(25, 118, 210, 0.1); color: #1976d2; padding: 2px 6px; border-radius: 4px; font-weight: 500;">@${user.name}</span> `;
    
    // Insert mention into editor
    const currentValue = editorValue || '';
    const beforeMention = currentValue.substring(0, currentValue.lastIndexOf('@'));
    const newValue = beforeMention + mentionHtml;
    
    setEditorValue(newValue);
    extractMentions(newValue);
    
    if (onChange) {
      const syntheticEvent = {
        target: {
          value: newValue,
          name: 'description'
        }
      };
      onChange(syntheticEvent);
    }
    
    setShowMentionSelector(false);
    setMentionQuery('');
  };

  const handleMentionInput = (e) => {
    // This is a simplified approach - in a real implementation, 
    // you'd need to detect @ in the CKEditor content
    // For now, we'll use a separate input field for mentions
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
          value={mentionedUsers.map(m => users.find(u => u.id === m.id)).filter(Boolean)}
          onChange={(event, newValue) => {
            const newMentions = newValue.map(u => ({ id: u.id, name: u.name }));
            setMentionedUsers(newMentions);
            
            // Update editor content with mentions
            let newContent = editorValue || '';
            
            // Remove old mentions from HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(newContent, 'text/html');
            const oldMentions = doc.querySelectorAll('span[data-user-id]');
            oldMentions.forEach(span => {
              const spanHtml = span.outerHTML;
              // Use a more robust replacement that handles the full HTML structure
              newContent = newContent.replace(new RegExp(spanHtml.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '');
            });
            
            // Clean up any leftover mention text
            newContent = newContent.replace(/@\w+/g, '');
            
            // Get current user IDs that are already in content
            const existingUserIds = new Set();
            const tempDoc = parser.parseFromString(newContent, 'text/html');
            tempDoc.querySelectorAll('span[data-user-id]').forEach(span => {
              existingUserIds.add(parseInt(span.getAttribute('data-user-id')));
            });
            
            // Add new mentions that aren't already in the content
            const mentionsToAdd = newValue.filter(u => !existingUserIds.has(u.id));
            if (mentionsToAdd.length > 0) {
              const mentionsHtml = mentionsToAdd.map(user => 
                `<span data-user-id="${user.id}" data-user-name="${user.name}" style="background-color: rgba(25, 118, 210, 0.1); color: #1976d2; padding: 2px 6px; border-radius: 4px; font-weight: 500; display: inline-block; margin-right: 4px;">@${user.name}</span>`
              ).join(' ');
              // Append mentions at the end of content
              newContent = (newContent.trim() + ' ' + mentionsHtml).trim();
            }
            
            setEditorValue(newContent);
            extractMentions(newContent);
            
            if (onChange) {
              const syntheticEvent = {
                target: {
                  value: newContent,
                  name: 'description'
                }
              };
              onChange(syntheticEvent);
            }
            
            if (onMentionsChange) {
              onMentionsChange(newValue.map(u => u.id));
            }
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
