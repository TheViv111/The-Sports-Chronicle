
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Linkedin, Copy, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface SocialShareProps {
    title: string;
    url: string;
    description?: string;
}

const SocialShare = ({ title, url, description }: SocialShareProps) => {
    const handleCopyLink = () => {
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
    };

    const handleShare = (platform: string) => {
        let shareUrl = "";
        const encodedUrl = encodeURIComponent(url);
        const encodedTitle = encodeURIComponent(title);

        switch (platform) {
            case "facebook":
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
                break;
            case "twitter":
                shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
                break;
            case "linkedin":
                shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodeURIComponent(description || "")}`;
                break;
            case "whatsapp":
                shareUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
                break;
            case "message":
                shareUrl = `sms:?body=${encodedTitle}%20${encodedUrl}`;
                break;
            default:
                return;
        }

        window.open(shareUrl, "_blank", "width=600,height=400");
    };

    return (
        <div className="flex flex-col sm:flex-row items-center gap-4 py-6 border-t border-b my-8">
            <span className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mr-2">
                Share this article
            </span>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleShare("facebook")}
                    className="rounded-full hover:bg-blue-600 hover:text-white transition-colors"
                    aria-label="Share on Facebook"
                >
                    <Facebook className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleShare("twitter")}
                    className="rounded-full hover:bg-sky-500 hover:text-white transition-colors"
                    aria-label="Share on Twitter"
                >
                    <Twitter className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleShare("linkedin")}
                    className="rounded-full hover:bg-blue-700 hover:text-white transition-colors"
                    aria-label="Share on LinkedIn"
                >
                    <Linkedin className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleShare("whatsapp")}
                    className="rounded-full hover:bg-green-600 hover:text-white transition-colors"
                    aria-label="Share on WhatsApp"
                >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.028 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 9.89-5.335 9.89-11.892a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleShare("message")}
                    className="rounded-full hover:bg-blue-500 hover:text-white transition-colors"
                    aria-label="Share via Message"
                >
                    <MessageCircle className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                    className="rounded-full hover:bg-zinc-700 hover:text-white transition-colors"
                    aria-label="Copy Link"
                >
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

export default SocialShare;
