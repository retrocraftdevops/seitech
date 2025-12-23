'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    // Success
    setStatus('success');
    setMessage('Thank you for subscribing! Check your inbox for confirmation.');
    setEmail('');

    // Reset status after 5 seconds
    setTimeout(() => {
      setStatus('idle');
      setMessage('');
    }, 5000);
  };

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] bg-repeat" />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500/20 rounded-full mb-6">
            <Mail className="h-8 w-8 text-primary-400" />
          </div>

          {/* Heading */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Stay Updated with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">
              Industry Insights
            </span>
          </h2>

          {/* Subheading */}
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Get the latest news, training updates, compliance tips, and exclusive offers
            delivered directly to your inbox
          </p>

          {/* Newsletter Form */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-grow">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === 'loading' || status === 'success'}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-12"
                  required
                />
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={status === 'loading' || status === 'success'}
                className="whitespace-nowrap"
              >
                {status === 'loading' ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Subscribing...
                  </>
                ) : status === 'success' ? (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Subscribed!
                  </>
                ) : (
                  'Subscribe'
                )}
              </Button>
            </div>

            {/* Status Message */}
            {message && (
              <motion.div
                className={`mt-4 p-4 rounded-xl flex items-start gap-3 ${
                  status === 'success'
                    ? 'bg-green-500/20 border border-green-500/30'
                    : 'bg-red-500/20 border border-red-500/30'
                }`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {status === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <p
                  className={`text-sm ${
                    status === 'success' ? 'text-green-100' : 'text-red-100'
                  }`}
                >
                  {message}
                </p>
              </motion.div>
            )}
          </form>

          {/* Privacy Note */}
          <p className="text-sm text-gray-400 mb-8">
            We respect your privacy. Unsubscribe at any time.
          </p>

          {/* Benefits */}
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              {
                icon: Sparkles,
                title: 'Exclusive Content',
                description: 'Industry insights and safety tips',
              },
              {
                icon: Mail,
                title: 'Course Updates',
                description: 'New training programs and offers',
              },
              {
                icon: CheckCircle,
                title: 'Compliance News',
                description: 'Regulatory changes and updates',
              },
            ].map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Icon className="h-6 w-6 text-primary-400 mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-1">{benefit.title}</h3>
                  <p className="text-gray-400 text-sm">{benefit.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
