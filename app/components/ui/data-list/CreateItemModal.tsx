// Source: https://github.com/mckaywrigley/chatbot-ui/blob/main/components/sidebar/items/all/sidebar-create-item.tsx

import { MetadachiContext } from "@/app/lib/context"
import { createAssistantCollections } from "@/app/lib/db/assistant-collections"
import { createAssistantFiles } from "@/app/lib/db/assistant-files"
import { createAssistantTools } from "@/app/lib/db/assistant-tools"
import { createAssistant, updateAssistant } from "@/app/lib/db/assistants"
import { createChat } from "@/app/lib/db/chats"
import { createCollectionFiles } from "@/app/lib/db/collection-files"
import { createCollection } from "@/app/lib/db/collections"
import { createFileBasedOnExtension } from "@/app/lib/db/files"
import { createModel } from "@/app/lib/db/models"
import { createPreset } from "@/app/lib/db/presets"
import { createPrompt } from "@/app/lib/db/prompts"
import {
  getAssistantImageFromStorage,
  uploadAssistantImage
} from "@/app/lib/db/storage/assistant-images"
import { createTool } from "@/app/lib/db/tools"
import { convertBlobToBase64 } from "@/app/lib/utils/blob-to-b64"
import { Tables, TablesInsert } from "@/supabase/types"
import { ContentType } from "@/app/lib/types"
import { FC, ReactNode, useContext, useState } from "react"
import { toast } from "sonner"
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from "@nextui-org/react"
import * as React from "react"

interface CreateItemModalProps {
  isOpen: boolean
  isTyping: boolean
  onOpenChange: (isOpen: boolean) => void
  contentType: ContentType
  renderInputs: () => JSX.Element
  createState: any
  subtitle?: string
}

export const CreateItemModal: FC<CreateItemModalProps> = ({
  isOpen,
  onOpenChange,
  contentType,
  renderInputs,
  createState,
  isTyping,
  subtitle
}) => {
  const {
    selectedWorkspace,
    setChats,
    setPresets,
    setPrompts,
    setFiles,
    setCollections,
    setAssistants,
    setAssistantImages,
    setTools,
    setModels
  } = useContext(MetadachiContext)

  const [creating, setCreating] = useState(false)

  const createFunctions = {
    chats: createChat,
    presets: createPreset,
    prompts: createPrompt,
    files: async (
      createState: { file: File } & TablesInsert<"files">,
      workspaceId: string
    ) => {
      if (!selectedWorkspace) return

      const { file, ...rest } = createState

      const createdFile = await createFileBasedOnExtension(
        file,
        rest,
        workspaceId,
        selectedWorkspace.embeddings_provider as "openai" | "local"
      )

      return createdFile
    },
    collections: async (
      createState: {
        image: File
        collectionFiles: TablesInsert<"collection_files">[]
      } & Tables<"collections">,
      workspaceId: string
    ) => {
      const { collectionFiles, ...rest } = createState

      const createdCollection = await createCollection(rest, workspaceId)

      const finalCollectionFiles = collectionFiles.map(collectionFile => ({
        ...collectionFile,
        collection_id: createdCollection.id
      }))

      await createCollectionFiles(finalCollectionFiles)

      return createdCollection
    },
    assistants: async (
      createState: {
        image: File
        files: Tables<"files">[]
        collections: Tables<"collections">[]
        tools: Tables<"tools">[]
      } & Tables<"assistants">,
      workspaceId: string
    ) => {
      const { image, files, collections, tools, ...rest } = createState

      const createdAssistant = await createAssistant(rest, workspaceId)

      let updatedAssistant = createdAssistant

      if (image) {
        const filePath = await uploadAssistantImage(createdAssistant, image)

        updatedAssistant = await updateAssistant(createdAssistant.id, {
          image_path: filePath
        })

        const url = (await getAssistantImageFromStorage(filePath)) || ""

        if (url) {
          const response = await fetch(url)
          const blob = await response.blob()
          const base64 = await convertBlobToBase64(blob)

          setAssistantImages(prev => [
            ...prev,
            {
              assistantId: updatedAssistant.id,
              path: filePath,
              base64,
              url
            }
          ])
        }
      }

      const assistantFiles = files.map(file => ({
        user_id: rest.user_id,
        assistant_id: createdAssistant.id,
        file_id: file.id
      }))

      const assistantCollections = collections.map(collection => ({
        user_id: rest.user_id,
        assistant_id: createdAssistant.id,
        collection_id: collection.id
      }))

      const assistantTools = tools.map(tool => ({
        user_id: rest.user_id,
        assistant_id: createdAssistant.id,
        tool_id: tool.id
      }))

      await createAssistantFiles(assistantFiles)
      await createAssistantCollections(assistantCollections)
      await createAssistantTools(assistantTools)

      return updatedAssistant
    },
    tools: createTool,
    models: createModel
  }

  const stateUpdateFunctions = {
    chats: setChats,
    presets: setPresets,
    prompts: setPrompts,
    files: setFiles,
    collections: setCollections,
    assistants: setAssistants,
    tools: setTools,
    models: setModels
  }

  const handleCreate = async () => {
    try {
      if (!selectedWorkspace) return
      if (isTyping) return // Prevent creation while typing

      const createFunction = createFunctions[contentType]
      const setStateFunction = stateUpdateFunctions[contentType]

      if (!createFunction || !setStateFunction) return

      setCreating(true)

      const newItem = await createFunction(createState, selectedWorkspace.id)

      setStateFunction((prevItems: any) => [...prevItems, newItem])

      onOpenChange(false)
      setCreating(false)
    } catch (error) {
      toast.error(`Error creating ${contentType.slice(0, -1)}. ${error}.`)
      setCreating(false)
    }
  }

  const modalTitle = `Create ${
    contentType.charAt(0).toUpperCase() + contentType.slice(1, -1)
  }`

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <div>
            {modalTitle}{" "}
            {subtitle && <p className="mt-1 text-sm font-light">{subtitle}</p>}
          </div>
        </ModalHeader>
        <ModalBody>
          <form
            onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
              event.preventDefault()
              handleCreate()
            }}
          >
            <div className="flex flex-col gap-4">{renderInputs()}</div>
          </form>
        </ModalBody>
        <ModalFooter>
          <div className="flex gap-2">
            <Button
              isDisabled={creating}
              variant="light"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              isDisabled={creating}
              color="primary"
              onClick={handleCreate}
            >
              {creating ? "Creating..." : "Create"}
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
