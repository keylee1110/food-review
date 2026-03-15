'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PortableText } from '@portabletext/react';
import urlBuilder from '@sanity/image-url';
import Image from 'next/image';
import { MapPin, Loader2, Link2, AlertCircle } from 'lucide-react';
import { client } from '@/sanity/lib/client';

const builder = urlBuilder(client);
function urlFor(source: any) {
  return builder.image(source);
}

// Custom components for PortableText rendering
const ptComponents = {
  types: {
    image: ({ value }: any) => {
      if (!value?.asset?._ref) return null;
      return (
        <div className="relative w-full aspect-video my-8 rounded-2xl overflow-hidden border border-white/10">
          <Image
            src={urlFor(value).url()}
            alt={value.alt || 'Review image'}
            fill
            className="object-cover"
          />
        </div>
      );
    },
  },
  marks: {
    link: ({ value, children }: any) => (
      <a href={value?.href} target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:text-pink-300 underline underline-offset-4">
        {children}
      </a>
    ),
  },
};

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ premiumContent: any[], mapUrl: string } | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError('Không tìm thấy mã đơn hàng.');
      setIsLoading(false);
      return;
    }

    const fetchPremiumContent = async () => {
      try {
        const res = await fetch('/api/maps/premium-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId })
        });

        const result = await res.json();
        
        if (result.success) {
          setData(result);
        } else {
          setError(result.error || 'Bạn chưa thanh toán đơn hàng này.');
        }
      } catch (err) {
        setError('Lỗi kết nối máy chủ.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPremiumContent();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-pink-500 mb-4" />
        <p className="text-neutral-400">Đang tải mật thư...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
        <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Truy cập bị từ chối</h2>
          <p className="text-neutral-400 mb-6">{error}</p>
          <a href="/hidden-gems" className="text-pink-500 hover:text-pink-400 font-bold">
            Trở về danh sách bản đồ
          </a>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pt-8 md:pt-12 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Verification Success Header */}
        <div className="bg-gradient-to-r from-pink-500/10 to-orange-500/10 border border-pink-500/20 rounded-2xl p-6 mb-10 md:p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(236,72,153,0.3)]">
            <MapPin className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-4">
            Mở khóa thành công!
          </h1>
          <p className="text-neutral-400 mb-6 max-w-lg mx-auto">
            Cảm ơn bạn đã mua danh sách của tụi mình. Dưới đây là bài review chi tiết và độc quyền dành riêng cho bạn.
          </p>
          
          <a 
            href={data.mapUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-black font-bold px-6 py-3 rounded-xl hover:bg-neutral-200 transition-colors"
          >
            <Link2 size={20} />
            Mở Google Maps ngay
          </a>
          <p className="text-xs text-neutral-500 mt-4">
            Lưu ý: Bạn hãy bấm [Theo dõi/Follow] trên Google Maps để lưu danh sách vào điện thoại nhé.
          </p>
        </div>

        {/* Premium Content Body */}
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6 md:p-10 shadow-xl prose prose-invert prose-p:text-neutral-300 prose-p:leading-relaxed prose-headings:text-white prose-headings:font-bold prose-a:text-pink-400 max-w-none">
          <h2 className="text-2xl font-black mb-8 border-b border-white/10 pb-4">
            Bí kíp ẩm thực chi tiết
          </h2>
          
          {data.premiumContent ? (
            <PortableText value={data.premiumContent} components={ptComponents} />
          ) : (
            <p className="text-neutral-500 italic">Admin chưa cập nhật bài review chi tiết cho danh sách này.</p>
          )}

        </div>

      </div>
    </main>
  );
}
