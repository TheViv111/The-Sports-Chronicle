import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/common/ThemeProvider";
import { TranslationProvider } from "@/contexts/TranslationContext";
import { SessionContextProvider } from "@/components/auth/SessionContextProvider";
import { ProtectedAdminRoute } from "@/components/auth/ProtectedAdminRoute";
import { HelmetProvider } from "react-helmet-async";
import React, { Suspense } from "react";
import LoadingScreen from "@/components/common/LoadingScreen";
import Layout from "./components/layout/Layout";
import { CachePerformanceMonitor } from "@/components/common/CachePerformanceMonitor";
import EnvVarCheck from "@/components/common/EnvVarCheck";

const Home = React.lazy(() => import("./pages/Home"));
const Blog = React.lazy(() => import("./pages/Blog"));
const BlogPost = React.lazy(() => import("./pages/BlogPost"));
const UserProfile = React.lazy(() => import("./pages/UserProfile"));
const About = React.lazy(() => import("./pages/About"));
const Contact = React.lazy(() => import("./pages/Contact"));
const Admin = React.lazy(() => import("./pages/Admin"));
const SignIn = React.lazy(() => import("./pages/SignIn"));
const SignUp = React.lazy(() => import("./pages/SignUp"));
const Profile = React.lazy(() => import("./pages/Profile"));
const Sitemap = React.lazy(() => import("./pages/Sitemap"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

// Lazy load analytics components separately for better code splitting
const AnalyticsLazy = React.lazy(() => import("@vercel/analytics/react").then(m => ({ default: m.Analytics })));
const SpeedInsightsLazy = React.lazy(() => import("@vercel/speed-insights/react").then(m => ({ default: m.SpeedInsights })));

const App = () => {
  const [loadAnalytics, setLoadAnalytics] = React.useState(false);

  React.useEffect(() => {
    // Wait for page to be interactive before loading analytics
    if (document.readyState === 'complete') {
      // Use requestIdleCallback for better performance
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          setTimeout(() => setLoadAnalytics(true), 2000);
        }, { timeout: 5000 });
      } else {
        setTimeout(() => setLoadAnalytics(true), 4000);
      }
    } else {
      window.addEventListener('load', () => {
        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(() => {
            setTimeout(() => setLoadAnalytics(true), 2000);
          }, { timeout: 5000 });
        } else {
          setTimeout(() => setLoadAnalytics(true), 4000);
        }
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <EnvVarCheck>
        <HelmetProvider>
          <ThemeProvider
            defaultTheme="system"
            storageKey="vite-ui-theme"
          >
            <TooltipProvider>
              <Sonner />
              <TranslationProvider>
                <BrowserRouter>
                  <SessionContextProvider>
                    <Suspense fallback={<LoadingScreen message="Preparing your experience..." />}>
                      <Routes>
                        <Route path="/" element={<Layout />}>
                          <Route index element={<Home />} />
                          <Route path="blog" element={<Blog />} />
                          <Route path="blog/:slug" element={<BlogPost />} />
                          <Route path="users/:id" element={<UserProfile />} />
                          <Route path="about" element={<About />} />
                          <Route path="contact" element={<Contact />} />
                          <Route path="admin" element={<ProtectedAdminRoute />}>
                            <Route index element={<Navigate to="posts" replace />} />
                            <Route path=":tab" element={<Admin />} />
                            <Route path="edit/:id" element={<Admin />} />
                          </Route>
                          <Route path="signin" element={<SignIn />} />
                          <Route path="signup" element={<SignUp />} />
                          <Route path="profile" element={<Profile />} />
                          <Route path="sitemap.xml" element={<Sitemap />} />
                        </Route>
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                      {loadAnalytics && (
                        <Suspense fallback={null}>
                          <AnalyticsLazy />
                          <SpeedInsightsLazy />
                        </Suspense>
                      )}
                      {/* Performance monitoring only in dev */}
                      {import.meta.env.DEV && import.meta.env.VITE_SHOW_CACHE_MONITOR === 'true' && (
                        <CachePerformanceMonitor />
                      )}
                    </Suspense>
                  </SessionContextProvider>
                </BrowserRouter>
              </TranslationProvider>
            </TooltipProvider>
          </ThemeProvider>
        </HelmetProvider>
      </EnvVarCheck>
    </QueryClientProvider>
  );
};

export default App;
