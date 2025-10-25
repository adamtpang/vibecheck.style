import { Card } from "@/components/ui/card"
import { TrendingUp, Clock, Headphones, Zap } from "lucide-react"

const stats = [
  {
    label: "Total Listening Time",
    value: "847h 23m",
    change: "+12%",
    icon: Clock,
    trend: "up",
  },
  {
    label: "Tracks Analyzed",
    value: "2,847",
    change: "+156",
    icon: Headphones,
    trend: "up",
  },
  {
    label: "Top Genre",
    value: "Indie Rock",
    change: "34% of plays",
    icon: TrendingUp,
    trend: "neutral",
  },
  {
    label: "Vibe Score",
    value: "94/100",
    change: "+8 this week",
    icon: Zap,
    trend: "up",
  },
]

export function StatsOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-6 bg-card border-border hover:bg-card/80 transition-colors">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-balance">{stat.value}</p>
              <p
                className={`text-xs flex items-center gap-1 ${
                  stat.trend === "up" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {stat.trend === "up" && <TrendingUp className="w-3 h-3" />}
                {stat.change}
              </p>
            </div>
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
              <stat.icon className="w-6 h-6 text-muted-foreground" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
