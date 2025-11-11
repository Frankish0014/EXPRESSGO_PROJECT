export const swaggerConfig = {
  openapi: '3.0.0',
  info: {
    title: 'ExpressGO–API',
    version: '1.0.0',
    contact: {
      name: 'API Support',
      email: 'support@busbooking.rw',
    },
    license: {
      name: 'ISC',
      url: 'https://opensource.org/licenses/ISC',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000/',
      description: 'Development server',
    },
    {
      url: 'https://api.busbooking.rw',
      description: 'Production server',
    },
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and profile management',
    },
    {
      name: 'Routes',
      description: 'Bus routes management',
    },
    {
      name: 'Schedules',
      description: 'Bus schedules and seat availability',
    },
    // {
    //   name: 'Bookings',
    //   description: 'Booking management and reservations',
    // },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token',
      },
    },
  },
};