# Database Management

Hisabi uses **PostgreSQL** as its primary database.

## Local Configuration

The application is configured to connect to a local PostgreSQL instance.

- **Database Name:** `hisabi`
- **Username:** `hisabi_user`
- **Password:** `hisabi_pass_secure_123`
- **Host:** `localhost`
- **Port:** `5432`

## Manual Setup

If you need to recreate the database manually, you can use the `init.sql` file provided in this folder:

```bash
psql -U postgres -f database/init.sql
```

## Automatic Sync

The backend uses Sequelize ORM. When you run `npm start`, it will automatically:
1. Connect to the database.
2. Sync the models (create/update tables) using \`sequelize.sync({ alter: true })\`.
