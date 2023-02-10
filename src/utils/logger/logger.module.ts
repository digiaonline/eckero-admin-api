import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {LoggerService} from '@utils/logger/logger.service';

@Module({
  imports: [ConfigModule],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
