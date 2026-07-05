import { CatalogItem } from "@/types/catalog";
import { Clock } from "lucide-react";

interface ServiceCardProps {
  item: CatalogItem;
}

export function ServiceCard({ item }: ServiceCardProps) {
  return (
    <div className="flex flex-col border border-border bg-card text-card-foreground rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold tracking-tight">{item.name}</h3>
          <span className="inline-block mt-2 text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">
            Service
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
        <Clock className="w-4 h-4 mr-2" />
        <span>{item.duration_minutes ?? 60} mins</span>
      </div>
    </div>
  );
}
