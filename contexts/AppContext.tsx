import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, ProjectStatus, UserContextType, Comment } from '../types';

const AppContext = createContext<UserContextType | undefined>(undefined);

// Initial mock data
const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    title: 'Neon Brand Identity',
    clientName: 'Nexus Tech',
    createdAt: Date.now() - 10000000,
    status: ProjectStatus.CHANGES_REQUESTED,
    imageUrl: 'https://picsum.photos/800/600',
    comments: [
      { id: 'c1', author: 'client', text: 'Can we make the blue a bit more electric?', timestamp: Date.now() - 500000 },
      { id: 'c2', author: 'freelancer', text: 'Sure, I will update that in the next version.', timestamp: Date.now() - 200000 },
    ]
  },
  {
    id: 'p2',
    title: 'Q3 Marketing Video',
    clientName: 'Apex Corp',
    createdAt: Date.now() - 2000000,
    status: ProjectStatus.APPROVED,
    imageUrl: 'https://picsum.photos/800/450',
    comments: [],
    approvalData: {
      approvedAt: Date.now(),
      approverAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      ipAddress: '192.168.1.1'
    }
  }
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('approveflow_projects');
    return saved ? JSON.parse(saved) : MOCK_PROJECTS;
  });

  useEffect(() => {
    localStorage.setItem('approveflow_projects', JSON.stringify(projects));
  }, [projects]);

  const addProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'status' | 'comments'>) => {
    const newProject: Project = {
      ...projectData,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: Date.now(),
      status: ProjectStatus.PENDING,
      comments: []
    };
    setProjects(prev => [newProject, ...prev]);
  };

  const updateProjectStatus = (id: string, status: ProjectStatus, approvalData?: Project['approvalData']) => {
    setProjects(prev => prev.map(p => 
      p.id === id ? { ...p, status, approvalData: approvalData || p.approvalData } : p
    ));
  };

  const addComment = (projectId: string, commentData: Omit<Comment, 'id' | 'timestamp'>) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const newComment: Comment = {
        ...commentData,
        id: Math.random().toString(36).substring(2, 9),
        timestamp: Date.now()
      };
      return { ...p, comments: [...p.comments, newComment] };
    }));
  };

  const getProject = (id: string) => projects.find(p => p.id === id);

  return (
    <AppContext.Provider value={{ projects, addProject, updateProjectStatus, addComment, getProject }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};