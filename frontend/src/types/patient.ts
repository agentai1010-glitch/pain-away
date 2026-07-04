export interface PatientCreate {
  first_name: string;
  last_name: string;
  mobile_number: string;
  basic_address: string;
}

export interface PatientResponse {
  id: string;
  first_name: string;
  last_name: string;
  mobile_number: string;
  basic_address: string;
}
