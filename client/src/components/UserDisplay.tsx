import React from 'react';
import type { IUserProfile } from '@/interfaces/user.interface';

interface UserDisplayProps {
  user: IUserProfile;
  unitNumber?: string;
}

export const UserDisplay: React.FC<UserDisplayProps> = ({
  user,
  unitNumber,
}) => {
  if (!user || !user.user) {
    return (
      <div className="flex items-start space-x-3 w-full">
        <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-zinc-700 flex items-center justify-center">
          <span className="text-xs text-gray-500">?</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Loading user...
          </p>
        </div>
      </div>
    );
  }

  const { firstName, lastName, email, imageUrl } = user.user;

  return (
    <div className="flex items-start space-x-3 w-full">
      <div className="flex-shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${firstName} ${lastName}`}
            className="h-10 w-10 rounded-full"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-zinc-700 flex items-center justify-center">
            {firstName?.charAt(0)}{lastName?.charAt(0)}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {firstName} {lastName}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {email || 'No email provided'}
        </p>
        {unitNumber && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Unit: {unitNumber}
          </p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
          {user.role}
        </p>
      </div>
    </div>
  );
};