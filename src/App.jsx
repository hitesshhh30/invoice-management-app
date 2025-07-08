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
        <div className="flex h-screen bg-gray-100">
            <Sidebar 
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                collapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
            <main className={`flex-1 transition-all duration-300 ${
                sidebarCollapsed ? 'ml-16' : 'ml-64'
            }`}>
                {renderContent()}
            </main>
        </div>
    );
}

export default App;