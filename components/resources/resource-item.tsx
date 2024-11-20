import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Bookmark } from "lucide-react";
import ResourceItemDialog from "@/components/resources/resource-item-dialog";
import { Resource } from "@/lib/database/resources-service";

export default function ResourceItem({
  resource,
}: {
  resource: Partial<Resource>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card
        className="transform transition-transform hover:scale-105"
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
        resourceId={resource.resource_id ?? ""}
      />
    </>
  );
}
