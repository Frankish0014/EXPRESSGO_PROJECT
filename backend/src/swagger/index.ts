import { swaggerConfig } from './config';
import { authSchemas } from './schemas/authSchemas';
import { routeSchemas } from './schemas/routeSchemas';
import { scheduleSchemas } from './schemas/scheduleSchemas';
import { bookingSchemas } from './schemas/bookingSchemas';
import { authPaths } from './paths/authPaths';
import { routePaths } from './paths/routePaths';
import { schedulePaths } from './paths/schedulePaths';
import { bookingPaths } from './paths/bookingPaths';

export const swaggerDocument = {
  ...swaggerConfig,
  paths: {
    ...authPaths,
    ...routePaths,
    ...schedulePaths,
    ...bookingPaths,
  },
  components: {
    ...swaggerConfig.components,
    schemas: {
      ...authSchemas,
      ...routeSchemas,
      ...scheduleSchemas,
      ...bookingSchemas,
    },
  },
};