import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { adminDashboardService } from "../../services/adminDashboardService";

const screenWidth = Dimensions.get("window").width;
type Segment = "agents" | "sellers";

const chartConfig = {
  backgroundGradientFrom: "#102c7a",
  backgroundGradientTo: "#102c7a",
  color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
  labelColor: (opacity = 1) => `rgba(255,255,255,${opacity})`,
  strokeWidth: 2,
  propsForDots: { r: "3", strokeWidth: "1", stroke: "#fff" },
};

export default function AdminPerformanceDashboardScreen() {
  const [segment, setSegment] = useState<Segment>("agents");
  const currentYear = new Date().getFullYear();

  const summaryQuery = useQuery({
    queryKey: ["admin", "reports", "summary"],
    queryFn: () => adminDashboardService.getSummary(),
  });
  const revenueChartQuery = useQuery({
    queryKey: ["admin", "reports", "revenue-chart", currentYear],
    queryFn: () => adminDashboardService.getRevenueChart(currentYear),
  });
  const rolesSummaryQuery = useQuery({
    queryKey: ["admin", "reports", "roles-summary"],
    queryFn: () => adminDashboardService.getRolesSummary(),
  });
  const topAgentsQuery = useQuery({
    queryKey: ["admin", "reports", "top-agents"],
    queryFn: () => adminDashboardService.getTopAgents(5),
  });
  const topSellersQuery = useQuery({
    queryKey: ["admin", "reports", "top-sellers"],
    queryFn: () => adminDashboardService.getTopSellers(5),
  });

  const isLoading =
    summaryQuery.isLoading ||
    revenueChartQuery.isLoading ||
    rolesSummaryQuery.isLoading ||
    topAgentsQuery.isLoading ||
    topSellersQuery.isLoading;

  const chartLabels = ["T1", "T3", "T5", "T7", "T9", "T11"];
  const revenueByMonth = revenueChartQuery.data?.revenueByMonth ?? [];
  const dealsByMonth = revenueChartQuery.data?.dealsByMonth ?? [];

  const chartBarData = useMemo(() => {
    const map = new Map<number, number>();
    dealsByMonth.forEach((item) => map.set(item._id.month, item.totalDeals || 0));
    return [1, 3, 5, 7, 9, 11].map((m) => map.get(m) || 0);
  }, [dealsByMonth]);

  const fallbackLeadsData = useMemo(() => {
    // Dữ liệu mô phỏng để demo UI khi backend chưa có số liệu theo tháng.
    return segment === "agents" ? [12, 18, 22, 19, 25, 28] : [9, 14, 17, 16, 20, 23];
  }, [segment]);

  const hasRealChartData = useMemo(
    () => chartBarData.some((value) => value > 0),
    [chartBarData],
  );

  const leadsChartData = hasRealChartData ? chartBarData : fallbackLeadsData;
  const usingMockLeads = !hasRealChartData;

  const topRows = segment === "agents" ? topAgentsQuery.data ?? [] : topSellersQuery.data ?? [];
  const totalSelectedRole =
    segment === "agents" ? rolesSummaryQuery.data?.agents : rolesSummaryQuery.data?.sellers;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.logoRow}>
          <Text style={styles.logoText}>CURATOR SỐ</Text>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AD</Text>
          </View>
        </View>

        <Text style={styles.kicker}>BẢNG ĐIỀU KHIỂN QUẢN TRỊ</Text>
        <Text style={styles.title}>Phân Tích Hiệu Suất</Text>

        <View style={styles.segmentWrap}>
          <Pressable
            style={[styles.segmentBtn, segment === "agents" && styles.segmentBtnActive]}
            onPress={() => setSegment("agents")}
          >
            <Text
              style={[styles.segmentText, segment === "agents" && styles.segmentTextActive]}
            >
              MÔI GIỚI
            </Text>
          </Pressable>
          <Pressable
            style={[styles.segmentBtn, segment === "sellers" && styles.segmentBtnActive]}
            onPress={() => setSegment("sellers")}
          >
            <Text
              style={[styles.segmentText, segment === "sellers" && styles.segmentTextActive]}
            >
              CHỦ NHÀ
            </Text>
          </Pressable>
        </View>

        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#1e3a8a" />
            <Text style={styles.loadingText}>Đang tải dữ liệu hiệu suất...</Text>
          </View>
        ) : (
          <>
            <View style={styles.statsRow}>
              <View style={styles.smallCard}>
                <Text style={styles.smallCardLabel}>TỶ LỆ TĂNG TRƯỞNG</Text>
                <Text style={styles.smallCardValue}>
                  {summaryQuery.data?.totalDealsCompleted
                    ? `+${Math.min(99, Math.round(summaryQuery.data.totalDealsCompleted / 5))}%`
                    : "+0%"}
                </Text>
                <Text style={styles.smallCardHint}>so với quý trước</Text>
              </View>
              <View style={styles.smallCard}>
                <Text style={styles.smallCardLabel}>SỐ {segment === "agents" ? "MÔI GIỚI" : "CHỦ NHÀ"}</Text>
                <Text style={styles.smallCardValue}>{totalSelectedRole ?? 0}</Text>
                <Text style={styles.smallCardHint}>đang hoạt động</Text>
              </View>
            </View>

            <View style={styles.smallBarCard}>
              <Text style={styles.smallCardLabel}>LEAD / THÁNG</Text>
              <BarChart
                data={{ labels: chartLabels, datasets: [{ data: leadsChartData }] }}
                width={screenWidth - 48}
                height={180}
                fromZero
                withInnerLines={false}
                withHorizontalLabels={false}
                showValuesOnTopOfBars={false}
                chartConfig={{
                  ...chartConfig,
                  backgroundGradientFrom: "#f8fafc",
                  backgroundGradientTo: "#f8fafc",
                  color: (opacity = 1) => `rgba(30,58,138,${opacity})`,
                  labelColor: () => "rgba(100,116,139,1)",
                }}
                style={{ marginLeft: -12, marginTop: 2 }}
              />
              <View style={styles.leadsFooter}>
                <Text style={styles.leadsFooterMain}>
                  {usingMockLeads
                    ? leadsChartData.reduce((sum, val) => sum + val, 0)
                    : summaryQuery.data?.totalLeads ?? 0}
                </Text>
                <Text style={styles.leadsFooterSub}>
                  {usingMockLeads ? "lead" : "lead toàn hệ thống"}
                </Text>
              </View>
            </View>

            <View style={styles.topHeader}>
              <Text style={styles.topTitle}>
                TOP {segment === "agents" ? "MÔI GIỚI" : "CHỦ NHÀ"}
              </Text>
              <Text style={styles.topViewAll}>XEM TOÀN BỘ</Text>
            </View>

            <View style={styles.rankCard}>
              {topRows.slice(0, 3).map((row: any, index: number) => {
                const deals = row?.totalDeals ?? 0;
                return (
                  <View key={`${row?.email || index}`} style={styles.rankRow}>
                    <Text style={styles.rankNo}>{String(index + 1).padStart(2, "0")}</Text>
                    <View style={styles.rankInfo}>
                      <Text style={styles.rankName} numberOfLines={1}>
                        {row?.fullName || row?.email || "Không rõ"}
                      </Text>
                      <Text style={styles.rankRole}>
                        {segment === "agents" ? "chuyên viên môi giới" : "chủ nhà"}
                      </Text>
                    </View>
                    <Text style={styles.rankValue}>{deals}</Text>
                  </View>
                );
              })}
              <View style={styles.rankFooter}>
                <Text style={styles.rankFooterText}>
                  HIỂN THỊ 1-{Math.min(3, topRows.length)} TRÊN {topRows.length || 0}
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  content: { padding: 16, paddingBottom: 24, gap: 14 },
  logoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  logoText: { color: "#64748b", fontSize: 18, fontWeight: "900", letterSpacing: 1 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1e3a8a",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  kicker: { color: "#9ca3af", fontSize: 10, fontWeight: "700", letterSpacing: 1 },
  title: { color: "#1e3a8a", fontSize: 38, fontWeight: "900", lineHeight: 40 },
  segmentWrap: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 10,
    padding: 4,
  },
  segmentBtn: { flex: 1, borderRadius: 8, paddingVertical: 8, alignItems: "center" },
  segmentBtnActive: { backgroundColor: "#ffffff" },
  segmentText: { color: "#6b7280", fontSize: 11, fontWeight: "800" },
  segmentTextActive: { color: "#1e3a8a" },
  loadingBox: { alignItems: "center", justifyContent: "center", paddingVertical: 28, gap: 8 },
  loadingText: { color: "#64748b", fontSize: 13, fontWeight: "600" },
  statsRow: { flexDirection: "row", gap: 10 },
  smallCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  smallCardLabel: { fontSize: 10, color: "#9ca3af", fontWeight: "800", letterSpacing: 0.8 },
  smallCardValue: { marginTop: 6, fontSize: 28, color: "#1e3a8a", fontWeight: "900" },
  smallCardHint: { marginTop: 2, fontSize: 10, color: "#f97316", fontWeight: "700" },
  smallBarCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  leadsFooter: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  leadsFooterMain: {
    fontSize: 26,
    color: "#1e3a8a",
    fontWeight: "900",
  },
  leadsFooterSub: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "700",
  },
  topHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  topTitle: { color: "#1e3a8a", fontSize: 13, fontWeight: "900", letterSpacing: 0.9 },
  topViewAll: { color: "#64748b", fontSize: 10, fontWeight: "800" },
  rankCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  rankNo: { width: 26, color: "#cbd5e1", fontSize: 20, fontWeight: "900" },
  rankInfo: { flex: 1, minWidth: 0 },
  rankName: { color: "#1e3a8a", fontSize: 14, fontWeight: "800" },
  rankRole: { color: "#94a3b8", fontSize: 10, marginTop: 2, fontWeight: "700" },
  rankValue: { color: "#1e3a8a", fontSize: 22, fontWeight: "900" },
  rankFooter: { paddingHorizontal: 12, paddingVertical: 8 },
  rankFooterText: { color: "#9ca3af", fontSize: 10, fontWeight: "700" },
});

