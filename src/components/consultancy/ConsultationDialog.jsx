import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ConsultationDialog({ open, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service_type: '',
    query: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send email notification to consultancy
      await base44.integrations.Core.SendEmail({
        to: 'consultancy@taxreliefng.com', // Replace with actual email
        subject: `New Consultation Request - ${formData.service_type}`,
        body: `
          New consultation request received:
          
          Name: ${formData.name}
          Phone: ${formData.phone}
          Email: ${formData.email}
          Service Type: ${formData.service_type}
          
          Query:
          ${formData.query}
        `
      });

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
        setFormData({ name: '', phone: '', email: '', service_type: '', query: '' });
      }, 3000);
    } catch (error) {
      alert('Failed to submit. Please try WhatsApp instead.');
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        {!submitted ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl text-emerald-900">Book a Consultation</DialogTitle>
              <p className="text-sm text-slate-600">
                Fill in your details and we'll get back to you within 24 hours
              </p>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+234 801 234 5678"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <Label htmlFor="service">Service Needed *</Label>
                <Select
                  required
                  value={formData.service_type}
                  onValueChange={(value) => setFormData({ ...formData, service_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal_filing">Personal Tax Filing</SelectItem>
                    <SelectItem value="business_filing">Business Tax Filing</SelectItem>
                    <SelectItem value="tax_planning">Tax Planning & Optimization</SelectItem>
                    <SelectItem value="exemptions">Exemptions & Reliefs</SelectItem>
                    <SelectItem value="cgt_advice">CGT & Investment Advice</SelectItem>
                    <SelectItem value="paye_compliance">PAYE Compliance</SelectItem>
                    <SelectItem value="appeals">Tax Appeals & Disputes</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="query">Your Query *</Label>
                <Textarea
                  id="query"
                  required
                  value={formData.query}
                  onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                  placeholder="Describe your tax situation or question..."
                  rows={4}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-green-900 mb-2">Request Submitted! ✅</h3>
            <p className="text-slate-600">
              We'll contact you within 24 hours to schedule your consultation.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}