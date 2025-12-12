
import React, { useState, useEffect } from 'react';
import { X, Loader2, Truck, Box, AlertTriangle, Info } from 'lucide-react';
import { Order, ShippingCompany, ShippingProviderType } from '../../types';
import { getShippingCompanies, createShipment } from '../../lib/api';

import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../contexts/NotificationContext';
import ConfirmDialog from '../ConfirmDialog';

interface ShippingModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

const ShippingModal: React.FC<ShippingModalProps> = ({ order, isOpen, onClose }) => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [companies, setCompanies] = useState<ShippingCompany[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [subCarrierCode, setSubCarrierCode] = useState('');
  const [codAmount, setCodAmount] = useState<number>(order.totalAmount);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState<{ total: number, breakdown: string } | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCompanies();
      // Default COD logic: if payment method is COD or CC_ON_DOOR, default to total amount
      const isCod = order.paymentMethod === 'COD' || order.paymentMethod === 'CC_ON_DOOR';
      setCodAmount(isCod ? order.totalAmount : 0);
    }
  }, [isOpen, order]);

  // Recalculate price quote when selection changes
  useEffect(() => {
    calculateQuote();
  }, [selectedCompanyId, subCarrierCode, codAmount]);

  const loadCompanies = async () => {
    const data = await getShippingCompanies();
    setCompanies(data.filter(c => c.isActive));
    // Select default
    const def = data.find(c => c.isDefault && c.isActive);
    if (def) setSelectedCompanyId(def.id);
  };

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);

  const calculateQuote = () => {
    setEstimatedCost(null);
    setWarning(null);

    if (!selectedCompany) return;

    // Logic only applies if rules exist (mock data has them for Fest)
    if (selectedCompany.pricingRules && subCarrierCode) {
      const rule = selectedCompany.pricingRules.find(r => r.carrierCode === subCarrierCode);
      if (rule) {
        // 1. Payment Method Validation
        if (rule.allowedPaymentMethods && !rule.allowedPaymentMethods.includes(order.paymentMethod)) {
          setWarning(`UYARI: ${rule.carrierCode} firması ${order.paymentMethod} ödeme yöntemini desteklememektedir.`);
          return; // Don't calculate cost if invalid
        }

        let cost = rule.baseCost;
        let breakdown = `Taban Kargo: ${rule.baseCost} TL`;

        // 2. Service Fee (e.g. Aras 1.50)
        if (rule.serviceFee) {
          cost += rule.serviceFee;
          breakdown += ` + Hizmet Bedeli: ${rule.serviceFee} TL`;
        }

        // 3. COD Commission (e.g. PTT tiers)
        if (codAmount > 0 && rule.codCommission) {
          const tier = rule.codCommission.find(t => codAmount >= t.min && codAmount <= t.max);
          if (tier) {
            cost += tier.fee;
            breakdown += ` + Tahsilat Komisyonu: ${tier.fee} TL`;
          }
        }

        setEstimatedCost({ total: cost, breakdown });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedCompany) return;

    if (warning) {
      setIsConfirmOpen(true);
      return;
    }

    await handleConfirmShipment();
  };

  const handleConfirmShipment = async () => {
    setIsSubmitting(true);
    try {
      await createShipment({
        orderId: order.id,
        companyId: selectedCompanyId,
        subCarrierCode: subCarrierCode || undefined, // Send the code (ARS, PTT) to backend
        codAmount
      }, { id: user.id, name: user.name || 'Agent' });
      onClose();
    } catch (e) {
      console.error(e);
      addNotification('error', 'Failed to create shipment. Check console.');
    } finally {
      setIsSubmitting(false);
      setIsConfirmOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Truck size={20} className="text-blue-600" />
              Kargo Barkodu Oluştur
            </h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4 flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-blue-900">Sipariş: {order.orderNumber}</p>
                <p className="text-xs text-blue-700">{order.customer?.name} - {order.customer?.city}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2 py-1 rounded">
                  {order.paymentMethod}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kargo Firması</label>
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="">Firma Seçiniz...</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Fest Kargo Sub-Carrier Logic with Price Quote */}
            {selectedCompany?.code === 'FEST' && selectedCompany.type === ShippingProviderType.AGGREGATOR && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 animate-fade-in space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gönderim Yapılacak Firma (Alt Taşıyıcı)</label>
                  <select
                    required
                    value={subCarrierCode}
                    onChange={(e) => setSubCarrierCode(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    <option value="">Seçiniz (Aras, PTT vb.)</option>
                    {selectedCompany.subCarriers?.map(sc => (
                      <option key={sc.code} value={sc.code}>{sc.name}</option>
                    ))}
                  </select>
                </div>

                {warning && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertTriangle size={16} className="text-red-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-700 font-medium">{warning}</p>
                  </div>
                )}

                {estimatedCost && !warning && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-green-800 flex items-center gap-1">
                        <Info size={12} /> Fiyat Teklifi
                      </span>
                      <span className="text-sm font-bold text-green-700">{estimatedCost.total.toFixed(2)} TL</span>
                    </div>
                    <p className="text-[10px] text-green-600">{estimatedCost.breakdown}</p>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tahsilat Tutarı (Kapıda Ödeme)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₺</span>
                <input
                  type="number"
                  step="0.01"
                  value={codAmount}
                  onChange={(e) => setCodAmount(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Sipariş peşin ödenmişse 0 giriniz.</p>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">İptal</button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedCompanyId || !!warning}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-70 flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Box size={16} />}
                Barkod Oluştur
              </button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmShipment}
        title="Uyarı"
        message={`${warning}\n\nYine de devam etmek istiyor musunuz?`}
        confirmText="Evet, Devam Et"
        cancelText="İptal"
        isDestructive={false}
      />
    </>
  );
};

export default ShippingModal;
