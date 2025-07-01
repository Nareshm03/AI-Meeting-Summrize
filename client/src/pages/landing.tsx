import { useState } from "react";
import { Bot, FileText, TrendingUp, Users, Zap, Brain } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Landing() {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="absolute top-0 right-0 p-6">
        <ThemeToggle />
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
          {/* Left side - Hero content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Bot className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Meeting AI
                </span>
              </div>
              
              <h1 className="text-5xl font-bold leading-tight text-gray-900 dark:text-white">
                Transform Your{" "}
                <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Meetings
                </span>{" "}
                Into Actionable Insights
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                AI-powered meeting analysis that extracts summaries, action items, 
                sentiment analysis, and speaker insights from your transcripts automatically.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="grid sm:grid-cols-2 gap-6">
              <Card className="border-none shadow-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Smart Summaries
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Automated meeting summaries with key points
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <Zap className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Action Items
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Extract tasks with priorities and assignments
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Sentiment Analysis
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Track mood and engagement over time
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                      <Users className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Speaker Insights
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Analyze participation and contributions
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Supported platforms */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Works with your favorite platforms
              </h3>
              <div className="flex items-center space-x-6 text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5" />
                  <span>Teams</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5" />
                  <span>Zoom</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5" />
                  <span>YouTube</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>File Upload</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Auth forms */}
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              {authMode === "login" ? (
                <LoginForm onSwitchToRegister={() => setAuthMode("register")} />
              ) : (
                <RegisterForm onSwitchToLogin={() => setAuthMode("login")} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}