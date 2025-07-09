import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import CustomerList from './components/CustomerList';
import CustomerDetails from './components/CustomerDetails';

function App() {
    const [currentPage, setCurrentPage] = useState('home');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const renderContent = () => {
        switch (currentPage) {
            case 'home':
                return <Home />;
            case 'customers':
                return (
                    <CustomerList 
                        onCustomerSelect={(customer) => {
                            setSelectedCustomer(customer);
                            setCurrentPage('customer-details');
                        }}
                    />
                );
            case 'customer-details':
                return (
                    <CustomerDetails 
                        customer={selectedCustomer}
                        onBack={() => setCurrentPage('customers')}
                    />
                );
            default:
                return <Home />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar 
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                collapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
            <div className={`flex-1 flex flex-col main-content ${
                sidebarCollapsed ? 'sidebar-collapsed' : ''
            } overflow-y-auto`}>
                {/* Header */}
                <header className="bg-white border-b border-gray-200 p-4 shadow-sm">
                    <h1 className="text-xl font-bold text-gray-800">Invoice Management</h1>
                </header>
                
                {/* Main Content */}
                <main className="flex-1 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}

export default App;