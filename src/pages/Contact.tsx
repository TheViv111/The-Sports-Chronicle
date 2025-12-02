import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner"; // Using sonner for toasts
import { useTranslation } from "@/contexts/TranslationContext";
import useScrollReveal from "@/hooks/useScrollReveal";
import { SEO } from "@/components/common/SEO";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useSession } from "@/components/auth/SessionContextProvider";
import { useNavigate } from "react-router-dom";

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const { t } = useTranslation();
  const { session } = useSession();
  const navigate = useNavigate();

  const userEmail = session?.user?.email || "";

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
        title="Contact Us - The Sports Chronicle"
        description="Get in touch with The Sports Chronicle team. Send us your questions, feedback, or story ideas about sports news and coverage."
        canonicalUrl="https://thesportschronicle.com/contact"
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
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1">
            {/* Contact Form */}
            <div className="reveal-on-scroll fade-in-left">
              <h2 className="font-heading text-2xl font-semibold mb-6">
                {t("contact.sendMessage")}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">{t("contact.firstName")}</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder={t("contact.yourFirstName")}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">{t("contact.lastName")}</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder={t("contact.yourLastName")}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">{t("auth.email")}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={userEmail}
                    readOnly
                    disabled={!session}
                    placeholder={t("contact.yourEmail")}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="subject">{t("contact.subject")}</Label>
                  <Input
                    id="subject"
                    name="subject"
                    placeholder={t("contact.whatAbout")}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="message">{t("contact.message")}</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder={t("contact.tellUsMore")}
                    required
                    className="mt-1 min-h-[120px]"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full btn-hover-lift tap-press"
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

              {justSubmitted && (
                <div
                  className="absolute inset-0 grid place-items-center bg-background/70 backdrop-blur-sm animate-in fade-in duration-300"
                  aria-live="polite"
                >
                  <div className="flex flex-col items-center gap-2 animate-in zoom-in-95 fade-in duration-300 p-6 rounded-lg bg-background shadow-lg">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                    <p className="font-medium text-green-700">{t("form.success")}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Contact;
