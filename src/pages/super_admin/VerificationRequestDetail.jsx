import { useState, useEffect } from 'react';
import Badge from '../../components/Badge';
import { useApp } from '../../context/AppContext';
import { formatDate, readFileAsDataUrl } from '../../utils/storage';
import {
  User,
  Car,
  Phone,
  Mail,
  ArrowLeft,
  ShieldAlert,
  RotateCw,
  ZoomIn,
  ZoomOut,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  FileText,
  AlertCircle,
  Eye,
  FileMinus,
  CheckCircle,
  RefreshCw,
  Building,
  MessageSquare,
  XCircle,
  CheckCircle as CheckCircleIcon
} from 'lucide-react';

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded-lg text-slate-400 hover:text-[#00D6CC] hover:bg-slate-50 transition active:scale-95"
      title="Copy to clipboard"
    >
      {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
    </button>
  );
};

const VerificationRequestDetail = ({ verificationId, setActivePage, onClose, isDetailDrawer }) => {
  const { state, approveVerificationRequest, rejectVerificationRequest, updateDocumentVerificationStatus, uploadDriverDocument } = useApp();
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState('');

  // Document rejection states
  const [rejectingDocId, setRejectingDocId] = useState(null);
  const [docRejectionReason, setDocRejectionReason] = useState('');
  const [failedImages, setFailedImages] = useState({});
  const [activeTab, setActiveTab] = useState('documents');
  const [verificationAction, setVerificationAction] = useState(null); // 'approve', 'reject', 'request'

  // Lightbox state
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const req = (state.verificationRequests || []).find((r) => r.id === verificationId);

  // Keyboard controls for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIdx === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextDoc();
      if (e.key === 'ArrowLeft') prevDoc();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIdx]);

  if (!req) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500 max-w-lg mx-auto mt-12 shadow-soft">
        <ShieldAlert size={48} className="mx-auto text-rose-500 mb-4 animate-pulse" />
        <h3 className="text-lg font-bold text-slate-950">Request Not Found</h3>
        <p className="text-sm text-slate-500 mt-2">The verification request you are looking for does not exist or has been removed.</p>
        <button
          onClick={() => setActivePage('verification-requests')}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#00D6CC] px-5 py-2.5 font-bold text-white hover:opacity-90 transition shadow-lg shadow-[#00D6CC]/20"
        >
          <ArrowLeft size={16} /> Back to Requests
        </button>
      </div>
    );
  }

  // Prepopulate documents list
  const docsList = [];
  const addDoc = (category, side, fileObj, docKey) => {
    if (!fileObj) return;
    docsList.push({
      id: `${category.toLowerCase().replace(/\s+/g, '_')}_${side.toLowerCase().replace(/\s+/g, '_')}`,
      docKey,
      category,
      side,
      name: fileObj.name || `${category}_${side}.jpg`,
      url: fileObj.url || '',
      uploadedAt: fileObj.uploadedAt,
      file: fileObj,
      status: fileObj.status || 'pending',
      rejectionReason: fileObj.rejectionReason || ''
    });
  };

  addDoc('National ID', 'Front Side', req.nationalId?.front, 'nationalId_front');
  addDoc('National ID', 'Back Side', req.nationalId?.back, 'nationalId_back');
  addDoc('Driver License', 'Front Side', req.driverLicense?.front || req.document, 'driverLicense_front');
  addDoc('Driver License', 'Back Side', req.driverLicense?.back, 'driverLicense_back');
  addDoc('Vehicle Registration', 'Front Side', req.vehicleRegistration, 'vehicleRegistration');
  addDoc('Vehicle Registration', 'Back Side', req.vehicleRegistrationBack, 'vehicleRegistrationBack');

  const documentFilesCount = docsList.length;

  // Append car photos if they exist
  if (req.carImages && req.carImages.length > 0) {
    req.carImages.forEach((img, index) => {
      docsList.push({
        id: `vehicle_photo_${index}`,
        category: 'Vehicle Photo',
        side: `Photo ${index + 1}`,
        name: `vehicle_photo_${index + 1}.jpg`,
        url: img.url,
        uploadedAt: req.createdAt,
        file: img
      });
    });
  }

  const isImageUrl = (url, name) => {
    if (!url) return false;
    if (url.startsWith('data:image/') || url.startsWith('blob:')) return true;
    const extension = (name || url).split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(extension);
  };

  const openLightbox = (docId) => {
    const idx = docsList.findIndex((d) => d.id === docId);
    if (idx !== -1) {
      setLightboxIdx(idx);
      resetTransform();
    }
  };

  const closeLightbox = () => {
    setLightboxIdx(null);
  };

  const nextDoc = () => {
    if (lightboxIdx === null || docsList.length <= 1) return;
    setLightboxIdx((prev) => (prev + 1) % docsList.length);
    resetTransform();
  };

  const prevDoc = () => {
    if (lightboxIdx === null || docsList.length <= 1) return;
    setLightboxIdx((prev) => (prev - 1 + docsList.length) % docsList.length);
    resetTransform();
  };

  const resetTransform = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
    setIsDragging(false);
  };

  const handleMouseDown = (e) => {
    if (zoom <= 1) return; // Only drag when zoomed in
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleReject = () => {
    if (!reason.trim()) {
      setFormError('Please select or write a rejection reason before rejecting.');
      return;
    }
    setFormError('');
    rejectVerificationRequest(req.id, reason);
  };

  const handleApprove = () => {
    setFormError('');
    approveVerificationRequest(req.id);
  };

  const rejectionPresets = [
    'Documents are blurry/unreadable',
    'Expired Driver License',
    'Name on ID does not match profile',
    'Incorrect or fake vehicle registration plate',
    'Vehicle photos do not match description'
  ];

  // Helper to render inline previews in standard physical card ratio
  const renderDocPreview = (category, side, fileObj, docKey) => {
    if (!fileObj) {
      return (
        <div className="relative aspect-[1.586/1] w-full flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/55 p-3 text-center select-none">
          <FileMinus size={20} className="text-slate-300 mb-1.5" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{side}</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Not Uploaded</span>
        </div>
      );
    }

    const docId = `${category.toLowerCase().replace(/\s+/g, '_')}_${side.toLowerCase().replace(/\s+/g, '_')}`;
    const isImg = isImageUrl(fileObj.url, fileObj.name) && !failedImages[docId];
    const docStatus = fileObj.status || 'pending';
    const docReason = fileObj.rejectionReason || '';

    return (
      <div className={`group relative flex flex-col rounded-2xl border bg-white p-2.5 shadow-soft hover:shadow-md transition duration-300 ${
        docStatus === 'approved' ? 'border-emerald-500/40 ring-1 ring-emerald-500/10' :
        docStatus === 'rejected' ? 'border-rose-500/40 ring-1 ring-rose-500/10' :
        'border-slate-200'
      }`}>
        <div className="relative aspect-[1.586/1] w-full overflow-hidden rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
          {isImg ? (
            <img
              src={fileObj.url}
              alt={`${category} ${side}`}
              onError={() => setFailedImages(prev => ({ ...prev, [docId]: true }))}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-3 text-center">
              <FileText size={32} className="text-[#00D6CC] mb-1.5" />
              <span className="text-[11px] font-mono font-semibold text-slate-700 truncate max-w-[130px]">{fileObj.name}</span>
            </div>
          )}

          {/* Status Badge in corner */}
          <div className="absolute top-2 left-2 z-10">
            {docStatus === 'approved' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold text-white shadow">
                <Check size={10} strokeWidth={3} /> Approved
              </span>
            )}
            {docStatus === 'rejected' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500 px-2 py-0.5 text-[9px] font-bold text-white shadow">
                <X size={10} strokeWidth={3} /> Rejected
              </span>
            )}
            {docStatus === 'pending' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-bold text-white shadow animate-pulse">
                Pending Review
              </span>
            )}
          </div>

          {/* Hover Overlay */}
          <div
            onClick={() => openLightbox(docId)}
            className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-1 cursor-zoom-in text-white backdrop-blur-[1px]"
          >
            <div className="rounded-full bg-[#00D6CC]/90 p-1.5 text-white shadow-lg shadow-[#00D6CC]/30 transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <Eye size={15} />
            </div>
            <span className="text-[10px] font-bold tracking-wider uppercase">Inspect</span>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between min-w-0">
          <div className="min-w-0">
            <span className="text-[9px] font-bold text-[#00D6CC] uppercase tracking-wider block mb-0.5">{side}</span>
            <span className="text-xs font-semibold text-slate-800 truncate block max-w-[120px]" title={fileObj.name}>
              {fileObj.name}
            </span>
          </div>
        </div>

        {/* Admin Document Decision Controls */}
        <div className="mt-3 border-t border-slate-100 pt-2.5 space-y-2">
          {rejectingDocId === docKey ? (
            <div className="space-y-1.5">
              <input
                type="text"
                value={docRejectionReason}
                onChange={(e) => setDocRejectionReason(e.target.value)}
                placeholder="Reason (e.g. blurry, expired)..."
                className="w-full text-[10px] font-medium rounded-lg border border-slate-200 px-2 py-1.5 outline-none focus:border-rose-500 transition text-slate-800 placeholder-slate-400 bg-slate-50"
                autoFocus
              />
              <div className="flex gap-1.5 justify-end">
                <button
                  onClick={() => {
                    setRejectingDocId(null);
                    setDocRejectionReason('');
                  }}
                  className="px-2 py-1 text-[9px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!docRejectionReason.trim()) return;
                    updateDocumentVerificationStatus(req.id, docKey, 'rejected', docRejectionReason);
                    setRejectingDocId(null);
                    setDocRejectionReason('');
                  }}
                  className="px-2 py-1 text-[9px] font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition"
                >
                  Reject
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 justify-between">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Verify Doc:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => updateDocumentVerificationStatus(req.id, docKey, 'approved')}
                  className={`px-2 py-1 text-[9px] font-bold rounded-lg transition flex items-center gap-0.5 ${
                    docStatus === 'approved'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'
                  }`}
                  title="Approve document"
                >
                  <Check size={10} strokeWidth={2.5} /> Approve
                </button>
                <button
                  onClick={() => {
                    setRejectingDocId(docKey);
                    setDocRejectionReason('');
                  }}
                  className={`px-2 py-1 text-[9px] font-bold rounded-lg transition flex items-center gap-0.5 ${
                    docStatus === 'rejected'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
                  }`}
                  title="Reject document"
                >
                  <X size={10} strokeWidth={2.5} /> Reject
                </button>
              </div>
            </div>
          )}

          {docStatus === 'rejected' && docReason && (
            <div className="rounded-lg bg-rose-50 border border-rose-100/50 p-1.5 text-[9px] font-medium text-rose-600 leading-normal flex items-start gap-1">
              <AlertCircle size={10} className="flex-shrink-0 mt-0.5 text-rose-500" />
              <span>{docReason}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const activeDoc = lightboxIdx !== null ? docsList[lightboxIdx] : null;

  const [verificationNotes, setVerificationNotes] = useState('');
  const [rejectingDocKey, setRejectingDocKey] = useState(null);
  const [drawerDocReason, setDrawerDocReason] = useState('');

  if (isDetailDrawer) {
    const handleVerifyAll = () => {
      docsList.forEach(doc => {
        updateDocumentVerificationStatus(req.id, doc.docKey, 'approved');
      });
      approveVerificationRequest(req.id);
    };

    const handleRejectRequest = () => {
      rejectVerificationRequest(req.id, verificationNotes || 'Documents did not meet criteria.');
    };

    const handleDocAction = (docKey, status, reason = '') => {
      updateDocumentVerificationStatus(req.id, docKey, status, reason);
    };

    const handleSubmitAction = () => {
      if (verificationAction === 'approve') {
        docsList.forEach(doc => {
          updateDocumentVerificationStatus(req.id, doc.docKey, 'approved');
        });
        approveVerificationRequest(req.id);
      } else if (verificationAction === 'reject') {
        rejectVerificationRequest(req.id, verificationNotes || 'Documents did not meet criteria.');
      } else if (verificationAction === 'request') {
        if (verificationNotes.trim()) {
          updateDocumentVerificationStatus(req.id, 'nationalId_front', 'pending', 'Request info: ' + verificationNotes);
        }
      }
      setVerificationAction(null);
    };

    const getDocStyle = (category) => {
      const catLower = category.toLowerCase();
      if (catLower.includes('national id') || catLower.includes('aadhaar')) {
        return { bg: 'bg-blue-50/70 border-blue-100 text-blue-500', label: 'Aadhaar Card' };
      }
      if (catLower.includes('license') || catLower.includes('driving')) {
        return { bg: 'bg-emerald-50/70 border-emerald-100 text-emerald-500', label: 'Driving License' };
      }
      if (catLower.includes('registration') || catLower.includes('rc')) {
        return { bg: 'bg-amber-50/70 border-amber-100 text-amber-500', label: 'Vehicle RC' };
      }
      if (catLower.includes('insurance')) {
        return { bg: 'bg-indigo-50/70 border-indigo-100 text-indigo-500', label: 'Insurance' };
      }
      return { bg: 'bg-teal-50/70 border-teal-100 text-teal-500', label: 'Profile Photo' };
    };

    return (
      <div className="space-y-5 text-slate-800 text-xs">
        {/* Header Title */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">Request Details</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            title="Close details"
          >
            <X size={16} />
          </button>
        </div>

        {/* Profile Card Block */}
        <div className="flex items-start justify-between bg-slate-50/30 p-1.5 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-base shadow-sm">
              {req.userName.slice(0, 2).toUpperCase()}
            </div>
            <div className="space-y-0.5">
              <h4 className="font-bold text-slate-905 text-sm leading-tight">{req.userName}</h4>
              <p className="text-[10px] text-slate-400 font-semibold leading-none">{req.userEmail}</p>
              <p className="text-[10px] text-slate-400 font-semibold leading-none mt-1">{req.userPhone || '+91 98765 43210'}</p>
            </div>
          </div>
          <div className="text-right space-y-1">
            <Badge status={req.status} />
            <div className="block">
              <span className="text-[9px] text-slate-400 block font-medium">Request ID</span>
              <span className="text-[10px] font-bold text-slate-800 font-mono">#DRV-{req.id.slice(0, 5).toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Tabs Row */}
        <div className="flex border-b border-slate-100 pb-px gap-1">
          {[
            { id: 'documents', label: 'Documents' },
            { id: 'info', label: 'Driver Info' },
            { id: 'history', label: 'History' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 pb-2 text-[11px] font-bold transition-all relative ${
                activeTab === tab.id
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab contents */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1 no-scrollbar">
              {docsList.map((doc) => {
                const docConf = getDocStyle(doc.category);
                const isImg = isImageUrl(doc.url, doc.name) && !failedImages[doc.id];
                const sizeMB = doc.file?.size ? (doc.file.size / (1024 * 1024)).toFixed(1) + ' MB' : '1.2 MB';
                
                return (
                  <div 
                    key={doc.id} 
                    className="border border-slate-150 bg-white p-3 rounded-2xl flex flex-col gap-2 shadow-sm transition hover:border-slate-200"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Colored Left Icon */}
                        <div className={`h-9 w-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${docConf.bg}`}>
                          <FileText size={16} />
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-[11px] font-bold text-slate-800 truncate">{docConf.label}</h5>
                          <p className="text-[9px] text-slate-400 truncate font-mono">{doc.name}</p>
                          <p className="text-[9px] text-slate-400 font-medium">{sizeMB}</p>
                        </div>
                      </div>

                      {/* Right Badge and Action Buttons */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span 
                          onClick={() => {
                            const nextStatus = doc.status === 'approved' ? 'rejected' : doc.status === 'rejected' ? 'pending' : 'approved';
                            if (nextStatus === 'rejected') {
                              setRejectingDocKey(doc.docKey);
                              setDrawerDocReason('');
                            } else {
                              handleDocAction(doc.docKey, nextStatus);
                            }
                          }}
                          className={`cursor-pointer inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold ring-1 ${
                            doc.status === 'approved' ? 'bg-emerald-50 text-emerald-600 ring-emerald-250/30' :
                            doc.status === 'rejected' ? 'bg-rose-50 text-rose-600 ring-rose-250/30' :
                            'bg-amber-50 text-amber-600 ring-amber-250/30'
                          }`}
                          title="Click to toggle status"
                        >
                          {doc.status === 'approved' ? 'Verified' : doc.status === 'rejected' ? 'Rejected' : 'Pending'}
                        </span>
                        
                        <button
                          onClick={() => openLightbox(doc.id)}
                          className="p-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition"
                          title="Preview"
                        >
                          <Eye size={12} />
                        </button>
                        
                        {doc.url && (
                          <a
                            href={doc.url}
                            download={doc.name}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition"
                            title="Download"
                          >
                            <Download size={12} />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Inline rejection text editor if clicking rejected */}
                    {rejectingDocKey === doc.docKey && (
                      <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                        <input
                          type="text"
                          value={drawerDocReason}
                          onChange={(e) => setDrawerDocReason(e.target.value)}
                          placeholder="Type reason for rejection..."
                          className="flex-grow text-[9px] font-semibold border rounded-lg px-2 py-1 outline-none bg-white border-slate-200 focus:border-rose-500"
                          autoFocus
                        />
                        <button
                          onClick={() => {
                            if (drawerDocReason.trim()) {
                              handleDocAction(doc.docKey, 'rejected', drawerDocReason);
                            }
                            setRejectingDocKey(null);
                            setDrawerDocReason('');
                          }}
                          className="text-[9px] bg-rose-600 text-white font-bold px-2 py-1 rounded-lg"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setRejectingDocKey(null)}
                          className="text-[9px] bg-slate-200 text-slate-600 font-bold px-2 py-1 rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {doc.status === 'rejected' && doc.rejectionReason && (
                      <div className="text-[9px] font-semibold text-rose-500 px-1 pt-0.5 leading-tight">
                        Reason: {doc.rejectionReason}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Verification Actions heading */}
            <div className="space-y-2 pt-1">
              <h4 className="text-[11px] font-bold text-slate-850 uppercase tracking-wider">Verification Actions</h4>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setVerificationAction('approve')}
                  className={`inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border font-bold text-[10px] transition duration-200 ${
                    verificationAction === 'approve'
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                      : 'border-emerald-500 text-emerald-600 bg-emerald-50/20 hover:bg-emerald-50'
                  }`}
                >
                  <CheckCircleIcon size={12} />
                  <span>Approve All</span>
                </button>
                <button
                  onClick={() => setVerificationAction('reject')}
                  className={`inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border font-bold text-[10px] transition duration-200 ${
                    verificationAction === 'reject'
                      ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                      : 'border-rose-500 text-rose-600 bg-rose-50/20 hover:bg-rose-50'
                  }`}
                >
                  <XCircle size={12} />
                  <span>Reject All</span>
                </button>
                <button
                  onClick={() => setVerificationAction('request')}
                  className={`inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border font-bold text-[10px] transition duration-200 ${
                    verificationAction === 'request'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'border-indigo-500 text-indigo-600 bg-indigo-50/20 hover:bg-indigo-50'
                  }`}
                >
                  <MessageSquare size={12} />
                  <span>Request Info</span>
                </button>
              </div>
            </div>

            {/* Add Note Section */}
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Add Note <span className="text-[9px] font-semibold lowercase text-slate-350">(Optional)</span></h4>
              <textarea
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="Write a note..."
                className="w-full min-h-[70px] text-xs font-semibold rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-600 transition placeholder-slate-350 bg-slate-50/20"
              />
            </div>

            {/* Submit Action Button */}
            <div className="pt-1">
              <button
                onClick={handleSubmitAction}
                disabled={!verificationAction}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs transition duration-200 shadow-md shadow-indigo-600/10 active:scale-[0.98] select-none"
              >
                Submit Action
              </button>
            </div>
          </div>
        )}

        {activeTab === 'info' && (
          <div className="space-y-3 bg-slate-50/30 p-4 rounded-2xl border border-slate-100">
            <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Driver Contact Details</h4>
            <div className="space-y-2 text-[11px] font-semibold text-slate-650">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Full Name:</span>
                <span className="text-slate-800">{req.userName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Email:</span>
                <span className="text-slate-800">{req.userEmail}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Phone:</span>
                <span className="text-slate-800">{req.userPhone || '+91 98765 43210'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Car Assigned:</span>
                <span className="text-slate-800">{req.carName}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-medium">Registration No:</span>
                <span className="text-slate-800 font-mono">{req.registrationNo}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4 bg-slate-50/30 p-4 rounded-2xl border border-slate-100">
            <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Audit Log & Timeline</h4>
            <div className="relative pl-4 border-l border-slate-200 ml-1 space-y-4">
              <div className="relative">
                <div className="absolute -left-[20.5px] top-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-white" />
                <p className="font-bold text-[10px] text-slate-850">Verification Request Submitted</p>
                <p className="text-[9px] text-slate-400 mt-0.5">{new Date(req.createdAt).toLocaleString('en-IN')}</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[20.5px] top-1.5 h-2 w-2 rounded-full bg-indigo-500 ring-4 ring-white" />
                <p className="font-bold text-[10px] text-slate-850">Document Review Started</p>
                <p className="text-[9px] text-slate-400 mt-0.5">{new Date(req.createdAt).toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Lightbox Modal */}
        {activeDoc && (
          <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-950/95 p-4 backdrop-blur-md transition-opacity duration-300"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {/* Lightbox Header */}
            <div className="w-full max-w-6xl flex items-center justify-between py-2 border-b border-white/10 text-white">
              <div>
                <span className="text-[10px] font-bold text-[#00D6CC] tracking-widest uppercase block">
                  {activeDoc.category}
                </span>
                <h3 className="text-sm font-bold truncate max-w-[250px] md:max-w-md">
                  {activeDoc.side} — {activeDoc.name}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs bg-white/10 px-2.5 py-1 rounded-lg font-mono text-white/80">
                  {lightboxIdx + 1} / {docsList.length}
                </span>
                <button
                  onClick={closeLightbox}
                  className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-rose-500/20 hover:text-rose-400 transition"
                  title="Close viewer (Esc)"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Lightbox Viewport & Image */}
            <div
              className="relative flex-grow w-full flex items-center justify-center overflow-hidden my-4 select-none"
              onClick={closeLightbox}
            >
              {/* Left Nav Arrow */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevDoc();
                }}
                className="absolute left-4 z-10 h-12 w-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#00D6CC]/20 hover:text-[#00D6CC] text-white/80 transition"
                title="Previous document (Left Arrow)"
              >
                <ChevronLeft size={28} />
              </button>

              {/* The Document Element */}
              <div
                className="relative max-w-full max-h-[70vh] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                {isImageUrl(activeDoc.url, activeDoc.name) ? (
                  <img
                    src={activeDoc.url}
                    alt={activeDoc.name}
                    onMouseDown={handleMouseDown}
                    className={`max-w-full max-h-[70vh] rounded-lg shadow-2xl transition-transform duration-200 select-none ${zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-2xl p-12 text-center text-white max-w-md">
                    <FileText size={72} className="text-red-400 mb-4 animate-bounce" />
                    <h4 className="text-base font-bold mb-2">PDF / Non-Image File</h4>
                    <p className="text-xs text-white/60 mb-6">This document cannot be previewed directly inside the visual lightbox. Please download it or open in a new tab.</p>
                    <a
                      href={activeDoc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-[#00D6CC] hover:bg-[#00D6CC]/90 text-slate-950 font-bold px-5 py-2.5 rounded-xl transition"
                    >
                      <ExternalLink size={16} />
                      <span>Open in New Tab</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Right Nav Arrow */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextDoc();
                }}
                className="absolute right-4 z-10 h-12 w-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#00D6CC]/20 hover:text-[#00D6CC] text-white/80 transition"
                title="Next document (Right Arrow)"
              >
                <ChevronRight size={28} />
              </button>
            </div>

            {/* Lightbox Controls Toolbar */}
            <div
              className="w-full max-w-md flex items-center justify-center gap-6 py-3 px-6 rounded-2xl bg-white/5 border border-white/10 text-white backdrop-blur-sm mb-2"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setZoom((z) => Math.min(z + 0.25, 4))}
                disabled={!isImageUrl(activeDoc.url, activeDoc.name)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/90 hover:text-white transition disabled:opacity-30 disabled:pointer-events-none"
                title="Zoom In"
              >
                <ZoomIn size={18} />
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
                disabled={!isImageUrl(activeDoc.url, activeDoc.name)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/90 hover:text-white transition disabled:opacity-30 disabled:pointer-events-none"
                title="Zoom Out"
              >
                <ZoomOut size={18} />
              </button>
              <button
                onClick={() => setRotation((r) => (r + 90) % 360)}
                disabled={!isImageUrl(activeDoc.url, activeDoc.name)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/90 hover:text-white transition disabled:opacity-30 disabled:pointer-events-none"
                title="Rotate Clockwise 90°"
              >
                <RotateCw size={18} />
              </button>
              <button
                onClick={resetTransform}
                disabled={!isImageUrl(activeDoc.url, activeDoc.name)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/90 hover:text-white transition disabled:opacity-30 disabled:pointer-events-none"
                title="Reset Transform"
              >
                <RefreshCw size={18} />
              </button>
              <div className="h-6 w-px bg-white/15" />
              {activeDoc.url && (
                <a
                  href={activeDoc.url}
                  download={activeDoc.name}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-white/5 hover:bg-[#00D6CC]/20 hover:text-[#00D6CC] text-white/90 transition"
                  title="Download / Open Full Screen"
                >
                  <Download size={18} />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }


  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      {/* Header / Back Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActivePage('verification-requests')}
            className="group flex items-center justify-center h-12 w-12 rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition duration-200 shadow-soft"
            title="Back to requests list"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Driver Verification</span>
              <Badge status={req.status} />
            </div>
            <h2 className="mt-1.5 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Request from {req.userName}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs bg-slate-100 px-3 py-1.5 rounded-xl font-mono text-slate-600 border border-slate-200">
          <Calendar size={13} className="text-slate-400" />
          <span>Submitted: {formatDate(req.createdAt)}</span>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid gap-8 lg:grid-cols-3 items-start">
        {/* Left Column - Details & Documents */}
        <div className="lg:col-span-2 space-y-8">

          {/* Driver Information Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-soft space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#00D6CC] to-[#00b0cc] text-white shadow-md shadow-[#00D6CC]/20">
                <User size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Driver Profile Details</h3>
                <p className="text-xs text-slate-400">Personal contact and authentication info</p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1.5 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Full Name</p>
                <p className="text-sm font-bold text-slate-800">{req.userName}</p>
              </div>

              <div className="space-y-1.5 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email Address</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700 truncate">{req.userEmail || '—'}</span>
                  {req.userEmail && <CopyButton text={req.userEmail} />}
                </div>
              </div>

              <div className="space-y-1.5 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Phone Number</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">{req.userPhone || '—'}</span>
                  {req.userPhone && <CopyButton text={req.userPhone} />}
                </div>
              </div>

              <div className="space-y-1.5 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Associated Company ID</p>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                  <Building size={14} className="text-slate-400" />
                  <span className="font-mono">{req.companyId || '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Inline Document Previews Section - Refined to Compact 3-Column Grid */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">Submitted Documents</h3>
                <p className="text-xs text-slate-400 mt-0.5">Click any document image to inspect, zoom, or rotate</p>
              </div>
              <button
                onClick={() => {
                  updateDocumentVerificationStatus(req.id, 'nationalId_front', 'approved');
                  updateDocumentVerificationStatus(req.id, 'nationalId_back', 'approved');
                  updateDocumentVerificationStatus(req.id, 'driverLicense_front', 'approved');
                  updateDocumentVerificationStatus(req.id, 'driverLicense_back', 'approved');
                  updateDocumentVerificationStatus(req.id, 'vehicleRegistration', 'approved');
                  updateDocumentVerificationStatus(req.id, 'vehicleRegistrationBack', 'approved');
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200 transition active:scale-95"
              >
                <CheckCircle size={14} /> Verify All Documents
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {/* National ID Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                  <div className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">National ID</span>
                </div>
                <div className="space-y-4">
                  {renderDocPreview('National ID', 'Front Side', req.nationalId?.front, 'nationalId_front')}
                  {renderDocPreview('National ID', 'Back Side', req.nationalId?.back, 'nationalId_back')}
                </div>
              </div>

              {/* Driver License Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Driver License</span>
                </div>
                <div className="space-y-4">
                  {renderDocPreview('Driver License', 'Front Side', req.driverLicense?.front || req.document, 'driverLicense_front')}
                  {renderDocPreview('Driver License', 'Back Side', req.driverLicense?.back, 'driverLicense_back')}
                </div>
              </div>

              {/* Vehicle Registration Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                  <div className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vehicle Reg.</span>
                </div>
                <div className="space-y-4">
                  {renderDocPreview('Vehicle Registration', 'Front Side', req.vehicleRegistration, 'vehicleRegistration')}
                  {renderDocPreview('Vehicle Registration', 'Back Side', req.vehicleRegistrationBack, 'vehicleRegistrationBack')}
                </div>
              </div>
            </div>
          </div>

          {/* Car Specifications Details */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-soft space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#00D6CC] to-[#00b0cc] text-white shadow-md shadow-[#00D6CC]/20">
                <Car size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Vehicle Configuration</h3>
                <p className="text-xs text-slate-400">Specifications and uploaded vehicle photos</p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Brand & Model</p>
                <p className="text-sm font-bold text-slate-800">{req.carName || '—'}</p>
              </div>
              <div className="space-y-1 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Registration Plate Number</p>
                <p className="mt-1 text-sm font-mono font-bold text-[#00D6CC] bg-[#00D6CC]/5 px-3 py-1 rounded-xl w-max border border-[#00D6CC]/15">
                  {req.registrationNo || '—'}
                </p>
              </div>
            </div>

            {req.carImages && req.carImages.length > 0 ? (
              <div className="mt-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Vehicle Photos</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {req.carImages.map((img, i) => {
                    const docId = `vehicle_photo_${i}`;
                    return (
                      <div
                        key={i}
                        onClick={() => openLightbox(docId)}
                        className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 cursor-zoom-in shadow-soft hover:shadow-md hover:border-[#00D6CC] transition duration-300"
                      >
                        <img
                          src={img.url}
                          alt={`Car Preview ${i + 1}`}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye size={16} className="text-white" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mt-4 border border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50/50">
                <FileMinus size={28} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs text-slate-400 font-medium">No car photos uploaded.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Decision Panel & Actions */}
        <div className="lg:sticky lg:top-8 space-y-6">

          {/* Decision Controller */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <CheckCircle size={18} className="text-[#00D6CC]" /> Decision & Status
            </h3>

            {/* Current Status Box */}
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Verification Status</span>
              <Badge status={req.status} />
            </div>

            {/* Rejection Details Display */}
            {req.status === 'rejected' && req.rejectionReason && (
              <div className="rounded-2xl bg-rose-50 border border-rose-100 p-4 space-y-1">
                <div className="flex items-center gap-1.5 text-rose-800 text-xs font-bold">
                  <AlertCircle size={14} />
                  <span>Rejection Reason</span>
                </div>
                <p className="text-xs font-semibold text-rose-700 leading-relaxed">{req.rejectionReason}</p>
              </div>
            )}

            {/* Actions for Pending Verification */}
            {req.status === 'pending' ? (
              <div className="space-y-5">
                {/* Form Errors */}
                {formError && (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-[11px] font-semibold text-amber-700 flex items-start gap-1.5">
                    <AlertCircle size={14} className="flex-shrink-0 text-amber-600 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Quick Presets */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Quick Rejection Comments
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {rejectionPresets.map((preset, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setReason(preset);
                          setFormError('');
                        }}
                        className="text-[10px] font-semibold text-slate-600 bg-slate-50 hover:bg-[#00D6CC]/10 hover:text-[#00D6CC] px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-[#00D6CC]/35 transition text-left active:scale-95"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reason Text Area */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Rejection Comment / Note
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => {
                      setReason(e.target.value);
                      if (e.target.value.trim()) setFormError('');
                    }}
                    placeholder="Enter reason if rejecting request..."
                    className="w-full min-h-[96px] text-xs font-medium rounded-2xl border border-slate-200 p-3.5 outline-none focus:border-[#00D6CC] transition duration-200 placeholder-slate-400"
                  />
                </div>

                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={handleApprove}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 py-3 text-sm font-bold text-white transition duration-200 shadow-md shadow-emerald-600/10 active:scale-[0.98]"
                  >
                    <CheckCircle size={16} />
                    <span>Approve Request</span>
                  </button>
                  <button
                    onClick={handleReject}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-rose-600 hover:bg-rose-500 py-3 text-sm font-bold text-white transition duration-200 shadow-md shadow-rose-600/10 active:scale-[0.98]"
                  >
                    <X size={16} />
                    <span>Reject Request</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-5 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-bold">
                No active actions pending.
              </div>
            )}
          </div>

          {/* Audit / Extra Card */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-6 text-xs text-slate-400 space-y-3">
            <h4 className="font-bold text-slate-600 uppercase tracking-wide">Verification Audit Logs</h4>
            <div className="space-y-2 font-medium">
              <div className="flex justify-between">
                <span>Requested Profile ID</span>
                <span className="font-mono text-slate-500 truncate max-w-[120px]" title={req.id}>{req.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Uploaded Documents</span>
                <span className="font-semibold text-slate-600">{documentFilesCount} files</span>
              </div>
              <div className="flex justify-between">
                <span>Verification State</span>
                <span className="capitalize">{req.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Lightbox Modal */}
      {activeDoc && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-950/95 p-4 backdrop-blur-md transition-opacity duration-300"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {/* Lightbox Header */}
          <div className="w-full max-w-6xl flex items-center justify-between py-2 border-b border-white/10 text-white">
            <div>
              <span className="text-[10px] font-bold text-[#00D6CC] tracking-widest uppercase block">
                {activeDoc.category}
              </span>
              <h3 className="text-sm font-bold truncate max-w-[250px] md:max-w-md">
                {activeDoc.side} — {activeDoc.name}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs bg-white/10 px-2.5 py-1 rounded-lg font-mono text-white/80">
                {lightboxIdx + 1} / {docsList.length}
              </span>
              <button
                onClick={closeLightbox}
                className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-rose-500/20 hover:text-rose-400 transition"
                title="Close viewer (Esc)"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Lightbox Viewport & Image */}
          <div
            className="relative flex-grow w-full flex items-center justify-center overflow-hidden my-4 select-none"
            onClick={closeLightbox}
          >
            {/* Left Nav Arrow */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevDoc();
              }}
              className="absolute left-4 z-10 h-12 w-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#00D6CC]/20 hover:text-[#00D6CC] text-white/80 transition"
              title="Previous document (Left Arrow)"
            >
              <ChevronLeft size={28} />
            </button>

            {/* The Document Element */}
            <div
              className="relative max-w-full max-h-[70vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {isImageUrl(activeDoc.url, activeDoc.name) ? (
                <img
                  src={activeDoc.url}
                  alt={activeDoc.name}
                  onMouseDown={handleMouseDown}
                  className={`max-w-full max-h-[70vh] rounded-lg shadow-2xl transition-transform duration-200 select-none ${zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
                    }`}
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-2xl p-12 text-center text-white max-w-md">
                  <FileText size={72} className="text-red-400 mb-4 animate-bounce" />
                  <h4 className="text-base font-bold mb-2">PDF / Non-Image File</h4>
                  <p className="text-xs text-white/60 mb-6">This document cannot be previewed directly inside the visual lightbox. Please download it or open in a new tab.</p>
                  <a
                    href={activeDoc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-[#00D6CC] hover:bg-[#00D6CC]/90 text-slate-950 font-bold px-5 py-2.5 rounded-xl transition"
                  >
                    <ExternalLink size={16} />
                    <span>Open in New Tab</span>
                  </a>
                </div>
              )}
            </div>

            {/* Right Nav Arrow */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextDoc();
              }}
              className="absolute right-4 z-10 h-12 w-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#00D6CC]/20 hover:text-[#00D6CC] text-white/80 transition"
              title="Next document (Right Arrow)"
            >
              <ChevronRight size={28} />
            </button>
          </div>

          {/* Lightbox Controls Toolbar */}
          <div
            className="w-full max-w-md flex items-center justify-center gap-6 py-3 px-6 rounded-2xl bg-white/5 border border-white/10 text-white backdrop-blur-sm mb-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.25, 4))}
              disabled={!isImageUrl(activeDoc.url, activeDoc.name)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/90 hover:text-white transition disabled:opacity-30 disabled:pointer-events-none"
              title="Zoom In"
            >
              <ZoomIn size={18} />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
              disabled={!isImageUrl(activeDoc.url, activeDoc.name)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/90 hover:text-white transition disabled:opacity-30 disabled:pointer-events-none"
              title="Zoom Out"
            >
              <ZoomOut size={18} />
            </button>
            <button
              onClick={() => setRotation((r) => (r + 90) % 360)}
              disabled={!isImageUrl(activeDoc.url, activeDoc.name)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/90 hover:text-white transition disabled:opacity-30 disabled:pointer-events-none"
              title="Rotate Clockwise 90°"
            >
              <RotateCw size={18} />
            </button>
            <button
              onClick={resetTransform}
              disabled={!isImageUrl(activeDoc.url, activeDoc.name)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/90 hover:text-white transition disabled:opacity-30 disabled:pointer-events-none"
              title="Reset Transform"
            >
              <RefreshCw size={18} />
            </button>
            <div className="h-6 w-px bg-white/15" />
            {activeDoc.url && (
              <a
                href={activeDoc.url}
                download={activeDoc.name}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-white/5 hover:bg-[#00D6CC]/20 hover:text-[#00D6CC] text-white/90 transition"
                title="Download / Open Full Screen"
              >
                <Download size={18} />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationRequestDetail;
