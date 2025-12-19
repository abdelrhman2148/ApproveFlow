import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus } from '../types';
import { useApp } from '../contexts/AppContext';
import { CheckCircle, XCircle, Send, FileText, Lock, MessageSquare } from 'lucide-react';
import { generateClientEmail } from '../services/gemini';

interface ClientViewProps {
  projectId: string;
}

const ClientView: React.FC<ClientViewProps> = ({ projectId }) => {
  const { getProject, addComment, updateProjectStatus } = useApp();
  const [project, setProject] = useState<Project | undefined>(undefined);
  const [newComment, setNewComment] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [isAnimatingSuccess, setIsAnimatingSuccess] = useState(false);

  useEffect(() => {
    const p = getProject(projectId);
    setProject(p);
  }, [projectId, getProject]);

  if (!project) return <div className="min-h-screen flex items-center justify-center text-gray-500">Project not found</div>;

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addComment(projectId, {
      author: 'client',
      text: newComment
    });
    setNewComment('');
    // If status was approved, maybe warn them? Assuming simple flow for now.
    // Also update project state locally to reflect immediate change
    setProject(prev => prev ? { ...prev, comments: [...prev.comments, { id: 'temp', author: 'client', text: newComment, timestamp: Date.now() }] } : undefined);
  };

  const handleApprove = () => {
    updateProjectStatus(projectId, ProjectStatus.APPROVED, {
      approvedAt: Date.now(),
      approverAgent: navigator.userAgent,
      ipAddress: '127.0.0.1' // Simulated
    });
    setShowApprovalModal(false);
    setIsAnimatingSuccess(true);
    // Refresh local state
    setProject(getProject(projectId));
  };

  const handleRequestChanges = () => {
    updateProjectStatus(projectId, ProjectStatus.CHANGES_REQUESTED);
    setProject(getProject(projectId));
  };

  if (isAnimatingSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-50 text-emerald-900 animate-fade-in text-center p-6">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle size={48} className="text-emerald-600" />
        </div>
        <h1 className="text-4xl font-bold mb-2">Approved!</h1>
        <p className="text-lg opacity-80 mb-8">Thank you for your feedback. A confirmation certificate has been generated.</p>
        <button 
          onClick={() => setIsAnimatingSuccess(false)}
          className="text-emerald-700 font-semibold underline hover:text-emerald-900"
        >
          Return to project
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Main Asset View */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center z-10 shadow-sm">
          <div>
            <h1 className="font-bold text-gray-800 text-lg">{project.title}</h1>
            <p className="text-xs text-gray-500">For: {project.clientName}</p>
          </div>
          <div className="flex gap-2">
            {project.status === ProjectStatus.APPROVED && (
               <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                 <Lock size={12}/> Approved on {new Date(project.approvalData?.approvedAt || 0).toLocaleDateString()}
               </span>
            )}
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-4 md:p-8 flex items-center justify-center bg-gray-100/50">
          <div className="bg-white p-2 rounded-lg shadow-sm max-w-4xl w-full">
            <img src={project.imageUrl} alt="Asset" className="w-full h-auto rounded" />
          </div>
        </div>

        {/* Action Bar (Sticky Bottom) */}
        {project.status !== ProjectStatus.APPROVED && (
          <div className="bg-white border-t border-gray-200 p-4 flex justify-between items-center gap-4 shadow-lg z-20">
            <div className="text-xs text-gray-400 hidden sm:block">
              By clicking Approve, you agree this work is complete.
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button 
                onClick={handleRequestChanges}
                className="flex-1 sm:flex-none px-6 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Request Changes
              </button>
              <button 
                onClick={() => setShowApprovalModal(true)}
                className="flex-1 sm:flex-none px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                <CheckCircle size={20} /> Approve
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar - Comments */}
      <div className="w-full md:w-80 lg:w-96 bg-white border-l border-gray-200 flex flex-col h-1/2 md:h-screen shadow-xl z-30">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-bold text-gray-700 flex items-center gap-2">
            <MessageSquare size={18} /> Comments
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
          {project.comments.length === 0 ? (
            <div className="text-center text-gray-400 py-10 text-sm">
              No comments yet.<br/>Type below to give feedback.
            </div>
          ) : (
            project.comments.map(c => (
              <div key={c.id} className={`flex flex-col ${c.author === 'freelancer' ? 'items-end' : 'items-start'}`}>
                 <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${c.author === 'freelancer' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-700 rounded-bl-none'}`}>
                   {c.text}
                 </div>
                 <span className="text-[10px] text-gray-400 mt-1 px-1">
                   {c.author === 'freelancer' ? 'Designer' : 'You'} • {new Date(c.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                 </span>
              </div>
            ))
          )}
        </div>

        {project.status !== ProjectStatus.APPROVED && (
          <form onSubmit={handleSendComment} className="p-4 border-t border-gray-100 bg-white">
            <div className="relative">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Type feedback here..."
                className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              />
              <button 
                type="submit" 
                disabled={!newComment.trim()}
                className="absolute right-2 top-2 p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg disabled:text-gray-300 disabled:hover:bg-transparent transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Approval Confirmation Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={32} className="text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Confirm Approval?</h3>
              <p className="text-sm text-gray-500 mb-6">
                This will lock the project status and generate an approval certificate. This action is time-stamped.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setShowApprovalModal(false)}
                  className="py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleApprove}
                  className="py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  Yes, Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientView;