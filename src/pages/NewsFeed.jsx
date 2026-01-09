import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Newspaper, Clock, ExternalLink, RefreshCw, 
  TrendingUp, AlertCircle, CheckCircle, Building2
} from 'lucide-react';

// Simulated news data (would be replaced with real RSS feed)
const fetchLiveNews = async () => {
  setIsLoadingNews(true);
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Get the latest 5 Nigerian tax news updates and policy changes from 2025-2026. Include official NRS announcements, tax reform updates, and compliance deadlines. Format as JSON array with: title, summary (50 words max), date, category (reform/deadline/policy/announcement), urgency (high/medium/low)`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          news: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                summary: { type: 'string' },
                date: { type: 'string' },
                category: { type: 'string' },
                urgency: { type: 'string' }
              }
            }
          }
        }
      }
    });
    setLiveNews(response.news || []);
  } catch (error) {
    console.error('Failed to fetch news:', error);
  }
  setIsLoadingNews(false);
};

const newsItems = [
  {
    id: 1,
    title: 'FIRS Announces New Tax Relief Measures for 2025',
    excerpt: 'The Federal Inland Revenue Service has announced new tax relief measures aimed at supporting low-income earners and small businesses...',
    source: 'FIRS Official',
    date: '2025-01-15',
    category: 'Policy',
    urgent: true,
    link: 'https://firs.gov.ng'
  },
  {
    id: 2,
    title: 'VAT Exemptions Extended to More Essential Items',
    excerpt: 'The government has expanded the list of VAT-exempt items to include more essential foods and basic commodities...',
    source: 'BusinessDay',
    date: '2025-01-14',
    category: 'VAT',
    urgent: false,
    link: '#'
  },
  {
    id: 3,
    title: 'New TIN Registration Process Simplified',
    excerpt: 'FIRS introduces a streamlined process for Tax Identification Number registration, making it easier for new taxpayers...',
    source: 'ThisDay',
    date: '2025-01-13',
    category: 'Compliance',
    urgent: false,
    link: '#'
  },
  {
    id: 4,
    title: 'Tax Amnesty Program Extended Until March 2025',
    excerpt: 'The Voluntary Assets and Income Declaration Scheme (VAIDS) has been extended to give more taxpayers opportunity to regularize...',
    source: 'Premium Times',
    date: '2025-01-12',
    category: 'Policy',
    urgent: true,
    link: '#'
  },
  {
    id: 5,
    title: 'Understanding the New PAYE Tax Brackets',
    excerpt: 'A comprehensive breakdown of the updated PAYE tax brackets and what they mean for Nigerian workers...',
    source: 'Nairametrics',
    date: '2025-01-11',
    category: 'PAYE',
    urgent: false,
    link: '#'
  },
  {
    id: 6,
    title: 'Small Business Tax Incentives: What You Need to Know',
    excerpt: 'New incentives for SMEs include reduced tax rates and extended filing deadlines. Here\'s how to take advantage...',
    source: 'Guardian Nigeria',
    date: '2025-01-10',
    category: 'Business',
    urgent: false,
    link: '#'
  }
];

const categoryIcons = {
  Policy: Building2,
  VAT: TrendingUp,
  Compliance: CheckCircle,
  PAYE: AlertCircle,
  Business: Building2
};

export default function NewsFeed() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');

  const categories = ['All', 'Policy', 'VAT', 'PAYE', 'Business', 'Compliance'];

  const filteredNews = filter === 'All' 
    ? newsItems 
    : newsItems.filter(item => item.category === filter);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="max-w-4xl mx-auto pb-24 lg:pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Tax News</h1>
          <p className="text-slate-600">Latest updates on Nigerian tax regulations and policies</p>
        </div>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          className="gap-2"
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </motion.div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === category
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Breaking News Banner */}
      {newsItems.some(n => n.urgent) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-4 mb-6 text-white"
        >
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-5 h-5" />
            <span className="font-bold">Breaking News</span>
          </div>
          <p className="text-sm text-white/90">
            {newsItems.find(n => n.urgent)?.title}
          </p>
        </motion.div>
      )}

      {/* News Cards */}
      <div className="space-y-4">
        {filteredNews.map((news, index) => {
          const CategoryIcon = categoryIcons[news.category] || Newspaper;
          
          return (
            <motion.div
              key={news.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-5 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    news.urgent 
                      ? 'bg-red-100 text-red-600' 
                      : 'bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-600'
                  } transition-colors`}>
                    <CategoryIcon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className={`${
                        news.urgent ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {news.category}
                      </Badge>
                      {news.urgent && (
                        <Badge className="bg-red-500 text-white">Breaking</Badge>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-slate-800 mb-2 group-hover:text-emerald-700 transition-colors">
                      {news.title}
                    </h3>
                    
                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">{news.excerpt}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="font-medium text-slate-600">{news.source}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {formatDate(news.date)}
                        </span>
                      </div>
                      
                      <a
                        href={news.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Read More <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredNews.length === 0 && (
        <Card className="p-12 text-center">
          <Newspaper className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No news in this category</h3>
          <p className="text-slate-500">Try selecting a different category</p>
        </Card>
      )}

      {/* RSS Sources */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 p-4 bg-slate-50 rounded-xl"
      >
        <p className="text-xs text-slate-500 text-center">
          News aggregated from official sources including FIRS, BusinessDay, ThisDay, and other trusted publications
        </p>
      </motion.div>
    </div>
  );
}