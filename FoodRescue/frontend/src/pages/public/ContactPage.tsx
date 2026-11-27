import React, { useState } from 'react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { useApp } from '../../contexts/AppContext';

export function ContactPage() {
  const { pushToast, demoMode } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [orgType, setOrgType] = useState('Food Provider');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.includes('@') || message.trim().length < 10) {
      pushToast({
        type: 'error',
        title: 'Please complete all fields',
        message: 'Enter a valid email and message of at least 10 characters.',
      });
      return;
    }
    setSubmitted(true);
    pushToast({
      type: 'success',
      title: demoMode ? 'Inquiry Recorded (DEMO MODE)' : 'Message Sent',
      message: 'Our coordination team will follow up shortly.',
    });
  };

  return (
    <PublicLayout>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#14532D]">
                Contact & Support
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold text-[#1C2520]">
                Connect with the FoodRescue team
              </h1>
              <p className="mt-3 text-sm text-[#4A5950] leading-relaxed">
                Questions about provider onboarding, NGO verification documents, or community pilot
                deployments? Reach out using the form or support desk details below.
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8E4] bg-white p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#14532D] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-[#1C2520]">Support Desk Email</p>
                  <p className="text-sm text-[#4A5950]">support@foodrescue.example</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#14532D] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-[#1C2520]">Rescue Coordination Helpline</p>
                  <p className="text-sm text-[#4A5950]">+91 44 4800 2200 (07:00 AM – 11:00 PM)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#14532D] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-[#1C2520]">Project Coordination Office</p>
                  <p className="text-sm text-[#4A5950]">
                    Department of Computer Science & Social Impact Pilot Hub, Chennai
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-xl border border-[#E2E8E4] bg-white p-6 sm:p-8">
              {submitted ? (
                <div className="py-8 text-center space-y-3">
                  <h2 className="font-display text-xl font-bold text-[#14532D]">
                    Thank you for reaching out
                  </h2>
                  <p className="text-sm text-[#4A5950] max-w-md mx-auto">
                    {demoMode
                      ? 'DEMO MODE: Your message was validated locally in the UI. Connect the Spring Boot contact endpoint for persistent ticketing.'
                      : 'Your support inquiry has been logged.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setName('');
                      setEmail('');
                      setMessage('');
                    }}
                    className="mt-2 rounded-lg bg-[#14532D] px-4 py-2 text-sm font-medium text-white"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="font-display text-xl font-bold text-[#1C2520]">Send a Message</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#1C2520] mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm focus:border-[#14532D] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#1C2520] mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@organization.org"
                        className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm focus:border-[#14532D] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1C2520] mb-1">
                      Inquiry Category
                    </label>
                    <select
                      value={orgType}
                      onChange={(e) => setOrgType(e.target.value)}
                      className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm focus:border-[#14532D] focus:outline-none bg-white"
                    >
                      <option>Food Provider</option>
                      <option>NGO / Charity Partner</option>
                      <option>Campus / Hostel Pilot</option>
                      <option>Technical Integration</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1C2520] mb-1">
                      Message
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="How can our team help?"
                      className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm focus:border-[#14532D] focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#14532D] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0F4022] transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Submit Inquiry
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
