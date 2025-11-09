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
const Home = React.lazy(() => import("./pages/Home"));
const Blog = React.lazy(() => import("./pages/Blog"));
const BlogPost = React.lazy(() => import("./pages/BlogPost"));
const About = React.lazy(() => import("./pages/About"));
const Contact = React.lazy(() => import("./pages/Contact"));
const Admin = React.lazy(() => import("./pages/Admin"));
const SignIn = React.lazy(() => import("./pages/SignIn"));
const SignUp = React.lazy(() => import("./pages/SignUp"));
const Profile = React.lazy(() => import("./pages/Profile"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <TooltipProvider>
          <Sonner />
          <TranslationProvider>
            <BrowserRouter>
              <SessionContextProvider>
                <Suspense fallback={<LoadingScreen message="Loading..." />}>
                  <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="blog" element={<Blog />} />
                    <Route path="blog/:slug" element={<BlogPost />} />
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
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
                </Suspense>
              </SessionContextProvider>
            </BrowserRouter>
          </TranslationProvider>
        </TooltipProvider>
      </ThemeProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;