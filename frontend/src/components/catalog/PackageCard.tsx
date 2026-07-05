import { CatalogItem } from "@/types/catalog";
import { Layers } from "lucide-react";

interface PackageCardProps {
  item: CatalogItem;
}

export function PackageCard({ item }: PackageCardProps) {
  return (
    <div className="flex flex-col border border-border bg-accent/20 text-card-foreground rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold tracking-tight">{item.name}</h3>
          <span className="inline-block mt-2 text-xs font-medium bg-secondary text-secondary-foreground border px-2.5 py-1 rounded-full">
            Package
          </span>
        </div>
        <div className="text-lg font-bold">
          ₹ {item.price}
        </div>
      </div>
      
      {item.description && (
        <p className="text-muted-foreground text-sm mb-6 flex-grow">
          {item.description}
        </p>
      )}
      
      <div className="mt-auto flex items-center text-sm text-muted-foreground border-t pt-4">
        <Layers className="w-4 h-4 mr-2" />
        <span>{item.session_count} Sessions included</span>
      </div>
    </div>
  );
}
