import React, { useState, useEffect } from 'react';
import { Domain, DomainFormData, Product, Template, Language } from '../types';
import { getDomains, createDomain, updateDomain, deleteDomain, getProducts, getTemplates, getLanguages } from '../lib/api';
import DomainModal from '../components/modals/DomainModal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import { Globe, Link as LinkIcon, ExternalLink, Plus, Edit2, Trash2, ShieldCheck, ShieldAlert, Code, Eye } from 'lucide-react';
import { useLanguage } from '../lib/i18n';

interface DomainsProps {
  onPreview?: (domain: string) => void;
}

const Domains: React.FC<DomainsProps> = ({ onPreview }) => {
  const { t } = useLanguage();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | undefined>(undefined);
  const [deletingDomain, setDeletingDomain] = useState<Domain | undefined>(undefined);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [d, p, t, l] = await Promise.all([
        getDomains(),
        getProducts(),
        getTemplates(),
        getLanguages()
      ]);
      setDomains(d);
      setProducts(p);
      setTemplates(t);
      setLanguages(l);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = () => {
    setEditingDomain(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (domain: Domain) => {
    setEditingDomain(domain);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (deletingDomain) {
      await deleteDomain(deletingDomain.id);
      setDeletingDomain(undefined);
      fetchData();
    }
  };

  const handleModalSubmit = async (data: DomainFormData) => {
    if (editingDomain) {
      await updateDomain(editingDomain.id, data);
    } else {
      await createDomain(data);
    }
    fetchData();
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><LoadingSpinner size={40} /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t('domains.title')}</h2>
          <p className="text-sm text-gray-500 mt-1">{t('domains.subtitle')}</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={18} />
          {t('domains.connect_btn')}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('domains.table_domain')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('domains.table_product')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('domains.table_config')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('domains.table_cloaking')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('domains.table_status')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">{t('domains.table_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {domains.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {t('domains.no_domains')}
                  </td>
                </tr>
              ) : (
                domains.map((domain) => {
                  const lang = languages.find(l => l.id === domain.languageId);

                  return (
                    <tr key={domain.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <Globe size={18} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{domain.domain}</p>
                            <button
                              onClick={() => onPreview && onPreview(domain.domain)}
                              className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-0.5"
                            >
                              {t('domains.live_preview')} <Eye size={10} />
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <LinkIcon size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-700 font-medium">
                            {domain.product?.name || t('domains.unlinked')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <span className="font-semibold w-16">{t('domains.config_language')}</span>
                            <span className="uppercase bg-gray-100 px-1.5 rounded">{lang?.code || '?'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <span className="font-semibold w-16">{t('domains.config_template')}</span>
                            <span className="truncate max-w-[100px]">{domain.templateId}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <span className="font-semibold w-16">{t('domains.config_pixels')}</span>
                            {domain.pixelCode ? <span className="text-green-600 flex items-center gap-0.5"><Code size={10} /> {t('domains.pixels_active')}</span> : <span className="text-gray-400">-</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {domain.isCloakingActive ? (
                          <div className="flex items-center gap-1.5 text-green-700 bg-green-50 px-2 py-1 rounded-lg w-fit">
                            <ShieldCheck size={16} />
                            <span className="text-xs font-medium">{t('domains.cloaking_active')}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-gray-500 bg-gray-100 px-2 py-1 rounded-lg w-fit">
                            <ShieldAlert size={16} />
                            <span className="text-xs font-medium">{t('domains.cloaking_disabled')}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${domain.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${domain.isActive ? 'bg-green-600' : 'bg-red-600'}`}></span>
                          {domain.isActive ? t('domains.status_live') : t('domains.status_offline')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(domain)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title={t('domains.action_configure')}
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => setDeletingDomain(domain)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title={t('domains.action_delete')}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DomainModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingDomain}
        products={products}
        templates={templates}
        languages={languages}
      />

      <ConfirmDialog
        isOpen={!!deletingDomain}
        onClose={() => setDeletingDomain(undefined)}
        onConfirm={handleDelete}
        title={t('domains.delete_title')}
        message={t('domains.delete_message').replace('{domain}', deletingDomain?.domain || '')}
        isDestructive={true}
        confirmText={t('domains.delete_confirm')}
      />
    </div>
  );
};

export default Domains;