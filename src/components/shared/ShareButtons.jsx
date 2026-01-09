import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, MessageCircle, Twitter } from 'lucide-react';

export default function ShareButtons({ savings = null }) {
  const handleShare = (platform) => {
    const savingsText = savings && savings > 0 
      ? `Saved ₦${savings.toLocaleString()} with TaxRelief NG! Check yours: taxrelief.ng 🇳🇬`
      : 'Just calculated my tax relief with TaxRelief NG! Check yours: taxrelief.ng 🇳🇬';
    
    const url = 'https://taxrelief.ng';
    
    const shareUrls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(savingsText)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(savingsText)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(savingsText)}`
    };

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-semibold text-purple-900 mb-1 flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share Your Relief Results
            </h4>
            <p className="text-sm text-purple-700">
              {savings && savings > 0 
                ? `You saved ₦${savings.toLocaleString()}! Share the good news 🎉`
                : 'Help others discover TaxRelief NG'}
            </p>
            <p className="text-xs text-purple-600 mt-1">💎 Share & get priority consultation</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => handleShare('whatsapp')}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              WhatsApp
            </Button>
            <Button
              onClick={() => handleShare('twitter')}
              size="sm"
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Twitter className="w-4 h-4 mr-1" />
              Twitter
            </Button>
            <Button
              onClick={() => handleShare('facebook')}
              size="sm"
              className="bg-blue-700 hover:bg-blue-800"
            >
              Share
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}