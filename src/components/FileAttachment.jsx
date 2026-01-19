import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  Paper,
  ImageList,
  ImageListItem
} from '@mui/material';
import {
  AttachFile,
  Delete,
  Download,
  InsertDriveFile,
  Image as ImageIcon,
  PictureAsPdf,
  Description
} from '@mui/icons-material';
import React from 'react';

const FileAttachment = ({ attachments = [], onUpload, onDelete, readOnly = false }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) return <ImageIcon />;
    if (mimeType === 'application/pdf') return <PictureAsPdf />;
    return <InsertDriveFile />;
  };

  const getFileColor = (mimeType) => {
    if (mimeType?.startsWith('image/')) return 'success';
    if (mimeType === 'application/pdf') return 'error';
    return 'default';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handlePreview = (file) => {
    setPreviewFile(file);
    setPreviewOpen(true);
  };

  const handleDelete = (fileId) => {
    if (window.confirm('Are you sure you want to delete this attachment?')) {
      onDelete(fileId);
    }
  };

  return (
    <Box>
      {!readOnly && (
        <Button
          component="label"
          variant="outlined"
          size="small"
          startIcon={<AttachFile />}
          sx={{ mb: 2 }}
        >
          Attach Files
          <input
            type="file"
            hidden
            multiple
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                Array.from(e.target.files).forEach(file => {
                  const mockAttachment = {
                    id: Date.now() + Math.random(),
                    file_name: file.name,
                    file_size: file.size,
                    mime_type: file.type,
                    uploaded_at: new Date().toISOString()
                  };
                  onUpload(mockAttachment);
                });
              }
            }}
          />
        </Button>
      )}

      {attachments.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Attachments ({attachments.length})
          </Typography>
          <List dense>
            {attachments.map((file) => (
              <ListItem
                key={file.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <Box sx={{ mr: 2, color: `${getFileColor(file.mime_type)}.main` }}>
                  {getFileIcon(file.mime_type)}
                </Box>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handlePreview(file)}
                    >
                      {file.file_name}
                    </Typography>
                  }
                  secondary={formatFileSize(file.file_size)}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => handlePreview(file)}
                    sx={{ mr: 1 }}
                  >
                    <Download fontSize="small" />
                  </IconButton>
                  {!readOnly && (
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => handleDelete(file.id)}
                      color="error"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {previewFile?.file_name}
          <Chip
            label={formatFileSize(previewFile?.file_size)}
            size="small"
            sx={{ ml: 2 }}
          />
        </DialogTitle>
        <DialogContent>
          {previewFile?.mime_type?.startsWith('image/') ? (
            <Box
              component="img"
              src={`/uploads/${previewFile.file_name}`}
              alt={previewFile.file_name}
              sx={{ width: '100%', height: 'auto', borderRadius: 1 }}
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBQcmV2aWV3PC90ZXh0Pjwvc3ZnPg==';
              }}
            />
          ) : (
            <Box textAlign="center" py={4}>
              <Description sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                Preview not available for this file type
              </Typography>
              <Button
                variant="contained"
                startIcon={<Download />}
                sx={{ mt: 2 }}
                onClick={() => {
                  // Download logic
                  window.open(`/uploads/${previewFile?.file_name}`, '_blank');
                }}
              >
                Download File
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={() => {
              window.open(`/uploads/${previewFile?.file_name}`, '_blank');
            }}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FileAttachment;
