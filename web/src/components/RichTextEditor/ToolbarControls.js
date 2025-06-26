import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
} from 'reactstrap';
import React from 'react';

export const ToolbarControls = ({ editor }) => (
  <>
    <UncontrolledDropdown group>
      <DropdownToggle
        caret
        className="tiptap-toolbar-btn"
        style={{
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          borderRadius: 4,
          marginRight: 0,
        }}
      >
        {editor.isActive('heading', { level: 1 })
          ? 'Heading 1'
          : editor.isActive('heading', { level: 2 })
            ? 'Heading 2'
            : editor.isActive('heading', { level: 3 })
              ? 'Heading 3'
              : 'Normal'}
      </DropdownToggle>
      <DropdownMenu>
        <DropdownItem active={editor.isActive('paragraph')}>
          <button
            type="button"
            className="dropdown-btn-item"
            style={{
              background: 'none',
              border: 'none',
              width: '100%',
              textAlign: 'left',
            }}
            onClick={() => editor.chain().focus().setParagraph().run()}
          >
            Normal
          </button>
        </DropdownItem>
        <DropdownItem active={editor.isActive('heading', { level: 1 })}>
          <button
            type="button"
            className="dropdown-btn-item"
            style={{
              background: 'none',
              border: 'none',
              width: '100%',
              textAlign: 'left',
            }}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          >
            Heading 1
          </button>
        </DropdownItem>
        <DropdownItem active={editor.isActive('heading', { level: 2 })}>
          <button
            type="button"
            className="dropdown-btn-item"
            style={{
              background: 'none',
              border: 'none',
              width: '100%',
              textAlign: 'left',
            }}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            Heading 2
          </button>
        </DropdownItem>
        <DropdownItem active={editor.isActive('heading', { level: 3 })}>
          <button
            type="button"
            className="dropdown-btn-item"
            style={{
              background: 'none',
              border: 'none',
              width: '100%',
              textAlign: 'left',
            }}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          >
            Heading 3
          </button>
        </DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>
    <button
      type="button"
      onClick={() => editor.chain().focus().toggleBold().run()}
      className={editor.isActive('bold') ? 'is-active' : ''}
    >
      <i className="fa-solid fa-bold"></i>
    </button>
    <button
      type="button"
      onClick={() => editor.chain().focus().toggleItalic().run()}
      className={editor.isActive('italic') ? 'is-active' : ''}
    >
      <i className="fa-solid fa-italic"></i>
    </button>
    <button
      type="button"
      onClick={() => editor.chain().focus().toggleStrike().run()}
      className={editor.isActive('strike') ? 'is-active' : ''}
    >
      <i className="fa-solid fa-strikethrough"></i>
    </button>
    <button
      type="button"
      onClick={() => editor.chain().focus().toggleBulletList().run()}
      className={editor.isActive('bulletList') ? 'is-active' : ''}
    >
      <i className="fa-solid fa-list-ul"></i>
    </button>
    <button
      type="button"
      onClick={() => editor.chain().focus().toggleOrderedList().run()}
      className={editor.isActive('orderedList') ? 'is-active' : ''}
    >
      <i className="fa-solid fa-list-ol"></i>
    </button>
    <button
      type="button"
      onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      className={editor.isActive('codeBlock') ? 'is-active' : ''}
    >
      <i className="fa-solid fa-code"></i>
    </button>
    <button
      type="button"
      onClick={() => {
        const url = window.prompt('Enter a URL');
        if (url) {
          editor.chain().focus().setLink({ href: url }).run();
        }
      }}
      className={editor.isActive('link') ? 'is-active' : ''}
    >
      <i className="fa-solid fa-link"></i>
    </button>
    <button
      type="button"
      onClick={() => editor.chain().focus().unsetLink().run()}
    >
      <i className="fa-solid fa-link-slash"></i>
    </button>
    <UncontrolledDropdown group>
      <DropdownToggle>
        <i className="fa-solid fa-table"></i>
      </DropdownToggle>
      <DropdownMenu>
        <DropdownItem>
          <button
            onClick={() => {
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run();
            }}
            type="button"
          >
            <i className="fa-solid fa-plus"></i> Insert Table
          </button>
        </DropdownItem>
        <DropdownItem>
          <button
            onClick={() => {
              editor.chain().focus().addColumnBefore().run();
            }}
            className="tiptap-toolbar-btn"
            type="button"
          >
            <i className="fa-solid fa-arrow-left"></i> Add Column Before
          </button>
        </DropdownItem>
        <DropdownItem>
          <button
            onClick={() => {
              editor.chain().focus().addColumnAfter().run();
            }}
            className="tiptap-toolbar-btn"
            type="button"
          >
            <i className="fa-solid fa-arrow-right"></i> Add Column After
          </button>
        </DropdownItem>
        <DropdownItem>
          <button
            onClick={() => {
              editor.chain().focus().deleteColumn().run();
            }}
            className="tiptap-toolbar-btn"
            type="button"
          >
            <i className="fa-solid fa-trash"></i> Delete Column
          </button>
        </DropdownItem>
        <DropdownItem>
          <button
            onClick={() => {
              editor.chain().focus().addRowBefore().run();
            }}
            className="tiptap-toolbar-btn"
            type="button"
          >
            <i className="fa-solid fa-arrow-up"></i> Add Row Before
          </button>
        </DropdownItem>
        <DropdownItem>
          <button
            onClick={() => {
              editor.chain().focus().addRowAfter().run();
            }}
            className="tiptap-toolbar-btn"
            type="button"
          >
            Add Row After <i className="fa-solid fa-arrow-down"></i>
          </button>
        </DropdownItem>
        <DropdownItem>
          <button
            onClick={() => {
              editor.chain().focus().deleteRow().run();
            }}
            className="tiptap-toolbar-btn"
            type="button"
          >
            <i className="fa-solid fa-trash"></i> Delete Row
          </button>
        </DropdownItem>
        <DropdownItem>
          <button
            onClick={() => {
              editor.chain().focus().deleteTable().run();
            }}
            className="tiptap-toolbar-btn"
            type="button"
          >
            <i className="fa-solid fa-trash"></i> Delete Table
          </button>
        </DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>
  </>
);
