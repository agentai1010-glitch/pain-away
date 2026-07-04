import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePatientLookup, useRegisterPatient } from "@/services/patient";
import { Loader2, UserCheck, AlertCircle } from "lucide-react";

// Form Validation Schema
const searchSchema = z.object({
  mobile_number: z.string().regex(/^\+?[1-9]\d{9,14}$/, "Enter a valid 10-15 digit mobile number"),
});

const registrationSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(100),
  last_name: z.string().min(1, "Last name is required").max(100),
  mobile_number: z.string().regex(/^\+?[1-9]\d{9,14}$/, "Enter a valid mobile number"),
  basic_address: z.string().min(1, "Address is required").max(255),
});

type SearchForm = z.infer<typeof searchSchema>;
type RegistrationForm = z.infer<typeof registrationSchema>;

export function PatientRegistrationPage() {
  const [mobileToSearch, setMobileToSearch] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);

  // Search hook
  const { data: existingPatient, isLoading: isLookupLoading, isError: isLookupError } = usePatientLookup(mobileToSearch, isSearching);
  
  // Registration hook
  const { mutate: registerPatient, isPending: isRegistering, isSuccess: isRegistered, data: newPatient, error: registerError } = useRegisterPatient();

  const searchForm = useForm<SearchForm>({
    resolver: zodResolver(searchSchema),
    defaultValues: { mobile_number: "" }
  });

  const regForm = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      mobile_number: "",
      basic_address: "",
    }
  });

  const onSearchSubmit = (data: SearchForm) => {
    setMobileToSearch(data.mobile_number);
    setIsSearching(true);
    // Auto-fill mobile number for registration form in case they are a new patient
    regForm.setValue("mobile_number", data.mobile_number);
  };

  const onRegisterSubmit = (data: RegistrationForm) => {
    registerPatient(data);
  };

  const showRegistrationForm = isSearching && isLookupError && !existingPatient;
  const isExistingFound = existingPatient !== undefined;
  const patientData = existingPatient || newPatient;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Patient Details</h1>
        <p className="text-muted-foreground">Enter your mobile number to continue</p>
      </div>

      {/* Step 1: Mobile Number Search */}
      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <form onSubmit={searchForm.handleSubmit(onSearchSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Mobile Number</label>
            <div className="flex gap-4">
              <input 
                {...searchForm.register("mobile_number")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="e.g. 9876543210"
                disabled={isSearching && !isLookupError}
              />
              <button 
                type="submit" 
                disabled={isLookupLoading}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                {isLookupLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue"}
              </button>
            </div>
            {searchForm.formState.errors.mobile_number && (
              <p className="text-sm text-destructive mt-1">{searchForm.formState.errors.mobile_number.message}</p>
            )}
          </div>
        </form>
      </div>

      {/* Step 2: Patient Found (Returning Patient) */}
      {(isExistingFound || isRegistered) && patientData && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 flex items-start gap-4 animate-slide-up">
          <div className="bg-primary/20 p-3 rounded-full text-primary mt-1">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-primary flex items-center gap-2">
              {isExistingFound ? "Welcome Back!" : "Registration Successful!"}
            </h3>
            <div className="mt-2 text-sm space-y-1">
              <p><span className="font-medium">Name:</span> {patientData.first_name} {patientData.last_name}</p>
              <p><span className="font-medium">Mobile:</span> {patientData.mobile_number}</p>
              <p><span className="font-medium">Address:</span> {patientData.basic_address}</p>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Registration Form (New Patient) */}
      {showRegistrationForm && !isRegistered && (
        <div className="bg-card border rounded-xl p-6 shadow-sm animate-slide-up">
          <div className="mb-6 pb-4 border-b">
            <h3 className="font-semibold text-lg">New Patient Registration</h3>
            <p className="text-sm text-muted-foreground">It looks like you're new here. Please fill in your details.</p>
          </div>
          
          <form onSubmit={regForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <input 
                  {...regForm.register("first_name")} 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
                />
                {regForm.formState.errors.first_name && <p className="text-xs text-destructive">{regForm.formState.errors.first_name.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <input 
                  {...regForm.register("last_name")} 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
                />
                {regForm.formState.errors.last_name && <p className="text-xs text-destructive">{regForm.formState.errors.last_name.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mobile Number</label>
              <input 
                {...regForm.register("mobile_number")} 
                disabled 
                className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Basic Address</label>
              <textarea 
                {...regForm.register("basic_address")} 
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              {regForm.formState.errors.basic_address && <p className="text-xs text-destructive">{regForm.formState.errors.basic_address.message}</p>}
            </div>
            
            {registerError && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {registerError instanceof Error ? registerError.message : "Registration failed"}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isRegistering}
              className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              {isRegistering ? <Loader2 className="h-4 w-4 animate-spin" /> : "Register Patient"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default PatientRegistrationPage;
