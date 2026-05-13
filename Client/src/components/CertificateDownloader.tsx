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

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    setDownloading(true);
    try {
      const originalTransform = certificateRef.current.style.transform;
      const originalMargin = certificateRef.current.style.margin;
      
      certificateRef.current.style.transform = 'none';
      certificateRef.current.style.margin = '0';

      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 1123,
        height: 794,
        logging: false,
        onclone: (clonedDoc) => {
          const clonedElem = clonedDoc.querySelector('[style*="1123px"]') as HTMLElement;
          if (clonedElem) {
            clonedElem.style.transform = 'none';
            clonedElem.style.margin = '0';
          }
        }
      });
      
      certificateRef.current.style.transform = originalTransform;
      certificateRef.current.style.margin = originalMargin;

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1123, 794] });
      pdf.addImage(imgData, 'JPEG', 0, 0, 1123, 794);
      pdf.save(`${studentName.replace(/\s+/g, '_')}_Certificate.pdf`);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Certificate download failed due to unsupported browser styles. Please try again or use a different browser.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div 
        ref={wrapperRef}
        className="w-full flex justify-center items-center bg-[#1a1a1a] rounded-2xl overflow-hidden min-h-[250px]"
      >
        <div 
          ref={certificateRef}
          className="relative bg-[#ffffff] origin-center shrink-0"
          style={{ 
            width: '1123px',
            height: '794px',
            backgroundImage: "url('/certificate-template.png')",
            backgroundSize: '100% 100%',
            transform: `scale(${scale})`,
            margin: `-${(794 * (1 - scale)) / 2}px -${(1123 * (1 - scale)) / 2}px`
          }}
        >
          {/* 1. Date - Precisely on the line */}
          <div className="absolute top-[82px] left-[180px] text-[#3d1a11] font-sans font-bold text-[18px]">
            {(() => {
              if (!completionDate) return '';
              try {
                const date = new Date(completionDate);
                if (isNaN(date.getTime())) return completionDate; // Return as is if already formatted
                return date.toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                });
              } catch (e) {
                return completionDate;
              }
            })()}
          </div>

          {/* 2. Student Name - Centered and High (Matches Reference) */}
          <div className="absolute top-[365px] left-0 w-full text-center px-[120px]">
            <h1 className="text-[72px] font-serif font-bold text-[#3d1a11] uppercase tracking-[0.05em] leading-[1]">
              {studentName}
            </h1>
          </div>

          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');
            .font-serif { font-family: 'Playfair Display', serif; }
          `}</style>
        </div>
      </div>

      <Button 
        onClick={handleDownload} 
        disabled={downloading}
        className="px-16 py-6 text-xl bg-[#D4AF37] text-[#1E120A] rounded-2xl shadow-xl hover:scale-105 transition-all border-none"
      >
        {downloading ? <Loader2 className="animate-spin mr-2" /> : <Download size={24} className="mr-2" />}
        {downloading ? 'Downloading...' : 'Download Certificate'}
      </Button>
    </div>
  );
};

export default CertificateDownloader;
