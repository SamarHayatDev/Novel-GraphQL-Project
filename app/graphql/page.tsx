"use client";

import { useState } from "react";

export default function GraphQLPlayground() {
  const [query, setQuery] = useState(`query {
  novels(pagination: { page: 1, limit: 5 }) {
    data {
      id
      title
      description
      author {
        name
      }
      category {
        name
      }
    }
    pagination {
      page
      limit
      total
      totalPages
    }
  }
}`);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const executeQuery = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
        }),
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Novel GraphQL API Playground
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Query Editor */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">GraphQL Query</h2>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-64 p-4 border border-gray-300 rounded-md font-mono text-sm"
              placeholder="Enter your GraphQL query here..."
            />
            <button
              onClick={executeQuery}
              disabled={loading}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Executing..." : "Execute Query"}
            </button>
          </div>

          {/* Results */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            <pre className="w-full h-64 p-4 bg-gray-50 border border-gray-300 rounded-md overflow-auto text-sm">
              {result || "Results will appear here..."}
            </pre>
          </div>
        </div>

        {/* Example Queries */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Example Queries</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Get All Novels</h3>
              <pre className="text-xs bg-gray-50 p-2 rounded">
{`query {
  novels(pagination: { page: 1, limit: 10 }) {
    data {
      id
      title
      description
      author { name }
      category { name }
    }
  }
}`}
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Get Categories</h3>
              <pre className="text-xs bg-gray-50 p-2 rounded">
{`query {
  categories(pagination: { page: 1, limit: 10 }) {
    data {
      id
      name
      description
      slug
    }
  }
}`}
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Get Authors</h3>
              <pre className="text-xs bg-gray-50 p-2 rounded">
{`query {
  authors(pagination: { page: 1, limit: 10 }) {
    data {
      id
      name
      bio
      novels { title }
    }
  }
}`}
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Register User</h3>
              <pre className="text-xs bg-gray-50 p-2 rounded">
{`mutation {
  register(input: {
    name: "Test User"
    email: "test@example.com"
    password: "password123"
    role: READER
  }) {
    user {
      id
      name
      email
      role
    }
    token
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
