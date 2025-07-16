import React, { useState, useEffect, useContext } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TablePagination,
  Button, 
  IconButton, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle,
  CircularProgress,
  Chip,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  Divider
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Visibility as VisibilityIcon, 
  MarkEmailRead as MarkReadIcon,
  MarkEmailUnread as MarkUnreadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { DarkModeContext } from '../../context/DarkModeContext';
import './AdminMessages.css';

const AdminMessages = () => {
  const { token } = useAuth(); // Get token from auth context
  const { darkMode } = useContext(DarkModeContext); // Get dark mode state
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  
  const backend_url = process.env.REACT_APP_API_URL;

  // Fetch messages from API
  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${backend_url}/api/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err.message || 'Failed to load messages');
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  // Load messages on component mount
  useEffect(() => {
    fetchMessages();
  }, []);

  // Handle changing message status (read/unread)
  const handleChangeStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`${backend_url}/api/messages/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update message status');
      }
      
      // Update messages list
      setMessages(messages.map(message => 
        message._id === id 
          ? { ...message, status: newStatus } 
          : message
      ));
      
      toast.success(`Message marked as ${newStatus}`);
    } catch (err) {
      console.error('Error updating message status:', err);
      toast.error(err.message || 'Failed to update message status');
    }
  };

  // Handle message deletion
  const handleDelete = async () => {
    if (!messageToDelete) return;
    
    try {
      const response = await fetch(`${backend_url}/api/messages/${messageToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete message');
      }
      
      // Update messages list
      setMessages(messages.filter(message => message._id !== messageToDelete));
      
      toast.success('Message deleted successfully');
    } catch (err) {
      console.error('Error deleting message:', err);
      toast.error(err.message || 'Failed to delete message');
    } finally {
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (id) => {
    setMessageToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Open message detail dialog
  const openDetailDialog = (message) => {
    setSelectedMessage(message);
    setDetailDialogOpen(true);
    
    // If message is unread, mark it as read
    if (message.status === 'unread') {
      handleChangeStatus(message._id, 'read');
    }
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle sorting
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Filter and sort messages
  const filteredMessages = messages
    .filter(message => statusFilter === 'all' ? true : message.status === statusFilter)
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'date') {
        comparison = new Date(a.date) - new Date(b.date);
      } else if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'email') {
        comparison = a.email.localeCompare(b.email);
      } else if (sortBy === 'subject') {
        comparison = a.subject.localeCompare(b.subject);
      } else if (sortBy === 'status') {
        comparison = a.status.localeCompare(b.status);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const paginatedMessages = filteredMessages.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className={`admin-messages-container ${darkMode ? 'dark-mode' : ''}`}>
      <Paper elevation={3} sx={{ p: 3, mb: 4, transition: 'all 0.3s ease' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Customer Messages
          </Typography>
          
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />} 
            onClick={fetchMessages}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status Filter"
              >
                <MenuItem value="all">All Messages</MenuItem>
                <MenuItem value="unread">Unread</MenuItem>
                <MenuItem value="read">Read</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setSortOrder('asc');
                }}
                label="Sort By"
              >
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="subject">Subject</MenuItem>
                <MenuItem value="status">Status</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Order</InputLabel>
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                label="Order"
              >
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        ) : messages.length === 0 ? (
          <Alert severity="info">No messages found</Alert>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedMessages.map((message) => (
                    <TableRow 
                      key={message._id}
                      data-status={message.status}
                      sx={{ 
                        '&:hover': { bgcolor: darkMode ? 'var(--dark-hover-bg)' : 'rgba(0, 0, 0, 0.04)' },
                        bgcolor: message.status === 'unread' 
                          ? darkMode ? 'var(--dark-unread-bg)' : 'rgba(25, 118, 210, 0.08)' 
                          : 'inherit',
                        transition: 'background-color 0.2s ease'
                      }}
                    >
                      <TableCell>{message.name}</TableCell>
                      <TableCell>{message.email}</TableCell>
                      <TableCell>
                        {message.subject.length > 40 
                          ? `${message.subject.substring(0, 40)}...` 
                          : message.subject}
                      </TableCell>
                      <TableCell>{formatDate(message.date)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={message.status} 
                          color={message.status === 'unread' ? 'primary' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          color="primary" 
                          onClick={() => openDetailDialog(message)}
                          title="View Details"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        
                        {message.status === 'unread' ? (
                          <IconButton 
                            color="primary" 
                            onClick={() => handleChangeStatus(message._id, 'read')}
                            title="Mark as Read"
                          >
                            <MarkReadIcon />
                          </IconButton>
                        ) : (
                          <IconButton 
                            color="default" 
                            onClick={() => handleChangeStatus(message._id, 'unread')}
                            title="Mark as Unread"
                          >
                            <MarkUnreadIcon />
                          </IconButton>
                        )}
                        
                        <IconButton 
                          color="error" 
                          onClick={() => openDeleteDialog(message._id)}
                          title="Delete"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredMessages.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
      
      {/* Confirmation Dialog for Delete */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        className={darkMode ? 'dark-mode' : ''}
      >
        <DialogTitle>Delete Message</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this message? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Message Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
        className={darkMode ? 'dark-mode' : ''}
      >
        {selectedMessage && (
          <>
            <DialogTitle>
              <Typography variant="h6">{selectedMessage.subject}</Typography>
              <Box sx={{ display: 'flex', mt: 1 }}>
                <Chip 
                  label={selectedMessage.status} 
                  color={selectedMessage.status === 'unread' ? 'primary' : 'default'}
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Typography variant="body2" color="textSecondary">
                  {formatDate(selectedMessage.date)}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    From:
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedMessage.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Email:
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedMessage.email}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" color="textSecondary">
                    Message:
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, mt: 1, minHeight: '150px' }}>
                    <Typography variant="body1">
                      {selectedMessage.message}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => handleChangeStatus(selectedMessage._id, 
                  selectedMessage.status === 'read' ? 'unread' : 'read')}
                color="primary"
              >
                Mark as {selectedMessage.status === 'read' ? 'Unread' : 'Read'}
              </Button>
              <Button 
                onClick={() => {
                  setDetailDialogOpen(false);
                  setSelectedMessage(null);
                }} 
                color="primary"
              >
                Close
              </Button>
              <Button 
                onClick={() => {
                  setDetailDialogOpen(false);
                  openDeleteDialog(selectedMessage._id);
                }} 
                color="error"
              >
                Delete
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
};

export default AdminMessages;
