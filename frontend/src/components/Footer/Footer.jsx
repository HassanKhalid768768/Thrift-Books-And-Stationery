import React, { useState } from "react";
import { Grid, Typography, Button, TextField, Box, IconButton } from "@mui/material";
import { Facebook, Instagram, Twitter } from "@mui/icons-material";
import { toast } from "react-toastify";

const Footer = () => {
  const [email, setEmail] = useState('');
  const backend_url = process.env.REACT_APP_API_URL;

  const changeHandler = (e) => {
    setEmail(e.target.value);
  };

  const submitHandler = async () => {
    try {
      const response = await fetch(`${backend_url}/api/subscribers`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const json = await response.json();
      
      if (response.ok) {
        toast.success('Subscribed successfully');
        setEmail('');
      } else {
        toast.error(json.error || 'Subscription failed');
        setEmail('');
      }
    } catch (error) {
      toast.error('Failed to connect to the server');
      console.error('Newsletter subscription error:', error);
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
            About UrbanStyle
          </Typography>
          <Typography variant="body2" sx={{ maxWidth: 280, mb: 2 }}>
            UrbanStyle is a sleek e-commerce platform dedicated to men's fashion, offering a smooth, user-friendly shopping experience. Customers can browse premium clothing, use smart search features, and track orders easily. Sellers benefit from efficient product, order, and promotion management. The platform ensures seamless navigation and interactive displays for modern shoppers.
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
              sx={{ bgcolor: "white", borderRadius: 1, flexGrow: 1 }}
            />
            <Button 
              variant="contained" 
              color="secondary" 
              sx={{ whiteSpace: "nowrap" }}
              onClick={submitHandler}
            >
              Subscribe
            </Button>
          </Box>

          {/* SOCIAL MEDIA LINKS */}
          <Box sx={{ mt: 3, display: "flex", justifyContent: "center", gap: 2 }}>
            <IconButton 
              href="https://www.instagram.com/urbanstyle" 
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
              href="https://www.facebook.com/urbanstyle" 
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
              href="https://twitter.com/urbanstyle" 
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
          © {new Date().getFullYear()} UrbanStyle. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;
