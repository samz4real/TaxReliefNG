import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Phone, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const services = [
  { icon: '📋', label: 'Tax Filing & Returns' },
  { icon: '✅', label: 'Exemption Claims' },
  { icon: '💼', label: 'PAYE Setup' },
  { icon: '📈', label: 'CGT Planning' },
  { icon: '🚢', label: 'Import Duty Advice' }
];

export default function ExpertHelpSection({ compact = false }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    type: 'personal',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await base44.integrations.Core.SendEmail({
        to: 'contact@taxrelief.ng',
        subject: `New Consultation Request from ${formData.name}`,
        body: `
          Name: ${formData.name}
          Phone: ${formData.phone}
          Email: ${formData.email}
          Type: ${formData.type === 'personal' ? 'Personal Tax' : 'Business Tax'}
          
          Message:
          ${formData.message}
        `
      });

      setSubmitted(true);
    } catch (error) {
      alert('Failed to send request. Please try WhatsApp or call us directly.');
    }
    setIsSubmitting(false);
  };

  const whatsappUrl = `https://wa.me/2348012345678?text=${encodeURIComponent('Hi! I need tax consultation help.')}`;

  if (compact) {
    return (
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-emerald-900 mb-1">Need Expert Help?</h4>
              <p className="text-sm text-emerald-700">Consult certified tax professionals</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => window.open(whatsappUrl, '_blank')}
                className="bg-green-600 hover:bg-green-700 gap-2"
                size="sm"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (submitted) {
    return (
      <Card className="border-2 border-green-500 shadow-lg">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-green-900 mb-2">Request Received!</h3>
          <p className="text-green-800 mb-4">Our team will contact you within 24 hours.</p>
          <Button 
            onClick={() => setSubmitted(false)}
            variant="outline"
          >
            Submit Another Request
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-emerald-500 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          <span className="text-emerald-900">Get Personalized TaxRelief NG Help</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div>
          <h4 className="font-semibold text-slate-800 mb-3">Our certified tax professionals can help with:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {services.map((service, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <span className="text-xl">{service.icon}</span>
                <span className="text-slate-700">{service.label}</span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Full Name *</Label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label>Phone Number *</Label>
              <Input
                required
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+234 800 000 0000"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Email *</Label>
              <Input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <Label>Consultation Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal Tax</SelectItem>
                  <SelectItem value="business">Business Tax</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Message / Tax Issue</Label>
            <Textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Describe your tax situation or question..."
              rows={3}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? 'Sending...' : 'Request Consultation'}
            </Button>
            <Button 
              type="button"
              onClick={() => window.open(whatsappUrl, '_blank')}
              className="flex-1 h-12 bg-green-600 hover:bg-green-700 gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp Expert
            </Button>
            <Button 
              type="button"
              onClick={() => window.location.href = 'tel:+2348012345678'}
              className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 gap-2"
            >
              <Phone className="w-5 h-5" />
              Call Expert
            </Button>
          </div>

          <p className="text-xs text-center text-slate-500">
            📧 contact@taxrelief.ng | Available Mon-Sat, 9AM-6PM
          </p>
        </form>
      </CardContent>
    </Card>
  );
}