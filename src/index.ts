import express from 'express';
import httpStatus from 'http-status-codes';
import { Logger } from './util/logger';
import { errorHandler } from './middleware/errorHandler';
import { ExpressLogger } from './middleware/expressLogger';
import { Routes } from './routes';

const expressLogger = new ExpressLogger(Logger);

const app = express();
app.use(
  express.json({ limit: '500kb' }),
  expressLogger.onSuccess.bind(expressLogger),
  expressLogger.onError.bind(expressLogger),
);

const router = new Routes(app);
router.registerRoutes();

// 404 NotFound response
app.use('*', (req, res, next) => {
  return res
    .status(httpStatus.NOT_FOUND)
    .send({
      message: 'Page not found',
    });
});

app.use(errorHandler);

setImmediate(() => {
  const listenPort = 3000;
  app.listen(listenPort);
  Logger.info({ http_port: listenPort }, 'http server is listening');
});
