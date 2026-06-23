import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, Bell, User, LogOut, Menu, X, Check } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import NotificationContext from '../context/NotificationContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useContext(NotificationContext);
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'employer') return '/employer';
    return '/candidate';
  };

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Main Nav */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2.5 text-primary font-bold text-xl">
              <img src="/favicon.svg" className="h-8 w-8 rounded" alt="HireHub Logo" />
              <span className="tracking-tight font-extrabold text-slate-900 text-lg">HireHub</span>
            </Link>
            
            <div className="hidden md:flex ml-8 space-x-1">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'bg-primary-light text-primary font-semibold' 
                    : 'text-textMuted hover:text-textMain hover:bg-slate-50'
                }`}
              >
                Search Jobs
              </Link>

              {user && (
                <Link
                  to={getDashboardPath()}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(getDashboardPath())
                      ? 'bg-primary-light text-primary font-semibold'
                      : 'text-textMuted hover:text-textMain hover:bg-slate-50'
                  }`}
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* Right Action Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {/* Notifications Dropdown Trigger */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-textMuted hover:text-textMain rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
                    aria-label="Notifications"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xxs font-bold leading-none text-white bg-danger rounded-full transform translate-x-1 -translate-y-1 scale-75 text-[10px]">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-card rounded-md shadow-lg border border-border overflow-hidden z-50">
                      <div className="px-4 py-2 border-b border-border flex justify-between items-center bg-slate-50">
                        <span className="font-semibold text-sm text-textMain">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-accent hover:text-accent-hover font-medium transition-colors"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                      
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-textMuted text-xs">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n._id}
                              onClick={() => {
                                markAsRead(n._id);
                                setShowNotifications(false);
                              }}
                              className={`p-3 border-b border-border flex items-start space-x-2 cursor-pointer hover:bg-slate-50 transition-colors ${
                                !n.isRead ? 'bg-accent-light bg-opacity-40' : ''
                              }`}
                            >
                              <div className="flex-1">
                                <p className="text-xs text-textMain">{n.message}</p>
                                <span className="text-[10px] text-textMuted">
                                  {new Date(n.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              {!n.isRead && (
                                <div className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5"></div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Session Info */}
                <div className="flex items-center space-x-3 border-l border-border pl-4">
                  <div className="text-right">
                    <p className="text-xs font-semibold text-textMain leading-tight">{user.name}</p>
                    <span className="text-[10px] text-textMuted capitalize leading-none">{user.role}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-textMuted hover:text-danger rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
                    title="Log Out"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-textMain hover:text-primary transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded transition-colors shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger Mobile Menu */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-textMuted hover:text-textMain focus:outline-none p-2 rounded-md hover:bg-slate-100"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-card px-2 pt-2 pb-3 space-y-1">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/') ? 'bg-primary-light text-primary' : 'text-textMuted hover:bg-slate-50'
            }`}
          >
            Search Jobs
          </Link>
          {user && (
            <Link
              to={getDashboardPath()}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive(getDashboardPath()) ? 'bg-primary-light text-primary' : 'text-textMuted hover:bg-slate-50'
              }`}
            >
              Dashboard
            </Link>
          )}

          {user ? (
            <div className="border-t border-border mt-3 pt-3">
              <div className="px-3 py-2 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-textMain">{user.name}</p>
                  <p className="text-xs text-textMuted capitalize">{user.role}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="p-2 text-textMuted hover:text-textMain relative rounded-full hover:bg-slate-100"
                    >
                      <Bell size={20} />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xxs font-bold leading-none text-white bg-danger rounded-full transform translate-x-1 -translate-y-1 scale-75 text-[10px]">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-textMuted hover:text-danger rounded-full hover:bg-slate-100"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </div>
              
              {showNotifications && (
                <div className="mx-3 mt-2 bg-slate-50 border border-border rounded-md max-h-48 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-3 text-center text-textMuted text-xs">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => {
                          markAsRead(n._id);
                          setIsOpen(false);
                          setShowNotifications(false);
                        }}
                        className="p-2.5 border-b border-border text-xs text-textMain hover:bg-slate-100"
                      >
                        {n.message}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="border-t border-border mt-3 pt-3 flex flex-col space-y-2 px-3">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-2 text-sm font-medium text-textMain hover:bg-slate-50 rounded"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
