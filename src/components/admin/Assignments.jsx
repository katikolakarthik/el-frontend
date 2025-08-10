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
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { Avatar } from '@mui/material';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, assignment: null });
  const [selectedFile, setSelectedFile] = useState(null);

  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm();
  const watchModuleName = watch('moduleName');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/admin/assignments');
      setAssignments(response.data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to load assignments');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (assignment = null) => {
    setEditingAssignment(assignment);
    if (assignment) {
      reset({
        moduleName: assignment.moduleName,
        subModuleName: assignment.subModuleName || '',
        patientName: assignment.patientName || '',
        icdCodes: assignment.icdCodes?.join(', ') || '',
        cptCodes: assignment.cptCodes?.join(', ') || '',
        notes: assignment.notes || '',
        'answerKey.patientName': assignment.answerKey?.patientName || '',
        'answerKey.icdCodes': assignment.answerKey?.icdCodes?.join(', ') || '',
        'answerKey.cptCodes': assignment.answerKey?.cptCodes?.join(', ') || '',
        'answerKey.notes': assignment.answerKey?.notes || '',
      });
    } else {
      reset({
        moduleName: '',
        subModuleName: '',
        patientName: '',
        icdCodes: '',
        cptCodes: '',
        notes: '',
        'answerKey.patientName': '',
        'answerKey.icdCodes': '',
        'answerKey.cptCodes': '',
        'answerKey.notes': '',
      });
    }
    setSelectedFile(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAssignment(null);
    setSelectedFile(null);
    reset();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      
      // Basic assignment data
      formData.append('moduleName', data.moduleName);
      formData.append('subModuleName', data.subModuleName);
      formData.append('patientName', data.patientName);
      formData.append('icdCodes', data.icdCodes);
      formData.append('cptCodes', data.cptCodes);
      formData.append('notes', data.notes);
      
      // Answer key data
      formData.append('answerKey[patientName]', data.answerKey?.patientName || '');
      formData.append('answerKey[icdCodes]', data.answerKey?.icdCodes || '');
      formData.append('answerKey[cptCodes]', data.answerKey?.cptCodes || '');
      formData.append('answerKey[notes]', data.answerKey?.notes || '');
      
      // File upload
      if (selectedFile) {
        formData.append('assignmentPdf', selectedFile);
      }

      if (editingAssignment) {
        await axios.put(`http://localhost:5000/admin/assignment/${editingAssignment._id}`, formData);
        toast.success('Assignment updated successfully');
      } else {
        await axios.post('http://localhost:5000/admin/add-assignment', formData);
        toast.success('Assignment added successfully');
      }
      
      fetchAssignments();
      handleCloseDialog();
    } catch (error) {
      const message = error.response?.data?.message || 'Operation failed';
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/admin/assignments/${deleteDialog.assignment._id}`);
      toast.success('Assignment deleted successfully');
      fetchAssignments();
      setDeleteDialog({ open: false, assignment: null });
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
          Assignments Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Assignment
        </Button>
      </Box>

      {/* Assignments Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Assignment</TableCell>
              <TableCell>Patient Info</TableCell>
              <TableCell>Codes</TableCell>
              <TableCell>Students</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assignments && assignments.length > 0 ? (
              assignments.map((assignment) => (
              <TableRow key={assignment._id}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <AssignmentIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {assignment.moduleName}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {assignment.subModuleName || 'No Submodule'}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {assignment.patientName || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    {assignment.icdCodes?.length > 0 && (
                      <Chip
                        label={`${assignment.icdCodes.length} ICD codes`}
                        size="small"
                        sx={{ mb: 0.5 }}
                      />
                    )}
                    {assignment.cptCodes?.length > 0 && (
                      <Chip
                        label={`${assignment.cptCodes.length} CPT codes`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {assignment.assignedStudents?.length || 0} assigned
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {assignment.assignedDate ? new Date(assignment.assignedDate).toLocaleDateString() : 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(assignment)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => setDeleteDialog({ open: true, assignment })}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    No assignments found. Create your first assignment to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAssignment ? 'Edit Assignment' : 'Add New Assignment'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  {...register('moduleName', { required: 'Module name is required' })}
                  label="Module Name"
                  fullWidth
                  margin="normal"
                  error={!!errors.moduleName}
                  helperText={errors.moduleName?.message}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  {...register('subModuleName')}
                  label="Sub Module Name"
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  {...register('patientName')}
                  label="Patient Name"
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  {...register('icdCodes')}
                  label="ICD Codes (comma separated)"
                  fullWidth
                  margin="normal"
                  placeholder="A01.1, B02.2"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  {...register('cptCodes')}
                  label="CPT Codes (comma separated)"
                  fullWidth
                  margin="normal"
                  placeholder="99213, 99214"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  {...register('notes')}
                  label="Notes"
                  fullWidth
                  margin="normal"
                  multiline
                  rows={3}
                />
              </Grid>
              
              {/* File Upload */}
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                  sx={{ py: 2 }}
                >
                  {selectedFile ? selectedFile.name : 'Upload Assignment PDF'}
                  <input
                    type="file"
                    hidden
                    accept=".pdf"
                    onChange={handleFileChange}
                  />
                </Button>
              </Grid>

              {/* Answer Key Section */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                  Answer Key
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  {...register('answerKey.patientName')}
                  label="Answer: Patient Name"
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  {...register('answerKey.icdCodes')}
                  label="Answer: ICD Codes"
                  fullWidth
                  margin="normal"
                  placeholder="A01.1, B02.2"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  {...register('answerKey.cptCodes')}
                  label="Answer: CPT Codes"
                  fullWidth
                  margin="normal"
                  placeholder="99213, 99214"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  {...register('answerKey.notes')}
                  label="Answer: Notes"
                  fullWidth
                  margin="normal"
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingAssignment ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, assignment: null })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.assignment?.moduleName}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, assignment: null })}>
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

export default Assignments;
