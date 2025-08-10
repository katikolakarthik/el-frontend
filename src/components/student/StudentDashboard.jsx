import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      
      // Fetch student summary
      const summaryResponse = await axios.get(`http://localhost:5000/student/${user._id}/summary`);
      setStudentData(summaryResponse.data);
      
      // Fetch recent submissions
      const submissionsResponse = await axios.get('http://localhost:5000/student/submissions');
      setRecentSubmissions(submissionsResponse.data.slice(0, 5));
      
    } catch (error) {
      console.error('Error fetching student data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
        Welcome back, {user?.name}! 👋
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Assignments"
            value={studentData?.totalAssignments || 0}
            icon={<AssignmentIcon />}
            color="primary.main"
            subtitle="Assigned to you"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed"
            value={studentData?.completedAssignments || 0}
            icon={<CheckCircleIcon />}
            color="success.main"
            subtitle="Successfully submitted"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Score"
            value={`${studentData?.averageScore || 0}%`}
            icon={<TrendingUpIcon />}
            color="info.main"
            subtitle="Your performance"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending"
            value={studentData?.pendingAssignments || 0}
            icon={<ScheduleIcon />}
            color="warning.main"
            subtitle="Need attention"
          />
        </Grid>
      </Grid>

      {/* Progress Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
              Overall Progress
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="body2">Course Progress</Typography>
                <Typography variant="body2" color="primary">
                  {studentData?.overallProgress || 0}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={studentData?.overallProgress || 0}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="body2">Assignment Completion</Typography>
                <Typography variant="body2" color="primary">
                  {studentData?.completedAssignments || 0}/{studentData?.totalAssignments || 0}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={studentData?.totalAssignments > 0 ? (studentData.completedAssignments / studentData.totalAssignments) * 100 : 0}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
              Course Information
            </Typography>
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Course:</strong> {user?.courseName || 'Not specified'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Enrolled:</strong> {user?.enrolledDate ? new Date(user.enrolledDate).toLocaleDateString() : 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Payment Status:</strong> 
                <Chip
                  label={user?.remainingAmount > 0 ? `$${user.remainingAmount} remaining` : 'Fully paid'}
                  color={user?.remainingAmount > 0 ? 'warning' : 'success'}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Submissions */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
          Recent Submissions
        </Typography>
        {recentSubmissions.length > 0 ? (
          <List>
            {recentSubmissions.map((submission, index) => (
              <ListItem key={submission._id || index} divider>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <AssignmentIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={submission.assignment?.moduleName || 'Unknown Assignment'}
                  secondary={`Submitted on ${submission.submissionDate ? new Date(submission.submissionDate).toLocaleDateString() : 'N/A'}`}
                />
                <Box display="flex" gap={1}>
                  <Chip
                    label={`${submission.correctCount || 0} correct`}
                    color="success"
                    size="small"
                  />
                  <Chip
                    label={`${submission.wrongCount || 0} incorrect`}
                    color="error"
                    size="small"
                  />
                  <Chip
                    label={`${submission.progressPercent || 0}%`}
                    color="primary"
                    size="small"
                  />
                </Box>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
            No submissions yet. Start working on your assignments!
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default StudentDashboard;
