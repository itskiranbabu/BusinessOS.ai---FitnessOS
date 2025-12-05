
import React, { useState } from 'react';
import { Client, ClientStatus } from '../types';
import { emailService } from '../services/emailService';
import { Search, UserPlus, CheckCircle, AlertCircle, X, Trash2, Edit2, Save, Tag, MessageSquare, Phone, MessageCircle } from 'lucide-react';

interface CRMProps {
  clients: Client[];
  onAddClient: (client: Partial<Client>) => void;
  onUpdateClient: (id: string, updates: Partial<Client>) => void;
  onDeleteClient: (id: string) => void;
  onCheckIn?: (id: string) => void;
}

const CRM: React.FC<CRMProps> = ({ clients, onAddClient, onUpdateClient, onDeleteClient, onCheckIn }) => {
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '', // Added Phone
    status: ClientStatus.LEAD,
    program: '',
    notes: '',
    tags: '',
    progress: 0
  });

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' || client.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: ClientStatus) => {
    switch (status) {
      case ClientStatus.ACTIVE: return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800';
      case ClientStatus.LEAD: return 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 border border-primary-200 dark:border-primary-800';
      case ClientStatus.CHURNED: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleEdit = (client: Client) => {
    setEditingId(client.id);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone || '', // Load phone
      status: client.status,
      program: client.program,
      notes: client.notes || '',
      tags: client.tags ? client.tags.join(', ') : '',
      progress: client.progress || 0
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this client?")) {
      onDeleteClient(id);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      status: ClientStatus.LEAD,
      program: '',
      notes: '',
      tags: '',
      progress: 0
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const processedTags = formData.tags.split(',').map(t => t.trim()).filter(t => t);
    
    if (editingId) {
      onUpdateClient(editingId, { ...formData, tags: processedTags });
    } else {
      onAddClient({ ...formData, program: formData.program || 'General Interest', tags: processedTags });
    }
    setIsModalOpen(false);
  };

  const handleWhatsApp = (phone?: string) => {
    if(!phone) return alert("No phone number saved for this client.");
    emailService.sendWhatsApp(phone, "Hey! Checking in on your progress.");
  };

  const handleSMS = (phone?: string) => {
    if(!phone) return alert("No phone number saved for this client.");
    emailService.sendSMS(phone, "Hey! Checking in on your progress.");
  };

  return (
    <div className="space-y-6 relative animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">CRM</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your athletes, payments, and progress.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 flex items-center gap-2 shadow-lg shadow-primary-600/30 transition-all"
        >
          <UserPlus size={18} /> Add Client
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-300">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search clients..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
             <select 
               className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
               value={filter}
               onChange={(e) => setFilter(e.target.value)}
             >
               <option value="All">All Status</option>
               <option value={ClientStatus.ACTIVE}>Active</option>
               <option value={ClientStatus.LEAD}>Lead</option>
               <option value={ClientStatus.CHURNED}>Churned</option>
             </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name / Contact</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Program</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Progress</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Check-in</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-600">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{client.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{client.email}</div>
                        {client.phone && <div className="text-xs text-slate-400">{client.phone}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${getStatusColor(client.status)}`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-medium">{client.program}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${client.progress > 80 ? 'bg-green-500' : client.progress > 40 ? 'bg-primary-500' : 'bg-red-500'}`} 
                          style={{ width: `${client.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{client.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      {client.lastCheckIn.includes('ago') || client.lastCheckIn === 'Just now' ? (
                        <><CheckCircle size={16} className="text-green-500" /> {client.lastCheckIn}</>
                      ) : (
                        <><AlertCircle size={16} className="text-yellow-500" /> {client.lastCheckIn}</>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      {/* NEW: Communication Buttons */}
                      <button onClick={() => handleWhatsApp(client.phone)} className="text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 p-2 rounded-lg" title="WhatsApp">
                         <MessageCircle size={16} />
                      </button>
                      <button onClick={() => handleSMS(client.phone)} className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-lg" title="SMS">
                         <Phone size={16} />
                      </button>
                      <button onClick={() => onCheckIn && onCheckIn(client.id)} className="text-slate-400 hover:text-green-600 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-lg" title="Log Check-in">
                         <MessageSquare size={16} />
                      </button>
                      <button onClick={() => handleEdit(client)} className="text-slate-400 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-lg">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(client.id)} className="text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Includes Phone */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingId ? 'Edit Client' : 'Add New Client'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                    <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone</label>
                    <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1..." className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white" />
                  </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as ClientStatus})} className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
                    <option value={ClientStatus.LEAD}>Lead</option>
                    <option value={ClientStatus.ACTIVE}>Active</option>
                    <option value={ClientStatus.CHURNED}>Churned</option>
                  </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Program</label>
                   <input type="text" value={formData.program} onChange={e => setFormData({...formData, program: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white" />
                </div>
              </div>

              <div>
                 <div className="flex justify-between items-center mb-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Client Progress</label>
                    <span className="text-xs font-bold text-primary-600 dark:text-primary-400">{formData.progress}%</span>
                 </div>
                 <input type="range" min="0" max="100" value={formData.progress} onChange={e => setFormData({...formData, progress: parseInt(e.target.value)})} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-600" />
              </div>

              <div>
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Internal Notes</label>
                 <textarea rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white resize-none" />
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-primary-600 rounded-xl text-white font-medium hover:bg-primary-700 shadow-lg shadow-primary-600/30">{editingId ? 'Save Changes' : 'Create Client'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRM;
