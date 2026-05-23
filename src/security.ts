import { INestApplication } from '@nestjs/common';
import { json, urlencoded } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
// import * as requestIp from 'request-ip';
import { ENV } from './env';

const allowedOrigins = ENV.security.CORS_ALLOWED_ORIGINS;
export function setupSecurity(app: INestApplication): void {
  // const logger = new Logger('Security');
  const appHeader = app.getHttpAdapter().getInstance();

  // Trust proxy headers (for HTTPS + IPs)
  appHeader.set('trust proxy', 1);

  // Global security HTTP headers
  app.use(
    helmet({
      contentSecurityPolicy: ENV.isDevelopment ? false : {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", 'trusted-domain.com'],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
    }),
  );

  // Disable x-powered-by
  appHeader.disable('x-powered-by');

  // CORS Configuration
  // app.enableCors({
  //   origin: (origin, callback) => {
  //     if (!origin || allowedOrigins.some((o) => origin.startsWith(o))) {
  //       callback(null, true);
  //     } else {
  //       callback(new Error(`Request origin ${origin} not allowed by CORS`));
  //     }
  //   },
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  //   credentials: true,
  // });
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const isAllowed = allowedOrigins.some((o) => origin.startsWith(o));

      if (isAllowed) {
        return callback(null, true);
      }

      console.error("Blocked Origin:", origin);
      console.error("Allowed Origins:", allowedOrigins);

      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  });

  // Body parsing limits
  app.use(json({ limit: '1mb' }));
  app.use(urlencoded({ extended: true, limit: '1mb' }));

  // Rate Limiting (for unauthenticated requests, replace later with NestJS Throttler)
  app.use(
    rateLimit({
      windowMs: ENV.security.RATE_LIMIT_TTL, // e.g. 10 mins
      max: ENV.security.RATE_LIMIT_MAX, // e.g. 100 requests
      message: `Too many requests created from this IP, please try again after ${ENV.security.RATE_LIMIT_TTL / 1000
        } seconds`,
      standardHeaders: true, // Return rate limit headers
      legacyHeaders: false,
    }),
  );

  // Force HTTPS in production
  if (!ENV.isDevelopment) {
    app.use((req, res, next) => {
      if (!req.secure) {
        return res.redirect('https://' + req.headers.host + req.url);
      }
      next();
    });
  }

  // Global Request Logging Middleware
  // app.use((req, _res, next) => {
  //   const ip = requestIp.getClientIp(req);
  //   logger.warn(`\n[${req.method}] ${req.originalUrl} from ${ip}`);
  //   next();
  // });

  console.info('Security middlewares initialized 🚀');
}
