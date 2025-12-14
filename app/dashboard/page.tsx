/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState, useRef, ElementType } from "react";
import { useRouter } from "next/navigation";
import { createSignalRConnection } from "@/lib/signalr";
import { HubConnection, HubConnectionState } from "@microsoft/signalr";
import AccessChart from "@/components/shared/AccessChart";
import { dashboardService } from "@/services/dashboard.service";
import { toast } from "sonner";
import AuthGuard from "@/components/shared/AuthGuard";
import { Check, Clock, DoorOpen, FlaskConical, LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalRuangan: 0,
    aktifSekarang: 0,
    totalKelas: 0,
    totalAkses: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [chartMode, setChartMode] = useState("monthly");

  const isMounted = useRef(false);
  const connectionRef = useRef<HubConnection | null>(null);
  const router = useRouter();

  const getAuthToken = () => localStorage.getItem("authToken");

  const fetchStats = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await dashboardService.overviewStats();
      if (res.success && isMounted.current) setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchChartData = async (mode: string) => {
    try {
      const token = getAuthToken();

      let res;

      if (mode === "monthly") {
        res = await dashboardService.monthlyStats();
      } else {
        res = await dashboardService.last30DayStats();
      }

      if (res.success && isMounted.current) {
        const formattedData = res.data.map((item: any) => ({
          name: mode === "monthly" ? item.bulan : item.tanggal,
          value: item.total,
        }));
        setChartData(formattedData);
      }
    } catch (err) {
      toast.error("Terjadi kesalahan saat load chart!");
      console.error("Gagal load chart", err);
    }
  };

  useEffect(() => {
    const fetchChartDataEffect = async (mode: string) => {
      fetchChartData(mode);
    };

    fetchChartDataEffect(chartMode);
  }, [chartMode]);

  useEffect(() => {
    isMounted.current = true;
    const token = getAuthToken();
    if (!token) {
      router.push("/");
      return;
    }

    const fetchStatsEffect = async () => {
      await fetchStats();
    };

    const fetchChartDataEffect = async (mode: string) => {
      await fetchChartData(mode);
    };

    fetchStatsEffect();
    fetchChartDataEffect("monthly");

    const connection = createSignalRConnection(token);
    connectionRef.current = connection;

    const startSignalR = async () => {
      try {
        if (connection.state === HubConnectionState.Disconnected) {
          await connection.start();
          if (connection) {
            if (
              (connection.state as unknown as HubConnectionState) ===
              HubConnectionState.Connected
            ) {
              await connection.invoke("JoinDashboard");
            }
          }

          connection.on(
            "ReceiveDashboardStats",
            (data) => isMounted.current && setStats(data)
          );

          const refreshAll = () => {
            fetchStats();
            fetchChartData(chartMode);
          };

          connection.on("UpdateDashboard", refreshAll);
          connection.on("ReceiveCheckIn", refreshAll);
          connection.on("ReceiveCheckOut", refreshAll);

          connection.on("UserStatusChanged", () => {});
        }
      } catch (e) {
        /* ignore */
      }
    };

    setTimeout(startSignalR, 500);

    return () => {
      isMounted.current = false;
      if (connection) connection.stop().catch(() => {});
    };
  }, []);

  return (
    <AuthGuard>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-medium text-gray-700 bg-white px-5 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
            <LayoutDashboard className="mr-1" /> Dashboard
          </h1>
          <div className="text-xs font-mono text-green-600 bg-green-100 px-2 py-1 rounded border border-green-200 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live Connected
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            title="Total Lab"
            value={stats.totalRuangan || stats.totalRuangan}
            Icon={FlaskConical}
            color="bg-gradient-to-br from-[#9b9bf8] to-[#8a8af5]"
          />
          <StatCard
            title="Lab Aktif"
            value={stats.aktifSekarang || stats.aktifSekarang}
            Icon={DoorOpen}
            color="bg-gradient-to-br from-[#a3d9d3] to-[#8bcbc4]"
          />
          <StatCard
            title="Total Kelas"
            value={stats.totalKelas || stats.totalKelas}
            Icon={Clock}
            color="bg-gradient-to-br from-[#fcb6b1] to-[#fba19b]"
          />
          <StatCard
            title="Total Akses"
            value={stats.totalAkses || stats.totalAkses}
            Icon={Check}
            color="bg-gradient-to-br from-[#9b9bf8] to-[#8a8af5]"
          />
        </div>

        {/* Chart Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-semibold text-lg text-gray-800">
                Statistik Penggunaan
              </h3>
              <p className="text-xs text-gray-400">Trend akses lab</p>
            </div>

            {/* Switch */}
            <div className="bg-gray-100 p-1 rounded-lg flex text-xs font-medium">
              <button
                onClick={() => setChartMode("monthly")}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  chartMode === "monthly"
                    ? "bg-white shadow text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Bulanan
              </button>
              <button
                onClick={() => setChartMode("daily")}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  chartMode === "daily"
                    ? "bg-white shadow text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                30 Hari
              </button>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <AccessChart data={chartData} type={chartMode} />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}

function StatCard({
  title,
  value,
  Icon,
  color,
}: {
  title: string;
  value: number;
  Icon: React.ElementType;
  color: string;
}) {
  return (
    <div
      className={`${color} text-white p-6 rounded-2xl shadow-lg flex items-center gap-4 transition hover:-translate-y-1`}
    >
      <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center text-2xl">
        <Icon size={32} />
      </div>
      <div>
        <h3 className="text-sm font-medium opacity-90">{title}</h3>
        <p className="text-2xl font-bold">{value ?? 0}</p>
      </div>
    </div>
  );
}
