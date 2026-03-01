/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
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
  getPage,
  getPagesByParentId,
  updatePage,
} from '../../../services/pages/pages.service';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import DeleteWarning from '../components/DeleteWarning';

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

function replacePageInTree(tree, page) {
  if (!Array.isArray(tree)) return [];

  return tree.map((node) => {
    if (node.id === page.id) {
      return {
        ...node,
        ...page,
        children: node.children,
      };
    }

    if (!node.children || node.children.length === 0) {
      return node;
    }

    return {
      ...node,
      children: replacePageInTree(node.children, page),
    };
  });
}

function setChildrenForPage(tree, parentId, children) {
  if (!Array.isArray(tree)) return [];

  return tree.map((node) => {
    if (node.id === parentId) {
      return {
        ...node,
        hasChildren: children.length > 0,
        children: children.length > 0 ? children : undefined,
      };
    }

    if (!node.children || node.children.length === 0) {
      return node;
    }

    return {
      ...node,
      children: setChildrenForPage(node.children, parentId, children),
    };
  });
}

function collectNodeIds(node) {
  if (!node) return [];

  return [
    node.id,
    ...(node.children || []).flatMap((child) => collectNodeIds(child)),
  ];
}

function slugifyTitle(title) {
  const slug = ((title && title.trim()) || 'untitled')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'untitled';
}

function getDisplayTitle(title) {
  return title && title.trim() ? title.trim() : 'Untitled';
}

function getPageRoute(orgId, projectId, page) {
  return `/admin/orgs/${orgId}/projects/${projectId}/pages/${page.id}/${page.slug || 'untitled'}`;
}

const PageTree = ({
  tree,
  selectedId,
  openPages,
  draggable,
  draggingId,
  dragOverId,
  isRootDropActive,
  onTogglePage,
  onSelect,
  onAddPage,
  onDeletePage,
  onDragStart,
  onDragEnd,
  onDragOverPage,
  onDragLeavePage,
  onDropOnPage,
  onDragOverRoot,
  onDragLeaveRoot,
  onDropOnRoot,
}) => {
  const [hovered, setHovered] = useState(null);

  const renderTree = (nodes) => {
    if (!Array.isArray(nodes)) return null;
    return (
      <ListGroup flush className="pages-list-group">
        {nodes.map((node) => {
          const isOpen = openPages[node.id] === true;
          const isHovered = hovered === node.id;
          const isSelected = selectedId === node.id;
          const isDragging = draggingId === node.id;
          const isDropTarget = dragOverId === node.id;
          const isExpandable =
            node.hasChildren || (node.children && node.children.length > 0);

          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <ListGroupItem
                className={`pages-list-group-item d-flex align-items-center py-2 position-relative ${isSelected ? 'selected' : ''} ${draggable ? 'is-draggable' : ''} ${isDragging ? 'is-dragging' : ''} ${isDropTarget ? 'is-drop-target' : ''}`}
                style={{
                  overflow: 'visible',
                  position: 'relative',
                  zIndex: isHovered ? 2000 : 'auto',
                }}
                draggable={draggable}
                onClick={() => onSelect(node)}
                onMouseEnter={() => setHovered(node.id)}
                onMouseLeave={() => {
                  setHovered(null);
                }}
                onDragStart={(e) => onDragStart(e, node)}
                onDragEnd={onDragEnd}
                onDragOver={(e) => onDragOverPage(e, node)}
                onDragLeave={() => onDragLeavePage(node)}
                onDrop={(e) => onDropOnPage(e, node)}
              >
                {isExpandable && (
                  <Button
                    color="link"
                    className="pages-control-btn mr-2"
                    title={isOpen ? 'Collapse' : 'Expand'}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePage(node.id);
                    }}
                  >
                    <i
                      className={`fa fa-chevron-${isOpen ? 'down' : 'right'}`}
                    />
                  </Button>
                )}
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
                  {getDisplayTitle(node.title)}
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
                      onAddPage(node.id);
                    }}
                  >
                    <i className="fa fa-plus" />
                  </Button>
                  <Button
                    color="link"
                    className="pages-control-btn focus:box-shadow-none"
                    title="Delete Page"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePage(node);
                    }}
                  >
                    <i className="fa fa-trash" />
                  </Button>
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

  return (
    <>
      {draggable && (
        <div
          className={`pages-root-drop-zone ${isRootDropActive ? 'is-active' : ''}`}
          onDragOver={onDragOverRoot}
          onDragLeave={onDragLeaveRoot}
          onDrop={onDropOnRoot}
        >
          Drop here to move page to root
        </div>
      )}
      {renderTree(tree)}
    </>
  );
};

export const Pages = () => {
  const navigate = useNavigate();
  const { orgId, projectId, pageId, slug } = useParams();
  const [tree, setTree] = useState([]);
  const [currentPage, setCurrentPage] = useState(null);
  const [openPages, setOpenPages] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [title, setTitle] = useState('');
  const [pageToDelete, setPageToDelete] = useState(null);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [isRootDropActive, setIsRootDropActive] = useState(false);
  const saveTimeoutRef = useRef(null);
  const openPagesRef = useRef({});
  const hoverExpandTimeoutRef = useRef(null);
  const basePagesRoute = `/admin/orgs/${orgId}/projects/${projectId}/pages`;
  const selectedId = currentPage?.id || pageId || null;

  useEffect(() => {
    setTitle(currentPage?.title || '');
  }, [currentPage]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (hoverExpandTimeoutRef.current) {
        clearTimeout(hoverExpandTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    openPagesRef.current = openPages;
  }, [openPages]);

  const hydrateOpenBranches = async (
    nodes,
    persistedOpenPages,
    treeState = nodes,
  ) => {
    let nextTree = treeState;

    for (const node of nodes) {
      if (!persistedOpenPages[node.id]) {
        continue;
      }

      const children = await getPagesByParentId(orgId, projectId, node.id);
      nextTree = setChildrenForPage(nextTree, node.id, children);

      if (children.length > 0) {
        nextTree = await hydrateOpenBranches(
          children,
          persistedOpenPages,
          nextTree,
        );
      }
    }

    return nextTree;
  };

  const pruneOpenPages = (idsToRemove) => {
    if (!idsToRemove.length) return;

    setOpenPages((prev) => {
      const next = { ...prev };
      idsToRemove.forEach((id) => {
        delete next[id];
      });
      openPagesRef.current = next;
      return next;
    });
  };

  const loadPageState = async (targetPageId = pageId) => {
    setIsLoadingPage(true);

    try {
      const rootPages = await getPagesByParentId(orgId, projectId, null);
      const persistedOpenPages = { ...openPagesRef.current };

      if (!targetPageId) {
        const hydratedTree = await hydrateOpenBranches(
          rootPages,
          persistedOpenPages,
        );

        setTree(hydratedTree);
        setCurrentPage(null);

        if (rootPages.length > 0) {
          navigate(getPageRoute(orgId, projectId, rootPages[0]), {
            replace: true,
          });
        }
        return;
      }

      const page = await getPage(orgId, projectId, targetPageId);
      let nextTree = await hydrateOpenBranches(rootPages, persistedOpenPages);
      nextTree = replacePageInTree(nextTree, page);
      const nextOpenPages = { ...persistedOpenPages };

      for (const ancestorId of page.ancestorIds || []) {
        const children = await getPagesByParentId(orgId, projectId, ancestorId);
        nextTree = setChildrenForPage(nextTree, ancestorId, children);
        nextOpenPages[ancestorId] = true;
      }

      setTree(replacePageInTree(nextTree, page));
      openPagesRef.current = nextOpenPages;
      setOpenPages(nextOpenPages);
      setCurrentPage(page);

      if (slug !== page.slug) {
        navigate(getPageRoute(orgId, projectId, page), { replace: true });
      }
    } catch (e) {
      const rootPages = await getPagesByParentId(orgId, projectId, null);
      const hydratedTree = await hydrateOpenBranches(
        rootPages,
        openPagesRef.current,
      );
      setTree(hydratedTree);

      if (targetPageId) {
        toast.error('Page not found.');
      }

      if (rootPages.length > 0) {
        navigate(getPageRoute(orgId, projectId, rootPages[0]), {
          replace: true,
        });
      } else {
        setCurrentPage(null);
        navigate(basePagesRoute, { replace: true });
      }
    } finally {
      setIsLoadingPage(false);
    }
  };

  useEffect(() => {
    if (!searchTerm) {
      loadPageState(pageId);
    }
  }, [orgId, projectId, pageId]);

  const fetchPages = async (term) => {
    const pages = await getPagesByParentId(orgId, projectId, null, term);
    setTree(pages);
    return pages;
  };

  const clearHoverExpandTimeout = () => {
    if (hoverExpandTimeoutRef.current) {
      clearTimeout(hoverExpandTimeoutRef.current);
      hoverExpandTimeoutRef.current = null;
    }
  };

  const resetDragState = () => {
    clearHoverExpandTimeout();
    setDraggingId(null);
    setDragOverId(null);
    setIsRootDropActive(false);
  };

  const queueSave = (callback) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(callback, 1000);
  };

  const handleAddPage = async (parentId) => {
    try {
      const page = await createPage(orgId, projectId, parentId);
      setSearchTerm('');
      navigate(getPageRoute(orgId, projectId, page));
      toast.success('Page created successfully');
    } catch (e) {
      toast.error('Failed to create page.');
    }
  };

  // Handle title change
  const handleTitleChange = (e) => {
    const nextTitle = e.target.value;
    const editingPageId = currentPage?.id;
    setTitle(nextTitle);

    if (currentPage) {
      const normalizedTitle = nextTitle.trim();
      const optimisticPage = {
        ...currentPage,
        title: normalizedTitle || null,
        slug: slugifyTitle(nextTitle),
      };
      setCurrentPage(optimisticPage);
      setTree((prevTree) => replacePageInTree(prevTree, optimisticPage));
    }

    queueSave(async () => {
      if (!editingPageId) return;

      try {
        const updatedPage = await updatePage(orgId, projectId, editingPageId, {
          title: nextTitle,
        });

        setCurrentPage((prevPage) =>
          prevPage?.id === updatedPage.id ? updatedPage : prevPage,
        );
        setTree((prevTree) => replacePageInTree(prevTree, updatedPage));
        navigate(getPageRoute(orgId, projectId, updatedPage), {
          replace: true,
        });
      } catch (e) {
        toast.error('Failed to save page title.');
      }
    });
  };

  function handleContentChange(newContent) {
    const editingPageId = currentPage?.id;

    if (currentPage) {
      const optimisticPage = {
        ...currentPage,
        content: newContent,
      };
      setCurrentPage(optimisticPage);
      setTree((prevTree) => replacePageInTree(prevTree, optimisticPage));
    }

    queueSave(async () => {
      if (!editingPageId) return;

      try {
        const updatedPage = await updatePage(orgId, projectId, editingPageId, {
          content: newContent,
        });

        setCurrentPage((prevPage) =>
          prevPage?.id === updatedPage.id ? updatedPage : prevPage,
        );
        setTree((prevTree) => replacePageInTree(prevTree, updatedPage));
      } catch (e) {
        toast.error('Failed to save page content.');
      }
    });
  }

  const handleDeletePage = async (page) => {
    try {
      const idsToRemove = collectNodeIds(page);
      await deletePage(orgId, projectId, page.id);
      setSearchTerm('');
      pruneOpenPages(idsToRemove);

      if (selectedId === page.id) {
        const pages = await getPagesByParentId(orgId, projectId, null);
        if (pages.length > 0) {
          navigate(getPageRoute(orgId, projectId, pages[0]), { replace: true });
        } else {
          setCurrentPage(null);
          navigate(basePagesRoute, { replace: true });
        }
      } else {
        await loadPageState(selectedId);
      }

      toast.success('Page deleted successfully');
    } catch (e) {
      console.error('Failed to delete page:', e);
      toast.error('Failed to delete page');
    } finally {
      setPageToDelete(null);
    }
  };

  const handleMoveByDrag = async (sourceId, newParentId) => {
    if (!sourceId) return;

    const sourcePage = findPageById(tree, sourceId);
    if (!sourcePage) return;
    if (sourcePage.parentId === newParentId) return;

    try {
      const updatedPage = await updatePage(orgId, projectId, sourceId, {
        parentId: newParentId,
      });
      setSearchTerm('');
      if (newParentId) {
        setOpenPages((prev) => ({ ...prev, [newParentId]: true }));
      }
      navigate(getPageRoute(orgId, projectId, updatedPage), { replace: true });
      await loadPageState(updatedPage.id);
      toast.success('Page moved successfully');
    } catch (e) {
      toast.error('Failed to move page.');
    } finally {
      resetDragState();
    }
  };

  const handleSelectPage = async (page) => {
    setSearchTerm('');
    navigate(getPageRoute(orgId, projectId, page));
    await fillChildren(page.id);
  };

  const handleTogglePage = async (id) => {
    if (openPages[id]) {
      setOpenPages((prev) => ({ ...prev, [id]: false }));
      return;
    }

    await fillChildren(id);
  };

  const fillChildren = async (parentId) => {
    const children = await getPagesByParentId(orgId, projectId, parentId);
    setTree((prevTree) => setChildrenForPage(prevTree, parentId, children));
    setOpenPages((prev) => {
      const next = { ...prev };
      if (children.length > 0) {
        next[parentId] = true;
      } else {
        delete next[parentId];
      }
      return next;
    });
  };

  const expandPageForDrag = async (page) => {
    if (openPagesRef.current[page.id]) {
      return;
    }

    await fillChildren(page.id);
  };

  const handleSearch = async (term) => {
    setSearchTerm(term);
    resetDragState();
    if (!term) {
      await loadPageState(pageId);
      return;
    }

    await fetchPages(term);
  };

  const handleDragStart = (e, page) => {
    if (searchTerm) return;

    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', page.id);
    setDraggingId(page.id);
    setIsRootDropActive(false);
  };

  const handleDragEnd = () => {
    resetDragState();
  };

  const handleDragOverPage = (e, page) => {
    if (!draggingId || draggingId === page.id) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsRootDropActive(false);
    setDragOverId(page.id);

    if (!openPagesRef.current[page.id]) {
      clearHoverExpandTimeout();
      hoverExpandTimeoutRef.current = setTimeout(() => {
        expandPageForDrag(page);
      }, 500);
    }
  };

  const handleDragLeavePage = (page) => {
    clearHoverExpandTimeout();
    setDragOverId((prev) => (prev === page.id ? null : prev));
  };

  const handleDropOnPage = async (e, page) => {
    if (!draggingId || draggingId === page.id) {
      resetDragState();
      return;
    }

    e.preventDefault();
    await handleMoveByDrag(draggingId, page.id);
  };

  const handleDragOverRoot = (e) => {
    if (!draggingId) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    clearHoverExpandTimeout();
    setDragOverId(null);
    setIsRootDropActive(true);
  };

  const handleDragLeaveRoot = () => {
    clearHoverExpandTimeout();
    setIsRootDropActive(false);
  };

  const handleDropOnRoot = async (e) => {
    if (!draggingId) {
      resetDragState();
      return;
    }

    e.preventDefault();
    await handleMoveByDrag(draggingId, null);
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
                    openPages={openPages}
                    draggable={!searchTerm}
                    draggingId={draggingId}
                    dragOverId={dragOverId}
                    isRootDropActive={isRootDropActive}
                    onTogglePage={handleTogglePage}
                    onSelect={handleSelectPage}
                    onAddPage={handleAddPage}
                    onDeletePage={setPageToDelete}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragOverPage={handleDragOverPage}
                    onDragLeavePage={handleDragLeavePage}
                    onDropOnPage={handleDropOnPage}
                    onDragOverRoot={handleDragOverRoot}
                    onDragLeaveRoot={handleDragLeaveRoot}
                    onDropOnRoot={handleDropOnRoot}
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
                    {tree.length === 0 && !isLoadingPage ? (
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
                    ) : isLoadingPage ? (
                      <div className="pages-empty-state text-center p-5">
                        <h4>Loading page...</h4>
                      </div>
                    ) : currentPage ? (
                      <>
                        <Input
                          type="text"
                          className="pages-title"
                          value={title}
                          onChange={handleTitleChange}
                          placeholder="Untitled"
                        />
                        <RichTextEditor
                          value={currentPage?.content}
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
    </>
  );
};
