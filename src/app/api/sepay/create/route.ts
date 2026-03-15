import { NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { slug, promoCode } = body

    if (!slug) {
      return NextResponse.json({ error: 'Map slug is required' }, { status: 400 })
    }

    // 1. Lấy thông tin giá của Map List từ Sanity
    const mapListQuery = `*[_type == "mapList" && slug.current == $slug][0]{ price, isActive }`
    const mapList = await client.fetch(mapListQuery, { slug })

    if (!mapList || !mapList.isActive) {
      return NextResponse.json({ error: 'Map List not found or inactive' }, { status: 404 })
    }

    let finalAmount = mapList.price

    // 2. Validate Promo Code nếu có
    if (promoCode) {
      const codeQuery = `*[_type == "promoCode" && code == $promoCode && isActive == true][0]`
      const promoInfo = await client.fetch(codeQuery, { promoCode: promoCode.toUpperCase() })

      if (promoInfo) {
        // Check hạn sử dụng
        if (!promoInfo.validUntil || new Date(promoInfo.validUntil) > new Date()) {
          const discount = (finalAmount * promoInfo.discountPercentage) / 100
          finalAmount = Math.max(0, finalAmount - discount)
        }
      }
    }

    // 3. Tạo orderCode ngẫu nhiên (dùng làm nội dung CK)
    // Ví dụ tạo format FOOD[6 chữ số]
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString()
    const orderCode = `FOOD${randomCode}`

    // 4. Lưu PENDING order vào Supabase
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .insert([
        {
          order_code: orderCode,
          map_slug: slug,
          amount: finalAmount,
          promo_code: promoCode?.toUpperCase() || null,
          status: 'PENDING',
        },
      ])
      .select('id, order_code, amount, status')
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // 5. Trả thông tin order về Frontend để gen QR bằng SePay format
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderCode: order.order_code,
        amount: order.amount,
        status: order.status
      }
    })

  } catch (error) {
    console.error('Error in /api/sepay/create:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
