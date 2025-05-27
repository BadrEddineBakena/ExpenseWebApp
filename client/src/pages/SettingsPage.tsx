import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Collapse,
  Card,
  CardContent,
  Grid,
  Paper,
  LinearProgress,
  MenuItem,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Palette as PaletteIcon,
  Help as HelpIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Lock as LockIcon,
  Devices as DevicesIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useTheme } from '@/contexts/ThemeContext';
import TwoFactorService, { TwoFactorSetup } from '@/services/TwoFactorService';
import NotificationService from '@/services/NotificationService';
import { NotificationError } from '@/services/NotificationService';
import { TwoFactorError } from '@/services/TwoFactorService';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useLocation } from 'react-router-dom';

interface UserProfile {
  userID?: number;
  fullname: string;
  username: string;
  email: string;
  phoneNumber: string;
  age: string;
  currency: string;
  profileComplete: boolean;
  theme?: 'light' | 'dark';
  notifications: {
    email: boolean;
    budgetAlerts: boolean;
  };
  twoFactorEnabled?: boolean;
}

const SettingsPage = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<UserProfile>>({
    notifications: {
      email: false,
      budgetAlerts: false
    }
  });
  
  // Section states
  const [expandedSection, setExpandedSection] = useState<string | null>('account');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [open2FADialog, setOpen2FADialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [twoFactorSetup, setTwoFactorSetup] = useState<TwoFactorSetup | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<string|null>(null);
  const [forgotError, setForgotError] = useState<string|null>(null);
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullname: '',
    username: '',
    email: '',
    phoneNumber: '',
    age: '',
    currency: '',
  });

  const { mode, toggleTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const location = useLocation();
  const profileRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        const res = await axios.get('/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
        setForm(res.data);
        if (res.data.currency) {
          localStorage.setItem('currency', res.data.currency);
        }
        if (res.data) {
          setProfileForm({
            fullname: res.data.fullname || '',
            username: res.data.username || '',
            email: res.data.email || '',
            phoneNumber: res.data.phoneNumber || '',
            age: res.data.age ? String(res.data.age) : '',
            currency: res.data.currency || '',
          });
        }
        setLoading(false);
      } catch (err: unknown) {
        setError('Failed to load user profile');
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (location.hash === '#profile' && profileRef.current) {
      profileRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);

  const handleSectionToggle = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    toggleTheme();
    setForm({ ...form, theme: event.target.checked ? 'dark' : 'light' });
  };

  const handleNotificationChange = async (type: 'email' | 'budgetAlerts') => {
    try {
      const currentNotifications = {
        email: form.notifications?.email ?? false,
        budgetAlerts: form.notifications?.budgetAlerts ?? false
      };
      
      const newNotifications = {
        ...currentNotifications,
        [type]: !currentNotifications[type]
      };
      
      await NotificationService.updatePreferences(user?.userID?.toString() || '', newNotifications);
      setForm({
        ...form,
        notifications: newNotifications
      });
      setSuccess('Notification preferences updated successfully');
    } catch (err: unknown) {
      const error = err as Error;
      if (error instanceof NotificationError) {
        setError(error.message);
      } else {
        setError('Failed to update notification preferences');
      }
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/${user?.userID}/password`,
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSuccess('Password updated successfully');
      setOpenPasswordDialog(false);
    } catch (err: unknown) {
      setError('Failed to update password');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`/users/${user?.userID}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    } catch (err: unknown) {
      setError('Failed to delete account');
    }
  };

  const handle2FASetup = async () => {
    try {
      const setup = await TwoFactorService.setup2FA();
      setTwoFactorSetup(setup);
    } catch (err: unknown) {
      const error = err as Error;
      if (error instanceof TwoFactorError) {
        setError(error.message);
      } else {
        setError('Failed to setup 2FA');
      }
    }
  };

  const handle2FAVerification = async () => {
    try {
      const verified = await TwoFactorService.verify2FA(verificationCode);
      if (verified) {
        setSuccess('2FA enabled successfully');
        setOpen2FADialog(false);
        setUser({ ...user!, twoFactorEnabled: true });
      } else {
        setError('Invalid verification code');
      }
    } catch (err: unknown) {
      const error = err as Error;
      if (error instanceof TwoFactorError) {
        setError(error.message);
      } else {
        setError('Failed to verify 2FA code');
      }
    }
  };

  const handleForgotPassword = async () => {
    setForgotStatus(null);
    setForgotError(null);
    try {
      await axios.post('http://localhost:3001/users/forgot-password', { email: forgotEmail });
      setForgotStatus('If your email exists, you will receive a password reset link.');
    } catch (err) {
      setForgotError('Failed to send reset email.');
    }
  };

  const handleProfileFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleProfileFormSave = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(`/users/${user?.userID}`, {
        ...profileForm,
        age: profileForm.age ? parseInt(profileForm.age, 10) : null,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update currency in context if it changed
      if (profileForm.currency !== currency) {
        setCurrency(profileForm.currency);
      }
      
      setSuccess('Profile updated successfully');
      setOpenProfileDialog(false);
      
      // Refresh user info
      const res = await axios.get('/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      setForm(res.data);
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  // Helper to calculate profile completion percentage
  const getProfileCompletion = (user: UserProfile | null) => {
    if (!user) return 0;
    let completed = 0;
    const fields = [user.fullname, user.username, user.email, user.phoneNumber, user.age, user.currency];
    fields.forEach(f => { if (f !== undefined && f !== null && f !== '') completed++; });
    return Math.round((completed / fields.length) * 100);
  };

  if (loading) return <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><CircularProgress /></Box>;

  return (
    <Box
      sx={{
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        ml: { sm: '280px' }
      }}
    >
      <Typography variant="h4" sx={{ alignSelf: 'flex-start', mb: 4 }}>Settings</Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, width: '100%' }}>{success}</Alert>}

      {user && !user.profileComplete && (
        <Alert severity="warning" sx={{ mb: 2, width: '100%' }}
          action={<Button color="primary" variant="outlined" size="small" onClick={() => setOpenProfileDialog(true)}>Complete Profile</Button>}
        >
          Your profile is incomplete. Please fill in all required fields to unlock all features.
          <Box sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={getProfileCompletion(user)} sx={{ height: 10, borderRadius: 5 }} />
            <Typography variant="body2" sx={{ mt: 1 }}>{getProfileCompletion(user)}% complete</Typography>
          </Box>
        </Alert>
      )}

      <Grid container spacing={3} sx={{ width: '100%', maxWidth: 800 }}>
        {/* Account & Security Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SecurityIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Account & Security</Typography>
                <IconButton onClick={() => handleSectionToggle('account')}>
                  {expandedSection === 'account' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={expandedSection === 'account'}>
                <List>
                  <ListItem button onClick={() => setOpenPasswordDialog(true)}>
                    <ListItemIcon><LockIcon /></ListItemIcon>
                    <ListItemText primary="Change Password" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><SecurityIcon /></ListItemIcon>
                    <ListItemText primary="Two-Factor Authentication (2FA)" />
                    <Switch
                      checked={user?.twoFactorEnabled || false}
                      onChange={() => setOpen2FADialog(true)}
                    />
                  </ListItem>
                  <ListItem button>
                    <ListItemIcon><DevicesIcon /></ListItemIcon>
                    <ListItemText primary="Login Activity / Device Management" />
                  </ListItem>
                  <ListItem button onClick={() => setOpenDeleteDialog(true)}>
                    <ListItemIcon><DeleteIcon /></ListItemIcon>
                    <ListItemText primary="Delete Account" />
                  </ListItem>
                </List>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>

        {/* App Preferences Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PaletteIcon sx={{ mr: 1 }} />
                <Typography variant="h6">App Preferences</Typography>
                <IconButton onClick={() => handleSectionToggle('preferences')}>
                  {expandedSection === 'preferences' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={expandedSection === 'preferences'}>
                <List>
                  <ListItem>
                    <ListItemText primary="Dark Mode" />
                    <Switch
                      checked={mode === 'dark'}
                      onChange={handleThemeChange}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Email Notifications" />
                    <Switch
                      checked={user?.notifications?.email || false}
                      onChange={() => handleNotificationChange('email')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Budget Alerts" />
                    <Switch
                      checked={user?.notifications?.budgetAlerts || false}
                      onChange={() => handleNotificationChange('budgetAlerts')}
                    />
                  </ListItem>
                </List>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>

        {/* Legal & Support Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HelpIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Legal & Support</Typography>
                <IconButton onClick={() => handleSectionToggle('legal')}>
                  {expandedSection === 'legal' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={expandedSection === 'legal'}>
                <List>
                  <ListItem button>
                    <ListItemText primary="Privacy Policy" />
                  </ListItem>
                  <ListItem button>
                    <ListItemText primary="Terms of Service" />
                  </ListItem>
                  <ListItem button>
                    <ListItemText primary="Contact Support" />
                  </ListItem>
                  <ListItem button>
                    <ListItemText primary="FAQs" />
                  </ListItem>
                </List>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Change Password Dialog */}
      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Current Password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            />
            <a href="#" onClick={e => { e.preventDefault(); setForgotOpen(true); }} style={{ fontSize: '0.9rem' }}>Forgot Password?</a>
            <TextField
              label="New Password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            />
            <TextField
              label="Confirm New Password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>Cancel</Button>
          <Button onClick={handlePasswordChange} variant="contained">Change Password</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone. All your data will be permanently deleted.
          </Alert>
          <Typography>
            Are you sure you want to delete your account?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteAccount} color="error" variant="contained">
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>

      {/* 2FA Setup Dialog */}
      <Dialog open={open2FADialog} onClose={() => setOpen2FADialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Two-Factor Authentication</DialogTitle>
        <DialogContent>
          {!twoFactorSetup ? (
            <Box sx={{ mt: 2 }}>
              <Typography paragraph>
                Set up two-factor authentication to add an extra layer of security to your account.
                You'll need to use an authenticator app like Google Authenticator or Authy.
              </Typography>
              <Button variant="contained" onClick={handle2FASetup}>
                Begin Setup
              </Button>
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Typography paragraph>
                1. Scan this QR code with your authenticator app:
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <img src={twoFactorSetup.qrCode} alt="2FA QR Code" style={{ maxWidth: '200px' }} />
              </Box>
              <Typography paragraph>
                2. Enter the 6-digit code from your authenticator app:
              </Typography>
              <TextField
                fullWidth
                label="Verification Code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                sx={{ mb: 2 }}
              />
              {showBackupCodes ? (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Save these backup codes in a secure place. You can use them to access your account if you lose your authenticator device:
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                    {twoFactorSetup.backupCodes.map((code: string, index: number) => (
                      <Typography key={index} variant="body2" fontFamily="monospace">
                        {code}
                      </Typography>
                    ))}
                  </Paper>
                </Box>
              ) : (
                <Button onClick={() => setShowBackupCodes(true)}>
                  Show Backup Codes
                </Button>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen2FADialog(false)}>Cancel</Button>
          {twoFactorSetup && (
            <Button onClick={handle2FAVerification} variant="contained">
              Verify and Enable
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotOpen} onClose={() => setForgotOpen(false)}>
        <DialogTitle>Forgot Password</DialogTitle>
        <DialogContent>
          <TextField
            label="Email"
            type="email"
            value={forgotEmail}
            onChange={e => setForgotEmail(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
          />
          {forgotStatus && <Alert severity="success" sx={{ mt: 2 }}>{forgotStatus}</Alert>}
          {forgotError && <Alert severity="error" sx={{ mt: 2 }}>{forgotError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setForgotOpen(false)}>Cancel</Button>
          <Button onClick={handleForgotPassword} variant="contained">Send Reset Link</Button>
        </DialogActions>
      </Dialog>

      {/* Complete Profile Dialog */}
      <Dialog open={openProfileDialog} onClose={() => setOpenProfileDialog(false)}>
        <DialogTitle>Complete Your Profile</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField label="Full Name" name="fullname" value={profileForm.fullname} onChange={handleProfileFormChange} fullWidth required />
            <TextField label="Username" name="username" value={profileForm.username} onChange={handleProfileFormChange} fullWidth required />
            <TextField label="Email" name="email" value={profileForm.email} onChange={handleProfileFormChange} fullWidth required type="email" />
            <TextField label="Phone Number" name="phoneNumber" value={profileForm.phoneNumber} onChange={handleProfileFormChange} fullWidth required />
            <TextField label="Age" name="age" value={profileForm.age} onChange={handleProfileFormChange} fullWidth required type="number" />
            <TextField
              select
              label="Currency"
              name="currency"
              value={profileForm.currency}
              onChange={handleProfileFormChange}
              fullWidth
              required
            >
              <MenuItem value="MAD">MAD</MenuItem>
              <MenuItem value="USD">USD</MenuItem>
              <MenuItem value="EUR">EUR</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenProfileDialog(false)}>Cancel</Button>
          <Button onClick={handleProfileFormSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <div ref={profileRef} id="profile">
        {/* Profile section content here (existing code) */}
      </div>
    </Box>
  );
};

export default SettingsPage; 