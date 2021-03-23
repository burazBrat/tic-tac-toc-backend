import express from 'express';
import bodyParser from 'body-parser';
import { ApolloServer, ApolloServerExpressConfig } from 'apollo-server-express';
import { createServer } from 'http';
import { execute, subscribe } from 'graphql';
import { PubSub } from 'graphql-subscriptions';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import errorhandler from 'errorhandler';
import { MongooseDataloaderFactory } from 'graphql-dataloader-mongoose';
import { allSchema } from '../graphql/schema';
import { logger } from './logger';

const pubsub = new PubSub();

function runServer() {
  const PORT = 3000;
  const app = express();

  app.use(errorhandler());
  app.use('/graphql', bodyParser.json());

  const apolloConfig: ApolloServerExpressConfig = {
    schema: allSchema,
    context: async ctx => {
      const dataloaderFactory = new MongooseDataloaderFactory();
      return { ...ctx, dataloaderFactory };
    },
    formatError: error => {
      logger.error(`${error.message}`);
      if (error && error.extensions && error.extensions.code && 'INTERNAL_SERVER_ERROR' === error.extensions.code && error.originalError) {
        logger.error(`${error.originalError.stack}`);
      }
      return error;
    },
  };

  const apolloServer = new ApolloServer(apolloConfig);
  apolloServer.applyMiddleware({ app });

  const server = createServer(app);

  server.listen(PORT, () => {
    new SubscriptionServer({
      execute,
      subscribe,
      schema: allSchema,
    }, {
      server,
      path: '/subscriptions',
    });
  });
}

export { runServer, pubsub };
