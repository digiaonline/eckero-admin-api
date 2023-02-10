import {Injectable} from '@nestjs/common';

export enum Duration {
  MILLISECONDS = 'ms',
  SECONDS = 's',
}

export type Timer = {
  start: number;
  end: number;
}

@Injectable()
export class TimerService {
  now(): number {
    return new Date().getTime();
  }

  start(): number {
    return this.now();
  }

  end(start?: number): number {
    const end = this.now();
    return start ? this.duration({start, end}) : end;
  }

  duration(timer: Timer, format: Duration = Duration.MILLISECONDS): number {
    const diff = timer.end - timer.start;
    switch (format) {
      case Duration.SECONDS:
        return diff / 1000;

      case Duration.MILLISECONDS:
      default:
        return diff;
    }
  }
}
