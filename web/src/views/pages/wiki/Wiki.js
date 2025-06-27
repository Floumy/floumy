/* eslint-disable no-unused-vars */
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
    id: 'page-1',
    title: 'Introduction',
    content: '<p>Welcome to the project wiki!</p>',
    children: [
      {
        id: 'page-2',
        title: 'Getting Started',
        content: '<p>How to get started...</p>',
        children: [
          {
            id: 'page-21',
            title: 'Installation',
            content: '<p>Installation steps...</p>',
            children: [],
          },
          {
            id: 'page-22',
            title: 'Configuration',
            content: '<p>Configuration guide...</p>',
            children: [],
          },
        ],
      },
      {
        id: 'page-23',
        title: 'Advanced Usage',
        content: '<p>Advanced usage tips...</p>',
        children: [
          {
            id: 'page-231',
            title: 'Performance Tuning',
            content: '<p>How to tune performance...</p>',
            children: [],
          },
        ],
      },
    ],
  },
  {
    id: 'page-3',
    title: 'FAQ',
    content: '<p>Frequently Asked Questions</p>',
    children: [
      {
        id: 'page-31',
        title: 'General Questions',
        content: '<p>General questions answered...</p>',
        children: [],
      },
      {
        id: 'page-32',
        title: 'Troubleshooting',
        content: '<p>Troubleshooting common issues...</p>',
        children: [
          {
            id: 'page-321',
            title: 'Login Issues',
            content: '<p>How to resolve login issues...</p>',
            children: [],
          },
          {
            id: 'page-322',
            title: 'Network Problems',
            content: '<p>Network troubleshooting...</p>',
            children: [],
          },
        ],
      },
    ],
  },
  {
    id: 'page-4',
    title: 'Changelog',
    content: '<p>Changelog content</p>',
    children: [
      {
        id: 'page-41',
        title: 'v1.0.0',
        content: '<p>Initial release notes...</p>',
        children: [],
      },
      {
        id: 'page-42',
        title: 'v1.1.0',
        content: '<p>New features in v1.1.0...</p>',
        children: [],
      },
      {
        id: 'page-43',
        title: 'v2.0.0',
        content: '<p>Major update in v2.0.0...</p>',
        children: [],
      },
    ],
  },
  {
    id: 'page-5',
    title: 'User Guide',
    content: '<p>User guide content...</p>',
    children: [
      {
        id: 'page-51',
        title: 'Account Management',
        content: '<p>Managing your account...</p>',
        children: [],
      },
      {
        id: 'page-52',
        title: 'Security',
        content: '<p>Security best practices...</p>',
        children: [],
      },
      {
        id: 'page-53',
        title: 'Integrations',
        content: '<p>Integration options...</p>',
        children: [
          {
            id: 'page-531',
            title: 'Slack',
            content: '<p>Slack integration guide...</p>',
            children: [],
          },
          {
            id: 'page-532',
            title: 'GitHub',
            content: '<p>GitHub integration guide...</p>',
            children: [],
          },
        ],
      },
    ],
  },
  {
    id: 'page-6',
    title: 'API Reference',
    content: '<p>API reference documentation...</p>',
    children: [
      {
        id: 'page-61',
        title: 'Authentication API',
        content: '<p>Auth API details...</p>',
        children: [],
      },
      {
        id: 'page-62',
        title: 'Data API',
        content: '<p>Data API details...</p>',
        children: [],
      },
    ],
  },
  {
    id: 'page-7',
    title: 'Contributing',
    content: '<p>How to contribute...</p>',
    children: [
      {
        id: 'page-71',
        title: 'Code Style',
        content: '<p>Code style guide...</p>',
        children: [],
      },
      {
        id: 'page-72',
        title: 'Pull Requests',
        content: '<p>Pull request process...</p>',
        children: [],
      },
    ],
  },
  {
    id: 'page-8',
    title: 'Release Process',
    content: '<p>Release process documentation...</p>',
    children: [],
  },
  {
    id: 'page-9',
    title: 'Roadmap',
    content: '<p>Project roadmap...</p>',
    children: [],
  },
  {
    id: 'page-10',
    title: 'Contact',
    content: '<p>Contact information...</p>',
    children: [],
  },
];

function findPageById(tree, id) {
  for (const node of tree) {
    if (node.id === id) return node;
    if (node.children && node.children.length) {
      const found = findPageById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

const PageTree = ({ tree, selectedId, onSelect, onAddPage }) => {
  const [openPages, setOpenPages] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [hovered, setHovered] = useState(null);

  const togglePage = (id) => {
    setOpenPages((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleDropdown = (id) => {
    setDropdownOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOption = (action, node) => {
    // Placeholder for option actions: rename, move, delete
  };

  const renderTree = (nodes) => {
    if (!Array.isArray(nodes)) return null;
    return (
      <ListGroup flush className="wiki-list-group">
        {nodes.map((node) => {
          const isOpen = openPages[node.id] === true;
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
                onClick={() => {
                  if (node.children && node.children.length > 0) {
                    togglePage(node.id);
                  } else {
                    onSelect(node.id);
                  }
                }}
                onMouseEnter={() => setHovered(node.id)}
                onMouseLeave={() => {
                  setHovered(null);
                  setDropdownOpen({});
                }}
              >
                <i className="fa fa-file-lines mr-2 file-icon" />
                <span
                  className="node-title"
                  style={
                    isHovered
                      ? { marginRight: '90px', transition: 'margin-right 0.2s' }
                      : { transition: 'margin-right 0.2s' }
                  }
                >
                  {node.title}
                </span>
                <div
                  className="hover-controls ml-auto"
                  style={
                    isHovered
                      ? { position: 'absolute', right: 16, display: 'flex' }
                      : { display: 'none' }
                  }
                >
                  <Button
                    color="link"
                    className="wiki-control-btn focus:box-shadow-none"
                    title="Add Child Page"
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
                {isOpen && node.children && node.children.length > 0 && (
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
                        title="Add Page"
                        onClick={() => handleAddPage(null)}
                      >
                        <i className="fa fa-plus" />
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

                  <PageTree
                    tree={tree}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    onAddPage={handleAddPage}
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
                      bordered={false}
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
