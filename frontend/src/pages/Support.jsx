import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DashboardLayout } from '../components/DashboardLayout';
import { Mail, Phone, Send, ChevronDown } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '../components/ui/accordion';

const faqs = [
  { q: 'What is Chiptuning?', a: 'Chiptuning involves modifying the software on your vehicle’s Engine Control Unit (ECU) to enhance performance, increase power, and improve fuel efficiency.' },
  { q: 'How long does processing take?', a: 'Average turnaround is 5 minutes during business hours. Complex files may take up to a few hours.' },
  { q: 'Are the files Dyno-tested?', a: 'Yes, all our files are tested on a dynamometer to ensure quality and reliability.' },
  { q: 'Can I revert to the original software?', a: 'Yes, in most cases your vehicle can be reverted to its original software.' },
  { q: 'What types of files do you offer?', a: 'We offer Master files, Slave files (encrypted), and EVC files (pre-existing software).' },
  { q: 'How do credits work?', a: 'Each file you submit costs a number of credits depending on the vehicle and tuning options selected. You can buy credits from the Credits page.' },
];

export const Support = () => {
  const { t } = useApp();
  const { toast } = useToast();
  const [form, setForm] = useState({ subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.subject || !form.message) return;
    toast({ title: 'Message sent', description: 'We\'ll get back to you within 24 hours.' });
    setForm({ subject: '', message: '' });
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl">
        <h1 className="text-2xl lg:text-3xl font-bold text-fct-dark mb-2">{t('support')}</h1>
        <p className="text-fct-muted mb-6">We're here to help.</p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <a href="mailto:info@fast-chiptuningfiles.com" className="bg-white rounded p-6 shadow-sm border border-gray-100 hover:border-fct-orange flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
              <Mail className="w-6 h-6 text-fct-orange" />
            </div>
            <div>
              <div className="font-semibold text-fct-dark">Email</div>
              <div className="text-sm text-fct-muted">info@fast-chiptuningfiles.com</div>
            </div>
          </a>
          <a href="tel:+31787830013" className="bg-white rounded p-6 shadow-sm border border-gray-100 hover:border-fct-orange flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
              <Phone className="w-6 h-6 text-fct-orange" />
            </div>
            <div>
              <div className="font-semibold text-fct-dark">Phone</div>
              <div className="text-sm text-fct-muted">+31 78 783 00 13</div>
            </div>
          </a>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="font-semibold text-fct-dark mb-4">{t('contactSupport')}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-fct-dark mb-1.5">{t('subject')}</label>
              <input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-fct-orange focus:ring-1 focus:ring-fct-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-fct-dark mb-1.5">{t('message')}</label>
              <textarea
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-fct-orange focus:ring-1 focus:ring-fct-orange"
              />
            </div>
            <button type="submit" className="bg-fct-orange hover:bg-[#D45F25] text-white font-semibold px-5 py-2.5 rounded flex items-center gap-2">
              <Send className="w-4 h-4" />{t('sendMessage')}
            </button>
          </div>
        </form>

        <div className="bg-white rounded shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-fct-dark mb-4">{t('faq')}</h2>
          <Accordion type="single" collapsible>
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-sm font-medium">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-fct-muted">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Support;
