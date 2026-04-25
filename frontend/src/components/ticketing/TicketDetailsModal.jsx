import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTicketComments, createTicketComment, deleteTicketComment } from '../../services/ticketApi';
import { X, Send, Trash2, Clock, MapPin, User, FileText, Image as ImageIcon, MessageSquare } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const TicketDetailsModal = ({ ticket, onClose }) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', ticket.id],
    queryFn: () => getTicketComments(ticket.id)
  });

  const commentMutation = useMutation({
    mutationFn: (text) => createTicketComment(ticket.id, { 
        text, 
        userId: user?.id || 1, 
        userRole: user?.role || 'USER' 
    }), 
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', ticket.id] });
      setNewComment('');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId) => deleteTicketComment(commentId),
    onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['comments', ticket.id] });
    }
  });

  const handleCreateComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    commentMutation.mutate(newComment);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-slate-900/20 ring-1 ring-slate-200">
        
        {/* Left Side: Ticket Details & Image */}
        <div className="w-full md:w-1/2 p-8 overflow-y-auto border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                 <span className="bg-slate-800 text-white text-xs font-bold px-2.5 py-1 rounded-md tracking-wider">
                   #{ticket.id}
                 </span>
                 <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                     ticket.priority === 'URGENT' ? 'bg-red-50 text-red-600 border-red-200' :
                     ticket.priority === 'HIGH' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                     'bg-blue-50 text-blue-600 border-blue-200'
                 }`}>
                   {ticket.priority}
                 </span>
                 <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-600">
                   {ticket.category}
                 </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mt-4 leading-tight">Ticket details</h2>
            </div>
            
            <button 
              onClick={onClose}
              className="md:hidden p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-800 mb-3 border-b border-slate-50 pb-2">
                 <FileText className="w-4 h-4 text-blue-500" /> Description
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-1">
                 <span className="text-xs font-medium text-slate-400 uppercase tracking-wide flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Resource</span>
                 <span className="font-semibold text-slate-800">Resource ID: {ticket.resourceId}</span>
               </div>
               <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-1">
                 <span className="text-xs font-medium text-slate-400 uppercase tracking-wide flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Reporter</span>
                 <span className="font-semibold text-slate-800">User ID: {ticket.userId}</span>
               </div>
            </div>

            {ticket.imageUrl && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-800 mb-3">
                   <ImageIcon className="w-4 h-4 text-blue-500" /> Attached Evidence
                </h3>
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-black/5 flex justify-center shadow-sm">
                  <a href={ticket.imageUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                     <img 
                       src={ticket.imageUrl} 
                       alt="Incident Report Evidence" 
                       className="w-full h-auto object-cover max-h-64 hover:opacity-90 transition-opacity"
                       loading="lazy"
                     />
                  </a>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
               <Clock className="w-3.5 h-3.5" />
               Created: {new Date(ticket.createdAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Right Side: Comments */}
        <div className="w-full md:w-1/2 flex flex-col bg-white">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white relative z-10 shadow-sm">
            <div>
               <h3 className="font-bold text-slate-800 text-lg">Activity Stream</h3>
               <p className="text-sm text-slate-500">Technician notes and updates</p>
            </div>
            <button 
              onClick={onClose}
              className="hidden md:flex p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/30">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                 <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
              </div>
            ) : comments.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                     <Send className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="font-medium">No comments yet</p>
               </div>
            ) : (
              comments.map(comment => {
                const isMe = comment.userId === user?.id;
                const isTechnician = comment.userRole === 'TECHNICIAN';
                const displayName = isTechnician ? 'Technician' : 'User';
                
                return (
                  <div 
                    key={comment.id} 
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group animate-in fade-in slide-in-from-bottom-2 duration-300`}
                  >
                     <div className={`flex items-center gap-2 mb-1 text-[10px] font-bold uppercase tracking-wider ${isMe ? 'flex-row-reverse text-blue-600' : 'text-slate-500'}`}>
                        <span>{isMe ? 'You' : displayName}</span>
                        <span className="text-[10px] font-medium text-slate-400 lowercase">{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                     </div>
                     
                     <div className="relative max-w-[85%]">
                        <div className={`p-3.5 rounded-2xl text-sm shadow-sm ${
                          isMe 
                            ? 'bg-blue-600 text-white rounded-tr-none' 
                            : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                        }`}>
                           {comment.text}
                        </div>
                        
                        {isMe && (
                          <button 
                             onClick={() => deleteMutation.mutate(comment.id)}
                             className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-red-500 transition-all"
                             title="Delete message"
                           >
                             <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                     </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-5 border-t border-slate-100 bg-white">
            <form onSubmit={handleCreateComment} className="flex gap-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Type a comment or update..."
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all placeholder:text-slate-400"
              />
              <button 
                type="submit"
                disabled={!newComment.trim() || commentMutation.isPending}
                className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:bg-blue-300 transition-all shadow-sm focus:ring-4 focus:ring-blue-100 flex items-center justify-center"
              >
                <Send className="w-5 h-5 -ml-0.5 mt-0.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsModal;
