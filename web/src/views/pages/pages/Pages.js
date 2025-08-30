/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
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
import './Pages.css';
import {
  createPage,
  deletePage,
  getPagesByParentId,
  updatePage,
} from '../../../services/pages/pages.service';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import DeleteWarning from '../components/DeleteWarning';
import MovePageModal from './MovePageModal';

function findPageById(tree, id) {
  if (!Array.isArray(tree)) return null;
  for (const node of tree) {
    if (node.id === id) return node;
    if (node.children && node.children.length) {
      const found = findPageById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

const PageTree = ({
  tree,
  selectedId,
  onSelect,
  onAddPage,
  onDeletePage,
  onMovePage,
}) => {
  const [openPages, setOpenPages] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [hovered, setHovered] = useState(null);

  const togglePage = (id) => {
    setOpenPages((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleDropdown = (id) => {
    setDropdownOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderTree = (nodes) => {
    if (!Array.isArray(nodes)) return null;
    return (
      <ListGroup flush className="pages-list-group">
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
                className={`pages-list-group-item d-flex align-items-center py-2 position-relative ${isSelected ? 'selected' : ''}`}
                style={{
                  overflow: 'visible',
                  position: 'relative',
                  zIndex: isHovered ? 2000 : 'auto',
                }}
                onClick={() => {
                  const isToggled = openPages[node.id];
                  if (isToggled) {
                    togglePage(node.id);
                  } else {
                    onSelect(node.id, togglePage);
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
                      ? {
                          marginRight: '90px',
                          transition: 'margin-right 0.2s',
                        }
                      : { transition: 'margin-right 0.2s' }
                  }
                >
                  {node.title || 'Untitled'}
                </span>
                <div
                  className="hover-controls ml-auto"
                  style={
                    isHovered
                      ? {
                          position: 'absolute',
                          right: 16,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          zIndex: 3000,
                          display: 'flex',
                          alignItems: 'center',
                        }
                      : { display: 'none' }
                  }
                >
                  <Button
                    color="link"
                    className="pages-control-btn focus:box-shadow-none"
                    title="Add Child Page"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPage(node.id, isOpen, togglePage);
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
                    direction="right"
                  >
                    <DropdownToggle
                      color="link"
                      className="pages-control-btn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <i className="fa fa-ellipsis" />
                    </DropdownToggle>
                    <DropdownMenu className="pages-dropdown-menu">
                      <DropdownItem>
                        <Button
                          className="dropdown-btn-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMovePage(node);
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
                            onDeletePage(node);
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
                    style={{
                      overflow: 'visible',
                      position: 'relative',
                      zIndex: 1,
                    }}
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

export const Pages = () => {
  const { orgId, projectId } = useParams();
  const [tree, setTree] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [title, setTitle] = useState('');
  const selectedPage = selectedId ? findPageById(tree, selectedId) : null;
  const [saveTimeout, setSaveTimeout] = useState(null);
  const [pageToDelete, setPageToDelete] = useState(null);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [pageToMove, setPageToMove] = useState(null);

  useEffect(() => {
    if (selectedPage && selectedPage.title) {
      setTitle(selectedPage.title);
    } else {
      setTitle('');
    }
    // const handleSelectPage = async (id) => {
    //   const children = await getPagesByParentId(orgId, projectId, id);
    //   if (children.length > 0) {
    //     setTree((prevTree) => {
    //       const updatedTree = [...prevTree];
    //       const parentPage = findPageById(updatedTree, id);
    //       if (parentPage) {
    //         parentPage.children = children;
    //       }
    //       return updatedTree;
    //     });
    //   }
    // }
    // if( selectedPage && selectedPage.id){
    //   handleSelectPage(selectedPage.id)
    //
    // }
  }, [selectedPage]);

  useEffect(() => {
    fetchPages(undefined);
  }, []);

  const fetchPages = async (searchTerm) => {
    const pages = await getPagesByParentId(orgId, projectId, null, searchTerm);
    setTree(pages);
    if (pages.length > 0 && !selectedId) {
      setSelectedId(pages[0].id);
    }
  };

  const handleAddPage = async (parentId, isOpened, toggle) => {
    try {
      const page = await createPage(orgId, projectId, parentId);
      const newTree = [...tree];
      if (parentId) {
        const parentPage = findPageById(newTree, parentId);
        if (parentPage) {
          if (!parentPage.children) parentPage.children = [];
          parentPage.children.push(page);
        }
      } else {
        newTree.push(page);
      }
      setTree(newTree);
      setSelectedId(page.id);
      if (parentId && toggle) {
        await fillChildren(parentId, isOpened, toggle);
      }
      toast.success('Page created successfully');
    } catch (e) {
      toast.error('Failed to create page.');
    }
  };

  // Handle title change
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    if (saveTimeout) clearTimeout(saveTimeout);
    setSaveTimeout(
      setTimeout(async () => {
        if (selectedId) {
          await updatePage(orgId, projectId, selectedId, {
            title: e.target.value,
          });
        }
      }, 1000),
    );

    // Update the selected page title immediately in the UI
    if (selectedPage) {
      selectedPage.title = e.target.value;
      setTree([...tree]); // Trigger re-render
    }
  };

  function handleContentChange(newContent) {
    if (saveTimeout) clearTimeout(saveTimeout);
    setSaveTimeout(
      setTimeout(async () => {
        await updatePage(orgId, projectId, selectedId, { content: newContent });
        selectedPage.content = newContent;
        setTree([...tree]); // Trigger re-render
      }, 1000),
    );
  }

  const handleDeletePage = async (page) => {
    try {
      await deletePage(orgId, projectId, page.id);
      // Refetch or update tree after deleting
      const pages = await getPagesByParentId(orgId, projectId, null);
      setTree(pages);
      // If deleted page was selected, clear selection or select first page
      if (selectedId === page.id) {
        setSelectedId(pages.length > 0 ? pages[0].id : null);
      }
      toast.success('Page deleted successfully');
    } catch (e) {
      console.error('Failed to delete page:', e);
      toast.error('Failed to delete page');
    } finally {
      setPageToDelete(null);
    }
  };

  const handleMovePage = (page) => {
    setPageToMove(page);
    setMoveModalOpen(true);
  };

  const handleMoveConfirm = async (newParentId) => {
    if (!pageToMove) return;
    try {
      // You may need to implement this API in your backend if not present
      await updatePage(orgId, projectId, pageToMove.id, {
        parentId: newParentId,
      });
      toast.success('Page moved successfully');
      await fetchPages(searchTerm);
      setSelectedId(pageToMove.id);
    } catch (e) {
      toast.error('Failed to move page.');
    } finally {
      setMoveModalOpen(false);
      setPageToMove(null);
    }
  };

  const handleSelectPage = async (id, toggle) => {
    setSelectedId(id);
    await fillChildren(id, false, toggle);
  };

  const fillChildren = async (parentId, isOpened, toggle) => {
    const children = await getPagesByParentId(orgId, projectId, parentId);
    if (children.length > 0) {
      setTree((prevTree) => {
        const updatedTree = [...prevTree];
        const parentPage = findPageById(updatedTree, parentId);
        if (parentPage) {
          parentPage.children = children;
        }
        return updatedTree;
      });
      if (!isOpened) {
        toggle(parentId);
      }
    }
  };

  const handleSearch = async (term) => {
    setSearchTerm(term);
    await fetchPages(term);
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
                  <div className="pages-sidebar-header">
                    <h6 className="pages-sidebar-title">Pages</h6>
                    <div className="pages-add-buttons">
                      <Button
                        color="link"
                        className="pages-add-btn"
                        title="Add Page"
                        onClick={() => handleAddPage(null)}
                      >
                        <i className="fa fa-plus" />
                      </Button>
                    </div>
                  </div>

                  <div className="pages-search">
                    <i className="fa fa-search"></i>
                    <Input
                      type="text"
                      className="focus:shadow-none"
                      placeholder="Search pages..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>

                  <PageTree
                    tree={tree}
                    selectedId={selectedId}
                    onSelect={handleSelectPage}
                    onAddPage={handleAddPage}
                    onDeletePage={setPageToDelete}
                    onMovePage={handleMovePage}
                  />
                </Col>

                <Col md="9" className="pl-md-5">
                  <motion.div
                    key={selectedId || 'empty'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="pages-editor-container"
                  >
                    {tree.length === 0 ? (
                      <div className="pages-empty-state text-center p-5">
                        <h4>No pages yet</h4>
                        <p>Create your first page to get started.</p>
                        <Button
                          color="primary"
                          onClick={() => handleAddPage(null)}
                        >
                          Add a Page
                        </Button>
                      </div>
                    ) : selectedPage ? (
                      <>
                        <Input
                          type="text"
                          className="pages-title"
                          value={title}
                          onChange={handleTitleChange}
                          placeholder="Untitled"
                        />
                        <RichTextEditor
                          value={selectedPage?.content}
                          toolbar={true}
                          bordered={false}
                          onChange={handleContentChange}
                        />
                      </>
                    ) : (
                      <div className="pages-empty-state text-center p-5">
                        <h4>Select a page</h4>
                        <p>
                          Choose a page from the sidebar to view or edit its
                          content.
                        </p>
                      </div>
                    )}
                  </motion.div>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </motion.div>
      </Container>
      <DeleteWarning
        entity={
          'page' +
          (pageToDelete && pageToDelete.title ? `: ${pageToDelete.title}` : '')
        }
        isOpen={pageToDelete !== null}
        onDelete={() => handleDeletePage(pageToDelete)}
        toggle={() => setPageToDelete(null)}
      />
      <MovePageModal
        isOpen={moveModalOpen}
        toggle={() => setMoveModalOpen(false)}
        onMove={handleMoveConfirm}
        pageTree={tree}
        currentParentId={pageToMove ? pageToMove.parentId : null}
        idToMove={pageToMove ? pageToMove.id : null}
      />
    </>
  );
};
