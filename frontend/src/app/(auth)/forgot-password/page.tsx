'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: Implement password reset logic
    setTimeout(() => {
      console.log('Password reset request for:', email);
      setEmailSent(true);
      setIsLoading(false);
    }, 1500);
  };

  if (emailSent) {
    return (
      <Card variant="elevated">
        <CardContent className="pt-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
          <p className="text-gray-600 mb-6">
            We&apos;ve sent password reset instructions to{' '}
            <span className="font-medium text-gray-900">{email}</span>
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Didn&apos;t receive the email? Check your spam folder or try again.
          </p>
          <Button
            variant="outline"
            className="w-full mb-4"
            onClick={() => setEmailSent(false)}
          >
            Try Different Email
          </Button>
        </CardContent>
        <CardFooter className="bg-gray-50 justify-center">
          <Link
            href="/login"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card variant="elevated">
      <CardContent className="pt-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
        <p className="text-gray-600 mb-6">
          Enter your email address and we&apos;ll send you instructions to reset your
          password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            Send Reset Instructions
          </Button>
        </form>
      </CardContent>

      <CardFooter className="bg-gray-50 justify-center">
        <Link
          href="/login"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Link>
      </CardFooter>
    </Card>
  );
}
