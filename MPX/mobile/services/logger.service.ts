/**
 * Logger Service - Centralized logging for the app
 * Supports development and production modes
 */

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: any;
  stack?: string;
}

class LoggerService {
  private static instance: LoggerService;
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 1000;
  private isDevelopment = __DEV__;

  private constructor() {}

  static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private formatLog(entry: LogEntry): string {
    const { timestamp, level, module, message, data } = entry;
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    return `[${timestamp}] [${level}] [${module}] ${message}${dataStr}`;
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }
  }

  debug(module: string, message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: this.getTimestamp(),
      level: 'DEBUG',
      module,
      message,
      data,
    };
    this.addLog(entry);
    if (this.isDevelopment) {
      console.log(this.formatLog(entry));
    }
  }

  info(module: string, message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: this.getTimestamp(),
      level: 'INFO',
      module,
      message,
      data,
    };
    this.addLog(entry);
    if (this.isDevelopment) {
      console.log(this.formatLog(entry));
    }
  }

  warn(module: string, message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: this.getTimestamp(),
      level: 'WARN',
      module,
      message,
      data,
    };
    this.addLog(entry);
    console.warn(this.formatLog(entry));
  }

  error(module: string, message: string, error?: Error | any): void {
    const entry: LogEntry = {
      timestamp: this.getTimestamp(),
      level: 'ERROR',
      module,
      message,
      data: error?.message,
      stack: error?.stack,
    };
    this.addLog(entry);
    console.error(this.formatLog(entry));
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  getLogsByModule(module: string): LogEntry[] {
    return this.logs.filter((log) => log.module === module);
  }

  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter((log) => log.level === level);
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(): string {
    return this.logs.map((log) => this.formatLog(log)).join('\n');
  }
}

export const loggerService = LoggerService.getInstance();
