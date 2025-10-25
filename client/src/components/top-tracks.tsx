import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, MoreHorizontal } from "lucide-react"

const topTracks = [
  {
    rank: 1,
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    plays: 247,
    duration: "3:20",
  },
  {
    rank: 2,
    title: "Good 4 U",
    artist: "Olivia Rodrigo",
    album: "SOUR",
    plays: 189,
    duration: "2:58",
  },
  {
    rank: 3,
    title: "Stay",
    artist: "The Kid LAROI, Justin Bieber",
    album: "F*CK LOVE 3",
    plays: 156,
    duration: "2:21",
  },
  {
    rank: 4,
    title: "Industry Baby",
    artist: "Lil Nas X, Jack Harlow",
    album: "MONTERO",
    plays: 134,
    duration: "3:32",
  },
  {
    rank: 5,
    title: "Heat Waves",
    artist: "Glass Animals",
    album: "Dreamland",
    plays: 128,
    duration: "3:58",
  },
]

export function TopTracks() {
  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-balance">Top Tracks</h2>
          <p className="text-sm text-muted-foreground">Your most played songs this month</p>
        </div>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </div>

      <div className="space-y-4">
        {topTracks.map((track) => (
          <div
            key={track.rank}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
          >
            <div className="w-8 h-8 bg-muted rounded flex items-center justify-center text-sm font-medium">
              {track.rank}
            </div>

            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
              <Play className="w-5 h-5 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-balance truncate">{track.title}</p>
              <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
            </div>

            <div className="hidden md:block text-sm text-muted-foreground">{track.plays} plays</div>

            <div className="text-sm text-muted-foreground">{track.duration}</div>

            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  )
}
