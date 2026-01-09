import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, BookOpen, ExternalLink, Clock, TrendingUp, 
  Home as HomeIcon, Building2, Briefcase, GraduationCap, Leaf
} from 'lucide-react';

const guides = [
  {
    id: 1,
    category: 'PAYE',
    title: 'Understanding PAYE Tax Exemption for Low Earners',
    excerpt: 'Learn about the ₦1.2 million annual income threshold and how it affects your tax obligations under the new reforms.',
    readTime: '5 min',
    icon: TrendingUp,
    tags: ['exemption', 'low income', 'paye'],
    link: '#'
  },
  {
    id: 2,
    category: 'CGT',
    title: 'Capital Gains Tax Exemption on Home Sales',
    excerpt: 'Selling your primary residence? Discover how to qualify for CGT exemption and the reinvestment requirements.',
    readTime: '7 min',
    icon: HomeIcon,
    tags: ['property', 'cgt', 'exemption'],
    link: '#'
  },
  {
    id: 3,
    category: 'VAT',
    title: 'VAT Waivers on Education and Basic Foods',
    excerpt: 'Complete guide to understanding which educational services and food items are exempt from VAT.',
    readTime: '4 min',
    icon: GraduationCap,
    tags: ['vat', 'education', 'food'],
    link: '#'
  },
  {
    id: 4,
    category: 'Business',
    title: 'Pioneer Status and Tax Holidays for Businesses',
    excerpt: 'How manufacturing and export businesses can qualify for 3-5 year tax holidays under pioneer status.',
    readTime: '8 min',
    icon: Building2,
    tags: ['business', 'pioneer', 'holiday'],
    link: '#'
  },
  {
    id: 5,
    category: 'Agriculture',
    title: '5-Year Tax Holiday for Agricultural Businesses',
    excerpt: 'Small-scale farmers and agribusinesses can enjoy complete tax exemption. Learn how to qualify.',
    readTime: '6 min',
    icon: Leaf,
    tags: ['agriculture', 'farming', 'exemption'],
    link: '#'
  },
  {
    id: 6,
    category: 'Employment',
    title: '50% Relief on New Employee Salaries',
    excerpt: 'Businesses can deduct 50% of new hire salaries from taxable income. Here\'s how it works.',
    readTime: '5 min',
    icon: Briefcase,
    tags: ['business', 'employment', 'relief'],
    link: '#'
  },
  {
    id: 7,
    category: 'Deductions',
    title: 'Maximizing Your Tax Deductions: Complete Guide',
    excerpt: 'From pension to rent relief—learn about all available deductions and how to claim them.',
    readTime: '10 min',
    icon: BookOpen,
    tags: ['deductions', 'pension', 'nhf', 'rent'],
    link: '#'
  },
  {
    id: 8,
    category: 'Filing',
    title: 'Annual Tax Return: Step-by-Step Guide',
    excerpt: 'Everything you need to know about filing your annual tax return with FIRS.',
    readTime: '12 min',
    icon: BookOpen,
    tags: ['filing', 'firs', 'deadline'],
    link: '#'
  }
];

const categories = ['All', 'PAYE', 'CGT', 'VAT', 'Business', 'Agriculture', 'Employment', 'Deductions', 'Filing'];

export default function Guides() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredGuides = guides.filter(guide => {
    const matchesSearch = 
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = activeCategory === 'All' || guide.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto pb-24 lg:pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-slate-800 mb-2">TaxRelief NG – Tax Guides & FAQs</h1>
        <p className="text-slate-600">Your Trusted 2026 Tax Relief Experts – Free Tools + Certified Consultancy 🇳🇬</p>
        <div className="mt-3 p-4 bg-amber-50 border-2 border-amber-300 rounded-lg">
          <p className="text-sm font-semibold text-amber-900">
            <strong>⚠️ DISCLAIMER:</strong> All calculations are estimates based on Nigeria Tax Act 2025. Not official tax advice – consult NRS or TaxRelief NG professionals for personalized guidance.
          </p>
        </div>
      </motion.div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          type="text"
          placeholder="Search guides, topics, or keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12 text-lg border-slate-200 rounded-xl"
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeCategory === category
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Guides Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredGuides.map((guide, index) => (
          <motion.div
            key={guide.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="h-full p-6 hover:shadow-lg transition-all duration-300 group cursor-pointer border-slate-200 hover:border-emerald-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                  <guide.icon className="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                      {guide.category}
                    </Badge>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {guide.readTime}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2 group-hover:text-emerald-700 transition-colors">
                    {guide.title}
                  </h3>
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">{guide.excerpt}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {guide.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-1 bg-slate-50 text-slate-500 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <ExternalLink className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors flex-shrink-0" />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredGuides.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No guides found</h3>
          <p className="text-slate-500">Try a different search term or category</p>
        </div>
      )}

      {/* Official Resources */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-12 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white"
      >
        <h2 className="text-xl font-bold mb-4">Official Resources</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <a href="https://firs.gov.ng" target="_blank" rel="noopener noreferrer" 
             className="flex items-center gap-3 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
            <ExternalLink className="w-5 h-5" />
            <div>
              <p className="font-medium">FIRS Website</p>
              <p className="text-xs text-slate-300">Federal Inland Revenue Service</p>
            </div>
          </a>
          <a href="https://taxpromax.firs.gov.ng" target="_blank" rel="noopener noreferrer" 
             className="flex items-center gap-3 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
            <ExternalLink className="w-5 h-5" />
            <div>
              <p className="font-medium">TaxProMax Portal</p>
              <p className="text-xs text-slate-300">Online tax filing</p>
            </div>
          </a>
          <a href="https://nimc.gov.ng" target="_blank" rel="noopener noreferrer" 
             className="flex items-center gap-3 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
            <ExternalLink className="w-5 h-5" />
            <div>
              <p className="font-medium">NIMC</p>
              <p className="text-xs text-slate-300">National ID & TIN</p>
            </div>
          </a>
        </div>
      </motion.div>
    </div>
  );
}