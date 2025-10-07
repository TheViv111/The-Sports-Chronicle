import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner"; // Using sonner for toasts
import { useTranslation } from "@/contexts/TranslationContext";
import { supabase } from "@/integrations/supabase/client";
import useScrollReveal from "@/hooks/useScrollReveal";

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();

  useScrollReveal('.reveal-on-scroll');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const contactData = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    };

    try {
      // Call the contact form edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-contact-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });

      // Read the response body once as text
      const responseText = await response.text();

      if (!response.ok) {
        let errorMessage = t("common.error");
        try {
          // Try to parse the text as JSON
          const errorJson = JSON.parse(responseText);
          errorMessage = errorJson.error || errorMessage;
        } catch {
          // If JSON parsing fails, use the raw text
          errorMessage = responseText || errorMessage;
        }
        console.error('Edge Function error response:', response.status, errorMessage);
        throw new Error(errorMessage);
      }

      const result = JSON.parse(responseText); // Parse the already read text as JSON for success
      console.log('Contact form result:', result);

      toast.success(t("contact.messageSentSuccess"), {
        description: t("contact.messageSentDescription"),
      });

      (e.target as HTMLFormElement).reset();
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
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
                    placeholder={t("contact.yourEmail")}
                    required
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
                  className="w-full btn-hover-lift"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t("contact.sending") : t("contact.sendMessageBtn")}
                </Button>
              </form>
            </div>

            {/* Newsroom */}
            <div className="reveal-on-scroll fade-in-right">
              <h2 className="font-heading text-2xl font-semibold mb-6">
                {t("contact.newsroom")}
              </h2>
              
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  {t("contact.pressReleases")}
                </p>
                <p className="font-medium">
                  newsroom@sportschronicle.com
                </p>
              </div>

              <div className="mt-8 p-6 bg-secondary/20 rounded-lg">
                <h3 className="font-heading text-lg font-semibold mb-3">
                  {t("contact.editorial")}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t("contact.editorialInquiries")}
                </p>
              </div>

              <div className="mt-8 p-6 bg-secondary/20 rounded-lg">
                <h3 className="font-heading text-lg font-semibold mb-3">
                  {t("contact.advertising")}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t("contact.advertisingOpportunities")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;