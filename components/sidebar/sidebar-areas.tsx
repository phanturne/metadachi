"use client";

import { LandPlot, ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useGetUserAreas } from "@/hooks/use-areas-service";
import { useState } from "react";
import AreasItemDialog from "@/components/areas/areas-item-dialog";

interface AreaItemsProps {
  userId: string;
}

const AreaItems = ({ userId }: AreaItemsProps) => {
  const { data: areas } = useGetUserAreas(userId);
  const [openAreaDialog, setOpenAreaDialog] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  return (
    <>
      <Collapsible asChild>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Areas">
            <a href="#">
              <LandPlot />
              <span>Areas</span>
            </a>
          </SidebarMenuButton>
          <CollapsibleTrigger asChild>
            <SidebarMenuAction className="data-[state=open]:rotate-90">
              <ChevronRight />
              <span className="sr-only">Toggle</span>
            </SidebarMenuAction>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {areas?.map((area) => (
                <SidebarMenuSubItem key={area.area_id}>
                  <SidebarMenuSubButton
                    asChild
                    onClick={() => {
                      setSelectedAreaId(area.area_id);
                      setOpenAreaDialog(true);
                    }}
                  >
                    <a href="#">
                      <span className="truncate">{area.name}</span>
                    </a>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
      {selectedAreaId && (
        <AreasItemDialog
          open={openAreaDialog}
          onOpenChange={setOpenAreaDialog}
          areaId={selectedAreaId}
        />
      )}
    </>
  );
};

export default AreaItems;
