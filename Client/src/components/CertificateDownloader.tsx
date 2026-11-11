import React, { useRef, useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Download, Loader2 } from 'lucide-react';
import Button from './ui/Button';

interface CertificateProps {
  studentName: string;
  courseName: string;
  completionDate: string;
  certificateId: string;
  isInModal?: boolean;
}

const CertificateDownloader: React.FC<CertificateProps> = ({
  studentName,
  courseName,
  completionDate,
  certificateId,
  isInModal = false
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [scale, setScale] = useState(0.25); // start small to avoid flash
  const [leftOffset, setLeftOffset] = useState(0);

  useEffect(() => {
    const CERT_WIDTH = 1123;

    const computeScale = () => {
      if (!wrapperRef.current) return;
      const w = wrapperRef.current.getBoundingClientRect().width;
      if (w === 0) return; // not yet laid out
      
      const scaleW = Math.min(w / CERT_WIDTH, 1);
      let newScale = scaleW;

      if (isInModal) {
        // Use window.innerHeight to calculate max available height to prevent circular layout loops
        // 230px accounts for modal margins, header, gap, download button, and vertical padding
        const maxAvailableHeight = window.innerHeight - 230;
        if (maxAvailableHeight > 0) {
          const scaleH = maxAvailableHeight / 805;
          newScale = Math.min(scaleW, scaleH);
        }
      }

      const finalScale = Math.max(newScale, 0.2); // Keep a reasonable minimum scale
      setScale(finalScale);

      // Center horizontally if scaled certificate is narrower than container
      const scaledWidth = CERT_WIDTH * finalScale;
      if (w > scaledWidth) {
        setLeftOffset((w - scaledWidth) / 2);
      } else {
        setLeftOffset(0);
      }
    };

    // ResizeObserver: fires whenever the wrapper changes size
    const ro = new ResizeObserver(computeScale);
    if (wrapperRef.current) ro.observe(wrapperRef.current);

    // Also run after a tick (parent padding may not be applied yet at mount)
    const t = setTimeout(computeScale, 50);

    return () => {
      ro.disconnect();
      clearTimeout(t);
    };
  }, []);

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const trimmed = dateStr.trim();
    
    // If already in DD-MM-YYYY or DD/MM/YYYY format
    const ddMmYyyyMatch = trimmed.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})$/);
    if (ddMmYyyyMatch) {
      const dd = ddMmYyyyMatch[1].padStart(2, '0');
      const mm = ddMmYyyyMatch[2].padStart(2, '0');
      const yyyy = ddMmYyyyMatch[3];
      return `${dd}-${mm}-${yyyy}`;
    }

    // If in YYYY-MM-DD format
    const yyyyMmDdMatch = trimmed.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})$/);
    if (yyyyMmDdMatch) {
      const yyyy = yyyyMmDdMatch[1];
      const mm = yyyyMmDdMatch[2].padStart(2, '0');
      const dd = yyyyMmDdMatch[3].padStart(2, '0');
      return `${dd}-${mm}-${yyyy}`;
    }

    const months: { [key: string]: string } = {
      jan: '01', january: '01',
      feb: '02', february: '02',
      mar: '03', march: '03',
      apr: '04', april: '04',
      may: '05',
      jun: '06', june: '06',
      jul: '07', july: '07',
      aug: '08', august: '08',
      sep: '09', september: '09',
      oct: '10', october: '10',
      nov: '11', november: '11',
      dec: '12', december: '12'
    };

    // Match "DD Month YYYY" (e.g. "10 May 2026")
    const ddMonthYyyyMatch = trimmed.match(/^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})$/);
    if (ddMonthYyyyMatch) {
      const dd = ddMonthYyyyMatch[1].padStart(2, '0');
      const monthStr = ddMonthYyyyMatch[2].toLowerCase();
      const mm = months[monthStr] || '01';
      const yyyy = ddMonthYyyyMatch[3];
      return `${dd}-${mm}-${yyyy}`;
    }

    // Match "Month DD, YYYY" or "Month DD YYYY" (e.g. "May 10, 2026")
    const monthDdYyyyMatch = trimmed.match(/^([a-zA-Z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
    if (monthDdYyyyMatch) {
      const monthStr = monthDdYyyyMatch[1].toLowerCase();
      const mm = months[monthStr] || '01';
      const dd = monthDdYyyyMatch[2].padStart(2, '0');
      const yyyy = monthDdYyyyMatch[3];
      return `${dd}-${mm}-${yyyy}`;
    }

    try {
      const date = new Date(trimmed);
      if (!isNaN(date.getTime())) {
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
        return `${dd}-${mm}-${yyyy}`;
      }
    } catch {
      // ignore
    }

    return trimmed;
  };

  const handleDownload = async () => {
    if (!certificateRef.current || !wrapperRef.current) return;
    setDownloading(true);
    try {
      // 1. Wait for all fonts to be fully loaded
      await document.fonts.ready;

      const el = certificateRef.current;
      const wrapper = wrapperRef.current;
      const prevTransform = el.style.transform;

      // 2. Set transform to none AND make wrapper overflow visible
      //    (parent overflow:hidden clips html2canvas output — date gets cut off in modal)
      el.style.transform = 'none';
      wrapper.style.overflow = 'visible';
      wrapper.style.height = '805px';

      // 3. Wait for background image to fully load
      await new Promise<void>((resolve) => {
        const bgImg = el.querySelector('img');
        if (!bgImg) { resolve(); return; }
        if (bgImg.complete && bgImg.naturalWidth > 0) { resolve(); return; }
        bgImg.onload = () => resolve();
        bgImg.onerror = () => resolve();
      });

      // 4. Small delay for browser to repaint at 1:1
      await new Promise((resolve) => setTimeout(resolve, 150));

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 1123,
        height: 805,
        logging: false,
        onclone: (_clonedDoc, clonedEl) => {
          clonedEl.style.transform = 'none';
          if (clonedEl.parentElement) {
            clonedEl.parentElement.style.overflow = 'visible';
            clonedEl.parentElement.style.height = '805px';
          }
        }
      });

      // 5. Restore styles
      el.style.transform = prevTransform;
      wrapper.style.overflow = 'hidden';
      wrapper.style.height = `${Math.round(805 * scale)}px`;

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1123, 805] });
      pdf.addImage(imgData, 'JPEG', 0, 0, 1123, 805);
      pdf.save(`${studentName.replace(/\s+/g, '_')}_Certificate.pdf`);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Certificate download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 md:gap-4 w-full">
      {/* Responsive wrapper — clips the scaled certificate, out-of-flow so no page scroll */}
      <div
        ref={wrapperRef}
        className="w-full relative"
        style={{
            height: `${Math.round(805 * scale)}px`,
          overflow: 'hidden',
        }}
      >
        {/* Certificate canvas — position:absolute keeps it out of layout flow,
            so the 1123px width never causes horizontal page overflow.
            scale = wrapperWidth/1123, so scaled width = wrapperWidth exactly. */}
        <div
          ref={certificateRef}
          data-cert-root
          style={{
            position: 'absolute',
            top: 0,
            left: `${leftOffset}px`,
            width: '1123px',
            height: '805px',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            overflow: 'hidden',
          }}
        >
          {/* ── Background Image (img tag — more reliable with html2canvas than CSS background) ── */}
          <img
            src="/certificate-new.jpg"
            crossOrigin="anonymous"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '1123px',
              height: '805px',
              display: 'block',
            }}
            alt=""
          />
          {/* Load fonts: Great Vibes (name cursive), Dancing Script (fallback), Lora (body italic serif) */}
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Dancing+Script:wght@600;700&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Poppins:wght@400;500;600&display=swap');
            .cert-name { font-family: 'Great Vibes', 'Dancing Script', cursive; }
            .cert-body { font-family: 'Lora', serif; }
          `}</style>

          {/* ── Student Name ──
              Cursive script, dark navy — matching "Dr. Asad Mian" style in template */}
          <div
            className="absolute left-0 w-full flex justify-center"
            style={{ top: '380px' }}
          >
            <span
              className="cert-name"
              style={{
                fontSize: '82px',
                color: '#1d1f24',
                lineHeight: 1.1,
                letterSpacing: '0.01em',
                whiteSpace: 'nowrap',
              }}
            >
              {studentName}
            </span>
          </div>

          {/* ── Description Text ──
              Italic serif body text below the gold divider line.
              Matches: "For successfully completing the [Course Name]
                        conducted by NIMU Cooking Academy, in recognition of their dedication,
                        participation and excellent performance."              */}
          <div
            className="absolute left-0 w-full flex flex-col items-center cert-body"
            style={{
              top: '505px',
              color: '#2a3f5f',
              textAlign: 'center',
              lineHeight: 1.6,
              padding: '0 140px',
            }}
          >
            <p style={{ fontSize: '21px', fontStyle: 'italic', fontWeight: 400, margin: 0 }}>
              For successfully completing the{' '}
              <strong style={{ fontStyle: 'italic', fontWeight: 700 }}>{courseName}</strong>
            </p>
            <p style={{ fontSize: '21px', fontStyle: 'italic', fontWeight: 400, margin: 0 }}>
              conducted by NIMU Cooking Academy, in recognition of their dedication,
            </p>
            <p style={{ fontSize: '21px', fontStyle: 'italic', fontWeight: 400, margin: 0 }}>
              participation and excellent performance.
            </p>
          </div>

          {/* ── Date ──
              Bottom-right corner on the "Date" line of the template */}
          <div
            className="absolute"
            style={{
              bottom: '115px',
              right: '110px',
              fontSize: '17px',
              color: '#1a2744',
              fontWeight: 500,
              fontFamily: "'Poppins', sans-serif",
              letterSpacing: '0.03em',
              zIndex: 10,
            }}
          >
            {formatDate(completionDate)}
          </div>
        </div>
      </div>

      {/* Download Button */}
      <Button
        onClick={handleDownload}
        disabled={downloading}
        className="w-full md:w-auto md:px-16 py-4 md:py-4.5 text-xs md:text-sm bg-gradient-to-r from-[#d4af37] via-[#f1d072] to-[#d4af37] text-[#1a0f07] rounded-xl shadow-lg hover:shadow-[0_0_25px_rgba(212,175,55,0.35)] hover:scale-[1.02] active:scale-98 transition-all border border-[#f1d072]/30 font-black uppercase tracking-widest"
      >
        {downloading
          ? <Loader2 className="animate-spin mr-2 inline" size={15} />
          : <Download size={15} className="mr-2 inline" />}
        {downloading ? 'Downloading...' : 'Download Certificate'}
      </Button>
    </div>
  );
};

export default CertificateDownloader;
