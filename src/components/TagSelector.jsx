import { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  Autocomplete,
  TextField,
  Paper,
  Typography
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { mockApi, mockTags, USE_MOCK_DATA } from '../data/mockData';
import api from '../config/api';
import React from 'react';

const TagSelector = ({ value = [], onChange, disabled = false, label = 'Tags' }) => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      if (USE_MOCK_DATA) {
        const response = await mockApi.getTags();
        setTags(response.data);
      } else {
        const response = await api.get('/tags');
        setTags(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedTags = tags.filter(tag => value.includes(tag.id));

  const handleChange = (event, newValue) => {
    const tagIds = newValue.map(tag => tag.id);
    if (onChange) {
      onChange({ target: { value: tagIds, name: 'tags' } });
    }
  };

  return (
    <Autocomplete
      multiple
      options={tags}
      getOptionLabel={(option) => option.name}
      value={selectedTags}
      onChange={handleChange}
      disabled={disabled || loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder="Select tags..."
        />
      )}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            key={option.id}
            label={option.name}
            sx={{
              bgcolor: option.color || 'primary.main',
              color: 'white',
              '& .MuiChip-deleteIcon': {
                color: 'white'
              }
            }}
          />
        ))
      }
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <Chip
            label={option.name}
            size="small"
            sx={{
              bgcolor: option.color || 'primary.main',
              color: 'white',
              mr: 1
            }}
          />
          <Typography variant="body2">{option.name}</Typography>
        </Box>
      )}
      PaperComponent={(props) => (
        <Paper {...props} sx={{ mt: 1 }} />
      )}
    />
  );
};

export default TagSelector;
