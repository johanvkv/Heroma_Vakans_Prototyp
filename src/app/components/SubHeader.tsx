import React from 'react';
import { useNavigate } from 'react-router';
import Button from 'devextreme-react/button';
import { Breadcrumbs, BreadcrumbItem } from './Breadcrumbs';
import { Tooltip } from './Tooltip';
import { FeedbackControl } from '../feedback/FeedbackControl';

interface SubHeaderProps {
  breadcrumbItems?: BreadcrumbItem[];
  title?: string;
}

export const SubHeader: React.FC<SubHeaderProps> = ({
  breadcrumbItems,
  title = 'Översikt'
}) => {
  const navigate = useNavigate();

  const defaultBreadcrumbItems: BreadcrumbItem[] = [
    { label: 'Hem', href: '#' },
    { label: 'Lön', href: '#' },
    { label: 'Lönehantering', href: '#' },
    { label: 'Löneresultat', isActive: true }
  ];

  const handleBackClick = () => {
    navigate('/');
  };

  return (
    <div className="sub-header">
      <div className="d-flex flex-column">
        <div className="d-flex align-items-center">
          <h1 className="m-0 fw-semibold sub-header-title">{title}</h1>
          <button className="btn-icon mt-1">
            <i className="fa-solid fa-chevron-down"></i>
          </button>
        </div>
        <Breadcrumbs items={breadcrumbItems || defaultBreadcrumbItems} onBackClick={handleBackClick} />
      </div>

      <div className="d-flex align-items-center gap-2 sub-header-actions">
        <FeedbackControl />
        <div className="person-search-container">
            <button className="person-search-btn border-right-custom">
                <i className="fa-solid fa-chevron-left small"></i>
            </button>
            <div className="person-search-content w-100">
                <span className="tooltip-wrapper w-100">
                  <input 
                    type="text" 
                    className="person-search-input w-100" 
                    placeholder="Sök person"
                  />
                  <Tooltip text="Ange användarnamn eller personnummer" />
                </span>
            </div>
             <button className="person-search-btn">
                <i className="fa-solid fa-times small"></i>
            </button>
            <button className="person-search-btn border-left-custom">
                <i className="fa-solid fa-chevron-right small"></i>
            </button>
        </div>
        <Button
          icon="fa-solid fa-user-plus"
          className="dx-btn-outline add-user-btn-squared"
        />
      </div>
    </div>
  );
};
