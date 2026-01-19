import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider
} from '@mui/material';
import {
  Add,
  Delete,
  ContentCopy,
  Description
} from '@mui/icons-material';
import { mockApi, USE_MOCK_DATA } from '../data/mockData';
import toast from 'react-hot-toast';
import React from 'react';
import RichTextEditor from './RichTextEditor';
// Mock templates
const mockTemplates = [
  {
    id: 1,
    name: 'Bug Report Template',
    project_id: null,
    type: 'BUG',
    title_template: 'Bug: [Brief Description]',
    description_template: '<p><strong>Steps to Reproduce:</strong></p><ol><li>Step 1</li><li>Step 2</li><li>Step 3</li></ol><p><strong>Expected Behavior:</strong></p><p>What should happen</p><p><strong>Actual Behavior:</strong></p><p>What actually happens</p>',
    default_priority: 'MEDIUM'
  },
  {
    id: 2,
    name: 'Feature Request Template',
    project_id: null,
    type: 'SUGGESTION',
    title_template: 'Feature: [Feature Name]',
    description_template: '<p><strong>Feature Description:</strong></p><p>Describe the feature</p><p><strong>Use Case:</strong></p><p>Why is this needed?</p><p><strong>Acceptance Criteria:</strong></p><ul><li>Criterion 1</li><li>Criterion 2</li></ul>',
    default_priority: 'LOW'
  },
  {
    id: 3,
    name: 'Task Template',
    project_id: null,
    type: 'TASK',
    title_template: 'Task: [Task Name]',
    description_template: '<p><strong>Task Description:</strong></p><p>What needs to be done</p><p><strong>Requirements:</strong></p><ul><li>Requirement 1</li><li>Requirement 2</li></ul>',
    default_priority: 'MEDIUM'
  }
];

const TicketTemplate = ({ open, onClose, onSelect, projects = [] }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    project_id: '',
    type: 'TASK',
    title_template: '',
    description_template: '',
    default_priority: 'MEDIUM'
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      if (USE_MOCK_DATA) {
        setTemplates(mockTemplates);
      } else {
        const response = await api.get('/ticket-templates');
        setTemplates(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      setTemplates(mockTemplates);
    }
  };

  const handleSelect = (template) => {
    if (onSelect) {
      onSelect({
        type: template.type,
        title: template.title_template,
        description: template.description_template,
        priority: template.default_priority,
        project_id: template.project_id || ''
      });
    }
    onClose();
  };

  const handleCreate = () => {
    const newTemplate = {
      id: Date.now(),
      ...formData,
      created_by: 1
    };
    setTemplates([...templates, newTemplate]);
    toast.success(`Template "${formData.name}" created successfully! 📝`);
    setFormData({
      name: '',
      project_id: '',
      type: 'TASK',
      title_template: '',
      description_template: '',
      default_priority: 'MEDIUM'
    });
    setShowCreateDialog(false);
  };

  const handleDelete = (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      setTemplates(templates.filter(t => t.id !== templateId));
      toast.success('Template deleted successfully! 🗑️');
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">
              Ticket Templates
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<Add />}
              onClick={() => setShowCreateDialog(true)}
            >
              New Template
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {templates.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Description sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" color="text.secondary" gutterBottom>
                No templates available
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create a template to quickly create tickets with pre-filled content
              </Typography>
            </Box>
          ) : (
            <List>
              {templates.map((template, index) => (
                <React.Fragment key={template.id}>
                  <ListItem
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                    onClick={() => handleSelect(template)}
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {template.name}
                          </Typography>
                          <Chip label={template.type} size="small" />
                          {template.project_id && (
                            <Chip
                              label={projects.find(p => p.id === template.project_id)?.name || 'Project'}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Title: {template.title_template}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                            dangerouslySetInnerHTML={{
                              __html: template.description_template
                            }}
                          />
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(template.id);
                        }}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < templates.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Create Template Dialog */}
      <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Ticket Template</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Template Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Project (Optional)</InputLabel>
            <Select
              value={formData.project_id}
              label="Project (Optional)"
              onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
            >
              <MenuItem value="">All Projects</MenuItem>
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Type</InputLabel>
            <Select
              value={formData.type}
              label="Type"
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <MenuItem value="TASK">Task</MenuItem>
              <MenuItem value="BUG">Bug</MenuItem>
              <MenuItem value="ISSUE">Issue</MenuItem>
              <MenuItem value="SUGGESTION">Suggestion</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Title Template"
            value={formData.title_template}
            onChange={(e) => setFormData({ ...formData, title_template: e.target.value })}
            margin="normal"
            placeholder="e.g., Bug: [Brief Description]"
          />
          <Box sx={{ mt: 2, mb: 1 }}>
            <RichTextEditor
              value={formData.description_template}
              onChange={(e) => setFormData({ ...formData, description_template: e.target.value })}
              label="Description Template"
              minHeight={150}
            />
          </Box>
          <FormControl fullWidth margin="normal">
            <InputLabel>Default Priority</InputLabel>
            <Select
              value={formData.default_priority}
              label="Default Priority"
              onChange={(e) => setFormData({ ...formData, default_priority: e.target.value })}
            >
              <MenuItem value="LOW">Low</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={!formData.name || !formData.title_template}
          >
            Create Template
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TicketTemplate;
