"""Application-wide constants derived from frozen business rules."""

import zoneinfo

# ---------------------------------------------------------------------------
# Timezone
# ---------------------------------------------------------------------------

IST = zoneinfo.ZoneInfo("Asia/Kolkata")

# ---------------------------------------------------------------------------
# Clinic Schedule
# ---------------------------------------------------------------------------

CLINIC_CLOSED_WEEKDAY = 2  # Wednesday (Monday=0, Sunday=6)

SLOT_TIMES: list[tuple[str, str]] = [
    ("11:00", "12:00"),
    ("12:00", "13:00"),
    ("13:00", "14:00"),
    # 14:00 to 15:00 is clinic break
    ("15:00", "16:00"),
    ("16:00", "17:00"),
]

MAX_APPOINTMENTS_PER_DAY = 30

# ---------------------------------------------------------------------------
# Public Booking
# ---------------------------------------------------------------------------

PUBLIC_BOOKING_WINDOW_DAYS = 3  # today, tomorrow, day after tomorrow
SAME_DAY_BOOKING_CUTOFF_HOUR = 9  # 9:00 AM IST
