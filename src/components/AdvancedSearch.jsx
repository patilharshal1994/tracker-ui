import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  Autocomplete,
  Paper
} from '@mui/material';
import { Search, Save, Clear } from '@mui/icons-material';
import api from '../config/api';
import React from 'react';

const AdvancedSearch = ({ open, onClose, onSearch, onSave, savedFilters = [] }) => {
  const [searchCriteria, setSearchCriteria] = useState({
    query: '',
    status: [],
    priority: [],
    type: [],
    project_ids: [],
    assignee_ids: [],
    reporter_ids: [],
    tag_ids: [],
    dateFrom: '',
    dateTo: '',
    is_breached: ''
  });

  const [saveFilterName, setSaveFilterName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    if (open) {
      fetchProjects();
      fetchUsers();
      fetchTags();
    }
  }, [open]);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await api.get('/tags');
      setTags(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  };

  const handleSearch = () => {
    onSearch(searchCriteria);
    onClose();
  };

  const handleSave = () => {
    if (saveFilterName.trim()) {
      onSave({
        name: saveFilterName,
        criteria: searchCriteria
      });
      setSaveFilterName('');
      setShowSaveDialog(false);
      onClose();
    }
  };

  const handleLoadFilter = (filter) => {
    setSearchCriteria(filter.criteria);
  };

  const handleClear = () => {
    setSearchCriteria({
      query: '',
      status: [],
      priority: [],
      type: [],
      project_ids: [],
      assignee_ids: [],
      reporter_ids: [],
      tag_ids: [],
      dateFrom: '',
      dateTo: '',
      is_breached: ''
    });
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">
              Advanced Search
            </Typography>
            {savedFilters.length > 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                  Saved Filters:
                </Typography>
                {savedFilters.map((filter) => (
                  <Chip
                    key={filter.id}
                    label={filter.name}
                    size="small"
                    onClick={() => handleLoadFilter(filter)}
                    sx={{ mr: 0.5, mb: 0.5 }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {/* Full-text Search */}
            <TextField
              fullWidth
              label="Search in title and description"
              value={searchCriteria.query}
              onChange={(e) => setSearchCriteria({ ...searchCriteria, query: e.target.value })}
              placeholder="Enter keywords..."
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />

            {/* Status Multi-select */}
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                multiple
                value={searchCriteria.status}
                label="Status"
                onChange={(e) => setSearchCriteria({ ...searchCriteria, status: e.target.value })}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value.replace('_', ' ')} size="small" />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="CREATED">Created</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="DEPENDENCY">Dependency</MenuItem>
                <MenuItem value="HOLD">Hold</MenuItem>
                <MenuItem value="SOLVED">Solved</MenuItem>
                <MenuItem value="CLOSED">Closed</MenuItem>
              </Select>
            </FormControl>

            {/* Priority Multi-select */}
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                multiple
                value={searchCriteria.priority}
                label="Priority"
                onChange={(e) => setSearchCriteria({ ...searchCriteria, priority: e.target.value })}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="LOW">Low</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="HIGH">High</MenuItem>
              </Select>
            </FormControl>

            {/* Type Multi-select */}
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                multiple
                value={searchCriteria.type}
                label="Type"
                onChange={(e) => setSearchCriteria({ ...searchCriteria, type: e.target.value })}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="TASK">Task</MenuItem>
                <MenuItem value="BUG">Bug</MenuItem>
                <MenuItem value="ISSUE">Issue</MenuItem>
                <MenuItem value="SUGGESTION">Suggestion</MenuItem>
              </Select>
            </FormControl>

            {/* Projects Multi-select */}
            <Autocomplete
              multiple
              options={projects}
              getOptionLabel={(option) => option.name}
              value={projects.filter(p => searchCriteria.project_ids.includes(p.id))}
              onChange={(event, newValue) => {
                setSearchCriteria({
                  ...searchCriteria,
                  project_ids: newValue.map(p => p.id)
                });
              }}
              renderInput={(params) => (
                <TextField {...params} label="Projects" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option.id}
                    label={option.name}
                    size="small"
                  />
                ))
              }
            />

            {/* Assignees Multi-select */}
            <Autocomplete
              multiple
              options={users}
              getOptionLabel={(option) => option.name}
              value={users.filter(u => searchCriteria.assignee_ids.includes(u.id))}
              onChange={(event, newValue) => {
                setSearchCriteria({
                  ...searchCriteria,
                  assignee_ids: newValue.map(u => u.id)
                });
              }}
              renderInput={(params) => (
                <TextField {...params} label="Assignees" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option.id}
                    label={option.name}
                    size="small"
                  />
                ))
              }
            />

            {/* Tags Multi-select */}
            <Autocomplete
              multiple
              options={tags}
              getOptionLabel={(option) => option.name}
              value={tags.filter(t => searchCriteria.tag_ids.includes(t.id))}
              onChange={(event, newValue) => {
                setSearchCriteria({
                  ...searchCriteria,
                  tag_ids: newValue.map(t => t.id)
                });
              }}
              renderInput={(params) => (
                <TextField {...params} label="Tags" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option.id}
                    label={option.name}
                    size="small"
                    sx={{
                      bgcolor: option.color || 'primary.main',
                      color: 'white'
                    }}
                  />
                ))
              }
            />

            {/* Date Range */}
            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                label="From Date"
                type="date"
                value={searchCriteria.dateFrom}
                onChange={(e) => setSearchCriteria({ ...searchCriteria, dateFrom: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="To Date"
                type="date"
                value={searchCriteria.dateTo}
                onChange={(e) => setSearchCriteria({ ...searchCriteria, dateTo: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            {/* Breached Filter */}
            <FormControl fullWidth>
              <InputLabel>SLA Status</InputLabel>
              <Select
                value={searchCriteria.is_breached}
                label="SLA Status"
                onChange={(e) => setSearchCriteria({ ...searchCriteria, is_breached: e.target.value })}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="true">Breached Only</MenuItem>
                <MenuItem value="false">Not Breached</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            startIcon={<Clear />}
            onClick={handleClear}
            variant="outlined"
          >
            Clear
          </Button>
          <Button
            startIcon={<Save />}
            onClick={() => setShowSaveDialog(true)}
            variant="outlined"
          >
            Save Filter
          </Button>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleSearch}
            variant="contained"
            startIcon={<Search />}
          >
            Search
          </Button>
        </DialogActions>
      </Dialog>

      {/* Save Filter Dialog */}
      <Dialog open={showSaveDialog} onClose={() => setShowSaveDialog(false)}>
        <DialogTitle>Save Search Filter</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Filter Name"
            value={saveFilterName}
            onChange={(e) => setSaveFilterName(e.target.value)}
            placeholder="e.g., High Priority Bugs"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSaveDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!saveFilterName.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdvancedSearch;
