import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Users, LockKeyhole } from 'lucide-react';
import { client } from '@/sanity/lib/client';

export const revalidate = 60;

interface MapList {
  title: string;
  slug: { current: string };
  thumbnailUrl: string;
  price: number;
  description: string;
  purchaseCount: number;
}

async function getMapLists(): Promise<MapList[]> {
  const query = `
    *[_type == "mapList" && isActive == true] | order(_createdAt desc) {
      title,
      slug,
      "thumbnailUrl": thumbnail.asset->url,
      price,
      description,
      purchaseCount
    }
  `;
  try {
    return await client.fetch(query);
  } catch (error) {
    console.error("Error fetching map lists:", error);
    return [];
  }
}

export default async function HiddenGemsPage() {
  const maps = await getMapLists();

  return (
    <main className="min-h-screen bg-black text-white pt-8 md:pt-12 pb-16 px-4">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent leading-tight">
          Bản Đồ Hidden Gems <br className="hidden md:block" /> cho Team "dị ứng" Seeding 🚫
        </h1>
        <div className="text-lg md:text-xl text-neutral-400 max-w-3xl mx-auto mb-10 space-y-4">
          <p>
            Lỡ cả đời cứ hễ buồn là đi ăn thì sao? Thì ít nhất cũng phải ăn được quán ngon, chứ ăn trúng quán seeding là buồn x100 lần đó yêu!
          </p>
          <p>
            Ở đây tụi mình chỉ có những góc núp lùm mà dân bản địa thà giấu làm của riêng chứ không nỡ share. Review độc quyền, có sao nói vậy, đảm bảo không làm bạn thất vọng (trừ khi bạn không đi).
          </p>
        </div>
        
        <div className="inline-flex flex-col md:flex-row items-stretch md:items-center justify-center gap-4 p-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl max-w-fit mx-auto">
          <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex-shrink-0 bg-pink-500/20 p-2 rounded-xl text-pink-400">
              <MapPin size={22} />
            </div>
            <span className="text-sm md:text-base text-white font-semibold text-left">
              Bấm lưu nếu bạn cũng sợ seeding như <br className="hidden lg:block" /> sợ người yêu cũ.
            </span>
          </div>
          
          <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex-shrink-0 bg-orange-500/20 p-2 rounded-xl text-orange-400">
              <LockKeyhole size={22} />
            </div>
            <span className="text-sm md:text-base text-white font-semibold text-left">
              Nội dung "nội bộ": Những góc khuất mà tụi mình <br className="hidden lg:block" /> thà giữ kín còn hơn bị "over-rated"
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Map Lists */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-2 md:px-0">
        {maps.map((map) => (
          <Link href={`/hidden-gems/${map.slug.current}`} key={map.slug.current}>
            <div className="group relative rounded-[2rem] bg-neutral-900/50 backdrop-blur-sm overflow-hidden border border-white/5 hover:border-pink-500/30 transition-all duration-500 hover:shadow-[0_0_30px_-10px_rgba(236,72,153,0.3)]">
              <div className="aspect-[16/10] relative w-full overflow-hidden">
                <Image
                  src={map.thumbnailUrl || '/placeholder.jpg'}
                  alt={map.title}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/20 to-transparent opacity-80" />
                
                {/* Price tag with Premium Style */}
                <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-2xl text-base font-black shadow-2xl text-pink-400">
                  {map.price.toLocaleString('vi-VN')}đ
                </div>

                {/* Status Badge */}
                <div className="absolute top-6 right-6 bg-pink-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                  Limited Access
                </div>
              </div>
              
              <div className="p-8 relative">
                <div className="flex items-center gap-2 mb-3">
                   <div className="h-px w-8 bg-pink-500/50" />
                   <span className="text-[10px] uppercase tracking-widest font-bold text-pink-500/80">Hidden Map</span>
                </div>
                
                <h3 className="text-2xl font-black mb-3 group-hover:text-pink-400 transition-colors leading-tight">
                  {map.title}
                </h3>
                <p className="text-neutral-400 text-sm line-clamp-2 mb-8 leading-relaxed font-medium">
                  {map.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-300 bg-white/5 px-4 py-2.5 rounded-xl border border-white/5">
                    <Users size={16} className="text-pink-500" />
                    <span>{map.purchaseCount}0+ lượt tải</span>
                  </div>
                  
                  <div className="group/btn relative px-6 py-2.5 bg-white text-black rounded-xl font-bold text-sm overflow-hidden transition-all active:scale-95">
                    <span className="relative z-10 flex items-center gap-2">
                      Sở hữu ngay <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {maps.length === 0 && (
          <div className="col-span-full py-20 text-center text-neutral-500">
            Chưa có bản đồ nào được xuất bản. Hãy thêm trên Sanity Studio.
          </div>
        )}
      </div>
    </main>
  );
}
