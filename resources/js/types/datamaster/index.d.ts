export interface Coa {
    id: number;
    account_code: string;
    account_name: string;
    account_type: string;
    normal_balance: string;
    parent_id: number | null;
    is_header: boolean;
}

export interface FiscalYear {
    id: number;
    year: string;
    start_date: string;
    end_date: string;
    description: string | null;
    is_active: boolean;
}

export interface AcademicPeriod {
    id: number;
    academic_year: string;
    semester: 'ganjil' | 'genap';
    start_date: string;
    end_date: string;
    description: string | null;
    is_active: boolean;
    updated_at?: string;
}

export interface Unit {
    id: number;
    unit_code: string;
    unit_name: string;
    unit_type: string;
    bank_name?: string;
    bank_account_number?: string;
    bank_account_name?: string;
    approval_workflow_id?: number | null;
    is_active: boolean;
}

export interface Activity {
    id: number;
    activity_code: string;
    activity_name: string;
    description: string | null;
    is_active: boolean;
    unit_ids: number[] | null;
}

export interface ActivityItem {
    id: number | null;
    item_code: string;
    item_name: string;
    trans_type_id: number | null;
    unit_measure_id: number | null;
    estimation_price: number;
    trans_type?: {
        name: string;
        group_code: string;
    };
    unit_measure?: {
        name: string;
    };
}

export interface BudgetCategory {
    id?: number | null;
    parent_id: number | null;
    code: string;
    name: string;
    budget_type: string | null;
    sub_budget_type: string | null;
    is_active: boolean;
    unit_ids: number[] | null;
}

export interface Employee {
    id: number;
    nik: string;
    name: string;
    bank_name?: string;
    bank_account_number?: string;
    bank_account_name?: string;
}
