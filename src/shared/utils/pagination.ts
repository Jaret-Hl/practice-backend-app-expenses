/**
 * Pagination utility
 * Handles pagination parameters and calculations
 */

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;
const DEFAULT_PAGE = 1;

/**
 * Parse and validate pagination parameters from query
 */
export const parsePagination = (page?: string | number, limit?: string | number): PaginationParams => {
  // Parse page
  let parsedPage = DEFAULT_PAGE;
  if (page) {
    const pageNum = parseInt(String(page), 10);
    parsedPage = pageNum > 0 ? pageNum : DEFAULT_PAGE;
  }

  // Parse limit
  let parsedLimit = DEFAULT_LIMIT;
  if (limit) {
    const limitNum = parseInt(String(limit), 10);
    // Enforce maximum limit to prevent abuse
    if (limitNum > 0 && limitNum <= MAX_LIMIT) {
      parsedLimit = limitNum;
    } else if (limitNum > MAX_LIMIT) {
      parsedLimit = MAX_LIMIT;
    }
  }

  // Calculate offset
  const offset = (parsedPage - 1) * parsedLimit;

  return {
    page: parsedPage,
    limit: parsedLimit,
    offset,
  };
};

/**
 * Calculate pagination metadata
 */
export const calculatePaginationMeta = (
  page: number,
  limit: number,
  total: number,
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
  };
};

/**
 * Format paginated response
 */
export const formatPaginatedResponse = (
  data: any[],
  page: number,
  limit: number,
  total: number,
) => {
  const meta = calculatePaginationMeta(page, limit, total);
  return {
    data,
    pagination: meta,
  };
};
