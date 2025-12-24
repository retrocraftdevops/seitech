import { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Lock, Eye, UserCheck, Database, Cookie, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Privacy policy for SEI Tech International. Learn how we collect, use, and protect your personal data in accordance with UK GDPR and Data Protection Act 2018.',
  robots: {
    index: true,
    follow: true,
  },
};

const sections = [
  {
    icon: Shield,
    title: '1. Introduction',
    content: [
      `SEI Tech International ("we", "us", "our") is committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, store, and protect your information when you use our website and services.`,
      'We are the data controller responsible for your personal data. Our contact details are provided at the end of this policy.',
      'This policy complies with the UK General Data Protection Regulation (GDPR) and the Data Protection Act 2018.',
    ],
  },
  {
    icon: Database,
    title: '2. Information We Collect',
    content: [
      'We collect and process the following types of personal data:',
      '<strong>Contact Information:</strong> Name, email address, phone number, postal address, and company name.',
      '<strong>Course Information:</strong> Course bookings, attendance records, assessment results, and certification details.',
      '<strong>Payment Information:</strong> Billing address and payment details (processed securely by our payment provider).',
      '<strong>Technical Information:</strong> IP address, browser type, device information, and website usage data collected through cookies.',
      '<strong>Communications:</strong> Records of correspondence with you, including emails, phone calls, and contact form submissions.',
    ],
  },
  {
    icon: UserCheck,
    title: '3. How We Use Your Information',
    content: [
      'We use your personal data for the following purposes:',
      '<strong>Service Delivery:</strong> To provide training courses, consultancy services, and issue certifications.',
      '<strong>Communication:</strong> To respond to enquiries, send course confirmations, and provide customer support.',
      '<strong>Marketing:</strong> To send information about our courses and services (only with your consent).',
      '<strong>Legal Compliance:</strong> To comply with legal obligations, including maintaining training records required by accrediting bodies.',
      '<strong>Website Improvement:</strong> To analyze website usage and improve our services.',
    ],
  },
  {
    icon: Lock,
    title: '4. Legal Basis for Processing',
    content: [
      'We process your personal data under the following legal bases:',
      '<strong>Contract Performance:</strong> Processing necessary to fulfill our contract with you (e.g., delivering training).',
      '<strong>Legal Obligation:</strong> Processing required to comply with legal requirements (e.g., maintaining training records).',
      '<strong>Legitimate Interests:</strong> Processing necessary for our legitimate business interests (e.g., improving services).',
      '<strong>Consent:</strong> Processing based on your explicit consent (e.g., marketing communications).',
    ],
  },
  {
    icon: Eye,
    title: '5. Sharing Your Information',
    content: [
      'We may share your personal data with:',
      // TODO: Re-enable NEBOSH once licensing agreement is in place
      // '<strong>Accrediting Bodies:</strong> IOSH, Qualsafe, NEBOSH, and ProQual for certification and quality assurance purposes.',
      '<strong>Accrediting Bodies:</strong> IOSH, Qualsafe, and ProQual for certification and quality assurance purposes.',
      '<strong>Service Providers:</strong> Third-party providers who assist with payment processing, email communications, and website hosting.',
      '<strong>Legal Authorities:</strong> When required by law or to protect our legal rights.',
      'We do not sell or rent your personal data to third parties for marketing purposes.',
      'When sharing data with third parties, we ensure they have appropriate security measures in place and process data in accordance with GDPR.',
    ],
  },
  {
    icon: Database,
    title: '6. Data Retention',
    content: [
      'We retain your personal data for as long as necessary to fulfill the purposes outlined in this policy:',
      '<strong>Training Records:</strong> Retained for a minimum of 3 years as required by accrediting bodies, or longer if required by law.',
      '<strong>Financial Records:</strong> Retained for 7 years in accordance with UK tax law.',
      '<strong>Marketing Data:</strong> Retained until you withdraw consent or we determine it is no longer relevant.',
      '<strong>Website Analytics:</strong> Typically retained for 26 months.',
      'After the retention period, we will securely delete or anonymize your data.',
    ],
  },
  {
    icon: Shield,
    title: '7. Data Security',
    content: [
      'We implement appropriate technical and organizational measures to protect your personal data from unauthorized access, loss, or misuse:',
      'Secure encrypted connections (SSL/TLS) for data transmission',
      'Regular security assessments and updates',
      'Access controls limiting data access to authorized personnel only',
      'Secure backup procedures',
      'Staff training on data protection',
      'While we take all reasonable precautions, no internet transmission is completely secure. You should take steps to protect your own data, such as using strong passwords.',
    ],
  },
  {
    icon: Cookie,
    title: '8. Cookies and Tracking',
    content: [
      'Our website uses cookies to improve your experience and analyze website usage. Cookies are small text files stored on your device.',
      '<strong>Essential Cookies:</strong> Required for website functionality (e.g., session management).',
      '<strong>Analytics Cookies:</strong> Help us understand how visitors use our website (e.g., Google Analytics).',
      '<strong>Marketing Cookies:</strong> Used to deliver relevant advertisements (only with your consent).',
      'You can control cookie settings through your browser preferences. Disabling cookies may affect website functionality.',
    ],
  },
  {
    icon: UserCheck,
    title: '9. Your Rights',
    content: [
      'Under UK GDPR, you have the following rights:',
      '<strong>Right of Access:</strong> Request a copy of your personal data.',
      '<strong>Right to Rectification:</strong> Request correction of inaccurate data.',
      '<strong>Right to Erasure:</strong> Request deletion of your data (subject to legal obligations).',
      '<strong>Right to Restrict Processing:</strong> Request limitation of how we use your data.',
      '<strong>Right to Data Portability:</strong> Request transfer of your data to another organization.',
      '<strong>Right to Object:</strong> Object to processing based on legitimate interests or for marketing purposes.',
      '<strong>Right to Withdraw Consent:</strong> Withdraw consent at any time where processing is based on consent.',
      `To exercise any of these rights, please contact us at ${siteConfig.contact.email}. We will respond within one month.`,
    ],
  },
  {
    icon: Mail,
    title: '10. Marketing Communications',
    content: [
      'We may send you marketing communications about our courses and services if:',
      'You have opted in to receive marketing emails, or',
      'You are an existing customer and the communications relate to similar services',
      'You can unsubscribe from marketing emails at any time by:',
      'Clicking the "unsubscribe" link in any marketing email',
      `Contacting us at ${siteConfig.contact.email}`,
      'Updating your preferences in your account settings (if applicable)',
    ],
  },
  {
    icon: Shield,
    title: '11. Third-Party Links',
    content: [
      'Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites.',
      'We recommend reviewing the privacy policies of any third-party websites you visit.',
    ],
  },
  {
    icon: Database,
    title: '12. International Data Transfers',
    content: [
      'We primarily store and process data within the United Kingdom. If we transfer data outside the UK, we ensure appropriate safeguards are in place, such as:',
      'Standard contractual clauses approved by the UK authorities',
      'Transfers to countries with adequate data protection laws',
      'Other appropriate safeguards as required by UK GDPR',
    ],
  },
  {
    icon: UserCheck,
    title: '13. Children\'s Privacy',
    content: [
      'Our services are not intended for individuals under 16 years of age. We do not knowingly collect personal data from children.',
      'If we become aware that we have collected data from a child, we will take steps to delete it promptly.',
    ],
  },
  {
    icon: Shield,
    title: '14. Changes to This Policy',
    content: [
      'We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements.',
      'We will notify you of significant changes by posting a notice on our website or sending an email.',
      'The "Last Updated" date at the top of this policy indicates when it was last revised.',
    ],
  },
  {
    icon: Mail,
    title: '15. Contact Us & Complaints',
    content: [
      'If you have any questions about this Privacy Policy or how we handle your data, please contact us:',
      `<strong>Email:</strong> ${siteConfig.contact.email}`,
      `<strong>Phone:</strong> ${siteConfig.contact.phone}`,
      `<strong>Post:</strong> ${siteConfig.contact.address.street}, ${siteConfig.contact.address.city}, ${siteConfig.contact.address.postcode}, ${siteConfig.contact.address.country}`,
      'If you are not satisfied with our response, you have the right to lodge a complaint with the Information Commissioner\'s Office (ICO):',
      '<strong>ICO Website:</strong> <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-700">www.ico.org.uk</a>',
      '<strong>ICO Helpline:</strong> 0303 123 1113',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-20 lg:py-28">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-10 w-10" />
              <span className="inline-block text-sm font-semibold text-white/90 uppercase tracking-wider">
                Privacy & Data Protection
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Privacy Policy</h1>
            <p className="text-xl text-white/90">
              Your privacy is important to us. This policy explains how we collect, use, and
              protect your personal data. Last updated: December 2024.
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
                href="/terms"
                className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
              >
                Terms & Conditions
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

      {/* Key Points Summary */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-3 gap-6">
            <Card variant="elevated" className="border-t-4 border-t-primary-600">
              <CardContent className="p-6 text-center">
                <Lock className="h-10 w-10 text-primary-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">Your Data is Secure</h3>
                <p className="text-sm text-gray-600">
                  We use industry-standard security measures to protect your information.
                </p>
              </CardContent>
            </Card>
            <Card variant="elevated" className="border-t-4 border-t-primary-600">
              <CardContent className="p-6 text-center">
                <UserCheck className="h-10 w-10 text-primary-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">You Have Control</h3>
                <p className="text-sm text-gray-600">
                  Exercise your rights to access, correct, or delete your personal data.
                </p>
              </CardContent>
            </Card>
            <Card variant="elevated" className="border-t-4 border-t-primary-600">
              <CardContent className="p-6 text-center">
                <Shield className="h-10 w-10 text-primary-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">GDPR Compliant</h3>
                <p className="text-sm text-gray-600">
                  We comply with UK GDPR and Data Protection Act 2018.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="space-y-12">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <Card key={index} variant="elevated">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-primary-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mt-2">{section.title}</h2>
                    </div>
                    <div className="space-y-4 ml-16">
                      {section.content.map((paragraph, pIndex) => (
                        <p
                          key={pIndex}
                          className="text-gray-700 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: paragraph }}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <Mail className="h-16 w-16 text-primary-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Questions About Your Privacy?</h2>
          <p className="text-lg text-gray-600 mb-8">
            We're committed to transparency. If you have any questions about how we handle your
            data, we're here to help.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors"
            >
              Contact Us
            </Link>
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="inline-flex items-center justify-center h-12 px-8 rounded-xl border-2 border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold transition-colors"
            >
              Email Us Directly
            </a>
          </div>
        </div>
      </section>

      {/* ICO Information */}
      <section className="py-12 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4 max-w-5xl">
          <Card variant="ghost">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Shield className="h-8 w-8 text-primary-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    Your Rights are Protected by the ICO
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    The Information Commissioner's Office (ICO) is the UK's independent regulator
                    for data protection. If you have concerns about how we handle your data, you can
                    contact them:
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <a
                      href="https://ico.org.uk"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 font-semibold"
                    >
                      Visit ICO Website →
                    </a>
                    <a
                      href="tel:03031231113"
                      className="text-primary-600 hover:text-primary-700 font-semibold"
                    >
                      Call 0303 123 1113
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
