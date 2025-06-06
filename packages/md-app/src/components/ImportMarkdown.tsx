import { Import } from "lucide-react";
import { useEditorRef } from "@udecode/plate/react";
import { useFilePicker } from 'use-file-picker';
import { ExtendedMarkdownPlugin } from "./editor/plugins/markdown/markdown-plugin";
import { ToolbarButton } from "./plate-ui/toolbar";

export const ImportMarkdown = () => {
  const editor = useEditorRef()
  const accept = ['.md'];

  const { openFilePicker } = useFilePicker({
    accept,
    multiple: false,
    onFilesSelected: async ({ plainFiles }) => {
      const text = await plainFiles[0].text();

      const nodes = editor.getApi(ExtendedMarkdownPlugin).markdown.deserialize(text);;

      editor.tf.insertNodes(nodes);
    },
  });

  return (
    <ToolbarButton
      tooltip={"Import from markdown"}
      className="hover:bg-muted hover:text-muted-foreground"
      onClick={openFilePicker}
    >
      <Import className="size-4" />
    </ToolbarButton>
  );
};
