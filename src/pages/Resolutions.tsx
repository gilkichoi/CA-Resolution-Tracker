import React, { useState } from 'react';
import { useAppContext } from '../store';
import { Link } from 'react-router';
import { Plus, Search, Filter, Calendar as CalendarIcon, Clock, ArrowRight, Download } from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import { ResolutionStatus } from '../types';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function ResolutionsList() {
  const { resolutions, currentUser, statusCategories, departments, committees } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [committeeFilter, setCommitteeFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<string>('');

  const filteredResolutions = resolutions.filter(res => {
    const matchesSearch = res.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          res.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || res.status === statusFilter;
    const matchesDepartment = departmentFilter === 'All' || res.departmentId === departmentFilter;
    const matchesCommittee = committeeFilter === 'All' || res.committeeId === committeeFilter;
    const matchesDate = !dateFilter || res.datePassed === dateFilter;

    return matchesSearch && matchesStatus && matchesDepartment && matchesCommittee && matchesDate;
  });

  const exportToExcel = () => {
    const data = filteredResolutions.map(res => ({
      'Reference Number': res.referenceNumber,
      'Title': res.title,
      'Status': res.status,
      'Date Passed': res.datePassed,
      'Target Department': departments.find(d => d.id === res.departmentId)?.name || 'N/A',
      'Oversight Committee': committees.find(c => c.id === res.committeeId)?.name || 'N/A',
      'Time Limit (Days)': res.implementationTimeDays,
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Resolutions");
    XLSX.writeFile(wb, "Resolutions_Report.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF('landscape');
    
    doc.text("Resolutions Report", 14, 15);
    
    const tableData = filteredResolutions.map(res => [
      res.referenceNumber,
      res.title,
      res.status,
      res.datePassed,
      departments.find(d => d.id === res.departmentId)?.name || 'N/A',
      committees.find(c => c.id === res.committeeId)?.name || 'N/A',
      res.implementationTimeDays.toString()
    ]);

    autoTable(doc, {
      head: [['Ref Number', 'Title', 'Status', 'Date Passed', 'Department', 'Committee', 'Time Limit']],
      body: tableData,
      startY: 20,
    });
    
    doc.save("Resolutions_Report.pdf");
  };

  const getStatusBadgeColor = (statusName: string) => {
    const custom = statusCategories?.find(s => s.name === statusName);
    if (custom && custom.badgeClass) return custom.badgeClass;

    switch (statusName) {
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Pending Approval': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'Active': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Assigned': return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'In Progress': return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'Completed': return 'bg-green-100 text-green-800 border border-green-200';
      case 'Overdue': return 'bg-red-100 text-red-800 border border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canCreate = currentUser?.role === 'Clerk Assistant';

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resolutions Archive</h1>
          <p className="mt-1 text-sm text-gray-500">
            A searchable archive of all County Assembly resolutions.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {canCreate && (
            <Link
              to="/resolutions/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Register Resolution
            </Link>
          )}
          <button
            onClick={exportToExcel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            <Download className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
            Export Excel
          </button>
          <button
            onClick={exportToPDF}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            <Download className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 shadow rounded-lg flex flex-col space-y-4 border border-gray-100">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-orange-500 focus:border-orange-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
              placeholder="Search by reference number or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="sm:w-48 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="focus:ring-orange-500 focus:border-orange-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border appearance-none bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              {statusCategories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="sm:w-64 relative">
            <select
              className="focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="All">All Departments</option>
              {departments.filter(d => d.isActive !== false).map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div className="sm:w-64 relative">
            <select
              className="focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white"
              value={committeeFilter}
              onChange={(e) => setCommitteeFilter(e.target.value)}
            >
              <option value="All">All Committees</option>
              {committees.filter(c => c.isActive !== false).map(comm => (
                <option key={comm.id} value={comm.id}>{comm.name}</option>
              ))}
            </select>
          </div>

          <div className="sm:w-48 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              className="focus:ring-orange-500 focus:border-orange-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              title="Filter by Date Passed"
            />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <th className="px-4 py-3">Ref Number</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Time Limit</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="text-xs divide-y divide-slate-50">
            {filteredResolutions.length > 0 ? (
              filteredResolutions.map((res) => (
                <tr key={res.id} className="hover:bg-orange-50/30 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-700">{res.referenceNumber}</td>
                  <td className="px-4 py-3 font-medium text-slate-600 truncate max-w-xs">{res.title}</td>
                  <td className="px-4 py-3">
                    <span className={clsx(
                      "px-2 py-1 rounded-full text-[9px] font-bold uppercase",
                      getStatusBadgeColor(res.status)
                    )}>
                      {res.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-bold italic">{res.implementationTimeDays} Days</td>
                  <td className="px-4 py-3">
                    <Link to={`/resolutions/${res.id}`} className="text-orange-500 hover:underline cursor-pointer font-medium">
                      View Log
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                  No resolutions found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
