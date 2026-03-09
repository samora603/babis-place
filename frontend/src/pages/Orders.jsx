import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '@/services/orderService';
import { formatCurrency, formatDate } from '@/utils/helpers';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import Spinner from '@/components/ui/Spinner';
import Pagination from '@/components/ui/Pagination';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    orderService.getMyOrders({ page, limit: 10 })
      .then(({ data }) => { setOrders(data.data); setPages(data.pages); })
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="section-container py-10">
      <h1 className="font-display font-bold text-3xl mb-8">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">📦</p>
          <p className="text-slate-400 mb-4">You haven't placed any orders yet</p>
          <Link to="/shop" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order._id} to={`/orders/${order._id}`} className="card p-5 flex items-center gap-4 hover:border-slate-600 transition-all">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-semibold text-slate-100">{order.orderNumber}</span>
                  <OrderStatusBadge status={order.orderStatus} />
                  <OrderStatusBadge status={order.paymentStatus} type="payment" />
                </div>
                <p className="text-sm text-slate-400">{order.items.length} item{order.items.length !== 1 ? 's' : ''} · {formatDate(order.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-brand-400">{formatCurrency(order.totalAmount)}</p>
                <p className="text-xs text-slate-500 capitalize">{order.deliveryType}</p>
              </div>
            </Link>
          ))}
          <Pagination page={page} pages={pages} onPage={setPage} />
        </div>
      )}
    </div>
  );
}
