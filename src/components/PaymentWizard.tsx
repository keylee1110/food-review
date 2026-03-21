'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, QrCode } from 'lucide-react';
import { supabaseClient } from '@/lib/supabaseClient';

interface PaymentWizardProps {
  slug: string;
  basePrice: number;
}

export default function PaymentWizard({ slug, basePrice }: PaymentWizardProps) {
  const router = useRouter();
  const [promoCode, setPromoCode] = useState('');
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<'IDLE' | 'PENDING' | 'PAID'>('IDLE');
  
  // Create order
  const handleCheckout = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Vui lòng nhập định dạng email hợp lệ');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch('/api/sepay/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, promoCode, email })
      });
      const data = await res.json();
      
      if (data.success) {
        setOrder(data.order);
        setPaymentStatus('PENDING');
      } else {
        alert(data.error || 'Failed to checkout');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Listen to Supabase Realtime for this specific order
  useEffect(() => {
    if (!order || paymentStatus === 'PAID') return;

    console.log(`Subscribing to order: ${order.id}`);
    
    // Fallback: Polling every 5 seconds in case Realtime fails
    const pollInterval = setInterval(async () => {
      try {
        const { data, error } = await supabaseClient
          .from('orders')
          .select('status')
          .eq('id', order.id)
          .single();
        
        if (!error && data?.status === 'PAID') {
          console.log('Order status update detected via polling');
          setPaymentStatus('PAID');
          setTimeout(() => {
            router.push(`/hidden-gems/${slug}/success?orderId=${order.id}`);
          }, 2000);
        }
      } catch (e) {
        console.error('Polling error:', e);
      }
    }, 5000);

    const channel = supabaseClient
      .channel(`order-${order.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${order.id}`
        },
        (payload) => {
          console.log('Order update received via Realtime!', payload);
          if (payload.new.status === 'PAID') {
            setPaymentStatus('PAID');
            setTimeout(() => {
              router.push(`/hidden-gems/${slug}/success?orderId=${order.id}`);
            }, 2000);
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(pollInterval);
      supabaseClient.removeChannel(channel);
    };
  }, [order, paymentStatus, slug, router]);

  // SePay QR Code Generator
  const bankAcc = process.env.NEXT_PUBLIC_SEPAY_BANK_ACC || '';
  const bankName = process.env.NEXT_PUBLIC_SEPAY_BANK_NAME || '';
  const qrUrl = order 
    ? `https://qr.sepay.vn/img?acc=${bankAcc}&bank=${bankName}&amount=${order.amount}&des=${order.orderCode}`
    : '';

  if (paymentStatus === 'PAID') {
    return (
      <div className="bg-green-500/10 border border-green-500/20 p-8 rounded-2xl flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="text-white w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-green-400 mb-2">Thanh toán thành công!</h3>
        <p className="text-green-500/80">Đang chuyển bạn đến trang bí mật...</p>
      </div>
    );
  }

  if (paymentStatus === 'PENDING') {
    return (
      <div className="bg-[#1a1a1a] border border-white/5 p-6 md:p-8 rounded-2xl flex flex-col items-center text-center">
        <h3 className="text-xl font-bold mb-2">Quét mã để mở khóa</h3>
        <p className="text-neutral-400 text-sm mb-6">
          Sử dụng App Ngân hàng hoặc Ví điện tử để quét mã bên dưới.
        </p>

        <div className="bg-white p-4 rounded-xl mb-6 relative w-64 h-64 shadow-2xl">
          <Image 
            src={qrUrl} 
            alt="Mã QR Thanh Toán"
            fill
            sizes="(max-width: 768px) 100vw, 256px"
            className="object-contain rounded-lg p-2"
          />
        </div>

        <div className="w-full bg-black/40 rounded-xl p-4 mb-6 border border-white/5 text-left text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-neutral-500">Số tiền:</span>
            <span className="font-mono font-bold text-pink-400">{order.amount.toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Nội dung CK:</span>
            <span className="font-mono font-bold">{order.orderCode}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm text-neutral-400">
          <Loader2 className="w-4 h-4 animate-spin text-pink-500" />
          Hệ thống đang chờ xác nhận từ ngân hàng...
        </div>
      </div>
    );
  }

  // IDLE State
  return (
    <div className="bg-[#111] border border-white/5 p-6 rounded-2xl">
      <h3 className="text-xl font-bold mb-4">Thông tin thanh toán</h3>
      
      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-neutral-400">
          <span>Giá bản đồ:</span>
          <span>{basePrice.toLocaleString('vi-VN')}đ</span>
        </div>
        
        <div>
          <label className="block text-sm text-neutral-500 mb-1">Email nhận link *</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vd: you@example.com"
            required
            className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-pink-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm text-neutral-500 mb-1">Mã giảm giá (Nếu có)</label>
          <input 
            type="text" 
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="Nhập mã giảm giá..."
            className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-pink-500 transition-colors uppercase"
          />
        </div>
      </div>

      <button
        onClick={handleCheckout}
        disabled={isProcessing}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-orange-500 hover:from-pink-500 hover:to-orange-400 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <QrCode className="w-5 h-5" />
        )}
        Thanh toán {basePrice.toLocaleString('vi-VN')}đ
      </button>

      <p className="text-center text-xs text-neutral-600 mt-4">
        Giao dịch được bảo mật và tự động xác nhận 24/7.
      </p>
    </div>
  );
}
