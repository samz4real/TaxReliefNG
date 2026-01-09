import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, ArrowRight, ArrowLeft, Sparkles, FileText, RefreshCw } from 'lucide-react';
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SmallBusinessChecker from '../components/exemptions/SmallBusinessChecker';
import CGTCalculator from '../components/planning/CGTCalculator';
import ExpertHelpSection from '../components/consultancy/ExpertHelpSection';
import ShareButtons from '../components/shared/ShareButtons';

const questions = [
  {
    id: 'income_level',
    question: 'What is your annual gross income?',
    options: [
      { value: 'under_1.2m', label: 'Under ₦1,200,000', points: { paye_exempt: true } },
      { value: '1.2m_5m', label: '₦1,200,000 - ₦5,000,000', points: {} },
      { value: 'over_5m', label: 'Over ₦5,000,000', points: {} }
    ]
  },
  {
    id: 'business_type',
    question: 'Do you own or operate any of these businesses?',
    options: [
      { value: 'agriculture', label: 'Small-scale agriculture/farming', points: { agric_holiday: true } },
      { value: 'tech_startup', label: 'Tech startup (under 4 years old)', points: { startup_relief: true } },
      { value: 'manufacturing', label: 'Manufacturing/export business', points: { pioneer_status: true } },
      { value: 'none', label: 'None of the above', points: {} }
    ]
  },
  {
    id: 'property',
    question: 'Have you sold any property in the last year?',
    options: [
      { value: 'primary_residence', label: 'Yes, my primary residence', points: { cgt_exempt: true } },
      { value: 'investment_property', label: 'Yes, investment property', points: {} },
      { value: 'none', label: 'No property sales', points: {} }
    ]
  },
  {
    id: 'contributions',
    question: 'Which of these contributions do you make?',
    multiple: true,
    options: [
      { value: 'pension', label: 'Pension contributions', points: { pension_relief: true } },
      { value: 'nhf', label: 'National Housing Fund (NHF)', points: { nhf_relief: true } },
      { value: 'nhis', label: 'Health Insurance (NHIS)', points: { nhis_relief: true } },
      { value: 'life_insurance', label: 'Life insurance premiums', points: { insurance_relief: true } }
    ]
  },
  {
    id: 'employees',
    question: 'If you have a business, have you hired new employees recently?',
    options: [
      { value: 'yes_new_hires', label: 'Yes, hired in the last 12 months', points: { hiring_relief: true } },
      { value: 'no_new_hires', label: 'No new hires', points: {} },
      { value: 'no_business', label: "I don't have employees", points: {} }
    ]
  },
  {
    id: 'education',
    question: 'Are you paying for any education services?',
    options: [
      { value: 'yes', label: 'Yes, for myself or dependents', points: { education_vat_exempt: true } },
      { value: 'no', label: 'No', points: {} }
    ]
  }
];

const exemptionDetails = {
  paye_exempt: {
    title: 'PAYE Tax Exemption',
    description: 'You may be exempt from PAYE tax if your annual income is below ₦1.2 million under the new tax reforms.',
    icon: '💰',
    savings: 'Up to ₦84,000/year'
  },
  agric_holiday: {
    title: '5-Year Agricultural Tax Holiday',
    description: 'Small-scale agricultural businesses qualify for a 5-year tax holiday on business income.',
    icon: '🌾',
    savings: 'Complete tax exemption'
  },
  startup_relief: {
    title: 'Tech Startup Tax Relief',
    description: 'Qualified tech startups may receive tax incentives under the National Information Technology Development Agency (NITDA) framework.',
    icon: '💻',
    savings: 'Varies by qualification'
  },
  pioneer_status: {
    title: 'Pioneer Status Incentive',
    description: 'Manufacturing and export businesses may qualify for pioneer status with tax holidays of 3-5 years.',
    icon: '🏭',
    savings: '3-5 years tax holiday'
  },
  cgt_exempt: {
    title: 'CGT Exemption on Home Sale',
    description: 'Capital Gains Tax exemption when you sell your primary residence if you reinvest proceeds in another property within 2 years.',
    icon: '🏠',
    savings: '10% CGT waived'
  },
  pension_relief: {
    title: 'Pension Contribution Relief',
    description: 'Your pension contributions (up to 8% of income) are fully deductible from taxable income.',
    icon: '👴',
    savings: 'Up to 8% income exempt'
  },
  nhf_relief: {
    title: 'NHF Contribution Relief',
    description: 'National Housing Fund contributions (2.5% of basic salary) are tax-deductible.',
    icon: '🏡',
    savings: '2.5% income exempt'
  },
  nhis_relief: {
    title: 'Health Insurance Relief',
    description: 'NHIS contributions are deductible from your taxable income.',
    icon: '🏥',
    savings: 'Full contribution exempt'
  },
  insurance_relief: {
    title: 'Life Insurance Premium Relief',
    description: 'Life insurance premiums paid are deductible from taxable income.',
    icon: '🛡️',
    savings: 'Full premium exempt'
  },
  hiring_relief: {
    title: '50% New Hire Salary Relief',
    description: 'Businesses can deduct 50% of new employee salaries from taxable income for the first year of employment.',
    icon: '👥',
    savings: '50% of new salaries'
  },
  education_vat_exempt: {
    title: 'Education VAT Exemption',
    description: 'Educational services are exempt from VAT under Nigerian tax law.',
    icon: '📚',
    savings: '7.5% VAT waived'
  }
};

export default function ExemptionChecker() {
  const [user, setUser] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedMultiple, setSelectedMultiple] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [eligibleExemptions, setEligibleExemptions] = useState([]);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (option) => {
    if (question.multiple) {
      if (selectedMultiple.includes(option.value)) {
        setSelectedMultiple(prev => prev.filter(v => v !== option.value));
      } else {
        setSelectedMultiple(prev => [...prev, option.value]);
      }
    } else {
      setAnswers(prev => ({ ...prev, [question.id]: option }));
      goToNext();
    }
  };

  const goToNext = () => {
    if (question.multiple && selectedMultiple.length > 0) {
      const selectedOptions = question.options.filter(o => selectedMultiple.includes(o.value));
      const combinedPoints = selectedOptions.reduce((acc, opt) => ({ ...acc, ...opt.points }), {});
      setAnswers(prev => ({ ...prev, [question.id]: { points: combinedPoints } }));
      setSelectedMultiple([]);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      calculateResults();
    }
  };

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateResults = async () => {
    const allPoints = Object.values(answers).reduce((acc, answer) => {
      return { ...acc, ...answer.points };
    }, {});

    const exemptions = Object.keys(allPoints)
      .filter(key => allPoints[key])
      .map(key => ({
        key,
        ...exemptionDetails[key]
      }));

    setEligibleExemptions(exemptions);
    setShowResults(true);

    // Award badge if user found 3+ exemptions
    if (user && exemptions.length >= 3) {
      const existingBadge = await base44.entities.UserBadge.filter({
        user_email: user.email,
        badge_type: 'exemption_expert'
      });
      if (existingBadge.length === 0) {
        await base44.entities.UserBadge.create({
          user_email: user.email,
          badge_type: 'exemption_expert',
          earned_date: new Date().toISOString().split('T')[0]
        });
        toast.success('✅ Badge earned: Exemption Expert!');
      }
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setSelectedMultiple([]);
    setShowResults(false);
    setEligibleExemptions([]);
  };

  const PersonalExemptionQuiz = () => {
    if (showResults) {
      return (
        <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Your Eligible Exemptions</h1>
          <p className="text-slate-600">
            Based on your answers, you may qualify for {eligibleExemptions.length} tax relief{eligibleExemptions.length !== 1 ? 's' : ''}
          </p>
        </motion.div>

        {eligibleExemptions.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {eligibleExemptions.map((exemption, index) => (
                <motion.div
                  key={exemption.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-5 h-full border-emerald-200 bg-gradient-to-br from-white to-emerald-50">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{exemption.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                          <h3 className="font-semibold text-slate-800">{exemption.title}</h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{exemption.description}</p>
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                          Potential savings: {exemption.savings}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
            
            {/* Share Buttons */}
            <div className="mb-6">
              <ShareButtons />
            </div>

            {/* Expert Help CTA */}
            <div className="mb-8">
              <ExpertHelpSection compact />
            </div>
          </>
        ) : (
          <Card className="p-8 text-center mb-8">
            <XCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No Special Exemptions Found</h3>
            <p className="text-slate-500">
              Based on your answers, you may not qualify for additional exemptions beyond the standard reliefs.
              However, you can still use our calculator to optimize your deductions!
            </p>
          </Card>
        )}

        <div className="flex justify-center gap-4">
          <Button onClick={resetQuiz} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" /> Check Again
          </Button>
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <FileText className="w-4 h-4" /> View Detailed Guides
          </Button>
        </div>
      </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Exemption Checker</h1>
        <p className="text-slate-600">Answer a few questions to find tax reliefs you qualify for</p>
      </motion.div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-slate-500 mb-2">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-6">{question.question}</h2>
            
            {question.multiple && (
              <p className="text-sm text-slate-500 mb-4">Select all that apply</p>
            )}

            <div className="space-y-3">
              {question.options.map((option) => {
                const isSelected = question.multiple 
                  ? selectedMultiple.includes(option.value)
                  : answers[question.id]?.value === option.value;

                return (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(option)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.label}</span>
                      {isSelected && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={goToPrevious}
          disabled={currentQuestion === 0}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Previous
        </Button>

        {question.multiple && (
          <Button
            onClick={goToNext}
            disabled={selectedMultiple.length === 0}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            {currentQuestion === questions.length - 1 ? 'See Results' : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto pb-24 lg:pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-800 mb-2">TaxRelief NG – Tax Exemptions & Reliefs Checker</h1>
          <p className="text-slate-600">Your Trusted 2026 Tax Relief Experts – Free Tools + Certified Consultancy 🇳🇬</p>
          <div className="mt-3 p-4 bg-amber-50 border-2 border-amber-300 rounded-lg">
            <p className="text-sm font-semibold text-amber-900">
              <strong>⚠️ DISCLAIMER:</strong> All calculations are estimates based on Nigeria Tax Act 2025. Not official tax advice – consult NRS or TaxRelief NG professionals for personalized guidance.
            </p>
          </div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="personal">Personal Exemptions</TabsTrigger>
            <TabsTrigger value="business">Small Business</TabsTrigger>
            <TabsTrigger value="cgt">CGT & Reliefs</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <PersonalExemptionQuiz />
          </TabsContent>

          <TabsContent value="business">
            <SmallBusinessChecker />
          </TabsContent>

          <TabsContent value="cgt">
            <CGTCalculator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}