import { useState } from 'react';
import {
    Container,
    Typography,
    TextField,
    Button,
    Link,
    Box,
    Grid,
    Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom'; // ✅ importer useNavigate

function Login() {
    const [isSignIn, setIsSignIn] = useState(true);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const navigate = useNavigate(); // ✅ créer le hook navigate

    const toggleScreen = () => {
        setIsSignIn(!isSignIn);
        setError('');
        setSuccess('');
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (isSignIn) {
            // Connexion
            if (!formData.email || !formData.password) {
                setError('Email et mot de passe sont obligatoires');
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password,
                    }),
                });

                let data = null;
                const text = await response.text();
                if (text) {
                    data = JSON.parse(text);
                }

                if (response.ok) {
                    setSuccess('Connexion réussie !');
                    localStorage.setItem('token', data?.token);
                    localStorage.setItem('user', JSON.stringify(data?.user));
                    navigate('/home');
                } else {
                    setError(data?.error || 'Erreur lors de la connexion');
                }
            } catch (err) {
                setError('Erreur réseau : ' + err.message);
            }

        } else {
            // Inscription
            if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
                setError('Tous les champs sont obligatoires');
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                let data = null;
                const text = await response.text();
                if (text) {
                    data = JSON.parse(text);
                }

                if (response.ok) {
                    setSuccess('Inscription réussie !');
                    console.log('User:', data?.user);
                    console.log('Token:', data?.token);
                } else {
                    setError(data?.error || 'Erreur lors de l\'inscription');
                }
            } catch (err) {
                setError('Erreur réseau : ' + err.message);
            }
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
                <Typography variant="h5">
                    {isSignIn ? 'Connexion' : 'Inscription'}
                </Typography>

                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}

                <Box component="form" sx={{ mt: 3 }} onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        {!isSignIn && (
                            <>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Prénom"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Nom"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                    />
                                </Grid>
                            </>
                        )}
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                label="Mot de passe"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </Grid>
                        {isSignIn && (
                            <Grid item xs={12}>
                                <Link
                                    component="button"
                                    variant="body2"
                                    onClick={() => navigate('/reset-password')} // redirection ici
                                >
                                    Mot de passe oublié ?
                                </Link>
                            </Grid>
                        )}
                    </Grid>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3 }}
                    >
                        {isSignIn ? 'Se connecter' : "S'inscrire"}
                    </Button>
                    <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
                        <Grid item>
                            <Typography variant="body2">
                                {isSignIn ? "Pas de compte ?" : "Déjà un compte ?"}{' '}
                                <Link
                                    component="button"
                                    variant="body2"
                                    onClick={toggleScreen}
                                >
                                    {isSignIn ? "S'inscrire" : 'Se connecter'}
                                </Link>
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    );
}

export default Login;
