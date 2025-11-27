
import React, { useState, useEffect } from 'react';
import { DataCard } from '../DataCard';
import { NewsIcon } from '../icons';
import { getLatestNews } from '../../services/geminiService';
import { GroundingSource } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export const GalnetNews: React.FC = () => {
    const { t } = useLanguage();
    const [news, setNews] = useState('');
    const [sources, setSources] = useState<GroundingSource[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            setIsLoading(true);
            const query = t('galnetNewsQuery');
            const { text, sources } = await getLatestNews(query);
            setNews(text);
            setSources(sources);
            setIsLoading(false);
        };
        fetchNews();
    }, [t]);

    return (
        <DataCard title="galnetFeedTitle" icon={<NewsIcon />} className="h-[26rem]">
            {isLoading ? (
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
                </div>
            ) : (
                <div className="text-gray-300 text-sm space-y-4">
                    <div className="whitespace-pre-wrap font-sans leading-relaxed text-gray-300">
                        {news.replace(/\*/g, '').split('\n').map((paragraph, idx) => (
                            paragraph.trim() && <p key={idx} className="mb-3">{paragraph}</p>
                        ))}
                    </div>
                    {sources.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-gray-200 mb-2">{t('sourcesLabel')}:</h4>
                            <ul className="list-disc list-inside space-y-1">
                                {sources.map((source, index) => (
                                    <li key={index}>
                                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                                            {source.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </DataCard>
    );
};
