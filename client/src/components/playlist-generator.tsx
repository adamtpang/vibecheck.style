import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Download, Share } from "lucide-react"

export function PlaylistGenerator() {
  return (
    <Card className="p-6 bg-card border-border">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-balance">Mega Playlist</h2>
        </div>

        <p className="text-sm text-muted-foreground">
          Your ultimate collection of 247 most-played tracks, ready to export to Spotify.
        </p>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total tracks</span>
            <span className="font-medium">247 songs</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Duration</span>
            <span className="font-medium">14h 32m</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Last updated</span>
            <span className="font-medium">2 hours ago</span>
          </div>
        </div>

        <div className="pt-4 space-y-2">
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            <Download className="w-4 h-4 mr-2" />
            Export to Spotify
          </Button>
          <Button variant="outline" className="w-full bg-transparent">
            <Share className="w-4 h-4 mr-2" />
            Share Playlist
          </Button>
        </div>
      </div>
    </Card>
  )
}
