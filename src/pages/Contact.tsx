import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslation } from "@/contexts/TranslationContext";
import useScrollReveal from "@/hooks/useScrollReveal";
import { SEO } from "@/components/common/SEO";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useSession } from "@/components/auth/SessionContextProvider";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const { t } = useTranslation();
  const { session } = useSession();
  const navigate = useNavigate();

  const userId = session?.user?.id;
  const userEmail = session?.user?.email || "";

  // Fetch user profile to get first and last name for autofill
  const { data: profile } = useQuery<Tables<'profiles'> | null>({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  useScrollReveal('.reveal-on-scroll');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session) {
      toast.error(t("common.authenticationRequired"), {
        description: t("auth.signIn"),
      });
      navigate("/signin");
      return;
    }
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const contactData = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: userEmail,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    };

    try {
      // Call the contact form edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-contact-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify(contactData),
      });

      const contentType = response.headers.get('content-type') || '';
      if (!response.ok) {
        let errorMessage = t("common.error");
        if (contentType.includes('application/json')) {
          try {
            const errJson = await response.json();
            errorMessage = errJson.error || errorMessage;
          } catch {
            const raw = await response.text();
            errorMessage = raw || errorMessage;
          }
        } else {
          const raw = await response.text();
          errorMessage = raw || errorMessage;
        }
        console.error('Edge Function error response:', response.status, errorMessage);
        throw new Error(errorMessage);
      }

      if (contentType.includes('application/json')) {
        try {
          await response.json();
        } catch {
          // Ignore parse failures for success path and proceed
        }
      }

      toast.success(t("contact.messageSentSuccess"), {
        description: t("contact.messageSentDescription"),
      });

      (e.target as HTMLFormElement).reset();
      setJustSubmitted(true);
      setTimeout(() => setJustSubmitted(false), 2000);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(t("contact.failedToSend"), {
        description: (error as Error).message || t("common.tryAgain"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title="Contact The Sports Chronicle - Get in Touch"
        description="Contact The Sports Chronicle team with questions, feedback, or story ideas. We welcome your input on sports news coverage and analysis across basketball, soccer, swimming, and football."
        canonicalUrl="https://the-sports-chronicle.vercel.app/contact"
        schemaType="ContactPage"
      />
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6 reveal-on-scroll">
              {t("contact.pageTitle")}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto reveal-on-scroll">
              {t("contact.pageSubtitle")}
            </p>
          </div>

          {/* Content */}
          <div className="max-w-2xl lg:max-w-4xl mx-auto">
            <div className="reveal-on-scroll fade-in-left relative">
              <h2 className="font-heading text-2xl font-semibold mb-6">
                {t("contact.sendMessage")}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-semibold mb-2"
                    >
                      {t("contact.firstName")}
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      defaultValue={profile?.first_name || ""}
                      placeholder={t("contact.yourFirstName")}
                      required
                      className="w-full px-4 py-2.5 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-semibold mb-2"
                    >
                      {t("contact.lastName")}
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      defaultValue={profile?.last_name || ""}
                      placeholder={t("contact.yourLastName")}
                      required
                      className="w-full px-4 py-2.5 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold mb-2"
                  >
                    {t("auth.email")}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={userEmail}
                    readOnly
                    disabled={!session}
                    placeholder={t("contact.yourEmail")}
                    className="w-full px-4 py-2.5 rounded-md border border-input bg-muted text-foreground placeholder:text-muted-foreground cursor-not-allowed opacity-75"
                  />
                  {!session && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("auth.signInRequired")}
                    </p>
                  )}
                </div>

                {/* Subject Field */}
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-semibold mb-2"
                  >
                    {t("contact.subject")}
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    placeholder={t("contact.whatAbout")}
                    required
                    className="w-full px-4 py-2.5 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* Message Field */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold mb-2"
                  >
                    {t("contact.message")}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    placeholder={t("contact.tellUsMore")}
                    required
                    className="w-full px-4 py-2.5 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full btn-hover-lift tap-press animate-glow"
                  disabled={isSubmitting || !session}
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("contact.sending")}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      {t("contact.sendMessageBtn")}
                    </span>
                  )}
                </Button>
              </form>

              {/* Success Overlay */}
              {justSubmitted && (
                <div
                  className="absolute inset-0 grid place-items-center bg-background/70 backdrop-blur-sm animate-in fade-in duration-300"
                  aria-live="polite"
                >
                  <div className="flex flex-col items-center gap-2 animate-in zoom-in-95 fade-in duration-300 p-6 rounded-lg bg-background shadow-lg">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                    <p className="font-medium text-green-700">{t("contact.messageSentSuccess")}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
