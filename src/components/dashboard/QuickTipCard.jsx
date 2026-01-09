import React from 'react';
import { Lightbulb, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const tips = [
  {
    title: "PAYE Exemption",
    description: "Earn under ₦1.2M/year? You might be exempt from PAYE tax!",
    color: "from-emerald-500 to-teal-500"
  },
  {
    title: "Rent Relief",
    description: "Claim up to ₦500,000 annually in rent relief deductions.",
    color: "from-blue-500 to-indigo-500"
  },
  {
    title: "Pension Benefits",
    description: "Your pension contributions reduce taxable income by up to 8%.",
    color: "from-purple-500 to-pink-500"
  },
  {
    title: "Agriculture Tax Holiday",
    description: "Small agric businesses enjoy a 5-year tax holiday!",
    color: "from-amber-500 to-orange-500"
  }
];

export default function QuickTipCard() {
  const [currentTip, setCurrentTip] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const tip = tips[currentTip];

  return (
    <motion.div
      key={currentTip}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${tip.color} p-6 text-white shadow-xl`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Lightbulb className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium text-white/80">Quick Tip</span>
        </div>
        
        <h3 className="text-xl font-bold mb-2">{tip.title}</h3>
        <p className="text-white/90 text-sm mb-4">{tip.description}</p>
        
        <button className="flex items-center gap-2 text-sm font-medium bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all">
          Learn More <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute bottom-4 right-4 flex gap-1">
        {tips.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentTip(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === currentTip ? 'bg-white w-6' : 'bg-white/40'
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}