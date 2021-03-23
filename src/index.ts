import { connectMongoDB } from './appbase/mongoose';
import { runServer } from './appbase/apolloExpress';

connectMongoDB();
runServer();
