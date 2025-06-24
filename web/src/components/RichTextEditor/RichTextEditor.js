import React, { useMemo } from 'react';
import ReactQuill from 'react-quill-new';
import 'quill-mention';
import 'quill-mention/dist/quill.mention.css';
import './RichTextEditor.css';
import { Mention, MentionBlot } from 'quill-mention';
import { useParams } from 'react-router-dom';
import { getUsersByOrgId } from '../../services/users/users.service';

const { Quill } = ReactQuill;
Quill.register('blots/mention', MentionBlot);
Quill.register('modules/mention', Mention);

const RichTextEditor = ({ onChange, value, toolbar = false, ...props }) => {
  const { orgId } = useParams();

  const modules = useMemo(
    () => ({
      toolbar: toolbar,
      mention: {
        allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
        mentionDenotationChars: ['@'],
        source: async function (searchTerm, renderList) {
          const users = await getUsersByOrgId(orgId);
          const values = users.map((user) => ({
            id: user.id,
            value: user.name,
          }));
          if (searchTerm.length === 0) {
            renderList(values, searchTerm);
          } else {
            const matches = values.filter((value) =>
              value.value.toLowerCase().includes(searchTerm.toLowerCase()),
            );
            renderList(matches, searchTerm);
          }
        },
        onSelect: function (item, insertItem) {
          insertItem(item);
        },
      },
    }),
    [orgId],
  );
  const getMentions = (editor) => {
    const quill = editor;
    const contents = quill.getContents();
    const mentions = [];
    contents.ops.forEach((op) => {
      if (op.insert && op.insert.mention) {
        mentions.push(op.insert.mention);
      }
    });
    return mentions.filter(
      (mention, index, self) =>
        index === self.findIndex((t) => t.id === mention.id),
    );
  };

  return (
    <div>
      <ReactQuill
        value={value}
        theme="snow"
        onChange={(content, delta, source, editor) => {
          onChange(content, getMentions(editor));
        }}
        modules={modules}
        {...props}
      />
    </div>
  );
};

export default RichTextEditor;
