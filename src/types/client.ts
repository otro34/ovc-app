export interface IClient {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IClientFormData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface IClientFilters {
  search?: string;
  sortBy?: 'name' | 'email' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface IClientListProps {
  clients: IClient[];
  loading: boolean;
  onEdit: (client: IClient) => void;
  onDelete: (clientId: number) => void;
  onView: (client: IClient) => void;
}

export interface IClientFormProps {
  client?: IClient;
  onSubmit: (clientData: IClientFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}