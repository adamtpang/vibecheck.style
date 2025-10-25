import { DashboardHeader } from "@/components/dashboard-header"
import { StatsOverview } from "@/components/stats-overview"
import { TopTracks } from "@/components/top-tracks"
import { TopArtists } from "@/components/top-artists"
import { RecentActivity } from "@/components/recent-activity"
import { PlaylistGenerator } from "@/components/playlist-generator"

export default function Analytics() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-6 py-8 space-y-8">
        <StatsOverview />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <TopTracks />
            <TopArtists />
          </div>

          <div className="space-y-8">
            <PlaylistGenerator />
            <RecentActivity />
          </div>
        </div>
      </main>
    </div>
  )
}
