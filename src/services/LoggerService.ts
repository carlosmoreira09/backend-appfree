/**
 * Simple logger service for AppFree
 */
export class LoggerService {
    private static instance: LoggerService;
    private logLevel: string;

    constructor() {
        this.logLevel = process.env.LOG_LEVEL || 'info';
    }

    /**
     * Get logger instance (singleton pattern)
     */
    public static getInstance(): LoggerService {
        if (!LoggerService.instance) {
            LoggerService.instance = new LoggerService();
        }
        return LoggerService.instance;
    }

    /**
     * Log an info message
     */
    public info(message: string, meta?: any): void {
        if (['debug', 'info', 'warn', 'error'].includes(this.logLevel)) {
            console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta ? meta : '');
        }
    }

    /**
     * Log a debug message
     */
    public debug(message: string, meta?: any): void {
        if (['debug'].includes(this.logLevel)) {
            console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, meta ? meta : '');
        }
    }

    /**
     * Log a warning message
     */
    public warn(message: string, meta?: any): void {
        if (['debug', 'info', 'warn', 'error'].includes(this.logLevel)) {
            console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta ? meta : '');
        }
    }

    /**
     * Log an error message
     */
    public error(message: string, error?: any): void {
        if (['debug', 'info', 'warn', 'error'].includes(this.logLevel)) {
            console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error ? error : '');
        }
    }
}
