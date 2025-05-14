# Application CAMET

Bienvenue dans le projet Application CAMET. Ce dépôt contient le code source et la documentation de l'application CAMET.

## Description

L'Application CAMET est une solution de gestion logistique pour le suivi des produits et équipements, intégrant des fonctionnalités avancées de sécurité et de gestion des accès.

## Fonctionnalités de Sécurité

- Authentification sécurisée avec JWT
- Gestion des rôles (admin, manager, operateur, preparateur, consultant)
- Système de permissions granulaires
- Authentification multi-facteurs (MFA)
- Verrouillage de compte après tentatives échouées
- Journalisation des actions sensibles
- Validation des données entrantes
- Protection contre les attaques courantes (XSS, CSRF, etc.)

## Installation

1. Cloner le dépôt
2. Installer les dépendances : `npm install`
3. Configurer les variables d'environnement dans `.env`
4. Démarrer l'application : `npm start`

## Configuration

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
JWT_SECRET=votre_secret_jwt
DB_NAME=nom_base_de_donnees
DB_USER=utilisateur_db
DB_PASSWORD=mot_de_passe_db
DB_HOST=localhost
```

## Utilisation

### Authentification

```bash
# Connexion
POST /api/auth/login
Body: { "username": "user", "password": "password" }

# Inscription (admin uniquement)
POST /api/auth/register
Body: { "username": "newuser", "password": "password", "email": "user@example.com", "role": "operateur" }

# Mise à jour du profil
PUT /api/auth/profile
Header: Authorization: Bearer <token>
Body: { "email": "newemail@example.com" }
```

### Sécurité MFA

```bash
# Activation MFA
POST /api/auth/mfa/enable
Header: Authorization: Bearer <token>

# Validation code MFA
POST /api/auth/mfa/verify
Header: Authorization: Bearer <token>
Body: { "token": "123456" }
```

## Contribution

Les contributions sont les bienvenues ! Veuillez suivre ces étapes :

1. Forker le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence MIT.