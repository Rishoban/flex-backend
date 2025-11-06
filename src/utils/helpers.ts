import { ApiResponse, PaginationQuery } from '@/types';

export class ResponseUtils {
  static success<T>(
    message: string,
    data?: T,
    pagination?: ApiResponse['pagination']
  ): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
      pagination,
    };
  }

  static error(message: string, statusCode?: number, validationErrors?: any): ApiResponse {
    return {
      success: false,
      message,
      error: statusCode?.toString(),
      validationErrors,
    };
  }

  static paginate(
    page: number,
    limit: number,
    total: number
  ): ApiResponse['pagination'] {
    return {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };
  }
}

export class ValidationUtils {
  static isEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isStrongPassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  static sanitizeString(str: string): string {
    return str.trim().replace(/[<>]/g, '');
  }

  static validatePagination(query: PaginationQuery): {
    page: number;
    limit: number;
    sort?: string;
    order: 'asc' | 'desc';
  } {
    const page = Math.max(1, parseInt(String(query.page)) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(query.limit)) || 10));
    const order = query.order === 'desc' ? 'desc' : 'asc';
    
    return { page, limit, sort: query.sort, order };
  }

  // Express-validator middleware for pagination
  static validatePaginationMiddleware = [
    // These would be imported from express-validator in the route files where needed
  ];
}

export class DateUtils {
  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  static isExpired(date: Date): boolean {
    return new Date() > date;
  }

  static formatDate(date: Date): string {
    return date.toISOString().split('T')[0] || '';
  }
}