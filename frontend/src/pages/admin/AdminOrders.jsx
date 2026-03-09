import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '@/services/adminService';
import { formatCurrency, formatDate } from '@/utils/helpers';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import Spinner from '@/components/ui/Spinner';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { GiBee } from 'react-icons/gi';
import toast from 'react-hot-toast';
import { ORDER_STATUSES } from '@/utils/constants';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = () => {
    setLoading(true);
    adminService.getOrders({ page, limit: 15, ...(search && { search }), ...(statusFilter && { status: statusFilter }) })
      .then(({ data }) => { setOrders(data.data); setPages(data.pages); })
      .catch(() => toast.error('Failed to retrieve intelligence data.'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchOrders, [page, search, statusFilter]);

  const handleUpdateStatus = async () => {
    setUpdating(true);
    try {
      await adminService.updateOrderStatus(selected._id, { status: newStatus, note });
      toast.success('Protocol updated successfully');
      setSelected(null);
      fetchOrders();
    } catch { toast.error('Modification failed'); }
    finally { setUpdating(false); }
  };

  return (
    <div className="space-y-8 bg-[#0B0B0B] min-h-full pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-brand-500/10 pb-6 relative">
        <div className="absolute top-0 right-0 w-40 h-40 bg-brand-500/5 rounded-full blur-[60px] pointer-events-none"></div>
        <div>
          <h1 className="font-display font-bold text-3xl text-white tracking-wide uppercase flex items-center gap-3">
             <GiBee className="text-brand-500/80" /> Acquisition Logs
          </h1>
          <p className="text-sm text-slate-400 font-light mt-1">Review and process client transactions</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 relative z-10">
        <div className="relative group w-full max-w-sm">
           <span className="w-1.5 h-1.5 rounded-full bg-brand-500 absolute -left-4 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity"></span>
           <input type="search" placeholder="Search trace ID or contact..." value={search} onChange={(e) => setSearch(e.target.value)} className="input w-full bg-[#111] border-brand-500/20 focus:border-brand-500 py-3 text-slate-200 placeholder:text-slate-500" id="admin-orders-search" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-full sm:w-56 bg-[#111] border-brand-500/20 focus:border-brand-500 py-3 text-slate-300 appearance-none cursor-pointer" id="admin-orders-filter">
          <option value="">All Protocols</option>
          {Object.entries(ORDER_STATUSES).map(([k, { label }]) => <option key={k} value={k}>{label}</option>)}
        </select>
      </div>

      {loading ? <div className="flex justify-center py-24"><Spinner size="lg" /></div> : (
        <div className="bg-[#111] rounded-2xl border border-brand-500/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-[#0A0A0A] border-b border-brand-500/20 text-[10px] uppercase tracking-[0.15em] text-brand-500/80 font-semibold">
                <tr>
                  <th className="px-6 py-5">Trace ID</th>
                  <th className="px-6 py-5">Client Profile</th>
                  <th className="px-6 py-5">Valuation</th>
                  <th className="px-6 py-5">Status Protocol</th>
                  <th className="px-6 py-5">Timestamp</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-500/5 text-slate-300">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-brand-500/5 transition-colors group">
                    <td className="px-6 py-4 font-mono text-[11px] tracking-widest text-brand-400">#{o.orderNumber}</td>
                    <td className="px-6 py-4 text-white font-medium tracking-wide">
                      {o.user?.name || o.customerPhone}
                      {o.user?.email && <p className="text-[10px] font-normal text-slate-500 mt-0.5">{o.user.email}</p>}
                    </td>
                    <td className="px-6 py-4 font-display font-medium text-brand-400">{formatCurrency(o.totalAmount)}</td>
                    <td className="px-6 py-4"><OrderStatusBadge status={o.orderStatus} /></td>
                    <td className="px-6 py-4 text-[11px] font-mono tracking-wider text-slate-400">{formatDate(o.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => { setSelected(o); setNewStatus(o.orderStatus); setNote(''); }} className="text-[10px] uppercase tracking-widest font-semibold text-brand-500 hover:text-brand-300 transition-colors border-b border-brand-500/30 hover:border-brand-300 pb-0.5">
                        Intervene
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div className="pt-4 border-t border-brand-500/10">
         <Pagination page={page} pages={pages} onPage={setPage} />
      </div>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={`Modify Trace Protocol #${selected?.orderNumber}`}>
        <div className="space-y-6 pt-2">
          <div className="bg-[#0A0A0A] p-4 rounded-xl border border-brand-500/20 mb-6">
             <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Current State</span>
                <OrderStatusBadge status={selected?.orderStatus} />
             </div>
             <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Client</span>
                <span className="font-medium text-white text-sm">{selected?.user?.name || selected?.customerPhone}</span>
             </div>
          </div>
          
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 block mb-2">New Status Directive</label>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="input bg-[#111] border-brand-500/20 focus:border-brand-500 text-white w-full py-3" id="order-status-select">
              {Object.entries(ORDER_STATUSES).map(([k, { label }]) => <option key={k} value={k}>{label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 block mb-2">Operational Note (Optional)</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Enter details regarding this modification..." rows={3} className="input bg-[#111] border-brand-500/20 focus:border-brand-500 text-white w-full py-3 placeholder:text-slate-600" id="order-status-note" />
          </div>
          <div className="pt-4 flex gap-4">
             <Button onClick={handleUpdateStatus} loading={updating} className="flex-1 shadow-[0_4px_20px_rgba(212,175,55,0.2)]">Execute Directive</Button>
             <Button onClick={() => setSelected(null)} variant="secondary" className="px-6 bg-[#0A0A0A] border-surface-border text-slate-300">Abort</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
