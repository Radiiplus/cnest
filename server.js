const Fastify = require('fastify');
const path = require('path');
const fs = require('fs').promises;
const winston = require('winston');
const fastifyCookie = require('@fastify/cookie');
const easyWaf = require('easy-waf').default;
const hpp = require('hpp');
const xssClean = require('xss-clean');
const DOMPurify = require('isomorphic-dompurify');
const compression = require('compression');
const helmet = require('@fastify/helmet');
const endpointModules = require('./module/endpoints');
const fastifyIO = require('fastify-socket.io');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console()
  ]
});

const fastify = Fastify({
  logger: false,
  ignoreTrailingSlash: false,
  caseSensitive: true,
  trustProxy: false
});

fastify.addHook('onRequest', async (req, reply) => {
  let body = '';
  if (req.body) {
    body = JSON.stringify(req.body);
  } else if (req.raw.body) {
    body = req.raw.body;
  }
  logger.info(`Incoming request: ${req.method} ${req.url}`);
  logger.info(`Request body/content: ${body}`);
});

fastify.addHook('onSend', async (req, reply, payload) => {
  logger.info(`Outgoing response: ${req.method} ${req.url} - ${reply.statusCode}`);
  logger.debug(`Payload: ${payload}`);
});

const wafMiddleware = easyWaf({
  allowedHTTPMethods: ['GET', 'POST'],
  queryUrlWhitelist: ['riffconnect.web.app'],
  modules: { directoryTraversal: { enabled: true, excludePaths: /^\/exclude$/i } },
  dryMode: true
});

const hppMiddleware = hpp();
const xssCleanMiddleware = xssClean();
const sanitize = (req) => { req.body = DOMPurify.sanitize(req.body); };

fastify.register(fastifyCookie, {
  secret: "6286801435307544179c492926938394", 
  hook: 'onRequest',
});

fastify.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://cdnjs.cloudflare.com",
        "https://cdn.socket.io"
      ],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https://fonts.googleapis.com", 
        "https://cdnjs.cloudflare.com", 
        "https://cdn.jsdelivr.net"
      ],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:"],
      connectSrc: [
        "'self'", 
        "ws://localhost:3000",  
        "wss://localhost:3000",
        "https://cdn.socket.io"
      ],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "data:"], 
      frameSrc: ["'none'"],
      workerSrc: ["'self'"]
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  xssFilter: true,
  hidePoweredBy: true,
  frameguard: {
    action: 'deny'
  },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  }
});

fastify.register((instance, opts, done) => {
  instance.addHook('onSend', (request, reply, payload, done) => {
    compression()(request.raw, reply.raw, () => done());
  });
  done();
});

fastify.addHook('onRequest', async (req, reply) => {
  await new Promise((resolve) => wafMiddleware(req.raw, reply.raw, resolve));
  hppMiddleware(req.raw, reply.raw, () => {});
  xssCleanMiddleware(req.raw, reply.raw, () => {});
  sanitize(req);

  let rawBody = '';
  req.raw.on('data', (chunk) => { rawBody += chunk; });
  req.raw.on('end', () => { 
    req.rawBody = rawBody;
    logger.info(`Full request body: ${rawBody}`);
  });

  if (!['GET', 'POST'].includes(req.method)) {
    return reply.code(405).send({ error: 'Method not allowed' });
  }
});

fastify.addHook('preSerialization', async (req, reply, payload) => {
  const isSuccess = reply.statusCode < 400;
  return typeof payload === 'object' ? { success: isSuccess, ...payload } : { success: isSuccess, data: payload };
});

fastify.register(fastifyIO);

fastify.register(async (instance) => {
  for (const moduleName of endpointModules) {
    const module = require(`./endpoint/${moduleName}`);
    await instance.register(module, { prefix: '/api' });
  }

  instance.all('/api/*', async (request, reply) => {
    reply.code(404).send({ success: false, error: 'API route not found' });
  });
});

fastify.register(require('@fastify/static'), { 
  root: path.join(__dirname, 'public'),
  prefix: '/',
});

fastify.setNotFoundHandler(async (request, reply) => {
  const isApiRequest = request.url.startsWith('/api/');
  
if (isApiRequest) {
    reply.code(404).send({ success: false, error: 'API route not found' });
} else {
    const html = await fs.readFile(path.join(__dirname, 'public', 'index.html'), 'utf8');
    reply.type('text/html').send(html);
}
});

fastify.ready(err => {
if (err) throw err;

fastify.io.on('connection', (socket) => {
logger.info('New client connected');

socket.on('disconnect', () => {
logger.info('Client disconnected');
});
});
});

(async () => {
try {
await fastify.listen({ port: 3000, host: '0.0.0.0' });
logger.info('Server listening at http://localhost:3000');
} catch (err) {
logger.error('Error starting server:', err);
process.exit(1);
}
})();