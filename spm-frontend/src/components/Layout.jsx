import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Users, 
  GraduationCap, 
  Briefcase, 
  FolderGit, 
  CheckSquare, 
  Award, 
  Menu, 
  X, 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  LogOut,
  ChevronRight,
  User
} from 'lucide-react';

const Layout = ({ children, activeTab, setActiveTab }) => {
  const { currentUser, logout, isAdmin, isFaculty, isStudent } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('SPM_Theme') === 'dark' || 
      (!localStorage.getItem('SPM_Theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('SPM_Theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('SPM_Theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Faculty', 'Student'] },
    // Admin Modules
    { id: 'roles', name: 'Manage Roles', icon: ShieldCheck, roles: ['Admin'], category: 'ADMIN MODULES' },
    { id: 'users', name: 'Manage Users', icon: Users, roles: ['Admin'], category: 'ADMIN MODULES' },
    { id: 'students', name: 'Manage Students', icon: GraduationCap, roles: ['Admin'], category: 'ADMIN MODULES' },
    { id: 'faculty', name: 'Manage Faculty', icon: Users, roles: ['Admin'], category: 'ADMIN MODULES' },
    { id: 'permissions', name: 'Role & Permissions', icon: ShieldCheck, roles: ['Admin'], category: 'ADMIN MODULES' },
    // Project Management
    { id: 'projects', name: 'Manage Projects', icon: FolderGit, roles: ['Admin', 'Faculty', 'Student'], category: 'PROJECT MANAGEMENT' },
    { id: 'tasks', name: 'Manage Tasks', icon: CheckSquare, roles: ['Admin', 'Faculty', 'Student'], category: 'PROJECT MANAGEMENT' },
    { id: 'scores', name: 'Scores & Remarks', icon: Award, roles: ['Admin', 'Faculty', 'Student'], category: 'PROJECT MANAGEMENT' }
  ];

  const visibleItems = navigationItems.filter(item => item.roles.includes(currentUser?.RoleName));

  // Group items by category for admin modules
  const categories = visibleItems.reduce((acc, item) => {
    const cat = item.category || 'GENERAL';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#07080d] dark:text-slate-100 flex smooth-transition">
      {/* Sidebar Background Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 glass-panel border-r border-slate-200/50 dark:border-white/10 flex flex-col smooth-transition transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200/50 dark:border-white/10">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-premium flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md">
              SP
            </div>
            {sidebarOpen && (
              <span className="font-heading font-bold text-lg text-slate-800 dark:text-white tracking-wide whitespace-nowrap">
                SPMS <span className="text-indigo-500 dark:text-indigo-400">Portal</span>
              </span>
            )}
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-slate-500 hover:text-slate-800 dark:hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar User Info */}
        {sidebarOpen && currentUser && (
          <div className="px-6 py-6 border-b border-slate-200/30 dark:border-white/5 flex items-center gap-4">
            <img 
              src={currentUser.ProfilePicturePath} 
              alt={currentUser.FullName}
              className="w-12 h-12 rounded-2xl border-2 border-indigo-500/50 object-cover shadow-sm bg-slate-100"
            />
            <div className="overflow-hidden">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 truncate">{currentUser.FullName}</h4>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 mt-1">
                {currentUser.RoleName}
              </span>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {Object.keys(categories).map(catName => (
            <div key={catName} className="space-y-1.5">
              {sidebarOpen && catName !== 'GENERAL' && (
                <h5 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider px-3 mb-2 uppercase">
                  {catName}
                </h5>
              )}
              {categories[catName].map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-premium text-white shadow-md shadow-indigo-500/25' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                    } ${!sidebarOpen ? 'justify-center py-4' : ''}`}
                    title={item.name}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    {sidebarOpen && <span className="truncate">{item.name}</span>}
                    {sidebarOpen && isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-slate-200/50 dark:border-white/10">
          <button
            onClick={logout}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-medium text-sm transition-all duration-200 ${
              !sidebarOpen ? 'justify-center' : ''
            }`}
            title="Log Out"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-h-screen smooth-transition ${sidebarOpen ? 'lg:pl-72' : 'lg:pl-20'}`}>
        
        {/* Top Navbar */}
        <header className="h-16 sticky top-0 z-30 bg-slate-50/80 dark:bg-[#07080d]/80 backdrop-blur-md border-b border-slate-200/50 dark:border-white/5 flex items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative hidden sm:block w-64 md:w-80">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Search resources, files, and tasks..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 dark:bg-white/5 rounded-xl border border-transparent focus:bg-white focus:border-indigo-500/50 dark:focus:bg-[#12131a] dark:focus:border-indigo-500/50 focus:outline-none focus:ring-0 placeholder-slate-400 dark:placeholder-slate-500 smooth-transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all duration-300"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400 animate-spin-slow" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white relative transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-slate-50 dark:ring-[#07080d]" />
              </button>
            </div>

            {/* Profile Dropdown */}
            <div className="relative ml-2">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all"
              >
                <img
                  src={currentUser?.ProfilePicturePath}
                  alt={currentUser?.FullName}
                  className="w-8 h-8 rounded-lg object-cover bg-slate-200"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden md:block">
                  {currentUser?.FullName}
                </span>
              </button>
              
              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)} />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel shadow-lg border border-slate-200/50 dark:border-white/10 p-2 z-20 animate-scale-in">
                    <div className="px-3 py-2 border-b border-slate-200/50 dark:border-white/5">
                      <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Logged In As</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate">{currentUser?.FullName}</p>
                      <p className="text-xs text-slate-500 truncate">{currentUser?.Email}</p>
                    </div>
                    <button
                      onClick={() => { setActiveTab('profile'); setShowProfileMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 mt-1 transition-all"
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      View Profile
                    </button>
                    <button
                      onClick={() => { logout(); setShowProfileMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 mt-1 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="py-6 border-t border-slate-200/50 dark:border-white/5 text-center text-xs text-slate-400 dark:text-slate-500">
          © 2026 SPMS Admin. All Rights Reserved. Designed with premium glassmorphic layout.
        </footer>
      </div>
    </div>
  );
};

export default Layout;
