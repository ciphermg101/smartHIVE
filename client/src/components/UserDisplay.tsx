import React from 'react';
import { useUserById } from '@hooks/useUsers';

interface UserDisplayProps {
  userId: string;
  role: string;
  unitName?: string;
  showRole?: boolean;
  showEmail?: boolean;
}

export const UserDisplay: React.FC<UserDisplayProps> = ({
  userId,
  role,
  unitName,
  showRole = true,
  showEmail = true,
}) => {
  const { data: user, isLoading, error } = useUserById(userId);

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return '?';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-700 animate-pulse" />
        <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-32 animate-pulse" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500">
          !
        </div>
        <span className="text-gray-500 dark:text-gray-400">User not found</span>
      </div>
    );
  }

  const displayRole = role?.toLowerCase() === 'caretaker' ? 'Caretaker' : 'Tenant';

  return (
    <div className="flex items-start space-x-3 w-full">
      <div className="flex-shrink-0">
        {user.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={`${user.firstName} ${user.lastName}`.trim()}
            className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-zinc-800 shadow-sm"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
            {getInitials(user.firstName, user.lastName)}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {[user.firstName, user.lastName].filter(Boolean).join(' ') || 'Unknown User'}
          </p>
          {showRole && (
            <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
              role === 'owner' 
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              {displayRole}
            </span>
          )}
        </div>
        {showEmail && user.email && (
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {user.email}
          </p>
        )}
        {unitName && (
          <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
            <svg className="flex-shrink-0 mr-1.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {unitName}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDisplay;
