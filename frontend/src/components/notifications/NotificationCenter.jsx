import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IoArrowBack, IoCash, IoTime, IoCheckmarkCircle, IoWarning, IoTrophy, IoMegaphone } from 'react-icons/io5';
import { notificationsAPI } from '../../utils/api';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      const params = filter === 'unread' ? { unreadOnly: true } : {};
      const response = await notificationsAPI.getNotifications(params);
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(notifications.map(notif => 
        notif._id === id ? { ...notif, isRead: true } : notif
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationsAPI.deleteNotification(id);
      setNotifications(notifications.filter(notif => notif._id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'loan_funded':
        return <IoCash className="text-green-600" />;
      case 'repayment_due':
        return <IoTime className="text-yellow-600" />;
      case 'repayment_received':
        return <IoCheckmarkCircle className="text-green-600" />;
      case 'repayment_overdue':
        return <IoWarning className="text-red-600" />;
      case 'loan_completed':
        return <IoTrophy className="text-purple-600" />;
      default:
        return <IoMegaphone className="text-blue-600" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading notifications...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Link 
            to="/dashboard"
            className="text-gray-500 hover:text-gray-700"
          >
            <IoArrowBack size={20} className="sm:w-6 sm:h-6" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs sm:text-sm rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded px-3 py-2 text-sm sm:text-base w-full sm:w-auto"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread Only</option>
          </select>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm sm:text-base w-full sm:w-auto"
            >
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <p className="text-gray-500 text-base sm:text-lg">No notifications found</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`border-l-4 p-3 sm:p-4 rounded-lg shadow-sm ${getPriorityColor(notification.priority)} ${
                !notification.isRead ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-3 sm:space-y-0">
                <div className="flex items-start space-x-2 sm:space-x-3 flex-1">
                  <span className="text-lg sm:text-xl mt-0.5">{getNotificationIcon(notification.type)}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-sm sm:text-base ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                      {notification.title}
                    </h3>
                    <p className={`mt-1 text-sm sm:text-base ${!notification.isRead ? 'text-gray-700' : 'text-gray-500'} break-words`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-end space-x-2 sm:space-x-3 flex-shrink-0">
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm px-2 py-1 rounded hover:bg-blue-50"
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification._id)}
                    className="text-red-600 hover:text-red-800 text-xs sm:text-sm px-2 py-1 rounded hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              {notification.priority === 'urgent' && (
                <div className="mt-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded inline-block">
                  URGENT
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;