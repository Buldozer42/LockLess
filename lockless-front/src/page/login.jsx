import { useState } from "react";
import {
  Typography,
  TextField,
  Button,
  Link,
  Box,
  Grid,
  Alert,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import logo from "../assets/LockLess__1_-removebg-preview.png";

function Login() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const toggleScreen = () => {
    setIsSignIn(!isSignIn);
    setError("");
    setSuccess("");
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (isSignIn) {
      if (!formData.email || !formData.password) {
        setError("Email et mot de passe sont obligatoires");
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const text = await response.text();
        const data = text ? JSON.parse(text) : null;

        if (response.ok) {
          setSuccess("Connexion réussie !");
          localStorage.setItem("token", data?.token);
          localStorage.setItem("user", JSON.stringify(data?.user));
          navigate("/home");
        } else {
          setError(data?.error || "Erreur lors de la connexion");
        }
      } catch (err) {
        setError("Erreur réseau : " + err.message);
      }
    } else {
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.email ||
        !formData.password
      ) {
        setError("Tous les champs sont obligatoires");
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const text = await response.text();
        const data = text ? JSON.parse(text) : null;

        if (response.ok) {
          setSuccess("Inscription réussie !");
          console.log("User:", data?.user);
        } else {
          setError(data?.error || "Erreur lors de l'inscription");
        }
      } catch (err) {
        setError("Erreur réseau : " + err.message);
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#FDFFEF",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          maxWidth: 420,
          width: "100%",
          p: 4,
          borderRadius: 3,
          bgcolor: "white",
        }}
      >
        <Box></Box>
        <Box
          component="img"
          src={logo}
          alt="Logo"
          sx={{
            width: 120,
            height: "auto",
            mb: 2,
            display: "block",
            mx: "auto",
          }}
        />
        <Typography variant="h4" fontWeight="bold" align="center" gutterBottom>
          Lockless
        </Typography>
        <Typography variant="h6" fontWeight="bold" align="center" gutterBottom>
          {isSignIn ? "Connexion" : "Inscription"}
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
          <Grid container spacing={2}>
            {!isSignIn && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Prénom"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
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
                fullWidth
                label="Mot de passe"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
              />
            </Grid>
            {isSignIn && (
              <Grid item xs={12} textAlign="right">
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate("/reset-password")}
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
            size="large"
            sx={{
              mt: 3,
              background: "#7ED956",
              color: "white",
            }}
          >
            {isSignIn ? "Se connecter" : "S'inscrire"}
          </Button>
          <Grid container justifyContent="center" sx={{ mt: 2 }}>
            <Typography variant="body2">
              {isSignIn ? "Pas de compte ?" : "Déjà un compte ?"}{" "}
              <Link component="button" variant="body2" onClick={toggleScreen}>
                {isSignIn ? "S'inscrire" : "Se connecter"}
              </Link>
            </Typography>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}

export default Login;
