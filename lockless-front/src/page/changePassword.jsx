import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Grid,
  Link,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';

function ChangePassword() {
  const { token } = useParams(); // récupérer le token de l'URL
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [tokenValid, setTokenValid] = useState(null); // null = en attente, true/false après vérif
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Vérifier le token dès que le composant est monté
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
        setError('Erreur réseau lors de la vérification du token');
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
        // Rediriger vers la page de connexion après quelques secondes
        setTimeout(() => navigate('/'), 3000);
      } else {
        setError(data?.error || 'Erreur lors de la réinitialisation du mot de passe');
      }
    } catch (err) {
      setError('Erreur réseau : ' + err.message);
    }
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant="h5" gutterBottom>
          Réinitialiser le mot de passe
        </Typography>

        {tokenValid === null && (
          <Typography variant="body2" sx={{ mt: 2 }}>
            Vérification du lien en cours...
          </Typography>
        )}

        {tokenValid === false && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {error}
          </Alert>
        )}

        {tokenValid && (
          <>
            {error && (
              <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
                {success}
              </Alert>
            )}

            <Box component="form" sx={{ mt: 3, width: '100%' }} onSubmit={handleSubmit}>
              <TextField
                required
                fullWidth
                label="Nouveau mot de passe"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }}>
                Réinitialiser le mot de passe
              </Button>

              <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
                <Grid item>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => navigate('/')}
                  >
                    Retour à la connexion
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
}

export default ChangePassword;
