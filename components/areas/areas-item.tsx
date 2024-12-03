import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LandPlot } from "lucide-react";
import AreasItemDialog from "./areas-item-dialog";
import { Area } from "@/lib/database/areas-service";

interface AreasItemProps {
  area: Partial<Area>;
}

export default function AreasItem({ area }: AreasItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card
        className="m-1 transform cursor-pointer bg-nested-card-background transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
        onClick={() => setOpen(true)}
      >
        <CardContent className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <span>{area.name}</span>
            <LandPlot className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
      <AreasItemDialog open={open} onOpenChange={setOpen} areaId={area.area_id} />
    </>
  );
}