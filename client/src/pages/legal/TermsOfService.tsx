import { Box, Typography, Container } from '@mui/material';
import { Helmet } from 'react-helmet-async';

const TermsOfService = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service | ExpenseApp</title>
      </Helmet>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Terms of Service
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Typography variant="body1" paragraph>
            Last updated: {new Date().toLocaleDateString()}
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            1. Acceptance of Terms
          </Typography>
          <Typography variant="body1" paragraph>
            By accessing and using ExpenseApp, you agree to be bound by these Terms of Service
            and all applicable laws and regulations.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            2. Use of Service
          </Typography>
          <Typography variant="body1" paragraph>
            You agree to use the service only for lawful purposes and in accordance with these Terms.
            You are responsible for maintaining the confidentiality of your account and password.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            3. User Responsibilities
          </Typography>
          <Typography variant="body1" paragraph>
            You are responsible for:
          </Typography>
          <ul>
            <li>Maintaining accurate account information</li>
            <li>Protecting your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Complying with all applicable laws and regulations</li>
          </ul>

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            4. Service Modifications
          </Typography>
          <Typography variant="body1" paragraph>
            We reserve the right to modify or discontinue the service at any time without notice.
            We shall not be liable to you or any third party for any modification, suspension,
            or discontinuance of the service.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            5. Limitation of Liability
          </Typography>
          <Typography variant="body1" paragraph>
            In no event shall ExpenseApp be liable for any indirect, incidental, special,
            consequential, or punitive damages arising out of or relating to your use of the service.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            6. Contact Information
          </Typography>
          <Typography variant="body1" paragraph>
            For any questions about these Terms of Service, please contact us at:
            support@expenseapp.com
          </Typography>
        </Box>
      </Container>
    </>
  );
};

export default TermsOfService; 