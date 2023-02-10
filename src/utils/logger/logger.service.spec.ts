/* eslint-disable @typescript-eslint/no-var-requires */
import {Test} from '@nestjs/testing';
import {ClsModule} from 'nestjs-cls';
import {ConfigModule} from '@nestjs/config';
import {LoggerService} from '@utils/logger/logger.service';

describe('LoggerService', () => {
  let loggerService: LoggerService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ClsModule.forRoot({
          global: true,
          middleware: {
            mount: true,
          },
        }),
        ConfigModule.forRoot({
          envFilePath: '.env.test'
        }),
      ],
      controllers: [],
      providers: [LoggerService],
    }).compile();

    loggerService = await moduleRef.resolve<LoggerService>(LoggerService);
  });

  describe('redact', () => {
    it('should redact all defined secrets in the output', () => {
      const input = {
        request: {
          headers: {
            'Content-Type': 'application/json',
            'Accept-Language': 'fi-FI',
            'Authorization': 'Bearer 72b11638-4a02-47c9-adc4-eae5721272a7',
          },
          data: {
            email: 'test.user@example.com',
            password: '1234',
            loginToken: 'b01992d5-2378-4706-bbde-36e7e5d507e1',
            sessionId: 'a78b4173-0d0a-473c-97d4-043b866b9c9e',
            customerKey: '57e8db00-e778-4421-8890-6ea9ad682ab2',
            bookingPassword: '86b0b3ab-ca89-40b7-b393-a5cc901b6fa2',
          }
        }
      };
      const expected = {
        request: {
          headers: {
            'Content-Type': 'application/json',
            'Accept-Language': 'fi-FI',
            'Authorization': 'Bearer ******',
          },
          data: {
            email: 'test.user@example.com',
            password: '******',
            loginToken: '******',
            sessionId: 'a78b4173-0d0a-473c-97d4-043b866b9c9e',
            customerKey: '******',
            bookingPassword: '******',
          }
        }
      };
      expect(loggerService.redact(input)).toStrictEqual(expected);
    });
  });

});
