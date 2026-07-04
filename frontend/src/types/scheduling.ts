export interface Slot {
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface DateAvailability {
  date: string;
  slots: Slot[];
}

export interface DateAvailabilityResponse {
  date: string;
  slots: SlotResponse[];
}

// --- Holidays ---

export interface Holiday {
  id: string;
  date: string;
  reason: string;
  is_active: boolean;
}

export interface HolidayCreate {
  date: string;
  reason: string;
}

export interface HolidayValidationPreview {
  is_valid: boolean;
  message: string | null;
}
