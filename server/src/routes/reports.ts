import { Router } from "express";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { getTaxReport } from "../services/taxReportService.js";
import { taxExportFilename, taxReportToCsv } from "../utils/taxReport.js";
import { resolveTaxRange, type TaxDateRange, type TaxPreset } from "../utils/taxRange.js";
import { taxReportQuerySchema } from "../utils/validation.js";

const router = Router();
router.use(requireAuth);

type TaxQuery = {
  preset: TaxPreset;
  today: string;
  from?: string;
  to?: string;
  event_id?: string;
};

function rangeFromQuery(query: TaxQuery): TaxDateRange {
  switch (query.preset) {
    case "custom":
      return { from: query.from ?? "", to: query.to ?? "" };
    case "last_year":
    case "this_year":
    case "last_quarter":
    case "this_quarter":
      return resolveTaxRange(query.preset, query.today);
    default: {
      const neverPreset: never = query.preset;
      return neverPreset;
    }
  }
}

async function loadReport(req: AuthRequest) {
  const query = taxReportQuerySchema.parse(req.query);
  const range = rangeFromQuery(query);
  return getTaxReport(req.user!.userId, range, query.event_id);
}

router.get("/", async (req: AuthRequest, res, next) => {
  try {
    const report = await loadReport(req);
    res.json(report);
  } catch (err) {
    next(err);
  }
});

router.get("/export", async (req: AuthRequest, res, next) => {
  try {
    const report = await loadReport(req);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${taxExportFilename(report)}"`);
    res.send(taxReportToCsv(report.rows));
  } catch (err) {
    next(err);
  }
});

export default router;
