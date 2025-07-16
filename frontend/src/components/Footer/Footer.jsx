import React, { useState } from "react";
import { Grid, Typography, Button, TextField, Box, IconButton } from "@mui/material";
import { Facebook, Instagram, Twitter } from "@mui/icons-material";
import { toast } from "react-toastify";
import { api } from '../../utils/api';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const changeHandler = (e) => {
    setEmail(e.target.value);
  };

  const submitHandler = async () => {
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await api.subscribe(email);
      const json = await response.json();
      
      if (response.ok) {
        toast.success('Subscribed successfully!');
        setEmail('');
      } else {
        toast.error(json.error || 'Subscription failed');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast.error('Failed to connect to the server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: "#121212", color: "white", py: 5, px: { xs: 3, md: 10 } }}>
      <Grid container spacing={4} justifyContent="space-between">
        {/* SHOP SECTION */}
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="h6" gutterBottom>
            Shop
          </Typography>
          <Button component="a" href="/tshirts" color="inherit" sx={{ display: "block", textAlign: "left" }}>
            T-Shirts
          </Button>
          <Button component="a" href="/polo" color="inherit" sx={{ display: "block", textAlign: "left" }}>
            Polo
          </Button>
          <Button component="a" href="/formalshirts" color="inherit" sx={{ display: "block", textAlign: "left" }}>
            Formal Shirts
          </Button>
        </Grid>

        {/* CUSTOMER SERVICE */}
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="h6" gutterBottom>
            Customer Service
          </Typography>
          <Button component="a" href="/faq" color="inherit" sx={{ display: "block", textAlign: "left" }}>
            FAQs
          </Button>
          <Button component="a" href="/shipping-returns" color="inherit" sx={{ display: "block", textAlign: "left" }}>
            Shipping & Returns
          </Button>
          <Button component="a" href="/myorders" color="inherit" sx={{ display: "block", textAlign: "left" }}>
            Track Order
          </Button>
          <Button component="a" href="/contact" color="inherit" sx={{ display: "block", textAlign: "left" }}>
            Contact Us
          </Button>
        </Grid>

        {/* ABOUT US */}
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="h6" gutterBottom>
            About Thrift Books & Stationery
          </Typography>
          <Typography variant="body2" sx={{ maxWidth: 280, mb: 2 }}>
            Thrift Books & Stationery is a comprehensive e-commerce platform offering books, stationery, and educational materials. We provide a smooth, user-friendly shopping experience with smart search features and easy order tracking. Our platform ensures seamless navigation and interactive displays for modern book lovers and students.
          </Typography>
        </Grid>

        {/* NEWSLETTER & SOCIAL MEDIA */}
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="h6" gutterBottom>
            Stay in the Loop
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Get updates on exclusive releases and latest trends.
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Enter your email"
              value={email}
              onChange={changeHandler}
              disabled={isLoading}
              sx={{ bgcolor: "white", borderRadius: 1, flexGrow: 1 }}
            />
            <Button 
              variant="contained" 
              color="secondary" 
              sx={{ whiteSpace: "nowrap" }}
              onClick={submitHandler}
              disabled={isLoading}
            >
              {isLoading ? 'Subscribing...' : 'Subscribe'}
            </Button>
          </Box>

          {/* SOCIAL MEDIA LINKS */}
          <Box sx={{ mt: 3, display: "flex", justifyContent: "center", gap: 2 }}>
            <IconButton 
              href="https://www.instagram.com/thriftbooksandstationery" 
              target="_blank" 
              rel="noopener noreferrer" 
              color="inherit"
              sx={{ 
                transition: 'transform 0.2s, color 0.2s',
                '&:hover': { 
                  transform: 'scale(1.1)',
                  color: '#E1306C' // Instagram brand color
                } 
              }}
            >
              <Instagram fontSize="large" />
            </IconButton>
            <IconButton 
              href="https://www.facebook.com/thriftbooksandstationery" 
              target="_blank" 
              rel="noopener noreferrer" 
              color="inherit"
              sx={{ 
                transition: 'transform 0.2s, color 0.2s',
                '&:hover': { 
                  transform: 'scale(1.1)',
                  color: '#1877F2' // Facebook brand color
                } 
              }}
            >
              <Facebook fontSize="large" />
            </IconButton>
            <IconButton 
              href="https://twitter.com/thriftbooksandstationery" 
              target="_blank" 
              rel="noopener noreferrer" 
              color="inherit"
              sx={{ 
                transition: 'transform 0.2s, color 0.2s',
                '&:hover': { 
                  transform: 'scale(1.1)',
                  color: '#1DA1F2' // Twitter brand color
                } 
              }}
            >
              <Twitter fontSize="large" />
            </IconButton>
          </Box>
        </Grid>
      </Grid>

      {/* COPYRIGHT */}
      <Box sx={{ textAlign: "center", mt: 5, opacity: 0.7 }}>
        <Typography variant="body2">
          © {new Date().getFullYear()} Thrift Books & Stationery. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;
