import Image from 'next/image';
import { notFound } from 'next/navigation';
import { MapPin, ShieldCheck, EyeOff } from 'lucide-react';
import { client } from '@/sanity/lib/client';
import PaymentWizard from '@/components/PaymentWizard';

export const revalidate = 60;

// Fetch public details ONLY
async function getMapDetail(slug: string) {
  const query = `
    *[_type == "mapList" && slug.current == $slug && isActive == true][0] {
      title,
      "thumbnailUrl": thumbnail.asset->url,
      price,
      description,
      demoLocations,
      purchaseCount
    }
  `;
  return await client.fetch(query, { slug });
}

export default async function HiddenGemsDetailPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params;
  const map = await getMapDetail(resolvedParams.slug);

  if (!map) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black text-white pt-8 md:pt-12 pb-16 px-4">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-6 md:gap-12">
        
        {/* Left Col: Info */}
        <div className="flex-1 space-y-8">
          <div className="aspect-[16/9] relative w-full overflow-hidden rounded-2xl border border-white/5">
            <Image
              src={map.thumbnailUrl || 'https://placehold.co/600x400/000000/FFF?text=Ghet.Review'}
              alt={map.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-pink-500/10 text-pink-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Độc quyền
              </span>
              <span className="text-neutral-500 text-sm font-medium border border-neutral-700 rounded-full px-3 py-1">
                🔥 {map.purchaseCount} người đã mua
              </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
              {map.title}
            </h1>
            
            <div className="prose prose-invert prose-p:text-neutral-300 prose-p:leading-relaxed max-w-none">
              <p>{map.description}</p>
            </div>
          </div>

          {map.demoLocations && map.demoLocations.length > 0 && (
            <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
              <h3 className="flex items-center gap-2 text-lg font-bold mb-4">
                <EyeOff className="text-pink-500" size={20} />
                Nhé lộ một vài địa điểm
              </h3>
              <ul className="space-y-3">
                {map.demoLocations.map((loc: string, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <MapPin className="text-neutral-500 mt-1 shrink-0" size={16} />
                    <span className="text-neutral-300">{loc}</span>
                  </li>
                ))}
                <li className="flex items-start gap-3 opacity-50 blur-[2px] select-none">
                  <MapPin className="text-neutral-500 mt-1 shrink-0" size={16} />
                  <span>Quán nướng bí mật ở Hẻm 284 Lê Văn Sỹ</span>
                </li>
                <li className="flex items-start gap-3 opacity-30 blur-[3px] select-none mt-1">
                  <MapPin className="text-neutral-500 mt-1 shrink-0" size={16} />
                  <span>Cà phê núp lùm view Bitexco siêu đỉnh</span>
                </li>
              </ul>
              <p className="text-xs text-center text-neutral-500 mt-4 italic">
                ... Và hàng chục địa điểm khác chờ bạn khám phá.
              </p>
            </div>
          )}

        </div>

        {/* Right Col: Checkout */}
        <div className="w-full md:w-[400px] shrink-0">
          <div className="sticky top-6 md:top-8">
            <PaymentWizard slug={resolvedParams.slug} basePrice={map.price} />
            
            <div className="mt-8 flex items-start gap-3 text-sm text-neutral-500">
              <ShieldCheck className="text-green-500 shrink-0" size={20} />
              <p>
                Giao dịch được bảo vệ và xử lý xuyên suốt 24/7 bởi SePay. 
                Bạn sẽ nhận kết quả tự động trong vòng 5 giây sau khi chuyển khoản thành công.
              </p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
