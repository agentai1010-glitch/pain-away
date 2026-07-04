import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from "@/lib/api-client";
import { Holiday, HolidayCreate, HolidayValidationPreview } from '@/types/scheduling';

export function useHolidays() {
  return useQuery({
    queryKey: ['director-holidays'],
    queryFn: async () => {
      return apiClient.get<Holiday[]>('/api/v1/scheduling/director/holidays');
    },
  });
}

export function useValidateHoliday() {
  return useMutation({
    mutationFn: async (date: string) => {
      return apiClient.post<HolidayValidationPreview>('/api/v1/scheduling/director/holidays/validate', { date });
    },
  });
}

export function useCreateHoliday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: HolidayCreate) => {
      return apiClient.post<Holiday>('/api/v1/scheduling/director/holidays', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['director-holidays'] });
      queryClient.invalidateQueries({ queryKey: ['available-slots'] });
    },
  });
}

export function useUpdateHoliday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      return apiClient.patch<Holiday>(`/api/v1/scheduling/director/holidays/${id}`, { is_active });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['director-holidays'] });
      queryClient.invalidateQueries({ queryKey: ['available-slots'] });
    },
  });
}
