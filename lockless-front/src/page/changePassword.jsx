import { useState, useEffect } from 'react';
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
import { useParams, useNavigate } from 'react-router-dom';
import logo from '../assets/LockLess__1_-removebg-preview.png';

function ChangePassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [tokenValid, setTokenValid] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const checkToken = async () => {
      try {
        const response = await fetch(`http://localhost:3000/reset-password/${token}`);
        const text = await response.text();
        const data = text ? JSON.parse(text) : null;

        if (response.ok && data?.valid) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          setError(data?.error || 'Token invalide ou expiré');
        }
      } catch (err) {
        setTokenValid(false);
        setError(err, 'Erreur réseau lors de la vérification du token');
      }
    };

    checkToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!password) {
      setError('Veuillez saisir un nouveau mot de passe');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (response.ok) {
        setSuccess(data?.message || 'Mot de passe réinitialisé avec succès');
        setTimeout(() => navigate('/'), 3000);
      } else {
        setError(data?.error || 'Erreur lors de la réinitialisation du mot de passe');
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

        {tokenValid === null && (
          <Typography variant="body2" sx={{ mt: 2 }}>
            Vérification du lien en cours...
          </Typography>
        )}

        {tokenValid === false && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {tokenValid && (
          <>
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

            <Box component="form" sx={{ mt: 3 }} onSubmit={handleSubmit}>
              <TextField
                required
                fullWidth
                label="Nouveau mot de passe"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                Réinitialiser le mot de passe
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
          </>
        )}
      </Paper>
    </Box>
  );
}

export default ChangePassword;
