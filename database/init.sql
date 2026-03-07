-- Hisabi Local Database Setup Script
-- Run these commands as the 'postgres' superuser

-- 1. Create a dedicated user
CREATE USER hisabi_user WITH PASSWORD 'hisabi_pass_secure_123';

-- 2. Create the database
CREATE DATABASE hisabi OWNER hisabi_user;

-- 3. Grant privileges
GRANT ALL PRIVILEGES ON DATABASE hisabi TO hisabi_user;

-- Note: The application uses Sequelize and will automatically create/sync 
-- tables upon first start.
