import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const topArtists = [
  {
    rank: 1,
    name: "The Weeknd",
    genre: "R&B, Pop",
    plays: 1247,
    hours: "42h 15m",
  },
  {
    rank: 2,
    name: "Olivia Rodrigo",
    genre: "Pop, Alternative",
    plays: 892,
    hours: "31h 8m",
  },
  {
    rank: 3,
    name: "Lil Nas X",
    genre: "Hip Hop, Pop",
    plays: 634,
    hours: "22h 45m",
  },
  {
    rank: 4,
    name: "Glass Animals",
    genre: "Indie Rock",
    plays: 567,
    hours: "19h 32m",
  },
]

export function TopArtists() {
  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-balance">Top Artists</h2>
          <p className="text-sm text-muted-foreground">Artists you can't stop listening to</p>
        </div>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topArtists.map((artist) => (
          <div key={artist.rank} className="p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full flex items-center justify-center text-lg font-bold">
                {artist.rank}
              </div>
              <div className="flex-1">
                <p className="font-medium text-balance">{artist.name}</p>
                <p className="text-sm text-muted-foreground">{artist.genre}</p>
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{artist.plays} plays</span>
              <span className="text-primary font-medium">{artist.hours}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
