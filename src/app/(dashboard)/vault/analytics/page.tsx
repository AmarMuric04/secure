"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePasswordsQuery, useCategoriesQuery } from "@/hooks";
import {
  DashboardWrapper,
  Skeleton,
  Button,
  MetricCard,
  ChartCard,
  EmptyState,
} from "@repo/ui";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  Shield,
  AlertTriangle,
  KeyRound,
  Lock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Plus,
} from "lucide-react";

// Custom Tooltip Component
interface TooltipPayload {
  name: string;
  value: number;
  dataKey: string;
  fill?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card p-3 shadow-lg">
        {label && (
          <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
        )}
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            {entry.fill && (
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.fill }}
              />
            )}
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground">
                {entry.name}:
              </span>{" "}
              {entry.value}
              {entry.name === "Health %" || entry.name === "value" ? "%" : ""}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const { passwords, isPending } = usePasswordsQuery({});
  const { categories } = useCategoriesQuery();

  // Create a map of categoryId to category name
  const categoryNameMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((cat) => {
      map.set(cat._id, cat.name);
    });
    return map;
  }, [categories]);

  // Blue color for charts
  const blueColor = "217 91% 60%"; // hsl blue color

  const analytics = useMemo(() => {
    if (!passwords || passwords.length === 0) {
      return null;
    }

    const now = new Date().getTime();

    // Security Score Distribution
    const strengthDistribution = [
      { name: "Very Weak (0)", value: 0, strength: 0 },
      { name: "Weak (1)", value: 0, strength: 1 },
      { name: "Fair (2)", value: 0, strength: 2 },
      { name: "Good (3)", value: 0, strength: 3 },
      { name: "Strong (4)", value: 0, strength: 4 },
    ];

    passwords.forEach((pwd) => {
      if (pwd.passwordStrength !== undefined) {
        strengthDistribution[pwd.passwordStrength].value++;
      }
    });

    // Security Issues Summary
    const weakCount = passwords.filter((p) => p.passwordStrength <= 1).length;
    const compromisedCount = passwords.filter((p) => p.isCompromised).length;
    const reusedCount = passwords.filter((p) => p.isReused).length;
    const strongCount = passwords.filter((p) => p.passwordStrength >= 3).length;

    const securityScore = Math.round(
      ((strongCount - weakCount - compromisedCount - reusedCount) /
        passwords.length) *
        100,
    );

    // Passwords by category (top 5)
    const categoryCountMap = new Map<string, number>();
    passwords.forEach((pwd) => {
      const catId = pwd.categoryId || "Uncategorized";
      categoryCountMap.set(catId, (categoryCountMap.get(catId) || 0) + 1);
    });

    const categoryData = Array.from(categoryCountMap.entries())
      .map(([catId, count]) => ({
        category:
          catId === "Uncategorized"
            ? "Uncategorized"
            : categoryNameMap.get(catId) || "Unknown",
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Security overview for radar chart
    const maxPasswords = passwords.length;
    const securityOverview = [
      {
        metric: "Strong",
        value: (strongCount / maxPasswords) * 100,
        fullMark: 100,
      },
      {
        metric: "No Reuse",
        value: ((passwords.length - reusedCount) / maxPasswords) * 100,
        fullMark: 100,
      },
      {
        metric: "Not Compromised",
        value: ((passwords.length - compromisedCount) / maxPasswords) * 100,
        fullMark: 100,
      },
      {
        metric: "Recently Updated",
        value:
          (passwords.filter((p) => {
            const daysSinceUpdate =
              (now - new Date(p.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
            return daysSinceUpdate < 90;
          }).length /
            maxPasswords) *
          100,
        fullMark: 100,
      },
      {
        metric: "Has Categories",
        value:
          (passwords.filter((p) => p.categoryId).length / maxPasswords) * 100,
        fullMark: 100,
      },
    ];

    return {
      strengthDistribution,
      securityScore,
      categoryData,
      securityOverview,
      stats: {
        total: passwords.length,
        weak: weakCount,
        compromised: compromisedCount,
        reused: reusedCount,
        strong: strongCount,
      },
    };
  }, [passwords, categoryNameMap]);

  return (
    <DashboardWrapper>
      <div className="space-y-6">
        {/* Header - Always visible */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Security Analytics
          </h1>
          <p className="text-muted-foreground mt-2">
            Overview of your password security health
          </p>
        </div>

        {/* Loading State */}
        {isPending ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-96" />
              <Skeleton className="h-96" />
            </div>
          </>
        ) : !analytics || analytics.stats.total === 0 ? (
          <EmptyState
            icon={<Shield className="h-8 w-8 text-muted-foreground" />}
            title="No Analytics Data Yet"
            description="Add some passwords to see your security analytics."
            action={
              <Button asChild className="rounded-2xl">
                <Link href="/vault/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Password
                </Link>
              </Button>
            }
          />
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                title="Security Score"
                value={`${analytics.securityScore}%`}
                icon={<Shield className="h-5 w-5" />}
                description={
                  analytics.securityScore >= 80
                    ? "Excellent"
                    : analytics.securityScore >= 60
                      ? "Good"
                      : "Needs Attention"
                }
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-2xl"
                    asChild
                  >
                    <Link href="/vault/security">
                      View Details
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                }
              />

              <MetricCard
                title="Total Passwords"
                value={analytics.stats.total.toString()}
                icon={<KeyRound className="h-5 w-5" />}
                description={`${analytics.stats.strong} strong passwords`}
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-2xl"
                    asChild
                  >
                    <Link href="/vault">
                      View Details
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                }
              />

              <MetricCard
                title="Security Issues"
                value={(
                  analytics.stats.weak +
                  analytics.stats.compromised +
                  analytics.stats.reused
                ).toString()}
                icon={<AlertTriangle className="h-5 w-5" />}
                description="Require your attention"
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-2xl"
                    asChild
                  >
                    <Link href="/vault/security">
                      View Details
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                }
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Password Strength Distribution */}
              <ChartCard title="Password Strength Distribution">
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={analytics.strengthDistribution.filter(
                        (d) => d.value > 0,
                      )}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ value, percent }) =>
                        `${value} (${((percent || 0) * 100).toFixed(0)}%)`
                      }
                      outerRadius={110}
                      innerRadius={65}
                      fill={`hsl(${blueColor})`}
                      dataKey="value"
                      paddingAngle={3}
                      stroke="hsl(var(--background))"
                      strokeWidth={3}
                    >
                      {analytics.strengthDistribution.map((entry, index) => {
                        const opacity = 0.3 + (entry.strength / 4) * 0.7;
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={`hsl(${blueColor} / ${opacity})`}
                          />
                        );
                      })}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  {analytics.strengthDistribution
                    .filter((d) => d.value > 0)
                    .map((item, idx) => {
                      const opacity = 0.3 + (item.strength / 4) * 0.7;
                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: `hsl(${blueColor} / ${opacity})`,
                            }}
                          />
                          <span className="text-muted-foreground">
                            {item.name}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </ChartCard>

              {/* Security Overview Radar */}
              <ChartCard title="Security Health Radar">
                <ResponsiveContainer width="100%" height={320}>
                  <RadarChart data={analytics.securityOverview}>
                    <PolarGrid
                      stroke={`hsl(${blueColor})`}
                      strokeOpacity={0.15}
                      strokeWidth={1.5}
                      gridType="polygon"
                    />
                    <PolarAngleAxis
                      dataKey="metric"
                      tick={{
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{
                        fill: `hsl(${blueColor})`,
                        fontSize: 11,
                        fontWeight: 500,
                      }}
                      tickCount={5}
                      stroke={`hsl(${blueColor})`}
                      strokeOpacity={0.2}
                    />
                    <Radar
                      name="Health %"
                      dataKey="value"
                      stroke={`hsl(${blueColor})`}
                      fill={`hsl(${blueColor})`}
                      fillOpacity={0.2}
                      strokeWidth={3}
                      dot={{
                        r: 5,
                        fill: `hsl(${blueColor})`,
                        strokeWidth: 2,
                        stroke: "hsl(var(--background))",
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Bottom Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top Categories */}
              <ChartCard title="Top 5 Categories" className="lg:col-span-2">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={analytics.categoryData}
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      opacity={0.3}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="category"
                      tick={{
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 11,
                        fontWeight: 500,
                      }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      tickLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis
                      tick={{
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 11,
                      }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      tickLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="count"
                      fill={`hsl(${blueColor})`}
                      radius={[16, 16, 0, 0]}
                      maxBarSize={60}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Security Issues Breakdown */}
              <ChartCard title="Security Issues">
                <div className="space-y-3 mt-2">
                  <IssueCard
                    label="Weak Passwords"
                    count={analytics.stats.weak}
                    total={analytics.stats.total}
                    icon={<AlertCircle className="h-5 w-5" />}
                    color="orange"
                  />
                  <IssueCard
                    label="Compromised"
                    count={analytics.stats.compromised}
                    total={analytics.stats.total}
                    icon={<Shield className="h-5 w-5" />}
                    color="red"
                  />
                  <IssueCard
                    label="Reused"
                    count={analytics.stats.reused}
                    total={analytics.stats.total}
                    icon={<Lock className="h-5 w-5" />}
                    color="yellow"
                  />
                  <IssueCard
                    label="Strong"
                    count={analytics.stats.strong}
                    total={analytics.stats.total}
                    icon={<CheckCircle2 className="h-5 w-5" />}
                    color="green"
                  />
                </div>
              </ChartCard>
            </div>

            {/* Security Recommendations */}
            {(analytics.stats.weak > 0 ||
              analytics.stats.compromised > 0 ||
              analytics.stats.reused > 0) && (
              <div className="rounded-lg border bg-card p-6">
                <div className="flex items-start gap-4">
                  <div className="text-primary">
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-3">
                      Security Recommendations
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {analytics.stats.weak > 0 && (
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                          <span>
                            Update {analytics.stats.weak} weak password
                            {analytics.stats.weak > 1 ? "s" : ""} with stronger
                            alternatives
                          </span>
                        </li>
                      )}
                      {analytics.stats.compromised > 0 && (
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                          <span>
                            Immediately change {analytics.stats.compromised}{" "}
                            compromised password
                            {analytics.stats.compromised > 1 ? "s" : ""}
                          </span>
                        </li>
                      )}
                      {analytics.stats.reused > 0 && (
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                          <span>
                            Create unique passwords for {analytics.stats.reused}{" "}
                            reused credential
                            {analytics.stats.reused > 1 ? "s" : ""}
                          </span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardWrapper>
  );
}

function IssueCard({
  label,
  count,
  total,
  icon,
  color,
}: {
  label: string;
  count: number;
  total: number;
  icon: React.ReactNode;
  color: "red" | "orange" | "yellow" | "green";
}) {
  const percentage = Math.round((count / total) * 100);

  const colorClasses = {
    red: "border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20",
    orange:
      "border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/20",
    yellow:
      "border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-950/20",
    green:
      "border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20",
  };

  const iconColors = {
    red: "text-red-600 dark:text-red-400",
    orange: "text-orange-600 dark:text-orange-400",
    yellow: "text-yellow-600 dark:text-yellow-400",
    green: "text-green-600 dark:text-green-400",
  };

  const barColors = {
    red: "bg-red-500",
    orange: "bg-orange-500",
    yellow: "bg-yellow-500",
    green: "bg-green-500",
  };

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={iconColors[color]}>{icon}</div>
          <div>
            <div className="font-semibold">{label}</div>
            <div className="text-xs text-muted-foreground">
              {percentage}% of total
            </div>
          </div>
        </div>
        <div className="text-2xl font-bold">{count}</div>
      </div>
      <div className="w-full h-2 bg-background/50 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barColors[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
