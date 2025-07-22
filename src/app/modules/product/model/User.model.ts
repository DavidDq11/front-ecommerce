export interface User {
  id: number;
  name?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  address?: string;
  admin?: boolean;
}