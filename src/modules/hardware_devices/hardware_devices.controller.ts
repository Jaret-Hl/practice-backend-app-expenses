import { Request, Response } from "express";
import { HardwareDeviceService } from "./hardware_devices.service.js";

import {
  parsePagination,
  formatPaginatedResponse,
} from "../../shared/utils/pagination.js";
import { supabase } from "../../core/db.js";

import { extractFilters } from "../../shared/filters/extract-filters.js";
import { HARDWARE_DEVICES_FILTERABLE_FIELDS } from "./hardware_devices.filters.js";

const FACET_ALLOWED_FIELDS = ["code_device"];

export const getHardwareDevices = async (req: Request, res: Response) => {
  const { search, page, limit } = req.query;
  const pagination = parsePagination(
    page as string | number,
    limit as string | number,
  );
  const filters = extractFilters(req.query, HARDWARE_DEVICES_FILTERABLE_FIELDS);

  const { data, error, count } = await HardwareDeviceService.getAll({
    search: search as string,
    filters,
    limit: pagination.limit,
    offset: pagination.offset,
  });

  if (error)
    return res.status(500).json({ error: "Error interno del servidor" });

  const totalCount = count || 0;
  const formattedResponse = formatPaginatedResponse(
    data || [],
    pagination.page,
    pagination.limit,
    totalCount,
  );
  res.json(formattedResponse);
};
