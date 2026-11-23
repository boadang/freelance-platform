export type ProjectStatus = 'open' | 'in_progress' | 'completed' | 'cancelled'
export type ProposalStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn'

export interface Project {
  id: number
  client_id: number
  title: string
  description: string
  budget_min: number
  budget_max: number
  skills_required: string
  status: ProjectStatus
  created_at: string
}

export interface Proposal {
  id: number
  project_id: number
  freelancer_id: number
  proposed_amount: number
  estimated_days: number
  cover_letter: string
  status: ProposalStatus
  created_at: string
}