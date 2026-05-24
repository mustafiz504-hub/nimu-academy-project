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
}

const CertificateDownloader: React.FC<CertificateProps> = ({
  studentName,
  courseName,
  completionDate,
  certificateId
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (wrapperRef.current) {
        const containerWidth = wrapperRef.current.offsetWidth;
        const targetWidth = 1123;
        const newScale = Math.min((containerWidth - 20) / targetWidth, 1);
        setScale(newScale);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
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
      const el = certificateRef.current;
      const prevTransform = el.style.transform;
      const prevMargin = el.style.marginBottom;

      el.style.transform = 'none';
      el.style.marginBottom = '0';

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
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Responsive wrapper — height matches the scaled certificate */}
      <div
        ref={wrapperRef}
        className="w-full flex justify-center items-start bg-[#111] rounded-2xl overflow-hidden"
        style={{ minHeight: `${Math.round(794 * scale)}px` }}
      >
        {/* Certificate canvas — always 1123×794, scaled down via CSS transform */}
        <div
          ref={certificateRef}
          data-cert-root
          className="relative shrink-0"
          style={{
            width: '1123px',
            height: '794px',
            backgroundImage: "url('/certificate-template2.png')",
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            marginBottom: `-${Math.round(794 * (1 - scale))}px`,
          }}
        >
          {/* Load cursive font for student name */}
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
            .cert-name { font-family: 'Great Vibes', cursive; }
          `}</style>

          {/* ── Student Name ──
              Overlaid in the cursive script area, below "THIS CERTIFICATE IS PRESENTED TO"
              and above the gold divider line. Vertically ~355–445px range.                */}
          <div
            className="absolute left-0 w-full flex justify-center"
            style={{ top: '336px' }}
          >
            <span
              className="cert-name"
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


          {/* ── Date ──
              Bottom-right corner, landing on the "Date: ____" underline in the template. */}
          <div
            className="absolute"
            style={{
              bottom: '65px',
              right: '175px',
              fontSize: '17px',
              color: '#3f5a73',
              fontWeight: 500,
              fontFamily: 'Georgia, serif',
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
        className="px-16 py-5 text-lg bg-[#D4AF37] text-[#1E120A] rounded-2xl shadow-xl hover:scale-105 transition-all border-none font-bold tracking-wide"
      >
        {downloading
          ? <Loader2 className="animate-spin mr-2 inline" size={20} />
          : <Download size={20} className="mr-2 inline" />}
        {downloading ? 'Downloading...' : 'Download Certificate'}
      </Button>
    </div>
  );
};

export default CertificateDownloader;
