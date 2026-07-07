import React, { useState } from 'react';
import { useAppContext } from '../store';
import { Building2, FileText, CheckCircle, Tag, Users, Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { clsx } from 'clsx';

export function SystemSettings() {
  const { 
    currentUser, 
    departments, 
    directorates, 
    committees, 
    docCategories, 
    statusCategories,
    manageSystemItem
  } = useAppContext();

  const [activeTab, setActiveTab] = useState<'departments' | 'directorates' | 'committees' | 'docCategories' | 'statusCategories'>('departments');

  // We are creating a generic inline editor for these items
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  // For new items
  const [isAdding, setIsAdding] = useState(false);
  const [newValue, setNewValue] = useState('');

  if (!currentUser || !['Clerk Assistant', 'ICT Officer', 'System Administrator'].includes(currentUser.role)) {
    return (
      <div className="p-6 text-center text-slate-500">
        You do not have permission to view this page.
      </div>
    );
  }

  const tabs = [
    { id: 'departments', name: 'Departments', icon: Building2, count: departments.filter(d => d.isActive !== false).length },
    { id: 'directorates', name: 'Directorates', icon: Building2, count: directorates.filter(d => d.isActive !== false).length },
    { id: 'committees', name: 'Committees', icon: Users, count: committees.filter(c => c.isActive !== false).length },
    { id: 'docCategories', name: 'Doc Categories', icon: FileText, count: docCategories.filter(d => d.isActive !== false).length },
    { id: 'statusCategories', name: 'Status Categories', icon: CheckCircle, count: statusCategories.filter(s => s.isActive !== false).length },
  ] as const;

  const getCurrentList = () => {
    switch (activeTab) {
      case 'departments': return departments.filter(i => i.isActive !== false);
      case 'directorates': return directorates.filter(i => i.isActive !== false);
      case 'committees': return committees.filter(i => i.isActive !== false);
      case 'docCategories': return docCategories.filter(i => i.isActive !== false);
      case 'statusCategories': return statusCategories.filter(i => i.isActive !== false);
      default: return [];
    }
  };

  const handleSaveEdit = (id: string) => {
    if (editValue.trim()) {
      manageSystemItem(activeTab, 'edit', { id, name: editValue });
    }
    setEditingId(null);
  };

  const handleSaveNew = () => {
    if (newValue.trim()) {
      const item: any = { name: newValue, isActive: true };
      if (activeTab === 'directorates' && departments.length > 0) {
        // Just assigning to the first department for simplicity, in a real app would select
        item.departmentId = departments[0].id;
      }
      if (activeTab === 'statusCategories') {
        item.badgeClass = 'bg-slate-100 text-slate-800'; // Default
      }
      manageSystemItem(activeTab, 'add', item);
    }
    setIsAdding(false);
    setNewValue('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      manageSystemItem(activeTab, 'delete', { id });
    }
  };

  const currentList = getCurrentList();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">System Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage categories, departments, and system configurations.</p>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 flex-shrink-0">
          <nav className="p-4 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setEditingId(null);
                    setIsAdding(false);
                  }}
                  className={clsx(
                    "w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-orange-100 text-orange-900"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={clsx("w-4 h-4", isActive ? "text-orange-600" : "text-slate-400")} />
                    {tab.name}
                  </div>
                  <span className={clsx(
                    "text-xs py-0.5 px-2 rounded-full",
                    isActive ? "bg-orange-200 text-orange-800" : "bg-slate-200 text-slate-600"
                  )}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 bg-white">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">
              {tabs.find(t => t.id === activeTab)?.name}
            </h2>
            <button
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <Plus className="mr-1 h-4 w-4" />
              Add New
            </button>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <ul className="divide-y divide-slate-100">
              {isAdding && (
                <li className="p-4 bg-orange-50/50 flex items-center gap-3">
                  <input
                    type="text"
                    autoFocus
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="Enter name..."
                    className="flex-1 text-sm border-slate-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveNew()}
                  />
                  <div className="flex items-center gap-2">
                    <button onClick={handleSaveNew} className="p-1.5 text-green-600 hover:bg-green-100 rounded">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setIsAdding(false); setNewValue(''); }} className="p-1.5 text-slate-400 hover:bg-slate-200 rounded">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              )}
              
              {currentList.map((item: any) => (
                <li key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                  {editingId === item.id ? (
                    <div className="flex-1 flex items-center gap-3">
                      <input
                        type="text"
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 text-sm border-slate-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(item.id)}
                      />
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleSaveEdit(item.id)} className="p-1.5 text-green-600 hover:bg-green-100 rounded">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-1.5 text-slate-400 hover:bg-slate-200 rounded">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-800">{item.name}</span>
                        {activeTab === 'statusCategories' && item.badgeClass && (
                          <span className={clsx("mt-1 text-[10px] inline-flex items-center px-2 py-0.5 rounded-full font-bold uppercase", item.badgeClass)}>
                            Preview
                          </span>
                        )}
                        {activeTab === 'directorates' && item.departmentId && (
                          <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                            Dept: {departments.find(d => d.id === item.departmentId)?.name || 'Unknown'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setEditingId(item.id);
                            setEditValue(item.name);
                          }} 
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)} 
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
              
              {currentList.length === 0 && !isAdding && (
                <li className="p-8 text-center text-slate-500 text-sm">
                  No items found in this category.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
