export enum ProjectStatus {
  PENDING = 'PENDING',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
  APPROVED = 'APPROVED',
}

export interface Comment {
  id: string;
  author: 'client' | 'freelancer';
  text: string;
  timestamp: number;
  x?: number; // For future pinpoint comments
  y?: number;
}

export interface Project {
  id: string;
  title: string;
  clientName: string;
  createdAt: number;
  status: ProjectStatus;
  imageUrl: string;
  comments: Comment[];
  approvalData?: {
    approvedAt: number;
    approverAgent: string;
    ipAddress: string; // Simulated
  };
}

export interface UserContextType {
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'status' | 'comments'>) => void;
  updateProjectStatus: (id: string, status: ProjectStatus, approvalData?: Project['approvalData']) => void;
  addComment: (projectId: string, comment: Omit<Comment, 'id' | 'timestamp'>) => void;
  getProject: (id: string) => Project | undefined;
}