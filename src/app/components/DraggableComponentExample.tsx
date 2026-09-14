import React from 'react';
import { useDrag } from 'react-dnd';

interface DraggableComponentExampleProps {
  type: string;
  name: string;
  children: React.ReactElement;
  className?: string;
  iconClass?: string;
  gridFeatures?: {
    selection?: boolean;
    columnChooser?: boolean;
    sorting?: boolean;
    searchPanel?: boolean;
    expandable?: boolean;
    actions?: boolean;
  };
  inputFieldType?: 'text' | 'date' | 'time' | 'search' | 'dropdown' | 'textarea';
  inputFieldWidth?: number;
}

export const DraggableComponentExample: React.FC<DraggableComponentExampleProps> = ({
  type,
  name,
  children,
  className = '',
  iconClass,
  gridFeatures,
  inputFieldType,
  inputFieldWidth
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'COMPONENT_EXAMPLE',
    item: {
      type,
      name,
      component: children,
      iconClass,
      gridFeatures,
      inputFieldType,
      inputFieldWidth
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [type, name, children, iconClass, gridFeatures, inputFieldType, inputFieldWidth]);

  return (
    <div
      ref={drag}
      className={`draggable-example ${className}`}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      {children}
    </div>
  );
};
