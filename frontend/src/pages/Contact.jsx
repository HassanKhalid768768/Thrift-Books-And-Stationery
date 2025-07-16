import React, { useContext, useState } from 'react';
import { Container, Typography, Box, Paper, Grid, TextField, Button } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import { DarkModeContext } from '../context/DarkModeContext';
import { toast } from 'react-toastify';

const Contact = () => {
  const { darkMode } = useContext(DarkModeContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const darkModeStyles = {
    container: {
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
    },
    paper: {
      backgroundColor: 'var(--bg-secondary)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-color)',
      boxShadow: darkMode ? '0 2px 8px var(--shadow-color)' : '0 2px 8px rgba(0,0,0,0.1)',
    },
    heading: {
      color: 'var(--text-primary)',
      fontWeight: 'bold',
    },
    icon: {
      color: 'var(--accent-color)',
      fontSize: 40,
      marginRight: 2,
    },
    textField: {
      '& .MuiOutlinedInput-root': {
        backgroundColor: 'var(--bg-primary)',
        '& fieldset': {
          borderColor: 'var(--border-color)',
        },
        '&:hover fieldset': {
          borderColor: 'var(--accent-color)',
        },
        '&.Mui-focused fieldset': {
          borderColor: 'var(--accent-color)',
        },
      },
      '& .MuiInputLabel-root': {
        color: 'var(--text-secondary)',
      },
      '& .MuiOutlinedInput-input': {
        color: 'var(--text-primary)',
      },
    },
    button: {
      backgroundColor: 'var(--accent-color)',
      color: 'white',
      '&:hover': {
        backgroundColor: 'var(--bg-hover)',
        border: '1px solid var(--accent-color)',
        color: 'var(--text-primary)',
      },
    },
    infoBox: {
      border: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-primary)',
      padding: 3,
      borderRadius: 1,
      marginBottom: 3,
    },
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically handle the form submission
    console.log('Form submitted:', formData);
    toast.success('Message sent successfully!');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Container maxWidth="lg" sx={{ ...darkModeStyles.container, my: 6, minHeight: '70vh' }}>
      <Typography variant="h3" component="h1" align="center" gutterBottom sx={{ ...darkModeStyles.heading, mb: 4 }}>
        Contact Us
      </Typography>

      <Box sx={{ mb: 5 }}>
        <Typography variant="body1" paragraph align="center" sx={{ color: 'var(--text-secondary)' }}>
          We're here to help! Send us a message and we'll get back to you as soon as possible.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Contact Form */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ ...darkModeStyles.paper, p: 4 }}>
            <Typography variant="h5" gutterBottom sx={darkModeStyles.heading}>
              Send us a Message
            </Typography>
            
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                sx={{ ...darkModeStyles.textField, mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                sx={{ ...darkModeStyles.textField, mb: 2 }}
              />
              <TextField
                fullWidth
                label="Subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                sx={{ ...darkModeStyles.textField, mb: 2 }}
              />
              <TextField
                fullWidth
                label="Message"
                name="message"
                multiline
                rows={4}
                value={formData.message}
                onChange={handleChange}
                required
                sx={{ ...darkModeStyles.textField, mb: 3 }}
              />
              <Button
                type="submit"
                variant="contained"
                sx={darkModeStyles.button}
              >
                Send Message
              </Button>
            </form>
          </Paper>
        </Grid>

        {/* Contact Information */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ ...darkModeStyles.paper, p: 4 }}>
            <Typography variant="h5" gutterBottom sx={darkModeStyles.heading}>
              Contact Information
            </Typography>

            <Box sx={darkModeStyles.infoBox}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EmailIcon sx={darkModeStyles.icon} />
                <Typography variant="h6" sx={darkModeStyles.heading}>
                  Email
                </Typography>
              </Box>
              <Typography sx={{ color: 'var(--text-primary)', pl: 6 }}>
                support@urbanstyle.com
              </Typography>
            </Box>

            <Box sx={darkModeStyles.infoBox}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PhoneIcon sx={darkModeStyles.icon} />
                <Typography variant="h6" sx={darkModeStyles.heading}>
                  Phone
                </Typography>
              </Box>
              <Typography sx={{ color: 'var(--text-primary)', pl: 6 }}>
                +92 300 123 4567
              </Typography>
            </Box>

            <Box sx={darkModeStyles.infoBox}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationOnIcon sx={darkModeStyles.icon} />
                <Typography variant="h6" sx={darkModeStyles.heading}>
                  Address
                </Typography>
              </Box>
              <Typography sx={{ color: 'var(--text-primary)', pl: 6 }}>
                123 Fashion Avenue<br />
                Gulberg III, Lahore<br />
                Pakistan 54000
              </Typography>
            </Box>

            <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mt: 4, textAlign: 'center' }}>
              Business Hours: Monday - Saturday, 9:00 AM - 6:00 PM PKT
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Contact;

