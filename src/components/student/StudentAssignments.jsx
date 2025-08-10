import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CloudDownload as CloudDownloadIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Fullscreen as FullscreenIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Refresh as RefreshIcon,
  Print as PrintIcon,
  GetApp as GetAppIcon,
  ViewModule as ViewModuleIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const StudentAssignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionDialog, setSubmissionDialog] = useState({ open: false, assignment: null });
  const [pdfZoom, setPdfZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(12); // Mock total pages

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/admin/assignments');
      setAssignments(response.data || []);
      if (response.data && response.data.length > 0) {
        setSelectedAssignment(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentSelect = (assignment) => {
    setSelectedAssignment(assignment);
    setCurrentPage(1);
    setPdfZoom(100);
  };

  const handleOpenSubmissionDialog = (assignment) => {
    setSubmissionDialog({ open: true, assignment });
    reset({
      patientName: '',
      ageDob: '',
      icdCodes: '',
      cptCodes: '',
      notes: '',
    });
  };

  const handleCloseSubmissionDialog = () => {
    setSubmissionDialog({ open: false, assignment: null });
    reset();
  };

  const onSubmit = async (data) => {
    try {
      const submissionData = {
        studentId: user._id,
        assignmentId: submissionDialog.assignment._id,
        submittedAnswers: {
          patientName: data.patientName,
          ageDob: data.ageDob,
          icdCodes: data.icdCodes.split(',').map(code => code.trim()).filter(code => code),
          cptCodes: data.cptCodes.split(',').map(code => code.trim()).filter(code => code),
          notes: data.notes,
        },
      };

      await axios.post('http://localhost:5000/student/submit-assignment', submissionData);
      toast.success('Assignment submitted successfully!');
      handleCloseSubmissionDialog();
      fetchAssignments();
    } catch (error) {
      const message = error.response?.data?.message || 'Submission failed';
      toast.error(message);
    }
  };

  const downloadAssignment = (assignment) => {
    if (assignment.assignmentPdf) {
      window.open(assignment.assignmentPdf, '_blank');
    } else {
      toast.error('No PDF available for this assignment');
    }
  };

  const handleZoomIn = () => setPdfZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setPdfZoom(prev => Math.max(prev - 25, 50));
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Assigments
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton>
            <NotificationsIcon />
          </IconButton>
          <Box display="flex" alignItems="center" gap={1}>
            <PersonIcon />
            <Typography variant="body1">{user?.name || 'Student'}</Typography>
          </Box>
        </Box>
      </Box>

      {assignments.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No assignments available
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Check back later for new assignments or contact your instructor.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {/* Left Side - PDF Viewer */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>
              {/* PDF Viewer Header */}
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    PDF Viewer
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Tooltip title="Full Screen">
                      <IconButton size="small">
                        <FullscreenIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Zoom In">
                      <IconButton size="small" onClick={handleZoomIn}>
                        <ZoomInIcon />
                      </IconButton>
                    </Tooltip>
                    <Typography variant="body2" sx={{ mx: 1 }}>
                      {currentPage} / {totalPages}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* PDF Toolbar */}
              <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider', display: 'flex', gap: 1 }}>
                <Tooltip title="Refresh">
                  <IconButton size="small">
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Print">
                  <IconButton size="small">
                    <PrintIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download">
                  <IconButton size="small" onClick={() => selectedAssignment && downloadAssignment(selectedAssignment)}>
                    <GetAppIcon />
                  </IconButton>
                </Tooltip>
                <Divider orientation="vertical" flexItem />
                <Tooltip title="Zoom Out">
                  <IconButton size="small" onClick={handleZoomOut}>
                    <ZoomOutIcon />
                  </IconButton>
                </Tooltip>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mx: 1 }}>
                  {pdfZoom}%
                </Typography>
                <Tooltip title="Zoom In">
                  <IconButton size="small" onClick={handleZoomIn}>
                    <ZoomInIcon />
                  </IconButton>
                </Tooltip>
                <Divider orientation="vertical" flexItem />
                <Tooltip title="Single Page View">
                  <IconButton size="small">
                    <ViewModuleIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Previous Page">
                  <IconButton size="small" onClick={handlePrevPage} disabled={currentPage === 1}>
                    <NavigateBeforeIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Next Page">
                  <IconButton size="small" onClick={handleNextPage} disabled={currentPage === totalPages}>
                    <NavigateNextIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* PDF Content Area */}
              <Box sx={{ flex: 1, p: 3, overflow: 'auto', backgroundColor: '#f5f5f5' }}>
                {selectedAssignment ? (
                  <Box 
                    sx={{ 
                      backgroundColor: 'white', 
                      minHeight: '100%', 
                      p: 4, 
                      borderRadius: 1,
                      boxShadow: 1,
                      transform: `scale(${pdfZoom / 100})`,
                      transformOrigin: 'top left',
                      width: `${100 / (pdfZoom / 100)}%`
                    }}
                  >
                    {/* Mock PDF Content */}
                    <Typography variant="h4" align="center" sx={{ fontWeight: 'bold', mb: 3 }}>
                      PATIENT RECORD
                    </Typography>
                    
                    <Typography variant="body1" paragraph>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </Typography>
                    
                    <Typography variant="body1" paragraph>
                      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </Typography>
                    
                    <Typography variant="body1" paragraph>
                      <Box component="span" sx={{ backgroundColor: '#1976d2', color: 'white', px: 1, py: 0.5, borderRadius: 1 }}>
                        Ottamique muiciaraque iduninode nist.
                      </Box> Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                    </Typography>
                    
                    <Typography variant="body1" paragraph>
                      Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.
                    </Typography>
                    
                    <Typography variant="body1" paragraph>
                      Sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.
                    </Typography>
                    
                    <Typography variant="body1" paragraph>
                      Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur? At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.
                    </Typography>
                    
                    <Typography variant="body1" paragraph>
                      Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus.
                    </Typography>
                    
                    <Typography variant="body1" paragraph>
                      Omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus.
                    </Typography>
                    
                    <Typography variant="body1" paragraph>
                      Ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus.
                    </Typography>
                    
                    <Typography variant="body1" paragraph>
                      Omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus.
                    </Typography>
                    
                    <Typography variant="body1" paragraph>
                      Ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus.
                    </Typography>
                  </Box>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <Typography variant="h6" color="textSecondary">
                      Select an assignment to view
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Right Side - Patient Details Form */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>
              {/* Form Header */}
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Patient Details
                </Typography>
              </Box>

              {/* Form Content */}
              <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        {...register('patientName')}
                        label="Patient Name"
                        fullWidth
                        size="small"
                        placeholder="Enter patient name"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        {...register('ageDob')}
                        label="Age / DOB"
                        fullWidth
                        size="small"
                        placeholder="Enter age or date of birth"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        {...register('icdCodes')}
                        label="ICD-10 Codes"
                        fullWidth
                        size="small"
                        placeholder="Enter ICD-10 codes"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        {...register('icdCodes2')}
                        label="CODIO"
                        fullWidth
                        size="small"
                        placeholder="Enter additional ICD codes"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        {...register('cptCodes')}
                        label="CPT Codes"
                        fullWidth
                        size="small"
                        placeholder="Enter CPT codes"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        {...register('cptCodes2')}
                        label="CPT"
                        fullWidth
                        size="small"
                        placeholder="Enter additional CPT codes"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        {...register('notes')}
                        label="Notes"
                        fullWidth
                        multiline
                        rows={4}
                        size="small"
                        placeholder="Enter additional notes or observations"
                      />
                    </Grid>
                  </Grid>
                </form>
              </Box>

              {/* Form Actions */}
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<SendIcon />}
                      onClick={() => selectedAssignment && handleOpenSubmissionDialog(selectedAssignment)}
                      disabled={!selectedAssignment}
                    >
                      Submit
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<CheckCircleIcon />}
                      onClick={() => selectedAssignment && handleOpenSubmissionDialog(selectedAssignment)}
                      disabled={!selectedAssignment}
                    >
                      Send to Audit
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Assignment Selection Cards */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Available Assignments
        </Typography>
        <Grid container spacing={2}>
          {assignments.map((assignment) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={assignment._id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  border: selectedAssignment?._id === assignment._id ? 2 : 1,
                  borderColor: selectedAssignment?._id === assignment._id ? 'primary.main' : 'divider',
                  '&:hover': { borderColor: 'primary.main' }
                }}
                onClick={() => handleAssignmentSelect(assignment)}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                    <AssignmentIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {assignment.moduleName}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    {assignment.subModuleName || 'No Submodule'}
                  </Typography>
                  <Chip
                    label={assignment.assignedDate ? new Date(assignment.assignedDate).toLocaleDateString() : 'N/A'}
                    size="small"
                    variant="outlined"
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Submission Dialog */}
      <Dialog open={submissionDialog.open} onClose={handleCloseSubmissionDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Submit Assignment: {submissionDialog.assignment?.moduleName}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Please confirm your answers before submitting this assignment.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                {...register('patientName')}
                label="Patient Name"
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                {...register('ageDob')}
                label="Age / DOB"
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSubmissionDialog}>Cancel</Button>
          <Button type="submit" variant="contained" startIcon={<SendIcon />} onClick={handleSubmit(onSubmit)}>
            Submit Assignment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentAssignments;
