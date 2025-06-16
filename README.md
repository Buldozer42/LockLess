# LockLess 🐉
![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white) 
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Javascript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=whitee)
![MonngoDB](https://img.shields.io/badge/-MongoDB-13aa52?style=for-the-badge&logo=mongodb&logoColor=white)

Bienvenue dans **LockLess** !

Ce projet a été réalisé dans le cadre d'une formation en Mastère Ingénierie du Web à l'[ESGI](https://www.esgi.fr/).

# Table des matières 
- [LockLess 🐉](#lockless-)
- [Table des matières](#table-des-matières)
- [Installation 🚀](#installation-)
- [Configuration ⚙️](#configuration-️)
- [Lancement de l'application 🏁](#lancement-de-lapplication-)
- [Routes API disponibles 🌐](#routes-api-disponibles-)
- [Dévelopeur 🧑‍💻](#dévelopeur-)

# Installation 🚀

Assurez-vous d'avoir [Node.js](https://nodejs.org/) (version 14.x ou supérieure) et [MongoDB](https://www.mongodb.com/try/download/community) installés sur votre machine.

1. Clonez ce dépôt :
   ```bash
   git clone https://github.com/Buldozer42/LockLess.git
   cd lockless
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

# Lancement de l'application 🏁

Pour démarrer le serveur en mode développement :

```bash
node app.js
```

L'application sera accessible à l'adresse [http://localhost:3000](http://localhost:3000).

# Routes API disponibles 🌐

| Méthode | Route | Description | Corps de la requête |
|---------|-------|-------------|---------------------|
| GET | `/` | Page d'accueil | - |
| POST | `/login` | Connexion utilisateur | `{ "email": "user@example.com", "password": "password" }` |
| POST | `/register` | Inscription utilisateur | `{ "firstName": "John", "lastName": "Doe", "email": "user@example.com", "password": "password" }` |
| GET | `/account` | Accéder à son compte (authentification requise) | - |
| GET | `/admin` | Accès administrateur (rôle admin requis) | - |

Pour les routes protégées, ajoutez le token JWT dans l'en-tête de la requête :
```
Authorization: Bearer votre_token_jwt
```

# Dévelopeur 🧑‍💻
- [Noé Garnier (Buldozer42)](https://www.github.com/Buldozer42)
- [Sandara Ly (Sly695)](https://github.com/Sly695)
- [Francis Bleau (Volbix)](https://github.com/Volbix)
