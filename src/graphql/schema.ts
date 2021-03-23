import { mergeSchemas, makeExecutableSchema } from 'graphql-tools';
import { typeDefs } from './type';
import { resolvers } from './resolver';

export const allSchema = mergeSchemas({
  schemas: [makeExecutableSchema({
    typeDefs,
    resolvers,
  })],
});
