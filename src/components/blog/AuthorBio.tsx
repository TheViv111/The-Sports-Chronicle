import { Author } from '@/data/authors';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/contexts/TranslationContext';

interface AuthorBioProps {
    author: Author;
}

export const AuthorBio = ({ author }: AuthorBioProps) => {
    const { t } = useTranslation();

    return (
        <Card className="my-8 border-2 border-primary/10 hover:border-primary/20 transition-all duration-300">
            <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                    {/* Author Avatar */}
                    <div className="flex-shrink-0">
                        <img
                            src={author.avatarUrl}
                            alt={author.name}
                            className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/20 shadow-lg"
                            loading="lazy"
                            onError={(e) => {
                                // Fallback to a default avatar if image fails to load
                                (e.currentTarget as HTMLImageElement).src = '/images/team/default-avatar.svg';
                            }}
                        />
                    </div>

                    {/* Author Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-heading text-xl font-semibold mb-2 text-foreground">
                            {t('blog.aboutAuthor') || 'About the Author'}
                        </h3>
                        <p className="text-lg font-medium text-primary mb-1">
                            {author.name}
                        </p>
                        <p className="text-sm text-muted-foreground mb-3 font-medium">
                            {author.title}
                        </p>
                        <p className="text-sm leading-relaxed text-foreground/90">
                            {author.bio}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
