import { ExternalLink, FileText } from 'lucide-react';
import { formatDate } from '../utils/storage';

const FilePreview = ({ files = [] }) => {
  if (!files.length) return <p className="text-sm text-slate-500">No documents uploaded.</p>;

  return (
    <div className="space-y-2">
      {files.map((file, index) => (
        <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-lg bg-white p-2 text-slate-700 shadow-sm">
              <FileText size={17} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{file.name}</p>
              <p className="text-xs text-slate-500">{formatDate(file.uploadedAt)}</p>
            </div>
          </div>
          {file.url ? (
            <a href={file.url} target="_blank" rel="noreferrer" className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-slate-950" title="Open file">
              <ExternalLink size={16} />
            </a>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default FilePreview;
