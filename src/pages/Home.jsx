import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  Chip,
  Fade,
  Grow,
  Slide,
  useTheme,
  useMediaQuery,
  Stack
} from '@mui/material';
import {
  Assignment,
  Folder,
  People,
  Notifications,
  Search,
  Security,
  Speed,
  Analytics,
  Timeline,
  AttachFile,
  FileDownload,
  Dashboard,
  CheckCircle,
  ArrowForward,
  Star,
  TrendingUp,
  Group,
  Lock,
  NotificationsActive,
  FilterList,
  Description,
  Schedule,
  Code,
  Cloud,
  Storage,
  Api,
  ExpandMore,
  ExpandLess,
  PlayArrow,
  Business,
  School,
  Build,
  VerifiedUser,
  ThumbUp,
  AutoAwesome
} from '@mui/icons-material';
import { useTheme as useCustomTheme } from '../context/ThemeContext';
import React from 'react';
import { AppBar, Toolbar } from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';
import logo from '../assets/logo.png';

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { mode } = useCustomTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [visibleSections, setVisibleSections] = useState({});
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const howItWorksRef = useRef(null);
  const testimonialsRef = useRef(null);
  const techStackRef = useRef(null);
  const faqRef = useRef(null);
  const [expandedFaq, setExpandedFaq] = useState({});

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleSections((prev) => ({
            ...prev,
            [entry.target.id]: true
          }));
        }
      });
    }, observerOptions);

    const sections = [heroRef, featuresRef, statsRef, howItWorksRef, testimonialsRef, techStackRef, faqRef].filter(Boolean);
    sections.forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      sections.forEach((ref) => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, []);

  const features = [
    {
      icon: <Assignment sx={{ fontSize: 40 }} />,
      title: 'Ticket Management',
      description: 'Create, track, and manage issues with advanced filtering, status updates, and priority management.',
      color: 'primary'
    },
    {
      icon: <Folder sx={{ fontSize: 40 }} />,
      title: 'Project Organization',
      description: 'Organize tickets by projects, assign teams, and track progress across multiple initiatives.',
      color: 'secondary'
    },
    {
      icon: <People sx={{ fontSize: 40 }} />,
      title: 'Team Collaboration',
      description: 'Work together seamlessly with team assignments, watchers, and real-time notifications.',
      color: 'info'
    },
    {
      icon: <NotificationsActive sx={{ fontSize: 40 }} />,
      title: 'Real-time Notifications',
      description: 'Stay updated with instant notifications for ticket updates, comments, and assignments.',
      color: 'warning'
    },
    {
      icon: <Schedule sx={{ fontSize: 40 }} />,
      title: 'SLA Monitoring',
      description: 'Automated SLA breach detection with alerts and deadline tracking for timely resolution.',
      color: 'error'
    },
    {
      icon: <Search sx={{ fontSize: 40 }} />,
      title: 'Advanced Search',
      description: 'Powerful search with filters, saved queries, and quick access to relevant tickets.',
      color: 'success'
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Role-Based Access',
      description: 'Secure access control with Admin and User roles, ensuring proper permissions.',
      color: 'primary'
    },
    {
      icon: <Description sx={{ fontSize: 40 }} />,
      title: 'Rich Text Editor',
      description: 'Create detailed descriptions with formatting, user mentions, and rich content support.',
      color: 'secondary'
    },
    {
      icon: <AttachFile sx={{ fontSize: 40 }} />,
      title: 'File Attachments',
      description: 'Attach images and files to tickets and comments for better context and documentation.',
      color: 'info'
    },
    {
      icon: <Timeline sx={{ fontSize: 40 }} />,
      title: 'Activity Logs',
      description: 'Complete audit trail of all ticket changes, comments, and status updates.',
      color: 'warning'
    },
    {
      icon: <Analytics sx={{ fontSize: 40 }} />,
      title: 'Analytics Dashboard',
      description: 'Comprehensive statistics, status breakdowns, and insights into your ticket workflow.',
      color: 'success'
    },
    {
      icon: <FileDownload sx={{ fontSize: 40 }} />,
      title: 'Export Functionality',
      description: 'Export tickets to CSV, Excel, or PDF for reporting and analysis purposes.',
      color: 'error'
    }
  ];

  const stats = [
    { label: 'Projects', value: '50+', icon: <Folder />, color: 'primary' },
    { label: 'Tickets Tracked', value: '1000+', icon: <Assignment />, color: 'secondary' },
    { label: 'Active Users', value: '200+', icon: <People />, color: 'info' },
    { label: 'Teams', value: '25+', icon: <Group />, color: 'success' }
  ];

  const benefits = [
    {
      title: 'Streamlined Workflow',
      description: 'Organize and prioritize work efficiently with intuitive ticket management.',
      icon: <Speed />
    },
    {
      title: 'Team Productivity',
      description: 'Enhance collaboration with real-time updates and seamless communication.',
      icon: <TrendingUp />
    },
    {
      title: 'Complete Visibility',
      description: 'Track progress, monitor SLAs, and gain insights with comprehensive dashboards.',
      icon: <Dashboard />
    },
    {
      title: 'Enterprise Security',
      description: 'Secure your data with role-based access control and authentication.',
      icon: <Lock />
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Create Projects',
      description: 'Set up your projects and organize them by teams. Define project goals and assign members.',
      icon: <Folder sx={{ fontSize: 50 }} />
    },
    {
      step: 2,
      title: 'Create Tickets',
      description: 'Add tickets with detailed descriptions, assign priorities, and set due dates for tracking.',
      icon: <Assignment sx={{ fontSize: 50 }} />
    },
    {
      step: 3,
      title: 'Assign & Track',
      description: 'Assign tickets to team members, track progress, and monitor SLA compliance in real-time.',
      icon: <People sx={{ fontSize: 50 }} />
    },
    {
      step: 4,
      title: 'Collaborate',
      description: 'Add comments, attach files, mention users, and collaborate seamlessly with your team.',
      icon: <Group sx={{ fontSize: 50 }} />
    },
    {
      step: 5,
      title: 'Monitor & Analyze',
      description: 'View comprehensive dashboards, track metrics, and export data for reporting.',
      icon: <Analytics sx={{ fontSize: 50 }} />
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Project Manager',
      company: 'TechCorp',
      image: 'SJ',
      rating: 5,
      text: 'This tracker has transformed how our team manages issues. The real-time notifications and SLA monitoring keep us on track.'
    },
    {
      name: 'Michael Chen',
      role: 'Engineering Lead',
      company: 'DevSolutions',
      image: 'MC',
      rating: 5,
      text: 'The advanced search and filtering capabilities make it easy to find exactly what we need. Highly recommended!'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Product Owner',
      company: 'InnovateLabs',
      image: 'ER',
      rating: 5,
      text: 'The dashboard provides excellent visibility into our project health. The role-based access ensures security without complexity.'
    }
  ];

  const techStack = [
    { name: 'React 19', icon: <Code />, color: 'primary' },
    { name: 'Material UI', icon: <AutoAwesome />, color: 'secondary' },
    { name: 'Node.js', icon: <Cloud />, color: 'info' },
    { name: 'Express', icon: <Api />, color: 'success' },
    { name: 'MySQL', icon: <Storage />, color: 'warning' },
    { name: 'JWT Auth', icon: <VerifiedUser />, color: 'error' }
  ];

  const useCases = [
    {
      title: 'Software Development',
      description: 'Track bugs, feature requests, and technical debt across development sprints.',
      icon: <Code />,
      color: 'primary'
    },
    {
      title: 'Project Management',
      description: 'Manage project tasks, milestones, and deliverables with comprehensive tracking.',
      icon: <Business />,
      color: 'secondary'
    },
    {
      title: 'IT Support',
      description: 'Handle support tickets, track resolution times, and maintain SLA compliance.',
      icon: <Notifications />,
      color: 'info'
    },
    {
      title: 'Quality Assurance',
      description: 'Track test cases, report defects, and monitor quality metrics throughout the SDLC.',
      icon: <CheckCircle />,
      color: 'success'
    }
  ];

  const faqs = [
    {
      question: 'How secure is the Issue Tracker?',
      answer: 'We use JWT-based authentication with refresh tokens, role-based access control, and secure password hashing. All data is encrypted in transit and at rest.'
    },
    {
      question: 'Can I customize ticket fields?',
      answer: 'Yes! The tracker supports custom modules, tags, priorities, and statuses. You can also add custom fields through the project settings.'
    },
    {
      question: 'Does it support integrations?',
      answer: 'Currently, we support email notifications via SMTP. API endpoints are available for custom integrations. More integrations are coming soon!'
    },
    {
      question: 'How does SLA monitoring work?',
      answer: 'SLAs are automatically calculated based on ticket priority and due dates. The system sends alerts when tickets are at risk of breaching their SLA.'
    },
    {
      question: 'Can I export my data?',
      answer: 'Yes! You can export tickets to CSV, Excel, or PDF formats. Bulk export options are available for admins.'
    },
    {
      question: 'Is there a mobile app?',
      answer: 'The application is fully responsive and works great on mobile browsers. A native mobile app is in development.'
    }
  ];

  const handleFaqToggle = (index) => {
    setExpandedFaq((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Navigation Bar */}
      <AppBar
        position="fixed"
        sx={{
          bgcolor: mode === 'dark' ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          boxShadow: 1
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
            <Box
              sx={{
                height: 40,
                width: 40,
                borderRadius: '10px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'transparent'
              }}
            >
              <Box
                component="img"
                src={logo}
                alt="Logo"
                sx={{
                  height: '120%',
                  width: '120%',
                  objectFit: 'contain',
                  objectPosition: 'center',
                  display: 'block'
                }}
              />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Issue Tracker
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<LoginIcon />}
            onClick={() => navigate('/login')}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3
            }}
          >
            Sign In
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        ref={heroRef}
        id="hero"
        sx={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pt: 8,
          background: mode === 'dark'
            ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 50%, #1e1e1e 100%)'
            : 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 50%, #f5f5f5 100%)',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: mode === 'dark'
              ? 'radial-gradient(circle at 20% 50%, rgba(25, 118, 210, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 213, 0, 0.1) 0%, transparent 50%)'
              : 'radial-gradient(circle at 20% 50%, rgba(25, 118, 210, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 213, 0, 0.05) 0%, transparent 50%)',
            animation: 'pulse 8s ease-in-out infinite'
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Fade in={visibleSections.hero !== false} timeout={1000}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '4rem', lg: '5rem' },
                  fontWeight: 'bold',
                  mb: 2,
                  background: mode === 'dark'
                    ? 'linear-gradient(135deg, #64b5f6 0%, #1976d2 50%, #64b5f6 100%)'
                    : 'linear-gradient(135deg, #1976d2 0%, #005DAE 50%, #1976d2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'shimmer 3s ease-in-out infinite',
                  '@keyframes shimmer': {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' }
                  }
                }}
              >
                Issue Tracker
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontSize: { xs: '1.1rem', md: '1.5rem' },
                  color: 'text.secondary',
                  mb: 4,
                  maxWidth: '800px',
                  mx: 'auto',
                  lineHeight: 1.6
                }}
              >
                Professional issue tracking and project management solution
                <br />
                Built for teams that value efficiency and collaboration
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="center"
                sx={{ mt: 4 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/login')}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    borderRadius: 3,
                    textTransform: 'none',
                    boxShadow: 4,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 6,
                      transition: 'all 0.3s'
                    },
                    transition: 'all 0.3s'
                  }}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => {
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    borderRadius: 3,
                    textTransform: 'none',
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s'
                    },
                    transition: 'all 0.3s'
                  }}
                >
                  Learn More
                </Button>
              </Stack>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box
        ref={statsRef}
        id="stats"
        sx={{
          py: 6,
          bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
          borderTop: 1,
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={stat.label}>
                <Grow in={visibleSections.stats !== false} timeout={500 + index * 100}>
                  <Card
                    sx={{
                      textAlign: 'center',
                      p: 3,
                      height: '100%',
                      bgcolor: 'background.paper',
                      boxShadow: 2,
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: 6
                      }
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
                        mx: 'auto',
                        mb: 2,
                        bgcolor: `${stat.color}.main`,
                        color: 'white'
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                    <Typography variant="h3" fontWeight="bold" color={`${stat.color}.main`}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box
        ref={featuresRef}
        id="features"
        sx={{
          py: 10,
          bgcolor: 'background.default'
        }}
      >
        <Container maxWidth="lg">
          <Fade in={visibleSections.features !== false} timeout={1000}>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontWeight: 'bold',
                  mb: 2
                }}
              >
                Powerful Features
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: '600px', mx: 'auto' }}
              >
                Everything you need to manage issues, track progress, and collaborate effectively
              </Typography>
            </Box>
          </Fade>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={feature.title}>
                <Slide
                  direction="up"
                  in={visibleSections.features !== false}
                  timeout={300 + index * 100}
                >
                  <Card
                    sx={{
                      height: '100%',
                      p: 3,
                      bgcolor: 'background.paper',
                      boxShadow: 3,
                      transition: 'all 0.3s',
                      border: 1,
                      borderColor: 'divider',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: 8,
                        borderColor: `${feature.color}.main`
                      }
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2,
                        color: `${feature.color}.main`
                      }}
                    >
                      {feature.icon}
                      <Typography
                        variant="h6"
                        sx={{ ml: 2, fontWeight: 'bold' }}
                      >
                        {feature.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {feature.description}
                    </Typography>
                  </Card>
                </Slide>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box
        ref={howItWorksRef}
        id="how-it-works"
        sx={{
          py: 10,
          bgcolor: 'background.default'
        }}
      >
        <Container maxWidth="lg">
          <Fade in={visibleSections['how-it-works'] !== false} timeout={1000}>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontWeight: 'bold',
                  mb: 2
                }}
              >
                How It Works
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: '600px', mx: 'auto' }}
              >
                Get started in 5 simple steps
              </Typography>
            </Box>
          </Fade>

          <Grid container spacing={4} sx={{ position: 'relative' }}>
            {howItWorks.map((step, index) => (
              <Grid item xs={12} sm={6} md={4} key={step.step} sx={{ pt: 3 }}>
                <Slide
                  direction="up"
                  in={visibleSections['how-it-works'] !== false}
                  timeout={300 + index * 150}
                >
                  <Card
                    sx={{
                      p: 4,
                      pt: 6,
                      textAlign: 'center',
                      bgcolor: 'background.paper',
                      boxShadow: 3,
                      height: '100%',
                      position: 'relative',
                      overflow: 'visible',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: 8
                      }
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -25,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '1.5rem',
                        zIndex: 2,
                        boxShadow: 3
                      }}
                    >
                      {step.step}
                    </Box>
                    <Box sx={{ mt: 3, mb: 2, color: 'primary.main' }}>
                      {step.icon}
                    </Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      {step.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {step.description}
                    </Typography>
                  </Card>
                </Slide>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Use Cases Section */}
      <Box
        sx={{
          py: 10,
          bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'
        }}
      >
        <Container maxWidth="lg">
          <Fade in timeout={1000}>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontWeight: 'bold',
                  mb: 2
                }}
              >
                Perfect For
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: '600px', mx: 'auto' }}
              >
                Trusted by teams across various industries
              </Typography>
            </Box>
          </Fade>

          <Grid container spacing={4}>
            {useCases.map((useCase, index) => (
              <Grid item xs={12} sm={6} md={3} key={useCase.title}>
                <Grow in timeout={400 + index * 100}>
                  <Card
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      bgcolor: 'background.paper',
                      boxShadow: 2,
                      height: '100%',
                      transition: 'all 0.3s',
                      border: 1,
                      borderColor: 'divider',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: 6,
                        borderColor: `${useCase.color}.main`
                      }
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
                        mx: 'auto',
                        mb: 2,
                        bgcolor: `${useCase.color}.main`,
                        color: 'white'
                      }}
                    >
                      {useCase.icon}
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {useCase.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {useCase.description}
                    </Typography>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box
        ref={testimonialsRef}
        id="testimonials"
        sx={{
          py: 10,
          bgcolor: 'background.default'
        }}
      >
        <Container maxWidth="lg">
          <Fade in={visibleSections.testimonials !== false} timeout={1000}>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontWeight: 'bold',
                  mb: 2
                }}
              >
                What Our Users Say
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: '600px', mx: 'auto' }}
              >
                Real feedback from teams using our tracker
              </Typography>
            </Box>
          </Fade>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={testimonial.name}>
                <Slide
                  direction="up"
                  in={visibleSections.testimonials !== false}
                  timeout={300 + index * 150}
                >
                  <Card
                    sx={{
                      p: 4,
                      bgcolor: 'background.paper',
                      boxShadow: 3,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: 6
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} sx={{ color: 'warning.main', fontSize: 20 }} />
                      ))}
                    </Box>
                    <Typography variant="body1" sx={{ mb: 3, flexGrow: 1, fontStyle: 'italic' }}>
                      "{testimonial.text}"
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          bgcolor: 'primary.main',
                          mr: 2,
                          width: 48,
                          height: 48
                        }}
                      >
                        {testimonial.image}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {testimonial.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {testimonial.role} at {testimonial.company}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Slide>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Technology Stack Section */}
      <Box
        ref={techStackRef}
        id="tech-stack"
        sx={{
          py: 10,
          bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'
        }}
      >
        <Container maxWidth="lg">
          <Fade in={visibleSections['tech-stack'] !== false} timeout={1000}>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontWeight: 'bold',
                  mb: 2
                }}
              >
                Built With Modern Technology
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: '600px', mx: 'auto' }}
              >
                Powered by industry-leading technologies
              </Typography>
            </Box>
          </Fade>

          <Grid container spacing={4}>
            {techStack.map((tech, index) => (
              <Grid item xs={6} sm={4} md={2} key={tech.name}>
                <Grow in={visibleSections['tech-stack'] !== false} timeout={300 + index * 100}>
                  <Card
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      bgcolor: 'background.paper',
                      boxShadow: 2,
                      height: '100%',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.05)',
                        boxShadow: 6
                      }
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        mx: 'auto',
                        mb: 2,
                        bgcolor: `${tech.color}.main`,
                        color: 'white'
                      }}
                    >
                      {tech.icon}
                    </Avatar>
                    <Typography variant="body1" fontWeight="bold">
                      {tech.name}
                    </Typography>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Box
        sx={{
          py: 10,
          bgcolor: 'background.default'
        }}
      >
        <Container maxWidth="lg">
          <Fade in timeout={1000}>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontWeight: 'bold',
                  mb: 2
                }}
              >
                Why Choose Our Tracker?
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: '600px', mx: 'auto' }}
              >
                Built for modern teams who demand excellence
              </Typography>
            </Box>
          </Fade>

          <Grid container spacing={4}>
            {benefits.map((benefit, index) => (
              <Grid item xs={12} md={6} key={benefit.title}>
                <Grow in timeout={500 + index * 200}>
                  <Card
                    sx={{
                      p: 4,
                      bgcolor: 'background.paper',
                      boxShadow: 2,
                      height: '100%',
                      display: 'flex',
                      alignItems: 'flex-start',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: 4
                      }
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        mr: 3,
                        bgcolor: 'primary.main',
                        color: 'white'
                      }}
                    >
                      {benefit.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h5" fontWeight="bold" gutterBottom>
                        {benefit.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {benefit.description}
                      </Typography>
                    </Box>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box
        ref={faqRef}
        id="faq"
        sx={{
          py: 10,
          bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'
        }}
      >
        <Container maxWidth="md">
          <Fade in={visibleSections.faq !== false} timeout={1000}>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontWeight: 'bold',
                  mb: 2
                }}
              >
                Frequently Asked Questions
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: '600px', mx: 'auto' }}
              >
                Everything you need to know about our tracker
              </Typography>
            </Box>
          </Fade>

          <Box>
            {faqs.map((faq, index) => (
              <Card
                key={index}
                sx={{
                  mb: 2,
                  bgcolor: 'background.paper',
                  boxShadow: 2,
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: 4
                  }
                }}
              >
                <Button
                  fullWidth
                  onClick={() => handleFaqToggle(index)}
                  sx={{
                    p: 3,
                    textAlign: 'left',
                    textTransform: 'none',
                    justifyContent: 'space-between',
                    color: 'text.primary'
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    {faq.question}
                  </Typography>
                  {expandedFaq[index] ? <ExpandLess /> : <ExpandMore />}
                </Button>
                {expandedFaq[index] && (
                  <Box sx={{ px: 3, pb: 3 }}>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      {faq.answer}
                    </Typography>
                  </Box>
                )}
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 10,
          bgcolor: 'primary.main',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            animation: 'rotate 20s linear infinite',
            '@keyframes rotate': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' }
            }
          }
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Fade in timeout={1000}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontWeight: 'bold',
                  mb: 2
                }}
              >
                Ready to Get Started?
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                Join thousands of teams already using our issue tracker
              </Typography>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                onClick={() => navigate('/login')}
                sx={{
                  px: 6,
                  py: 2,
                  fontSize: '1.2rem',
                  borderRadius: 3,
                  textTransform: 'none',
                  bgcolor: 'white',
                  color: 'primary.main',
                  fontWeight: 'bold',
                  boxShadow: 4,
                  '&:hover': {
                    bgcolor: 'grey.100',
                    transform: 'translateY(-4px)',
                    boxShadow: 8,
                    transition: 'all 0.3s'
                  },
                  transition: 'all 0.3s'
                }}
              >
                Start Tracking Now
              </Button>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          py: 4,
          bgcolor: mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)',
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary">
            © 2024 Issue Tracker. Built with React, Material UI, and Express.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
