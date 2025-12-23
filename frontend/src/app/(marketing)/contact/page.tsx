import { Metadata } from 'next';
import { Phone, Mail, MapPin, Clock, MessageSquare, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { ContactForm } from '@/components/forms/ContactForm';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Contact Us - Get in Touch',
  description:
    'Contact SEI Tech International for health and safety training enquiries. Call us on +44 1233 438817 or email info@seitechinternational.org.uk. Located in Ashford, Kent.',
  openGraph: {
    title: 'Contact SEI Tech International',
    description: 'Get in touch with our team for training enquiries and support.',
  },
};

const contactMethods = [
  {
    icon: Phone,
    title: 'Phone',
    value: siteConfig.contact.phone,
    description: 'Mon-Fri, 9:00 AM - 5:30 PM',
    href: `tel:${siteConfig.contact.phone.replace(/\s/g, '')}`,
  },
  {
    icon: Mail,
    title: 'Email',
    value: siteConfig.contact.email,
    description: 'We aim to respond within 24 hours',
    href: `mailto:${siteConfig.contact.email}`,
  },
  {
    icon: MapPin,
    title: 'Address',
    value: `${siteConfig.contact.address.street}, ${siteConfig.contact.address.city}`,
    description: `${siteConfig.contact.address.postcode}, ${siteConfig.contact.address.country}`,
    href: `https://maps.google.com/?q=${encodeURIComponent(
      `${siteConfig.contact.address.street}, ${siteConfig.contact.address.city}, ${siteConfig.contact.address.postcode}`
    )}`,
  },
];

const faqs = [
  {
    question: 'How quickly will I receive a response?',
    answer:
      'We aim to respond to all enquiries within 24 hours during business days. For urgent matters, please call us directly.',
  },
  {
    question: 'Can I book a course consultation?',
    answer:
      'Yes! We offer free consultations to help you choose the right training for your needs. Mention this in your message.',
  },
  {
    question: 'Do you offer on-site training?',
    answer:
      'Absolutely. We provide on-site training at your premises across the UK. Contact us to discuss your requirements.',
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-20 lg:py-28">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="max-w-3xl">
            <span className="inline-block text-sm font-semibold text-white/90 uppercase tracking-wider mb-4">
              Get in Touch
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Let's Start the Conversation
            </h1>
            <p className="text-xl text-white/90">
              Whether you have a question about our courses, need a quote, or want to discuss your
              training needs, our team is ready to help.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid md:grid-cols-3 gap-8">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <a
                  key={index}
                  href={method.href}
                  target={method.icon === MapPin ? '_blank' : undefined}
                  rel={method.icon === MapPin ? 'noopener noreferrer' : undefined}
                  className="group"
                >
                  <Card variant="elevated" hover>
                    <CardContent className="p-6 text-center">
                      <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-600 transition-colors">
                        <Icon className="h-7 w-7 text-primary-600 group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2">{method.title}</h3>
                      <p className="text-primary-600 font-semibold mb-1">{method.value}</p>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </CardContent>
                  </Card>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-3">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Send Us a Message</h2>
                <p className="text-gray-600">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </div>

              <Card variant="elevated">
                <CardContent className="p-8">
                  <ContactForm />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-2 space-y-8">
              {/* Business Hours */}
              <Card variant="elevated">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                      <Clock className="h-6 w-6 text-primary-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Business Hours</h3>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Monday - Friday</span>
                    <span className="font-semibold text-gray-900">
                      {siteConfig.businessHours.weekdays}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Saturday</span>
                    <span className="font-semibold text-gray-900">
                      {siteConfig.businessHours.saturday}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Sunday</span>
                    <span className="font-semibold text-gray-900">
                      {siteConfig.businessHours.sunday}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card variant="elevated">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-primary-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Quick Links</h3>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <a
                    href="/training"
                    className="block py-2 text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    Browse Training Courses →
                  </a>
                  <a
                    href="/consultancy"
                    className="block py-2 text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    Consultancy Services →
                  </a>
                  <a
                    href="/about"
                    className="block py-2 text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    About Our Company →
                  </a>
                  <a
                    href="/about/accreditations"
                    className="block py-2 text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    Our Accreditations →
                  </a>
                </CardContent>
              </Card>

              {/* Book a Call CTA */}
              <Card variant="elevated" className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white">
                <CardContent className="p-6 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-90" />
                  <h3 className="text-xl font-bold mb-2">Prefer to Talk?</h3>
                  <p className="text-white/90 mb-4 text-sm">
                    Schedule a free consultation call with our team.
                  </p>
                  <a
                    href={`tel:${siteConfig.contact.phone.replace(/\s/g, '')}`}
                    className="inline-block bg-white text-primary-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Call {siteConfig.contact.phone}
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">Quick answers to common enquiries</p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} variant="elevated">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Visit Our Office</h2>
            <p className="text-lg text-gray-600">
              {siteConfig.contact.address.street}, {siteConfig.contact.address.city},{' '}
              {siteConfig.contact.address.postcode}
            </p>
          </div>

          <Card variant="elevated">
            <CardContent className="p-0">
              <div className="aspect-video bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                <div className="text-center p-8">
                  <MapPin className="h-16 w-16 text-primary-600 mx-auto mb-4" />
                  <p className="text-gray-700 font-semibold mb-4">Interactive Map</p>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(
                      `${siteConfig.contact.address.street}, ${siteConfig.contact.address.city}, ${siteConfig.contact.address.postcode}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    Open in Google Maps
                    <MapPin className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
