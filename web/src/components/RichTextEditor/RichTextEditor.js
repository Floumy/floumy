import React, { useEffect, useImperativeHandle, useState } from 'react';
import 'quill-mention';
import 'quill-mention/dist/quill.mention.css';
import './RichTextEditor.css';
import { useParams } from 'react-router-dom';
import { getUsersByOrgId } from '../../services/users/users.service';
import {
  EditorContent,
  FloatingMenu,
  ReactRenderer,
  useEditor,
} from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { all, createLowlight } from 'lowlight';
import Mention from '@tiptap/extension-mention';
import tippy from 'tippy.js';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import { ToolbarControls } from './ToolbarControls';
import 'highlight.js/styles/github.css';

const lowlight = createLowlight(all);

export const MentionsList = React.forwardRef(function MentionsList(props, ref) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index) => {
    const item = props.items[index];
    if (item) {
      props.command({ id: item.id, label: item.name });
    }
  };

  const upHandler = () => {
    setSelectedIndex(
      (selectedIndex + props.items.length - 1) % props.items.length,
    );
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }
      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }
      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }
      return false;
    },
  }));

  return (
    <div className="suggestions">
      {props.items.length ? (
        props.items.map((item, index) => (
          <button
            className={index === selectedIndex ? 'is-selected' : ''}
            key={index}
            onClick={() => selectItem(index)}
          >
            {item.name}
          </button>
        ))
      ) : (
        <div className="item">No result</div>
      )}
    </div>
  );
});
const Tiptap = ({
  id,
  content,
  orgId,
  onChange,
  toolbar,
  enabled,
  bordered,
}) => {
  const getMentionsFromDoc = (doc) => {
    const mentions = [];
    doc.descendants((node) => {
      if (
        node.type &&
        node.type.name === 'mention' &&
        node.attrs &&
        node.attrs.id
      ) {
        mentions.push(node.attrs);
      }
    });
    // Remove duplicates by id
    return mentions.filter(
      (mention, index, self) =>
        index === self.findIndex((t) => t.id === mention.id),
    );
  };

  const extensions = [
    StarterKit.configure({
      codeBlock: false,
    }),
    Link,
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
    CodeBlockLowlight.configure({
      lowlight,
    }),
    Mention.configure({
      HTMLAttributes: {
        class: 'mention',
      },
      renderLabel({ node }) {
        return `@${node.attrs.label}`;
      },
      suggestion: {
        char: '@',
        items: async ({ query }) => {
          const users = await getUsersByOrgId(orgId);
          return users
            .filter((user) =>
              user.name.toLowerCase().includes(query.toLowerCase()),
            )
            .map((user) => ({ id: user.id, name: user.name }));
        },
        render: () => {
          let component;
          let popup;
          let ref = React.createRef();

          return {
            onStart: (props) => {
              component = new ReactRenderer(MentionsList, {
                props,
                editor: props.editor,
                ref,
              });

              if (!props.clientRect) {
                return;
              }

              popup = tippy('body', {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
              });
            },

            onUpdate(props) {
              component.updateProps(props);

              if (!props.clientRect) {
                return;
              }

              popup[0].setProps({
                getReferenceClientRect: props.clientRect,
              });
            },

            onKeyDown(props) {
              if (props.event.key === 'Escape') {
                popup[0].hide();

                return true;
              }
              return component.ref?.onKeyDown(props);
            },

            onExit() {
              popup[0].destroy();
              component.destroy();
            },
          };
        },
      },
    }),
  ];
  const editor = useEditor({
    extensions,
    content,
    autofocus: false,
    editable: enabled !== false,
    onUpdate: ({ editor }) => {
      if (onChange) {
        const html = editor.getHTML();
        const mentions = getMentionsFromDoc(editor.state.doc);
        onChange(html, mentions);
      }
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
  }, [editor, content]);

  const focusEditor = () => {
    if (editor) {
      editor.chain().focus().run();
    }
  };

  return (
    <div
      id={id}
      className={`tiptap-editor-container ${bordered ? 'tiptap-editor-container-border' : ''}`}
      onClick={focusEditor}
    >
      {toolbar && (
        <div className="tiptap-toolbar">
          <ToolbarControls editor={editor} />
        </div>
      )}
      <EditorContent editor={editor} />
      <FloatingMenu editor={editor}>Write or @mention</FloatingMenu>
    </div>
  );
};
const RichTextEditor = ({
  onChange,
  value,
  toolbar = false,
  id,
  enabled,
  bordered = true,
}) => {
  const { orgId } = useParams();
  return (
    <Tiptap
      id={id}
      content={value}
      orgId={orgId}
      onChange={onChange}
      toolbar={toolbar}
      enabled={enabled}
      bordered={bordered}
    />
  );
};

export default RichTextEditor;
