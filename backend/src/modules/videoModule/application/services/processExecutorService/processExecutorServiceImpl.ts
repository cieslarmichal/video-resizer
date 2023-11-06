import { spawn } from 'child_process';

import { type ProcessExecutorService } from './processExecutorService.js';

export class ProcessExecutorServiceImpl implements ProcessExecutorService {
  public async execute(command: string, args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('executing', command, args.join(' '));

      const childProc = spawn(command, args);

      childProc.on('exit', (code, signal) => {
        console.log(`${command} completed with ${code}:${signal}`);

        if (code !== 0) {
          reject(`${command} failed with ${code || signal}`);
        } else {
          resolve();
        }
      });
    });
  }
}
