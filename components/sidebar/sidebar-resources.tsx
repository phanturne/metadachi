"use client";

import { Bookmark, ChevronRight } from "lucide-react";
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
import { useGetUserResources } from "@/hooks/use-resources-service";
import { useState } from "react";
import ResourceItemDialog from "@/components/resources/resource-item-dialog";

interface ResourceItemsProps {
  userId: string;
}

const ResourceItems = ({ userId }: ResourceItemsProps) => {
  const { data: resources } = useGetUserResources(userId);
  const [openResourceDialog, setOpenResourceDialog] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(
    null,
  );

  return (
    <>
      <Collapsible asChild>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Resources">
            <a href="#">
              <Bookmark />
              <span>Resources</span>
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
              {resources?.map((resource) => (
                <SidebarMenuSubItem key={resource.resource_id}>
                  <SidebarMenuSubButton
                    asChild
                    onClick={() => {
                      setSelectedResourceId(resource.resource_id);
                      setOpenResourceDialog(true);
                    }}
                  >
                    <a href="#">
                      <span className="truncate">{resource.name}</span>
                    </a>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
      {selectedResourceId && (
        <ResourceItemDialog
          open={openResourceDialog}
          onOpenChange={setOpenResourceDialog}
          resourceId={selectedResourceId}
        />
      )}
    </>
  );
};

export default ResourceItems;
