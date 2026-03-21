import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = process.env.SEPAY_WEBHOOK_TOKEN
    
    console.log('--- SEPAY WEBHOOK RECEIVED ---')
    console.log('Authorization Header:', authHeader)
    
    // Bypass authentication check in development or if token is not set
    if (process.env.NODE_ENV !== 'production' && !token) {
      console.warn('Webhook authentication bypassed (No token set or Dev mode)')
    } else if (!authHeader || (authHeader !== `Bearer ${token}` && authHeader !== `Apikey ${token}` && authHeader !== token)) {
      console.error('Webhook authentication failed. Expected:', token, 'Received:', authHeader)
      // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    console.log('Webhook Payload:', JSON.stringify(data, null, 2))
    
    // Lấy nội dung chuyển khoản "content" và số lượng "amount_in" theo Data Structure của SePay
    const transferContent = (data.content || '').toUpperCase()
    const transferAmount = parseInt(data.amount_in || data.transferAmount || '0')

    if (!transferContent || transferAmount === 0) {
       return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 })
    }

    // 3. Dò tìm Order Code trong nội dung
    // Giao dịch từ ngân hàng hay bị dính chữ (ví dụ: NGUYEN VAN A CK FOOD123456)
    // RegExp: Tìm đoạn có chữ FOOD theo sau là 6 số.
    const match = transferContent.match(/FOOD\d{6}/)
    
    if (!match) {
      // Không tìm thấy mã đơn của chúng ta, có thể khách ck nhầm, hoặc nạp lý do khác
      return NextResponse.json({ success: true, message: 'No matching order code found, skipped' })
    }

    const orderCode = match[0]

    // 4. Lấy đơn hàng từ DB
    const { data: order, error: fetchErr } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_code', orderCode)
      .single()

    if (fetchErr || !order) {
      console.log(`Order not found for code: ${orderCode}`)
      return NextResponse.json({ success: true, message: 'Order not found, skipped' })
    }

    // 5. Kiểm tra số tiền chuyển có khớp/đủ số tiền yêu cầu không?
    if (transferAmount >= order.amount && order.status === 'PENDING') {
      // Cập nhật trạng thái
      const { error: updateErr } = await supabaseAdmin
        .from('orders')
        .update({ status: 'PAID' })
        .eq('id', order.id)

      if (updateErr) {
        console.error('Update order state failed:', updateErr)
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
      }

      // 6. Gửi Email qua Resend nếu order có email
      console.log('Email check - order.email:', order.email, '| RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY)
      
      if (order.email && process.env.RESEND_API_KEY) {
        try {
          const { Resend } = await import('resend');
          const { client } = await import('@/sanity/lib/client');
          
          const resend = new Resend(process.env.RESEND_API_KEY);
          
          // Lấy MapUrl và Title từ Sanity
          const mapListQuery = `*[_type == "mapList" && slug.current == $slug][0]{ title, mapUrl }`;
          const mapList = await client.fetch(mapListQuery, { slug: order.map_slug });
          console.log('Sanity mapList fetched:', mapList);

          if (mapList && mapList.mapUrl) {
            const emailResult = await resend.emails.send({
              from: 'onboarding@resend.dev',
              to: order.email,
              subject: `💎 Kho báu của bạn: ${mapList.title}`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 32px; border-radius: 12px;">
                  <h1 style="color: #ec4899; margin-bottom: 8px;">Thanh toán thành công! 🎉</h1>
                  <p style="color: #aaa;">Cảm ơn bạn đã mua <strong style="color: #fff;">${mapList.title}</strong>.</p>
                  <p style="color: #aaa;">Mã đơn hàng: <strong style="color: #fff; font-family: monospace;">${order.order_code}</strong></p>
                  
                  <div style="margin: 32px 0; padding: 24px; background: #111; border-radius: 8px; border: 1px solid #333;">
                    <p style="margin: 0 0 16px; font-weight: bold; color: #fff;">Đây là kho báu của bạn:</p>
                    <a href="${mapList.mapUrl}" 
                       style="display: inline-block; background: linear-gradient(to right, #ec4899, #f97316); color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                      Mở Danh Sách Trên Google Maps 🗺️
                    </a>
                    <p style="margin-top: 12px; font-size: 12px; color: #666; word-break: break-all;">
                      Link: ${mapList.mapUrl}
                    </p>
                  </div>
                  
                  <p style="color: #666; font-size: 12px;">Chúc bạn có những trải nghiệm tuyệt vời — Ghet.review 🍜</p>
                </div>
              `,
            });
            console.log('Resend email result:', JSON.stringify(emailResult));
          } else {
            console.warn('mapList not found or missing mapUrl for slug:', order.map_slug);
          }
        } catch (emailErr) {
          console.error('Failed to send email:', emailErr);
        }
      }

      // TODO: Increment purchaseCount on Sanity using Sanity Write Token
      // Lát nữa có thể thêm hàm gọi mutation Sanity ở đây.

      return NextResponse.json({ success: true, message: 'Payment verified and order updated' })
    } else {
      console.log(`Amount mismatch or already paid. Expected: ${order.amount}, Received: ${transferAmount}`)
      return NextResponse.json({ success: true, message: 'Amount mismatch or already handled' })
    }

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
