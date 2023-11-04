import { spawn } from 'child_process';

import { type ProcessExecutorService } from './processExecutorService.js';

export class ProcessExecutorServiceImpl implements ProcessExecutorService {
  public async execute(command: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      console.log('executing', command, args.join(' '));

      const childProc = spawn(command, args);

      const resultBuffers: string[] = [];

      childProc.stdout.on('data', (buffer) => {
        console.log(buffer.toString());

        resultBuffers.push(buffer);
      });

      childProc.stderr.on('data', (buffer) => console.error(buffer.toString()));

      childProc.on('exit', (code, signal) => {
        console.log(`${command} completed with ${code}:${signal}`);

        if (code !== 0) {
          reject(`${command} failed with ${code || signal}`);
        } else {
          resolve(resultBuffers.join('\n').trim());
        }
      });
    });
  }
}
