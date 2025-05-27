import * as React from 'react';

// TabsContext to manage state across tab components
const TabsContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
}>({
  value: '',
  onValueChange: () => {},
});

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ 
  value, 
  onValueChange, 
  children, 
  className = '' 
}) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export const TabsList: React.FC<TabsListProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex space-x-4 ${className}`}>
      {children}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ 
  value, 
  children, 
  className = '' 
}) => {
  const { value: selectedValue, onValueChange } = React.useContext(TabsContext);
  const isSelected = selectedValue === value;

  return (
    <button
      className={`px-3 py-1.5 text-sm font-medium transition-all relative rounded-full
        ${isSelected
          ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md'
          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100/50 bg-white/80 backdrop-blur-sm'}
        ${className}`}
      onClick={() => onValueChange(value)}
      role="tab"
      aria-selected={isSelected}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({ 
  value, 
  children, 
  className = '' 
}) => {
  const { value: selectedValue } = React.useContext(TabsContext);
  const isSelected = selectedValue === value;

  if (!isSelected) return null;

  return (
    <div className={className} role="tabpanel">
      {children}
    </div>
  );
};