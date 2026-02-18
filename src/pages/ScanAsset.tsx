import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Quagga from 'quagga';
import { supabase } from '@/lib/supabaseClient';
import { AlertCircle, Loader } from 'lucide-react';
import { ensureCameraPermission } from '@/lib/camera';
import outletsRaw from '../../data_outlet.md?raw';
import divisionsRaw from '../../data_devisi.md?raw';

type Outlet = { id: string; kode: string; nama: string };
type Division = { id: string; nama: string };

type StoredContext = {
  mode: 'select' | 'manual';
  outletId?: string;
  divisionId?: string;
  outletKode?: string;
  outletNama?: string;
  divisionNama?: string;
};
function parseTsv(raw: string): string[][] {
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.split(/\t+/).map((c) => c.trim()));
}

function safeLower(s: string) {
  return (s || '').toLowerCase();
}

function loadOutlets(): Outlet[] {
  const rows = parseTsv(outletsRaw);
  const data = rows.slice(1);
  return data
    .map((r) => ({
      id: r[0] || '',
      kode: r[1] || '',
      nama: r[2] || '',
    }))
    .filter((o) => o.id && o.kode && o.nama);
}

function loadDivisions(): Division[] {
  const rows = parseTsv(divisionsRaw);
  const data = rows.slice(1);
  return data
    .map((r) => ({
      id: r[0] || '',
      nama: r[1] || '',
    }))
    .filter((d) => d.id && d.nama);
}

function buildVerificationId(outlet: Outlet | null, division: Division | null) {
  if (!outlet || !division) return '';
  return `${outlet.id}-${division.id}`;
}

const STORAGE_KEY = 'topsell_verification_context_v1';

function loadStoredContext(): StoredContext | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || (parsed.mode !== 'select' && parsed.mode !== 'manual')) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveStoredContext(ctx: StoredContext) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ctx));
  } catch {
    return;
  }
}

export default function ScanAsset() {
  const navigate = useNavigate();
  const scannerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const outlets = useMemo(() => loadOutlets(), []);
  const divisions = useMemo(() => loadDivisions(), []);

  const stored = useMemo(() => (typeof window !== 'undefined' ? loadStoredContext() : null), []);
  const [mode, setMode] = useState<'select' | 'manual'>(stored?.mode || 'select');

  const [selectedOutletId, setSelectedOutletId] = useState(stored?.outletId || '');
  const [selectedDivisionId, setSelectedDivisionId] = useState(stored?.divisionId || '');

  const [selectedPair, setSelectedPair] = useState(
    stored?.outletId && stored?.divisionId ? `${stored.outletId}:${stored.divisionId}` : ''
  );

  const [manualOutlet, setManualOutlet] = useState(stored?.outletKode || stored?.outletNama || '');
  const [manualDivision, setManualDivision] = useState(stored?.divisionNama || '');

  const selectedOutlet = useMemo(
    () => outlets.find((o) => o.id === selectedOutletId) || null,
    [outlets, selectedOutletId]
  );
  const selectedDivision = useMemo(
    () => divisions.find((d) => d.id === selectedDivisionId) || null,
    [divisions, selectedDivisionId]
  );

  const verificationOptions = useMemo(() => {
    const opts: Array<{ value: string; label: string }> = [];
    for (const outlet of outlets) {
      for (const division of divisions) {
        const value = `${outlet.id}:${division.id}`;
        const label = `ID ${outlet.id} ${division.id} ${outlet.kode}_${outlet.nama}_${division.nama}`;
        opts.push({ value, label });
      }
    }
    return opts;
  }, [divisions, outlets]);

  useEffect(() => {
    if (!selectedPair) return;
    const [outletId, divisionId] = selectedPair.split(':');
    if (outletId) setSelectedOutletId(outletId);
    if (divisionId) setSelectedDivisionId(divisionId);
  }, [selectedPair]);

  useEffect(() => {
    if (mode !== 'select') return;
    if (!selectedOutletId || !selectedDivisionId) return;
    const pair = `${selectedOutletId}:${selectedDivisionId}`;
    if (pair !== selectedPair) setSelectedPair(pair);
  }, [mode, selectedDivisionId, selectedOutletId, selectedPair]);

  const resolvedManualOutlet = useMemo(() => {
    const q = safeLower(manualOutlet);
    if (!q) return null;
    return (
      outlets.find((o) => safeLower(o.kode) === q) ||
      outlets.find((o) => safeLower(o.nama) === q) ||
      outlets.find((o) => safeLower(`${o.kode} ${o.nama}`) === q) ||
      outlets.find((o) => safeLower(`${o.kode} - ${o.nama}`) === q) ||
      outlets.find((o) => safeLower(`${o.kode}-${o.nama}`) === q) ||
      null
    );
  }, [manualOutlet, outlets]);

  const resolvedManualDivision = useMemo(() => {
    const q = safeLower(manualDivision);
    if (!q) return null;
    return (
      divisions.find((d) => safeLower(d.id) === q) ||
      divisions.find((d) => safeLower(d.nama) === q) ||
      divisions.find((d) => safeLower(`${d.id} ${d.nama}`) === q) ||
      divisions.find((d) => safeLower(`${d.id} - ${d.nama}`) === q) ||
      divisions.find((d) => safeLower(`${d.id}-${d.nama}`) === q) ||
      null
    );
  }, [manualDivision, divisions]);

  const verification = useMemo(() => {
    if (mode === 'select') {
      return {
        outlet: selectedOutlet,
        division: selectedDivision,
        id: buildVerificationId(selectedOutlet, selectedDivision),
      };
    }

    const outlet = resolvedManualOutlet;
    const division = resolvedManualDivision;
    return {
      outlet,
      division,
      id: buildVerificationId(outlet, division),
    };
  }, [mode, resolvedManualDivision, resolvedManualOutlet, selectedDivision, selectedOutlet]);

  useEffect(() => {
    const outlet = verification.outlet;
    const division = verification.division;
    saveStoredContext({
      mode,
      outletId: outlet?.id || undefined,
      divisionId: division?.id || undefined,
      outletKode: outlet?.kode || undefined,
      outletNama: outlet?.nama || (mode === 'manual' ? manualOutlet : undefined),
      divisionNama: division?.nama || (mode === 'manual' ? manualDivision : undefined),
    });
  }, [manualDivision, manualOutlet, mode, verification.division, verification.outlet]);

  const handleDetected = async (result: { codeResult: { code: string } }) => {
    if (processing) return;
    const code = result.codeResult.code;
    console.log("Barcode detected:", code);
    
    setProcessing(true);
    Quagga.stop(); // Stop scanning while processing

    try {
      // Find asset by code
      const { data } = await supabase
        .from('assets')
        .select('id')
        .eq('code', code)
        .single();

      if (data) {
        navigate(`/asset/${data.id}`, {
          state: {
            verificationId: verification.id,
            outlet: verification.outlet,
            division: verification.division,
          },
        });
      } else {
        setError(`Asset with code "${code}" not found.`);
        setProcessing(false);
        // Restart scanning after a delay if needed, or let user retry manually
      }
    } catch (err) {
      console.error("Error searching asset:", err);
      setError("Error searching for asset.");
      setProcessing(false);
    }
  };

  const handleDetectedRef = useRef(handleDetected);
  useEffect(() => {
    handleDetectedRef.current = handleDetected;
  });

  useEffect(() => {
    if (!scannerRef.current) return;

    let stopped = false;

    const initQuagga = (facingMode?: string) =>
      new Promise<void>((resolve, reject) => {
        Quagga.init(
          {
            inputStream: {
              name: 'Live',
              type: 'LiveStream',
              target: scannerRef.current as HTMLElement,
              constraints: facingMode ? { facingMode } : undefined,
            },
            decoder: {
              readers: [
                'code_128_reader',
                'ean_reader',
                'ean_8_reader',
                'code_39_reader',
                'code_39_vin_reader',
                'codabar_reader',
                'upc_reader',
                'upc_e_reader',
                'i2of5_reader',
              ],
            },
          },
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

    (async () => {
      try {
        const allowed = await ensureCameraPermission();
        if (!allowed) {
          setError('Izin kamera ditolak. Aktifkan izin kamera di pengaturan aplikasi.');
          return;
        }

        await initQuagga('environment').catch(async () => {
          await initQuagga('user');
        });

        if (stopped) return;
        Quagga.start();
      } catch (err: unknown) {
        console.error('Failed to init Quagga:', err);
        setError('Gagal mengaktifkan kamera. Pastikan izin kamera sudah diberikan.');
      }
    })();

    const onDetected = (res: { codeResult: { code: string } }) => {
        if (handleDetectedRef.current) {
            handleDetectedRef.current(res);
        }
    };
    Quagga.onDetected(onDetected);

    return () => {
      stopped = true;
      Quagga.offDetected(onDetected);
      Quagga.stop();
    };
  }, []);

  const handleRetry = () => {
    setError(null);
    setProcessing(false);
    Quagga.start();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Scan Asset Barcode</h2>
        <p className="text-sm text-gray-500">Point your camera at the asset tag</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-lg border border-gray-200 p-4 space-y-3">
        <div className="text-sm font-semibold text-gray-900">ID Verifikasi Cabang / Outlet / Divisi</div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode('select')}
            className={`flex-1 py-2 rounded-md text-sm font-medium border ${
              mode === 'select'
                ? 'bg-brand-red text-white border-brand-red'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Pilih dari daftar
          </button>
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`flex-1 py-2 rounded-md text-sm font-medium border ${
              mode === 'manual'
                ? 'bg-brand-red text-white border-brand-red'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Input manual
          </button>
        </div>

        {mode === 'select' ? (
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Pilih ID Verifikasi</label>
              <select
                value={selectedPair}
                onChange={(e) => setSelectedPair(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-gray-50"
              >
                <option value="">Pilih outlet & divisi...</option>
                {verificationOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Outlet (kode atau nama)</label>
              <input
                value={manualOutlet}
                onChange={(e) => setManualOutlet(e.target.value)}
                list="outlet-list"
                placeholder="Contoh: MJ01 atau TOPSELL BHAYANGKARA"
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-gray-50"
              />
              <datalist id="outlet-list">
                {outlets.map((o) => (
                  <option key={o.id} value={`${o.kode} - ${o.nama}`} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Divisi (id atau nama)</label>
              <input
                value={manualDivision}
                onChange={(e) => setManualDivision(e.target.value)}
                list="division-list"
                placeholder="Contoh: 4 atau IT"
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-gray-50"
              />
              <datalist id="division-list">
                {divisions.map((d) => (
                  <option key={d.id} value={`${d.id} - ${d.nama}`} />
                ))}
              </datalist>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">ID Verifikasi</label>
          <input
            readOnly
            value={verification.id || ''}
            placeholder="Pilih outlet dan divisi"
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-gray-100"
          />
        </div>
      </div>

      <div className="relative w-full max-w-md aspect-square bg-black rounded-lg overflow-hidden shadow-xl">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 p-4 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
            <p className="text-red-700 font-medium">{error}</p>
            <button
              onClick={handleRetry}
              className="mt-4 px-4 py-2 bg-brand-red text-white rounded-md hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div ref={scannerRef} className="absolute inset-0 [&>video]:w-full [&>video]:h-full [&>video]:object-cover" />
            <div className="absolute inset-0 border-2 border-brand-red opacity-50 pointer-events-none">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 animate-pulse" />
            </div>
          </>
        )}
        
        {processing && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
            <Loader className="h-10 w-10 text-white animate-spin" />
          </div>
        )}
      </div>

      <div className="max-w-md w-full px-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
