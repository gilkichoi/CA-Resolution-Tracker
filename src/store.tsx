import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  User,
  Resolution,
  Department,
  Directorate,
  Committee,
  AuditLog,
  DocumentCategory,
  ResolutionDocument,
  StatusCategory,
  Role,
} from './types';
import { format, addDays } from 'date-fns';

const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Gilbert', email: 'gilbert@taitataveta.go.ke', role: 'ICT Officer' },
  { id: 'u2', name: 'Clerk Assistant Jane', email: 'jane@taitataveta.go.ke', role: 'Clerk Assistant' },
  { id: 'u3', name: 'Rehema', email: 'rehema@taitataveta.go.ke', role: 'Clerk' },
  { id: 'u4', name: 'Chari', email: 'chari@taitataveta.go.ke', role: 'Liaison Director' },
  { id: 'u5', name: 'Director Health', email: 'health.dir@taitataveta.go.ke', role: 'Director', departmentId: 'd1', directorateId: 'dir1' },
];

const MOCK_DEPARTMENTS: Department[] = [
  { id: 'd1', name: 'Health Services' },
  { id: 'd2', name: 'Agriculture, Livestock & Fisheries' },
  { id: 'd3', name: 'Water & Environment' },
];

const MOCK_COMMITTEES: Committee[] = [
  { id: 'c1', name: 'Committee on Health' },
  { id: 'c2', name: 'Committee on Agriculture' },
  { id: 'c3', name: 'Committee on Infrastructure' },
];

const MOCK_DIRECTORATES: Directorate[] = [
  { id: 'dir1', departmentId: 'd1', name: 'Public Health' },
  { id: 'dir2', departmentId: 'd1', name: 'Medical Services' },
  { id: 'dir3', departmentId: 'd2', name: 'Agriculture' },
];

const MOCK_DOC_CATEGORIES: DocumentCategory[] = [
  { id: 'cat1', name: 'Resolution' },
  { id: 'cat2', name: 'Hansard' },
  { id: 'cat3', name: 'Report' },
  { id: 'cat4', name: 'Addendum' },
];

const MOCK_RESOLUTIONS: Resolution[] = [
  {
    id: 'r1',
    referenceNumber: 'TTCA/CS/7/VOL.8/(001)',
    title: 'Upgrading of Voi County Referral Hospital',
    description: 'A resolution to allocate funds and begin the immediate upgrade of facilities at Voi County Referral Hospital to Level 5 status.',
    status: 'In Progress',
    datePassed: '2026-06-15',
    implementationTimeDays: 90,
    dueDate: '2026-09-13',
    departmentId: 'd1',
    directorateId: 'dir2',
    createdAt: '2026-06-16T10:00:00Z',
    createdBy: 'u2',
    approvedAt: '2026-06-17T09:00:00Z',
    approvedBy: 'u3',
    assignedAt: '2026-06-18T11:00:00Z',
    assignedBy: 'u4',
    documents: [],
    comments: [],
  },
  {
    id: 'r2',
    referenceNumber: 'TTCA/CS/7/VOL.8/(002)',
    title: 'Mwatate Water Pan Desilting',
    description: 'Resolution to desilt the Mwatate water pan to improve water retention during the rainy season.',
    status: 'Pending Approval',
    datePassed: '2026-07-01',
    implementationTimeDays: 45,
    createdAt: '2026-07-02T10:00:00Z',
    createdBy: 'u2',
    documents: [],
    comments: [],
  }
];

interface AppContextType {
  currentUser: User | null;
  login: (email: string, otp: string) => Promise<boolean>;
  logout: () => void;
  users: User[];
  resolutions: Resolution[];
  departments: Department[];
  directorates: Directorate[];
  committees: Committee[];
  auditLogs: AuditLog[];
  docCategories: DocumentCategory[];
  logAudit: (action: AuditLog['action'], entityType: AuditLog['entityType'], entityId: string, details: string) => void;
  createResolution: (data: Partial<Resolution>) => void;
  updateResolutionStatus: (id: string, status: Resolution['status'], additionalData?: Partial<Resolution>) => void;
  addDocument: (resolutionId: string, doc: Partial<ResolutionDocument>) => void;
  addComment: (resolutionId: string, text: string) => void;
  addExecutiveUpdate: (resolutionId: string, data: Partial<ExecutiveUpdate>) => void;
  approveExecutiveUpdate: (resolutionId: string, updateId: string, action: 'Approve' | 'Reject') => void;
  statusCategories: StatusCategory[];
  manageSystemItem: <T extends { id: string }>(type: 'departments'|'directorates'|'committees'|'docCategories'|'statusCategories', action: 'add'|'edit'|'delete', item: Partial<T>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [resolutions, setResolutions] = useState<Resolution[]>(MOCK_RESOLUTIONS);
  
  const [departments, setDepartments] = useState<Department[]>(MOCK_DEPARTMENTS);
  const [directorates, setDirectorates] = useState<Directorate[]>(MOCK_DIRECTORATES);
  const [committees, setCommittees] = useState<Committee[]>(MOCK_COMMITTEES);
  const [docCategories, setDocCategories] = useState<DocumentCategory[]>(MOCK_DOC_CATEGORIES);
  const [statusCategories, setStatusCategories] = useState<StatusCategory[]>([
    { id: 'st1', name: 'Draft', badgeClass: 'bg-slate-100 text-slate-800' },
    { id: 'st2', name: 'Pending Approval', badgeClass: 'bg-yellow-100 text-yellow-800' },
    { id: 'st3', name: 'Active', badgeClass: 'bg-blue-100 text-blue-800' },
    { id: 'st4', name: 'Assigned', badgeClass: 'bg-purple-100 text-purple-800' },
    { id: 'st5', name: 'In Progress', badgeClass: 'bg-orange-100 text-orange-800' },
    { id: 'st6', name: 'Completed', badgeClass: 'bg-green-100 text-green-800' },
    { id: 'st7', name: 'Overdue', badgeClass: 'bg-red-100 text-red-800' },
  ]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'a1',
      userId: 'u2',
      userName: 'Clerk Assistant Jane',
      userRole: 'Clerk Assistant',
      action: 'Create',
      entityType: 'Resolution',
      entityId: 'r1',
      details: 'Created resolution TTCA/CS/7/VOL.8/(001)',
      timestamp: '2026-06-16T10:00:00Z',
    }
  ]);

  const logAudit = (action: AuditLog['action'], entityType: AuditLog['entityType'], entityId: string, details: string) => {
    if (!currentUser) return;
    const log: AuditLog = {
      id: Math.random().toString(36).substring(7),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const login = async (email: string, otp: string) => {
    // Mock OTP verification
    const user = MOCK_USERS.find(u => u.email === email);
    if (user && otp === '123456') {
      setCurrentUser(user);
      logAudit('Login', 'System', user.id, 'User logged in successfully');
      return true;
    }
    return false;
  };

  const logout = () => {
    if (currentUser) {
      logAudit('Login', 'System', currentUser.id, 'User logged out');
    }
    setCurrentUser(null);
  };

  const createResolution = (data: Partial<Resolution>) => {
    const newRes: Resolution = {
      id: Math.random().toString(36).substring(7),
      referenceNumber: data.referenceNumber || `TTCA/CS/7/VOL.8/(${String(resolutions.length + 1).padStart(3, '0')})`,
      title: data.title || '',
      description: data.description || '',
      status: 'Pending Approval',
      datePassed: data.datePassed || new Date().toISOString().split('T')[0],
      implementationTimeDays: data.implementationTimeDays || 30,
      documents: data.documents || [],
      comments: [],
      departmentId: data.departmentId,
      committeeId: data.committeeId,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.id || 'unknown',
    };
    setResolutions([newRes, ...resolutions]);
    logAudit('Create', 'Resolution', newRes.id, `Registered new resolution ${newRes.referenceNumber}`);
  };

  const addDocument = (resolutionId: string, docData: Partial<ResolutionDocument>) => {
    setResolutions(prev => prev.map(res => {
      if (res.id === resolutionId) {
        const newDoc: ResolutionDocument = {
          id: Math.random().toString(36).substring(7),
          name: docData.name || 'Document',
          url: docData.url || '#',
          categoryId: docData.categoryId || 'cat1',
          uploadedAt: new Date().toISOString(),
          uploadedBy: currentUser?.id || 'unknown',
        };
        return { ...res, documents: [...res.documents, newDoc] };
      }
      return res;
    }));
    logAudit('Edit', 'Document', resolutionId, `Added document: ${docData.name}`);
  };

  const addComment = (resolutionId: string, text: string) => {
    if (!currentUser) return;
    setResolutions(prev => prev.map(res => {
      if (res.id === resolutionId) {
        const newComment = {
          id: Math.random().toString(36).substring(7),
          text,
          authorId: currentUser.id,
          authorName: currentUser.name,
          createdAt: new Date().toISOString()
        };
        return { ...res, comments: [...res.comments, newComment] };
      }
      return res;
    }));
    logAudit('Edit', 'Resolution', resolutionId, `Added comment`);
  };

  const addExecutiveUpdate = (resolutionId: string, data: Partial<ExecutiveUpdate>) => {
    if (!currentUser) return;
    setResolutions(prev => prev.map(res => {
      if (res.id === resolutionId) {
        let approvalStatus: ExecutiveUpdate['approvalStatus'] = 'Pending CCO';
        if (currentUser.role === 'CCO') {
          approvalStatus = 'Pending Liaison';
        } else if (currentUser.role === 'Liaison Director' || currentUser.role === 'County Secretary' || currentUser.role === 'CECM') {
          approvalStatus = 'Approved';
        }

        const newUpdate: ExecutiveUpdate = {
          id: Math.random().toString(36).substring(7),
          authorId: currentUser.id,
          authorName: currentUser.name,
          authorRole: currentUser.role,
          text: data.text || '',
          documents: data.documents || [],
          proposedStatus: data.proposedStatus,
          approvalStatus,
          createdAt: new Date().toISOString()
        };
        
        const updatedRes = { ...res, executiveUpdates: [...(res.executiveUpdates || []), newUpdate] };
        
        // If immediately approved, update resolution status
        if (approvalStatus === 'Approved' && data.proposedStatus) {
          updatedRes.status = data.proposedStatus;
        }
        
        return updatedRes;
      }
      return res;
    }));
    logAudit('Edit', 'Resolution', resolutionId, `Added executive update`);
  };

  const approveExecutiveUpdate = (resolutionId: string, updateId: string, action: 'Approve' | 'Reject') => {
    if (!currentUser) return;
    setResolutions(prev => prev.map(res => {
      if (res.id === resolutionId) {
        const updates = res.executiveUpdates || [];
        const updateIndex = updates.findIndex(u => u.id === updateId);
        if (updateIndex === -1) return res;

        const update = { ...updates[updateIndex] };
        let newResStatus = res.status;

        if (action === 'Reject') {
          update.approvalStatus = 'Rejected';
        } else {
          if (update.approvalStatus === 'Pending CCO' && currentUser.role === 'CCO') {
            update.approvalStatus = 'Pending Liaison';
          } else if ((update.approvalStatus === 'Pending Liaison' || update.approvalStatus === 'Pending CCO') && (currentUser.role === 'Liaison Director' || currentUser.role === 'County Secretary' || currentUser.role === 'CECM')) {
            update.approvalStatus = 'Approved';
            update.approvedAt = new Date().toISOString();
            update.approvedBy = currentUser.id;
            
            if (update.proposedStatus) {
              newResStatus = update.proposedStatus;
            }
          }
        }

        const newUpdates = [...updates];
        newUpdates[updateIndex] = update;
        return { ...res, status: newResStatus, executiveUpdates: newUpdates };
      }
      return res;
    }));
    logAudit('Approve', 'Resolution', resolutionId, `${action}d executive update`);
  };

  const updateResolutionStatus = (id: string, status: Resolution['status'], additionalData?: Partial<Resolution>) => {
    setResolutions(prev => prev.map(res => {
      if (res.id === id) {
        return { ...res, status, ...additionalData };
      }
      return res;
    }));
    logAudit('Status_Change', 'Resolution', id, `Changed status to ${status}`);
  };

  const manageSystemItem = <T extends { id: string }>(type: 'departments'|'directorates'|'committees'|'docCategories'|'statusCategories', action: 'add'|'edit'|'delete', item: Partial<T>) => {
    const setters = {
      departments: setDepartments,
      directorates: setDirectorates,
      committees: setCommittees,
      docCategories: setDocCategories,
      statusCategories: setStatusCategories,
    };
    const setter = setters[type] as React.Dispatch<React.SetStateAction<any[]>>;

    setter(prev => {
      if (action === 'add') {
        const newItem = { ...item, id: Math.random().toString(36).substring(7) };
        return [...prev, newItem];
      }
      if (action === 'edit') {
        return prev.map(existing => existing.id === item.id ? { ...existing, ...item } : existing);
      }
      if (action === 'delete') {
        // Soft delete
        return prev.map(existing => existing.id === item.id ? { ...existing, isActive: false } : existing);
      }
      return prev;
    });

    logAudit('Edit', 'System', 'system', `${action} operation on ${type}: ${item.name || item.id}`);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        logout,
        users: MOCK_USERS,
        resolutions,
        departments,
        directorates,
        committees,
        auditLogs,
        docCategories,
        statusCategories,
        logAudit,
        createResolution,
        updateResolutionStatus,
        addDocument,
        addComment,
        addExecutiveUpdate,
        approveExecutiveUpdate,
        manageSystemItem,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
