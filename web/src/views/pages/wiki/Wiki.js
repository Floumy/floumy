import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Container,
  Row,
  Col,
  ListGroup,
  ListGroupItem,
  Button,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import RichTextEditor from 'components/RichTextEditor/RichTextEditor';
import SimpleHeader from '../../../components/Headers/SimpleHeader';
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
      <ListGroup flush>
        {nodes.map((node) => {
          const isOpen = openFolders[node.id] === true;
          const isHovered = hovered === node.id;

          return (
            <div key={node.id}>
              <ListGroupItem
                className={`d-flex align-items-center py-2`}
                style={{ cursor: 'pointer', border: 'none' }}
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
                    <i
                      className={`fa ${isOpen ? 'fa-folder-open' : 'fa-folder'} mr-2`}
                    />
                    <span>{node.title}</span>
                  </>
                ) : (
                  <>
                    <i className="fa fa-file mr-2" />
                    <span style={{ flex: 1 }}>{node.title}</span>
                  </>
                )}
                {isHovered && (
                  <>
                    <Button
                      color="link"
                      className="ml-auto p-0"
                      title="Add Page"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddPage(node.id);
                      }}
                    >
                      <i className="fa fa-file-circle-plus" />
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
                        className="pt-0 pb-0 ml-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <i className="fa fa-ellipsis-v" />
                      </DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem>
                          <Button
                            className="dropdown-btn-item"
                            style={{
                              background: 'none',
                              border: 'none',
                              width: '100%',
                              textAlign: 'left',
                            }}
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
                            style={{
                              background: 'none',
                              border: 'none',
                              width: '100%',
                              textAlign: 'left',
                            }}
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
                            style={{
                              background: 'none',
                              border: 'none',
                              width: '100%',
                              textAlign: 'left',
                            }}
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
                  </>
                )}
              </ListGroupItem>
              {node.type === 'folder' && isOpen && (
                <div style={{ marginLeft: 18 }}>
                  {renderTree(node.children)}
                </div>
              )}
            </div>
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
  const selectedPage = findPageById(tree, selectedId) || tree[0];

  // Placeholder handlers
  const handleAddFolder = () => {};
  const handleAddPage = (folderId) => {};

  return (
    <>
      <SimpleHeader />
      <Container className="mt--6 px-0" fluid>
        <Row className="justify-content-center">
          <Col>
            <Card>
              <CardHeader>
                <h3 className="mb-0">Wiki</h3>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col md="4" className="border-right">
                    <Row>
                      <Col>
                        <h4>Pages</h4>
                      </Col>
                      <Col>
                        <div className="d-flex align-items-center mb-3">
                          <Button
                            color="link"
                            size="lg"
                            className="p-0 mr-2"
                            title="Add Folder"
                            onClick={handleAddFolder}
                          >
                            <i className="fa fa-folder-plus" />
                          </Button>
                          <Button
                            color="link"
                            className="p-0"
                            title="Add Page"
                            onClick={() => handleAddPage(null)}
                          >
                            <i className="fa fa-file-circle-plus" />
                          </Button>
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <FolderTree
                          tree={tree}
                          selectedId={selectedId}
                          onSelect={setSelectedId}
                          onAddPage={handleAddPage}
                          onAddFolder={handleAddFolder}
                        />
                      </Col>
                    </Row>
                  </Col>
                  <Col md="8">
                    <h5>{selectedPage?.title}</h5>
                    <RichTextEditor
                      value={selectedPage?.content}
                      toolbar={true}
                    />
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};
