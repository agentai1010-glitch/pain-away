import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { PatientCreate, PatientResponse } from "@/types/patient";

export const patientService = {
  lookupPatient: (mobile_number: string) => {
    return apiClient.get<PatientResponse>(`/api/v1/patient/lookup/${mobile_number}`);
  },
  registerPatient: (data: PatientCreate) => {
    return apiClient.post<PatientResponse>("/api/v1/patient/register", data);
  }
};

export function usePatientLookup(mobile_number: string, enabled: boolean = false) {
  return useQuery({
    queryKey: ["patient", mobile_number],
    queryFn: () => patientService.lookupPatient(mobile_number),
    enabled: enabled && mobile_number.length >= 10,
    retry: false, // Don't retry on 404
  });
}

export function useRegisterPatient() {
  return useMutation({
    mutationFn: patientService.registerPatient,
  });
}
