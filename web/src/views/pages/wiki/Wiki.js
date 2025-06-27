import React, { useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  ListGroup,
  ListGroupItem,
  Row,
} from 'reactstrap';
import RichTextEditor from 'components/RichTextEditor/RichTextEditor';
import SimpleHeader from '../../../components/Headers/SimpleHeader';
import { AnimatePresence, motion } from 'framer-motion';
import './Wiki.css';

const mockTree = [
  {
    id: 'folder-1',
    type: 'folder',
    title: 'General',
    children: [
      {
        id: 'page-1',
        type: 'page',
        title: 'Introduction',
        content: '<p>Welcome to the project wiki!</p>',
      },
      {
        id: 'page-2',
        type: 'page',
        title: 'Getting Started',
        content: '<p>How to get started...</p>',
      },
    ],
  },
  {
    id: 'folder-2',
    type: 'folder',
    title: 'Help',
    children: [
      {
        id: 'page-3',
        type: 'page',
        title: 'FAQ',
        content: '<p>Frequently Asked Questions</p>',
      },
    ],
  },
  {
    id: 'page-4',
    type: 'page',
    title: 'Changelog',
    content: '<p>Changelog content</p>',
  },
];

function findPageById(tree, id) {
  for (const node of tree) {
    if (node.type === 'page' && node.id === id) return node;
    if (node.type === 'folder' && node.children) {
      const found = findPageById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

const FolderTree = ({ tree, selectedId, onSelect, onAddPage, onAddFolder }) => {
  const [openFolders, setOpenFolders] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [hovered, setHovered] = useState(null);

  const toggleFolder = (id) => {
    setOpenFolders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleDropdown = (id) => {
    setDropdownOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOption = (action, node) => {
    // Placeholder for option actions: rename, move, delete
    // action: 'rename' | 'move' | 'delete'
    // node: the folder or page node
  };

  const renderTree = (nodes) => {
    if (!Array.isArray(nodes)) return null;
    return (
      <ListGroup flush className="wiki-list-group">
        {nodes.map((node) => {
          const isOpen = openFolders[node.id] === true;
          const isHovered = hovered === node.id;
          const isSelected = selectedId === node.id;

          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <ListGroupItem
                className={`wiki-list-group-item d-flex align-items-center py-2 ${isSelected ? 'selected' : ''}`}
                onClick={
                  node.type === 'folder'
                    ? () => toggleFolder(node.id)
                    : () => onSelect(node.id)
                }
                onMouseEnter={() => setHovered(node.id)}
                onMouseLeave={() => {
                  setHovered(null);
                  setDropdownOpen({});
                }}
              >
                {node.type === 'folder' ? (
                  <>
                    <motion.i
                      animate={{ rotate: isOpen ? 90 : 0 }}
                      className={`fa fa-chevron-right mr-2 folder-icon`}
                    />
                    <span className="node-title">{node.title}</span>
                  </>
                ) : (
                  <>
                    <i className="fa fa-file-lines mr-2 file-icon" />
                    <span className="node-title">{node.title}</span>
                  </>
                )}
                <div className="hover-controls ml-auto">
                  <Button
                    color="link"
                    className="wiki-control-btn focus:box-shadow-none"
                    title="Add Page"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPage(node.id);
                    }}
                  >
                    <i className="fa fa-plus" />
                  </Button>
                  <Dropdown
                    isOpen={dropdownOpen[node.id] || false}
                    toggle={(e) => {
                      e.stopPropagation();
                      toggleDropdown(node.id);
                    }}
                    direction="left"
                  >
                    <DropdownToggle
                      color="link"
                      className="wiki-control-btn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <i className="fa fa-ellipsis" />
                    </DropdownToggle>
                    <DropdownMenu className="wiki-dropdown-menu">
                      <DropdownItem>
                        <Button
                          className="dropdown-btn-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOption('rename', node);
                          }}
                        >
                          <i className="fa fa-edit mr-2" />
                          Rename
                        </Button>
                      </DropdownItem>
                      <DropdownItem>
                        <Button
                          className="dropdown-btn-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOption('move', node);
                          }}
                        >
                          <i className="fa fa-arrows-alt mr-2" />
                          Move
                        </Button>
                      </DropdownItem>
                      <DropdownItem>
                        <Button
                          className="dropdown-btn-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOption('delete', node);
                          }}
                        >
                          <i className="fa fa-trash mr-2" />
                          Delete
                        </Button>
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </ListGroupItem>
              <AnimatePresence>
                {node.type === 'folder' && isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="folder-children"
                  >
                    {renderTree(node.children)}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </ListGroup>
    );
  };

  return renderTree(tree);
};

export const Wiki = () => {
  const [tree, setTree] = useState(mockTree);
  const [selectedId, setSelectedId] = useState('page-1');
  const [searchTerm, setSearchTerm] = useState('');
  const [title, setTitle] = useState('');
  const selectedPage = findPageById(tree, selectedId) || tree[0];

  // Update title when selected page changes
  React.useEffect(() => {
    if (selectedPage) {
      setTitle(selectedPage.title);
    }
  }, [selectedPage]);

  // Placeholder handlers
  const handleAddFolder = () => {};
  const handleAddPage = (folderId) => {};

  // Handle title change
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    // In a real app, you would update the page title in the database
  };

  return (
    <>
      <SimpleHeader />
      <Container className="mt--6" fluid>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="shadow-sm border-0">
            <CardBody className="p-4">
              <Row>
                <Col md="3" className="pr-md-0">
                  <div className="wiki-sidebar-header">
                    <h6 className="wiki-sidebar-title">Pages</h6>
                    <div className="wiki-add-buttons">
                      <Button
                        color="link"
                        className="wiki-add-btn"
                        title="Add Folder"
                        onClick={handleAddFolder}
                      >
                        <i className="fa fa-folder-plus" />
                      </Button>
                    </div>
                  </div>

                  <div className="wiki-search">
                    <i className="fa fa-search"></i>
                    <Input
                      type="text"
                      class="focus:shadow-none"
                      placeholder="Search pages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <FolderTree
                    tree={tree}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    onAddPage={handleAddPage}
                    onAddFolder={handleAddFolder}
                  />
                </Col>

                <Col md="9" className="pl-md-5">
                  <motion.div
                    key={selectedId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="wiki-editor-container"
                  >
                    <Input
                      type="text"
                      className="wiki-title"
                      value={title}
                      onChange={handleTitleChange}
                      placeholder="Untitled"
                    />

                    <RichTextEditor
                      value={selectedPage?.content}
                      toolbar={true}
                    />
                  </motion.div>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </motion.div>
      </Container>
    </>
  );
};
