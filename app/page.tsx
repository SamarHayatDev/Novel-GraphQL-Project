import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PublicHomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center py-16">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Welcome to Novel Website
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Discover amazing novels in English and Urdu. Read, explore, and
          immerse yourself in captivating stories.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg">Browse Novels</Button>
          <Button variant="outline" size="lg">
            Sign Up
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-6 mt-16">
        <Card>
          <CardHeader>
            <CardTitle>📚 Rich Library</CardTitle>
            <CardDescription>
              Explore thousands of novels across different genres
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              From fantasy to romance, mystery to sci-fi, find your next
              favorite book.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🌍 Multilingual</CardTitle>
            <CardDescription>
              Read in English and Urdu languages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Enjoy stories in multiple languages with our bilingual platform.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📱 Easy Reading</CardTitle>
            <CardDescription>
              Comfortable reading experience on any device
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Read on your phone, tablet, or computer with our responsive
              design.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold mb-4">Ready to start reading?</h2>
        <p className="text-muted-foreground mb-6">
          Join thousands of readers and discover amazing stories today.
        </p>
        <Button size="lg">Get Started</Button>
      </div>
    </div>
  );
}
