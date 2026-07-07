import { useState } from "react";
import { useAvailableSlots } from "@/services/scheduling";
import { AlertCircle, Calendar, Loader2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function SlotDiscoveryPage() {
  const { data: availabilityData, isLoading, isError, error } = useAvailableSlots();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-muted-foreground animate-fade-in">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
        <p>Loading available slots...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-destructive animate-fade-in">
        <AlertCircle className="h-12 w-12 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Failed to load schedule</h2>
        <p className="text-muted-foreground text-center max-w-md">
          {error instanceof Error ? error.message : "An unexpected error occurred while fetching slots."}
        </p>
      </div>
    );
  }

  if (!availabilityData || availabilityData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in">
        <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mb-6">
          <Calendar className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No Booking Slots Available</h2>
        <p className="text-muted-foreground">Please check back later.</p>
      </div>
    );
  }

  const activeDateData = (selectedDate 
    ? availabilityData.find((d) => d.date === selectedDate) 
    : availabilityData[0]) || availabilityData[0];

  if (!activeDateData) return null;

  return (
    <div className="animate-slide-up space-y-10 max-w-4xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight">Select an Appointment Time</h1>
        <p className="text-xl text-muted-foreground">
          Choose an available date and time slot below.
        </p>
      </div>

      <div className="grid md:grid-cols-[300px_1fr] gap-8">
        {/* Date Selector */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-primary" />
            Available Dates
          </h3>
          <div className="flex flex-col gap-2">
            {availabilityData.map((d) => {
              const isSelected = activeDateData.date === d.date;
              const dateObj = new Date(d.date || "");
              const formattedDate = dateObj.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
              
              return (
                <button
                  key={d.date}
                  onClick={() => setSelectedDate(d.date)}
                  className={cn(
                    "text-left px-4 py-3 rounded-lg border transition-all font-medium flex items-center justify-between",
                    isSelected 
                      ? "border-primary bg-primary/10 text-primary" 
                      : "border-border bg-card hover:border-primary/50 text-card-foreground"
                  )}
                >
                  <span>{formattedDate}</span>
                  <span className="text-xs bg-background rounded-full px-2 py-0.5 border">
                    {d.slots.filter(s => s.is_available).length} slots
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Slot Grid */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Clock className="w-5 h-5 mr-2 text-primary" />
            Time Slots
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeDateData.slots.map((slot, idx) => {
              const sTime = slot.start_time.slice(0, 5);
              const hour = parseInt(sTime.split(':')[0] || "0");
              const ampm1 = hour >= 12 ? 'PM' : 'AM';
              const h1 = hour % 12 || 12;
              const h2 = (hour + 1) % 12 || 12;
              const ampm2 = (hour + 1) >= 12 ? 'PM' : 'AM';
              const hourBlock = `${h1}:00 ${ampm1} – ${h2}:00 ${ampm2}`;

              const isSelectable = slot.is_available && !slot.is_disabled && ((slot.male_capacity ?? 3) > 0 || (slot.female_capacity ?? 3) > 0);

              return (
                <div
                  key={idx}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-3",
                    isSelectable
                      ? "border-primary/30 bg-card hover:border-primary hover:shadow-sm" 
                      : "border-border bg-muted/50 text-muted-foreground opacity-75 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-base text-foreground">
                      {hourBlock}
                    </span>
                    {slot.is_disabled ? (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700">Closed</span>
                    ) : !isSelectable ? (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-200 text-slate-600">Full</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800">Available</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 w-full pt-2 border-t border-dashed border-border/60">
                    <div className={`flex items-center justify-between p-1.5 rounded-lg text-xs font-medium ${
                      ((slot.male_capacity ?? 3) > 0) ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-red-50 text-red-700 border border-red-200 opacity-60"
                    }`}>
                      <span>👨 Male</span>
                      <span className="font-bold">{slot.male_capacity ?? 3}/3</span>
                    </div>

                    <div className={`flex items-center justify-between p-1.5 rounded-lg text-xs font-medium ${
                      ((slot.female_capacity ?? 3) > 0) ? "bg-purple-50 text-purple-700 border border-purple-200" : "bg-red-50 text-red-700 border border-red-200 opacity-60"
                    }`}>
                      <span>👩 Female</span>
                      <span className="font-bold">{slot.female_capacity ?? 3}/3</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {activeDateData.slots.filter(s => s.is_available && !s.is_disabled).length === 0 && (
            <div className="text-center p-8 border rounded-lg bg-muted/50 text-muted-foreground">
              All slots are booked or closed for this date.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SlotDiscoveryPage;
