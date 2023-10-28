export interface EncoderService {
  encodeBase62(decimalInput: bigint): string;
}
