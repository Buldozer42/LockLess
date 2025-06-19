import { useState } from 'react';
import {
    Container,
    Typography,
    TextField,
    Button,
    Link,
    Box,
    Grid,
} from '@mui/material';

function Login() {
    const [isSignIn, setIsSignIn] = useState(true);

    const toggleScreen = () => setIsSignIn(!isSignIn);

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
                <Box component="form" sx={{ mt: 3 }}>
                    <Grid container spacing={2}>
                        {!isSignIn && (
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Prénom"
                                    name="firstName"
                                />
                            </Grid>
                        )}
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                label="Mot de passe"
                                name="password"
                                type="password"
                            />
                        </Grid>
                        {isSignIn && (
                            <Grid item xs={12}>
                                <Link href="#" variant="body2">
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
