import { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  FileDownload,
  TableChart,
  PictureAsPdf,
  Description
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import React from 'react';

const ExportButton = ({ data, filename = 'tickets' }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const exportToCSV = () => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['ID', 'Title', 'Type', 'Status', 'Priority', 'Project', 'Assignee', 'Reporter', 'Due Date', 'Created'];
    const rows = data.map(ticket => [
      ticket.id,
      ticket.title,
      ticket.type,
      ticket.status,
      ticket.priority,
      ticket.project_name,
      ticket.assignee_name || 'Unassigned',
      ticket.reporter_name,
      ticket.due_date ? new Date(ticket.due_date).toLocaleDateString() : '',
      new Date(ticket.created_at).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    handleClose();
  };

  const exportToExcel = () => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      data.map(ticket => ({
        ID: ticket.id,
        Title: ticket.title,
        Type: ticket.type,
        Status: ticket.status,
        Priority: ticket.priority,
        Project: ticket.project_name,
        Assignee: ticket.assignee_name || 'Unassigned',
        Reporter: ticket.reporter_name,
        'Due Date': ticket.due_date ? new Date(ticket.due_date).toLocaleDateString() : '',
        Created: new Date(ticket.created_at).toLocaleDateString(),
        Description: ticket.description?.replace(/<[^>]*>/g, '') || ''
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tickets');
    XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
    handleClose();
  };

  const exportToPDF = () => {
    // Simple PDF export using window.print() - for full PDF, would need jsPDF
    alert('PDF export will open print dialog. For full PDF export, jsPDF library integration needed.');
    handleClose();
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<FileDownload />}
        onClick={handleClick}
        size="small"
      >
        Export
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={exportToCSV}>
          <ListItemIcon>
            <TableChart fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as CSV</ListItemText>
        </MenuItem>
        <MenuItem onClick={exportToExcel}>
          <ListItemIcon>
            <Description fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as Excel</ListItemText>
        </MenuItem>
        <MenuItem onClick={exportToPDF}>
          <ListItemIcon>
            <PictureAsPdf fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as PDF</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default ExportButton;
