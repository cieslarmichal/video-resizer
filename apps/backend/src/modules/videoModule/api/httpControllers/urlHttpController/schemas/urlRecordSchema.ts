import { Type } from '@sinclair/typebox';

export const urlRecordSchema = Type.Object({
  createdAt: Type.String(),
  shortUrl: Type.String(),
  longUrl: Type.String(),
});
