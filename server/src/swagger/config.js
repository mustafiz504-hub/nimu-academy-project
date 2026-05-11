const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

/**
 * Configure Swagger for the Express application
 * @param {import('express').Express} app
 * @param {number|string} port
 */
const setupSwagger = (app, port) => {
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Nimu Academy API',
        version: '1.0.0',
        description: 'Nimu Cooking Academy Backend APIs - documentation and testing portal.',
        contact: {
          name: 'Nimu Support',
          email: 'muskan@nimu.com',
        },
      },
      servers: [
        { 
          url: `http://localhost:${port}`,
          description: 'Development Server' 
        },
        {
          url: `http://192.168.1.140:${port}`,
          description: 'Local Network Server'
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    apis: ['./src/routes/*.js', './src/server.js'], // Adjusted for src/ structure
  };

  const swaggerDocs = swaggerJsdoc(/** @type {any} */ (swaggerOptions));
  
  // Custom UI options for a cleaner look
  const uiOptions = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "Nimu API Docs"
  };

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, uiOptions));

  // Root health check route moved from server.js
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Nimu Academy API is running.', 
      version: '1.0.0',
      swagger: `http://${req.get('host')}/api-docs`,
      endpoints: ['/api/auth', '/api/user', '/api/orders', '/api/enrollments', '/api/courses', '/api/products', '/api/admin', '/api/superadmin']
    });
  });
};

module.exports = setupSwagger;
