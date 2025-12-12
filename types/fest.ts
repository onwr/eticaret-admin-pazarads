
export enum FestCargoStatus {
  KABUL_BEKLIYOR = '00',
  KABUL_EDILDI = '01',
  TESLIM_EDILDI = '10',
  IADE_BASLATILDI = '20',
  IADE_GONDERICIYE_EDILDI = '21',
  IADE_KURYE_SURECI = '22',
  IADE_CIKIS_SUBESI = '23',
  IADE_SUBE = '24',
  TESLIM_EDILEMEDI_TEKRAR = '30',
  TRANSFER_SURECINDE = '40',
  TESLIMAT_SUBESINDE = '41',
  KURYE_DAGITIMDA = '42',
  TESLIM_EDILEMEDI_1 = '50',
  TESLIM_EDILEMEDI_2 = '60',
}

export enum FestAmountType {
  TOPLU_GONDERI = 1,
  UCRET_ALICI = 2,
  KAPIDA_NAKIT = 3,
  KREDI_KARTI = 5,
  KAPIDA_KREDI_KARTI = 6
}

export interface FestConsignmentPayload {
  customer: string; // Alıcı Adı
  customer_code?: string;
  province_name: string; // İl
  county_name: string; // İlçe
  district?: string; // Mahalle
  address: string;
  tax_number?: string;
  tax_office?: string;
  telephone: string;
  branch_code: string | number; // Varış Şubesi Kodu (Örn: 705 Aras Çavuşoğlu)
  consignment_type_id?: number; // Varsayılan 1 (Koli)
  amount_type_id?: number; // Ödeme Tipi
  amount?: string; // Tutar (Kapıda ödeme varsa)
  order_number?: string;
  quantity?: number;
  weight?: number;
  desi?: number;
  summary?: string; // İçerik
  barcode?: string; // Müşteri barkodu (optional)
}

export interface FestConsignmentResponse {
  error: boolean;
  result: string;
  barcode: string;
  record_id: number;
}

export interface FestTrackingResponse {
  error: boolean;
  hata: number;
  toplam_kayit: number;
  data: FestTrackingData[];
}

export interface FestTrackingData {
  gonderino: string;
  musteribarkod: string;
  cikisno: string;
  aliciadi: string;
  alicisoyad: string;
  sehiradi: string;
  durum: string; // "1"
  statu_no: string; // "10" (Critical status code)
  sonuc: string; // "TESLİM"
  sonuc_aciklama: string;
  sonuctarihi: string;
  tahsiltarihi: string;
  teslimtarihi: string;
  hareketler?: FestMovement[];
}

export interface FestMovement {
  gonderi_no: string;
  yapilan_islem: string; // "Kabul Edildi", "Teslim Edildi"
  tarih: string;
  saat: string;
}
