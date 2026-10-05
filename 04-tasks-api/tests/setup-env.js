import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

if (!process.env.DB_NAME?.endsWith('_test')) {
    throw new Error(
        `Unsafe test database: DB_NAME must end with "_test", got "${process.env.DB_NAME}"`
    );
}