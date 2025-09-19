# Signature Électronique en Ligne

Une application web moderne et sécurisée pour la signature électronique de documents, construite avec Next.js, Prisma, et NextAuth.js.

## Fonctionnalités

- 🔐 Authentification sécurisée avec NextAuth.js (email/mot de passe et OAuth)
- 📝 Téléchargement et gestion de documents à signer
- ✍️ Signature électronique sécurisée
- 📧 Notifications par email pour les signatures en attente
- 📊 Tableau de bord de suivi des documents
- 🔄 Interface utilisateur moderne et réactive
- 📱 Design responsive pour tous les appareils
- 🔒 Stockage sécurisé des documents avec MinIO/S3

## Prérequis

- Node.js 18+
- PostgreSQL
- MinIO (ou compatible S3)
- Compte SMTP pour les emails

## Installation

1. **Cloner le dépôt**
   ```bash
   git clone [URL_DU_REPO]
   cd signature-numerique-online
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   # ou
   yarn
   # ou
   pnpm install
   ```

3. **Configurer les variables d'environnement**
   Créez un fichier `.env` à la racine du projet avec les variables suivantes :
   ```env
   # Application
   NODE_ENV=development
   APP_URL=http://localhost:3000
   
   # Base de données
   DATABASE_URL="postgresql://user:password@localhost:5432/signature_db?schema=public"
   
   # Authentification
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   
   # Stockage (MinIO/S3)
   S3_ENDPOINT=localhost
   S3_PORT=9000
   S3_USE_SSL=false
   S3_ACCESS_KEY=minioadmin
   S3_SECRET_KEY=minioadmin
   S3_BUCKET=signatures
   S3_REGION=us-east-1
   
   # Email
   EMAIL_SERVER=smtp://username:password@smtp.example.com:587
   EMAIL_FROM=noreply@example.com
   
   # JWT
   JWT_SECRET=your_jwt_secret
   ```

4. **Configurer la base de données**
   ```bash
   npx prisma migrate dev --name init
   # ou
   yarn prisma migrate dev --name init
   ```

5. **Démarrer l'application**
   ```bash
   npm run dev
   # ou
   yarn dev
   # ou
   pnpm dev
   ```

6. **Accéder à l'application**
   Ouvrez votre navigateur et accédez à [http://localhost:3000](http://localhost:3000)

## Déploiement

### Vercel (recommandé)

1. Créez un nouveau projet sur Vercel
2. Configurez les variables d'environnement dans les paramètres du projet
3. Connectez votre dépôt GitHub/GitLab/Bitbucket
4. Déclenchez un nouveau déploiement

### Docker (pour le développement local)

```bash
# Construire les images
# Démarrer les conteneurs
docker-compose up -d

# Arrêter les conteneurs
docker-compose down
```

## Structure du projet

```
signature-numerique-online/
├── app/                    # Pages et routes de l'application
├── components/             # Composants React
├── contexts/               # Contextes React
├── emails/                 # Modèles d'emails
├── hooks/                  # Hooks personnalisés
├── lib/                    # Utilitaires et configurations
├── prisma/                 # Schéma et migrations Prisma
├── public/                 # Fichiers statiques
├── styles/                 # Fichiers de style globaux
└── types/                  # Définitions de types TypeScript
```

## Technologies utilisées

- **Framework** : Next.js 14
- **Base de données** : PostgreSQL avec Prisma ORM
- **Authentification** : NextAuth.js
- **Stockage** : MinIO/S3
- **UI** : Radix UI, Tailwind CSS
- **Validation** : Zod
- **Formulaires** : React Hook Form
- **Gestion d'état** : React Context
- **Emails** : React Email
- **Tests** : Jest, React Testing Library

## Variables d'environnement

| Variable | Description | Requis | Valeur par défaut |
|----------|-------------|--------|------------------|
| `NODE_ENV` | Environnement d'exécution | Non | `development` |
| `APP_URL` | URL de l'application | Oui | `http://localhost:3000` |
| `DATABASE_URL` | URL de connexion à la base de données PostgreSQL | Oui | - |
| `NEXTAUTH_SECRET` | Clé secrète pour NextAuth | Oui | - |
| `NEXTAUTH_URL` | URL de base pour NextAuth | Non | `APP_URL` |
| `S3_ENDPOINT` | Point de terminaison MinIO/S3 | Oui | - |
| `S3_PORT` | Port du service MinIO/S3 | Non | `9000` |
| `S3_USE_SSL` | Utiliser SSL pour MinIO/S3 | Non | `false` |
| `S3_ACCESS_KEY` | Clé d'accès MinIO/S3 | Oui | - |
| `S3_SECRET_KEY` | Clé secrète MinIO/S3 | Oui | - |
| `S3_BUCKET` | Nom du bucket MinIO/S3 | Non | `signatures` |
| `S3_REGION` | Région MinIO/S3 | Non | `us-east-1` |
| `EMAIL_SERVER` | URL du serveur SMTP | Oui | - |
| `EMAIL_FROM` | Adresse email d'expédition | Non | `noreply@example.com` |
| `JWT_SECRET` | Clé secrète pour les JWT | Oui | - |

## Commandes utiles

- `npm run dev` - Démarrer le serveur de développement
- `npm run build` - Construire l'application pour la production
- `npm start` - Démarrer le serveur de production
- `npm run lint` - Vérifier le code avec ESLint
- `npx prisma migrate dev` - Créer et appliquer une nouvelle migration
- `npx prisma studio` - Ouvrir l'interface d'administration de la base de données

## Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Auteurs

- [Votre nom] - [Votre email]

## Remerciements

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [NextAuth.js](https://next-auth.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)

---

<div align="center">
  Fait avec ❤️ et Next.js
</div>
