import { Schema, model } from 'mongoose';

export interface UrlRecordRawEntity {
  readonly createdAt: Date;
  readonly shortUrl: string;
  readonly longUrl: string;
}

const urlRecordRawEntitySchema = new Schema<UrlRecordRawEntity>({
  createdAt: {
    type: Date,
    required: true,
  },
  shortUrl: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  longUrl: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
});

export const urlRecordRawEntityModel = model<UrlRecordRawEntity>(
  'UrlRecordRawEntity',
  urlRecordRawEntitySchema,
  'urlRecords',
  { overwriteModels: true },
);
