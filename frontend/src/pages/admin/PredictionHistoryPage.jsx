import { useState, useEffect } from 'react';
import { DownloadCloud, History, Search, ChevronLeft, ChevronRight, Hash } from 'lucide-react';
import api from '../../services/api';

export default function PredictionHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchHistory(page);
  }, [page]);

  const fetchHistory = async (pageNumber) => {
    setLoading(true);
    try {
      const res = await api.get('/history', { params: { page: pageNumber, limit: 12 } });
      setHistory(res.data.records);
      setTotalPages(res.data.total_pages);
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadCsv = async () => {
    try {
      const res = await api.get('/history', { params: { page: 1, limit: 1000 } });
      
      // 1. Define Headers
      const headers = ["Request ID", "Pickup Time", "Pickup Lat", "Pickup Lng", "Dropoff Lat", "Dropoff Lng", "ETA (Sec)", "Calculated ETA (Min)"];
      
      // 2. Map Rows
      const rows = res.data.records.map(r => [
        r.request_id,
        new Date(r.pickup_datetime).toLocaleString(),
        r.pickup_latitude,
        r.pickup_longitude,
        r.dropoff_latitude,
        r.dropoff_longitude,
        r.predicted_duration_seconds,
        (r.predicted_duration_seconds / 60).toFixed(1)
      ].join(","));

      // 3. Combine into single CSV string (No prefix here!)
      const csvString = [headers.join(","), ...rows].join("\n");
      
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `taxipredict-audit-export-${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export error:', e);
    }
  };

  return (
    <div className="animate-fade-in pb-12 w-full max-w-6xl mx-auto space-y-6 lg:mt-4">
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <div className="p-2.5 rounded-2xl bg-white shadow-sm border border-white">
                <History size={24} className="text-primary-500" />
             </div>
             <p className="text-[11px] font-bold tracking-widest uppercase text-slate-400 m-0">Audit Vault</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 m-0 tracking-tighter">Prediction History</h1>
        </div>
        
        <button 
          onClick={downloadCsv} 
          className="btn-secondary whitespace-nowrap px-4 py-2 text-sm !rounded-xl"
        >
          <DownloadCloud size={16} /> Export CSV Buffer
        </button>
      </header>

      <div className="glass-panel p-0 flex flex-col min-h-[500px]">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-white/40 bg-white/30 flex justify-between items-center">
          <div className="relative w-64 hidden sm:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search Request ID..." disabled className="glass-input !py-2 !rounded-xl !text-xs pl-9 !bg-white/50 cursor-not-allowed opacity-60" />
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
             <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mr-2">Page {page} of {totalPages || 1}</span>
             <button 
               onClick={() => setPage(p => Math.max(1, p - 1))}
               disabled={page === 1}
               className="p-1.5 rounded-lg bg-white/60 hover:bg-white text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm border border-white transition-all cursor-pointer"
             >
               <ChevronLeft size={16} />
             </button>
             <button 
               onClick={() => setPage(p => Math.min(totalPages, p + 1))}
               disabled={page >= totalPages}
               className="p-1.5 rounded-lg bg-white/60 hover:bg-white text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm border border-white transition-all cursor-pointer"
             >
               <ChevronRight size={16} />
             </button>
          </div>
        </div>

        <div className="overflow-x-auto flex-grow p-2">
          {loading ? (
            <div className="flex items-center justify-center h-64">
               <span className="px-4 py-2 rounded-xl bg-white/50 text-xs font-bold text-slate-400 animate-pulse">Syncing Database...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="flex items-center justify-center h-64">
               <span className="px-4 py-2 rounded-xl bg-white/50 text-xs font-bold text-slate-400">No telemetry records found.</span>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th className="!bg-transparent !border-b-white/50 pl-6"><Hash size={12} className="inline mr-1"/> ID</th>
                  <th className="!bg-transparent !border-b-white/50">Timestamp</th>
                  <th className="!bg-transparent !border-b-white/50">Origin Vector</th>
                  <th className="!bg-transparent !border-b-white/50">Destination Vector</th>
                  <th className="!bg-transparent !border-b-white/50 text-right pr-6">Calculated ETA</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record) => (
                  <tr key={record.request_id} className="group hover:bg-white/40">
                    <td className="pl-6 !py-3">
                       <span className="px-2 py-1 bg-white/60 rounded border border-white text-[11px] font-bold text-slate-500 inline-block group-hover:border-primary-200 transition-colors mono">
                          {record.request_id?.slice(0, 8)}...
                       </span>
                    </td>
                    <td className="text-xs font-medium text-slate-500 !py-3">
                      {new Date(record.pickup_datetime + (!record.pickup_datetime.includes('Z') ? 'Z' : '')).toLocaleString()}
                    </td>
                    <td className="mono text-xs text-slate-400 !py-3">[{record.pickup_latitude.toFixed(3)}, {record.pickup_longitude.toFixed(3)}]</td>
                    <td className="mono text-xs text-slate-400 !py-3">[{record.dropoff_latitude.toFixed(3)}, {record.dropoff_longitude.toFixed(3)}]</td>
                    <td className="text-right !py-3 pr-6">
                      <span className="font-bold text-slate-700 bg-white shadow-sm px-2.5 py-1 rounded-md text-sm border border-white group-hover:border-primary-100 transition-colors">
                        {(record.predicted_duration_minutes).toFixed(1)} <span className="text-[10px] text-slate-400 uppercase tracking-widest pl-0.5">Min</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
