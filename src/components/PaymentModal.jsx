import React, { useState, useEffect } from 'react';
import { X, CheckCircle, QrCode } from 'lucide-react';
import { clsx } from 'clsx';

export default function PaymentModal({ isOpen, onClose, amount, isFullPayment, onConfirm, clientName }) {
    const [step, setStep] = useState('qr'); // qr, processing, success

    useEffect(() => {
        if (isOpen) setStep('qr');
    }, [isOpen]);

    const handlePay = () => {
        setStep('processing');
        setTimeout(() => {
            setStep('success');
            setTimeout(() => {
                onConfirm();
                onClose();
            }, 1500);
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up">

                {/* Header */}
                <div className="bg-brand-600 p-4 text-white flex justify-between items-center">
                    <h3 className="font-bold text-lg">
                        {isFullPayment ? 'Pago Total' : 'Pago de Factura'}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col items-center">

                    {step === 'qr' && (
                        <>
                            <p className="text-gray-600 mb-4 text-center">
                                Escanea el QR para pagar el monto de:
                            </p>
                            <div className="text-3xl font-bold text-brand-600 mb-6">
                                {amount} Bs.
                            </div>

                            {/* Simulated QR */}
                            <div className="bg-white p-2 border-2 border-dashed border-gray-300 rounded-xl mb-6 flex items-center justify-center">
                                <img src="/img/QR.jpeg" alt="QR de Pago" className="w-48 h-48 object-contain" />
                            </div>

                            <div className="w-full text-center text-xs text-gray-400 mb-6">
                                Cuenta: 1000003423432 <br />
                                Titular: Junta Vecinal Bolívar
                            </div>

                            <button
                                onClick={handlePay}
                                className="w-full bg-brand-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-brand-500/30 hover:bg-brand-700 hover:scale-[1.02] transition-all active:scale-95"
                            >
                                Confirmar Pago Realizado
                            </button>
                        </>
                    )}

                    {step === 'processing' && (
                        <div className="py-12 flex flex-col items-center">
                            <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-500 font-medium">Verificando transacción...</p>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="py-8 flex flex-col items-center animate-fade-in">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle size={40} />
                            </div>
                            <h4 className="text-xl font-bold text-gray-800 mb-2">¡Pago Exitoso!</h4>
                            <p className="text-gray-500 text-center">
                                Se ha registrado el pago de {clientName}.
                            </p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
