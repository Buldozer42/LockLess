import { useState } from 'react';
import {
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Grid,
  Link,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/LockLess__1_-removebg-preview.png';

function ResetPassword() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Veuillez saisir votre email');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (response.ok) {
        setSuccess(data?.message || 'Email de réinitialisation envoyé ! Vérifiez votre boîte mail.');
      } else {
        setError(data?.error || 'Erreur lors de la demande de réinitialisation');
      }
    } catch (err) {
      setError('Erreur réseau : ' + err.message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#FDFFEF',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          maxWidth: 420,
          width: '100%',
          p: 4,
          borderRadius: 3,
          bgcolor: 'white',
        }}
      >
        <Box
          component="img"
          src={logo}
          alt="Logo"
          sx={{
            width: 120,
            height: 'auto',
            mb: 2,
            display: 'block',
            mx: 'auto',
          }}
        />
        <Typography variant="h4" fontWeight="bold" align="center" gutterBottom>
          Lockless
        </Typography>
        <Typography variant="h6" fontWeight="bold" align="center" gutterBottom>
          Réinitialiser le mot de passe
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            required
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{
              mt: 3,
              background: '#7ED956',
              color: 'white',
            }}
          >
            Envoyer le lien de réinitialisation
          </Button>

          <Grid container justifyContent="center" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate('/')}
              >
                Retour à la connexion
              </Link>
            </Typography>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}

export default ResetPassword;
