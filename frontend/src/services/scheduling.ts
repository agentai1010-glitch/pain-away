import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { DateAvailability } from "@/types/scheduling";

export const schedulingService = {
  getAvailableSlots: () => {
    return apiClient.get<DateAvailability[]>("/api/v1/scheduling/slots");
  },
};

export function useAvailableSlots() {
  return useQuery({
    queryKey: ["scheduling", "slots"],
    queryFn: schedulingService.getAvailableSlots,
  });
}
