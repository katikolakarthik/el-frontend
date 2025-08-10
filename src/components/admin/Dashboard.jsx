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
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import axios from 'axios';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalAssignments: 0,
    totalSubmissions: 0,
    averageProgress: 0,
  });
  const [recentStudents, setRecentStudents] = useState([]);
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch students summary
      const studentsResponse = await axios.get('http://localhost:5000/admin/students/summary');
      const studentsData = studentsResponse.data;
      
      // Fetch assignments
      const assignmentsResponse = await axios.get('http://localhost:5000/admin/assignments');
      const assignmentsData = assignmentsResponse.data;
      
      // Calculate stats
      const totalStudents = studentsData.length;
      const totalAssignments = assignmentsData.length;
      const totalSubmissions = studentsData.reduce((sum, student) => 
        sum + (student.submissionCount || 0), 0
      );
      const averageProgress = studentsData.length > 0 
        ? studentsData.reduce((sum, student) => sum + (student.averageProgress || 0), 0) / studentsData.length
        : 0;

      setStats({
        totalStudents,
        totalAssignments,
        totalSubmissions,
        averageProgress: Math.round(averageProgress),
      });

      // Set recent data
      setRecentStudents(studentsData.slice(0, 5));
      setRecentAssignments(assignmentsData.slice(0, 5));
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  const StatCard = ({ title, value, icon, color }) => (
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
          </Box>
          <Box
            sx={{
              backgroundColor: color,
              borderRadius: '50%',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {React.cloneElement(icon, { sx: { color: 'white' } })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
        Admin Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={<PeopleIcon />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Assignments"
            value={stats.totalAssignments}
            icon={<AssignmentIcon />}
            color="secondary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Submissions"
            value={stats.totalSubmissions}
            icon={<CheckCircleIcon />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg Progress"
            value={`${stats.averageProgress}%`}
            icon={<TrendingUpIcon />}
            color="info.main"
          />
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        {/* Recent Students */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
              Recent Students
            </Typography>
            <List>
              {recentStudents.map((student, index) => (
                <ListItem key={student._id || index} divider>
                  <ListItemAvatar>
                    <Avatar>{student.name?.charAt(0)?.toUpperCase()}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={student.name}
                    secondary={`${student.courseName || 'No Course'} • ${student.submissionCount || 0} submissions`}
                  />
                  <Chip
                    label={`${student.averageProgress || 0}%`}
                    color={student.averageProgress >= 80 ? 'success' : 'warning'}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Recent Assignments */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
              Recent Assignments
            </Typography>
            <List>
              {recentAssignments.map((assignment, index) => (
                <ListItem key={assignment._id || index} divider>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <AssignmentIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={assignment.moduleName}
                    secondary={`${assignment.subModuleName || 'No Submodule'} • ${assignment.assignedStudents?.length || 0} students`}
                  />
                  <Chip
                    label={assignment.assignedDate ? new Date(assignment.assignedDate).toLocaleDateString() : 'N/A'}
                    variant="outlined"
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
