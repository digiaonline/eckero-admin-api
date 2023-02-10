/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  Scope,
  LoggerService as LoggerServiceInterface,
} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {ClsService} from 'nestjs-cls';
import * as clc from 'cli-color';
import traverse = require('traverse');

enum LogFormat {
  TEXT = 'text',
  JSON = 'json',
}

enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  NOTICE = 'notice',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
  ALERT = 'alert',
  EMERGENCY = 'emergency',
}

type HttpRequestResponseMessage = {
  message: string;
  // @see https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#httprequest
  httpRequest?: {
    requestMethod?: string;
    requestUrl?: string;
    requestSize?: string;
    status?: number;
    responseSize?: string;
    userAgent?: string;
    remoteIp?: string;
    serverIp?: string;
    referer?: string;
    latency?: string;
    cacheLookup?: boolean;
    cacheHit?: boolean;
    cacheValidatedWithOriginServer?: boolean;
    cacheFillBytes?: string;
    protocol?: string;
  };
  httpRequestInfo?: {
    headers?: Record<string, string>;
    data?: any;
  };
  httpResponse?: {
    headers?: Record<string, string>;
    data?: any;
  };
};

@Injectable({scope: Scope.TRANSIENT})
export class LoggerService implements LoggerServiceInterface {
  protected projectId?: string;
  protected context?: string;
  protected logLevels = [
    LogLevel.DEBUG,
    LogLevel.INFO,
    LogLevel.NOTICE,
    LogLevel.WARNING,
    LogLevel.ERROR,
    LogLevel.CRITICAL,
    LogLevel.ALERT,
    LogLevel.EMERGENCY,
  ];
  protected useColors = true;
  protected format = LogFormat.TEXT;
  protected colors = {
    debug: clc.magenta,
    info: clc.cyan,
    notice: clc.green,
    warning: clc.yellow,
    error: clc.red,
    critical: clc.red,
    alert: clc.red,
    emergency: clc.red,
  };

  constructor(
    private configService: ConfigService,
    private clsService: ClsService,
  ) {
    const logLevels = this.configService.get<string>('LOGGER_LOG_LEVELS');
    const useColors = this.configService.get<string>('LOGGER_USE_COLORS');
    const format = this.configService.get<LogFormat>('LOGGER_FORMAT');
    const projectId = this.configService.get<string>('GCLOUD_PROJECT_ID');
    if (logLevels && logLevels.length) {
      this.setLogLevels(logLevels.split(','));
    }
    if (useColors === 'false') {
      this.setUseColors(false);
    }
    this.setFormat(format);
    this.setProjectId(projectId);
  }

  setProjectId(projectId: string): void {
    this.projectId = projectId;
  }

  setContext(context: string): void {
    this.context = context;
  }

  setLogLevels(logLevels: Array<string>): void {
    this.logLevels = logLevels as LogLevel[];
  }

  setUseColors(useColors: boolean): void {
    this.useColors = useColors;
  }

  setFormat(format: LogFormat): void {
    this.format = format;
  }

  isLogLevelEnabled(logLevel: LogLevel): boolean {
    return this.logLevels.includes(logLevel);
  }

  colorize(value: string, color: clc.Format): string {
    return this.useColors ? color(value) : value;
  }

  printMessage(
    level: LogLevel,
    message: string | HttpRequestResponseMessage,
    context: string,
  ): void {
    if (this.isLogLevelEnabled(level)) {
      if (this.format == LogFormat.JSON) {
        this.printMessageJson(level, message, context);
      } else {
        this.printMessageText(level, message, context);
      }
    }
  }

  printMessageText(
    level: string,
    message: string | HttpRequestResponseMessage,
    context: string,
  ): void {
    const lvl = this.colorize(`[${level.toUpperCase()}]`, clc.white);
    const ctx =
      context || this.context
        ? this.colorize(`[${context || this.context}]`, clc.yellow)
        : '';
    const msg = typeof message === 'object' ? JSON.stringify(message) : message;
    const output = this.colorize(msg, this.colors[String(level)]);
    process.stdout.write(`${lvl} ${ctx} ${output}\n`);
  }

  printMessageJson(
    level: string,
    message: string | HttpRequestResponseMessage,
    context: string,
  ): void {
    const ctx = context || this.context;
    const log = {
      severity: level.toUpperCase(),
      component: ctx,
      message: `[${ctx}] ${message}`,
      ...(typeof message === 'object' && {
        message: `[${ctx}] ${message.message}`,
        httpRequest: message.httpRequest,
        ...(message.httpRequestInfo && {
          httpRequestInfo: message.httpRequestInfo,
        }),
        ...(message.httpResponse && {
          httpResponse: message.httpResponse,
        }),
      }),
    };
    const traceContext = this.clsService.get<string>('GCLOUD_TRACE_CONTEXT');
    if (this.projectId && traceContext) {
      const [traceId] = traceContext.split('/');
      log[
        'logging.googleapis.com/trace'
      ] = `projects/${this.projectId}/traces/${traceId}`;
    }
    process.stdout.write(`${JSON.stringify(log)}\n`);
  }

  printStackTrace(stackTrace: string): void {
    if (stackTrace) {
      process.stdout.write(`${stackTrace}\n`);
    }
  }

  error(message: any, trace?: string, context?: string): any {
    this.printMessage(LogLevel.ERROR, message, context);
    this.printStackTrace(trace);
  }

  warn(message: any, context?: string): any {
    this.printMessage(LogLevel.WARNING, message, context);
  }

  log(message: any, context?: string): any {
    this.printMessage(LogLevel.NOTICE, message, context);
  }

  verbose(message: any, context?: string): any {
    this.printMessage(LogLevel.INFO, message, context);
  }

  debug(message: any, context?: string): any {
    this.printMessage(LogLevel.DEBUG, message, context);
  }

  redact(obj: Record<string, unknown>): Record<string, unknown> {
    const secrets = [
      'Authorization',
      'password',
      'loginToken',
      'customerKey',
      'bookingPassword',
    ];
    return traverse(obj).map(function (n) {
      for (
        let i = 0, key: string;
        (key = this.path[Number(i)]) !== undefined;
        i++
      ) {
        if (~secrets.indexOf(key)) {
          if (key === 'Authorization') {
            return n.replace(/^(Basic|Bearer)\s(.*)$/, '$1 ******');
          } else {
            return '******';
          }
        }
      }
    });
  }
}
