import { type Static, Type } from '@sinclair/typebox';

export const findLongUrlPathParametersSchema = Type.Object({
  shortUrlPathParam: Type.String(),
});

export type FindLongUrlPathParameters = Static<typeof findLongUrlPathParametersSchema>;

export const findLongUrlResponseMovedTemporarilyBodySchema = Type.Null();

export type FindLongUrlResponseMovedTemporarilyBody = Static<typeof findLongUrlResponseMovedTemporarilyBodySchema>;
