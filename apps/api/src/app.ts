import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import router from './routes/index.js';
import { swaggerSpec } from './swagger.js';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(morgan('dev'));
  app.use(express.json({ limit: '10mb' }));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use('/api', router);
  return app;
}
