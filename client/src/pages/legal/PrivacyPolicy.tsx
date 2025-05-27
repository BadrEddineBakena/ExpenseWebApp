import { Box, Typography, Container } from '@mui/material';
import { Helmet } from 'react-helmet-async';

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | ExpenseApp</title>
      </Helmet>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Privacy Policy
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Typography variant="body1" paragraph>
            Last updated: {new Date().toLocaleDateString()}
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            1. Information We Collect
          </Typography>
          <Typography variant="body1" paragraph>
            We collect information that you provide directly to us, including:
          </Typography>
          <ul>
            <li>Account information (name, email, password)</li>
            <li>Financial information (expenses, income, budget goals)</li>
            <li>Device information and usage data</li>
          </ul>

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            2. How We Use Your Information
          </Typography>
          <Typography variant="body1" paragraph>
            We use the information we collect to:
          </Typography>
          <ul>
            <li>Provide and maintain our services</li>
            <li>Process your transactions</li>
            <li>Send you notifications and updates</li>
            <li>Improve our services</li>
          </ul>

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            3. Data Security
          </Typography>
          <Typography variant="body1" paragraph>
            We implement appropriate security measures to protect your personal information.
            However, no method of transmission over the Internet is 100% secure.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            4. Your Rights
          </Typography>
          <Typography variant="body1" paragraph>
            You have the right to:
          </Typography>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of marketing communications</li>
          </ul>

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            5. Contact Us
          </Typography>
          <Typography variant="body1" paragraph>
            If you have any questions about this Privacy Policy, please contact us at:
            support@expenseapp.com
          </Typography>
        </Box>
      </Container>
    </>
  );
};

export default PrivacyPolicy; 