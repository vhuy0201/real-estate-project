export type Contract = {
    _id: string;
    deal_id: {
    _id: string;
    status: string;
  };
    file_url: string;
    version: number;
    notes: string;
    role_of_uploader: string;
    original_filename: string;
    replaced_at: Date;
    mime_type: string;
    file_size: number;
    contract_type: string;
    status: string;
    deleted: boolean;
    createdAt: string;
    updatedAt: string;
    approved_at?: string;
    approved_by?: string;
    uploaded_by: {
    email: string;
    fullName: string;
    role: string;
    _id: string;
  };
};

export type pagination = {
  limit: number;
  page: number;
  totalDocs: number;
  totalPages: number;
};
