import { Card } from "@/components/ui/card"
import { Clock } from "lucide-react"

const recentActivity = [
  {
    action: "Listened to",
    track: "Blinding Lights",
    artist: "The Weeknd",
    time: "2 minutes ago",
  },
  {
    action: "Added to favorites",
    track: "Good 4 U",
    artist: "Olivia Rodrigo",
    time: "1 hour ago",
  },
  {
    action: "Discovered",
    track: "Industry Baby",
    artist: "Lil Nas X",
    time: "3 hours ago",
  },
  {
    action: "Playlist updated",
    track: "Mega Playlist",
    artist: "247 tracks",
    time: "5 hours ago",
  },
]

export function RecentActivity() {
  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-balance">Recent Activity</h2>
      </div>

      <div className="space-y-4">
        {recentActivity.map((activity, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="text-muted-foreground">{activity.action}</span>{" "}
                <span className="font-medium text-balance">{activity.track}</span>
                {activity.artist !== "247 tracks" && (
                  <>
                    {" "}
                    by <span className="text-muted-foreground">{activity.artist}</span>
                  </>
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
