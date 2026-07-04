"""Scheduling — Domain Rules"""

from enum import Enum
import datetime
from app.shared.constants import IST, CLINIC_CLOSED_WEEKDAY, SAME_DAY_BOOKING_CUTOFF_HOUR, SLOT_TIMES, PUBLIC_BOOKING_WINDOW_DAYS


class AppointmentStatus(str, Enum):
    """Status of an appointment."""
    BOOKED = "BOOKED"
    CANCELLED = "CANCELLED"
    NO_SHOW = "NO_SHOW"
    COMPLETED = "COMPLETED"


def get_available_booking_dates(
    current_time_ist: datetime.datetime,
    holidays: list[datetime.date] = None
) -> list[datetime.date]:
    """
    Return the dates available for public booking.
    Business Rules:
    - Today, Tomorrow, Day After Tomorrow (up to PUBLIC_BOOKING_WINDOW_DAYS).
    - Exclude Wednesdays (CLINIC_CLOSED_WEEKDAY).
    - Exclude configured holidays.
    - If today, include only if before 9:00 AM IST.
    """
    dates = []
    
    for i in range(PUBLIC_BOOKING_WINDOW_DAYS):
        target_date = current_time_ist.date() + datetime.timedelta(days=i)
        
        # Exclude Wednesdays
        if target_date.weekday() == CLINIC_CLOSED_WEEKDAY:
            continue
            
        # Exclude Holidays
        if holidays and target_date in holidays:
            continue
            
        dates.append(target_date)
        
    return dates

def get_all_slots_for_date() -> list[tuple[datetime.time, datetime.time]]:
    """Return all configured clinic slots."""
    parsed_slots = []
    for start_str, end_str in SLOT_TIMES:
        start = datetime.time.fromisoformat(start_str)
        end = datetime.time.fromisoformat(end_str)
        parsed_slots.append((start, end))
    return parsed_slots
