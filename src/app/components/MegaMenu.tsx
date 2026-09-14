import React from 'react';
import { useNavigate } from 'react-router';
import svgPaths from '../../imports/svg-k12bftedo6';
import { getMegaMenuItems, getMegaMenuContent } from '../../data/menu';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery?: string;
  onOpenAccessibility?: () => void;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ isOpen, onClose, searchQuery = '', onOpenAccessibility }) => {
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = React.useState('personligt');
  const [selectedPill, setSelectedPill] = React.useState<string | null>(null);

  const menuItems = getMegaMenuItems();

  // Define pill categories
  const pillCategories = [
    { id: 'menu', label: 'Meny' },
    { id: 'personer', label: 'Personer' },
    { id: 'installningar', label: 'Inställningar' },
    { id: 'tillganglighet', label: 'Tillgänglighet' },
    { id: 'meddelanden', label: 'Meddelanden' },
    { id: 'notifikationer', label: 'Notifikationer' },
    { id: 'paminnelser', label: 'Påminnelser' },
    { id: 'manualer', label: 'Manualer' },
  ];

  const menuContent = getMegaMenuContent();

  // Mock data for other categories (Personer, Manualer, etc.)
  const otherCategoriesData = {
    personer: [
      { text: 'Asta Ahlin', category: 'Personer' },
      { text: 'Bo Bergström', category: 'Personer' },
    ],
    manualer: [
      { text: 'Hjälp', category: 'Manualer' },
      { text: 'Användarhandbok', category: 'Manualer' },
      { text: 'Administratörsguide', category: 'Manualer' },
    ],
    meddelanden: [
      { text: 'Systemuppdatering', category: 'Meddelanden' },
    ],
    notifikationer: [
      { text: 'Nya notiser', category: 'Notifikationer' },
    ],
    paminnelser: [
      { text: 'Månadslön', category: 'Påminnelser' },
    ],
    tillganglighet: [
      { text: 'Högkontrast', category: 'Tillgänglighet' },
      { text: 'Textstorlek', category: 'Tillgänglighet' },
      { text: 'Zooma in', category: 'Tillgänglighet' },
      { text: 'Zooma ut', category: 'Tillgänglighet' },
    ]
  };

  // Helper function to highlight matching text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);
    
    if (index === -1) return text;
    
    return (
      <>
        {text.slice(0, index)}
        <span className="search-highlight">{text.slice(index, index + query.length)}</span>
        {text.slice(index + query.length)}
      </>
    );
  };

  // Filter and search logic
  const getSearchResults = () => {
    if (!searchQuery.trim()) return null;

    const query = searchQuery.toLowerCase();
    const results: Array<{
      categoryId: string;
      categoryLabel: string;
      categoryIcon: string;
      useSVG?: boolean;
      isMenuCategory: boolean;
      sections: Array<{
        title: string;
        items: Array<{ text: string; matches: boolean }>;
      }>;
    }> = [];

    // Search through all menu categories including portals
    Object.entries(menuContent).forEach(([categoryId, content]) => {
      const category = menuItems.find(item => item.id === categoryId);
      if (!category) return;

      const matchingSections: Array<{
        title: string;
        items: Array<{ text: string; matches: boolean }>;
      }> = [];

      // Handle portal view categories (Portaler)
      if (content.isPortalView && content.portals) {
        const matchingPortals: Array<{ text: string; matches: boolean }> = [];
        
        content.portals.forEach(portal => {
          // Search in portal title and description
          if (portal.title.toLowerCase().includes(query) || portal.description.toLowerCase().includes(query)) {
            matchingPortals.push({ text: portal.title, matches: true });
          }
        });

        if (matchingPortals.length > 0) {
          matchingSections.push({
            title: 'Portaler',
            items: matchingPortals
          });
        }
      }

      // Handle regular sections (all other categories)
      content.sections?.forEach(section => {
        const matchingItems: Array<{ text: string; matches: boolean }> = [];
        
        section.items.forEach(item => {
          const text = typeof item === 'string' ? item : item.text;
          if (text.toLowerCase().includes(query)) {
            matchingItems.push({ text, matches: true });
          }
        });

        if (matchingItems.length > 0) {
          matchingSections.push({
            title: section.title,
            items: matchingItems
          });
        }
      });

      if (matchingSections.length > 0) {
        results.push({
          categoryId,
          categoryLabel: category.label,
          categoryIcon: category.icon,
          useSVG: category.useSVG,
          isMenuCategory: true,
          sections: matchingSections
        });
      }
    });

    // Search through other categories (non-menu)
    Object.entries(otherCategoriesData).forEach(([categoryId, items]) => {
      const category = pillCategories.find(item => item.id === categoryId);
      if (!category) return;

      const matchingItems: Array<{ text: string; matches: boolean }> = [];
      
      items.forEach(item => {
        if (item.text.toLowerCase().includes(query)) {
          matchingItems.push({ text: item.text, matches: true });
        }
      });

      if (matchingItems.length > 0) {
        results.push({
          categoryId,
          categoryLabel: category.label,
          categoryIcon: '',
          useSVG: false,
          isMenuCategory: false,
          sections: [
            {
              title: '',
              items: matchingItems
            }
          ]
        });
      }
    });

    return results;
  };

  const searchResults = getSearchResults();
  const isSearchMode = searchQuery.trim().length > 0;

  // Get active pills based on search results
  const getActivePills = () => {
    if (!searchResults || searchResults.length === 0) return [];
    
    const pills: Array<{ id: string; label: string; isMenu: boolean; disabled?: boolean }> = [];
    let hasMenuMatches = false;
    
    // Check if there are any menu category matches
    searchResults.forEach(result => {
      if (result.isMenuCategory) {
        hasMenuMatches = true;
      }
    });
    
    // ALWAYS add "Meny" pill first, but mark as disabled if no menu matches
    pills.push({ id: 'menu', label: 'Meny', isMenu: true, disabled: !hasMenuMatches });
    
    // Add pills for other (non-menu) categories that have matches
    searchResults.forEach(result => {
      if (!result.isMenuCategory) {
        // Find the pill category
        const pillCategory = pillCategories.find(p => p.id === result.categoryId);
        if (pillCategory && !pills.some(p => p.id === pillCategory.id)) {
          pills.push({ id: pillCategory.id, label: pillCategory.label, isMenu: false, disabled: false });
        }
      }
    });
    
    return pills;
  };

  const activePills = getActivePills();
  
  // Handle pill click - special handling for Tillgänglighet
  const handlePillClick = (pillId: string) => {
    if (pillId === 'tillganglighet') {
      // Enable zoom in accessibility
      document.documentElement.classList.add('accessibility-zoom');
      // Open accessibility panel if callback is provided
      if (onOpenAccessibility) {
        onOpenAccessibility();
        onClose(); // Close mega menu
      }
    } else {
      setSelectedPill(pillId);
    }
  };

  // Handle portal card click
  const handlePortalClick = (portalId: string) => {
    if (portalId === 'lone') {
      navigate('/loneportalen');
      onClose();
    } else if (portalId === 'chef') {
      navigate('/chefsoversikten');
      onClose();
    }
    // Add more portal handlers as needed
  };

  // Handle search result item click
  const handleSearchItemClick = (itemText: string) => {
    if (itemText === 'Zooma in') {
      // Enable zoom in accessibility
      document.documentElement.classList.add('accessibility-zoom');
      onClose(); // Close mega menu
    } else if (itemText === 'Zooma ut') {
      // Disable zoom
      document.documentElement.classList.remove('accessibility-zoom');
      onClose(); // Close mega menu
    } else if (itemText === 'Gränssnittsanpassningar') {
      // Navigate to Gränssnittsanpassningar page
      navigate('/granssnittsanpassningar');
      onClose();
    } else if (itemText === 'Dashboard lön') {
      // Navigate to Dashboard lön page
      navigate('/loneportalen');
      onClose();
    } else if (itemText === 'Dashboard chef') {
      // Navigate to Dashboard chef page
      navigate('/chefsoversikten');
      onClose();
    }
    // Add more handlers for other items as needed
  };
  
  // Auto-select first ENABLED pill when search changes
  // If "Meny" is disabled, auto-select the next enabled pill (e.g., "Manualer")
  React.useEffect(() => {
    if (isSearchMode && activePills.length > 0) {
      const firstEnabledPill = activePills.find(pill => !pill.disabled);
      if (firstEnabledPill) {
        // If no pill is selected, or if the selected pill is now disabled, select the first enabled one
        const currentPill = activePills.find(p => p.id === selectedPill);
        if (!selectedPill || (currentPill && currentPill.disabled)) {
          setSelectedPill(firstEnabledPill.id);
        }
      }
    } else if (!isSearchMode) {
      setSelectedPill(null);
    }
  }, [searchQuery, isSearchMode, JSON.stringify(activePills.map(p => ({ id: p.id, disabled: p.disabled })))]);

  // Filter search results based on selected pill
  const getFilteredSearchResults = () => {
    if (!searchResults) return null;
    if (!selectedPill) return searchResults;
    
    if (selectedPill === 'menu') {
      // Show ALL menu categories (those with isMenuCategory = true)
      return searchResults.filter(result => result.isMenuCategory);
    } else {
      // Show only the selected non-menu category
      return searchResults.filter(result => result.categoryId === selectedPill);
    }
  };

  const filteredSearchResults = getFilteredSearchResults();

  if (!isOpen) return null;

  return (
    <div className="mega-menu-overlay">
      <div className="mega-menu-container">
        {/* Left Sidebar */}
        <div className="mega-menu-sidebar">
          {isSearchMode ? (
            <div className="mega-menu-search-sidebar">
              <p className="mega-menu-search-sidebar-text">
                <span className="mega-menu-search-sidebar-query">"{searchQuery}"</span>{' '}
                <span className="mega-menu-search-sidebar-info">
                  hittades i {searchResults?.length || 0} {searchResults?.length === 1 ? 'kategori' : 'kategorier'}
                </span>
                {' '}
                <i className="fa-solid fa-arrow-right-long mega-menu-search-sidebar-arrow"></i>
              </p>
            </div>
          ) : (
            <nav className="mega-menu-sidebar-nav">
              {menuItems.map((item) => {
                if (item.isDivider) {
                  return <div key={item.id} className="mega-menu-sidebar-divider"></div>;
                }
                return (
                  <button
                    key={item.id}
                    className={`mega-menu-sidebar-item ${selectedMenu === item.id ? 'mega-menu-sidebar-item-active' : ''}`}
                    onClick={() => {
                      if (item.path) {
                        navigate(item.path);
                        onClose();
                      } else {
                        setSelectedMenu(item.id);
                      }
                    }}
                  >
                    {item.useSVG ? (
                      <svg className="mega-menu-sidebar-icon" viewBox="0 0 30 30" fill="none">
                        <path d={svgPaths.p13b13300} fill="currentColor" />
                      </svg>
                    ) : (
                      <i className={`fa-solid ${item.icon} mega-menu-sidebar-icon`}></i>
                    )}
                    <span className="mega-menu-sidebar-label">{item.label}</span>
                    {selectedMenu === item.id && (
                      <i className="fa-solid fa-arrow-right mega-menu-sidebar-arrow"></i>
                    )}
                    {item.hasNew && (
                      <span className="mega-menu-new-badge">NEW</span>
                    )}
                  </button>
                );
              })}
            </nav>
          )}
        </div>

        {/* Main Content Area */}
        <div className="mega-menu-content">
          {isSearchMode ? (
            <div className="mega-menu-search-results">
              {/* Pills/Category Filters */}
              {activePills.length > 0 && (
                <div className="mega-menu-pills-container">
                  {activePills.map(pill => (
                    <button
                      key={pill.id}
                      className={`mega-menu-pill ${selectedPill === pill.id ? 'mega-menu-pill-active' : ''}`}
                      onClick={() => handlePillClick(pill.id)}
                      disabled={pill.disabled}
                    >
                      {pill.label}
                    </button>
                  ))}
                </div>
              )}

              {filteredSearchResults && filteredSearchResults.length > 0 ? (
                <>
                  <div className="mega-menu-search-categories-wrapper">
                    <p className="mega-menu-search-label">Applikationer</p>
                    <div className="mega-menu-search-categories">
                      {filteredSearchResults.map(result => (
                        <div key={result.categoryId} className="mega-menu-search-category">
                          <div className="mega-menu-search-category-header">
                            {result.useSVG ? (
                              <svg className="mega-menu-search-category-icon" viewBox="0 0 30 30" fill="none">
                                <path d={svgPaths.p13b13300} fill="currentColor" />
                              </svg>
                            ) : result.categoryIcon ? (
                              <i className={`fa-solid ${result.categoryIcon} mega-menu-search-category-icon`}></i>
                            ) : null}
                            <h3 className="mega-menu-search-category-title">{result.categoryLabel}</h3>
                          </div>
                          {result.sections.map((section, sectionIdx) => (
                            <div key={sectionIdx} className="mega-menu-search-section">
                              {section.title && <h4 className="mega-menu-search-section-title">{section.title}</h4>}
                              <ul className="mega-menu-search-section-list">
                                {section.items.map((item, itemIdx) => (
                                  <li key={itemIdx} className="mega-menu-search-section-item" onClick={() => handleSearchItemClick(item.text)}>
                                    {highlightText(item.text, searchQuery)}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <p className="mega-menu-search-no-results">Inga resultat hittades för \"{searchQuery}\".</p>
              )}
            </div>
          ) : menuContent[selectedMenu as keyof typeof menuContent]?.isPortalView ? (
            <div className="mega-menu-portals-grid">
              {menuContent[selectedMenu as keyof typeof menuContent]?.portals.map((portal, idx) => (
                <div key={idx} className="mega-menu-portal-card">
                  <svg className="mega-menu-portal-icon" viewBox={portal.icon === 'user' ? '0 0 30 30' : '0 0 83 81'} fill="none">
                    <path
                      d={portal.icon === 'building-columns' ? svgPaths.p2ad19b00 : portal.icon === 'users-between-lines' ? svgPaths.p6e8f800 : svgPaths.p13b13300}
                      fill="#250250"
                    />
                  </svg>
                  <button className="mega-menu-portal-button" onClick={() => handlePortalClick(portal.id)}>{portal.title}</button>
                  <p className="mega-menu-portal-description">{portal.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mega-menu-sections">
              {menuContent[selectedMenu as keyof typeof menuContent]?.sections.map((section, idx) => (
                <div key={idx} className="mega-menu-section">
                  <h3 className="mega-menu-section-title">{section.title}</h3>
                  <ul className="mega-menu-section-list">
                    {section.items.map((item, itemIdx) => {
                      const isHighlighted = typeof item === 'object' && item.highlighted;
                      const text = typeof item === 'string' ? item : item.text;
                      return (
                        <li 
                          key={itemIdx} 
                          className={`mega-menu-section-item ${isHighlighted ? 'mega-menu-section-item-highlighted' : ''}`}
                          onClick={() => handleSearchItemClick(text)}
                        >
                          {text}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};