
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Linkedin, Copy } from "lucide-react";
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
