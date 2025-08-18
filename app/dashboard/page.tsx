import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your novels, authors, and content
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Novels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Authors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+1 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Chapters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">+12 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+89 from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to manage your content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button className="flex-1">Add New Novel</Button>
              <Button variant="outline" className="flex-1">
                Add Author
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                Manage Categories
              </Button>
              <Button variant="outline" className="flex-1">
                View Analytics
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New novel added</p>
                  <p className="text-xs text-muted-foreground">
                    "The Lost Kingdom" by John Doe
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  2 hours ago
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Chapter published</p>
                  <p className="text-xs text-muted-foreground">
                    Chapter 15 of "Mystery Manor"
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  5 hours ago
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Author profile updated</p>
                  <p className="text-xs text-muted-foreground">
                    Jane Smith's bio updated
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">1 day ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Novels */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Novels</CardTitle>
          <CardDescription>Latest novels added to the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">The Lost Kingdom</h3>
                <p className="text-sm text-muted-foreground">
                  Fantasy • John Doe
                </p>
              </div>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Mystery Manor</h3>
                <p className="text-sm text-muted-foreground">
                  Mystery • Jane Smith
                </p>
              </div>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Love in Paris</h3>
                <p className="text-sm text-muted-foreground">
                  Romance • Sarah Johnson
                </p>
              </div>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
