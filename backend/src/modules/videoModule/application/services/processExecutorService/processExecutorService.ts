export interface ProcessExecutorService {
  execute(command: string, args: string[]): Promise<string>;
}
