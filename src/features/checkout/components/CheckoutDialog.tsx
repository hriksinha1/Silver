import { useEffect, useRef, useState } from 'react';
import { ID } from 'appwrite';
import { account, callStoreFunction } from '@/shared/lib/appwrite';
import { formatINR } from '@/shared/lib/money';
import { CloseIcon } from '@/shared/ui/icons';
import Button from '@/shared/ui/Button';
import type { CartItem } from '@/features/cart/context/CartContext';

type CheckoutStep = 'email' | 'code' | 'shipping' | 'complete';
type PaymentMethod = 'razorpay' | 'cod';

interface CheckoutDialogProps {
  isOpen: boolean;
  cart: CartItem[];
  onClose: () => void;
  onOrderComplete: () => void;
}

interface OrderResponse {
  orderId: string;
  amountInPaise: number;
  currency: 'INR';
  paymentMethod: PaymentMethod;
  razorpayOrderId?: string;
  razorpayKeyId?: string;
}

interface RazorpaySuccess {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string; contact: string };
  handler: (response: RazorpaySuccess) => void;
  modal: { ondismiss: () => void };
  theme: { color: string };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

const fieldClassName =
  'w-full rounded-[2px] border border-[#DCD7DF] bg-white px-3 py-2.5 text-sm text-[#26102C] outline-none focus:border-[#69388F] focus:ring-2 focus:ring-[#69388F]/20';

let razorpayScriptPromise: Promise<void> | undefined;

function loadRazorpay(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        razorpayScriptPromise = undefined;
        reject(new Error('Payment could not be loaded. Please try again.'));
      };
      document.head.appendChild(script);
    });
  }
  return razorpayScriptPromise;
}

export default function CheckoutDialog({
  isOpen,
  cart,
  onClose,
  onOrderComplete,
}: CheckoutDialogProps) {
  const [step, setStep] = useState<CheckoutStep>('email');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [userId, setUserId] = useState('');
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [placedOrder, setPlacedOrder] = useState<OrderResponse | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const requestIdRef = useRef(ID.unique());

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const timer = window.setTimeout(() => closeButtonRef.current?.focus(), 50);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [busy, isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || resendSeconds <= 0) return;
    const timer = window.setTimeout(() => setResendSeconds((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [isOpen, resendSeconds]);

  if (!isOpen) return null;

  const startEmailVerification = async (resend = false) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Enter a valid email address.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const result = await callStoreFunction<{ userId: string }>('/auth/start', {
        email: normalizedEmail,
        name: fullName.trim(),
      });
      if (!result.userId) throw new Error('Unable to start email verification.');
      setEmail(normalizedEmail);
      setUserId(result.userId);
      setStep('code');
      setResendSeconds(resend ? 60 : 30);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to send your email code.');
    } finally {
      setBusy(false);
    }
  };

  const verifyEmail = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the six-digit code from your email.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      await account.createSession(userId, code);
      setStep('shipping');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'That code could not be verified.');
    } finally {
      setBusy(false);
    }
  };

  const finishOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      setError('Enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (!/^\d{6}$/.test(postalCode.trim())) {
      setError('Enter a valid six-digit Indian PIN code.');
      return;
    }
    if (cart.length === 0) {
      setError('Your bag is empty.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const order = await callStoreFunction<OrderResponse>(
        '/orders',
        {
          requestId: requestIdRef.current,
          email,
          paymentMethod,
          customer: {
            name: fullName.trim(),
            phone: phone.replace(/\D/g, ''),
            address: address.trim(),
            city: city.trim(),
            state: state.trim(),
            postalCode: postalCode.trim(),
            country: 'IN',
          },
          items: cart.map(({ id, quantity }) => ({ id, quantity })),
        },
        true
      );

      if (paymentMethod === 'cod') {
        setPlacedOrder(order);
        setStep('complete');
        onOrderComplete();
        return;
      }

      if (!order.razorpayOrderId || !order.razorpayKeyId) {
        throw new Error('The payment provider is not configured. Please contact the store.');
      }

      await loadRazorpay();
      if (!window.Razorpay) throw new Error('Payment could not be loaded. Please try again.');
      const checkout = new window.Razorpay({
        key: order.razorpayKeyId,
        amount: order.amountInPaise,
        currency: order.currency,
        name: 'Silveram',
        description: 'Jewellery order',
        order_id: order.razorpayOrderId,
        prefill: { name: fullName.trim(), email, contact: phone.replace(/\D/g, '') },
        theme: { color: '#69388F' },
        modal: { ondismiss: () => setBusy(false) },
        handler: async (payment) => {
          setBusy(true);
          try {
            await callStoreFunction('/orders/verify', {
              requestId: requestIdRef.current,
              ...payment,
            }, true);
            setPlacedOrder(order);
            setStep('complete');
            onOrderComplete();
          } catch (reason) {
            setError(
              reason instanceof Error
                ? `${reason.message} Do not retry the payment; contact the store with your payment reference.`
                : 'Payment verification failed. Contact the store before retrying.'
            );
          } finally {
            setBusy(false);
          }
        },
      });
      checkout.open();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to place your order.');
      setBusy(false);
    }
  };

  const close = () => {
    if (busy) return;
    if (step === 'complete') {
      setStep('email');
      setEmail('');
      setFullName('');
      setUserId('');
      setCode('');
      setPhone('');
      setAddress('');
      setCity('');
      setState('');
      setPostalCode('');
      setPlacedOrder(null);
      requestIdRef.current = ID.unique();
    }
    setError('');
    onClose();
  };

  const subtotalEstimate = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-3 backdrop-blur-[2px] sm:p-5"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <section
        ref={dialogRef}
        className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-[2px] bg-white text-[#26102C] shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
      >
        <header className="flex items-center justify-between border-b border-[#E2DEE5] px-5 py-4 sm:px-7">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#69388F]">
              Silveram checkout
            </p>
            <h2 id="checkout-title" className="mt-1 font-heading text-2xl font-medium">
              {step === 'complete' ? 'Order received' : 'Your order'}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={close}
            disabled={busy}
            className="flex h-9 w-9 items-center justify-center rounded-[2px] text-[#4E4852] hover:bg-[#F5F2F7] disabled:opacity-50"
            aria-label="Close checkout"
          >
            <CloseIcon size={20} />
          </button>
        </header>

        <div className="overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <ol className="mb-6 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[#706977]" aria-label="Checkout progress">
            {['Email', 'Delivery', 'Payment'].map((label, index) => {
              const activeIndex = step === 'email' || step === 'code' ? 0 : step === 'shipping' ? 1 : 2;
              return (
                <li key={label} className="flex flex-1 items-center gap-2">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full ${index <= activeIndex ? 'bg-[#69388F] text-white' : 'bg-[#EFEFEF]'}`}>
                    {index + 1}
                  </span>
                  <span>{label}</span>
                  {index < 2 && <span className="h-px flex-1 bg-[#E2DEE5]" aria-hidden="true" />}
                </li>
              );
            })}
          </ol>

          {step === 'email' && (
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                void startEmailVerification();
              }}
            >
              <div>
                <h3 className="font-heading text-xl font-medium">Sign in or continue as a guest</h3>
                    <p className="mt-1 text-sm leading-relaxed text-[#4E4852]">
                  We’ll email you a one-time six-digit verification code before checkout.
                  No password is required.
                </p>
              </div>
              <label className="block text-xs font-medium">
                Full name
                <input
                  autoComplete="name"
                  className={`${fieldClassName} mt-1.5`}
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  maxLength={100}
                  required
                />
              </label>
              <label className="block text-xs font-medium">
                Email address
                <input
                  type="email"
                  autoComplete="email"
                  className={`${fieldClassName} mt-1.5`}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  maxLength={254}
                  required
                />
              </label>
              <p className="text-xs leading-relaxed text-[#706977]">
                Guest checkout also creates a password-free Silveram account so we can
                verify your address and associate your order.
              </p>
              <Button type="submit" disabled={busy} className="w-full py-3">
                {busy ? 'Sending code…' : 'Continue with email'}
              </Button>
            </form>
          )}

          {step === 'code' && (
            <form className="space-y-4" onSubmit={(event) => void verifyEmail(event)}>
              <div>
                <h3 className="font-heading text-xl font-medium">Check your inbox</h3>
                <p className="mt-1 text-sm text-[#4E4852]">
                  Enter the six-digit code sent to <strong>{email}</strong>.
                </p>
              </div>
              <label className="block text-xs font-medium">
                Verification code
                <input
                  className={`${fieldClassName} mt-1.5 text-center text-lg tracking-[0.4em]`}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                />
              </label>
              <Button type="submit" disabled={busy} className="w-full py-3">
                {busy ? 'Verifying…' : 'Verify email'}
              </Button>
              <button
                type="button"
                disabled={busy || resendSeconds > 0}
                onClick={() => void startEmailVerification(true)}
                className="w-full text-center text-xs text-[#69388F] underline underline-offset-2 disabled:text-[#8D8792]"
              >
                {resendSeconds > 0 ? `Resend code in ${resendSeconds}s` : 'Resend code'}
              </button>
            </form>
          )}

          {step === 'shipping' && (
            <form className="space-y-4" onSubmit={(event) => void finishOrder(event)}>
              <div>
                <h3 className="font-heading text-xl font-medium">Delivery details</h3>
                <p className="mt-1 text-sm text-[#4E4852]">
                  Delivering within India. Your email is verified as {email}.
                </p>
              </div>
              <label className="block text-xs font-medium">
                Full name
                <input className={`${fieldClassName} mt-1.5`} autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} maxLength={100} required />
              </label>
              <label className="block text-xs font-medium">
                Mobile number
                <input className={`${fieldClassName} mt-1.5`} type="tel" inputMode="numeric" autoComplete="tel-national" value={phone} onChange={(event) => setPhone(event.target.value)} maxLength={16} required />
              </label>
              <label className="block text-xs font-medium">
                Address
                <textarea className={`${fieldClassName} mt-1.5 min-h-20 resize-y`} autoComplete="street-address" value={address} onChange={(event) => setAddress(event.target.value)} maxLength={300} required />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-medium">
                  City
                  <input className={`${fieldClassName} mt-1.5`} autoComplete="address-level2" value={city} onChange={(event) => setCity(event.target.value)} maxLength={100} required />
                </label>
                <label className="block text-xs font-medium">
                  State
                  <input className={`${fieldClassName} mt-1.5`} autoComplete="address-level1" value={state} onChange={(event) => setState(event.target.value)} maxLength={100} required />
                </label>
                <label className="block text-xs font-medium">
                  PIN code
                  <input className={`${fieldClassName} mt-1.5`} inputMode="numeric" autoComplete="postal-code" value={postalCode} onChange={(event) => setPostalCode(event.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} required />
                </label>
                <div className="flex items-end pb-3 text-xs text-[#706977]">India</div>
              </div>

              <fieldset className="space-y-2 border-t border-[#E2DEE5] pt-4">
                <legend className="mb-2 text-xs font-semibold">Payment method</legend>
                <label className="flex cursor-pointer items-start gap-3 rounded-[2px] border border-[#DCD7DF] p-3 text-sm">
                  <input type="radio" name="payment" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="mt-0.5 accent-[#69388F]" />
                  <span><strong className="block text-xs">Pay online</strong><span className="text-xs text-[#706977]">Secure payment with Razorpay</span></span>
                </label>
                <label className="flex cursor-pointer items-start gap-3 rounded-[2px] border border-[#DCD7DF] p-3 text-sm">
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="mt-0.5 accent-[#69388F]" />
                  <span><strong className="block text-xs">Cash on delivery</strong><span className="text-xs text-[#706977]">Pay when your order arrives</span></span>
                </label>
              </fieldset>

              <div className="flex items-center justify-between border-t border-[#E2DEE5] pt-4 text-sm">
                <span>Estimated total</span>
                <strong>{formatINR(subtotalEstimate)}</strong>
              </div>
              <p className="text-xs leading-relaxed text-[#706977]">
                Final prices are checked by the store when you place the order.
              </p>
              <Button type="submit" disabled={busy || cart.length === 0} className="w-full py-3">
                {busy ? 'Processing…' : paymentMethod === 'cod' ? 'Place order' : 'Continue to secure payment'}
              </Button>
            </form>
          )}

          {step === 'complete' && placedOrder && (
            <div className="space-y-4 py-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F2F7] text-2xl text-[#69388F]" aria-hidden="true">✓</div>
              <h3 className="font-heading text-2xl font-medium">Thank you, {fullName}.</h3>
              <p className="text-sm leading-relaxed text-[#4E4852]">
                Your order has been received. A confirmation will be sent to {email}.
              </p>
              <p className="rounded-[2px] bg-[#FAF8FB] px-4 py-3 text-xs">
                Order reference <strong className="font-mono">{placedOrder.orderId}</strong>
              </p>
              <p className="text-sm font-semibold">Total {formatINR(placedOrder.amountInPaise / 100)}</p>
              <Button type="button" className="w-full py-3" onClick={close}>Continue shopping</Button>
            </div>
          )}

          {error && (
            <p className="mt-4 rounded-[2px] border border-red-200 bg-red-50 px-3 py-2.5 text-xs leading-relaxed text-red-800" role="alert">
              {error}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
