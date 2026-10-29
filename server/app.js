import { createApp } from './src/app.js';
import { loadConfig } from './src/config.js';
import { connectDatabase } from './src/db.js';

const config = loadConfig();
await connectDatabase(config);

export default createApp(config);
