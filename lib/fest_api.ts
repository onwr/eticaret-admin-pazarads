
import { Shipment, ShippingStatus } from '../types';

// Mock Data for Fest Cargo API
// Based on documentation:
// 00 => Kabul Bekliyor
// 01 => Kabul Edildi
// 10 => Teslim Edildi
// 20 => İade - İade Süreci Başlatıldı
// 21 => İade - Göndericiye İade Edildi
// 22 => İade - Kurye İade Sürecini Başlattı
// 23 => İade - İade Çıkış Şubesine Ulaştı
// 24 => İade - Şubeden İade Süreci Başlatıldı
// 30 => Teslim Edilemedi - Tekrar Dağıtım Planlanında
// 40 => Transfer Sürecinde
// 41 => Teslimat Şubesinde
// 42 => Kurye Dağıtımda
// 50 => Teslim Edilemedi
// 60 => Teslim Edilemedi - Teslimat Şubesinde

export interface FestCargoMovement {
    gonderi_no: string;
    kullanici_adi: string;
    yapilan_islem: string;
    tarih: string;
    saat: string;
}

export interface FestCargoDetail {
    gonderino: string;
    durum: string; // "Teslim", "İade" etc.
    statu_no: string; // "10", "20" etc.
    sonuc_durum: string;
    sonuc_aciklama: string;
    sonuc_tarihi: string;
    hareketler: FestCargoMovement[];
    alici_adi: string;
    alici_ilce: string;
    alici_sehir: string;
    varis_subesi: string;
}

// Mock function to simulate getting cargo details from Fest API
export const getFestCargoDetails = async (barcode: string): Promise<FestCargoDetail> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Return mock data based on barcode pattern or random
    const statusMap: Record<string, { code: string, label: string, desc: string }> = {
        '10': { code: '10', label: 'Teslim Edildi', desc: 'Teslim Edildi' },
        '40': { code: '40', label: 'Transfer Sürecinde', desc: 'Transfer Merkezinde İşlem Gördü' },
        '41': { code: '41', label: 'Teslimat Şubesinde', desc: 'Varış Şubesine Ulaştı' },
        '42': { code: '42', label: 'Kurye Dağıtımda', desc: 'Kurye Dağıtıma Çıkardı' },
        '20': { code: '20', label: 'İade Süreci', desc: 'İade İşlemi Başlatıldı' },
        '50': { code: '50', label: 'Teslim Edilemedi', desc: 'Adreste Bulunamadı' },
        '00': { code: '00', label: 'Kabul Bekliyor', desc: 'Kargo Firmasına İletildi' },
        '01': { code: '01', label: 'Kabul Edildi', desc: 'Kargo Firması Tarafından Teslim Alındı' },
    };

    // Randomly assign a status if not specific
    // Weighting for realism: 40% Transfer/Branch, 30% Delivered, 10% Return, 20% Distribution
    const rand = Math.random();
    let randomCode = '40';
    if (rand < 0.3) randomCode = '40'; // Transfer
    else if (rand < 0.5) randomCode = '41'; // Branch
    else if (rand < 0.7) randomCode = '42'; // Distribution
    else if (rand < 0.9) randomCode = '10'; // Delivered
    else randomCode = '20'; // Return

    const status = statusMap[randomCode];

    return {
        gonderino: barcode,
        durum: status.label,
        statu_no: status.code,
        sonuc_durum: status.label.toUpperCase(),
        sonuc_aciklama: status.desc,
        sonuc_tarihi: new Date().toISOString().split('T')[0],
        alici_adi: "Müşteri Adı",
        alici_ilce: "Merkez",
        alici_sehir: "İstanbul",
        varis_subesi: "Kadıköy Şube",
        hareketler: [
            {
                gonderi_no: barcode,
                kullanici_adi: "Sistem",
                yapilan_islem: "Kabul Edildi",
                tarih: "2024-01-01",
                saat: "10:00"
            },
            {
                gonderi_no: barcode,
                kullanici_adi: "Transfer Merkezi",
                yapilan_islem: "Transfer Sürecinde",
                tarih: "2024-01-02",
                saat: "14:00"
            },
            {
                gonderi_no: barcode,
                kullanici_adi: "Şube",
                yapilan_islem: status.desc,
                tarih: "2024-01-03",
                saat: "09:00"
            }
        ]
    };
};

// Helper to map Fest status code to internal ShippingStatus
export const mapFestStatusToInternal = (code: string): ShippingStatus => {
    switch (code) {
        case '00': return ShippingStatus.PREPARING;
        case '01': return ShippingStatus.PREPARING;
        case '10': return ShippingStatus.DELIVERED;
        case '20':
        case '21':
        case '22':
        case '23':
        case '24': return ShippingStatus.RETURNED;
        case '30':
        case '50':
        case '60': return ShippingStatus.SHIPPED; // Problematic but technically shipped/attempted
        case '40':
        case '41':
        case '42': return ShippingStatus.SHIPPED;
        default: return ShippingStatus.PREPARING;
    }
};

// Helper to identify "Problematic" statuses for UI highlighting
export const isProblematicFestStatus = (code: string): boolean => {
    return ['20', '21', '22', '23', '24', '30', '50', '60'].includes(code);
};

// Helper to identify "Stuck" shipments (mock logic)
// In a real app, this would compare last movement date with current date
export const isStuckShipment = (lastMovementDate: string): boolean => {
    const last = new Date(lastMovementDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - last.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 3; // Considered stuck if no movement for > 3 days
};
