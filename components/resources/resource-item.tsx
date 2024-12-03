import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Bookmark } from "lucide-react";
import ResourceItemDialog from "@/components/resources/resource-item-dialog";
import { Resource } from "@/lib/database/resources-service";

export default function ResourceItem({ resource }: { resource: Partial<Resource> }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card
        className="m-1 transform cursor-pointer bg-nested-card-background transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
        onClick={() => setOpen(true)}
      >
        <CardContent className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <span>{resource.name}</span>
            <Bookmark className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
      <ResourceItemDialog
        open={open}
        onOpenChange={setOpen}
        resourceId={resource.resource_id}
      />
    </>
  );
}
