import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Snackbar,
  Alert
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const MentorshipDashboard: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' as 'success' | 'error' });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'faculty' || user?.role === 'alumni') {
      fetchPendingRequests();
    }
  }, [user]);

  const fetchPendingRequests = async () => {
    try {
      const response = await axios.get('http://localhost:5002/api/mentorship/requests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Pending requests:', response.data);
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      showNotification('Error fetching mentorship requests', 'error');
    }
  };

  const handleRequestAction = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      await axios.patch(`http://localhost:5002/api/mentorship/request/${requestId}/status`, 
        { status },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      showNotification(`Request ${status} successfully`, 'success');
      fetchPendingRequests();

      if (status === 'accepted') {
        // Navigate to inbox or show success message
        navigate('/inbox');
      }
    } catch (error) {
      console.error('Error updating request:', error);
      showNotification('Error updating request', 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ open: true, message, type });
  };

  if (user?.role !== 'faculty' && user?.role !== 'alumni') {
    return (
      <Box>
        <Typography variant="h5">
          This dashboard is only accessible to faculty and alumni members.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Mentorship Dashboard
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Pending Mentorship Requests
        </Typography>
        {requests.length === 0 ? (
          <Typography color="textSecondary">
            No pending mentorship requests.
          </Typography>
        ) : (
          <List>
            {requests.map((request) => (
              <ListItem
                key={request._id}
                sx={{
                  mb: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <ListItemAvatar>
                  <Avatar src={request.mentee?.avatar}>
                    {request.mentee?.name?.[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={request.mentee?.name}
                  secondary={
                    <React.Fragment>
                      <Typography variant="body2">
                        Topic: {request.topic}
                      </Typography>
                      <Typography variant="caption">
                        Requested: {new Date(request.createdAt).toLocaleDateString()}
                      </Typography>
                    </React.Fragment>
                  }
                />
                <Box>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handleRequestAction(request._id, 'accepted')}
                    sx={{ mr: 1 }}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleRequestAction(request._id, 'rejected')}
                  >
                    Decline
                  </Button>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setNotification(prev => ({ ...prev, open: false }))} 
          severity={notification.type}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MentorshipDashboard;
