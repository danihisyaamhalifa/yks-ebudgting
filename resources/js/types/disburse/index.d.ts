export interface BudgetDisbursementHeader {
    id: number;
    disbursement_no?: string;
    disbursement_date: string | Date;

    budget_request_header_id: number;
    budget_request_activity_id: number;
    status: string;
    
    created_by?: number;

    notes?: string | null;
    total_amount: number;
    released_amount?: number;
    remaining_amount?:number;

    created_at?: string | Date;
    updated_at?: string | Date;

    unit?: any;

    request_header?: any;
    request_activity?: any;
    
    creator?: any;
    updater?: any;
}

export interface BudgetFundRelease {
  id: number;
  fund_release_no: string;
  fund_release_date: string;
  budget_disbursement_header_id: number;
  fund_source_id: number;
  release_method_id: number;
  total_amount: number;
  status: 'pending' | 'transferred';
  notes: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  
  // Relations
  disbursement_header?: {
    id: number;
    disbursement_no: string;
    total_amount: number;
    status?: string;
  };

  fund_source?: {
    id: number;
    name: string;
    code: string;
  };
  release_method?: {
    id: number;
    label: string;
    value: string;
  };
  creator?: {
    id: number;
    name: string;
  };
  documents?: Array<{
    id: number;
    document_name: string;
    document_path: string;
  }>;
  
  // Helpers from backend
  can_be_edited?: boolean;
}

export interface BudgetAccountability {
  id: number;
  accountability_no: string;
  accountability_date: string;
  budget_fund_release_id: number;
  budget_disbursement_header_id: number;
  total_received: number;
  total_spent: number;
  total_returned: number;
  status: 'draft' | 'submitted' | 'verified' | 'approved' | 'returned';
  notes: string | null;
  created_by: number;
  updated_by: number | null;
  created_at: string;
  updated_at: string;

  budget_fund_release?: {
    id: number;
    fund_release_no: string;
    fund_release_date: string;
    total_amount: number;
  };

  budget_disbursement_header?: {
    id: number;
    disbursement_no: string;
    disbursement_date: string;
    request_header?: {
      unit?: {
        name?: string;
        unit_name?: string;
      };
    };
  };
  created_by_user?: {
    id: number;
    name: string;
  };
  updated_by_user?: {
    id: number;
    name: string;
  };
}
