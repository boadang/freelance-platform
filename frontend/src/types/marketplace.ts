export type ProjectStatus = 'open' | 'in_progress' | 'completed' | 'cancelled'
export type ProposalStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn'
export type ContractStatus = 'active' | 'completed' | 'cancelled'
export type MilestoneStatus = 'pending' | 'submitted' | 'approved'

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

export interface Milestone {
  id: number
  contract_id: number
  title: string
  description: string
  amount: number
  submission_note: string
  status: MilestoneStatus
  created_at: string
}

export interface Contract {
  id: number
  project_id: number
  proposal_id: number
  client_id: number
  freelancer_id: number
  agreed_amount: number
  status: ContractStatus
  started_at: string
  milestones: Milestone[]
}

export interface Review {
  id: number
  contract_id: number
  reviewer_id: number
  reviewee_id: number
  rating: number
  comment: string
  created_at: string
}