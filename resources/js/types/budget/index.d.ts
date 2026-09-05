export interface BudgetRequestHeader {
    id: number;
    request_no?: string;
    request_date: string | Date;

    fiscal_year_id?: number;
    academic_period_id?: number;
    budget_type?: string
    unit_id?: number;
    budget_category_id?: number;
    sub_budget_category_id?: number;
    status: string;
    created_by?: number;

    notes?: string | null;
    total_amount: number; 

    created_at?: string | Date;
    updated_at?: string | Date;

    fiscal_year?: any;
    academic_period?: any; 
    unit?: any;
    budget_category?: any;
    sub_budget_category?: any;
    creator?: any;
}

export interface BudgetRequestItemMultiplier {
    id?: number;
    sequence: number;
    label: string;
    value: number;
}

export interface BudgetRequestItem {
    id: number;
    budget_request_activity_id: number;
    activity_item_id: number;
    description: string;
    unit_measure_id: number;
    volume: number;
    unit_price: number;
    total_amount: number;
    calculation_mode?: 'simple' | 'detailed';
    disbursed_amount?: number;
    remaining_amount?: number;

    multipliers?: BudgetRequestItemMultiplier[];

    activity_item: {
        item_name: string;

        trans_type_id: number;
        trans_type: {
            code: string;
            name: string;
            group_code?: string;
        };
    };

    unit_measure: {
        name: string;
    };
}