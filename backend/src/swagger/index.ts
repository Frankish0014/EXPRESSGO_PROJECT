import { swaggerConfig } from './config';
import { authSchemas } from './schemas/authSchemas';
import { routeSchemas } from './schemas/routeSchemas';
import { scheduleSchemas } from './schemas/scheduleSchemas';
import { authPaths } from './paths/authPaths';
import { routePaths } from './paths/routePaths';
import { schedulePaths } from './paths/schedulePaths';

export const swaggerDocument = {
  ...swaggerConfig,
  paths: {
    ...authPaths,
    ...routePaths,
    ...schedulePaths,
  },
  components: {
    ...swaggerConfig.components,
    schemas: {
      ...authSchemas,
      ...routeSchemas,
      ...scheduleSchemas,
    },
  },
};