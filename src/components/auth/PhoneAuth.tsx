import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Shield } from 'lucide-react';
import { Loading } from '@/components/ui/loading';
import { useAuthContext } from '@/contexts/AuthContext';
import { validateInput, phoneSignInSchema, otpVerificationSchema } from '@/lib/validation';

interface PhoneAuthProps {
  onBack: () => void;
}

const PhoneAuth: React.FC<PhoneAuthProps> = ({ onBack }) => {
  const { signInWithPhone, verifyOtp } = useAuthContext();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate input
    const validation = validateInput(phoneSignInSchema, { phone });
    if (!validation.success) {
      setErrors(validation.errors || {});
      return;
    }

    setLoading(true);

    try {
      const { error } = await signInWithPhone(phone);
      if (!error) {
        setStep('otp');
      }
    } catch (err) {
      setErrors({ general: 'Failed to send OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate input
    const validation = validateInput(otpVerificationSchema, { phone, otp });
    if (!validation.success) {
      setErrors(validation.errors || {});
      return;
    }

    setLoading(true);

    try {
      const { error } = await verifyOtp(phone, otp);
      if (error) {
        setErrors({ otp: error.message });
      }
    } catch (err) {
      setErrors({ general: 'Failed to verify OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      await signInWithPhone(phone);
    } catch (err) {
      setErrors({ general: 'Failed to resend OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-2xl border-0 bg-card/95 backdrop-blur">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary to-primary-glow rounded-2xl flex items-center justify-center">
          {step === 'phone' ? (
            <Phone className="w-8 h-8 text-primary-foreground" />
          ) : (
            <Shield className="w-8 h-8 text-primary-foreground" />
          )}
        </div>
        <div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            {step === 'phone' ? 'Sign in with Phone' : 'Verify OTP'}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {step === 'phone' 
              ? 'Enter your phone number to receive a verification code'
              : `We sent a 6-digit code to ${phone}`
            }
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {step === 'phone' ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
            </div>

            {errors.general && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {errors.general}
              </div>
            )}

            <div className="space-y-3">
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? <Loading size="sm" /> : 'Send Verification Code'}
              </Button>

              <Button 
                type="button" 
                variant="outline" 
                className="w-full h-11"
                onClick={onBack}
                disabled={loading}
              >
                Back to Sign In
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-xl tracking-widest"
                maxLength={6}
                required
              />
              {errors.otp && (
                <p className="text-sm text-destructive">{errors.otp}</p>
              )}
            </div>

            {errors.general && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {errors.general}
              </div>
            )}

            <div className="space-y-3">
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? <Loading size="sm" /> : 'Verify Code'}
              </Button>

              <div className="flex space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 h-11"
                  onClick={() => setStep('phone')}
                  disabled={loading}
                >
                  Change Number
                </Button>

                <Button 
                  type="button" 
                  variant="secondary" 
                  className="flex-1 h-11"
                  onClick={handleResendOtp}
                  disabled={loading}
                >
                  Resend Code
                </Button>
              </div>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default PhoneAuth;