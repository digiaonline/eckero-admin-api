import {Module} from '@nestjs/common';
import {TimerService} from '@utils/timer/timer.service';

@Module({
  imports: [],
  providers: [TimerService],
  exports: [TimerService],
})
export class TimerModule { }
