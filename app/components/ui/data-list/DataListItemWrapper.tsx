import { PresetItem } from "@/app/components/presets/PresetItem"
import { PromptItem } from "@/app/components/prompts/PromptItem"
import { FileItem } from "../../files/FileItem"
import { AssistantItem } from "@/app/components/assistants/AssistantItem"
import { ToolItem } from "@/app/components/tools/ToolItem"
import { ModelItem } from "../../models/ModelItem"
import { Tables } from "@/supabase/types"
import { ContentType, DataItemType } from "@/app/lib/types"
import { ChatItem } from "@/app/components/chat/ChatList"
import { CollectionItem } from "@/app/components/collections/CollectionItem"

export function DataListItemWrapper({
  contentType,
  item
}: {
  contentType: ContentType
  item: DataItemType
}) {
  switch (contentType) {
    case "chats":
      return <ChatItem key={item.id} chat={item as Tables<"chats">} />
    case "presets":
      return <PresetItem key={item.id} preset={item as Tables<"presets">} />
    case "prompts":
      return <PromptItem key={item.id} prompt={item as Tables<"prompts">} />
    case "files":
      return <FileItem key={item.id} file={item as Tables<"files">} />
    case "collections":
      return (
        <CollectionItem
          key={item.id}
          collection={item as Tables<"collections">}
        />
      )
    case "assistants":
      return (
        <AssistantItem key={item.id} assistant={item as Tables<"assistants">} />
      )
    case "tools":
      return <ToolItem key={item.id} tool={item as Tables<"tools">} />
    case "models":
      return <ModelItem key={item.id} model={item as Tables<"models">} />
    default:
      return null
  }
}
