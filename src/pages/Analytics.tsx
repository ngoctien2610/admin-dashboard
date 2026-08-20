import React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const API_BASE = "http://localhost:3002/api";
const colors = ["#4f46e5", "#0f9f8f", "#f59e0b", "#ef4444", "#64748b"];

interface AnalyticsData {
  revenueByDate: { date: string; revenue: number }[];
  statusBreakdown: { name: string; value: number }[];
  categoryBreakdown: { name: string; value: number }[];
  totals: { revenue: number; orders: number; products: number; users: number };
}

export default function Analytics() {
  const [data, setData] = React.useState<AnalyticsData | null>(null);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    fetch(`${API_BASE}/analytics`)
      .then((response) => {
        if (!response.ok) throw new Error("Không thể tải báo cáo");
        return response.json();
      })
      .then(setData)
      .catch((reason: Error) => setError(reason.message));
  }, []);

  const exportCsv = () => {
    if (!data) return;
    const rows = [
      ["Ngày", "Doanh thu"],
      ...data.revenueByDate.map((item) => [item.date, String(item.revenue)]),
    ];
    const blob = new Blob([rows.map((row) => row.join(",")).join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "nexus-analytics.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data)
    return (
      <Box sx={{ display: "grid", placeItems: "center", minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={2}
      >
        <Box>
          <Typography variant="h4">Advanced Analytics</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Theo dõi doanh thu, trạng thái đơn và hiệu suất tồn kho từ dữ liệu
            vận hành.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<DownloadRoundedIcon />}
          onClick={exportCsv}
        >
          Xuất báo cáo CSV
        </Button>
      </Stack>
      <Grid container spacing={2}>
        {[
          [
            "Doanh thu",
            `$${data.totals.revenue.toLocaleString()}`,
            "Tổng giá trị đơn hàng",
          ],
          ["Đơn hàng", data.totals.orders, "Đơn trong dữ liệu"],
          ["Sản phẩm", data.totals.products, "Danh mục đang quản lý"],
          ["Người dùng", data.totals.users, "Tài khoản hệ thống"],
        ].map(([label, value, caption]) => (
          <Grid item xs={12} sm={6} lg={3} key={String(label)}>
            <Card>
              <CardContent>
                <Typography color="text.secondary">{label}</Typography>
                <Typography variant="h5" sx={{ mt: 1 }}>
                  {value}
                </Typography>
                <Chip label={caption} size="small" sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6">Xu hướng doanh thu</Typography>
              <Box sx={{ height: 320, mt: 2 }}>
                <ResponsiveContainer>
                  <LineChart data={data.revenueByDate}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => `$${value.toFixed(2)}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#4f46e5"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Trạng thái đơn hàng</Typography>
              <Box sx={{ height: 320, mt: 2 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={data.statusBreakdown}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={65}
                      outerRadius={105}
                      paddingAngle={3}
                    >
                      {data.statusBreakdown.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={colors[index % colors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6">Tồn kho theo danh mục</Typography>
              <Box sx={{ height: 300, mt: 2 }}>
                <ResponsiveContainer>
                  <BarChart data={data.categoryBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="value"
                      name="Tồn kho"
                      fill="#0f9f8f"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
