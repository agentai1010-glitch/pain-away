import { usePublicCatalog } from "@/services/catalog";
import { ServiceCard } from "@/components/catalog/ServiceCard";
import { PackageCard } from "@/components/catalog/PackageCard";
import { AlertCircle, Loader2, Layers } from "lucide-react";

export function CatalogPage() {
  const { data: items, isLoading, isError, error } = usePublicCatalog();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-muted-foreground animate-fade-in">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
        <p>Loading clinic catalog...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-destructive animate-fade-in">
        <AlertCircle className="h-12 w-12 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Failed to load catalog</h2>
        <p className="text-muted-foreground text-center max-w-md">
          {error instanceof Error ? error.message : "An unexpected error occurred while fetching services."}
        </p>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in">
        <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mb-6">
          <Layers className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No Services Available</h2>
        <p className="text-muted-foreground">Check back later for updated offerings.</p>
      </div>
    );
  }

  const services = items.filter((item) => item.item_type === "SERVICE");
  const packages = items.filter((item) => item.item_type === "PACKAGE");

  return (
    <div className="animate-slide-up space-y-12">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight">Our Treatments</h1>
        <p className="text-xl text-muted-foreground">
          Select a service or package below to begin booking your appointment.
        </p>
      </div>

      {services.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <span className="bg-primary/20 w-8 h-8 rounded-md flex items-center justify-center mr-3">
              <span className="w-3 h-3 rounded-full bg-primary" />
            </span>
            Single Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((item) => (
              <ServiceCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {packages.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <span className="bg-secondary w-8 h-8 rounded-md flex items-center justify-center border mr-3">
              <Layers className="w-4 h-4 text-secondary-foreground" />
            </span>
            Treatment Packages
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((item) => (
              <PackageCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default CatalogPage;
