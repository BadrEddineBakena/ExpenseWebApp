import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import axios from 'axios';
import { useCurrency } from '@/contexts/CurrencyContext';

interface UserProfile {
  userID?: number;
  fullname: string;
  username: string;
  email: string;
  phoneNumber: string;
  age: string;
  currency: string;
  profileComplete: boolean;
}

const ProfilePage = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullname: '',
    username: '',
    email: '',
    phoneNumber: '',
    age: '',
    currency: '',
  });
  const [success, setSuccess] = useState<string | null>(null);
  const { currency, setCurrency } = useCurrency();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        const res = await axios.get('/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
        setProfileForm({
          fullname: res.data.fullname || '',
          username: res.data.username || '',
          email: res.data.email || '',
          phoneNumber: res.data.phoneNumber || '',
          age: res.data.age ? String(res.data.age) : '',
          currency: res.data.currency || '',
        });
        setLoading(false);
      } catch (err) {
        setError('Failed to load profile');
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleEditOpen = () => setEditOpen(true);
  const handleEditClose = () => setEditOpen(false);

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
      if (profileForm.currency !== currency) {
        setCurrency(profileForm.currency);
      }
      setSuccess('Profile updated successfully');
      setEditOpen(false);
      // Refresh user info
      const res = await axios.get('/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  if (loading) return <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 4, maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>My Profile</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {user && (
        <Box>
          <Typography variant="h6">Full Name</Typography>
          <Typography sx={{ mb: 2 }}>{user.fullname}</Typography>
          <Typography variant="h6">Username</Typography>
          <Typography sx={{ mb: 2 }}>{user.username}</Typography>
          <Typography variant="h6">Email</Typography>
          <Typography sx={{ mb: 2 }}>{user.email}</Typography>
          <Typography variant="h6">Phone Number</Typography>
          <Typography sx={{ mb: 2 }}>{user.phoneNumber}</Typography>
          <Typography variant="h6">Age</Typography>
          <Typography sx={{ mb: 2 }}>{user.age}</Typography>
          <Typography variant="h6">Currency</Typography>
          <Typography sx={{ mb: 2 }}>{user.currency}</Typography>
          <Button variant="contained" onClick={handleEditOpen} sx={{ mt: 2 }}>Edit Profile</Button>
        </Box>
      )}
      <Dialog open={editOpen} onClose={handleEditClose}>
        <DialogTitle>Edit Profile</DialogTitle>
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
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleProfileFormSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePage; 