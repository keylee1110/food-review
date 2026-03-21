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
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm md:text-base text-neutral-300 font-medium">
          <div className="flex items-center gap-3">
            <div className="bg-pink-500/10 p-2.5 rounded-full text-pink-500">
              <MapPin size={22} />
            </div>
            <span>Bấm lưu nếu bạn cũng sợ seeding như sợ người yêu cũ.</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-orange-500/10 p-2.5 rounded-full text-orange-500">
              <LockKeyhole size={22} />
            </div>
            <span>Nội dung "nội bộ": Những góc khuất mà tụi mình thà giữ kín còn hơn bị "over-rated"</span>
          </div>
        </div>
      </div>

      {/* Grid of Map Lists */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {maps.map((map) => (
          <Link href={`/hidden-gems/${map.slug.current}`} key={map.slug.current}>
            <div className="group relative rounded-3xl bg-[#111] overflow-hidden border border-white/5 hover:border-white/10 transition-colors duration-300">
              <div className="aspect-[4/3] relative w-full overflow-hidden">
                <Image
                  src={map.thumbnailUrl || '/placeholder.jpg'}
                  alt={map.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent" />
                
                {/* Price tag */}
                <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                  {map.price.toLocaleString('vi-VN')}đ
                </div>
              </div>
              
              <div className="p-6 relative">
                <h3 className="text-xl font-bold mb-2 group-hover:text-pink-400 transition-colors">
                  {map.title}
                </h3>
                <p className="text-neutral-400 text-sm line-clamp-2 mb-4 leading-relaxed">
                  {map.description}
                </p>
                
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-pink-500 bg-pink-500/10 px-2.5 py-1 rounded-full">
                    <Users size={14} />
                    <span>{map.purchaseCount} người đã mua</span>
                  </div>
                  <div className="text-sm font-bold flex items-center gap-1">
                    Xem thử <span className="group-hover:translate-x-1 transition-transform">→</span>
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
