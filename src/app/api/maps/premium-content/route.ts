import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { client } from '@/sanity/lib/client'

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // 1. Kiểm tra trạng thái đơn hàng trong Supabase
    const { data: order, error: fetchErr } = await supabaseAdmin
      .from('orders')
      .select('status, map_slug')
      .eq('id', orderId)
      .single()

    if (fetchErr || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // 2. Chỉ cho phép xem nếu trạng thái là PAID
    if (order.status !== 'PAID') {
      return NextResponse.json({ error: 'Order is not paid yet' }, { status: 403 })
    }

    // 3. Lấy Premium Content từ Sanity
    const mapQuery = `*[_type == "mapList" && slug.current == $slug][0]{
      mapUrl,
      premiumContent
    }`
    
    // Lưu ý: ở đậy gọi Sanity Read bình thường vì dữ liệu này public với app, 
    // nhưng ta chỉ gọi api/maps/premium-content sau khi đã pass được lưới lọc PAID.
    const mapData = await client.fetch(mapQuery, { slug: order.map_slug })

    if (!mapData) {
      return NextResponse.json({ error: 'Map data not found' }, { status: 404 })
    }

    // 4. Trả về cho Frontend hiển thị
    return NextResponse.json({
      success: true,
      mapUrl: mapData.mapUrl,
      premiumContent: mapData.premiumContent,
    })

  } catch (error) {
    console.error('Error fetching premium content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
