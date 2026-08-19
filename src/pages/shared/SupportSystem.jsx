import { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/storage';
import {
  MessageSquare,
  Search,
  Plus,
  Send,
  ArrowLeft,
  CheckCircle,
  HelpCircle,
  Clock,
  User,
  Shield,
  LifeBuoy
} from 'lucide-react';

const SupportSystem = () => {
  const { state, currentUser, createSupportTicket, addSupportTicketMessage, updateSupportTicketStatus } = useApp();
  
  // State for Navigation / Views
  const [viewMode, setViewMode] = useState('list'); // 'list', 'create', 'chat'
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  
  // Create ticket Form State
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Car Verification');
  const [description, setDescription] = useState('');
  const [createError, setCreateError] = useState('');
  
  // Chat State
  const [chatMessage, setChatMessage] = useState('');
  const chatEndRef = useRef(null);

  // Filter state for the list view
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const tickets = state.supportTickets || [];

  // Filtered tickets list based on user role and query filters
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      // 1. Role separation
      if (currentUser.role === 'admin') {
        // Companies only see their own tickets
        if (ticket.companyId !== currentUser.id) return false;
      }
      
      // 2. Status filter
      if (statusFilter !== 'all' && ticket.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      // 3. Search query filter
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matches =
          ticket.subject.toLowerCase().includes(query) ||
          ticket.category.toLowerCase().includes(query) ||
          (ticket.companyName || '').toLowerCase().includes(query);
        if (!matches) return false;
      }

      return true;
    });
  }, [tickets, currentUser, statusFilter, searchTerm]);

  // Retrieve active selected ticket
  const activeTicket = useMemo(() => {
    return tickets.find(t => t.id === selectedTicketId);
  }, [tickets, selectedTicketId]);

  // Scroll to bottom of chat on new messages
  useEffect(() => {
    if (viewMode === 'chat' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [viewMode, activeTicket?.messages]);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setCreateError('Please fill in all required fields.');
      return;
    }

    createSupportTicket(
      subject.trim(),
      category,
      description.trim(),
      currentUser.id,
      currentUser.userName || currentUser.companyName || 'Company Admin'
    );

    // Reset fields and go back to list
    setSubject('');
    setDescription('');
    setCategory('Car Verification');
    setCreateError('');
    setViewMode('list');
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !selectedTicketId) return;

    const senderRole = currentUser.role; // 'super_admin' or 'admin' (which represents company)
    const senderName = currentUser.role === 'super_admin' 
      ? 'Super Admin' 
      : (currentUser.userName || currentUser.companyName || 'Company');

    addSupportTicketMessage(selectedTicketId, chatMessage.trim(), senderRole, senderName);
    setChatMessage('');
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Open':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'In Progress':
        return 'bg-[#00D6CC]/15 text-[#00D6CC] border border-[#00D6CC]/20';
      case 'Resolved':
        return 'bg-slate-100 text-slate-600 border border-slate-200';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="page-header flex items-center justify-between">
        <div>
          <p className="breadcrumb-label">SUPPORT</p>
          <h2>Support System</h2>
          <p>
            {currentUser.role === 'super_admin' 
              ? 'Review and respond to support queries submitted by companies.' 
              : 'Submit technical, billing, or verification support tickets directly to administrators.'}
          </p>
        </div>

        {/* Create Ticket Button for Company Admin */}
        {currentUser.role === 'admin' && viewMode === 'list' && (
          <button
            onClick={() => setViewMode('create')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-white shadow-lg transition hover:opacity-90 active:scale-95 border-0"
            style={{ backgroundColor: '#002E5B', boxShadow: '0 4px 14px rgba(0, 46, 91, 0.2)' }}
          >
            <Plus size={16} /> Create Support Ticket
          </button>
        )}
      </div>

      {/* ── View 1: Support Tickets List ───────────────────────────── */}
      {viewMode === 'list' && (
        <div className="card card-table p-2">
          {/* Toolbar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 px-6 py-4">
            <div className="flex items-center gap-2">
              <LifeBuoy size={18} className="text-[#00D6CC]" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Active Support Tickets</h3>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative w-48">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-2xl border border-[#e2e8f0] bg-white py-1.5 pl-9 pr-4 text-xs outline-none transition focus:border-[#00D6CC]"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-[#e2e8f0] px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 focus:outline-none bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="card-body table-responsive">
            <table className="table table-bordered table-striped mb-0 text-left">
              <thead>
                <tr>
                  <th className="font-bold text-slate-400 w-24">Ticket ID</th>
                  <th className="font-bold text-slate-400">Subject</th>
                  <th className="font-bold text-slate-400 w-44">Category</th>
                  {currentUser.role === 'super_admin' && (
                    <th className="font-bold text-slate-400 w-44">Submitted By</th>
                  )}
                  <th className="font-bold text-slate-400 w-40">Created On</th>
                  <th className="font-bold text-slate-400 text-center w-28">Status</th>
                  <th className="font-bold text-slate-400 text-center w-28">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={currentUser.role === 'super_admin' ? 7 : 6} className="px-6 py-12 text-center text-slate-400 font-semibold">
                      No support tickets found.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="font-bold text-slate-500 text-xs">
                        #{ticket.id.toUpperCase()}
                      </td>
                      <td className="text-slate-800 text-xs font-semibold leading-relaxed">
                        {ticket.subject}
                      </td>
                      <td className="text-slate-600 text-xs font-semibold">
                        {ticket.category}
                      </td>
                      {currentUser.role === 'super_admin' && (
                        <td className="text-slate-700 text-xs font-semibold">
                          {ticket.companyName}
                        </td>
                      )}
                      <td className="text-slate-500 text-xs">
                        {formatDate(ticket.createdAt)}
                      </td>
                      <td className="text-center">
                        <span className={`inline-flex rounded px-2.5 py-0.5 text-[9px] font-bold uppercase ${getStatusBadgeClass(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="text-center">
                        <button
                          onClick={() => {
                            setSelectedTicketId(ticket.id);
                            setViewMode('chat');
                          }}
                          className="flex items-center gap-1.5 mx-auto px-3 py-1 bg-[#002E5B] text-[#00D6CC] border border-[#00D6CC]/20 rounded-lg text-xs font-bold transition hover:opacity-90 active:scale-95"
                        >
                          <MessageSquare size={12} /> Discussion
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── View 2: Create Support Ticket (Company View Only) ─────────── */}
      {viewMode === 'create' && currentUser.role === 'admin' && (
        <div className="space-y-6">
          <button
            onClick={() => setViewMode('list')}
            className="flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:opacity-90 border-0"
            style={{ backgroundColor: '#00D6CC' }}
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-[#002E5B]">
              <h3 className="text-base font-bold text-white tracking-wide uppercase">CREATE SUPPORT TICKET</h3>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-6">
              {createError && (
                <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold">
                  {createError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Subject */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wider block">
                    Ticket Subject <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter short description of query..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:border-[#00D6CC] focus:bg-white"
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wider block">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:border-[#00D6CC] focus:bg-white appearance-none"
                  >
                    <option value="Car Verification">Car Verification</option>
                    <option value="Billing">Billing / Invoices</option>
                    <option value="Account Settings">Account Settings</option>
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider block">
                  Detailed Query Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={5}
                  placeholder="Provide all relevant details to help administrators resolve your ticket..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:border-[#00D6CC] focus:bg-white resize-none"
                />
              </div>

              <hr className="border-slate-100" />

              {/* Action Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  className="rounded-full px-8 py-2.5 text-sm font-bold text-white shadow-lg transition hover:opacity-90 active:scale-95 uppercase tracking-wide border-0"
                  style={{ backgroundColor: '#002E5B', boxShadow: '0 4px 14px rgba(0, 46, 91, 0.2)' }}
                >
                  SUBMIT TICKET
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── View 3: Live Discussion / Chat Thread View ──────────────── */}
      {viewMode === 'chat' && activeTicket && (
        <div className="space-y-6">
          {/* Header Action Row */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setSelectedTicketId(null);
                setViewMode('list');
              }}
              className="flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:opacity-90 border-0"
              style={{ backgroundColor: '#00D6CC' }}
            >
              <ArrowLeft size={16} /> Back to List
            </button>

            {/* Super Admin Status Management Controls */}
            {currentUser.role === 'super_admin' && (
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ticket Status:</span>
                <div className="flex items-center gap-1.5 border border-slate-200 p-1 bg-white rounded-xl shadow-sm">
                  {['Open', 'In Progress', 'Resolved'].map((st) => (
                    <button
                      key={st}
                      onClick={() => updateSupportTicketStatus(activeTicket.id, st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition border-0 ${
                        activeTicket.status === st 
                          ? 'bg-[#002E5B] text-white shadow-sm'
                          : 'bg-transparent text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Ticket Context Information Bar */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Ticket Details #{activeTicket.id.toUpperCase()}
              </span>
              <span className={`inline-flex rounded-lg px-3 py-1 text-xs font-extrabold uppercase ${getStatusBadgeClass(activeTicket.status)}`}>
                {activeTicket.status}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900">{activeTicket.subject}</h3>
            
            <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500 pt-1 border-t border-slate-50">
              <span className="flex items-center gap-1"><HelpCircle size={14} /> {activeTicket.category}</span>
              <span className="flex items-center gap-1"><User size={14} /> By: {activeTicket.companyName}</span>
              <span className="flex items-center gap-1"><Clock size={14} /> Created: {formatDate(activeTicket.createdAt)}</span>
            </div>
          </div>

          {/* Chat Window Box */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col h-[480px]">
            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
              {(activeTicket.messages || []).map((msg) => {
                const isSelf = msg.sender === currentUser.role;
                return (
                  <div key={msg.id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm border ${
                      isSelf 
                        ? 'bg-[#002E5B] text-white border-[#002E5B]/20 rounded-tr-none'
                        : 'bg-white text-slate-800 border-slate-100 rounded-tl-none'
                    }`}>
                      {/* Sender details */}
                      <span className={`text-[9px] font-bold block mb-1 uppercase tracking-wider ${
                        isSelf ? 'text-[#00D6CC]' : 'text-slate-400'
                      }`}>
                        {msg.senderName}
                      </span>
                      {/* Text */}
                      <p className="text-xs leading-relaxed font-semibold">{msg.text}</p>
                      {/* Time */}
                      <span className={`text-[8px] block mt-1.5 text-right ${
                        isSelf ? 'text-white/60' : 'text-slate-400'
                      }`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Message input footer */}
            <div className="p-4 border-t border-slate-100 bg-white">
              {activeTicket.status === 'Resolved' ? (
                <div className="p-3 bg-slate-50 text-slate-500 rounded-xl text-center text-xs font-semibold border border-slate-100">
                  This support ticket is marked as Resolved. Reopen the ticket status to send new messages.
                </div>
              ) : (
                <form onSubmit={handleSendChat} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type your response here..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold outline-none transition focus:border-[#00D6CC] focus:bg-white text-slate-800"
                  />
                  <button
                    type="submit"
                    className="p-3 rounded-2xl bg-[#002E5B] hover:bg-black text-[#00D6CC] transition flex items-center justify-center shrink-0 border-0"
                  >
                    <Send size={16} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportSystem;
