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

      // 6. Gửi Email qua SMTP (Nodemailer) nếu order có email
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;

      console.log('Email check - order.email:', order.email, '| SMTP_USER exists:', !!smtpUser);
      
      if (order.email && smtpUser && smtpPass) {
        try {
          const nodemailer = await import('nodemailer');
          const { client } = await import('@/sanity/lib/client');

          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
          });

          // Lấy MapUrl và Title từ Sanity
          const mapListQuery = `*[_type == "mapList" && slug.current == $slug][0]{ title, mapUrl }`;
          const mapList = await client.fetch(mapListQuery, { slug: order.map_slug });
          console.log('Sanity mapList fetched for email:', mapList);

          if (mapList && mapList.mapUrl) {
            const info = await transporter.sendMail({
              from: `"Ghet.review 💎" <${smtpUser}>`,
              to: order.email,
              subject: `🔓 Mở khoá: ${mapList.title}`,
              html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; padding: 40px 20px; border-radius: 24px; border: 1px solid #222;">
                  <div style="text-align: center; margin-bottom: 32px;">
                    <span style="font-size: 48px;">💎</span>
                    <h1 style="color: #fff; font-size: 24px; font-weight: 900; margin-top: 16px; letter-spacing: -0.025em;">THANH TOÁN THÀNH CÔNG!</h1>
                  </div>

                  <div style="background: #111; padding: 24px; border-radius: 16px; border: 1px solid #333; margin-bottom: 32px;">
                    <p style="margin: 0 0 8px; color: #888; font-size: 14px;">Đơn hàng của bạn cho:</p>
                    <h2 style="margin: 0 0 20px; color: #ec4899; font-size: 20px; font-weight: 800;">${mapList.title}</h2>
                    
                    <div style="height: 1px; background: #222; margin-bottom: 20px;"></div>
                    
                    <p style="margin: 0 0 24px; color: #fff; line-height: 1.6;">Cảm ơn bạn đã tin tưởng Ghet.review! Đây là kho báu mà tụi mình thà giữ kín còn hơn bị "over-rated" — giờ nó là của bạn.</p>
                    
                    <a href="${mapList.mapUrl}" 
                       style="display: block; text-align: center; background: #fff; color: #000; padding: 16px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 16px; transition: all 0.2s;">
                      MỞ GOOGLE MAPS NGAY 🗺️
                    </a>
                  </div>

                  <div style="text-align: center; color: #555; font-size: 12px;">
                    <p style="margin-bottom: 4px;">Mã đơn hàng: ${order.order_code}</p>
                    <p>© ${new Date().getFullYear()} Ghet.review — Nền tảng "dị ứng" Seeding</p>
                  </div>
                </div>
              `,
            });
            console.log('Email sent successfully via SMTP:', info.messageId);
          } else {
            console.warn('mapList not found or missing mapUrl for slug:', order.map_slug);
          }
        } catch (emailErr) {
          console.error('Failed to send email via SMTP:', emailErr);
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
