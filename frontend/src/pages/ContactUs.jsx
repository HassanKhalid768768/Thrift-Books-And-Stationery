import React, { useState, useEffect, useContext } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  TextField, 
  Button, 
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Alert,
  Stack,
  useTheme
} from '@mui/material';
import { DarkModeContext } from '../context/DarkModeContext';
import { 
  Email as EmailIcon, 
  Phone as PhoneIcon, 
  LocationOn as LocationIcon, 
  AccessTime as TimeIcon,
  Map as MapIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const ContactUs = () => {
  const { darkMode } = useContext(DarkModeContext);
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(true);
  const [mapError, setMapError] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Subject validation
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 20) {
      newErrors.message = 'Message should be at least 20 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill all fields correctly');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const backend_url = process.env.REACT_APP_API_URL || 'http://localhost:4000';
      
      // Send message to backend API
      const response = await fetch(`${backend_url}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      let data;
      try {
        data = await response.json();
      } catch (error) {
        throw new Error('Invalid response from server. Please try again later.');
      }
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }
      
      // Success message
      toast.success('Message sent successfully! We will get back to you soon.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      let errorMessage = 'Failed to send message. Please try again later.';
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      console.error('Contact form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        my: 6, 
        minHeight: '70vh',
        color: darkMode ? 'var(--text-primary)' : 'inherit',
        transition: 'all 0.3s ease'
      }}
    >
      <Typography variant="h3" component="h1" align="center" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        Contact Us
      </Typography>
      
      <Box sx={{ mb: 5 }}>
        <Typography variant="body1" paragraph align="center">
          Have a question or feedback? We'd love to hear from you. Fill out the form below or use our contact information.
        </Typography>
      </Box>
      
      <Grid container spacing={4}>
        {/* Contact Form - Left Column */}
        <Grid item xs={12} md={7}>
          {/* Contact Form */}
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4,
              bgcolor: darkMode ? 'var(--card-bg)' : 'background.paper',
              color: darkMode ? 'var(--text-primary)' : 'inherit',
              transition: 'all 0.3s ease'
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Send Us a Message
            </Typography>
            
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Your Name"
                    name="name"
                    variant="outlined"
                    value={formData.name}
                    onChange={handleChange}
                    error={!!errors.name}
                    helperText={errors.name}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: darkMode ? 'var(--border-color)' : 'rgba(0, 0, 0, 0.23)',
                        },
                        '&:hover fieldset': {
                          borderColor: darkMode ? 'var(--text-secondary)' : 'rgba(0, 0, 0, 0.23)',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: darkMode ? 'var(--text-secondary)' : 'inherit',
                      },
                      '& .MuiInputBase-input': {
                        color: darkMode ? 'var(--text-primary)' : 'inherit',
                      },
                      '& .MuiFormHelperText-root': {
                        color: darkMode ? 'var(--text-secondary)' : 'inherit',
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    variant="outlined"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: darkMode ? 'var(--border-color)' : 'rgba(0, 0, 0, 0.23)',
                        },
                        '&:hover fieldset': {
                          borderColor: darkMode ? 'var(--text-secondary)' : 'rgba(0, 0, 0, 0.23)',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: darkMode ? 'var(--text-secondary)' : 'inherit',
                      },
                      '& .MuiInputBase-input': {
                        color: darkMode ? 'var(--text-primary)' : 'inherit',
                      },
                      '& .MuiFormHelperText-root': {
                        color: darkMode ? 'var(--text-secondary)' : 'inherit',
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Subject"
                    name="subject"
                    variant="outlined"
                    value={formData.subject}
                    onChange={handleChange}
                    error={!!errors.subject}
                    helperText={errors.subject}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: darkMode ? 'var(--border-color)' : 'rgba(0, 0, 0, 0.23)',
                        },
                        '&:hover fieldset': {
                          borderColor: darkMode ? 'var(--text-secondary)' : 'rgba(0, 0, 0, 0.23)',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: darkMode ? 'var(--text-secondary)' : 'inherit',
                      },
                      '& .MuiInputBase-input': {
                        color: darkMode ? 'var(--text-primary)' : 'inherit',
                      },
                      '& .MuiFormHelperText-root': {
                        color: darkMode ? 'var(--text-secondary)' : 'inherit',
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Message"
                    name="message"
                    multiline
                    rows={5}
                    variant="outlined"
                    value={formData.message}
                    onChange={handleChange}
                    error={!!errors.message}
                    helperText={errors.message}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: darkMode ? 'var(--border-color)' : 'rgba(0, 0, 0, 0.23)',
                        },
                        '&:hover fieldset': {
                          borderColor: darkMode ? 'var(--text-secondary)' : 'rgba(0, 0, 0, 0.23)',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: darkMode ? 'var(--text-secondary)' : 'inherit',
                      },
                      '& .MuiInputBase-input': {
                        color: darkMode ? 'var(--text-primary)' : 'inherit',
                      },
                      '& .MuiFormHelperText-root': {
                        color: darkMode ? 'var(--text-secondary)' : 'inherit',
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="secondary"
                    size="large"
                    disabled={isSubmitting}
                    sx={{ 
                      py: 1.5, 
                      px: 4,
                      '&.Mui-disabled': {
                        backgroundColor: darkMode ? 'rgba(156, 39, 176, 0.3)' : undefined,
                        color: darkMode ? 'rgba(255, 255, 255, 0.7)' : undefined
                      }
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                        Sending...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
        
        {/* Contact Information - Right Column */}
        <Grid item xs={12} md={5}>
          {/* Contact Information Card */}
          <Card 
            elevation={3} 
            sx={{ 
              height: '100%',
              bgcolor: darkMode ? 'var(--card-bg)' : 'background.paper',
              color: darkMode ? 'var(--text-primary)' : 'inherit',
              transition: 'all 0.3s ease'
            }}
          >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
                  Contact Information
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                    <EmailIcon sx={{ mr: 2, color: 'secondary.main' }} />
                    <Box>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                        Email Us
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <a href="mailto:support@urbanstyle.com" style={{ color: 'inherit', textDecoration: 'none' }}>
                          support@urbanstyle.com
                        </a>
                      </Typography>
                      <Typography variant="body1">
                        <a href="mailto:info@urbanstyle.com" style={{ color: 'inherit', textDecoration: 'none' }}>
                          info@urbanstyle.com
                        </a>
                      </Typography>
                    </Box>
                </Box>
                  
                <Divider sx={{ my: 3 }} />
                  
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                  <PhoneIcon sx={{ mr: 2, color: 'secondary.main' }} />
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                      Call Us
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <a href="tel:+923001234567" style={{ color: 'inherit', textDecoration: 'none' }}>
                        +92 300 123 4567
                      </a>
                    </Typography>
                    <Typography variant="body1">
                      <a href="tel:+923001234568" style={{ color: 'inherit', textDecoration: 'none' }}>
                        +92 300 123 4568
                      </a>
                    </Typography>
                  </Box>
                </Box>
                  
                <Divider sx={{ my: 3 }} />
                  
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                  <LocationIcon sx={{ mr: 2, color: 'secondary.main' }} />
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                      Visit Us
                    </Typography>
                    <Typography variant="body1">
                      UrbanStyle Headquarters<br />
                      123 Fashion Avenue<br />
                      Gulberg III, Lahore<br />
                      Pakistan 54000
                    </Typography>
                  </Box>
                </Box>
                  
                <Divider sx={{ my: 3 }} />
                  
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <TimeIcon sx={{ mr: 2, color: 'secondary.main' }} />
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                      Business Hours
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Monday-Friday:</strong> 9:00 AM - 6:00 PM
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Saturday:</strong> 10:00 AM - 4:00 PM
                    </Typography>
                    <Typography variant="body1">
                      <strong>Sunday:</strong> Closed
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
        </Grid>
        
        {/* Map Container - Second Row */}
        <Grid item xs={12} md={5}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4,
              bgcolor: darkMode ? 'var(--card-bg)' : 'background.paper',
              color: darkMode ? 'var(--text-primary)' : 'inherit',
              transition: 'all 0.3s ease'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <MapIcon sx={{ mr: 2, color: 'secondary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                Our Location
              </Typography>
            </Box>
            
            <Box sx={{ 
              height: '610px',  
              width: '685px',
              border: `1px solid ${darkMode ? 'var(--border-color)' : '#eee'}`, 
              borderRadius: 1,  
              overflow: 'hidden',
              position: 'relative',
              transition: 'all 0.3s ease'
            }}>
                  {mapError ? (
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      height: '100%',
                      p: 2,
                      bgcolor: darkMode ? 'var(--bg-secondary)' : 'inherit',
                      transition: 'all 0.3s ease'
                    }}>
                      <Alert 
                        severity="error" 
                        sx={{ 
                          mb: 2, 
                          width: '100%',
                          bgcolor: darkMode ? 'rgba(211, 47, 47, 0.1)' : undefined,
                          color: darkMode ? '#f44336' : undefined,
                          '& .MuiAlert-icon': {
                            color: darkMode ? '#f44336' : undefined
                          }
                        }}
                      >
                        Failed to load map
                      </Alert>
                      <Button 
                        variant="outlined" 
                        href="https://maps.google.com/?q=Gulberg+III,+Lahore" 
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          color: darkMode ? 'var(--text-primary)' : undefined,
                          borderColor: darkMode ? 'var(--border-color)' : undefined,
                          '&:hover': {
                            borderColor: darkMode ? 'var(--text-secondary)' : undefined,
                            bgcolor: darkMode ? 'rgba(255, 255, 255, 0.05)' : undefined
                          }
                        }}
                      >
                        Open in Google Maps
                      </Button>
                    </Box>
                  ) : (
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13611.846903161665!2d74.34676005!3d31.515719049999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190483e58107d9%3A0xc23abe6ccc7e2462!2sGulberg%20III%2C%20Lahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1682767253851!5m2!1sen!2s"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      onLoad={() => setMapLoaded(true)}
                      onError={() => {
                        setMapLoaded(false);
                        setMapError(true);
                      }}
                      title="UrbanStyle Location"
                    ></iframe>
                  )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ContactUs;
