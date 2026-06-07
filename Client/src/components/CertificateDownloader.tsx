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
          const scaleH = maxAvailableHeight / 794;
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
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    } catch {
      return dateStr;
    }
  };

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    setDownloading(true);
    try {
      // 1. Wait for all fonts (Great Vibes, Poppins, etc.) to be fully loaded and ready
      await document.fonts.ready;

      const el = certificateRef.current;
      const prevTransform = el.style.transform;
      const prevMargin = el.style.marginBottom;

      // 2. Temporarily set transform to 'none' so html2canvas can measure the 1:1 original bounding rect (1123x794)
      el.style.transform = 'none';
      el.style.marginBottom = '0';

      // 3. Give the browser a brief moment (100ms) to recalculate layout and render text at 1:1 scale before canvas capture
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 1123,
        height: 794,
        logging: false,
        onclone: (clonedDoc) => {
          const cloned = clonedDoc.querySelector('[data-cert-root]') as HTMLElement;
          if (cloned) {
            cloned.style.transform = 'none';
            cloned.style.marginBottom = '0';
          }
        }
      });

      // 4. Restore original scaled styles
      el.style.transform = prevTransform;
      el.style.marginBottom = prevMargin;

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1123, 794] });
      pdf.addImage(imgData, 'JPEG', 0, 0, 1123, 794);
      pdf.save(`${studentName.replace(/\s+/g, '_')}_Certificate.pdf`);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Certificate download failed. Please try again or use a different browser.');
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
          height: `${Math.round(794 * scale)}px`,
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
            height: '794px',
            backgroundImage: "url('/certificate-template1.jpeg')",
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {/* Load fonts: Great Vibes (student name cursive), Lora (body text matching template), Poppins (date) */}
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Lora:wght@400;500;600;700&family=Poppins:wght@400;500;600&display=swap');
            .cert-name { font-family: 'Great Vibes', cursive; }
          `}</style>

          {/* ── Student Name ──
              Overlaid in the cursive script area, below "THIS CERTIFICATE IS PRESENTED TO"
              and above the gold divider line. Vertically ~355–445px range.                */}
          <div
            className="absolute left-0 w-full flex justify-center"
            style={{ top: '290px' }}
          >
            {/* Added a subtle white background to cover any placeholder name on the template */}
            <span
              className="cert-name relative inline-block"
              style={{
                fontSize: '82px',
                color: '#000000',
                lineHeight: 1,
                letterSpacing: '0.01em',
                whiteSpace: 'nowrap',
              }}
            >
              {studentName}
            </span>
          </div>

          {/* ── Course / Registration Details ──
              Below gold divider line, matching the template's printed body text.
              Lines: "Has successfully completed [course] course
                      conducted by nimu cooking academy
                      UDYAM-OD-30-0059753
                      Fssai no:22026032000151"                                  */}
          <div
            className="absolute left-0 w-full flex flex-col items-center"
            style={{
              top: '430px',
              fontFamily: "'Lora', serif",
              color: '#2a3f5f',
              textAlign: 'center',
              lineHeight: 1.55,
            }}
          >
            <p style={{ fontSize: '22px', fontWeight: 500, margin: 0 }}>
              Has successfully completed{' '}
              <span style={{ fontWeight: 700 }}>{courseName}</span>{' '}
              course
            </p>
            <p style={{ fontSize: '22px', fontWeight: 500, margin: 0 }}>
              conducted by <span style={{ fontWeight: 700 }}>nimu cooking academy</span>
            </p>
            <p style={{ fontSize: '20px', fontWeight: 700, margin: '4px 0 0' }}>
              UDYAM-OD-30-0059753
            </p>
            <p style={{ fontSize: '20px', fontWeight: 700, margin: '2px 0 0' }}>
              Fssai no:22026032000151
            </p>
          </div>


          {/* ── Date ──
              Bottom-right corner, landing on the "Date: ____" underline in the template. */}
          <div
            className="absolute"
            style={{
              bottom: '73px',
              right: '179px',
              fontSize: '15px',
              color: '#3f5a73',
              fontWeight: 500,
              fontFamily: "'Poppins', sans-serif",
              letterSpacing: '0.03em',
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
