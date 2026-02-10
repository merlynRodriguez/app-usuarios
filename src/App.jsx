import React, { useState, useEffect } from 'react';
import { Search, Droplets, Calendar, CreditCard, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from './supabaseClient';
import PaymentModal from './components/PaymentModal';

function App() {
  const [query, setQuery] = useState('');
  const [client, setClient] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [paymentItem, setPaymentItem] = useState(null); // specific item or 'all'
  const [lastPaidReading, setLastPaidReading] = useState(0);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    const normalizedQuery = query.toLowerCase().trim();
    if (normalizedQuery !== 'merlyn' && normalizedQuery !== 'willy') {
      setError('Usuario no encontrado. Intente "merlyn" o "willy".');
      setClient(null);
      setHistory([]);
      return;
    }

    setLoading(true);
    setError(null);
    setClient(normalizedQuery);

    try {
      // Fetch latest 7 records (to calculate consumption for the top 6)
      const { data: historyData, error: historyError } = await supabase
        .from(normalizedQuery)
        .select('*')
        .order('fecha_lectura', { ascending: false })
        .limit(7);

      if (historyError) throw historyError;

      // Fetch the last PAID record to calculate total accumulated debt
      const { data: lastPaidData, error: lastPaidError } = await supabase
        .from(normalizedQuery)
        .select('lectura')
        .eq('pagado', true)
        .order('fecha_lectura', { ascending: false })
        .limit(1);

      if (lastPaidError) throw lastPaidError;

      setHistory(historyData || []);

      const lastPaidValue = lastPaidData && lastPaidData.length > 0 ? lastPaidData[0].lectura : 0;
      setLastPaidReading(lastPaidValue);

    } catch (err) {
      console.error(err);
      setError('Error al obtener datos. Verifique su conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = (item, amount) => {
    setPaymentItem({ ...item, amount });
    setModalOpen(true);
  };

  const handlePayAll = (amount) => {
    setPaymentItem({ id: 'all', amount });
    setModalOpen(true);
  };

  const confirmPayment = async () => {
    if (!client) return;

    try {
      if (paymentItem.id === 'all') {
        // Pay all pending
        const pendingIds = history.filter(h => !h.pagado).map(h => h.id);
        if (pendingIds.length === 0) return;

        const { error } = await supabase
          .from(client)
          .update({ pagado: true })
          .in('id', pendingIds);

        if (error) throw error;
      } else {
        // Pay single
        const { error } = await supabase
          .from(client)
          .update({ pagado: true })
          .eq('id', paymentItem.id);

        if (error) throw error;
      }

      // Refresh data
      // Re-run the search logic essentially
      const { data: historyData } = await supabase
        .from(client)
        .select('*')
        .order('fecha_lectura', { ascending: false })
        .limit(7);

      const { data: lastPaidData } = await supabase
        .from(client)
        .select('lectura')
        .eq('pagado', true)
        .order('fecha_lectura', { ascending: false })
        .limit(1);

      setHistory(historyData || []);
      const lastPaidValue = lastPaidData && lastPaidData.length > 0 ? lastPaidData[0].lectura : 0;
      setLastPaidReading(lastPaidValue);

    } catch (err) {
      alert('Error procesando el pago: ' + err.message);
    }
  };

  // Calculations
  const visibleHistory = history.slice(0, 6);
  const pendingItems = history.filter(h => !h.pagado);

  // Total Debt Formula: Latest Reading - Last Paid Reading (if latest is not paid)
  // If latest is paid, debt is 0. 
  // If undefined/empty, 0.
  const latestRec = history.length > 0 ? history[0] : null;
  const isLatestPaid = latestRec ? latestRec.pagado : true;

  const totalDebt = (!isLatestPaid && latestRec)
    ? (latestRec.lectura - lastPaidReading)
    : 0;

  // Safety check for negative debt (shouldn't happen with correct data, but just in case)
  const displayDebt = Math.max(0, totalDebt);
  const totalMonths = pendingItems.length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900 relative">

      {/* Background Image Layer */}
      <div className="fixed inset-0 z-0">
        <img
          src="/img/vinto.jpg"
          alt="Water Background"
          className="w-full h-full object-cover opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-white/90 to-white"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 pt-12 pb-6 px-6 text-center">
        <h1 className="text-3xl font-bold text-brand-500 drop-shadow-sm mb-2">
          Junta Vecinal <br /> Bolívar
        </h1>
        <p className="text-gray-600 text-sm font-medium">Sistema de Agua Potable</p>
      </header>

      {/* Search Section */}
      <section className="relative z-20 px-4 mb-6">
        <form onSubmit={handleSearch} className="relative max-w-md mx-auto">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-0 shadow-xl bg-white/80 backdrop-blur-xl focus:ring-2 focus:ring-brand-500 focus:outline-none text-lg transition-all placeholder:text-gray-400"
            placeholder="Ingrese su nombre (ej: merlyn)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>
        {error && (
          <div className="mt-4 p-3 bg-red-100/80 backdrop-blur text-red-700 rounded-xl flex items-center justify-center text-sm font-medium animate-fade-in">
            <AlertCircle size={16} className="mr-2" />
            {error}
          </div>
        )}
      </section>

      {/* Main Content */}
      <main className="relative z-10 px-4 max-w-md mx-auto space-y-6">

        {loading && (
          <div className="text-center py-10">
            <div className="inline-block w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-brand-600 font-medium">Buscando registros...</p>
          </div>
        )}

        {client && !loading && history.length > 0 && (
          <div className="animate-slide-up space-y-6">

            {/* Total Debt Card */}
            <div className={`p-6 rounded-3xl shadow-lg border border-white/50 relative overflow-hidden text-white ${displayDebt > 0 ? 'bg-gradient-to-br from-red-500 to-orange-600' : 'bg-gradient-to-br from-green-500 to-emerald-600'}`}>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-white/80 text-sm font-medium mb-1">Total Acumulado</p>
                    <h2 className="text-4xl font-bold tracking-tight">{displayDebt.toFixed(2)} <span className="text-lg font-normal opacity-80">Bs</span></h2>
                  </div>
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Droplets className="text-white" size={24} />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
                    {totalMonths} {totalMonths === 1 ? 'mes pendiente' : 'meses pendientes'}
                  </span>

                  {displayDebt > 0 && (
                    <button
                      onClick={() => handlePayAll(displayDebt)}
                      className="bg-white text-red-600 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition active:scale-95 flex items-center"
                    >
                      Pagar Todo <ChevronRight size={16} className="ml-1" />
                    </button>
                  )}
                </div>
              </div>

              {/* Decorative circles */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-2xl"></div>
            </div>

            {/* History List */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 px-2">Historial de Consumo</h3>
              <div className="space-y-3">
                {visibleHistory.map((item, index) => {
                  // Calculate consumption for specific month
                  // Reading - PreviousReading (which is index + 1 in desc list)
                  const prevItem = history[index + 1];
                  const consumption = prevItem ? (item.lectura - prevItem.lectura) : item.lectura; // fallback to full reading if start
                  const cost = consumption * 1;

                  return (
                    <div
                      key={item.id}
                      className={`group relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-gray-100 transition-all hover:shadow-md ${!item.pagado ? 'border-l-4 border-l-orange-500' : 'border-l-4 border-l-green-500'}`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.pagado ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                            <Calendar size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-sm">
                              {new Date(item.fecha_lectura).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                            </p>
                            <p className="text-xs text-gray-500">
                              Consumo: <span className="font-medium text-gray-700">{consumption.toFixed(1)} m³</span>
                              <span className="text-gray-300 mx-1">|</span>
                              Lectura: {item.lectura}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-lg text-gray-900">{cost.toFixed(2)} Bs</p>
                          {item.pagado ? (
                            <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                              <CheckCircle2 size={12} className="mr-1" /> Pagado
                            </span>
                          ) : (
                            <button
                              onClick={() => handlePay(item, cost)}
                              className="bg-brand-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold shadow-brand-500/20 shadow-lg active:scale-95 transition-transform"
                            >
                              Pagar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        )}
      </main>

      {/* News Section */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-xl border-t border-gray-200 py-3 px-4 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto flex items-center space-x-3">
          <div className="bg-brand-100 p-2 rounded-lg">
            <AlertCircle size={20} className="text-brand-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-brand-800 uppercase tracking-wide">Novedades</p>
            <p className="text-sm font-medium text-gray-700">Asistir al desfile del 6 de agosto</p>
          </div>
        </div>
      </footer>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        amount={paymentItem?.amount ? paymentItem.amount.toFixed(2) : (paymentItem?.id === 'all' ? displayDebt.toFixed(2) : 0)}
        isFullPayment={paymentItem?.id === 'all'}
        onConfirm={confirmPayment}
        clientName={client}
      />
    </div>
  );
}

export default App;
