

import { createApp } from './app';
import { connectDB, disconnectDB } from './config/db';
import { env } from './config/env';

async function bootstrap(): Promise<void> {
  await connectDB();

  const app = createApp();
    app.listen(env.PORT, () => {
    console.log(`Task Manager API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });

    process.on('SIGINT', async () => {
        console.log('\n[SIGINT Received] Cleaning up resources...');

        await disconnectDB();
        console.log('Cleanup complete. Exiting.');
        process.exit(0); 
    });   
    process.on('SIGTERM', async () => {
        console.log('\n[SIGTERM Received] Cleaning up resources...');

        await disconnectDB();
        console.log('Cleanup complete. Exiting.');
        process.exit(0); 
    });

    process.on('unhandledRejection', (reason) => {
        console.error('Unhandled promise rejection:', reason);
    });
}

bootstrap().catch(async (error: unknown) => {
  console.error('Failed to start the server:', error);
  await disconnectDB();
  process.exit(1);
});
