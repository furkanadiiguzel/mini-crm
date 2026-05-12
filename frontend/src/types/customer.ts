import type { Note } from "./note";
import type { Opportunity } from "./opportunity";

export interface CustomerListItem {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Customer extends CustomerListItem {
  notes: Note[];
  opportunities: Opportunity[];
}

export interface CustomerFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
}
