import React, { useState } from 'react';
import { Sparkles, FileText, Globe, ShieldAlert, BrainCircuit, ArrowRight, Image as ImageIcon, BarChart2, Zap, Upload, Settings } from 'lucide-react';
import AdCopyModal from '../components/modals/AdCopyModal';
import { generateProductDescription, translateText, analyzeOrderFraud, generateAiImage, analyzeAdPerformance } from '../lib/api';
import AiOutput from '../components/AiOutput';
import { AiProvider, AiResponse, FraudAnalysisResult } from '../types';
import { useLanguage } from '../lib/i18n';
import { useNotification } from '../contexts/NotificationContext';

const AiPanel: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'image' | 'analysis' | 'text' | 'translator' | 'detective'>('image');
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [activeProvider, setActiveProvider] = useState<AiProvider>(AiProvider.GEMINI);

  // Image Generator State
  const [imageProvider, setImageProvider] = useState<'pollinations' | 'dalle'>('pollinations');
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageResult, setImageResult] = useState<AiResponse | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);

  // Load settings on mount
  const [apiKeys, setApiKeys] = useState<{ openai?: string }>({});

  React.useEffect(() => {
    const saved = localStorage.getItem('ai_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setApiKeys({ openai: parsed.openaiKey });
      if (parsed.imageProvider) setImageProvider(parsed.imageProvider);
    }
  }, []);

  // Ad Analysis State
  const [adPlatform, setAdPlatform] = useState('Facebook Ads');
  const [analysisFile, setAnalysisFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AiResponse | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);

  // Description State
  const [descProduct, setDescProduct] = useState('');
  const [descResult, setDescResult] = useState<AiResponse | null>(null);
  const [isDescLoading, setIsDescLoading] = useState(false);

  // Translate State
  const [transText, setTransText] = useState('');
  const [transLang, setTransLang] = useState('tr');
  const [transResult, setTransResult] = useState<AiResponse | null>(null);
  const [isTransLoading, setIsTransLoading] = useState(false);

  // Fraud State
  const [orderId, setOrderId] = useState('');
  const [fraudResult, setFraudResult] = useState<AiResponse | null>(null);
  const [isFraudLoading, setIsFraudLoading] = useState(false);

  const { addNotification } = useNotification();

  const handleGenerateImage = async () => {
    setIsImageLoading(true);
    setImageResult(null);
    try {
      const res = await generateAiImage(imagePrompt, {
        provider: imageProvider,
        apiKey: apiKeys.openai
      });

      if (!res.success && res.error) {
        addNotification('error', res.error);
      }

      setImageResult(res);
    } catch (e) {
      console.error(e);
      addNotification('error', t('ai.error_generic'));
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleAnalyzeAd = async () => {
    setIsAnalysisLoading(true);
    try {
      const res = await analyzeAdPerformance(adPlatform, analysisFile || undefined);
      setAnalysisResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalysisLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAnalysisFile(e.target.files[0]);
    }
  };

  const handleGenerateDesc = async () => {
    setIsDescLoading(true);
    try {
      const res = await generateProductDescription({ name: descProduct, provider: activeProvider });
      setDescResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDescLoading(false);
    }
  };

  const handleTranslate = async () => {
    setIsTransLoading(true);
    try {
      const res = await translateText(transText, transLang, activeProvider);
      setTransResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTransLoading(false);
    }
  };

  const handleFraudCheck = async () => {
    setIsFraudLoading(true);
    try {
      const res = await analyzeOrderFraud('o1', activeProvider);
      setFraudResult(res);
    } catch (e) {
      console.error(e);
      addNotification('error', t('ai.error_demo'));
    } finally {
      setIsFraudLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <BrainCircuit size={120} />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <BrainCircuit size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t('ai.title')}</h1>
              <p className="text-violet-100 mt-1">{t('ai.subtitle')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20">
            <div className="px-3 py-1.5 rounded-lg bg-white/20 text-xs font-bold uppercase tracking-wider">
              {t('ai.active_model')}
            </div>
            <select
              value={activeProvider}
              onChange={(e) => setActiveProvider(e.target.value as AiProvider)}
              className="bg-transparent border-none text-white font-medium focus:ring-0 cursor-pointer [&>option]:text-gray-900"
            >
              <option value={AiProvider.GEMINI}>{t('ai.provider_gemini')}</option>
              <option value={AiProvider.OPENAI}>{t('ai.provider_openai')}</option>
              <option value={AiProvider.CLAUDE}>{t('ai.provider_claude')}</option>
            </select>
            <Settings size={16} className="text-white/70" />
          </div>
        </div>

        <div className="flex gap-2 mt-8 overflow-x-auto pb-2 custom-scrollbar relative z-10">
          <button
            onClick={() => setActiveTab('image')}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'image' ? 'bg-white text-violet-700 shadow-md' : 'bg-white/10 hover:bg-white/20'}`}
          >
            <ImageIcon size={18} />
            {t('ai.tab_image')}
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'analysis' ? 'bg-white text-violet-700 shadow-md' : 'bg-white/10 hover:bg-white/20'}`}
          >
            <BarChart2 size={18} />
            {t('ai.tab_analysis')}
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'text' ? 'bg-white text-violet-700 shadow-md' : 'bg-white/10 hover:bg-white/20'}`}
          >
            <FileText size={18} />
            {t('ai.tab_text')}
          </button>
          <button
            onClick={() => setActiveTab('translator')}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'translator' ? 'bg-white text-violet-700 shadow-md' : 'bg-white/10 hover:bg-white/20'}`}
          >
            <Globe size={18} />
            {t('ai.tab_translator')}
          </button>
          <button
            onClick={() => setActiveTab('detective')}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'detective' ? 'bg-white text-violet-700 shadow-md' : 'bg-white/10 hover:bg-white/20'}`}
          >
            <ShieldAlert size={18} />
            {t('ai.tab_detective')}
          </button>
        </div>
      </div>

      {/* Image Generator Tab */}
      {activeTab === 'image' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
              <ImageIcon className="text-pink-600" size={20} /> {t('ai.image_title')}
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              {t('ai.image_desc')}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('ai.image_engine')}</label>
                <select
                  value={imageProvider}
                  onChange={(e) => setImageProvider(e.target.value as 'pollinations' | 'dalle')}
                  className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-pink-500 bg-gray-50"
                >
                  <option value="pollinations">{t('ai.img_provider_pollinations')}</option>
                  <option value="dalle">{t('ai.img_provider_dalle')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('ai.image_prompt')}</label>
                <textarea
                  className="w-full border border-gray-200 rounded-xl p-3 h-32 resize-none focus:ring-2 focus:ring-pink-500 outline-none"
                  placeholder={t('ai.image_placeholder')}
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                />
              </div>
              <button
                onClick={handleGenerateImage}
                disabled={!imagePrompt || isImageLoading}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isImageLoading ? (
                  <>
                    <span className="animate-spin">✨</span> {t('ai.generating')}
                  </>
                ) : (
                  <>
                    <Sparkles size={18} /> {t('ai.generate_btn')}
                  </>
                )}
              </button>
              {imageProvider === 'dalle' && (
                <p className="text-xs text-gray-500 text-center">
                  {t('ai.dalle_warning')}
                </p>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center min-h-[400px]">
            {imageResult ? (
              <div className="w-full h-full flex flex-col">
                <img src={imageResult.content} alt="Generated" className="w-full h-full object-contain rounded-lg shadow-md bg-gray-50" />
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Zap size={12} className="text-yellow-500" /> {t('ai.free_service')}
                  </span>
                  <a
                    href={imageResult.content}
                    download="generated-image.jpg"
                    target="_blank"
                    rel="noreferrer"
                    className="text-pink-600 font-medium text-sm hover:underline flex items-center gap-1"
                  >
                    <Upload size={14} className="rotate-180" /> {t('ai.download')}
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <ImageIcon size={64} className="mx-auto mb-4 opacity-20" />
                <p>{t('ai.no_image')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ad Analysis Tab */}
      {activeTab === 'analysis' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
              <BarChart2 className="text-blue-600" size={20} /> {t('ai.analysis_title')}
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              {t('ai.analysis_desc')}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('ai.platform')}</label>
                <select
                  className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
                  value={adPlatform}
                  onChange={(e) => setAdPlatform(e.target.value)}
                >
                  <option>{t('ai.platform_facebook')}</option>
                  <option>{t('ai.platform_instagram')}</option>
                  <option>{t('ai.platform_google')}</option>
                  <option>{t('ai.platform_tiktok')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('ai.upload_report')}</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative">
                  <input
                    type="file"
                    accept=".csv, .xlsx, .xls"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-xs text-gray-500 font-medium">
                    {analysisFile ? analysisFile.name : t('ai.drop_file')}
                  </p>
                </div>
              </div>

              <button
                onClick={handleAnalyzeAd}
                disabled={isAnalysisLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isAnalysisLoading ? t('ai.analyzing') : t('ai.analyze_btn')}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[400px]">
            {analysisResult ? (
              <div className="prose prose-sm max-w-none">
                <AiOutput isLoading={false} content={analysisResult.content} title={t('ai.analysis_report')} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                <BarChart2 size={64} className="mx-auto mb-4 opacity-20" />
                <p>{t('ai.no_analysis')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Text Wizard Tab (Formerly Generator) */}
      {activeTab === 'text' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
              <Sparkles className="text-purple-600" size={20} /> {t('ai.text_wizard_title')}
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              {t('ai.text_wizard_desc')}
            </p>
            <button
              onClick={() => setIsAdModalOpen(true)}
              className="w-full py-3 bg-purple-50 text-purple-700 font-bold rounded-xl border-2 border-purple-100 hover:bg-purple-100 hover:border-purple-200 transition-all flex items-center justify-center gap-2"
            >
              {t('ai.start_wizard')} <ArrowRight size={18} />
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
              <FileText className="text-indigo-600" size={20} /> {t('ai.product_desc_title')}
            </h3>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={descProduct}
                onChange={(e) => setDescProduct(e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder={t('ai.product_name_placeholder')}
              />
              <button
                onClick={handleGenerateDesc}
                disabled={!descProduct || isDescLoading}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                {t('ai.create_btn')}
              </button>
            </div>
            <div className="flex-1 min-h-[150px]">
              <AiOutput isLoading={isDescLoading} content={descResult?.content} title="Açıklama" />
            </div>
          </div>
        </div>
      )}

      {/* Translator Tab */}
      {activeTab === 'translator' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[600px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Globe className="text-green-600" size={20} /> {t('ai.translator_title')}
            </h3>
            <select
              value={transLang}
              onChange={(e) => setTransLang(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium"
            >
              <option value="tr">{t('ai.lang_tr')}</option>
              <option value="en">{t('ai.lang_en')}</option>
              <option value="ar">{t('ai.lang_ar')}</option>
              <option value="de">{t('ai.lang_de')}</option>
              <option value="fr">{t('ai.lang_fr')}</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6 flex-1">
            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-500 uppercase mb-2">{t('ai.input_text')}</label>
              <textarea
                className="flex-1 w-full border border-gray-200 rounded-xl p-4 resize-none focus:ring-2 focus:ring-green-500 outline-none bg-gray-50"
                placeholder={t('ai.input_placeholder')}
                value={transText}
                onChange={(e) => setTransText(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-500 uppercase mb-2">{t('ai.ai_output')}</label>
              <div className="flex-1 relative">
                <AiOutput isLoading={isTransLoading} content={transResult?.content} title={t('ai.ai_output')} />
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <button
              onClick={handleTranslate}
              disabled={!transText || isTransLoading}
              className="bg-green-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-green-700 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isTransLoading ? t('ai.translating') : t('ai.translate_btn')}
            </button>
          </div>
        </div>
      )}

      {/* Fraud Detective Tab */}
      {activeTab === 'detective' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 md:col-span-1">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
              <ShieldAlert className="text-red-600" size={20} /> {t('ai.risk_title')}
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              {t('ai.risk_desc')}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('ai.order_id')}</label>
                <input
                  type="text"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2"
                  placeholder="Örn: o1"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                />
                <p className="text-xs text-gray-400 mt-1">{t('ai.demo_hint')}</p>
              </div>
              <button
                onClick={handleFraudCheck}
                disabled={isFraudLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg transition-colors disabled:opacity-70"
              >
                {isFraudLoading ? t('ai.analyzing') : t('ai.analyze_risk_btn')}
              </button>
            </div>
          </div>

          <div className="md:col-span-2">
            {fraudResult?.data ? (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-900">{t('ai.analysis_report')}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold 
                          ${(fraudResult.data as FraudAnalysisResult).riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                      (fraudResult.data as FraudAnalysisResult).riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                        (fraudResult.data as FraudAnalysisResult).riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'}`}>
                    {(fraudResult.data as FraudAnalysisResult).riskLevel} {t('ai.risk_suffix')}
                  </span>
                </div>

                <div className="flex items-center gap-6 mb-8">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eee" strokeWidth="3" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={(fraudResult.data as FraudAnalysisResult).score > 50 ? "#DC2626" : "#10B981"} strokeWidth="3" strokeDasharray={`${(fraudResult.data as FraudAnalysisResult).score}, 100`} />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-3xl font-bold text-gray-900">{(fraudResult.data as FraudAnalysisResult).score}</span>
                      <span className="text-[10px] text-gray-500 uppercase">{t('ai.risk_score')}</span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 mb-2">{t('ai.detected_signals')}</h4>
                    <ul className="space-y-2">
                      {(fraudResult.data as FraudAnalysisResult).reasons.map((reason, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <ShieldAlert size={16} className="text-red-500 mt-0.5 shrink-0" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">{t('ai.recommended_action')}</span>
                  <span className="font-bold text-gray-900">{(fraudResult.data as FraudAnalysisResult).recommendedAction}</span>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center text-center h-full">
                <ShieldAlert size={48} className="text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">{t('ai.no_data')}</p>
                <p className="text-sm text-gray-400">{t('ai.run_check_hint')}</p>
              </div>
            )
            }
          </div>
        </div>
      )}

      <AdCopyModal isOpen={isAdModalOpen} onClose={() => setIsAdModalOpen(false)} />
    </div>
  );
};

export default AiPanel;
