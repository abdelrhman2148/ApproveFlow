import React, { useState, useRef } from 'react';
import { generateProjectDescription } from '../services/gemini';
import { Upload, X, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';

interface NewProjectModalProps {
  onClose: () => void;
  onSave: (title: string, clientName: string, imageUrl: string) => void;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({ onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setImageUrl(objectUrl);

    // AI Analysis
    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const result = await generateProjectDescription(base64Data, file.type);
        if (result.title) setTitle(result.title);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !clientName || !imageUrl) return;
    onSave(title, clientName, imageUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">New Approval Request</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* File Upload Area */}
          <div 
            className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${imageUrl ? 'border-emerald-400 bg-emerald-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}
            onClick={() => fileInputRef.current?.click()}
          >
             {imageUrl ? (
               <div className="relative w-full h-40">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-contain rounded-md" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 hover:opacity-100 transition-opacity rounded-md">
                    <span className="bg-white px-3 py-1 rounded-full text-sm font-medium shadow-sm">Change</span>
                  </div>
               </div>
             ) : (
               <>
                 <div className="bg-blue-100 p-3 rounded-full mb-3 text-blue-600">
                   <Upload size={24} />
                 </div>
                 <p className="text-sm font-medium text-gray-600">Click to upload asset</p>
                 <p className="text-xs text-gray-400 mt-1">Images or Screenshots</p>
               </>
             )}
             <input 
               type="file" 
               ref={fileInputRef} 
               className="hidden" 
               accept="image/*" 
               onChange={handleFileChange}
             />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Project Title</label>
              <div className="relative">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q4 Social Campaign"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                  required
                />
                 {isAnalyzing && (
                  <div className="absolute right-3 top-3 animate-pulse text-blue-500">
                    <Sparkles size={18} />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                {isAnalyzing ? "AI is generating title..." : <><Sparkles size={12} className="text-purple-400"/> Auto-filled by AI based on image</>}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Client Name</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Acme Inc."
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!imageUrl || !title || !clientName}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
          >
            Create Approval Link
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewProjectModal;