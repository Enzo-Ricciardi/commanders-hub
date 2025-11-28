import React, { useEffect, useState } from 'react';
import { DataCard } from '../DataCard';
import { useLanguage } from '../../context/LanguageContext';
import { Newspaper } from 'lucide-react';

interface NewsItem {
    title: string;
    link: string;
    date: string;
    content: string;
}

export const GalnetNews: React.FC = () => {
    const { t } = useLanguage();
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                // Using a CORS proxy to bypass browser restrictions on the RSS feed
                const response = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('https://community.elitedangerous.com/galnet-rss'));
                const data = await response.json();

                if (data.contents) {
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(data.contents, "text/xml");
                    const items = xmlDoc.querySelectorAll("item");

                    const newsItems: NewsItem[] = [];
                    items.forEach((item, index) => {
                        if (index < 5) { // Limit to 5 items
                            const title = item.querySelector("title")?.textContent || "";
                            const link = item.querySelector("link")?.textContent || "";
                            const pubDate = item.querySelector("pubDate")?.textContent || "";
                            // Clean up description (remove HTML tags if any)
                            const description = item.querySelector("description")?.textContent || "";
                            const cleanDescription = description.replace(/<[^>]*>?/gm, '').substring(0, 150) + "...";

                            newsItems.push({
                                title,
                                link,
                                date: new Date(pubDate).toLocaleDateString(),
                                content: cleanDescription
                            });
                        }
                    });
                    setNews(newsItems);
                }
            } catch (err) {
                console.error("Failed to fetch Galnet news", err);
                setError("Failed to load Galnet feed.");
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    return (
        <DataCard title="galnetTitle" icon={<Newspaper className="text-orange-500" />}>
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {loading ? (
                    <div className="text-center text-gray-400 py-4 animate-pulse">
                        Incoming transmission...
                    </div>
                ) : error ? (
                    <div className="text-center text-red-400 py-4">
                        {error}
                    </div>
                ) : (
                    news.map((item, index) => (
                        <div key={index} className="border-b border-gray-700 pb-3 last:border-0 last:pb-0">
                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="block group">
                                <h4 className="font-bold text-orange-400 group-hover:text-orange-300 transition-colors mb-1">
                                    {item.title}
                                </h4>
                                <div className="text-xs text-gray-500 mb-2">{item.date}</div>
                                <p className="text-sm text-gray-300 leading-relaxed">
                                    {item.content}
                                </p>
                            </a>
                        </div>
                    ))
                )}
            </div>
        </DataCard>
    );
};
