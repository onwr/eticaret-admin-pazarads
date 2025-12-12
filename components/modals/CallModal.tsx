
import React, { useState, useEffect } from 'react';
import { X, Phone, Clock, FileText, Check, User, MapPin, Package, AlertTriangle } from 'lucide-react';
import { Order, CallOutcome } from '../../types';
import { getCallCenterService } from '../../lib/callcenter/services';

interface CallModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (outcome: CallOutcome, note: string, duration: number) => Promise<void>;
  provider?: 'alotech' | 'ccs' | 'twilio';
}

const CallModal: React.FC<CallModalProps> = ({
  order,
  isOpen,
  onClose,
  onComplete,
  provider = 'alotech'
}) => {
  const [duration, setDuration] = useState(0);
  const [note, setNote] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const [callId, setCallId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer
  useEffect(() => {
    let interval: any;
    if (isOpen) {
      interval = setInterval(() => setDuration(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || isSubmitting) return;

      // Only trigger if not typing in note textarea
      if (document.activeElement?.tagName === 'TEXTAREA') return;

      switch (e.key) {
        case '1': handleResult(CallOutcome.REACHED_CONFIRMED); break;
        case '2': handleResult(CallOutcome.UNREACHABLE); break;
        case '3': handleResult(CallOutcome.BUSY); break;
        case '4': handleResult(CallOutcome.WRONG_NUMBER); break;
        case '5': handleResult(CallOutcome.REACHED_CANCELLED); break;
        case 'Escape': onClose(); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, note, duration]);

  const initiateCall = async () => {
    if (!order.customer?.phone) return;
    setIsCalling(true);
    try {
      const service = getCallCenterService(provider as 'alotech' | 'ccs' | 'twilio');
      const result = await service.initiateCall(order.customer.phone);
      if (result.success && result.callId) {
        setCallId(result.callId);
      }
    } catch (e) {
      console.error("Call failed", e);
    }
  };

  const handleResult = async (outcome: CallOutcome) => {
    setIsSubmitting(true);

    // Hang up if active
    if (callId) {
      const service = getCallCenterService(provider as 'alotech' | 'ccs' | 'twilio');
      await service.endCall(callId);
    }

    await onComplete(outcome, note, duration);
    setIsSubmitting(false);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-900 w-full max-w-6xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-700">

        {/* LEFT: Customer & Order Info */}
        <div className="w-full md:w-1/3 bg-gray-800 border-r border-gray-700 p-6 overflow-y-auto text-gray-300">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">{order.orderNumber}</h2>
              <div className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                <Clock size={14} /> Received: {new Date(order.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="bg-blue-900/50 text-blue-300 px-3 py-1 rounded text-sm font-mono font-bold border border-blue-800">
              {formatTime(duration)}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <User size={14} /> Customer
              </h3>
              <p className="text-lg font-bold text-white">{order.customer?.name}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="font-mono text-xl text-yellow-400">{order.customer?.phone}</span>
                <button
                  onClick={initiateCall}
                  disabled={isCalling}
                  className={`p-2 rounded-full ${isCalling ? 'bg-red-600 animate-pulse' : 'bg-green-600 hover:bg-green-500'} text-white transition-colors`}
                  title="Click to Call"
                >
                  <Phone size={18} />
                </button>
              </div>
              {isCalling && <p className="text-xs text-green-400 mt-2 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span> Dialing via {provider}...</p>}
            </div>

            <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Package size={14} /> Order
              </h3>
              <div className="flex gap-3">
                <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                  <img src={order.product?.images[0]?.url} className="w-full h-full object-cover" alt="" />
                </div>
                <div>
                  <p className="font-bold text-white">{order.product?.name}</p>
                  <p className="text-sm text-gray-400 mt-1">{order.variantSelection}</p>
                  <p className="text-lg font-bold text-green-400 mt-1">${order.totalAmount}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <MapPin size={14} /> Shipping Address
              </h3>
              <p className="text-sm leading-relaxed text-gray-300">
                {order.customer?.address}<br />
                {order.customer?.district}, {order.customer?.city}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: Script & Actions */}
        <div className="flex-1 bg-gray-900 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-300">Call Script</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={24} /></button>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6 flex-1 overflow-y-auto">
            <p className="text-gray-300 text-lg leading-relaxed mb-4">
              "Hello, I am calling from <span className="text-blue-400 font-bold">Pazarads Store</span> to confirm your order for the <span className="text-white font-bold">{order.product?.name}</span>."
            </p>
            <p className="text-gray-300 text-lg leading-relaxed mb-4">
              "We have your address as: <span className="text-yellow-200">{order.customer?.address}, {order.customer?.district}</span>. Is this correct?"
            </p>
            <p className="text-gray-300 text-lg leading-relaxed">
              "Great! Your total is <span className="text-green-400 font-bold">${order.totalAmount}</span> payable on delivery. We will ship it today."
            </p>
          </div>

          <div className="mb-6">
            <label className="text-sm font-bold text-gray-500 uppercase mb-2 block flex items-center gap-2">
              <FileText size={14} /> Agent Notes
            </label>
            <textarea
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
              placeholder="Add specific notes about the call..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <button
              onClick={() => handleResult(CallOutcome.REACHED_CONFIRMED)}
              className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl flex flex-col items-center gap-2 transition-colors relative group"
            >
              <span className="absolute top-2 right-2 text-[10px] bg-black/20 px-1.5 rounded text-white/70 group-hover:bg-black/40">1</span>
              <Check size={24} />
              <span className="font-bold text-sm">CONFIRM</span>
            </button>

            <button
              onClick={() => handleResult(CallOutcome.UNREACHABLE)}
              className="bg-gray-700 hover:bg-gray-600 text-white p-4 rounded-xl flex flex-col items-center gap-2 transition-colors relative group"
            >
              <span className="absolute top-2 right-2 text-[10px] bg-black/20 px-1.5 rounded text-white/70 group-hover:bg-black/40">2</span>
              <AlertTriangle size={24} />
              <span className="font-bold text-sm">UNREACHABLE</span>
            </button>

            <button
              onClick={() => handleResult(CallOutcome.BUSY)}
              className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-xl flex flex-col items-center gap-2 transition-colors relative group"
            >
              <span className="absolute top-2 right-2 text-[10px] bg-black/20 px-1.5 rounded text-white/70 group-hover:bg-black/40">3</span>
              <Clock size={24} />
              <span className="font-bold text-sm">BUSY</span>
            </button>

            <button
              onClick={() => handleResult(CallOutcome.WRONG_NUMBER)}
              className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-xl flex flex-col items-center gap-2 transition-colors relative group"
            >
              <span className="absolute top-2 right-2 text-[10px] bg-black/20 px-1.5 rounded text-white/70 group-hover:bg-black/40">4</span>
              <User size={24} />
              <span className="font-bold text-sm">WRONG #</span>
            </button>

            <button
              onClick={() => handleResult(CallOutcome.REACHED_CANCELLED)}
              className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-xl flex flex-col items-center gap-2 transition-colors relative group"
            >
              <span className="absolute top-2 right-2 text-[10px] bg-black/20 px-1.5 rounded text-white/70 group-hover:bg-black/40">5</span>
              <X size={24} />
              <span className="font-bold text-sm">CANCEL</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallModal;
