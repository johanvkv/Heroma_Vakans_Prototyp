import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import { DroppedComponent } from './pageBuilderTypes';
import { extractTextContent, getDefaultTextContent } from './pageBuilderHelpers';
import { NavigationSidebar } from '../app/components/NavigationSidebar';
import { Spacer } from '../app/components/Spacer';
import { Alert } from '../app/components/Alert';
import DataGrid, { Column, Paging, Scrolling, Selection, SearchPanel } from 'devextreme-react/data-grid';
import TreeList, { Column as TreeColumn, Paging as TreePaging, Scrolling as TreeScrolling } from 'devextreme-react/tree-list';
import TextBox from 'devextreme-react/text-box';
import TextArea from 'devextreme-react/text-area';
import DateBox from 'devextreme-react/date-box';
import SelectBox from 'devextreme-react/select-box';
import { pageBuilderGridData } from './PageBuilderGridComponents';

export const EditableComponent: React.FC<{
  component: DroppedComponent;
  updateComponent: (id: string, updates: Partial<DroppedComponent>) => void;
}> = ({ component, updateComponent }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const isTextComponent = component.type.startsWith('text-');

  const handleClick = () => {
    if (component.type === 'button') {
      setEditValue(component.buttonText || 'Button');
      setIsEditing(true);
    } else if (isTextComponent) {
      setEditValue(component.textContent || '');
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (component.type === 'button') {
      updateComponent(component.id, { buttonText: editValue });
    } else if (isTextComponent) {
      updateComponent(component.id, { textContent: editValue });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (component.type === 'text-list') {
      // For lists, allow Enter to add line breaks
      if (e.key === 'Escape') {
        setIsEditing(false);
      }
    } else {
      if (e.key === 'Enter') {
        handleSave();
      } else if (e.key === 'Escape') {
        setIsEditing(false);
      }
    }
  };

  // Render based on component type
  if (component.type === 'button' && isEditing) {
    return (
      <input
        type="text"
        className="editable-text-input"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        autoFocus
        onClick={(e) => e.stopPropagation()}
      />
    );
  }

  if (component.type === 'button' || component.type === 'secondary-button' || component.type === 'tertiary-button') {
    let buttonClass = 'btn-primary';
    if (component.type === 'secondary-button' || component.name === 'Secondary Button') buttonClass = 'btn-secondary';
    else if (component.type === 'tertiary-button' || component.name === 'Tertiary Button') buttonClass = 'btn-tertiary';

    const isDisabled = component.name === 'Disabled Button';

    const ButtonDropZone: React.FC = () => {
      const [{ isOver }, dropRef] = useDrop(() => ({
        accept: 'COMPONENT_EXAMPLE',
        drop: (item: { type: string; name: string; iconClass?: string }) => {
          if (item.type === 'icon' && item.iconClass) {
            updateComponent(component.id, { buttonIcon: item.iconClass, buttonIconPosition: 'left' });
          }
        },
        collect: (monitor) => ({ isOver: !!monitor.isOver() })
      }), []);

      return (
        <div ref={dropRef} style={{ display: 'inline-block', position: 'relative', backgroundColor: isOver ? '#e6e3f3' : 'transparent', borderRadius: '4px', padding: isOver ? '4px' : '0' }}>
          {isEditing ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => { if (editValue.trim()) updateComponent(component.id, { buttonText: editValue }); setIsEditing(false); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { if (editValue.trim()) updateComponent(component.id, { buttonText: editValue }); setIsEditing(false); } }}
              autoFocus
              style={{ padding: '5px 16px', fontSize: '16px', fontFamily: 'Source Sans Pro, sans-serif', fontWeight: 600, border: '2px solid var(--primary)', borderRadius: '4px' }}
            />
          ) : (
            <button className={`${buttonClass} editable-component`} onClick={handleClick} disabled={isDisabled} style={{ cursor: 'pointer', position: 'relative' }}>
              {component.buttonIcon && component.buttonIconPosition === 'left' && (
                <span style={{ marginRight: '8px', position: 'relative' }}>
                  <i className={`fa-solid fa-${component.buttonIcon}`}></i>
                  <span role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); updateComponent(component.id, { buttonIcon: undefined, buttonIconPosition: undefined }); }} style={{ position: 'absolute', top: '-8px', right: '-8px', width: '16px', height: '16px', borderRadius: '50%', background: '#e31937', color: 'white', border: 'none', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                    <i className="fa-solid fa-xmark"></i>
                  </span>
                </span>
              )}
              {component.buttonText || 'Button'}
              {component.buttonIcon && component.buttonIconPosition === 'right' && (
                <span style={{ marginLeft: '8px', position: 'relative' }}>
                  <i className={`fa-solid fa-${component.buttonIcon}`}></i>
                  <span role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); updateComponent(component.id, { buttonIcon: undefined, buttonIconPosition: undefined }); }} style={{ position: 'absolute', top: '-8px', right: '-8px', width: '16px', height: '16px', borderRadius: '50%', background: '#e31937', color: 'white', border: 'none', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                    <i className="fa-solid fa-xmark"></i>
                  </span>
                </span>
              )}
            </button>
          )}
          {isOver && <div style={{ position: 'absolute', top: '100%', left: 0, fontSize: '10px', color: '#5236ab', marginTop: '4px' }}>Drop icon here</div>}
        </div>
      );
    };

    return <ButtonDropZone />;
  }

  if (component.type === 'sidebar') {
    const sidebarAlignment = component.sidebarAlignment || 'left';
    const alignmentClass = `sidebar-container-${sidebarAlignment}`;

    return (
      <div className={alignmentClass}>
        <NavigationSidebar isPreview={false} />
      </div>
    );
  }

  if (component.type === 'divider') {
    return component.component;
  }

  if (component.type === 'spacer') {
    return <Spacer isPreview={false} />;
  }

  // Text components
  if (isTextComponent && isEditing) {
    if (component.type === 'text-list') {
      return (
        <textarea
          className="editable-text-input"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          autoFocus
          rows={3}
          onClick={(e) => e.stopPropagation()}
        />
      );
    }
    return (
      <input
        type="text"
        className="editable-text-input"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        autoFocus
        onClick={(e) => e.stopPropagation()}
      />
    );
  }

  if (isTextComponent) {
    const textContent = component.textContent || '';

    if (component.type === 'text-list') {
      const items = textContent.split('\n').filter(line => line.trim());
      return (
        <ul className="text-component text-list editable-component" onClick={handleClick} title="Click to edit">
          {items.map((item, idx) => <li key={idx}>{item}</li>)}
        </ul>
      );
    }

    if (component.type === 'text-link') {
      return (
        <a
          href="#"
          className="text-component text-link editable-component"
          onClick={(e) => { e.preventDefault(); handleClick(); }}
          title="Click to edit"
        >
          {textContent}
        </a>
      );
    }

    if (component.type === 'text-card-title') {
      return (
        <h2 className="card-title-standard editable-component" onClick={handleClick} title="Click to edit">
          {textContent || 'Card Title'}
        </h2>
      );
    }

    return (
      <p className="text-component editable-component" onClick={handleClick} title="Click to edit">
        {textContent}
      </p>
    );
  }

  // For TextSearch, ensure it's rendered with a wrapper div for visibility
  if (component.type === 'text-search') {
    return <div style={{ display: 'block', minHeight: '48px' }}>{component.component}</div>;
  }

  // For other components, render the original
  return <>{component.component}</>;
};

// Stable module-level component — prevents remount/useDrop deregistration when stepper re-renders
export const CardInStepDropZone: React.FC<{
  cardId: string;
  cardChildren: DroppedComponent[];
  addChild: (comp: DroppedComponent) => void;
  removeChild: (childId: string) => void;
  updateChild: (childId: string, updates: Partial<DroppedComponent>) => void;
}> = ({ cardId, cardChildren, addChild, removeChild, updateChild }) => {
  const addChildRef = React.useRef(addChild);
  const removeChildRef = React.useRef(removeChild);
  const updateChildRef = React.useRef(updateChild);
  React.useEffect(() => { addChildRef.current = addChild; }, [addChild]);
  React.useEffect(() => { removeChildRef.current = removeChild; }, [removeChild]);
  React.useEffect(() => { updateChildRef.current = updateChild; }, [updateChild]);

  const [{ isOver }, dropCard] = useDrop(() => ({
    accept: 'COMPONENT_EXAMPLE',
    drop: (item: { type: string; name: string; component: React.ReactElement; gridFeatures?: any; inputFieldType?: DroppedComponent['inputType']; inputFieldWidth?: number }, monitor) => {
      if (monitor.didDrop()) return;
      const textContent = item.type.startsWith('text-')
        ? (extractTextContent(item.component) || getDefaultTextContent(item.type))
        : undefined;
      const alertVariant = item.type.startsWith('alert-') ? item.type.replace('alert-', '') as 'info' | 'warning' | 'error' | 'success' : undefined;
      addChildRef.current({
        id: `${item.type}-${Date.now()}`,
        type: item.type,
        name: item.name,
        component: item.component,
        buttonText: (item.type === 'button' || item.type === 'secondary-button' || item.type === 'tertiary-button') ? 'Button' : undefined,
        textContent,
        alignment: undefined,
        gridFeatures: item.gridFeatures,
        alertVariant,
        alertMessage: alertVariant ? `This is ${item.type.replace('alert-', '')} alert` : undefined,
        showAlertLink: false,
        inputType: item.type === 'input-field' ? (item.inputFieldType || 'text') : undefined,
        inputWidth: item.type === 'input-field' ? (item.inputFieldWidth || 270) : undefined,
        treeData: item.type === 'treelist' ? [{ id: 1, parentId: null, name: 'Row 1' }, { id: 2, parentId: null, name: 'Row 2' }, { id: 3, parentId: 2, name: 'Child of Row 2' }] : undefined,
      });
    },
    collect: (monitor) => ({ isOver: !!monitor.isOver({ shallow: true }) }),
  }), [cardId]);

  return (
    <div ref={dropCard} className={`card-body-standard ${isOver ? 'card-drop-zone-over' : ''}`}>
      {cardChildren.length > 0 ? (
        cardChildren.map((cardChild) => {
          const isTextComponent = cardChild.type.startsWith('text-');
          const isBtnType = cardChild.type === 'button' || cardChild.type === 'secondary-button' ||
            cardChild.type === 'tertiary-button' || cardChild.type.startsWith('segmented-');
          const removeBtn = (
            <button className="accordion-child-remove" onClick={() => removeChildRef.current(cardChild.id)}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          );

          if (cardChild.type === 'treelist') {
            const treeRows = cardChild.treeData && cardChild.treeData.length > 0
              ? cardChild.treeData
              : [{ id: 1, parentId: null, name: 'Row 1' }, { id: 2, parentId: null, name: 'Row 2' }, { id: 3, parentId: 2, name: 'Child of Row 2' }];
            return (
              <div key={cardChild.id} style={{ position: 'relative' }}>
                {removeBtn}
                <TreeList dataSource={treeRows} keyExpr="id" parentIdExpr="parentId" rootValue={null} showBorders={false} showColumnLines={false} showRowLines={true} style={{ width: '100%' }}>
                  <TreeColumn dataField="name" caption="Name" />
                  <TreeScrolling mode="standard" />
                  <TreePaging enabled={false} />
                </TreeList>
              </div>
            );
          }
          if (cardChild.type === 'input-field') {
            const t = cardChild.inputType || 'text';
            return (
              <div key={cardChild.id} style={{ position: 'relative', marginBottom: '12px' }}>
                {removeBtn}
                <div className="pb-input-outlined">
                  {t === 'textarea' && <TextArea placeholder="Label" stylingMode="outlined" readOnly />}
                  {t === 'dropdown' && <SelectBox placeholder="Label" stylingMode="outlined" />}
                  {(t === 'date' || t === 'time') && <DateBox type={t} placeholder="Label" stylingMode="outlined" />}
                  {(t === 'text' || t === 'search') && <TextBox placeholder={t === 'search' ? 'Search...' : 'Label'} stylingMode="outlined" readOnly />}
                </div>
              </div>
            );
          }
          if (cardChild.type === 'datagrid' || cardChild.type === 'datagrid-expandable') {
            const gf = cardChild.gridFeatures || {};
            return (
              <div key={cardChild.id} style={{ position: 'relative' }}>
                {removeBtn}
                <DataGrid dataSource={pageBuilderGridData} showBorders={false} showColumnLines={false} showRowLines={true} style={{ width: '100%' }}>
                  {gf.selection && <Selection mode="multiple" showCheckBoxesMode="always" />}
                  {gf.searchPanel && <SearchPanel visible={true} />}
                  <Column dataField="name" caption="Name" /><Column dataField="idNumber" caption="ID Number" />
                  <Column dataField="amount" caption="$ Amount" alignment="right" />
                  <Paging enabled={false} /><Scrolling mode="standard" />
                </DataGrid>
              </div>
            );
          }
          if (cardChild.type.startsWith('alert-') && cardChild.alertVariant) {
            return (
              <div key={cardChild.id} style={{ position: 'relative' }}>
                {removeBtn}
                <Alert variant={cardChild.alertVariant} message={cardChild.alertMessage || `This is ${cardChild.alertVariant} alert`} showLink={cardChild.showAlertLink} isEditable={true} onMessageChange={(msg) => updateChildRef.current(cardChild.id, { alertMessage: msg })} onClose={() => removeChildRef.current(cardChild.id)} dismissible={false} />
              </div>
            );
          }

          let renderedChild: React.ReactNode = cardChild.component;
          if (isTextComponent || isBtnType) {
            renderedChild = <EditableComponent component={cardChild} updateComponent={(id, upd) => updateChildRef.current(id, upd)} />;
          }
          return (
            <div key={cardChild.id} style={{ position: 'relative', marginBottom: '12px', display: isBtnType ? 'flex' : 'block', justifyContent: isBtnType ? 'flex-end' : undefined }}>
              {removeBtn}
              {isBtnType ? renderedChild : <div className="dropped-component-preview">{renderedChild}</div>}
            </div>
          );
        })
      ) : (
        <div className="card-drop-placeholder">
          <i className="fa-solid fa-arrow-down"></i>
          <span>Drop components here</span>
        </div>
      )}
    </div>
  );
};
