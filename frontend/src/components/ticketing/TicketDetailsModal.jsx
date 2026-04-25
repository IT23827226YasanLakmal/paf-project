import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTicketComments, createTicketComment, deleteTicketComment } from '../../services/ticketApi';
import { X, Send, Trash2, Clock, MapPin, User, FileText, Image as ImageIcon, MessageSquare, Timer, Zap } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const TicketDetailsModal = ({ ticket, onClose }) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const formatDuration = (start, end) => {
    if (!start || !end) return null;
    const diff = new Date(end) - new Date(start);
    if (diff < 0) return "0m";
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${mins % 60}m`;
    return `${mins}m`;
  };

  const responseTime = formatDuration(ticket.createdAt, ticket.firstResponseAt);
  const resolutionTime = formatDuration(ticket.createdAt, ticket.resolvedAt);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div 
        className="bg-overlay rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
        style={{ border: '1px solid var(--border-subtle)' }}
      >
        
        {/* Left Side: Ticket Details & Image */}
        <div className="w-full md:w-1/2 p-8 overflow-y-auto bg-raised flex flex-col gap-6" style={{ borderRight: '1px solid var(--border-subtle)' }}>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3">
                 <span className="bg-primary text-canvas text-xs font-mono font-bold px-2.5 py-1 rounded-md tracking-wider">
                   #{ticket.id}
                 </span>
                 <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                     ticket.priority === 'URGENT' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                     ticket.priority === 'HIGH' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                     'bg-blue-500/10 text-accent border-blue-500/20'
                 }`}>
                   {ticket.priority}
                 </span>
                 <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-surface border border-subtle text-primary">
                   {ticket.category}
                 </span>
              </div>
              <h2 className="text-2xl font-bold text-primary mt-4 leading-tight">Ticket details</h2>
            </div>
            
            <button 
              onClick={onClose}
              className="md:hidden p-2 bg-muted-fill text-secondary rounded-full hover:bg-raised transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-surface p-5 rounded-2xl shadow-sm" style={{ border: '1px solid var(--border-subtle)' }}>
              <h3 className="text-sm font-semibold flex items-center gap-2 text-primary mb-3 pb-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                 <FileText className="w-4 h-4 text-accent" /> Description
              </h3>
              <p className="text-secondary text-sm leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-surface p-4 rounded-xl shadow-sm flex flex-col gap-1" style={{ border: '1px solid var(--border-subtle)' }}>
                 <span className="text-xs font-medium text-muted uppercase tracking-wide flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Resource</span>
                 <span className="font-semibold text-primary">Resource ID: {ticket.resourceId}</span>
               </div>
               <div className="bg-surface p-4 rounded-xl shadow-sm flex flex-col gap-1" style={{ border: '1px solid var(--border-subtle)' }}>
                 <span className="text-xs font-medium text-muted uppercase tracking-wide flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Reporter</span>
                 <span className="font-semibold text-primary">User ID: {ticket.userId}</span>
               </div>
            </div>

            {ticket.imageUrl && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-primary mb-3">
                   <ImageIcon className="w-4 h-4 text-accent" /> Attached Evidence
                </h3>
                <div className="rounded-2xl overflow-hidden bg-black/5 flex justify-center shadow-sm" style={{ border: '1px solid var(--border-subtle)' }}>
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
            
            <div className="flex flex-wrap items-center gap-4 py-4 mt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
               <div className="flex items-center gap-2 text-xs text-muted font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  Created: {new Date(ticket.createdAt).toLocaleString()}
               </div>
               
               {responseTime && (
                 <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 text-accent rounded-lg text-[10px] font-bold uppercase tracking-tight border border-blue-500/20 shadow-sm">
                    <Zap className="w-3 h-3" />
                    First Response: {responseTime}
                 </div>
               )}

               {resolutionTime && (
                 <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-bold uppercase tracking-tight border border-emerald-500/20 shadow-sm">
                    <Timer className="w-3 h-3" />
                    Resolved in: {resolutionTime}
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Right Side: Comments */}
        <div className="w-full md:w-1/2 flex flex-col bg-surface">
          <div className="p-6 flex items-center justify-between bg-surface relative z-10 shadow-sm" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
               <h3 className="font-bold text-primary text-lg">Activity Stream</h3>
               <p className="text-sm text-secondary">Technician notes and updates</p>
            </div>
            <button 
              onClick={onClose}
              className="hidden md:flex p-2 hover:bg-raised text-muted hover:text-primary rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-raised">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                 <div className="w-8 h-8 rounded-full border-4 border-accent border-t-transparent animate-spin"></div>
              </div>
            ) : comments.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full text-muted space-y-3">
                  <div className="w-16 h-16 bg-muted-fill rounded-full flex items-center justify-center">
                     <Send className="w-6 h-6 text-muted opacity-50" />
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
                     <div className={`flex items-center gap-2 mb-1 text-[10px] font-bold uppercase tracking-wider ${isMe ? 'flex-row-reverse text-accent' : 'text-muted'}`}>
                        <span>{isMe ? 'You' : displayName}</span>
                        <span className="text-[10px] font-medium text-muted lowercase">{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                     </div>
                     
                     <div className="relative max-w-[85%]">
                        <div className={`p-3.5 rounded-2xl text-sm shadow-sm ${
                          isMe 
                            ? 'bg-accent text-white rounded-tr-none' 
                            : 'bg-surface border border-subtle text-primary rounded-tl-none'
                        }`}>
                           {comment.text}
                        </div>
                        
                        {isMe && (
                          <button 
                             onClick={() => deleteMutation.mutate(comment.id)}
                             className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 text-muted hover:text-red-500 transition-all cursor-pointer"
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

          <div className="p-5 bg-surface" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <form onSubmit={handleCreateComment} className="flex gap-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Type a comment or update..."
                className="flex-1 px-4 py-3 bg-raised border border-subtle rounded-xl focus:ring-2 focus:ring-accent outline-none text-sm transition-all placeholder:text-muted text-primary"
              />
              <button 
                type="submit"
                disabled={!newComment.trim() || commentMutation.isPending}
                className="bg-accent text-white p-3 rounded-xl hover-bg-accent disabled:opacity-50 transition-all shadow-sm flex items-center justify-center cursor-pointer"
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
