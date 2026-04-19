import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { X, Download, Share2 } from 'lucide-react';

const QRModal = ({ isOpen, onClose, resource }) => {
    const qrRef = useRef();

    if (!isOpen || !resource) return null;

    const downloadQR = () => {
        const canvas = qrRef.current.querySelector('canvas');
        const url = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = url;
        link.download = `QR_${resource.name.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const bookingUrl = `${window.location.origin}/app/catalogue?resourceId=${resource.id}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden transform transition-all duration-300 scale-100">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900">Resource QR Code</h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 flex flex-col items-center">
                    <div ref={qrRef} className="p-4 bg-white rounded-xl border-4 border-slate-50 shadow-inner mb-6">
                        <QRCodeCanvas 
                            value={bookingUrl}
                            size={200}
                            level={"H"}
                            includeMargin={false}
                            imageSettings={{
                                src: "https://api.dicebear.com/7.x/avataaars/svg?seed=Smart",
                                x: undefined,
                                y: undefined,
                                height: 40,
                                width: 40,
                                excavate: true,
                            }}
                        />
                    </div>
                    
                    <div className="text-center mb-6">
                        <h4 className="font-bold text-slate-900 text-xl mb-1">{resource.name}</h4>
                        <p className="text-slate-500 text-sm font-medium">{resource.type.replace('_', ' ')} • {resource.location}</p>
                    </div>

                    <div className="w-full flex space-x-3">
                        <button 
                            onClick={downloadQR}
                            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
                        >
                            <Download className="w-4 h-4 mr-2" /> Download PNG
                        </button>
                    </div>
                    
                    <p className="mt-4 text-xs text-slate-400 text-center italic">
                        Print this code for physical assets or laboratory doors.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default QRModal;
