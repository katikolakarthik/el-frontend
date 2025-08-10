import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  Person as PersonIcon,
  School as SchoolIcon,
  Payment as PaymentIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const StudentProfile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      courseName: user?.courseName || '',
      paidAmount: user?.paidAmount || '',
      remainingAmount: user?.remainingAmount || '',
      enrolledDate: user?.enrolledDate ? new Date(user.enrolledDate).toISOString().split('T')[0] : '',
    }
  });

  const handleEdit = () => {
    setIsEditing(true);
    reset({
      name: user?.name || '',
      courseName: user?.courseName || '',
      paidAmount: user?.paidAmount || '',
      remainingAmount: user?.remainingAmount || '',
      enrolledDate: user?.enrolledDate ? new Date(user.enrolledDate).toISOString().split('T')[0] : '',
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset();
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImage(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('courseName', data.courseName);
      formData.append('paidAmount', data.paidAmount);
      formData.append('remainingAmount', data.remainingAmount);
      formData.append('enrolledDate', data.enrolledDate);
      
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      const response = await axios.put(`http://localhost:5000/admin/student/${user._id}`, formData);
      
      // Update local user data
      updateUser(response.data);
      setIsEditing(false);
      setProfileImage(null);
      toast.success('Profile updated successfully!');
      
    } catch (error) {
      const message = error.response?.data?.message || 'Update failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
        My Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Picture and Basic Info */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              sx={{ 
                width: 120, 
                height: 120, 
                mx: 'auto', 
                mb: 2,
                fontSize: '3rem'
              }}
            >
              {user?.profileImage ? (
                <img src={user.profileImage} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <PersonIcon sx={{ fontSize: 'inherit' }} />
              )}
            </Avatar>
            
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              {user?.name}
            </Typography>
            
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              {user?.role === 'admin' ? 'Administrator' : 'Student'}
            </Typography>

            {!isEditing && (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                fullWidth
              >
                Edit Profile
              </Button>
            )}

            {isEditing && (
              <Box sx={{ mt: 2 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="profile-image-input"
                  type="file"
                  onChange={handleImageChange}
                />
                <label htmlFor="profile-image-input">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                    sx={{ mb: 1 }}
                  >
                    Change Photo
                  </Button>
                </label>
                {profileImage && (
                  <Typography variant="caption" color="primary">
                    {profileImage.name} selected
                  </Typography>
                )}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Profile Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Profile Information
              </Typography>
              {isEditing && (
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    sx={{ mr: 1 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSubmit(onSubmit)}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={20} /> : 'Save Changes'}
                  </Button>
                </Box>
              )}
            </Box>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    {...register('name', { required: 'Name is required' })}
                    label="Full Name"
                    fullWidth
                    margin="normal"
                    disabled={!isEditing}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    {...register('courseName')}
                    label="Course Name"
                    fullWidth
                    margin="normal"
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    {...register('paidAmount', { 
                      pattern: { value: /^\d+$/, message: 'Must be a number' }
                    })}
                    label="Paid Amount ($)"
                    fullWidth
                    margin="normal"
                    type="number"
                    disabled={!isEditing}
                    error={!!errors.paidAmount}
                    helperText={errors.paidAmount?.message}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    {...register('remainingAmount', { 
                      pattern: { value: /^\d+$/, message: 'Must be a number' }
                    })}
                    label="Remaining Amount ($)"
                    fullWidth
                    margin="normal"
                    type="number"
                    disabled={!isEditing}
                    error={!!errors.remainingAmount}
                    helperText={errors.remainingAmount?.message}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    {...register('enrolledDate')}
                    label="Enrolled Date"
                    fullWidth
                    margin="normal"
                    type="date"
                    disabled={!isEditing}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </form>
          </Paper>

          {/* Course Progress */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Course Progress
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      <SchoolIcon color="primary" />
                      <Box>
                        <Typography variant="h6" color="primary">
                          {user?.courseName || 'No Course'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Current Course
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      <PaymentIcon color="success" />
                      <Box>
                        <Typography variant="h6" color="success.main">
                          ${user?.paidAmount || 0}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Amount Paid
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {user?.remainingAmount > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Payment Reminder:</strong> You have ${user.remainingAmount} remaining to complete your course payment.
                </Typography>
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentProfile;
