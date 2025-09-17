import { useState } from 'react';
import { CreditCard, Wallet, X } from 'lucide-react';
import { detectAppContext } from '../utils/context-detection';

interface PaymentGateProps {
    onSuccess: () => void;
    onClose: () => void;
    remainingUses: number;
}

export default function PaymentGate({ onSuccess, onClose, remainingUses }: PaymentGateProps) {
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'stripe'>('crypto');
    const context = detectAppContext();

    const handleCryptoPayment = async () => {
        setLoading(true);
        try {
            // TODO: Implement crypto payment using Farcaster wallet
            // For now, simulate payment success
            setTimeout(() => {
                onSuccess();
                setLoading(false);
            }, 2000);
        } catch (error) {
            setLoading(false);
        }
    };

    const handleStripePayment = async () => {
        setLoading(true);
        try {
            // TODO: Implement Stripe payment
            // For now, simulate payment success
            setTimeout(() => {
                onSuccess();
                setLoading(false);
            }, 2000);
        } catch (error) {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 max-w-md w-full mx-4 border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-black">Unlock More Vibes</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-black transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="mb-6">
                    <p className="text-gray-600 mb-2">
                        You've used {5 - remainingUses} of your 5 free monthly vibecheck analyses.
                    </p>
                    <p className="text-black font-medium">
                        Unlock unlimited access for $2.99/month
                    </p>
                </div>

                {/* Payment Method Selection */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium text-black mb-4">Choose Payment Method</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {context === 'farcaster' && (
                            <button
                                onClick={() => setPaymentMethod('crypto')}
                                className={`border p-4 text-center transition-colors ${
                                    paymentMethod === 'crypto'
                                        ? 'border-black bg-gray-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <Wallet className="h-8 w-8 text-black mx-auto mb-2" />
                                <div className="font-medium text-black">Crypto Wallet</div>
                                <div className="text-sm text-gray-600">Pay with USDC</div>
                            </button>
                        )}
                        <button
                            onClick={() => setPaymentMethod('stripe')}
                            className={`border p-4 text-center transition-colors ${
                                paymentMethod === 'stripe'
                                    ? 'border-black bg-gray-50'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <CreditCard className="h-8 w-8 text-black mx-auto mb-2" />
                            <div className="font-medium text-black">Credit Card</div>
                            <div className="text-sm text-gray-600">Pay with Stripe</div>
                        </button>
                    </div>
                </div>

                {/* Payment Button */}
                <button
                    onClick={paymentMethod === 'crypto' ? handleCryptoPayment : handleStripePayment}
                    disabled={loading}
                    className="w-full bg-black text-white py-3 font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Processing...
                        </div>
                    ) : (
                        `Pay $2.99 with ${paymentMethod === 'crypto' ? 'Crypto' : 'Card'}`
                    )}
                </button>

                {context === 'web' && (
                    <p className="text-center text-sm text-gray-500 mt-4">
                        On Farcaster? Use our mini app for instant crypto payments!
                    </p>
                )}
            </div>
        </div>
    );
}