
import React, { useState } from 'react';
import { CreditCard, Lock, Calendar } from 'lucide-react';
import { CreditCardForm } from '../types/payment';

interface PaymentFormProps {
  amount: number;
  isProcessing: boolean;
  onSubmit: (data: CreditCardForm) => void;
  providerName?: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ amount, isProcessing, onSubmit, providerName = 'Secure Payment' }) => {
  const [formData, setFormData] = useState<CreditCardForm>({
    cardHolderName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    installments: 1
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Simple formatting for card number
    if (name === 'cardNumber') {
      const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      const matches = v.match(/\d{4,16}/g);
      const match = matches && matches[0] || '';
      const parts = [];
      for (let i=0, len=match.length; i<len; i+=4) {
        parts.push(match.substring(i, i+4));
      }
      if (parts.length) {
        setFormData(prev => ({ ...prev, [name]: parts.join(' ') }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else if (name === 'cvv') {
        const v = value.replace(/[^0-9]/gi, '').slice(0, 4);
        setFormData(prev => ({ ...prev, [name]: v }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 max-w-md w-full mx-auto">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <CreditCard size={20} className="text-blue-600" />
          {providerName}
        </h3>
        <div className="flex gap-1">
           <div className="w-8 h-5 bg-gray-200 rounded"></div>
           <div className="w-8 h-5 bg-gray-200 rounded"></div>
        </div>
      </div>

      <div className="p-6">
        <div className="text-center mb-6">
           <p className="text-gray-500 text-sm mb-1">Total Amount</p>
           <p className="text-3xl font-bold text-gray-900">${amount.toFixed(2)}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Card Holder Name</label>
            <input 
              type="text" 
              name="cardHolderName"
              placeholder="JOHN DOE"
              value={formData.cardHolderName}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Card Number</label>
            <div className="relative">
              <input 
                type="text" 
                name="cardNumber"
                placeholder="0000 0000 0000 0000"
                value={formData.cardNumber}
                onChange={handleChange}
                maxLength={19}
                required
                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Expiry Date</label>
              <div className="flex gap-2">
                <select 
                  name="expiryMonth" 
                  value={formData.expiryMonth} 
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-2 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="" disabled>MM</option>
                  {Array.from({length: 12}, (_, i) => String(i + 1).padStart(2, '0')).map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <select 
                  name="expiryYear"
                  value={formData.expiryYear}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-2 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="" disabled>YY</option>
                  {Array.from({length: 10}, (_, i) => String(new Date().getFullYear() + i).slice(-2)).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CVV</label>
              <div className="relative">
                <input 
                  type="text" 
                  name="cvv"
                  placeholder="123"
                  value={formData.cvv}
                  onChange={handleChange}
                  maxLength={4}
                  required
                  className="w-full border border-gray-300 rounded-lg pl-3 pr-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-center"
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
              </div>
            </div>
          </div>

          {/* Installments Mock */}
          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Installments</label>
             <div className="space-y-2">
                <label className={`flex justify-between items-center p-3 border rounded-lg cursor-pointer ${formData.installments === 1 ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                   <div className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        name="installments" 
                        value="1" 
                        checked={formData.installments === 1}
                        onChange={() => setFormData(prev => ({...prev, installments: 1}))}
                        className="text-blue-600"
                      />
                      <span className="text-sm font-medium">Single Payment</span>
                   </div>
                   <span className="font-bold text-gray-900">${amount.toFixed(2)}</span>
                </label>
                {amount > 100 && (
                   <label className={`flex justify-between items-center p-3 border rounded-lg cursor-pointer ${formData.installments === 3 ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                      <div className="flex items-center gap-2">
                         <input 
                           type="radio" 
                           name="installments" 
                           value="3" 
                           checked={formData.installments === 3}
                           onChange={() => setFormData(prev => ({...prev, installments: 3}))}
                           className="text-blue-600"
                        />
                         <span className="text-sm font-medium">3 Installments</span>
                      </div>
                      <span className="font-bold text-gray-900">${(amount/3).toFixed(2)} x 3</span>
                   </label>
                )}
             </div>
          </div>

          <button 
            type="submit" 
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-70 disabled:scale-100 flex justify-center items-center gap-2"
          >
            {isProcessing ? (
               <>
                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                 Processing...
               </>
            ) : (
               <>
                 <Lock size={18} /> Pay ${amount.toFixed(2)}
               </>
            )}
          </button>
          
          <div className="flex justify-center items-center gap-2 text-xs text-gray-400 mt-2">
             <Lock size={10} /> 256-bit SSL Secure Payment
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;
