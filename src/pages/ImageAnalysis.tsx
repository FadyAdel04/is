import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, RefreshCw, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { loadFromStorage, saveToStorage, STORAGE_KEYS, addHistoryRecord } from '../lib/persistence';

const SAMPLE_IMAGES = [
  { label: 'Healthy Wheat', emoji: '🌾', hint: 'Healthy' },
  { label: 'Blight Tomato', emoji: '🍅', hint: 'Disease' },
  { label: 'Corn Rust',     emoji: '🌽', hint: 'Pest' },
];

export default function ImageAnalysis() {
  const [analyzed, setAnalyzed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedSample, setSelectedSample] = useState<number | null>(null);
  const [result, setResult] = useState<any>(loadFromStorage('agroai_last_analysis', null));
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    const url = URL.createObjectURL(file);
    setPreview(url);
    runAnalysis(file);
  }

  async function runAnalysis(fileObj?: File) {
    setLoading(true);
    setAnalyzed(false);
    
    try {
      let data;
      const formData = new FormData();
      
      if (fileObj) {
         formData.append("file", fileObj);
      } else {
         const blob = new Blob(["dummy content"], { type: 'text/plain' });
         const dummyFile = new File([blob], "sample.jpg", { type: "image/jpeg" });
         formData.append("file", dummyFile);
      }

      const res = await fetch("http://localhost:8000/analyze-vegetable", {
          method: "POST",
          body: formData
      });
      
      if (!res.ok) throw new Error("API request failed");
      data = await res.json();

      setResult(data);
      saveToStorage('agroai_last_analysis', data);
      addHistoryRecord({
        label: `AI Analysis: ${data.disease}`,
        crop: 'Vegetable',
        finalYield: 0,
        params: { confidence: data.confidence, pests: data.pest_detected, nutrients: data.nutrient_status }
      });
      setAnalyzed(true);
    } catch (err) {
      console.error("Failed to analyze", err);
      // Fallback in case python server is not running
      const fallback = {
        status: "success",
        health_score: 85,
        disease: "Early Blight",
        pest_detected: "Aphids",
        nutrient_status: "Nitrogen Deficiency",
        ripeness: "85%",
        confidence: 0.92,
        recommendation: "API Offline. This is a fallback mock response."
      };
      setResult(fallback);
      setAnalyzed(true);
    } finally {
      setLoading(false);
    }
  }

  function useSample(i: number) {
    setSelectedSample(i);
    setPreview(null);
    runAnalysis();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: '1.3rem' }}>🌿 AI Crop Image Analysis</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 4 }}>
          CNN-powered crop health detection — pests, diseases, nutrient deficiencies, and ripeness.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Upload Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Dropzone */}
          <div
            className="glass-card"
            style={{ padding: '2rem', textAlign: 'center', cursor: 'pointer', border: '2px dashed var(--border)', transition: 'border-color 0.2s' }}
            onClick={() => inputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          >
            {preview ? (
              <img src={preview} alt="Preview" style={{ maxHeight: 180, borderRadius: 10, objectFit: 'cover' }} />
            ) : (
              <>
                <Upload size={40} color="var(--accent-green)" style={{ margin: '0 auto 1rem' }} />
                <div style={{ fontWeight: 600 }}>Drop vegetable image here</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 6 }}>or click to browse · JPG, PNG, WEBP</div>
              </>
            )}
            <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
          </div>

          {/* Sample Images */}
          <div className="glass-card" style={{ padding: '1rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem' }}>📸 Sample Images</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {SAMPLE_IMAGES.map((s, i) => (
                <button key={i} onClick={() => useSample(i)}
                  style={{
                    flex: 1, padding: '0.75rem 0.5rem', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                    background: selectedSample === i ? 'rgba(34,197,94,0.15)' : 'var(--bg-secondary)',
                    border: `1px solid ${selectedSample === i ? 'rgba(34,197,94,0.4)' : 'var(--border)'}`,
                  }}>
                  <div style={{ fontSize: '1.8rem' }}>{s.emoji}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 4 }}>{s.label}</div>
                  <span className={`badge ${s.hint === 'Healthy' ? 'badge-green' : s.hint === 'Disease' ? 'badge-amber' : 'badge-rose'}`}
                    style={{ marginTop: 4, fontSize: '0.6rem' }}>{s.hint}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Model Info */}
          <div className="glass-card" style={{ padding: '1rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>🧠 Model Info</div>
            {[
              { label: 'Architecture', val: 'FastAPI Python Service' },
              { label: 'Capabilities', val: 'Pests, Diseases, Nutrients' },
              { label: 'Classes', val: 'Vegetable specific' },
              { label: 'Inference', val: 'Local REST API' },
            ].map(({ label, val }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', fontSize: '0.8rem', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                <span style={{ fontWeight: 600 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Results Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div key="loading" className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔬</div>
                <div style={{ fontWeight: 600 }}>Analyzing vegetable image…</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: 6 }}>Sending data to Python backend</div>
                <div style={{ marginTop: '1.5rem', height: 6, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
                  <motion.div style={{ height: '100%', background: 'var(--gradient-primary)', borderRadius: 999 }}
                    initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 2.2, ease: 'easeInOut' }} />
                </div>
              </motion.div>
            )}

            {!loading && !analyzed && !result && (
              <motion.div key="empty" className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ fontSize: '3.5rem' }}>📷</div>
                <div style={{ fontWeight: 600, marginTop: '1rem' }}>No image selected</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: 6 }}>Upload or select a sample image to begin analysis</div>
              </motion.div>
            )}

            {!loading && (analyzed || result) && result && (
              <motion.div key="results" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>

                {/* Prediction Summary */}
                <div className="glass-card" style={{ padding: '1.25rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem' }}>🎯 Detection Results</div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 10, textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Health Score</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 700, color: result.health_score > 80 ? 'var(--accent-green)' : 'var(--accent-amber)' }}>
                        {result.health_score}%
                      </div>
                    </div>
                    <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 10, textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Confidence</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-blue)' }}>
                        {(result.confidence * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {[
                    { label: 'Disease Detected', val: result.disease || 'Unknown', icon: '🦠' },
                    { label: 'Pest Presence', val: result.pest_detected || 'None', icon: '🐛' },
                    { label: 'Nutrient Status', val: result.nutrient_status || 'Unknown', icon: '💊' },
                    { label: 'Estimated Ripeness', val: result.ripeness || 'Unknown', icon: '🍅' },
                  ].map((item, i) => {
                    const isPositive = String(item.val).includes('None') || String(item.val).includes('Optimal');
                    return (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{item.icon} {item.label}</span>
                        <span style={{ fontWeight: 600, color: isPositive ? 'var(--accent-green)' : 'var(--text-primary)' }}>{String(item.val)}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Recommendation Action */}
                <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid var(--accent-green)' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <CheckCircle size={18} color="var(--accent-green)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>AI Recommendation</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>{result.recommendation}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
