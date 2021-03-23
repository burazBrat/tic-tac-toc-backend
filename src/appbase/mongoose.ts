import mongoose from 'mongoose';
import {MongoMemoryServer} from 'mongodb-memory-server';
import {logger} from './logger';

let mongoServer: MongoMemoryServer;

function connectMongoDB(): void {
    mongoServer = new MongoMemoryServer({instance: {port: 27017, dbName: 'user'}});

    mongoServer.getConnectionString().then(mongoUri => {
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        };

        mongoose.connect(mongoUri, options).then();

        mongoose.connection.on('error', e => {
            logger.error(e);
        });

        mongoose.connection.once('open', () => {
            logger.debug(`MongoDB successfully open ${mongoUri}`);
        });
    });
}

async function disconnectMongoDB() {
    await mongoose.disconnect();
    await mongoServer.stop();
}

export {connectMongoDB, disconnectMongoDB};
