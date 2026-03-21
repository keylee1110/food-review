import * as React from 'react';

interface HiddenGemEmailProps {
  title: string;
  mapUrl: string;
  orderCode: string;
}

export const HiddenGemEmail: React.FC<Readonly<HiddenGemEmailProps>> = ({
  title,
  mapUrl,
  orderCode,
}) => (
  <div style={{ fontFamily: 'sans-serif', color: '#111' }}>
    <h1 style={{ color: '#ec4899' }}>Thanh toán thành công!</h1>
    <p>Cảm ơn bạn đã mua danh sách địa điểm <strong>{title}</strong>.</p>
    <p>Mã đơn hàng của bạn là: <strong>{orderCode}</strong></p>
    
    <div style={{ margin: '24px 0', padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
      <p style={{ margin: '0 0 12px 0', fontWeight: 'bold' }}>Đây là Kho báu của bạn (Google Maps List):</p>
      <a 
        href={mapUrl} 
        style={{
          display: 'inline-block',
          backgroundColor: '#ec4899',
          color: '#ffffff',
          padding: '12px 24px',
          textDecoration: 'none',
          borderRadius: '6px',
          fontWeight: 'bold'
        }}
      >
        Mở Danh Sách Trên Google Maps
      </a>
      <p style={{ marginTop: '12px', fontSize: '12px', color: '#666' }}>
        Hoặc copy link này: {mapUrl}
      </p>
    </div>

    <p>Chúc bạn có những trải nghiệm tuyệt vời!</p>
    <p><em>Bạn có thể xem lại chi tiết bài review khi truy cập lại ứng dụng.</em></p>
  </div>
);
