import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, student: null });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/admin/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (student = null) => {
    setEditingStudent(student);
    if (student) {
      reset({
        name: student.name,
        courseName: student.courseName || '',
        paidAmount: student.paidAmount || '',
        remainingAmount: student.remainingAmount || '',
        enrolledDate: student.enrolledDate ? new Date(student.enrolledDate).toISOString().split('T')[0] : '',
      });
    } else {
      reset({
        name: '',
        courseName: '',
        paidAmount: '',
        remainingAmount: '',
        enrolledDate: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingStudent(null);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      if (editingStudent) {
        await axios.put(`http://localhost:5000/admin/student/${editingStudent._id}`, data);
        toast.success('Student updated successfully');
      } else {
        await axios.post('http://localhost:5000/admin/add-student', data);
        toast.success('Student added successfully');
      }
      fetchStudents();
      handleCloseDialog();
    } catch (error) {
      const message = error.response?.data?.message || 'Operation failed';
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/admin/student/${deleteDialog.student._id}`);
      toast.success('Student deleted successfully');
      fetchStudents();
      setDeleteDialog({ open: false, student: null });
    } catch (error) {
      const message = error.response?.data?.message || 'Delete failed';
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Students Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Student
        </Button>
      </Box>

      {/* Students Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Payment Status</TableCell>
              <TableCell>Enrolled Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student._id}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar>
                      {student.profileImage ? (
                        <img src={student.profileImage} alt={student.name} />
                      ) : (
                        <PersonIcon />
                      )}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {student.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {student.email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {student.courseName || 'No Course'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    <Chip
                      label={`$${student.paidAmount || 0} paid`}
                      color="success"
                      size="small"
                      sx={{ mb: 0.5 }}
                    />
                    {student.remainingAmount > 0 && (
                      <Chip
                        label={`$${student.remainingAmount} remaining`}
                        color="warning"
                        size="small"
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {student.enrolledDate ? new Date(student.enrolledDate).toLocaleDateString() : 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(student)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => setDeleteDialog({ open: true, student })}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingStudent ? 'Edit Student' : 'Add New Student'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <TextField
              {...register('name', { required: 'Name is required' })}
              label="Full Name"
              fullWidth
              margin="normal"
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              {...register('courseName')}
              label="Course Name"
              fullWidth
              margin="normal"
            />
            <TextField
              {...register('paidAmount', { 
                pattern: { value: /^\d+$/, message: 'Must be a number' }
              })}
              label="Paid Amount ($)"
              fullWidth
              margin="normal"
              type="number"
              error={!!errors.paidAmount}
              helperText={errors.paidAmount?.message}
            />
            <TextField
              {...register('remainingAmount', { 
                pattern: { value: /^\d+$/, message: 'Must be a number' }
              })}
              label="Remaining Amount ($)"
              fullWidth
              margin="normal"
              type="number"
              error={!!errors.remainingAmount}
              helperText={errors.remainingAmount?.message}
            />
            <TextField
              {...register('enrolledDate')}
              label="Enrolled Date"
              fullWidth
              margin="normal"
              type="date"
              InputLabelProps={{ shrink: true }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingStudent ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, student: null })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {deleteDialog.student?.name}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, student: null })}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Students;
