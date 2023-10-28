import mongoose from 'mongoose';

import { ConfigProvider } from '../../../../../core/configProvider.js';

export class MongoDbTestUtils {
  public async connect(): Promise<void> {
    const databaseUri = ConfigProvider.getMongoDatabaseUri();

    await mongoose.connect(databaseUri);
  }

  public async disconnect(): Promise<void> {
    await mongoose.disconnect();
  }
}
