import { api } from "@/lib/api";

const overviewStats = async () => {
  const res = await api.get("/Dashboard/stats");

  return res.data;
};

const todayStats = async () => {
  const res = await api.get("/Dashboard/today-stats");

  return res.data;
};

const tapStats = async () => {
  const res = await api.get("/Dashboard/tap-stats");

  return res.data;
};

const todayTapStats = async () => {
  const res = await api.get("/Dashboard/today-tap-stats");

  return res.data;
};

const monthlyStats = async () => {
  const res = await api.get("/Dashboard/monthly-stats");

  return res.data;
};

const last30DayStats = async () => {
  const res = await api.get("/Dashboard/last-30-days-stats");

  return res.data;
};

export const dashboardService = {
  overviewStats,
  todayStats,
  tapStats,
  todayTapStats,
  monthlyStats,
  last30DayStats,
};
