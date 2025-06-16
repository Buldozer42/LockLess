const express = require('express');
const app = express();
const { connectDB } = require('./service/db');
const LoginService = require('./service/loginService');
const MailService = require('./service/mailService');

// Middleware for parsing JSON and URL-encoded data
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

connectDB().then(async () => {});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Exemple of authenticate route
app.get('/account', (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  try {
    const userId = LoginService.tokenVerify(token);
    res.send('Authenticated user ID: ' + userId);
  } catch (error) {
    res.status(500).json({ error: 'Error getting account : ' + error.message });
  }
});

// Exemple of authenticate route with roles restriction
app.get('/admin', async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  try {
    const userId = LoginService.tokenRoleVerify(token, 'admin');
    res.send('Authenticated admin user ID: ' + userId);
  } catch (error) {
    res.status(500).json({ error: 'Error getting admin account : ' + error.message });
  }
});

// Post route for login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (! email || ! password){
    res.status(500).json({ error: 'All field are required : email, password'});
  } else {
    try {
      const {token, user} = await LoginService.login(
        res,
        email,
        password
      );
      res.status(201).json({ token, user });
    } catch (error) {
      res.status(500).json({ error: 'Error login : ' + error.message });
    }
  }

});

// Post route for register
app.post('/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (! firstName || ! lastName || ! email || ! password) {
    res.status(500).json({ error: 'All field are required : firstName, lastName, email, password' });
  } else {
    try {
      const {token, user} = await LoginService.register(
        res,
        firstName,
        lastName,
        email,
        password
      );
      res.status(201).json({ token, user });
    } catch (error) {
      res.status(500).json({ error: 'Error creating user : ' + error.message });
    }
  }

});

// Launch the server
app.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});