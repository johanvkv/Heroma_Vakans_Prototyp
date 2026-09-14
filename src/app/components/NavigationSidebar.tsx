import React, { useState, useEffect } from 'react';

export interface NavItem {
  id: string;
  text: string;
  children?: NavItem[];
}

export const DEFAULT_NAV_DATA: NavItem[] = [
  { id: '1', text: 'Dashboard' },
  {
    id: '2',
    text: 'Components',
    children: [
      { id: '2-1', text: 'Alerts' },
      { id: '2-2', text: 'Navigation' },
      { id: '2-3', text: 'Tooltips' },
    ],
  },
  { id: '3', text: 'Patterns' },
];

interface NavigationSidebarProps {
  isPreview?: boolean;
  initialNavData?: NavItem[];
  onNavDataChange?: (data: NavItem[]) => void;
  onItemSelect?: (id: string) => void;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  isPreview = false,
  initialNavData,
  onNavDataChange,
  onItemSelect
}) => {
  const [navData, setNavData] = useState<NavItem[]>(initialNavData || DEFAULT_NAV_DATA);
  const [expandedIds, setExpandedIds] = useState<string[]>(['2']);
  const [selectedId, setSelectedId] = useState<string>('2-2');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showAddMenu, setShowAddMenu] = useState<string | null>(null);

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    if (onItemSelect) {
      onItemSelect(id);
    }
  };

  const handleEdit = (id: string, currentText: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditValue(currentText);
  };

  const saveEdit = (id: string) => {
    const updateItem = (items: NavItem[]): NavItem[] => {
      return items.map(item => {
        if (item.id === id) {
          return { ...item, text: editValue };
        }
        if (item.children) {
          return { ...item, children: updateItem(item.children) };
        }
        return item;
      });
    };
    const updatedData = updateItem(navData);
    setNavData(updatedData);
    if (onNavDataChange) {
      onNavDataChange(updatedData);
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      saveEdit(id);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const addMainMenuItem = () => {
    const newId = `${Date.now()}`;
    const newItem: NavItem = {
      id: newId,
      text: 'New Item',
    };
    const updatedData = [...navData, newItem];
    setNavData(updatedData);
    if (onNavDataChange) {
      onNavDataChange(updatedData);
    }
    setEditingId(newId);
    setEditValue('New Item');
  };

  const addChildMenuItem = (parentId: string) => {
    const newChildId = `${parentId}-${Date.now()}`;
    const updateItem = (items: NavItem[]): NavItem[] => {
      return items.map(item => {
        if (item.id === parentId) {
          const children = item.children || [];
          return {
            ...item,
            children: [...children, { id: newChildId, text: 'New Child' }]
          };
        }
        return item;
      });
    };
    const updatedData = updateItem(navData);
    setNavData(updatedData);
    if (onNavDataChange) {
      onNavDataChange(updatedData);
    }
    setExpandedIds([...expandedIds, parentId]);
    setEditingId(newChildId);
    setEditValue('New Child');
    setShowAddMenu(null);
  };

  const removeMenuItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const removeFromItems = (items: NavItem[]): NavItem[] => {
      return items
        .filter(item => item.id !== id)
        .map(item => {
          if (item.children) {
            return {
              ...item,
              children: removeFromItems(item.children)
            };
          }
          return item;
        });
    };
    const updatedData = removeFromItems(navData);
    setNavData(updatedData);
    if (onNavDataChange) {
      onNavDataChange(updatedData);
    }
  };

  const renderNavItem = (item: NavItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedIds.includes(item.id);
    const isSelected = selectedId === item.id;
    const isEditing = editingId === item.id;

    return (
      <div key={item.id}>
        <div
          className={`nav-sidebar-item ${isExpanded ? 'nav-sidebar-item-expanded' : ''}`}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else {
              handleSelect(item.id);
            }
          }}
        >
          {isEditing ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => saveEdit(item.id)}
              onKeyDown={(e) => handleKeyDown(e, item.id)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
              className="nav-sidebar-edit-input"
            />
          ) : (
            <span
              className="nav-sidebar-item-text"
              onDoubleClick={(e) => !isPreview && handleEdit(item.id, item.text, e)}
            >
              {item.text}
            </span>
          )}
          <div className="nav-sidebar-item-actions">
            {hasChildren && (
              <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'} nav-sidebar-icon`}></i>
            )}
            {!isPreview && (
              <>
                <button
                  className="nav-sidebar-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAddMenu(showAddMenu === item.id ? null : item.id);
                  }}
                  title="Add child item"
                >
                  <i className="fa-solid fa-plus"></i>
                </button>
                <button
                  className="nav-sidebar-action-btn remove-btn"
                  onClick={(e) => removeMenuItem(item.id, e)}
                  title="Remove item"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </>
            )}
          </div>
        </div>
        {showAddMenu === item.id && !isPreview && (
          <div className="nav-sidebar-add-menu">
            <button onClick={() => addChildMenuItem(item.id)}>Add Child Menu Item</button>
          </div>
        )}
        {hasChildren && isExpanded && (
          <div className="nav-sidebar-children">
            {item.children!.map((child) => {
              const isChildSelected = selectedId === child.id;
              const isChildEditing = editingId === child.id;
              return (
                <div
                  key={child.id}
                  className={`nav-sidebar-child-item ${isChildSelected ? 'nav-sidebar-child-item-selected' : ''}`}
                  onClick={() => handleSelect(child.id)}
                >
                  {isChildEditing ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => saveEdit(child.id)}
                      onKeyDown={(e) => handleKeyDown(e, child.id)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                      className="nav-sidebar-edit-input"
                    />
                  ) : (
                    <span onDoubleClick={(e) => !isPreview && handleEdit(child.id, child.text, e)}>
                      {child.text}
                    </span>
                  )}
                  {!isPreview && (
                    <button
                      className="nav-sidebar-action-btn nav-sidebar-child-remove remove-btn"
                      onClick={(e) => removeMenuItem(child.id, e)}
                      title="Remove child"
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="nav-sidebar">
      {navData.map((item) => renderNavItem(item))}
      {!isPreview && (
        <div className="nav-sidebar-add-main">
          <button onClick={addMainMenuItem}>
            <i className="fa-solid fa-plus"></i> Add Main Menu Item
          </button>
        </div>
      )}
    </div>
  );
};
