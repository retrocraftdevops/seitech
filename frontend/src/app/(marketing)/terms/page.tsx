import { Metadata } from 'next';
import Link from 'next/link';
import { FileText, Shield, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description:
    'Terms and conditions for using SEI Tech International services, including training courses and consultancy services.',
  robots: {
    index: true,
    follow: true,
  },
};

const sections = [
  {
    title: '1. Introduction',
    content: [
      'These Terms and Conditions govern your use of the SEI Tech International website and services. By accessing our website or using our services, you agree to be bound by these terms.',
      `SEI Tech International ("we", "us", "our") is a provider of health, safety, and environmental training and consultancy services, located at ${siteConfig.contact.address.street}, ${siteConfig.contact.address.city}, ${siteConfig.contact.address.postcode}.`,
    ],
  },
  {
    title: '2. Services',
    content: [
      'We provide a range of training courses and consultancy services in health, safety, and environmental management. All courses are subject to availability and may be modified or cancelled at our discretion.',
      'Course descriptions, prices, and availability are subject to change without notice. We reserve the right to refuse service to anyone for any reason at any time.',
    ],
  },
  {
    title: '3. Booking and Payment',
    content: [
      'All bookings must be confirmed in writing (email or booking form). A booking is only confirmed once payment has been received or a purchase order has been accepted.',
      'Payment is due in full before the commencement of the course unless alternative arrangements have been agreed in writing. We accept payment by bank transfer, credit/debit card, or purchase order from approved corporate clients.',
      'Prices are quoted exclusive of VAT unless otherwise stated. VAT will be charged at the prevailing rate.',
    ],
  },
  {
    title: '4. Cancellations and Refunds',
    content: [
      'Cancellations made more than 14 days before the course start date will receive a full refund or credit note.',
      'Cancellations made between 7-14 days before the course start date will receive a 50% refund or credit note.',
      'Cancellations made less than 7 days before the course start date are non-refundable, but delegates may be transferred to an alternative date subject to availability.',
      'We reserve the right to cancel courses due to insufficient bookings or unforeseen circumstances. In such cases, a full refund will be provided, or delegates may transfer to an alternative date.',
    ],
  },
  {
    title: '5. Course Attendance',
    content: [
      'Delegates must attend all sessions of a course to be eligible for certification. Late arrival or early departure may result in certification being withheld.',
      'Delegates are expected to behave professionally and respectfully. We reserve the right to remove any delegate whose behavior is disruptive or inappropriate, without refund.',
      'For e-learning courses, delegates must complete all modules and assessments within the specified timeframe to receive certification.',
    ],
  },
  {
    title: '6. Certification',
    content: [
      'Certificates are issued upon successful completion of course requirements, including attendance, participation, and passing any required assessments.',
      'Certificates are issued by the relevant accrediting body (IOSH, Qualsafe, NEBOSH, ProQual) and are subject to their terms and conditions.',
      'Lost or damaged certificates can be replaced for a fee. Requests for replacement certificates must be made in writing.',
    ],
  },
  {
    title: '7. Intellectual Property',
    content: [
      'All course materials, content, and resources provided are the property of SEI Tech International or the respective accrediting bodies and are protected by copyright.',
      'Course materials are provided for personal use only and may not be reproduced, distributed, or used for commercial purposes without written permission.',
      'Delegates may not record, photograph, or share course content without prior authorization.',
    ],
  },
  {
    title: '8. Liability',
    content: [
      'While we take every care to ensure the accuracy of our training content, we do not warrant that the information is complete, accurate, or up-to-date.',
      'We accept no liability for any loss, damage, or injury arising from participation in our courses or implementation of advice provided, except where liability cannot be excluded by law.',
      'Our total liability for any claim arising from our services shall not exceed the fees paid for those services.',
      'Delegates participate in practical exercises at their own risk. We recommend that delegates have appropriate insurance coverage.',
    ],
  },
  {
    title: '9. Consultancy Services',
    content: [
      'Consultancy services are provided based on agreed terms of engagement, which will be set out in a separate contract or proposal.',
      'All recommendations and advice are based on information provided by the client. We cannot guarantee specific outcomes or compliance with regulations.',
      'Clients are responsible for implementing our recommendations and ensuring ongoing compliance with relevant legislation.',
    ],
  },
  {
    title: '10. Data Protection',
    content: [
      'We process personal data in accordance with the UK General Data Protection Regulation (GDPR) and Data Protection Act 2018.',
      'For full details on how we collect, use, and protect your personal data, please see our Privacy Policy.',
    ],
  },
  {
    title: '11. Website Use',
    content: [
      'You may use our website for lawful purposes only. You must not use our website in any way that causes, or may cause, damage to the website or impairment of its availability or accessibility.',
      'We reserve the right to suspend or terminate access to our website at any time without notice.',
      'Links to third-party websites are provided for convenience only. We are not responsible for the content of external sites.',
    ],
  },
  {
    title: '12. Complaints',
    content: [
      `If you have a complaint about our services, please contact us in writing at ${siteConfig.contact.email} or ${siteConfig.contact.address.street}, ${siteConfig.contact.address.city}, ${siteConfig.contact.address.postcode}.`,
      'We will acknowledge your complaint within 5 working days and aim to resolve it within 28 days.',
      'If you are not satisfied with our response, you may escalate your complaint to the relevant accrediting body.',
    ],
  },
  {
    title: '13. Changes to Terms',
    content: [
      'We reserve the right to modify these terms at any time. Changes will be posted on this page with an updated revision date.',
      'Continued use of our services after changes are posted constitutes acceptance of the modified terms.',
    ],
  },
  {
    title: '14. Governing Law',
    content: [
      'These terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.',
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-20 lg:py-28">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-10 w-10" />
              <span className="inline-block text-sm font-semibold text-white/90 uppercase tracking-wider">
                Legal
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Terms & Conditions
            </h1>
            <p className="text-xl text-white/90">
              Please read these terms carefully before using our services. Last updated: December
              2024.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-8 bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Jump to section:</p>
            <div className="flex gap-4">
              <Link
                href="/privacy"
                className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
              >
                Privacy Policy
              </Link>
              <Link
                href="/contact"
                className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <Card variant="elevated" className="border-l-4 border-l-primary-600">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <AlertCircle className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Important Notice</h2>
                  <p className="text-gray-700">
                    By booking any of our courses or services, you agree to these terms and
                    conditions. If you have any questions or concerns, please contact us at{' '}
                    <a
                      href={`mailto:${siteConfig.contact.email}`}
                      className="text-primary-600 hover:text-primary-700 font-semibold"
                    >
                      {siteConfig.contact.email}
                    </a>{' '}
                    before proceeding with your booking.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="prose prose-lg max-w-none">
            {sections.map((section, index) => (
              <div key={index} className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
                <div className="space-y-4">
                  {section.content.map((paragraph, pIndex) => (
                    <p key={pIndex} className="text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Information */}
          <div className="mt-16 pt-12 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
            <Card variant="ghost">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">SEI Tech International</h3>
                    <p className="text-gray-600">
                      {siteConfig.contact.address.street}
                      <br />
                      {siteConfig.contact.address.city}, {siteConfig.contact.address.county}
                      <br />
                      {siteConfig.contact.address.postcode}
                      <br />
                      {siteConfig.contact.address.country}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Get in Touch</h3>
                    <p className="text-gray-600">
                      Email:{' '}
                      <a
                        href={`mailto:${siteConfig.contact.email}`}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        {siteConfig.contact.email}
                      </a>
                      <br />
                      Phone:{' '}
                      <a
                        href={`tel:${siteConfig.contact.phone.replace(/\s/g, '')}`}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        {siteConfig.contact.phone}
                      </a>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <Shield className="h-16 w-16 text-primary-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Have Questions About Our Terms?
          </h2>
          <p className="text-gray-600 mb-8">
            Our team is here to help clarify any points or answer your questions.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
}
